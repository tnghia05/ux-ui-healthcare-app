import { BadRequestException,Body,ConflictException,Controller,ForbiddenException,Get,HttpException,Inject,Injectable,Module,NotFoundException,Param,Post,Req,UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiBearerAuth,ApiTags } from '@nestjs/swagger';
import { IsIn,IsISO8601,IsOptional,IsString,IsUUID,Matches,MaxLength,MinLength } from 'class-validator';
import type { ClientSession,Connection } from 'mongoose';
import { Types } from 'mongoose';
import {createHash,randomUUID} from 'node:crypto';
import {AuthModule,SessionGuard} from '../auth/auth.module.js';
import type {AuthRequest} from '../auth/auth.module.js';
import {BookingModule,BookingService,times} from './booking.module.js';
export const cancelReasons=['personal','doctor','mistake','not_needed','elsewhere','other'];
class MutationDto {@IsUUID('4') idempotencyKey!:string;}
export class RescheduleDto extends MutationDto {
 @Matches(/^\d{4}-\d{2}-\d{2}$/) date!:string;
 @IsIn(times) time!:string;
 @IsISO8601({strict:true}) expectedStartsAt!:string;
}
export class CancelDto extends MutationDto {
 @IsIn(cancelReasons) reason!:string;
 @IsOptional() @IsString() @MaxLength(500) note?:string;
 @IsISO8601({strict:true}) expectedStartsAt!:string;
}
export class RefundDto extends MutationDto {@IsString() @MinLength(3) @MaxLength(500) reason!:string;}
@Injectable()
export class LifecycleService {
 constructor(@InjectConnection()private readonly connection:Connection,@Inject(BookingService)private readonly booking:BookingService){}
 private db(){if(!this.connection.db)throw new Error('Database unavailable');return this.connection.db;}
 async onModuleInit(){await this.db().collection('appointment_events').createIndex({userId:1,idempotencyKey:1},{unique:true});}
 private async owned(userId:string,id:string,session?:ClientSession){if(!/^[a-f0-9]{24}$/.test(id))throw new NotFoundException('Không tìm thấy lịch khám');const item=await this.db().collection('appointments').findOne({id,userId},{session});if(!item)throw new NotFoundException('Không tìm thấy lịch khám');return item;}
 async get(userId:string,id:string){const item=await this.booking.detail(userId,id);return {appointment:item,idempotencyKey:randomUUID(),canChange:item.status==='confirmed'&&new Date(item.startsAt).getTime()>Date.now()+3600000,policy:'Lịch trong ứng dụng được đổi/hủy trước giờ khám ít nhất 1 giờ. Hoàn ví nội bộ cần nhân viên duyệt.'};}
 private async mutate(userId:string,id:string,kind:string,input:MutationDto,fn:(session:ClientSession)=>Promise<void>){
  await this.owned(userId,id);const hash=createHash('sha256').update(JSON.stringify({id,kind,...input})).digest('hex');const events=this.db().collection('appointment_events');
  const previous=await events.findOne({userId,idempotencyKey:input.idempotencyKey});if(previous){if(previous.payloadHash!==hash)throw new ConflictException('Yêu cầu đã dùng cho thông tin khác');return this.get(userId,id);}
  if(await events.countDocuments({userId,createdAt:{$gte:new Date(Date.now()-3600000)}})>=30)throw new HttpException('Bạn thao tác quá nhiều. Thử lại sau',429);
  const session=await this.connection.startSession();
  try{await session.withTransaction(async()=>{const committed=await events.findOne({userId,idempotencyKey:input.idempotencyKey},{session});if(committed){if(committed.payloadHash!==hash)throw new ConflictException('Yêu cầu đã dùng cho thông tin khác');return;}await fn(session);await events.insertOne({userId,bookingId:id,kind,idempotencyKey:input.idempotencyKey,payloadHash:hash,createdAt:new Date()},{session});});}
  catch(e){const committed=await events.findOne({userId,idempotencyKey:input.idempotencyKey});if(committed&&committed.payloadHash===hash)return this.get(userId,id);if(e&&typeof e==='object'&&'code'in e&&e.code===11000)throw new ConflictException('Giờ khám đã được đặt hoặc dữ liệu vừa thay đổi. Vui lòng tải lại');throw e;}
  finally{await session.endSession();}return this.get(userId,id);
 }
 private changeable(item:Record<string,unknown>,expected:string){if(item.status!=='confirmed'||new Date(item.startsAt as Date).getTime()<=Date.now()+3600000)throw new ConflictException('Chỉ đổi/hủy lịch đã xác nhận trước giờ khám ít nhất 1 giờ');if(new Date(item.startsAt as Date).toISOString()!==new Date(expected).toISOString())throw new ConflictException('Lịch đã được thay đổi trên phiên khác. Vui lòng tải lại');}
 async reschedule(userId:string,id:string,input:RescheduleDto){
  return this.mutate(userId,id,'reschedule',input,async session=>{
   const item=await this.owned(userId,id,session);this.changeable(item,input.expectedStartsAt);
   const options=await this.booking.options(userId,{doctorId:item.doctorId,date:input.date});
   if(!options.slots.some(s=>s.time===input.time&&s.available))throw new ConflictException('Giờ mới không còn trống. Lịch cũ vẫn được giữ');
   const startsAt=new Date(`${input.date}T${input.time}:00+07:00`);if(startsAt.getTime()<=Date.now()+3600000)throw new ConflictException('Giờ mới quá gần giờ hiện tại');
   await this.db().collection('appointments').updateOne({_id:item._id,status:'confirmed',startsAt:item.startsAt},{$inc:{checkinVersion:1},$set:{startsAt,endsAt:new Date(startsAt.getTime()+item.durationMinutes*60000),lastReschedule:{previousStartsAt:item.startsAt,startsAt,changedAt:new Date()},updatedAt:new Date()}},{session});
  });
 }
 async cancel(userId:string,id:string,input:CancelDto){
  if(input.reason==='other'&&(!input.note||input.note.trim().length<3))throw new BadRequestException('Vui lòng nhập lý do khác ít nhất 3 ký tự');
  return this.mutate(userId,id,'cancel',input,async session=>{const item=await this.owned(userId,id,session);if(item.status==='cancelled')return;this.changeable(item,input.expectedStartsAt);await this.db().collection('appointments').updateOne({_id:item._id},{$set:{status:'cancelled',occupiesSlot:false,cancelledAt:new Date(),cancellation:{reason:input.reason,note:input.note?.trim()??''},refundStatus:item.paymentStatus==='paid'&&item.paymentMethod==='wallet'?'eligible':'not_required',updatedAt:new Date()}},{session});});
 }
 async requestRefund(userId:string,id:string,input:RefundDto){if(input.reason.trim().length<3)throw new BadRequestException('Nhập lý do hoàn tiền');return this.mutate(userId,id,'refund_request',input,async session=>{
  const item=await this.owned(userId,id,session);if(item.refund)return;
  if(item.status!=='cancelled'||item.paymentStatus!=='paid'||item.paymentMethod!=='wallet')throw new ConflictException('Lịch chưa có khoản thanh toán ví có thể hoàn');
  const debit=await this.db().collection('wallet_ledger').findOne({bookingId:id,userId,kind:'booking_debit',amountVnd:-item.amountVnd},{session});if(!debit)throw new ConflictException('Chưa xác minh được giao dịch gốc, cần nhân viên hỗ trợ');
  const refund={id:'HT'+new Types.ObjectId().toHexString().slice(-12).toUpperCase(),status:'requested',amountVnd:item.amountVnd,reason:input.reason.trim(),requestedAt:new Date()};
  await this.db().collection('appointments').updateOne({_id:item._id},{$set:{refund,refundStatus:'requested',updatedAt:new Date()}},{session});
 });}
 async approveRefund(adminId:string,id:string){
  if(!await this.db().collection('users').findOne({_id:new Types.ObjectId(adminId),role:'admin',disabledAt:{$exists:false}}))throw new ForbiddenException('Chỉ nhân viên quản trị được duyệt hoàn tiền');
  const session=await this.connection.startSession();
  try{await session.withTransaction(async()=>{
   const item=await this.db().collection('appointments').findOne({id},{session});if(!item)throw new NotFoundException('Không tìm thấy lịch khám');
   if(item.refund?.status==='completed')return;
   if(item.status!=='cancelled'||item.paymentStatus!=='paid'||item.paymentMethod!=='wallet'||item.refund?.status!=='requested')throw new ConflictException('Chưa có yêu cầu hoàn tiền hợp lệ');
   if(!await this.db().collection('wallet_ledger').findOne({bookingId:id,userId:item.userId,kind:'booking_debit',amountVnd:-item.amountVnd},{session}))throw new ConflictException('Giao dịch gốc không khớp');
   const wallet=await this.db().collection('wallets').findOneAndUpdate({userId:item.userId},{$inc:{balanceVnd:item.amountVnd},$set:{updatedAt:new Date()}},{session,returnDocument:'after'});if(!wallet)throw new ConflictException('Ví nhận tiền không tồn tại');
   await this.db().collection('wallet_ledger').insertOne({userId:item.userId,bookingId:id,kind:'booking_refund',amountVnd:item.amountVnd,balanceAfterVnd:wallet.balanceVnd,createdAt:new Date(),approvedBy:adminId},{session});
   await this.db().collection('appointments').updateOne({_id:item._id},{$set:{paymentStatus:'refunded',refundStatus:'completed','refund.status':'completed','refund.completedAt':new Date(),'refund.approvedBy':adminId,updatedAt:new Date()}},{session});
  });}finally{await session.endSession();}return {status:'completed'};
 }
 async wallet(userId:string){const [wallet,entries]=await Promise.all([this.db().collection('wallets').findOne({userId}),this.db().collection('wallet_ledger').find({userId},{projection:{_id:0,userId:0,approvedBy:0}}).sort({createdAt:-1}).limit(50).toArray()]);return {balanceVnd:wallet?.balanceVnd??0,entries};}
}
@ApiTags('appointment-actions') @ApiBearerAuth() @UseGuards(SessionGuard) @Controller('appointment-actions')
export class LifecycleController {
 constructor(@Inject(LifecycleService)private readonly service:LifecycleService){}
 @Get(':id') get(@Req() req:AuthRequest,@Param('id') id:string){return this.service.get(req.auth!.userId,id);}
 @Post(':id/reschedule') reschedule(@Req() req:AuthRequest,@Param('id') id:string,@Body() input:RescheduleDto){return this.service.reschedule(req.auth!.userId,id,input);}
 @Post(':id/cancel') cancel(@Req() req:AuthRequest,@Param('id') id:string,@Body() input:CancelDto){return this.service.cancel(req.auth!.userId,id,input);}
 @Post(':id/refund') refund(@Req() req:AuthRequest,@Param('id') id:string,@Body() input:RefundDto){return this.service.requestRefund(req.auth!.userId,id,input);}
 @Post(':id/refund/approve') approve(@Req() req:AuthRequest,@Param('id') id:string){return this.service.approveRefund(req.auth!.userId,id);}
}
@ApiTags('wallet') @ApiBearerAuth() @UseGuards(SessionGuard) @Controller('wallet')
export class WalletController {constructor(@Inject(LifecycleService)private readonly service:LifecycleService){} @Get() get(@Req() req:AuthRequest){return this.service.wallet(req.auth!.userId);}}
@Module({imports:[AuthModule,BookingModule],providers:[LifecycleService],controllers:[LifecycleController,WalletController]})
export class BookingLifecycleModule{}

