import {BadRequestException,Body,ConflictException,Controller,ForbiddenException,Get,HttpCode,HttpException,Inject,Injectable,Module,NotFoundException,Param,Post,Req,UseGuards} from '@nestjs/common';
import {InjectConnection} from '@nestjs/mongoose';
import type {Connection} from 'mongoose';
import {randomUUID} from 'node:crypto';
import {Equals,IsString,IsUUID,MaxLength,MinLength} from 'class-validator';
import {AuthModule,SessionGuard} from '../auth/auth.module.js';
import type {AuthRequest} from '../auth/auth.module.js';
import {AiProviderError,GeminiService} from './gemini.service.js';
import type {AiHistory} from './gemini.service.js';
import {AiGroundingService} from './ai-grounding.service.js';

class AiSendDto {
 @IsString() @MinLength(1) @MaxLength(2000) text!:string;
 @IsUUID('4') idempotencyKey!:string;
 @Equals(true) consent!:boolean;
}
@Injectable()
export class AiChatService {
 constructor(@InjectConnection()private readonly connection:Connection,@Inject(GeminiService)private readonly gemini:GeminiService,@Inject(AiGroundingService)private readonly grounding:AiGroundingService){}
 private db(){if(!this.connection.db)throw new Error('Database unavailable');return this.connection.db;}
 async onModuleInit(){await this.db().collection('ai_chat_rooms').createIndex({userId:1,doctorId:1},{unique:true});await this.db().collection('ai_chat_turns').createIndex({userId:1,doctorId:1,idempotencyKey:1},{unique:true});await this.db().collection('ai_chat_turns').createIndex({userId:1,doctorId:1,seq:1},{unique:true});}
 private async doctor(id:string){if(!/^[a-z0-9-]{1,80}$/.test(id))throw new NotFoundException('Không tìm thấy bác sĩ');const d=await this.db().collection('doctors').findOne({id,active:true},{projection:{_id:0,id:1,name:1,specialty:1,imageKey:1}});if(!d)throw new NotFoundException('Không tìm thấy bác sĩ');return d;}
 private async eligible(userId:string,doctorId:string){const appointment=await this.db().collection('appointments').findOne({userId,doctorId,packageId:{$in:['phone','video']},status:'completed'},{projection:{_id:1}});if(!appointment)throw new ForbiddenException('Chỉ nhắn tin được với bác sĩ sau khi hoàn thành tư vấn online');}
 private async expire(userId:string,doctorId:string){const now=new Date();await this.db().collection('ai_chat_turns').updateMany({userId,doctorId,status:'pending',expiresAt:{$lte:now}},{$set:{status:'failed',error:'unavailable'}});}
 async list(userId:string){const doctorIds=await this.db().collection('appointments').distinct('doctorId',{userId,packageId:{$in:['phone','video']},status:'completed'});const doctors=await this.db().collection('doctors').find({id:{$in:doctorIds},active:true},{projection:{_id:0,id:1,name:1,specialty:1,imageKey:1}}).limit(30).toArray();const items=[];for(const doctor of doctors){await this.expire(userId,doctor.id);const last=await this.db().collection('ai_chat_turns').findOne({userId,doctorId:doctor.id},{sort:{seq:-1},projection:{_id:0,text:1,reply:1,status:1,createdAt:1}});const room=await this.db().collection('ai_chat_rooms').findOne({userId,doctorId:doctor.id});items.push({...doctor,last:last??null,unread:last?.reply&&room?.readSeq<(room?.lastSeq??0)?1:0});}return {configured:this.gemini.configured(),items};}
 async thread(userId:string,doctorId:string){const doctor=await this.doctor(doctorId);await this.eligible(userId,doctorId);await this.expire(userId,doctorId);const rows=await this.db().collection('ai_chat_turns').find({userId,doctorId},{projection:{_id:0,userId:0,doctorId:0,attempt:0,expiresAt:0}}).sort({seq:-1}).limit(50).toArray();return {doctor,configured:this.gemini.configured(),turns:rows.reverse()};}
 async read(userId:string,doctorId:string){await this.doctor(doctorId);await this.eligible(userId,doctorId);const last=await this.db().collection('ai_chat_turns').findOne({userId,doctorId,status:'completed'},{sort:{seq:-1}});if(last)await this.db().collection('ai_chat_rooms').updateOne({userId,doctorId},{$max:{readSeq:last.seq}});return {read:true};}
 async send(userId:string,doctorId:string,b:AiSendDto){const doctor=await this.doctor(doctorId),text=b.text.trim();await this.eligible(userId,doctorId);if(!text)throw new BadRequestException('Nhập tin nhắn trước khi gửi');if(b.consent!==true)throw new BadRequestException('Cần đồng ý gửi nội dung tới Gemini');if(!this.gemini.configured())throw new ConflictException('Chat AI chưa được cấu hình Gemini API key');await this.expire(userId,doctorId);
  try{await this.db().collection('ai_chat_rooms').updateOne({userId,doctorId},{$setOnInsert:{lastSeq:0,readSeq:0,createdAt:new Date()}},{upsert:true});}catch(e){if(!(e&&typeof e==='object'&&'code'in e&&e.code===11000))throw e;}
  const session=await this.connection.startSession();let launch=false,seq=0;const attempt=randomUUID();
  try{await session.withTransaction(async()=>{launch=false;const turns=this.db().collection('ai_chat_turns'),old=await turns.findOne({userId,doctorId,idempotencyKey:b.idempotencyKey},{session});if(old&&old.text!==text)throw new ConflictException('Mã gửi đã dùng cho nội dung khác');if(old&&old.status!=='failed'){seq=old.seq;return;}if(old){const latest=await turns.findOne({userId,doctorId},{session,sort:{seq:-1}});if(latest?.seq!==old.seq)throw new ConflictException('Chỉ thử lại được tin gần nhất');}
   const now=new Date();if(await turns.countDocuments({userId,createdAt:{$gte:new Date(Date.now()-60000)}},{session})>=10)throw new HttpException('Bạn gửi quá nhanh. Vui lòng chờ một phút',429);
   const room=await this.db().collection('ai_chat_rooms').findOneAndUpdate({userId,doctorId,$or:[{pendingUntil:{$exists:false}},{pendingUntil:{$lte:now}}]},{$set:{pendingUntil:new Date(Date.now()+60000),attempt},...(!old?{$inc:{lastSeq:1}}:{})},{session,returnDocument:'after'});if(!room)throw new ConflictException('AI đang trả lời tin trước. Vui lòng chờ');seq=old?.seq??room.lastSeq;
   const values={status:'pending',attempt,expiresAt:new Date(Date.now()+60000),error:null,reply:null};if(old){if(old.attempts>=3)throw new ConflictException('Đã thử lại nhiều lần. Hãy gửi một tin mới sau');await turns.updateOne({_id:old._id},{$set:values,$inc:{attempts:1}},{session});}else await turns.insertOne({userId,doctorId,idempotencyKey:b.idempotencyKey,seq,text,createdAt:now,consentAt:now,consentVersion:1,attempts:1,...values},{session});launch=true;
  });}finally{await session.endSession();}
  if(launch)void this.generate(userId,doctorId,seq,attempt,String(doctor.specialty)).catch(()=>{});
  return {seq,accepted:true};
 }
 private async generate(userId:string,doctorId:string,seq:number,attempt:string,specialty:string){try{
   const prior=await this.db().collection('ai_chat_turns').find({userId,doctorId,seq:{$lt:seq},status:'completed'}).sort({seq:-1}).limit(10).toArray();const current=await this.db().collection('ai_chat_turns').findOne({userId,doctorId,seq,attempt,status:'pending'});if(!current)return;
   const history:AiHistory=prior.reverse().flatMap(t=>[{role:'user' as const,parts:[{text:t.text}]},{role:'model' as const,parts:[{text:t.reply}]}]);history.push({role:'user',parts:[{text:current.text}]});
   const context=await this.grounding.retrieve();
   await this.db().collection('ai_chat_turns').updateOne({userId,doctorId,seq,attempt,status:'pending'},{$set:{grounding:{source:'mongodb',retrievedAt:context.retrievedAt,doctorIds:context.doctors.map(d=>d.id),hospitalIds:context.hospitals.map(h=>h.id),serviceIds:context.services.map(s=>s.id)}}});
   const reply=await this.gemini.reply(specialty,history,context);await this.db().collection('ai_chat_turns').updateOne({userId,doctorId,seq,attempt,status:'pending'},{$set:{reply,status:'completed',repliedAt:new Date(),error:null}});
  }catch(e){await this.db().collection('ai_chat_turns').updateOne({userId,doctorId,seq,attempt,status:'pending'},{$set:{status:'failed',error:e instanceof AiProviderError?e.reason:'unavailable'}});}finally{await this.db().collection('ai_chat_rooms').updateOne({userId,doctorId,attempt},{$unset:{pendingUntil:'',attempt:''}});}}
}
@UseGuards(SessionGuard) @Controller('ai-chat')
class AiChatController {
 constructor(@Inject(AiChatService)private readonly s:AiChatService){}
 @Get() list(@Req()r:AuthRequest){return this.s.list(r.auth!.userId);}
 @Get('key') key(){return {idempotencyKey:randomUUID()};}
 @Get(':doctorId') thread(@Req()r:AuthRequest,@Param('doctorId')id:string){return this.s.thread(r.auth!.userId,id);}
 @Post(':doctorId/read') read(@Req()r:AuthRequest,@Param('doctorId')id:string){return this.s.read(r.auth!.userId,id);}
 @Post(':doctorId/messages') @HttpCode(202) send(@Req()r:AuthRequest,@Param('doctorId')id:string,@Body()b:AiSendDto){return this.s.send(r.auth!.userId,id,b);}
}
@Module({imports:[AuthModule],providers:[GeminiService,AiGroundingService,AiChatService],controllers:[AiChatController]})
export class AiChatModule {}
