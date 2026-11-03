import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createConnection,Types } from 'mongoose';
import { PasswordResetService } from '../src/auth/password-reset.js';
import { AuthService } from '../src/auth/auth.module.js';
import { hashPassword } from '../src/auth/password.js';
test('SMTP password reset is single-use, revokes sessions and rejects stale credentials',{skip:!process.env.TEST_MONGODB_URI||!process.env.TEST_MAILPIT_URL},async()=>{
 process.env.OTP_SECRET=randomBytes(32).toString('hex');process.env.SMTP_HOST='127.0.0.1';process.env.SMTP_PORT='1025';process.env.MAIL_FROM='noreply@uxui.local';
 const connection=await createConnection(process.env.TEST_MONGODB_URI!).asPromise();const reset=new PasswordResetService(connection),auth=new AuthService(connection);const db=connection.db!;
 const email=`reset-${new Types.ObjectId()}@example.com`,oldPassword='original-test-password',newPassword='new-private-test-password';let userId:Types.ObjectId|undefined;
 async function codeForEmail(){const mailbox=await (await fetch(process.env.TEST_MAILPIT_URL+'/api/v1/messages')).json();const message=mailbox.messages.find((m:{To:{Address:string}[];Subject:string})=>m.To.some(to=>to.Address===email)&&m.Subject==='Khôi phục mật khẩu UX_UI');assert.ok(message);const content=await (await fetch(process.env.TEST_MAILPIT_URL+'/api/v1/message/'+message.ID)).json();return content.Text.match(/\b\d{6}\b/)[0] as string;}
 try{
  await auth.onModuleInit();await reset.onModuleInit();userId=(await db.collection('users').insertOne({email,name:'Reset test',passwordHash:await hashPassword(oldPassword),emailVerifiedAt:new Date()})).insertedId;
  const login=await auth.login({email,password:oldPassword},email);const oldSession=await db.collection('sessions').findOne({userId});assert.ok(oldSession);
  const absent=await reset.request({email:'absent-'+email},'absent-'+email);assert.equal('code' in absent,false);assert.ok(absent.challengeId);
  const challenge=await reset.request({email},email);const code=await codeForEmail();
  await assert.rejects(reset.verify({challengeId:challenge.challengeId,code:code==='000000'?'111111':'000000'}));
  const grant=await reset.verify({challengeId:challenge.challengeId,code});
  await assert.rejects(reset.verify({challengeId:challenge.challengeId,code}));
  await assert.rejects(reset.complete({resetToken:grant.resetToken,newPassword:oldPassword}),{status:400});
  assert.deepEqual(await reset.complete({resetToken:grant.resetToken,newPassword}),{changed:true});
  await assert.rejects(auth.authenticate(login.accessToken));await assert.rejects(auth.login({email,password:oldPassword},email));
  assert.ok((await auth.login({email,password:newPassword},email)).accessToken);
  await assert.rejects(reset.complete({resetToken:grant.resetToken,newPassword:'another-private-password'}));
  await db.collection('sessions').insertOne({...oldSession,_id:new Types.ObjectId()});
  await assert.rejects(auth.authenticate(login.accessToken));
  const expired=await reset.request({email},email);await db.collection('password_reset_challenges').updateOne({_id:new Types.ObjectId(expired.challengeId)},{$set:{expiresAt:new Date(0)}});await assert.rejects(reset.verify({challengeId:expired.challengeId,code:'123456'}));
  const locked=await reset.request({email},email);const valid=await codeForEmail();for(let i=0;i<5;i++)await assert.rejects(reset.verify({challengeId:locked.challengeId,code:valid==='000000'?'111111':'000000'}));await assert.rejects(reset.verify({challengeId:locked.challengeId,code:valid}));
  await assert.rejects(reset.request({email},email),{status:429});
 }finally{if(userId){await db.collection('sessions').deleteMany({userId});await db.collection('password_reset_challenges').deleteMany({userId});await db.collection('users').deleteOne({_id:userId});}await connection.close();}
});
