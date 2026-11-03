import { Body, ConflictException, Controller, HttpCode, HttpException, Inject, Injectable, Module, Post, Req, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import type { Request } from 'express';
import type { Connection } from 'mongoose';
import { Types } from 'mongoose';
import { createHmac, randomInt, timingSafeEqual, createHash } from 'node:crypto';
import nodemailer from 'nodemailer';
import { hashPassword } from './password.js';
export class RegisterDto {
 @ApiProperty() @IsEmail() @MaxLength(254) email!: string;
 @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) name!: string;
 @ApiProperty({minLength:12,maxLength:128}) @IsString() @MinLength(12) @MaxLength(128) password!: string;
}
export class VerifyDto {
 @ApiProperty() @Matches(/^[a-f0-9]{24}$/) challengeId!: string;
 @ApiProperty() @Matches(/^\d{6}$/) code!: string;
}
@Injectable()
export class RegistrationService {
 constructor(@InjectConnection() private readonly connection: Connection) {}
 private db() { if(!this.connection.db) throw new ServiceUnavailableException(); return this.connection.db; }
 private codeHash(id:string,code:string) {
  const secret=process.env.OTP_SECRET;
  if(!secret || secret.length<32) throw new ServiceUnavailableException('Dịch vụ xác thực chưa cấu hình');
  return createHmac('sha256',secret).update(`${id}:${code}`).digest('hex');
 }
 async onModuleInit() { await this.db().collection('registration_challenges').createIndex({expiresAt:1},{expireAfterSeconds:0}); }
 async register(input:RegisterDto, ip:string) {
  if(!process.env.SMTP_HOST || !process.env.MAIL_FROM) throw new ServiceUnavailableException('Chưa cấu hình gửi email');
  const email=input.email.trim().toLowerCase(); const name=input.name.trim();
  if(name.length<2) throw new HttpException('Tên cần ít nhất 2 ký tự',400);
  const demoCode=process.env.NODE_ENV==='production'?undefined:process.env.REGISTRATION_DEMO_OTP;
  const id=new Types.ObjectId(); const code=demoCode&&/^\d{6}$/.test(demoCode)?demoCode:String(randomInt(0,1000000)).padStart(6,'0');
  const codeHash=this.codeHash(id.toHexString(),code);
  for(const key of [`email:${email}`,`ip:${ip}`]) {
   const rateId=createHash('sha256').update(`register:${key}:${Math.floor(Date.now()/3600000)}`).digest('hex');
   const rate=await this.db().collection<{_id:string;attempts:number;expiresAt:Date}>('login_limits').findOneAndUpdate({_id:rateId},{$inc:{attempts:1},$setOnInsert:{expiresAt:new Date(Date.now()+7200000)}},{upsert:true,returnDocument:'after'});
   if((rate?.attempts??0)>(key.startsWith('ip:')?20:3)) throw new HttpException('Vui lòng thử lại sau',429);
  }
  if(await this.db().collection('users').findOne({email})) throw new ConflictException('Email đã được đăng ký');
  const expiresAt=new Date(Date.now()+600000);
  await this.db().collection('registration_challenges').insertOne({_id:id,email,name,passwordHash:await hashPassword(input.password),codeHash,attempts:0,expiresAt});
  const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT??587),secure:process.env.SMTP_SECURE==='true',requireTLS:process.env.NODE_ENV==='production',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined,connectionTimeout:10000,socketTimeout:15000});
  try {await transport.sendMail({from:process.env.MAIL_FROM,to:email,subject:'Mã xác thực tài khoản UX_UI',text:`Mã xác thực của bạn: ${code}. Có hiệu lực 10 phút. Không chia sẻ mã này.`});}
  catch {await this.db().collection('registration_challenges').deleteOne({_id:id});throw new ServiceUnavailableException('Không gửi được email');}
  finally {transport.close();}
  return {challengeId:id.toHexString(),expiresAt:expiresAt.toISOString()};
 }
 async verify(input:VerifyDto) {
  const id=new Types.ObjectId(input.challengeId);
  const challenge=await this.db().collection('registration_challenges').findOneAndUpdate({_id:id,expiresAt:{$gt:new Date()},consumedAt:{$exists:false},attempts:{$lt:5}},{$inc:{attempts:1}},{returnDocument:'after'});
  if(!challenge) throw new UnauthorizedException('Mã không hợp lệ hoặc đã hết hạn');
  const expected=Buffer.from(challenge.codeHash,'hex'); const supplied=Buffer.from(this.codeHash(input.challengeId,input.code),'hex');
  if(!timingSafeEqual(expected,supplied)) throw new UnauthorizedException('Mã không hợp lệ hoặc đã hết hạn');
  const claimed=await this.db().collection('registration_challenges').updateOne({_id:id,consumedAt:{$exists:false}},{$set:{consumedAt:new Date()}});
  if(claimed.modifiedCount!==1) throw new UnauthorizedException('Mã đã được sử dụng');
  try {await this.db().collection('users').insertOne({email:challenge.email,name:challenge.name,passwordHash:challenge.passwordHash,emailVerifiedAt:new Date(),createdAt:new Date()});}
  catch(error) {if(error && typeof error==='object' && 'code' in error && error.code===11000) throw new ConflictException('Email đã được đăng ký');throw error;}
  await this.db().collection('registration_challenges').deleteMany({email:challenge.email});
  return {verified:true};
 }
}
@ApiTags('auth')
@Controller('auth')
export class RegistrationController {
 constructor(@Inject(RegistrationService) private readonly service:RegistrationService) {}
 @Post('register') @HttpCode(202)
 register(@Body() body:RegisterDto,@Req() request:Request) {return this.service.register(body,request.ip??'unknown');}
 @Post('verify') @HttpCode(200)
 verify(@Body() body:VerifyDto) {return this.service.verify(body);}
}
@Module({controllers:[RegistrationController],providers:[RegistrationService]})
export class RegistrationModule {}
