import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import { MongooseModule,getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { Types } from 'mongoose';
import { AuthModule } from '../src/auth/auth.module.js';
import { DiscoveryModule } from '../src/discovery/discovery.module.js';
import { hashPassword } from '../src/auth/password.js';
import { configureHttp } from '../src/http.js';
test('discovery HTTP searches Vietnamese, isolates favorites and upcoming appointments',{skip:!process.env.TEST_MONGODB_URI},async()=>{
 const module=await Test.createTestingModule({imports:[MongooseModule.forRoot(process.env.TEST_MONGODB_URI!),AuthModule,DiscoveryModule]}).compile();
 const app=module.createNestApplication();configureHttp(app,[]);await app.listen(0,'127.0.0.1');const db=module.get<Connection>(getConnectionToken()).db!;
 const suffix=new Types.ObjectId().toHexString();const password='private-discovery-password';const ids:Types.ObjectId[]=[];
 try{
  const url=(await app.getUrl())+'/api/v1';const headers:Record<string,string>[]=[];
  for(const prefix of ['first','second']){const email=`${prefix}-${suffix}@example.com`;const inserted=await db.collection('users').insertOne({email,name:prefix,passwordHash:await hashPassword(password),emailVerifiedAt:new Date()});ids.push(inserted.insertedId);const login=await(await fetch(url+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})).json();headers.push({Authorization:`Bearer ${login.accessToken}`});}
  const get=async(path:string,actor=0)=>{const res=await fetch(url+'/discovery/'+path,{headers:headers[actor]});assert.equal(res.status,200);return res.json();};
  assert.equal((await fetch(url+'/discovery/home')).status,401);
  const home=await get('home');assert.equal(home.hospitals.length,8);assert.equal(home.doctors.length,4);assert.deepEqual(home.appointments,[]);
  const found=await get('search?q=hoan%20my&type=hospital');assert.equal(found.hospitals[0].id,'hoan-my-da-nang');assert.equal(found.doctors.length,0);
  assert.equal((await get('search?q=Nguy%E1%BB%85n%20Qu%E1%BB%91c')).doctors[0].id,'nguyen-quoc-viet');
  assert.equal((await get('search?q=zznotfound')).hospitals.length,0);
  const filtered=await get('search?type=doctor&specialty=Tim%20m%E1%BA%A1ch&ratingBand=high');assert.equal(filtered.doctors.length,1);assert.equal(filtered.doctors[0].id,'nguyen-quoc-viet');
  assert.equal((await get('search?ratingBand=4')).doctors.length,0);
  assert.equal((await fetch(url+'/discovery/search?ratingBand=5',{headers:headers[0]})).status,400);
  assert.equal((await fetch(url+'/discovery/search?favoritesOnly=another-user',{headers:headers[0]})).status,400);
  await db.collection('doctors').insertMany([{id:suffix+'-boundary-high',name:suffix,specialty:'Test',active:true,rating:4.5},{id:suffix+'-boundary-low',name:suffix,specialty:'Test',active:true,rating:4}]);
  assert.equal((await get('search?type=doctor&q='+suffix+'&ratingBand=4')).doctors[0].rating,4);
  assert.equal((await get('search?type=doctor&q='+suffix+'&ratingBand=high')).doctors.length,1);
  assert.equal((await fetch(url+'/discovery/search?type=invalid',{headers:headers[0]})).status,400);
  assert.equal((await fetch(url+'/discovery/search?userId=another',{headers:headers[0]})).status,400);
  assert.equal((await fetch(url+'/discovery/doctor/missing',{headers:headers[0]})).status,404);
  const favorite=url+'/discovery/hospital/vinmec-da-nang/favorite';
  for(let i=0;i<2;i++)assert.equal((await fetch(favorite,{method:'PUT',headers:headers[0]})).status,200);
  assert.equal((await get('hospital/vinmec-da-nang')).favorite,true);assert.equal((await get('hospital/vinmec-da-nang',1)).favorite,false);
  assert.equal((await get('search?favoritesOnly=true')).hospitals.length,1);assert.equal((await get('search?favoritesOnly=true',1)).hospitals.length,0);
  assert.equal(await db.collection('favorites').countDocuments({userId:ids[0]!.toHexString()}),1);
  assert.equal((await fetch(favorite,{method:'DELETE',headers:headers[0]})).status,200);assert.equal((await get('hospital/vinmec-da-nang')).favorite,false);
  await db.collection('appointments').insertMany([{id:suffix+'future',userId:ids[0]!.toHexString(),status:'confirmed',startsAt:new Date(Date.now()+86400000),doctorName:'A'},{id:suffix+'past',userId:ids[0]!.toHexString(),status:'confirmed',startsAt:new Date(0)},{id:suffix+'cancelled',userId:ids[0]!.toHexString(),status:'cancelled',startsAt:new Date(Date.now()+86400000)},{id:suffix+'other',userId:ids[1]!.toHexString(),status:'paid',startsAt:new Date(Date.now()+86400000)}]);
  const appointments=(await get('home')).appointments;assert.equal(appointments.length,1);assert.equal(appointments[0].id,suffix+'future');assert.equal('userId' in appointments[0],false);
 }finally{await db.collection('doctors').deleteMany({id:{$in:[suffix+'-boundary-high',suffix+'-boundary-low']}});await db.collection('sessions').deleteMany({userId:{$in:ids}});await db.collection('favorites').deleteMany({userId:{$in:ids.map(String)}});await db.collection('appointments').deleteMany({userId:{$in:ids.map(String)}});await db.collection('users').deleteMany({_id:{$in:ids}});await app.close();}
});
