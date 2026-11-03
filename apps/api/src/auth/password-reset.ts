import { Body,Controller,HttpCode,HttpException,Inject,Injectable,Module,Post,Req,ServiceUnavailableException,UnauthorizedException,BadRequestException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { Types } from 'mongoose';
import type { Request } from 'express';
import { ApiProperty,ApiTags } from '@nestjs/swagger';
import { IsEmail,IsString,Matches,MaxLength,MinLength } from 'class-validator';
import { createHash,createHmac,randomBytes,randomInt,timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';
import { hashPassword,verifyPassword } from './password.js';
export class ResetRequestDto {@ApiProperty() @IsEmail() @MaxLength(254) email!:string;}
export class ResetVerifyDto {
 @ApiProperty() @Matches(/^[a-f0-9]{24}$/) challengeId!:string;
 @ApiProperty() @Matches(/^\d{6}$/) code!:string;
}
export class ResetCompleteDto {
 @ApiProperty() @Matches(/^[A-Za-z0-9_-]{43}$/) resetToken!:string;
 @ApiProperty({minLength:12,maxLength:128}) @IsString() @MinLength(12) @MaxLength(128) newPassword!:string;
}
const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
@Injectable()
export class PasswordResetService {
 constructor(@InjectConnection() private readonly connection:Connection) {}
 private db(){if(!this.connection.db)throw new ServiceUnavailableException();return this.connection.db;}
 private hash(id:string,code:string){const secret=process.env.OTP_SECRET;if(!secret || secret.length<32)throw new ServiceUnavailableException();return createHmac('sha256',secret).update(`password-reset:${id}:${code}`).digest('hex');}
 async onModuleInit(){await this.db().collection('password_reset_challenges').createIndex({expiresAt:1},{expireAfterSeconds:0});await this.db().collection('password_reset_challenges').createIndex({resetTokenHash:1},{sparse:true});}
 async request(input:ResetRequestDto,ip:string){
  if(!process.env.SMTP_HOST || !process.env.MAIL_FROM)throw new ServiceUnavailableException('Chưa cấu hình gửi email');
  const email=input.email.trim().toLowerCase(),now=Date.now();
  const id=new Types.ObjectId(),code=String(randomInt(0,1000000)).padStart(6,'0');
  const codeHash=this.hash(id.toHexString(),code);
  for(const key of [`email:${email}`,`ip:${ip}`]){
   const rate=await this.db().collection<{_id:string;attempts:number;expiresAt:Date}>('login_limits').findOneAndUpdate({_id:digest(`reset:${key}:${Math.floor(now/3600000)}`)},{$inc:{attempts:1},$setOnInsert:{expiresAt:new Date(now+7200000)}},{upsert:true,returnDocument:'after'});
   if((rate?.attempts??0)>(key.startsWith('ip:')?20:3))throw new HttpException('Vui lòng thử lại sau',429);
  }
  const user=await this.db().collection('users').findOne({email,emailVerifiedAt:{$exists:true},disabledAt:{$exists:false}});
  const expiresAt=new Date(now+600000);
  await this.db().collection('password_reset_challenges').insertOne({_id:id,userId:user?._id??null,codeHash,attempts:0,expiresAt});
  if(user){const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT??587),secure:process.env.SMTP_SECURE==='true',requireTLS:process.env.NODE_ENV==='production',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined,connectionTimeout:10000,socketTimeout:15000});
   try{await transport.sendMail({from:process.env.MAIL_FROM,to:email,subject:'Khôi phục mật khẩu UX_UI',text:`Mã khôi phục mật khẩu: ${code}. Hiệu lực 10 phút. Không chia sẻ mã này.`});}
   catch{await this.db().collection('password_reset_challenges').deleteOne({_id:id});throw new ServiceUnavailableException('Không gửi được email');}finally{transport.close();}
  }
  return {challengeId:id.toHexString(),expiresAt:expiresAt.toISOString(),message:'Nếu email đã đăng ký, mã xác thực sẽ được gửi đến hộp thư.'};
 }
 async verify(input:ResetVerifyDto){
  const id=new Types.ObjectId(input.challengeId);
  const challenge=await this.db().collection('password_reset_challenges').findOneAndUpdate({_id:id,expiresAt:{$gt:new Date()},verifiedAt:{$exists:false},attempts:{$lt:5}},{$inc:{attempts:1}},{returnDocument:'after'});
  if(!challenge || !challenge.userId)throw new UnauthorizedException('Mã không hợp lệ hoặc đã hết hạn');
  if(!timingSafeEqual(Buffer.from(challenge.codeHash,'hex'),Buffer.from(this.hash(input.challengeId,input.code),'hex')))throw new UnauthorizedException('Mã không hợp lệ hoặc đã hết hạn');
  const token=randomBytes(32).toString('base64url'),expiresAt=new Date(Date.now()+300000);
  const claimed=await this.db().collection('password_reset_challenges').updateOne({_id:id,verifiedAt:{$exists:false}},{$set:{verifiedAt:new Date(),resetTokenHash:digest(token),grantExpiresAt:expiresAt,expiresAt}});
  if(claimed.modifiedCount!==1)throw new UnauthorizedException('Mã đã được sử dụng');
  return {resetToken:token,expiresAt:expiresAt.toISOString()};
 }
 async complete(input:ResetCompleteDto){
  const challenge=await this.db().collection('password_reset_challenges').findOne({resetTokenHash:digest(input.resetToken),grantExpiresAt:{$gt:new Date()},consumedAt:{$exists:false}});
  if(!challenge?.userId)throw new UnauthorizedException('Yêu cầu đã hết hạn hoặc được sử dụng');
  const user=await this.db().collection('users').findOne({_id:challenge.userId,disabledAt:{$exists:false}});
  if(!user)throw new UnauthorizedException();
  if(await verifyPassword(input.newPassword,user.passwordHash))throw new BadRequestException('Mật khẩu mới phải khác mật khẩu cũ');
  const passwordHash=await hashPassword(input.newPassword);
  const session=await this.connection.startSession();
  try{await session.withTransaction(async()=>{
   const claimed=await this.db().collection('password_reset_challenges').updateOne({_id:challenge._id,consumedAt:{$exists:false},grantExpiresAt:{$gt:new Date()}},{$set:{consumedAt:new Date()}},{session});
   if(claimed.modifiedCount!==1)throw new UnauthorizedException('Yêu cầu đã được sử dụng');
   const updated=await this.db().collection('users').updateOne({_id:user._id,disabledAt:{$exists:false}},{$set:{passwordHash,passwordChangedAt:new Date()},$inc:{credentialVersion:1}},{session});
   if(updated.matchedCount!==1)throw new UnauthorizedException();
   await this.db().collection('sessions').deleteMany({userId:user._id},{session});
   await this.db().collection('password_reset_challenges').deleteMany({userId:user._id},{session});
  });}finally{await session.endSession();}
  return {changed:true};
 }
}
@ApiTags('auth')
@Controller('auth/password-reset')
export class PasswordResetController {
 constructor(@Inject(PasswordResetService) private readonly service:PasswordResetService){}
 @Post('request') @HttpCode(202) request(@Body() body:ResetRequestDto,@Req() req:Request){return this.service.request(body,req.ip??'unknown');}
 @Post('verify') @HttpCode(200) verify(@Body() body:ResetVerifyDto){return this.service.verify(body);}
 @Post('complete') @HttpCode(200) complete(@Body() body:ResetCompleteDto){return this.service.complete(body);}
}
@Module({controllers:[PasswordResetController],providers:[PasswordResetService]})
export class PasswordResetModule {}
