import {BadRequestException,Body,Controller,Delete,Get,Inject,Injectable,Module,NotFoundException,Param,Post,Query,Req,Res,UploadedFile,UseGuards,UseInterceptors,StreamableFile,ConflictException} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {InjectConnection} from '@nestjs/mongoose';import type {Connection} from 'mongoose';import {Types,mongo} from 'mongoose';
const {GridFSBucket,ObjectId}=mongo;import type {Response} from 'express';import {Readable} from 'node:stream';import {pipeline} from 'node:stream/promises';import {createHash,randomUUID} from 'node:crypto';
import {IsIn,IsOptional,IsString,IsUUID,Matches,MaxLength,MinLength} from 'class-validator';
import {AuthModule,SessionGuard} from '../auth/auth.module.js';import type {AuthRequest} from '../auth/auth.module.js';
import {vnDate} from './booking.module.js';
class UploadDto {
 @IsString() @MinLength(2) @MaxLength(120) title!:string;
 @IsIn(['lab','prescription','insurance','other']) category!:string;
 @Matches(/^\d{4}-\d{2}-\d{2}$/) documentDate!:string;
 @IsOptional() @Matches(/^[a-f0-9]{24}$/) visitId?:string;
 @IsUUID('4') idempotencyKey!:string;
}
class RecordQuery {@IsOptional() @IsString() @MaxLength(100) q?:string;@IsOptional() @IsIn(['all','lab','prescription','insurance','other']) category?:string;@IsOptional() @Matches(/^[a-f0-9]{24}$/) visitId?:string;}
type Uploaded={buffer:Buffer;originalname:string;mimetype:string;size:number};
@Injectable()
export class RecordsService {
 constructor(@InjectConnection()private readonly connection:Connection){}
 private db(){if(!this.connection.db)throw new Error('Database unavailable');return this.connection.db;}
 private bucket(){return new GridFSBucket(this.db(),{bucketName:'medical_files'});}
 async onModuleInit(){await this.db().collection('medical_documents').createIndex({userId:1,idempotencyKey:1},{unique:true});await this.db().collection('medical_documents').createIndex({userId:1,documentDate:-1});}
 async visits(userId:string){return {items:await this.db().collection('appointments').find({userId,status:'completed'},{projection:{_id:0,id:1,code:1,doctorName:1,hospitalName:1,packageName:1,startsAt:1,patient:1}}).sort({startsAt:-1}).limit(100).toArray()};}
 async visit(userId:string,id:string){const item=await this.db().collection('appointments').findOne({userId,id,status:'completed'},{projection:{_id:0,id:1,code:1,doctorName:1,hospitalName:1,packageName:1,startsAt:1,endsAt:1,patient:1,vitals:1,vitalsSource:1,source:1}});if(!item)throw new NotFoundException('Không tìm thấy lần khám đã hoàn thành');const note=await this.db().collection('aftercare_notes').findOne({userId,visitId:id},{projection:{_id:0,summary:1,conclusion:1,source:1,verified:1}});return {...item,clinicalNotes:note??null,vitals:item.vitals??null};}
 async documents(userId:string,q:RecordQuery){const items=await this.db().collection('medical_documents').find({userId,...(q.category&&q.category!=='all'?{category:q.category}:{}),...(q.visitId?{visitId:q.visitId}:{})},{projection:{_id:0,userId:0,fileId:0,idempotencyKey:0,payloadHash:0}}).sort({documentDate:-1,createdAt:-1}).limit(100).toArray();const search=q.q?.trim().toLocaleLowerCase('vi-VN');return {items:search?items.filter(i=>i.title.toLocaleLowerCase('vi-VN').includes(search)):items};}
 async document(userId:string,id:string){const item=await this.db().collection('medical_documents').findOne({userId,id},{projection:{_id:0,userId:0,fileId:0,idempotencyKey:0,payloadHash:0}});if(!item)throw new NotFoundException('Không tìm thấy tài liệu');return item;}
 async upload(userId:string,input:UploadDto,file?:Uploaded){
  if(!file?.buffer?.length)throw new BadRequestException('Chọn tệp trước khi lưu');if(file.size>10*1024*1024)throw new BadRequestException('Tệp tối đa 10 MB');
  const signature=file.buffer;const mime=signature.subarray(0,5).toString()==='%PDF-'?'application/pdf':signature.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':signature[0]===255&&signature[1]===216&&signature[2]===255?'image/jpeg':null;
  if(!mime||mime!==file.mimetype)throw new BadRequestException('Chỉ nhận PDF, JPG, PNG đúng định dạng');const title=input.title.trim();if(title.length<2)throw new BadRequestException('Nhập tên tài liệu');const date=Date.parse(input.documentDate+'T00:00:00Z');if(!Number.isFinite(date)||new Date(date).toISOString().slice(0,10)!==input.documentDate||input.documentDate>vnDate())throw new BadRequestException('Ngày tài liệu không hợp lệ hoặc ở tương lai');if(input.visitId)await this.visit(userId,input.visitId);
  const hash=createHash('sha256').update(file.buffer).update(JSON.stringify({title,category:input.category,date:input.documentDate,visitId:input.visitId??null})).digest('hex');const previous=await this.db().collection('medical_documents').findOne({userId,idempotencyKey:input.idempotencyKey});if(previous){if(previous.payloadHash!==hash)throw new ConflictException('Lần lưu này đã dùng cho tài liệu khác');return this.document(userId,previous.id);}
  const id=new Types.ObjectId().toHexString(),fileId=new ObjectId();const stream=this.bucket().openUploadStream(id,{id:fileId,metadata:{userId,mime}});await pipeline(Readable.from(file.buffer),stream);
  try{await this.db().collection('medical_documents').insertOne({id,userId,fileId,idempotencyKey:input.idempotencyKey,payloadHash:hash,title,category:input.category,documentDate:input.documentDate,visitId:input.visitId??null,mime,size:file.size,filename:id+(mime==='application/pdf'?'.pdf':mime==='image/png'?'.png':'.jpg'),source:'patient_upload',verified:false,createdAt:new Date()});}catch(e){await this.bucket().delete(fileId).catch(()=>{});if(e&&typeof e==='object'&&'code'in e&&e.code===11000){const committed=await this.db().collection('medical_documents').findOne({userId,idempotencyKey:input.idempotencyKey});if(committed?.payloadHash===hash)return this.document(userId,committed.id);throw new ConflictException('Lần lưu đã dùng cho tài liệu khác');}throw e;}
  return this.document(userId,id);
 }
 async content(userId:string,id:string,res:Response){const item=await this.db().collection('medical_documents').findOne({userId,id});if(!item)throw new NotFoundException('Không tìm thấy tài liệu');res.setHeader('Content-Type',item.mime);res.setHeader('Content-Disposition',`attachment; filename="${item.filename}"`);res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');return new StreamableFile(this.bucket().openDownloadStream(item.fileId));}
 async remove(userId:string,id:string){const item=await this.db().collection('medical_documents').findOne({userId,id});if(!item)throw new NotFoundException('Không tìm thấy tài liệu');await this.db().collection('medical_documents').deleteOne({userId,id});await this.bucket().delete(item.fileId);return {deleted:true};}
 async results(userId:string,q:RecordQuery){return this.documents(userId,{...q,category:'lab'});}
}
@UseGuards(SessionGuard) @Controller('records')
class RecordsController {
 constructor(@Inject(RecordsService)private readonly service:RecordsService){}
 @Get('upload-key') key(){return {idempotencyKey:randomUUID()};}
 @Get('visits') visits(@Req()r:AuthRequest){return this.service.visits(r.auth!.userId);}
 @Get('visits/:id') visit(@Req()r:AuthRequest,@Param('id')id:string){return this.service.visit(r.auth!.userId,id);}
 @Get('results') results(@Req()r:AuthRequest,@Query()q:RecordQuery){return this.service.results(r.auth!.userId,q);}
 @Get('documents') documents(@Req()r:AuthRequest,@Query()q:RecordQuery){return this.service.documents(r.auth!.userId,q);}
 @Post('documents') @UseInterceptors(FileInterceptor('file',{limits:{fileSize:10*1024*1024,files:1,fields:6,parts:7}})) upload(@Req()r:AuthRequest,@Body()b:UploadDto,@UploadedFile()f?:Uploaded){return this.service.upload(r.auth!.userId,b,f);}
 @Get('documents/:id/content') content(@Req()r:AuthRequest,@Param('id')id:string,@Res({passthrough:true})res:Response){return this.service.content(r.auth!.userId,id,res);}
 @Get('documents/:id') document(@Req()r:AuthRequest,@Param('id')id:string){return this.service.document(r.auth!.userId,id);}
 @Delete('documents/:id') remove(@Req()r:AuthRequest,@Param('id')id:string){return this.service.remove(r.auth!.userId,id);}
}
@Module({imports:[AuthModule],providers:[RecordsService],controllers:[RecordsController],exports:[RecordsService]})
export class RecordsModule {}
