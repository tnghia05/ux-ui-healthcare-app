import {BadRequestException,Body,ConflictException,Controller,Delete,ForbiddenException,Get,Inject,Injectable,Module,NotFoundException,Param,Post,Req,UseGuards} from '@nestjs/common';
import {InjectConnection} from '@nestjs/mongoose';
import {IsIn,IsInt,IsString,IsUUID,Matches,Max,MaxLength,Min,MinLength} from 'class-validator';
import {randomUUID} from 'node:crypto';
import {Types} from 'mongoose';
import type {Connection} from 'mongoose';
import {AuthModule,SessionGuard} from '../auth/auth.module.js';
import type {AuthRequest} from '../auth/auth.module.js';
class TopupDto {@IsInt() @Min(10000) @Max(10000000) amountVnd!:number; @IsUUID('4') idempotencyKey!:string;}
class DecisionDto {@IsIn(['approved','rejected']) status!:string; @IsString() @MinLength(5) @MaxLength(100) reference!:string;}
class CardDto {@IsIn(['visa','mastercard','other']) brand!:string; @Matches(/^\d{4}$/) last4!:string; @IsString() @MinLength(2) @MaxLength(80) holder!:string; @Matches(/^(0[1-9]|1[0-2])\/\d{4}$/) expiry!:string; @IsUUID('4') idempotencyKey!:string;}
class CouponDto {@Matches(/^[A-Z0-9]{3,24}$/) code!:string; @IsString() @MinLength(3) @MaxLength(160) description!:string; @IsInt() @Min(1000) @Max(1000000) discountVnd!:number; @IsInt() @Min(0) @Max(10000000) minimumVnd!:number; @Matches(/^\d{4}-\d{2}-\d{2}$/) expiresOn!:string;}
class QuoteDto {@Matches(/^[A-Z0-9]{3,24}$/) code!:string; @IsIn(['standard','extended']) packageId!:string;}
@Injectable()
export class PaymentsService {
 constructor(@InjectConnection()private readonly connection:Connection){}
 private db(){return this.connection.db!;}
 async admin(id:string){if(!await this.db().collection('users').findOne({_id:new Types.ObjectId(id),role:'admin',disabledAt:{$exists:false}}))throw new ForbiddenException('Chỉ quản trị được thực hiện');}
 async onModuleInit(){await this.db().collection('wallet_topups').createIndex({userId:1,idempotencyKey:1},{unique:true});await this.db().collection('wallet_topups').createIndex({reference:1},{unique:true,partialFilterExpression:{status:'approved'}});await this.db().collection('wallets').createIndex({userId:1},{unique:true});await this.db().collection('wallet_ledger').createIndex({bookingId:1,kind:1},{unique:true});await this.db().collection('payment_card_labels').createIndex({userId:1,idempotencyKey:1},{unique:true});await this.db().collection('coupons').createIndex({code:1},{unique:true});await this.db().collection('coupon_uses').createIndex({userId:1,code:1},{unique:true});}
 key(){return {idempotencyKey:randomUUID()};}
 async topup(userId:string,b:TopupDto):Promise<import('mongoose').mongo.Document>{const old=await this.db().collection('wallet_topups').findOne({userId,idempotencyKey:b.idempotencyKey});if(old){if(old.amountVnd!==b.amountVnd)throw new ConflictException('Yêu cầu đã dùng cho số tiền khác');return this.detail(userId,old.id);}if(await this.db().collection('wallet_topups').countDocuments({userId,status:'pending'})>=5)throw new BadRequestException('Chỉ được có tối đa 5 yêu cầu đang chờ');const id=new Types.ObjectId().toHexString();try{await this.db().collection('wallet_topups').insertOne({id,userId,...b,status:'pending',createdAt:new Date()});}catch(e){if(e&&typeof e==='object'&&'code'in e&&e.code===11000)return this.topup(userId,b);throw e;}return this.detail(userId,id);}
 async detail(userId:string,id:string){const r=await this.db().collection('wallet_topups').findOne({id,userId},{projection:{_id:0,userId:0,idempotencyKey:0,approvedBy:0}});if(!r)throw new NotFoundException('Không tìm thấy yêu cầu');return r;}
 async topups(userId:string,staff=false){if(staff)await this.admin(userId);const items=await this.db().collection('wallet_topups').find(staff?{status:'pending'}:{userId},{projection:{_id:0,idempotencyKey:0,approvedBy:0}}).sort({createdAt:-1}).limit(50).toArray();const visible=[];for(const r of items){const owner=staff?await this.db().collection('users').findOne({_id:new Types.ObjectId(r.userId)},{projection:{name:1,email:1}}):null;const {userId:ownerId,...item}=r;void ownerId;visible.push({...item,...(owner?{requesterName:owner.name,requesterEmail:owner.email}:{})});}return {items:visible};}
 async decide(adminId:string,id:string,b:DecisionDto){await this.admin(adminId);const reference=b.reference.trim();if(reference.length<5)throw new BadRequestException('Nhập mã đối soát hoặc lý do');const session=await this.connection.startSession();try{await session.withTransaction(async()=>{const r=await this.db().collection('wallet_topups').findOne({id},{session});if(!r)throw new NotFoundException();if(r.status!=='pending'){if(r.status===b.status&&r.reference===reference)return;throw new ConflictException('Yêu cầu đã được xử lý');}await this.db().collection('wallet_topups').updateOne({id,status:'pending'},{$set:{status:b.status,reference,approvedBy:adminId,decidedAt:new Date()}},{session});if(b.status==='approved'){const wallet=await this.db().collection('wallets').findOneAndUpdate({userId:r.userId},{$inc:{balanceVnd:r.amountVnd},$set:{updatedAt:new Date()}},{upsert:true,session,returnDocument:'after'});await this.db().collection('wallet_ledger').insertOne({userId:r.userId,bookingId:id,kind:'manual_topup',amountVnd:r.amountVnd,balanceAfterVnd:wallet!.balanceVnd,approvedBy:adminId,createdAt:new Date()},{session});}});}catch(e){if(e&&typeof e==='object'&&'code'in e&&e.code===11000)throw new ConflictException('Mã giao dịch đã được đối soát');throw e;}finally{await session.endSession();}return {status:b.status};}
 async cards(userId:string){return {items:await this.db().collection('payment_card_labels').find({userId},{projection:{_id:0,userId:0,idempotencyKey:0}}).sort({createdAt:-1}).limit(20).toArray()};}
 async card(userId:string,b:CardDto):Promise<{id:string}>{if(b.holder.trim().length<2)throw new BadRequestException('Nhập tên chủ thẻ');const [month,year]=b.expiry.split('/').map(Number);if(new Date(year!,month!,1).getTime()<=Date.now())throw new BadRequestException('Thẻ đã hết hạn');const old=await this.db().collection('payment_card_labels').findOne({userId,idempotencyKey:b.idempotencyKey});if(old){if(old.last4!==b.last4||old.holder!==b.holder.trim()||old.expiry!==b.expiry||old.brand!==b.brand)throw new ConflictException('Mã lưu đã dùng');return {id:old.id};}if(await this.db().collection('payment_card_labels').countDocuments({userId})>=20)throw new BadRequestException('Tối đa 20 nhãn thẻ');const id=new Types.ObjectId().toHexString();try{await this.db().collection('payment_card_labels').insertOne({id,userId,...b,holder:b.holder.trim(),chargeable:false,createdAt:new Date()});}catch(e){if(e&&typeof e==='object'&&'code'in e&&e.code===11000)return this.card(userId,b);throw e;}return {id};}
 async removeCard(userId:string,id:string){if(!(await this.db().collection('payment_card_labels').deleteOne({id,userId})).deletedCount)throw new NotFoundException();return {deleted:true};}
 async coupons(){return {items:await this.db().collection('coupons').find({active:true,expiresAt:{$gt:new Date()}},{projection:{_id:0,createdBy:0}}).sort({createdAt:-1}).limit(50).toArray()};}
 async coupon(adminId:string,b:CouponDto){await this.admin(adminId);const expiresAt=new Date(b.expiresOn+'T23:59:59+07:00');if(!Number.isFinite(expiresAt.getTime())||expiresAt<=new Date()||new Date(Date.parse(b.expiresOn+'T00:00:00Z')).toISOString().slice(0,10)!==b.expiresOn)throw new BadRequestException('Ngày hết hạn không hợp lệ');try{await this.db().collection('coupons').insertOne({...b,expiresAt,active:true,createdBy:adminId,createdAt:new Date()});}catch(e){if(e&&typeof e==='object'&&'code'in e&&e.code===11000)throw new ConflictException('Mã đã tồn tại');throw e;}return {code:b.code};}
 async disable(adminId:string,code:string){await this.admin(adminId);await this.db().collection('coupons').updateOne({code},{$set:{active:false}});return {active:false};}
 async quote(userId:string,b:QuoteDto){const amount=b.packageId==='standard'?200000:350000;const c=await this.db().collection('coupons').findOne({code:b.code,active:true,expiresAt:{$gt:new Date()},minimumVnd:{$lte:amount}});if(!c||await this.db().collection('coupon_uses').findOne({userId,code:b.code}))throw new BadRequestException('Mã không khả dụng, đã dùng hoặc chưa đạt giá trị tối thiểu');return {code:c.code,discountVnd:Math.min(c.discountVnd,amount-1),amountVnd:Math.max(1,amount-c.discountVnd)};}
}
@UseGuards(SessionGuard) @Controller('payments')
class PaymentsController {
 constructor(@Inject(PaymentsService)private readonly s:PaymentsService){}
 @Get('key') key(){return this.s.key();}
 @Get('topups') list(@Req()r:AuthRequest){return this.s.topups(r.auth!.userId);}
 @Post('topups') topup(@Req()r:AuthRequest,@Body()b:TopupDto){return this.s.topup(r.auth!.userId,b);}
 @Get('topups/:id') detail(@Req()r:AuthRequest,@Param('id')id:string){return this.s.detail(r.auth!.userId,id);}
 @Get('staff/topups') staff(@Req()r:AuthRequest){return this.s.topups(r.auth!.userId,true);}
 @Post('staff/topups/:id') decide(@Req()r:AuthRequest,@Param('id')id:string,@Body()b:DecisionDto){return this.s.decide(r.auth!.userId,id,b);}
 @Get('cards') cards(@Req()r:AuthRequest){return this.s.cards(r.auth!.userId);}
 @Post('cards') card(@Req()r:AuthRequest,@Body()b:CardDto){return this.s.card(r.auth!.userId,b);}
 @Delete('cards/:id') remove(@Req()r:AuthRequest,@Param('id')id:string){return this.s.removeCard(r.auth!.userId,id);}
 @Get('coupons') coupons(){return this.s.coupons();}
 @Post('coupons/quote') quote(@Req()r:AuthRequest,@Body()b:QuoteDto){return this.s.quote(r.auth!.userId,b);}
 @Post('staff/coupons') coupon(@Req()r:AuthRequest,@Body()b:CouponDto){return this.s.coupon(r.auth!.userId,b);}
 @Delete('staff/coupons/:code') disable(@Req()r:AuthRequest,@Param('code')code:string){return this.s.disable(r.auth!.userId,code);}
}
@Module({imports:[AuthModule],providers:[PaymentsService],controllers:[PaymentsController]})
export class PaymentsModule {}
