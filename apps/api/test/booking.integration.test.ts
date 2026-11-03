import 'reflect-metadata';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Test} from '@nestjs/testing';
import {MongooseModule,getConnectionToken} from '@nestjs/mongoose';
import type {Connection} from 'mongoose';
import {Types} from 'mongoose';
import {AuthModule} from '../src/auth/auth.module.js';
import {DiscoveryModule} from '../src/discovery/discovery.module.js';
import {BookingModule,addDays,vnDate} from '../src/booking/booking.module.js';
import {hashPassword} from '../src/auth/password.js';
import {configureHttp} from '../src/http.js';
test('booking: actor privacy, slot races, authoritative pricing, wallet atomicity and idempotency',{skip:!process.env.TEST_MONGODB_URI},async()=>{
 const testUri=new URL(process.env.TEST_MONGODB_URI!);testUri.pathname=testUri.pathname+'_booking';
 const module=await Test.createTestingModule({imports:[MongooseModule.forRoot(testUri.toString()),AuthModule,DiscoveryModule,BookingModule]}).compile();const app=module.createNestApplication();configureHttp(app,[]);await app.listen(0,'127.0.0.1');const db=module.get<Connection>(getConnectionToken()).db!;
 const suffix=new Types.ObjectId().toHexString();const ids:Types.ObjectId[]=[];const auth:Record<string,string>[]=[];const date=addDays(vnDate(),2);const doctorId='nguyen-quoc-viet';
 // Isolated date/doctor reservations for this integration run; no production database is used.
 const fixtureDoctor='booking-'+suffix;
 try{
  const base=(await app.getUrl())+'/api/v1';
  await db.collection('doctors').insertOne({id:fixtureDoctor,name:'Booking test doctor',specialty:'Tim mạch',hospitalId:'vinmec-da-nang',imageKey:'f0_imgNhBacSi',rating:4.9,active:true});
  for(const prefix of ['a','b']){const email=`book-${prefix}-${suffix}@example.com`,password='private-booking-password';const user=await db.collection('users').insertOne({email,name:prefix,passwordHash:await hashPassword(password),emailVerifiedAt:new Date()});ids.push(user.insertedId);const login=await(await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})).json();auth.push({'Content-Type':'application/json',Authorization:`Bearer ${login.accessToken}`});}
  const post=(body:unknown,actor=0)=>fetch(base+'/booking',{method:'POST',headers:auth[actor],body:JSON.stringify(body)});
  const payload={doctorId:fixtureDoctor,date,time:'08:00',packageId:'standard',paymentMethod:'cash',expectedAmountVnd:200000,patient:{name:'Người khám kiểm thử',phone:'0901234567',gender:'female',age:26,reason:'Khám định kỳ'},idempotencyKey:randomUUID()};
  assert.equal((await fetch(base+'/booking')).status,401);
  assert.equal((await fetch(base+'/booking/options?doctorId='+doctorId+'&date=2000-01-01',{headers:auth[0]})).status,400);
  assert.equal((await post({...payload,amountVnd:1})).status,400);
  assert.equal((await post({...payload,expectedAmountVnd:1})).status,409);
  assert.equal((await post({...payload,userId:ids[1]!.toHexString()})).status,400);
  assert.equal((await post({...payload,patient:undefined})).status,400);
  assert.equal((await post({...payload,date:undefined})).status,400);
  assert.equal((await post({...payload,patient:{...payload.patient,age:121}})).status,400);
  assert.equal((await post({...payload,packageId:'video'})).status,409);
  assert.equal((await post({...payload,packageId:'unknown'})).status,400);
  const cashResponse=await post(payload);assert.equal(cashResponse.status,201);const cash=await cashResponse.json();assert.equal(cash.amountVnd,200000);assert.equal(cash.paymentStatus,'unpaid');assert.equal(cash.status,'confirmed');assert.equal(cash.startsAt,date+'T01:00:00.000Z');assert.equal('userId' in cash,false);assert.equal('payloadHash' in cash,false);
  const repeated=await post(payload);assert.equal(repeated.status,201);assert.equal((await repeated.json()).id,cash.id);assert.equal(await db.collection('appointments').countDocuments({userId:ids[0]!.toHexString(),startsAt:new Date(cash.startsAt)}),1);
  assert.equal((await post({...payload,time:'09:00'})).status,409);
  assert.equal((await fetch(base+'/booking/'+cash.id,{headers:auth[1]})).status,404);assert.equal((await fetch(base+'/booking/'+cash.id+'/receipt',{headers:auth[1]})).status,404);
  const poor={...payload,time:'09:00',paymentMethod:'wallet',idempotencyKey:randomUUID()};assert.equal((await post(poor)).status,402);assert.equal(await db.collection('wallet_ledger').countDocuments({userId:ids[0]!.toHexString()}),0);assert.equal(await db.collection('appointments').countDocuments({userId:ids[0]!.toHexString(),idempotencyKey:poor.idempotencyKey}),0);
  await db.collection('wallets').insertOne({userId:ids[0]!.toHexString(),balanceVnd:200000});
  const paidPayload={...poor,idempotencyKey:randomUUID()};const paidResponses=await Promise.all([post(paidPayload),post(paidPayload)]);assert.deepEqual(paidResponses.map(r=>r.status),[201,201]);const paid=await paidResponses[0]!.json();assert.equal(paid.paymentStatus,'paid');assert.equal((await paidResponses[1]!.json()).id,paid.id);assert.equal((await db.collection('wallets').findOne({userId:ids[0]!.toHexString()}))!.balanceVnd,0);assert.equal(await db.collection('wallet_ledger').countDocuments({bookingId:paid.id}),1);
  const racers=await Promise.all([post({...payload,time:'11:00',idempotencyKey:randomUUID()}),post({...payload,time:'11:00',idempotencyKey:randomUUID()},1)]);assert.deepEqual(racers.map(r=>r.status).sort(),[201,409]);assert.equal(await db.collection('appointments').countDocuments({doctorId:fixtureDoctor,startsAt:new Date(date+'T11:00:00+07:00'),occupiesSlot:true}),1);
  const options=await(await fetch(base+'/booking/options?doctorId='+fixtureDoctor+'&date='+date,{headers:auth[0]})).json();assert.equal(options.slots.find((s:{time:string})=>s.time==='08:00').available,false);assert.equal(options.slots.at(-1).time,'23:00');assert.equal(options.slots.at(-1).available,true);
  const late=await post({...payload,time:'23:00',packageId:'extended',expectedAmountVnd:350000,idempotencyKey:randomUUID()});assert.equal(late.status,201);const lateBooking=await late.json();assert.equal(lateBooking.startsAt,date+'T16:00:00.000Z');assert.equal(vnDate(new Date(lateBooking.endsAt)),addDays(date,1));
  for(const [packageId,amountVnd,time] of [['phone',150000,'13:00'],['video',250000,'14:00']] as const){const response=await post({...payload,time,packageId,expectedAmountVnd:amountVnd,idempotencyKey:randomUUID()});assert.equal(response.status,201,await response.clone().text());const booking=await response.json();assert.equal(booking.packageId,packageId);assert.equal(booking.amountVnd,amountVnd);if(packageId==='video'){const complete=(mode:string,actor=0)=>fetch(base+'/booking/'+booking.id+'/demo-complete',{method:'POST',headers:auth[actor],body:JSON.stringify({mode})});assert.equal((await complete('phone')).status,409);assert.equal((await complete('video',1)).status,404);const ended=await complete('video');assert.equal(ended.status,201);assert.equal((await ended.json()).status,'completed');assert.equal((await complete('video')).status,201);assert.equal((await db.collection('appointments').findOne({id:booking.id}))?.completionSource,'demo_simulation');}}
  const list=await(await fetch(base+'/booking?scope=upcoming',{headers:auth[0]})).json();assert.ok(list.items.some((item:{id:string})=>item.id===cash.id));assert.ok(list.items.every((item:Record<string,unknown>)=>!('userId' in item)&&!('payloadHash' in item)));
  const home=await(await fetch(base+'/discovery/home',{headers:auth[0]})).json();assert.ok(home.appointments.some((item:{id:string})=>item.id===cash.id));
 }finally{await db.collection('appointments').deleteMany({doctorId:fixtureDoctor});await db.collection('doctors').deleteOne({id:fixtureDoctor});await db.collection('wallets').deleteMany({userId:{$in:ids.map(String)}});await db.collection('wallet_ledger').deleteMany({userId:{$in:ids.map(String)}});await db.collection('sessions').deleteMany({userId:{$in:ids}});await db.collection('users').deleteMany({_id:{$in:ids}});await app.close();}
});

