import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createConnection, Types } from 'mongoose';
import { RegistrationService } from '../src/auth/registration.js';
import { AuthService } from '../src/auth/auth.module.js';
test('real SMTP OTP: registration, invalid code, verification, reuse and login',{skip:!process.env.TEST_MONGODB_URI || !process.env.TEST_MAILPIT_URL},async()=>{
 process.env.OTP_SECRET=randomBytes(32).toString('hex');
 process.env.SMTP_HOST='127.0.0.1';process.env.SMTP_PORT='1025';process.env.MAIL_FROM='noreply@uxui.local';
 const connection=await createConnection(process.env.TEST_MONGODB_URI!).asPromise();
 const registration=new RegistrationService(connection); const auth=new AuthService(connection);
 const email=`registration-${new Types.ObjectId()}@example.com`;
 try {
  await registration.onModuleInit();await auth.onModuleInit();
  const input={email,name:'Người dùng kiểm thử',password:'a-private-test-password'};
  const challenge=await registration.register(input,email);
  assert.equal('code' in challenge,false);
  await assert.rejects(auth.login({email,password:input.password},email));
  const messages=await (await fetch(process.env.TEST_MAILPIT_URL+'/api/v1/messages')).json();
  const message=messages.messages.find((m:{To:{Address:string}[]})=>m.To.some(to=>to.Address===email));
  assert.ok(message);
  const content=await (await fetch(process.env.TEST_MAILPIT_URL+'/api/v1/message/'+message.ID)).json();
  const code=content.Text.match(/\b\d{6}\b/)?.[0];assert.ok(code);
  await assert.rejects(registration.verify({challengeId:challenge.challengeId,code:code==='000000'?'111111':'000000'}));
  const stored=await connection.db!.collection('registration_challenges').findOne({_id:new Types.ObjectId(challenge.challengeId)});
  assert.notEqual(stored!.codeHash,code);
  assert.deepEqual(await registration.verify({challengeId:challenge.challengeId,code}),{verified:true});
  await assert.rejects(registration.verify({challengeId:challenge.challengeId,code}));
  const login=await auth.login({email,password:input.password},email);
  assert.equal((await auth.authenticate(login.accessToken)).userId,login.user.id);
  await auth.logout(login.sessionId);
  await assert.rejects(registration.register(input,email));
  const expiring=await registration.register({...input,email:'expiry-'+email},'expiry-'+email);
  await connection.db!.collection('registration_challenges').updateOne({_id:new Types.ObjectId(expiring.challengeId)},{$set:{expiresAt:new Date(0)}});
  await assert.rejects(registration.verify({challengeId:expiring.challengeId,code:'123456'}));
 } finally {
  await connection.db!.collection('users').deleteMany({email});
  await connection.db!.collection('registration_challenges').deleteMany({email:{$in:[email,'expiry-'+email]}});
  await connection.close();
 }
});
