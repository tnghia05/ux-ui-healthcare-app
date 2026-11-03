import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { Controller, Post, Body } from '@nestjs/common';
import { IsEmail } from 'class-validator';
import { HealthController } from '../src/health.controller.js';
import { configureHttp } from '../src/http.js';
import { readConfig } from '../src/config.js';
class EmailDto { @IsEmail() email!: string; }
@Controller('validation-test')
class ValidationController { @Post() create(@Body() body: EmailDto) { return body; } }
test('configuration rejects absent database URI and unsafe CORS', () => {
  assert.throws(()=>readConfig({}),/MONGODB_URI/);
  assert.throws(()=>readConfig({MONGODB_URI:'mongodb://127.0.0.1/test',PORT:'bad'}),/PORT/);
  assert.throws(()=>readConfig({MONGODB_URI:'mongodb://127.0.0.1/test',CORS_ORIGINS:'*'}),/CORS/);
});
test('HTTP liveness, database failure, validation and sanitized errors', async () => {
  const connection = {readyState:0};
  const module = await Test.createTestingModule({controllers:[HealthController,ValidationController],providers:[{provide:getConnectionToken(),useValue:connection}]}).compile();
  const app = module.createNestApplication();
  configureHttp(app,[]);
  await app.listen(0,'127.0.0.1');
  try {
    const url = await app.getUrl();
    assert.equal((await fetch(url+'/api/v1/health/live')).status,200);
    const ready = await fetch(url+'/api/v1/health/ready');
    assert.equal(ready.status,503);
    const error = await ready.json();
    assert.equal(error.error.code,'SERVICE_UNAVAILABLE');
    assert.ok(error.requestId);
    const invalid = await fetch(url+'/api/v1/validation-test',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'bad',role:'admin'})});
    assert.equal(invalid.status,400);
    const valid = await fetch(url+'/api/v1/validation-test',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'patient@example.com'})});
    assert.equal(valid.status,201);
    assert.equal((await fetch(url+'/api/v1/missing')).status,404);
  } finally { await app.close(); }
});
