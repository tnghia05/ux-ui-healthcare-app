import 'reflect-metadata';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Test} from '@nestjs/testing';
import {MongooseModule,getConnectionToken} from '@nestjs/mongoose';
import type {Connection} from 'mongoose';
import {Types} from 'mongoose';
import {AuthModule} from '../src/auth/auth.module.js';
import {hashPassword} from '../src/auth/password.js';
import {NavigationModule,RoadRoutingService} from '../src/booking/navigation.module.js';
import {configureHttp} from '../src/http.js';
test('navigation derives destination from owned booking and MongoDB, requires location consent, never persists GPS',{skip:!process.env.TEST_MONGODB_URI},async()=>{
 const uri=new URL(process.env.TEST_MONGODB_URI!);assert.equal(uri.hostname,'127.0.0.1');assert.match(uri.pathname,/^\/uxui_test_/);uri.pathname+='_navigation';let calls=0;
 const module=await Test.createTestingModule({imports:[MongooseModule.forRoot(uri.toString()),AuthModule,NavigationModule]}).overrideProvider(RoadRoutingService).useValue({route:async(o:{latitude:number;longitude:number},d:{latitude:number;longitude:number})=>{calls++;assert.equal(o.latitude,16.06);assert.equal(o.longitude,108.219);assert.deepEqual(d,{latitude:16.0387507,longitude:108.2112279});return {geometry:[[16.06,108.219],[16.0387507,108.2112279]],distanceMeters:3000,durationSeconds:250,steps:[]};}}).compile();
 const app=module.createNestApplication();configureHttp(app,[]);await app.listen(0,'127.0.0.1');const db=module.get<Connection>(getConnectionToken()).db!,users:Types.ObjectId[]=[],tokens:string[]=[],id=new Types.ObjectId().toHexString(),hospital='nav-'+id,base=(await app.getUrl())+'/api/v1';
 try{for(let i=0;i<2;i++){const email='nav-'+id+i+'@example.com',password='private-nav-test';const u=await db.collection('users').insertOne({email,name:'Navigation test',passwordHash:await hashPassword(password),emailVerifiedAt:new Date()});users.push(u.insertedId);tokens.push((await(await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})).json()).accessToken);}
 await db.collection('hospitals').insertOne({id:hospital,coordinates:{latitude:16.0387507,longitude:108.2112279}});await db.collection('appointments').insertOne({id,userId:String(users[0]),hospitalId:hospital,hospitalName:'Vinmec fixture',hospitalAddress:'Đường 30 Tháng 4'});
 const send=(method:string,path:string,body?:unknown,a=0)=>fetch(base+path,{method,headers:{Authorization:'Bearer '+tokens[a],'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const b={latitude:16.06,longitude:108.219,consent:true};
 assert.equal((await fetch(base+'/navigation/'+id)).status,401);assert.equal((await send('GET','/navigation/'+id,undefined,1)).status,404);assert.equal((await send('POST','/navigation/'+id+'/route',b,1)).status,404);
 assert.equal((await send('POST','/navigation/'+id+'/route',{...b,consent:false})).status,400);assert.equal((await send('POST','/navigation/'+id+'/route',{...b,latitude:999})).status,400);assert.equal((await send('POST','/navigation/'+id+'/route',{...b,destination:{latitude:0,longitude:0}})).status,400);
 const routed=await send('POST','/navigation/'+id+'/route',b);assert.equal(routed.status,201);const result=await routed.json();assert.equal(result.distanceMeters,3000);assert.equal(calls,1);assert.equal((await db.collection('appointments').findOne({id}))?.latitude,undefined);
 await db.collection('hospitals').updateOne({id:hospital},{$unset:{coordinates:''}});assert.equal((await send('POST','/navigation/'+id+'/route',b)).status,400);
 }finally{await db.collection('appointments').deleteOne({id});await db.collection('hospitals').deleteOne({id:hospital});await db.collection('sessions').deleteMany({userId:{$in:users}});await db.collection('users').deleteMany({_id:{$in:users}});await app.close();}
});
test('road adapter uses longitude first, validates geometry and throttles provider requests',async()=>{
 const original=globalThis.fetch;try{globalThis.fetch=async(input)=>{assert.ok(String(input).includes('/108.219,16.06;108.2112279,16.0387507?'));return new Response(JSON.stringify({code:'Ok',routes:[{distance:3000,duration:250,geometry:{coordinates:[[108.219,16.06],[108.2112279,16.0387507]]},legs:[{steps:[{distance:30,name:'Đường',maneuver:{type:'turn',modifier:'right'}}]}]}]}));};const s=new RoadRoutingService(),o={latitude:16.06,longitude:108.219},d={latitude:16.0387507,longitude:108.2112279},route=await s.route(o,d);assert.deepEqual(route.geometry,[[16.06,108.219],[16.0387507,108.2112279]]);assert.equal(route.steps[0]?.modifier,'right');await assert.rejects(()=>s.route(o,d));globalThis.fetch=async()=>new Response(JSON.stringify({code:'NoRoute'}));await assert.rejects(()=>new RoadRoutingService().route(o,d));}finally{globalThis.fetch=original;}
});
