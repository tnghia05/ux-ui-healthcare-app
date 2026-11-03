import {BadRequestException,Body,ConflictException,Controller,Delete,Get,Inject,Injectable,Module,NotFoundException,Param,Patch,Post,Query,Req,UseGuards} from '@nestjs/common';import {InjectConnection} from '@nestjs/mongoose';import type {Connection} from 'mongoose';import {Types} from 'mongoose';import {createHash,randomUUID} from 'node:crypto';import {IsIn,IsInt,IsOptional,IsString,IsUUID,Matches,Max,MaxLength,Min,MinLength} from 'class-validator';import {AuthModule,SessionGuard} from '../auth/auth.module.js';import type {AuthRequest} from '../auth/auth.module.js';import {vnDate} from './booking.module.js';
class HealthDto {
 @IsIn(['allergy','condition','vaccination']) kind!:string;
 @IsString() @MinLength(2) @MaxLength(120) name!:string;
 @IsString() @MaxLength(500) notes!:string;
 @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) date?:string;
 @IsOptional() @IsString() @MaxLength(120) facility?:string;
 @IsOptional() @IsString() @MaxLength(40) dose?:string;
}
class CreateHealthDto extends HealthDto {@IsUUID('4') idempotencyKey!:string;}
class UpdateHealthDto extends HealthDto {@IsInt() @Min(1) @Max(1000000) expectedVersion!:number;}
class DeleteHealthDto {@IsInt() @Min(1) @Max(1000000) expectedVersion!:number;}
class HealthQuery {@IsOptional() @IsIn(['conditions']) scope?:string;@IsOptional() @IsIn(['allergy','condition','vaccination']) kind?:string;@IsOptional() @IsString() @MaxLength(100) q?:string;}
@Injectable()
export class HealthInfoService {
 constructor(@InjectConnection()private readonly connection:Connection){}
 private db(){if(!this.connection.db)throw new Error('Database unavailable');return this.connection.db;}
 async onModuleInit(){await this.db().collection('health_info').createIndex({userId:1,idempotencyKey:1},{unique:true});await this.db().collection('health_info').createIndex({userId:1,kind:1});}
 private payload(b:HealthDto){const name=b.name.trim(),notes=b.notes.trim();if(name.length<2)throw new BadRequestException('Tên cần ít nhất 2 ký tự');if(b.date){const d=Date.parse(b.date+'T00:00:00Z');if(!Number.isFinite(d)||new Date(d).toISOString().slice(0,10)!==b.date||b.date>vnDate())throw new BadRequestException('Ngày ghi nhận không hợp lệ hoặc ở tương lai');}if(b.kind==='vaccination'&&(!b.date||!b.dose?.trim()||!b.facility?.trim()))throw new BadRequestException('Nhập ngày tiêm, mũi tiêm và cơ sở');if(b.kind!=='vaccination'&&(b.dose||b.facility))throw new BadRequestException('Thông tin mũi tiêm chỉ dành cho tiêm chủng');return {kind:b.kind,name,notes,date:b.date??null,facility:b.kind==='vaccination'?b.facility!.trim():null,dose:b.kind==='vaccination'?b.dose!.trim():null};}
 async list(userId:string,q:HealthQuery){const items=await this.db().collection('health_info').find({userId,...(q.kind?{kind:q.kind}:q.scope==='conditions'?{kind:{$in:['allergy','condition']}}:{})},{projection:{_id:0,userId:0,idempotencyKey:0,payloadHash:0}}).sort({date:-1,updatedAt:-1}).limit(200).toArray();const search=q.q?.trim().toLocaleLowerCase('vi-VN');return {items:search?items.filter(i=>i.name.toLocaleLowerCase('vi-VN').includes(search)):items};}
 async detail(userId:string,id:string){const item=await this.db().collection('health_info').findOne({userId,id},{projection:{_id:0,userId:0,idempotencyKey:0,payloadHash:0}});if(!item)throw new NotFoundException('Không tìm thấy thông tin');return item;}
 async create(userId:string,b:CreateHealthDto){const payload=this.payload(b),hash=createHash('sha256').update(JSON.stringify(payload)).digest('hex');const previous=await this.db().collection('health_info').findOne({userId,idempotencyKey:b.idempotencyKey});if(previous){if(previous.payloadHash!==hash)throw new ConflictException('Mã lưu đã dùng cho thông tin khác');return this.detail(userId,previous.id);}const id=new Types.ObjectId().toHexString();try{await this.db().collection('health_info').insertOne({id,userId,...payload,idempotencyKey:b.idempotencyKey,payloadHash:hash,version:1,source:'self_reported',verified:false,createdAt:new Date(),updatedAt:new Date()});}catch(e){if(e&&typeof e==='object'&&'code'in e&&e.code===11000){const item=await this.db().collection('health_info').findOne({userId,idempotencyKey:b.idempotencyKey});if(item?.payloadHash===hash)return this.detail(userId,item.id);throw new ConflictException('Mã lưu đã dùng cho thông tin khác');}throw e;}return this.detail(userId,id);}
 async update(userId:string,id:string,b:UpdateHealthDto){const old=await this.detail(userId,id);if(old.kind!==b.kind)throw new BadRequestException('Không đổi loại bản ghi khi chỉnh sửa');const payload=this.payload(b);const updated=await this.db().collection('health_info').updateOne({userId,id,version:b.expectedVersion},{$set:{...payload,updatedAt:new Date()},$inc:{version:1}});if(!updated.matchedCount)throw new ConflictException('Thông tin đã thay đổi ở nơi khác. Tải lại trước khi sửa');return this.detail(userId,id);}
 async remove(userId:string,id:string,b:DeleteHealthDto){await this.detail(userId,id);const r=await this.db().collection('health_info').deleteOne({userId,id,version:b.expectedVersion});if(!r.deletedCount)throw new ConflictException('Thông tin đã thay đổi. Tải lại trước khi xóa');return {deleted:true};}
}
@Controller('health-info') @UseGuards(SessionGuard)
class HealthInfoController {
 constructor(@Inject(HealthInfoService)private readonly service:HealthInfoService){}
 @Get('key') key(){return {idempotencyKey:randomUUID()};}
 @Get() list(@Req()r:AuthRequest,@Query()q:HealthQuery){return this.service.list(r.auth!.userId,q);}
 @Get(':id') detail(@Req()r:AuthRequest,@Param('id')id:string){return this.service.detail(r.auth!.userId,id);}
 @Post() create(@Req()r:AuthRequest,@Body()b:CreateHealthDto){return this.service.create(r.auth!.userId,b);}
 @Patch(':id') update(@Req()r:AuthRequest,@Param('id')id:string,@Body()b:UpdateHealthDto){return this.service.update(r.auth!.userId,id,b);}
 @Delete(':id') remove(@Req()r:AuthRequest,@Param('id')id:string,@Body()b:DeleteHealthDto){return this.service.remove(r.auth!.userId,id,b);}
}
@Module({imports:[AuthModule],providers:[HealthInfoService],controllers:[HealthInfoController]})
export class HealthInfoModule {}
