import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../src/auth/password.js';
test('password hash is salted and rejects incorrect or malformed credentials',async()=>{
 const first=await hashPassword('a-long-test-password');
 const second=await hashPassword('a-long-test-password');
 assert.notEqual(first,second);
 assert.equal(await verifyPassword('a-long-test-password',first),true);
 assert.equal(await verifyPassword('wrong',first),false);
 assert.equal(await verifyPassword('wrong','bad:hash'),false);
});
