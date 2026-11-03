import {BadRequestException,Body,ConflictException,Controller,ForbiddenException,Get,Inject,Injectable,Module,NotFoundException,Param,Post,Query,Req,UseGuards} from '@nestjs/common';
import {InjectConnection} from '@nestjs/mongoose';
import type {Connection} from 'mongoose';
import {Types} from 'mongoose';
import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {IsIn,IsInt,IsOptional,IsString,IsUUID,Matches,MaxLength} from 'class-validator';
import {AuthModule,SessionGuard} from '../auth/auth.module.js';
import type {AuthRequest} from '../auth/auth.module.js';
import {addDays,vnDate} from './booking.module.js';

const labTimes=['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00'];

export const labTests=[
 {id:'general',name:'Gói xét nghiệm tổng quát',category:'general',amountVnd:650000,description:'3 nhóm chỉ số · Lấy mẫu máu',items:['Công thức máu','Đường huyết','Mỡ máu']},
 {id:'glucose',name:'Xét nghiệm đường huyết',category:'general',amountVnd:120000,description:'Chỉ số đường huyết · Lấy mẫu máu',items:['Đường huyết']},
 {id:'liver',name:'Gói chức năng gan',category:'advanced',amountVnd:300000,description:'Các chỉ số chức năng gan',items:['Các chỉ số chức năng gan']},
] as const;
const labHospitals=['vinmec-da-nang','hoan-my-da-nang','gia-dinh-da-nang'];
class LabOptionsDto {
 @IsIn(labTests.map(t=>t.id)) testId!:string;
 @IsOptional() @IsIn(labHospitals) hospitalId?:string;
 @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) date?:string;
}
class LabBookDto extends LabOptionsDto {
 @IsIn(labHospitals) declare hospitalId:string;
 @Matches(/^\d{4}-\d{2}-\d{2}$/) declare date:string;
 @IsIn(labTimes) time!:string;
 @IsIn(['facility']) method!:string;
 @IsInt() expectedAmountVnd!:number;
 @IsUUID('4') idempotencyKey!:string;
}
class LabSearchDto {@IsOptional() @IsString() @MaxLength(100) q?:string; @IsOptional() @IsIn(['all','general','advanced']) category?:string;}
class LabProgressDto {@IsIn(['confirmed','sample_received','analysing']) expectedStatus!:string; @IsIn(['sample_received','analysing']) status!:string;}
@Injectable()
export class LabService {
 constructor(@InjectConnection() private readonly connection:Connection){}
 private db(){if(!this.connection.db)throw new Error('Database unavailable');return this.connection.db;}
 async onModuleInit(){await this.db().collection('lab_bookings').createIndex({userId:1,idempotencyKey:1},{unique:true});await this.db().collection('lab_bookings').createIndex({hospitalId:1,startsAt:1},{unique:true});await this.db().collection('lab_results').createIndex({userId:1,bookingId:1},{unique:true});}
 catalog(q='',category='all'){const search=q.trim().toLocaleLowerCase('vi-VN');return {items:labTests.filter(t=>(category==='all'||t.category===category)&&t.name.toLocaleLowerCase('vi-VN').includes(search)),source:'internal-reference-catalog'};}
 private date(date:string){const d=Date.parse(date+'T00:00:00Z');if(!Number.isFinite(d)||new Date(d).toISOString().slice(0,10)!==date||date<vnDate()||date>addDays(vnDate(),30))throw new BadRequestException('Chọn ngày hợp lệ trong 30 ngày tới');}
 async options(input:LabOptionsDto){const date=input.date??vnDate();this.date(date);const test=labTests.find(t=>t.id===input.testId);if(!test)throw new NotFoundException('Không có gói xét nghiệm');const hospitals=await this.db().collection('hospitals').find({id:{$in:labHospitals},active:true},{projection:{_id:0,id:1,name:1,address:1,imageKey:1,coordinates:1}}).toArray();hospitals.sort((a,b)=>labHospitals.indexOf(a.id)-labHospitals.indexOf(b.id));const hospitalId=input.hospitalId??hospitals[0]?.id;const booked=await this.db().collection('lab_bookings').find({hospitalId,startsAt:{$gte:new Date(date+'T00:00:00+07:00'),$lt:new Date(addDays(date,1)+'T00:00:00+07:00')}},{projection:{startsAt:1}}).toArray();return {test,hospitals,hospitalId,date,today:vnDate(),lastDate:addDays(vnDate(),30),idempotencyKey:randomUUID(),slots:labTimes.map(time=>({time,available:new Date(`${date}T${time}:00+07:00`).getTime()>Date.now()+3600000&&!booked.some(b=>new Date(b.startsAt).getTime()===new Date(`${date}T${time}:00+07:00`).getTime())}))};}
 async create(userId:string,input:LabBookDto){const hash=createHash('sha256').update(JSON.stringify({testId:input.testId,hospitalId:input.hospitalId,date:input.date,time:input.time,method:input.method,expectedAmountVnd:input.expectedAmountVnd})).digest('hex');const previous=await this.db().collection('lab_bookings').findOne({userId,idempotencyKey:input.idempotencyKey});if(previous){if(previous.payloadHash!==hash)throw new ConflictException('Mã xác nhận đã dùng cho thông tin khác');return this.detail(userId,previous.id);}
  const option=await this.options(input);const hospital=option.hospitals.find(h=>h.id===input.hospitalId);if(!hospital)throw new NotFoundException('Cơ sở chưa khả dụng');if(!option.slots.some(s=>s.time===input.time&&s.available)){const committed=await this.db().collection('lab_bookings').findOne({userId,idempotencyKey:input.idempotencyKey});if(committed&&committed.payloadHash===hash)return this.detail(userId,committed.id);throw new ConflictException('Giờ lấy mẫu không còn trống');}if(input.expectedAmountVnd!==option.test.amountVnd)throw new ConflictException('Giá đã thay đổi. Vui lòng xem lại');const user=await this.db().collection('users').findOne({_id:new Types.ObjectId(userId)});if(!user?.name||!user?.phone)throw new BadRequestException('Hoàn thiện tên và số điện thoại trong hồ sơ trước khi đặt');
  const id=new Types.ObjectId().toHexString();try{await this.db().collection('lab_bookings').insertOne({id,userId,idempotencyKey:input.idempotencyKey,payloadHash:hash,code:'XN'+randomBytes(5).toString('hex').toUpperCase(),testId:option.test.id,testName:option.test.name,hospitalId:hospital.id,hospitalName:hospital.name,hospitalAddress:hospital.address,startsAt:new Date(`${input.date}T${input.time}:00+07:00`),method:'facility',amountVnd:option.test.amountVnd,paymentStatus:'unpaid',patient:{name:user.name,phone:user.phone},status:'confirmed',history:[{status:'confirmed',at:new Date()}],createdAt:new Date(),source:'internal-reference-schedule'});}catch(e){if(e&&typeof e==='object'&&'code' in e&&e.code===11000){const committed=await this.db().collection('lab_bookings').findOne({userId,idempotencyKey:input.idempotencyKey});if(committed&&committed.payloadHash===hash)return this.detail(userId,committed.id);throw new ConflictException('Giờ lấy mẫu vừa được đặt. Chọn giờ khác');}throw e;}return this.detail(userId,id);
 }
 async detail(userId:string,id:string){const item=await this.db().collection('lab_bookings').findOne({id,userId},{projection:{_id:0,userId:0,idempotencyKey:0,payloadHash:0,'history.actor':0}});if(!item)throw new NotFoundException('Không tìm thấy lịch xét nghiệm');return item;}
 async result(userId:string,id:string){const booking=await this.db().collection('lab_bookings').findOne({id,userId},{projection:{_id:0,id:1,code:1,testName:1,hospitalName:1,startsAt:1,status:1}});if(!booking)throw new NotFoundException('Không tìm thấy lịch xét nghiệm');const result=await this.db().collection('lab_results').findOne({bookingId:id,userId},{projection:{_id:0,userId:0}});if(!result)throw new NotFoundException('Lịch xét nghiệm chưa có kết quả');return {booking,result};}
 async results(userId:string){const results=await this.db().collection('lab_results').find({userId},{projection:{_id:0,bookingId:1,code:1,collectedAt:1,reportedAt:1,verified:1,source:1,groups:1}}).sort({reportedAt:-1}).limit(100).toArray();const bookings=await this.db().collection('lab_bookings').find({userId,id:{$in:results.map(result=>result.bookingId)}},{projection:{_id:0,id:1,hospitalName:1}}).toArray();const names=new Map(bookings.map(booking=>[booking.id,booking.hospitalName]));return {items:results.flatMap(result=>(result.groups??[]).map((group:{name:string})=>({bookingId:result.bookingId,code:result.code,groupName:group.name,hospitalName:names.get(result.bookingId)??'',collectedAt:result.collectedAt,reportedAt:result.reportedAt,verified:result.verified,source:result.source})))};}
 async list(userId:string){return {items:await this.db().collection('lab_bookings').find({userId},{projection:{_id:0,userId:0,idempotencyKey:0,payloadHash:0,'history.actor':0}}).sort({createdAt:-1}).limit(50).toArray()};}
 private async admin(userId:string){if(!await this.db().collection('users').findOne({_id:new Types.ObjectId(userId),role:'admin',disabledAt:{$exists:false}}))throw new ForbiddenException('Chỉ quản trị viên được cập nhật');}
 async staff(userId:string){await this.admin(userId);return {items:await this.db().collection('lab_bookings').find({status:{$in:['confirmed','sample_received','analysing']}},{projection:{_id:0,userId:0,idempotencyKey:0,payloadHash:0,'patient.phone':0}}).sort({startsAt:1}).limit(100).toArray()};}
 async progress(userId:string,id:string,input:LabProgressDto){await this.admin(userId);const next:Record<string,string>={confirmed:'sample_received',sample_received:'analysing'};if(next[input.expectedStatus]!==input.status)throw new BadRequestException('Thứ tự xử lý không hợp lệ');const item=await this.db().collection('lab_bookings').findOneAndUpdate({id,status:input.expectedStatus},{$set:{status:input.status},$push:{history:{status:input.status,at:new Date(),actor:userId}}} as never,{returnDocument:'after',projection:{_id:0,userId:0,idempotencyKey:0,payloadHash:0,'history.actor':0}});if(!item)throw new ConflictException('Trạng thái đã thay đổi. Vui lòng tải lại');return {id:item.id,status:item.status};}
}
@UseGuards(SessionGuard) @Controller('labs')
class LabController {
 constructor(@Inject(LabService)private readonly service:LabService){}
 @Get('tests') catalog(@Query()q:LabSearchDto){return this.service.catalog(q.q,q.category);}
 @Get('options') options(@Query()q:LabOptionsDto){return this.service.options(q);}
 @Get('bookings') list(@Req()r:AuthRequest){return this.service.list(r.auth!.userId);}
 @Get('results') results(@Req()r:AuthRequest){return this.service.results(r.auth!.userId);}
 @Post('bookings') create(@Req()r:AuthRequest,@Body()b:LabBookDto){return this.service.create(r.auth!.userId,b);}
 @Get('bookings/:id') detail(@Req()r:AuthRequest,@Param('id')id:string){return this.service.detail(r.auth!.userId,id);}
 @Get('bookings/:id/result') result(@Req()r:AuthRequest,@Param('id')id:string){return this.service.result(r.auth!.userId,id);}
 @Get('staff') staff(@Req()r:AuthRequest){return this.service.staff(r.auth!.userId);}
 @Post('staff/:id') progress(@Req()r:AuthRequest,@Param('id')id:string,@Body()b:LabProgressDto){return this.service.progress(r.auth!.userId,id,b);}
}
@Module({imports:[AuthModule],providers:[LabService],controllers:[LabController]})
export class LabModule {}
