import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createConnection, Types } from 'mongoose';
import { AuthService } from '../src/auth/auth.module.js';
import { hashPassword } from '../src/auth/password.js';
test('MongoDB sessions persist across services; expiry, revocation and limits work',{skip:!process.env.TEST_MONGODB_URI},async()=>{
 const connection=await createConnection(process.env.TEST_MONGODB_URI!).asPromise();
 const service=new AuthService(connection);
 const email=`auth-${new Types.ObjectId()}@example.com`;
 const db=connection.db!;
 let userId: Types.ObjectId | undefined;
 try {
  await service.onModuleInit();
  const result=await db.collection('users').insertOne({email,name:'Auth integration',passwordHash:await hashPassword('integration-password'),emailVerifiedAt:new Date()});userId=result.insertedId;
  await assert.rejects(service.login({email,password:'wrong'},email));
  const login=await service.login({email,password:'integration-password'},email);
  const stored=await db.collection('sessions').findOne({userId});
  assert.ok(stored);assert.notEqual(stored.tokenHash,login.accessToken);
  const restarted=new AuthService(connection);
  assert.equal((await restarted.authenticate(login.accessToken)).userId,userId.toHexString());
  assert.equal((await restarted.profile(userId.toHexString())).email,email);
  await restarted.logout(login.sessionId);
  await assert.rejects(restarted.authenticate(login.accessToken));
  const next=await service.login({email,password:'integration-password'},email);
  await db.collection('sessions').updateOne({_id:new Types.ObjectId(next.sessionId)},{$set:{expiresAt:new Date(0)}});
  await assert.rejects(service.authenticate(next.accessToken));
  for(let i=0;i<10;i++) {try {await service.login({email,password:'wrong'},email);} catch { /* expected */ }}
  await assert.rejects(service.login({email,password:'integration-password'},email),{status:429});
 } finally {
  if(userId) {await db.collection('sessions').deleteMany({userId});await db.collection('users').deleteOne({_id:userId});}
  await connection.close();
 }
});
