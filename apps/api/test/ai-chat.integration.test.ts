import 'reflect-metadata';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Test} from '@nestjs/testing';
import {MongooseModule,getConnectionToken} from '@nestjs/mongoose';
import type {Connection} from 'mongoose';
import {Types} from 'mongoose';
import {AuthModule} from '../src/auth/auth.module.js';
import {hashPassword} from '../src/auth/password.js';
import {AiChatModule} from '../src/chat/ai-chat.module.js';
import {AiProviderError,GeminiService} from '../src/chat/gemini.service.js';
import type {AiGrounding} from '../src/chat/ai-grounding.service.js';
import type {AiHistory} from '../src/chat/gemini.service.js';
import {configureHttp} from '../src/http.js';

test('AI chat: private histories, consent, async states, idempotency, retries, stale jobs and rate limit',{skip:!process.env.TEST_MONGODB_URI},async()=>{
 const uri=new URL(process.env.TEST_MONGODB_URI!);assert.equal(uri.hostname,'127.0.0.1');assert.match(uri.pathname,/^\/uxui_test_[a-z0-9_]+$/i);uri.pathname+='_ai_chat';
 let configured=true,mode='success',calls=0;const histories:AiHistory[]=[];
 const fake={configured:()=>configured,reply:async(_specialty:string,h:AiHistory,context:AiGrounding)=>{assert.equal(context.source,'mongodb');assert.ok(context.doctors.some(d=>d.id===doctor));assert.ok(!JSON.stringify(context).includes('PRIVATE-SECRET'));assert.ok(context.hospitals.some(h=>h.id===doctor));if(calls>=1)assert.equal(context.hospitals.find(h=>h.id===doctor)?.address,'Địa chỉ mới từ MongoDB');const saved=await db.collection('ai_chat_turns').findOne({userId:String(users[0]),doctorId:doctor,status:'pending'});assert.ok(saved?.grounding);calls++;histories.push(h);await new Promise(r=>setTimeout(r,100));if(mode==='fail')throw new AiProviderError('quota');return 'Phản hồi AI kiểm thử cho nội dung: '+h.at(-1)!.parts[0]!.text;}};
 const m=await Test.createTestingModule({imports:[MongooseModule.forRoot(uri.toString()),AuthModule,AiChatModule]}).overrideProvider(GeminiService).useValue(fake).compile();const app=m.createNestApplication();configureHttp(app,[]);await app.listen(0,'127.0.0.1');const db=m.get<Connection>(getConnectionToken()).db!,base=(await app.getUrl())+'/api/v1';const users:Types.ObjectId[]=[],tokens:string[]=[];const doctor='ai-'+new Types.ObjectId().toHexString();
 try{
  await db.collection('doctors').insertOne({id:doctor,name:'BS. Kiểm thử',specialty:'Nội khoa',privateNote:'PRIVATE-SECRET',active:true,imageKey:'f0_imgNhBacSi'});
  await db.collection('hospitals').insertOne({id:doctor,name:'Bệnh viện fixture',address:'Địa chỉ MongoDB',active:true,privateNote:'PRIVATE-SECRET'});
  for(let i=0;i<2;i++){const email='ai-'+randomUUID()+'@example.com',password='private-test-password';const row=await db.collection('users').insertOne({email,name:'AI test',passwordHash:await hashPassword(password),emailVerifiedAt:new Date()});users.push(row.insertedId);const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});tokens.push((await r.json()).accessToken);}
  const send=(method:string,path:string,body?:unknown,actor=0)=>fetch(base+path,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+tokens[actor]},...(body?{body:JSON.stringify(body)}:{})});
  const thread=async(actor=0)=>{const r=await send('GET','/ai-chat/'+doctor,undefined,actor);assert.equal(r.status,200);return r.json();};
  const finish=async()=>{for(let n=0;n<100;n++){const t=await thread();if(!t.turns.some((x:{status:string})=>x.status==='pending'))return t;await new Promise(r=>setTimeout(r,20));}throw new Error('AI fixture did not settle');};
  const payload={text:'Cần chuẩn bị gì khi đi khám?',idempotencyKey:randomUUID(),consent:true};
  assert.equal((await fetch(base+'/ai-chat/'+doctor)).status,401);
  assert.equal((await send('POST','/ai-chat/'+doctor+'/messages',{...payload,consent:false})).status,400);
  configured=false;assert.equal((await send('POST','/ai-chat/'+doctor+'/messages',payload)).status,409);assert.equal((await thread()).turns.length,0);configured=true;
  const dup=await Promise.all([send('POST','/ai-chat/'+doctor+'/messages',payload),send('POST','/ai-chat/'+doctor+'/messages',payload)]);assert.deepEqual(dup.map(r=>r.status),[202,202]);
  assert.equal((await send('POST','/ai-chat/'+doctor+'/messages',{...payload,text:'Nội dung khác'})).status,409);
  const result=await finish();assert.equal(result.turns.length,1);assert.equal(result.turns[0].status,'completed');assert.match(result.turns[0].reply,/kiểm thử/);assert.equal(calls,1);
  assert.equal((await thread(1)).turns.length,0);assert.ok(!JSON.stringify(result).includes(String(users[0])));assert.equal(histories[0]!.length,1);
  await db.collection('hospitals').updateOne({id:doctor},{$set:{address:'Địa chỉ mới từ MongoDB'}});mode='fail';const failPayload={text:'Câu tiếp theo',idempotencyKey:randomUUID(),consent:true};await send('POST','/ai-chat/'+doctor+'/messages',failPayload);const failed=await finish();assert.equal(failed.turns[1].error,'quota');assert.equal(histories[1]!.length,3);assert.equal(histories[1]![0]!.role,'user');
  mode='success';await send('POST','/ai-chat/'+doctor+'/messages',failPayload);const retry=await finish();assert.equal(retry.turns.length,2);assert.equal(retry.turns[1].status,'completed');assert.equal(retry.turns[1].attempts,2);
  await db.collection('ai_chat_turns').insertOne({userId:String(users[0]),doctorId:doctor,seq:3,idempotencyKey:randomUUID(),text:'expired',status:'pending',expiresAt:new Date(Date.now()-1),createdAt:new Date()});assert.equal((await thread()).turns[2].status,'failed');
  await db.collection('ai_chat_turns').insertMany(Array.from({length:10},(_,i)=>({userId:String(users[0]),doctorId:doctor,seq:10+i,idempotencyKey:randomUUID(),text:'limit',status:'completed',createdAt:new Date()})));
  assert.equal((await send('POST','/ai-chat/'+doctor+'/messages',{...payload,idempotencyKey:randomUUID()})).status,429);
 }finally{await db.collection('ai_chat_rooms').deleteMany({userId:{$in:users.map(String)}});await db.collection('ai_chat_turns').deleteMany({userId:{$in:users.map(String)}});await db.collection('doctors').deleteOne({id:doctor});await db.collection('hospitals').deleteOne({id:doctor});await db.collection('sessions').deleteMany({userId:{$in:users}});await db.collection('users').deleteMany({_id:{$in:users}});await app.close();}
});
