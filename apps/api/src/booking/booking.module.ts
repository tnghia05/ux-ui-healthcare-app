import { BadRequestException,Body,ConflictException,Controller,Get,HttpException,Inject,Injectable,Module,NotFoundException,Param,Post,Query,Req,UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiBearerAuth,ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined,IsIn,IsInt,IsOptional,IsString,IsUUID,Matches,Max,MaxLength,Min,MinLength,ValidateNested } from 'class-validator';
import type { Connection } from 'mongoose';
import { Types } from 'mongoose';
import { createHash,randomBytes,randomUUID } from 'node:crypto';
import { AuthModule,SessionGuard } from '../auth/auth.module.js';
import type { AuthRequest } from '../auth/auth.module.js';

export const packages=[
 {id:'standard',name:'Khám tiêu chuẩn',amountVnd:200000,durationMinutes:30,description:'Khám và tư vấn cùng bác sĩ',enabled:true,icon:'b1_imgVector1'},
 {id:'phone',name:'Tư vấn qua điện thoại',amountVnd:150000,durationMinutes:30,description:'Đặt lịch tư vấn thoại · cần người phụ trách tham gia',enabled:true,icon:'b1_imgVector2'},
 {id:'video',name:'Tư vấn qua video',amountVnd:250000,durationMinutes:30,description:'Đặt lịch tư vấn video · cần người phụ trách tham gia',enabled:true,icon:'b1_imgVector3'},
 {id:'extended',name:'Khám chuyên sâu',amountVnd:350000,durationMinutes:60,description:'Thăm khám và tư vấn mở rộng',enabled:true,icon:'b1_imgVector4'},
] as const;
export const vnDate=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export const addDays=(date:string,days:number)=>new Date(Date.parse(date+'T00:00:00Z')+days*86400000).toISOString().slice(0,10);
export const times=['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
const idPattern=/^[a-z0-9-]{1,80}$/;
export class OptionsDto {
 @IsString() @Matches(idPattern) doctorId!:string;
 @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) date?:string;
}
export class PatientDto {
 @IsString() @MinLength(2) @MaxLength(100) name!:string;
 @IsString() @Matches(/^(0|\+84)[0-9]{9}$/) phone!:string;
 @IsIn(['male','female','other','not_specified']) gender!:string;
 @IsInt() @Min(0) @Max(120) age!:number;
 @IsString() @MinLength(3) @MaxLength(1000) reason!:string;
}
export class BookingDto {
 @IsString() @Matches(idPattern) doctorId!:string;
 @Matches(/^\d{4}-\d{2}-\d{2}$/) date!:string;
 @IsIn(times) time!:string;
 @IsIn(['standard','phone','video','extended']) packageId!:string;
 @IsDefined() @ValidateNested() @Type(()=>PatientDto) patient!:PatientDto;
 @IsIn(['cash','wallet']) paymentMethod!:'cash'|'wallet';
 @IsInt() @Min(0) @Max(100000000) expectedAmountVnd!:number;
 @IsOptional() @Matches(/^[A-Z0-9]{3,24}$/) couponCode?:string;
 @IsUUID('4') idempotencyKey!:string;
}
export class ListDto {@IsOptional() @IsIn(['upcoming','past','cancelled','completed','expired']) scope?:string;}
export class DemoCompleteDto {@IsIn(['phone','video']) mode!:'phone'|'video';}
@Injectable()
export class BookingService {
 constructor(@InjectConnection() private readonly connection:Connection){}
 private db(){if(!this.connection.db)throw new Error('Database unavailable');return this.connection.db;}
 async onModuleInit(){
  await this.db().collection('appointments').createIndex({userId:1,idempotencyKey:1},{unique:true,partialFilterExpression:{idempotencyKey:{$type:'string'}}});
  await this.db().collection('appointments').createIndex({doctorId:1,startsAt:1},{unique:true,partialFilterExpression:{occupiesSlot:true}});
  await this.db().collection('coupon_uses').createIndex({userId:1,code:1},{unique:true});
  await this.db().collection('wallets').createIndex({userId:1},{unique:true});
  await this.db().collection('wallet_ledger').createIndex({bookingId:1,kind:1},{unique:true});
 }
 private validateDate(date:string){const today=vnDate();const timestamp=Date.parse(date+'T00:00:00Z');if(!Number.isFinite(timestamp)||new Date(timestamp).toISOString().slice(0,10)!==date||date<today||date>addDays(today,30))throw new BadRequestException('Chỉ chọn ngày hợp lệ trong 30 ngày tới');}
 async options(userId:string,input:OptionsDto){const date=input.date??vnDate();this.validateDate(date);
  const doctor=await this.db().collection('doctors').findOne({id:input.doctorId,active:true},{projection:{_id:0}});if(!doctor)throw new NotFoundException('Không tìm thấy bác sĩ');
  const hospital=doctor.hospitalId?await this.db().collection('hospitals').findOne({id:doctor.hospitalId,active:true},{projection:{_id:0}}):null;
  const booked=await this.db().collection('appointments').find({doctorId:input.doctorId,occupiesSlot:true,startsAt:{$gte:new Date(date+'T00:00:00+07:00'),$lt:new Date(addDays(date,1)+'T00:00:00+07:00')}},{projection:{startsAt:1}}).toArray();
  const slots=times.map(time=>{const startsAt=new Date(`${date}T${time}:00+07:00`);return {time,available:!!hospital&&startsAt.getTime()>Date.now()+3600000&&!booked.some(b=>new Date(b.startsAt).getTime()===startsAt.getTime())};});
  const wallet=await this.db().collection('wallets').findOne({userId});
  return {idempotencyKey:randomUUID(),doctor:{id:doctor.id,name:doctor.name,specialty:doctor.specialty,imageKey:doctor.imageKey,rating:doctor.rating},hospital:hospital?{id:hospital.id,name:hospital.name,address:hospital.address}:null,date,today:vnDate(),lastDate:addDays(vnDate(),30),slots,packages,walletBalanceVnd:wallet?.balanceVnd??0};
 }
 async create(userId:string,input:BookingDto){
  const payload={...(input.couponCode?{couponCode:input.couponCode}:{}),doctorId:input.doctorId,date:input.date,time:input.time,packageId:input.packageId,paymentMethod:input.paymentMethod,expectedAmountVnd:input.expectedAmountVnd,patient:{name:input.patient.name.trim(),phone:input.patient.phone,gender:input.patient.gender,age:input.patient.age,reason:input.patient.reason.trim()}};
  if(payload.patient.name.length<2||payload.patient.reason.length<3)throw new BadRequestException('Vui lòng điền đủ thông tin người khám');
  const hash=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  const existing=await this.db().collection('appointments').findOne({userId,idempotencyKey:input.idempotencyKey});
  if(existing){if(existing.payloadHash!==hash)throw new ConflictException('Lần xác nhận này đã dùng cho thông tin khác');return this.detail(userId,existing.id);}
  this.validateDate(input.date);const option=await this.options(userId,input);if(!option.slots.some(s=>s.time===input.time&&s.available)){const committed=await this.db().collection('appointments').findOne({userId,idempotencyKey:input.idempotencyKey});if(committed&&committed.payloadHash===hash)return this.detail(userId,committed.id);throw new ConflictException('Giờ khám không còn trống. Vui lòng chọn lại');}
  const pack=packages.find(p=>p.id===input.packageId&&p.enabled);if(!pack)throw new BadRequestException('Gói khám chưa khả dụng');
  const coupon=input.couponCode?await this.db().collection('coupons').findOne({code:input.couponCode,active:true,expiresAt:{$gt:new Date()},minimumVnd:{$lte:pack.amountVnd}}):null;
  if(input.couponCode&&(!coupon||await this.db().collection('coupon_uses').findOne({userId,code:input.couponCode})))throw new BadRequestException('Mã giảm giá không còn khả dụng');
  const discountVnd=coupon?Math.min(coupon.discountVnd,pack.amountVnd-1):0;const amountVnd=pack.amountVnd-discountVnd;
  if(input.expectedAmountVnd!==amountVnd)throw new ConflictException('Giá gói khám đã thay đổi. Vui lòng chọn lại gói và xem lại tổng tiền');
  const id=new Types.ObjectId().toHexString();const startsAt=new Date(`${input.date}T${input.time}:00+07:00`);const endsAt=new Date(startsAt.getTime()+pack.durationMinutes*60000);
  const session=await this.connection.startSession();let bookedId=id;
  try{
   await session.withTransaction(async()=>{
    const committed=await this.db().collection('appointments').findOne({userId,idempotencyKey:input.idempotencyKey},{session});
    if(committed){if(committed.payloadHash!==hash)throw new ConflictException('Lần xác nhận này đã dùng cho thông tin khác');bookedId=committed.id;return;}
    if(startsAt.getTime()<=Date.now()+3600000)throw new ConflictException('Giờ khám đã qua thời hạn đặt');
    if(await this.db().collection('appointments').countDocuments({userId,createdAt:{$gte:new Date(Date.now()-86400000)}},{session})>=20)throw new HttpException('Bạn đã đặt quá nhiều lịch trong ngày',429);
    if(coupon){const current=await this.db().collection('coupons').findOneAndUpdate({code:coupon.code,active:true,expiresAt:{$gt:new Date()}},{$inc:{redemptions:1}},{session});if(!current)throw new ConflictException('Mã giảm giá đã ngừng');await this.db().collection('coupon_uses').insertOne({userId,code:coupon.code,bookingId:id,createdAt:new Date()},{session});}
    if(input.paymentMethod==='wallet'){
     const wallet=await this.db().collection('wallets').findOneAndUpdate({userId,balanceVnd:{$gte:amountVnd}},{$inc:{balanceVnd:-amountVnd},$set:{updatedAt:new Date()}},{session,returnDocument:'after'});
     if(!wallet)throw new HttpException('Ví không đủ số dư. Chọn thanh toán tại cơ sở hoặc nạp tiền sau',402);
     await this.db().collection('wallet_ledger').insertOne({userId,bookingId:id,kind:'booking_debit',amountVnd:-amountVnd,balanceAfterVnd:wallet.balanceVnd,createdAt:new Date()},{session});
    }
    await this.db().collection('appointments').insertOne({id,userId,idempotencyKey:input.idempotencyKey,payloadHash:hash,code:'KH'+randomBytes(5).toString('hex').toUpperCase(),doctorId:input.doctorId,doctorName:option.doctor.name,imageKey:option.doctor.imageKey,specialty:option.doctor.specialty,hospitalId:option.hospital!.id,hospitalName:option.hospital!.name,hospitalAddress:option.hospital!.address,packageId:pack.id,packageName:pack.name,durationMinutes:pack.durationMinutes,amountVnd,discountVnd,...(coupon?{couponCode:coupon.code}:{}),paymentMethod:input.paymentMethod,paymentStatus:input.paymentMethod==='wallet'?'paid':'unpaid',status:'confirmed',patient:payload.patient,startsAt,endsAt,occupiesSlot:true,source:'local-schedule',createdAt:new Date()},{session});
   });
  }catch(error){
   if(error&&typeof error==='object'&&'code' in error&&error.code===11000){const previous=await this.db().collection('appointments').findOne({userId,idempotencyKey:input.idempotencyKey});if(previous&&previous.payloadHash===hash)return this.detail(userId,previous.id);throw new ConflictException('Giờ khám vừa được đặt. Chọn giờ khác');}
   throw error;
  }finally{await session.endSession();}
  return this.detail(userId,bookedId);
 }
 async detail(userId:string,id:string){if(!/^[a-f0-9]{24}$/.test(id))throw new NotFoundException('Không tìm thấy lịch khám');const item=await this.db().collection('appointments').findOne({id,userId},{projection:{_id:0,userId:0,idempotencyKey:0,payloadHash:0,occupiesSlot:0}});if(!item)throw new NotFoundException('Không tìm thấy lịch khám');return item;}
 async completeDemo(userId:string,id:string,mode:'phone'|'video'){
  if(process.env.NODE_ENV==='production')throw new NotFoundException('Chức năng mô phỏng không khả dụng');
  if(!/^[a-f0-9]{24}$/.test(id))throw new NotFoundException('Không tìm thấy lịch tư vấn');
  const item=await this.db().collection('appointments').findOne({id,userId});
  if(!item)throw new NotFoundException('Không tìm thấy lịch tư vấn');
  if(item.packageId!==mode)throw new ConflictException('Hình thức gọi không khớp gói đã đặt');
  if(item.status==='completed'&&item.completionSource==='demo_simulation')return this.detail(userId,id);
  if(item.status!=='confirmed')throw new ConflictException('Lịch tư vấn không còn chờ hoàn thành');
  await this.db().collection('appointments').updateOne({id,userId,status:'confirmed',packageId:mode},{$set:{status:'completed',completedAt:new Date(),completionSource:'demo_simulation',occupiesSlot:false,updatedAt:new Date()}});
  return this.detail(userId,id);
 }
 async list(userId:string,scope='upcoming'){const query=scope==='completed'?{status:'completed'}:scope==='expired'?{status:'confirmed',endsAt:{$lt:new Date()}}:scope==='cancelled'?{status:'cancelled'}:scope==='past'?{$or:[{status:'completed'},{status:'confirmed',endsAt:{$lt:new Date()}}]}:{$or:[{status:'confirmed',endsAt:{$gte:new Date()}},{status:{$in:['checked_in','in_consultation']}}]};const items=await this.db().collection('appointments').find({userId,...query},{projection:{_id:0,userId:0,idempotencyKey:0,payloadHash:0,occupiesSlot:0}}).sort({startsAt:scope==='upcoming'?1:-1}).limit(50).toArray();return {items};}
}
@ApiTags('booking') @ApiBearerAuth() @UseGuards(SessionGuard) @Controller('booking')
export class BookingController {
 constructor(@Inject(BookingService)private readonly service:BookingService){}
 @Get('options') options(@Req() req:AuthRequest,@Query() query:OptionsDto){return this.service.options(req.auth!.userId,query);}
 @Get() list(@Req() req:AuthRequest,@Query() query:ListDto){return this.service.list(req.auth!.userId,query.scope);}
 @Post() create(@Req() req:AuthRequest,@Body() input:BookingDto){return this.service.create(req.auth!.userId,input);}
 @Post(':id/demo-complete') completeDemo(@Req() req:AuthRequest,@Param('id') id:string,@Body() input:DemoCompleteDto){return this.service.completeDemo(req.auth!.userId,id,input.mode);}
 @Get(':id/receipt') receipt(@Req() req:AuthRequest,@Param('id') id:string){return this.service.detail(req.auth!.userId,id);}
 @Get(':id') detail(@Req() req:AuthRequest,@Param('id') id:string){return this.service.detail(req.auth!.userId,id);}
}
@Module({imports:[AuthModule],providers:[BookingService],controllers:[BookingController],exports:[BookingService]})
export class BookingModule{}

