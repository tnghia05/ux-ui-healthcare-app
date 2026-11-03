import { PreferencesDto } from './preferences.dto.js';
import { ProfileDto } from './profile.dto.js';
import { Body, Controller, Get, Inject, Injectable, Module, Post, Req, UnauthorizedException, HttpException, HttpCode, Patch, BadRequestException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import type { Request } from 'express';
import type { Connection } from 'mongoose';
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;
import { createHash, randomBytes } from 'node:crypto';
import { hashPassword, verifyPassword } from './password.js';
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export class LoginDto {
 @ApiProperty() @IsEmail() @MaxLength(254) email!: string;
 @ApiProperty({minLength:1,maxLength:128}) @IsString() @MinLength(1) @MaxLength(128) password!: string;
}
export interface AuthRequest extends Request { auth?: {userId:string;sessionId:string}; }
@Injectable()
export class AuthService {
 private dummyHash?: Promise<string>;
 constructor(@InjectConnection() private readonly connection: Connection) {}
 private db() {if(!this.connection.db) throw new Error('Database not connected');return this.connection.db;}
 async onModuleInit() {
  await this.db().collection('users').createIndex({email:1},{unique:true});
  await this.db().collection('sessions').createIndex({tokenHash:1},{unique:true});
  await this.db().collection('sessions').createIndex({expiresAt:1},{expireAfterSeconds:0});
  await this.db().collection('login_limits').createIndex({expiresAt:1},{expireAfterSeconds:0});
 }
 async login(input: LoginDto, ip: string) {
  const email=input.email.trim().toLowerCase();
  const now=Date.now();
  // Fixed windows stored in MongoDB: limits survive an API restart.
  for (const identity of [`ip:${ip}`,`account:${email}`]) {
   const id=digest(`${identity}:${Math.floor(now/900000)}`);
   const limit=await this.db().collection<{_id:string;attempts:number;expiresAt:Date}>('login_limits').findOneAndUpdate({_id:id},{$inc:{attempts:1},$setOnInsert:{expiresAt:new Date(now+1800000)}},{upsert:true,returnDocument:'after'});
   if ((limit?.attempts ?? 0)>(identity.startsWith('ip:')?50:10)) throw new HttpException('Thử lại sau ít phút',429);
  }
  const user=await this.db().collection('users').findOne({email});
  this.dummyHash ??= hashPassword(randomBytes(24).toString('hex'));
  const valid=await verifyPassword(input.password, user?.passwordHash ?? await this.dummyHash);
  if (!user || !valid || !user.emailVerifiedAt || user.disabledAt) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
  const token=randomBytes(32).toString('base64url');
  const expiresAt=new Date(now+7*86400000);
  const session=await this.db().collection('sessions').insertOne({userId:user._id,tokenHash:digest(token),credentialVersion:user.credentialVersion??0,expiresAt,createdAt:new Date(now)});
  return {accessToken:token,expiresAt:expiresAt.toISOString(),user:await this.profile(user._id.toHexString()),sessionId:session.insertedId.toHexString()};
 }
 async authenticate(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new UnauthorizedException();
  const session=await this.db().collection('sessions').findOne({tokenHash:digest(token),expiresAt:{$gt:new Date()}});
  if (!session) throw new UnauthorizedException();
  const user=await this.db().collection('users').findOne({_id:session.userId,disabledAt:{$exists:false}});
  if (!user || !user.emailVerifiedAt || (session.credentialVersion??0)!==(user.credentialVersion??0)) throw new UnauthorizedException();
  return {userId:user._id.toHexString(),sessionId:session._id.toHexString()};
 }
 async profile(id: string) {
  const user=await this.db().collection('users').findOne({_id:new ObjectId(id)},{projection:{email:1,name:1,phone:1,birthDate:1,gender:1,profileCompletedAt:1,preferences:1,role:1,avatarFileId:1,avatarVersion:1}});
  if(!user) throw new UnauthorizedException();
  const assignment=await this.db().collection('doctor_accounts').findOne({userId:id,active:true},{projection:{doctorId:1}});
  return {hasAvatar:!!user.avatarFileId,avatarVersion:user.avatarVersion??0,clinician:assignment?{doctorId:assignment.doctorId}:null,role:user.role==='admin'?'admin':'patient',id:user._id.toHexString(),email:user.email,name:user.name,phone:user.phone??null,birthDate:user.birthDate??null,gender:user.gender??null,profileCompletedAt:user.profileCompletedAt??null,preferences:user.preferences??{locationMode:'none',notificationPermission:'undetermined',setupCompleted:false}};
 }
 async updateProfile(id:string,input:ProfileDto) {
  const name=input.name.trim();
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh'}).format(new Date());
  if(name.length<2 || input.birthDate<'1900-01-01' || input.birthDate>today) throw new BadRequestException('Họ tên hoặc ngày sinh không hợp lệ');
  const result=await this.db().collection('users').updateOne({_id:new ObjectId(id),disabledAt:{$exists:false}},{$set:{name,phone:input.phone,birthDate:input.birthDate,gender:input.gender,profileCompletedAt:new Date(),updatedAt:new Date()}});
  if(!result.matchedCount) throw new UnauthorizedException();
  return this.profile(id);
 }
 async updatePreferences(id:string,input:PreferencesDto){
  const set:Record<string,unknown>={updatedAt:new Date()};const unset:Record<string,string>={};
  if(input.locationMode==='device' && (input.latitude===undefined||input.longitude===undefined||input.locationPermission!=='granted'))throw new BadRequestException('Vị trí thiết bị cần tọa độ và quyền truy cập');
  if(input.address!==undefined && input.locationMode!=='manual')throw new BadRequestException('Địa chỉ cần phương thức nhập thủ công');
  if(input.locationMode==='manual' && (!input.address||input.address.trim().length<3))throw new BadRequestException('Vui lòng nhập địa chỉ');
  if((input.latitude!==undefined||input.longitude!==undefined) && input.locationMode!=='device')throw new BadRequestException('Chỉ lưu tọa độ khi chọn vị trí thiết bị');
  for(const key of ['locationMode','locationPermission','notificationPermission','setupCompleted'] as const)if(input[key]!==undefined)set[`preferences.${key}`]=input[key];
  if(input.locationMode==='device'){set['preferences.latitude']=input.latitude;set['preferences.longitude']=input.longitude;unset['preferences.address']='';}
  if(input.locationMode==='manual'){set['preferences.address']=input.address!.trim();unset['preferences.latitude']='';unset['preferences.longitude']='';}
  if(input.locationMode==='none'){unset['preferences.latitude']='';unset['preferences.longitude']='';unset['preferences.address']='';}
  const result=await this.db().collection('users').updateOne({_id:new ObjectId(id),disabledAt:{$exists:false}},{$set:set,...(Object.keys(unset).length?{$unset:unset}:{})});
  if(!result.matchedCount)throw new UnauthorizedException();return this.profile(id);
 }
 async logout(sessionId: string) {await this.db().collection('sessions').deleteOne({_id:new ObjectId(sessionId)});}
}
@Injectable()
export class SessionGuard implements CanActivate {
 constructor(@Inject(AuthService) private readonly auth: AuthService) {}
 async canActivate(context: ExecutionContext) {
  const request=context.switchToHttp().getRequest<AuthRequest>();
  const header=request.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedException();
  request.auth=await this.auth.authenticate(header.slice(7));return true;
 }
}
@ApiTags('auth')
@Controller('auth')
export class AuthController {
 constructor(@Inject(AuthService) private readonly auth: AuthService) {}
 @Post('login') @HttpCode(200)
 login(@Body() body:LoginDto,@Req() request:Request) {return this.auth.login(body,request.ip ?? 'unknown');}
 @Get('me') @ApiBearerAuth() @UseGuards(SessionGuard)
 me(@Req() request:AuthRequest) {return this.auth.profile(request.auth!.userId);}
 @Patch('me') @ApiBearerAuth() @UseGuards(SessionGuard)
 updateProfile(@Req() request:AuthRequest,@Body() body:ProfileDto) {return this.auth.updateProfile(request.auth!.userId,body);}
 @Patch('preferences') @ApiBearerAuth() @UseGuards(SessionGuard)
 preferences(@Req() request:AuthRequest,@Body() body:PreferencesDto){return this.auth.updatePreferences(request.auth!.userId,body);}
 @Post('logout') @HttpCode(204) @ApiBearerAuth() @UseGuards(SessionGuard)
 async logout(@Req() request:AuthRequest) {await this.auth.logout(request.auth!.sessionId);}
}
@Module({controllers:[AuthController],providers:[AuthService,SessionGuard],exports:[AuthService,SessionGuard]})
export class AuthModule {}

