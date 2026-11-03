import { BadRequestException,Controller,Delete,Get,Inject,Injectable,Module,NotFoundException,Param,Put,Query,Req,UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiBearerAuth,ApiTags } from '@nestjs/swagger';
import { IsIn,IsOptional,IsString,MaxLength } from 'class-validator';
import type { Connection } from 'mongoose';
import { AuthModule,SessionGuard } from '../auth/auth.module.js';
import type { AuthRequest } from '../auth/auth.module.js';
import { packages } from '../booking/booking.module.js';
import { doctors,hospitals } from './catalog.js';
export class SearchDto {
 @IsOptional() @IsString() @MaxLength(100) q?:string;
 @IsOptional() @IsIn(['all','doctor','hospital']) type?:string;
 @IsOptional() @IsString() @MaxLength(60) specialty?:string;
 @IsOptional() @IsIn(['all','high','4','3.5','3','2.5']) ratingBand?:string;
 @IsOptional() @IsIn(['true','false']) favoritesOnly?:string;
}
export const fold=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
@Injectable()
export class DiscoveryService {
 constructor(@InjectConnection() private readonly connection:Connection){}
 private db(){if(!this.connection.db)throw new Error('Database unavailable');return this.connection.db;}
 async onModuleInit(){
  for(const name of ['hospitals','doctors'])await this.db().collection(name).createIndex({id:1},{unique:true});
  await this.db().collection('favorites').createIndex({userId:1,type:1,itemId:1},{unique:true});
  await this.db().collection('appointments').createIndex({userId:1,status:1,startsAt:1});
  for(const [name,rows] of [['hospitals',hospitals],['doctors',doctors]] as const)for(const row of rows)await this.db().collection(name).updateOne({id:row.id},{$setOnInsert:row},{upsert:true});
  for(const row of hospitals)if(row.coordinates)await this.db().collection('hospitals').updateOne({id:row.id},{$set:{coordinates:row.coordinates}});
 }
 async search(userId:string,input:SearchDto){
  const [hs,ds,fs]=await Promise.all([this.db().collection('hospitals').find({active:true},{projection:{_id:0,active:0}}).limit(100).toArray(),this.db().collection('doctors').find({active:true},{projection:{_id:0,active:0}}).limit(100).toArray(),this.db().collection('favorites').find({userId},{projection:{type:1,itemId:1}}).toArray()]);
  const terms=fold(input.q?.trim()??'').split(/\s+/).filter(Boolean);const spec=fold(input.specialty??'');
  const filtered=(rows:typeof hs,type:string)=>rows.filter(row=>{
   const content=fold([row.name,row.city,row.address,row.specialty,...(row.specialties??[])].join(' '));
   const favorite=fs.some(f=>f.type===type&&f.itemId===row.id);
   const specialties=[row.specialty,...(row.specialties??[])].filter(Boolean).map(fold);
   const band=input.ratingBand;
   const ratingMatches=!band||band==='all'||(band==='high'?row.rating>=4.5:row.rating>=Number(band)&&row.rating<Number(band)+0.5);
   return terms.every(t=>content.includes(t))&&(!spec||specialties.includes(spec))&&ratingMatches&&(input.favoritesOnly!=='true'||favorite);
  }).sort((a,b)=>Number(b.rating)-Number(a.rating)).map(row=>({...row,favorite:fs.some(f=>f.type===type&&f.itemId===row.id)}));
  return {hospitals:input.type==='doctor'?[]:filtered(hs,'hospital'),doctors:input.type==='hospital'?[]:filtered(ds,'doctor')};
 }
 async detail(userId:string,type:string,id:string):Promise<Record<string,unknown>&{favorite:boolean}>{if(!['doctor','hospital'].includes(type)||!/^[a-z0-9-]{1,80}$/.test(id))throw new BadRequestException('Mã không hợp lệ');const item=await this.db().collection(type==='doctor'?'doctors':'hospitals').findOne({id,active:true},{projection:{_id:0,active:0}});if(!item)throw new NotFoundException('Không tìm thấy thông tin');const favorite=!!await this.db().collection('favorites').findOne({userId,type,itemId:id});const canChat=type==='doctor'&&!!await this.db().collection('appointments').findOne({userId,doctorId:id,packageId:{$in:['phone','video']},status:'completed'},{projection:{_id:1}});return {...item,favorite,...(type==='doctor'?{canChat}:{})};}
 async hospitalContent(userId:string,id:string){
  const hospital=await this.detail(userId,'hospital',id);
  const clinicians=await this.db().collection('doctors').find({hospitalId:id,active:true},{projection:{_id:0,active:0}}).sort({name:1}).limit(100).toArray();
  const favorites=await this.db().collection('favorites').find({userId,type:'doctor'},{projection:{itemId:1}}).toArray();
  const bookings=await this.db().collection('appointments').find({userId,hospitalId:id,status:'completed'},{projection:{id:1,startsAt:1}}).limit(1000).toArray();
  const ownReviews=await this.db().collection('care_reviews').find({userId,target:'hospital',bookingId:{$in:bookings.map(b=>b.id)}},{projection:{_id:0,userId:0,payloadHash:0}}).sort({createdAt:-1}).limit(100).toArray();
  const gallery=id==='vinmec-da-nang'?['f3_imgNhBiaBnhVin','f3_imgNhThuNh1','f3_imgNhThuNh2','f3_imgNhThuNh3']:[hospital.imageKey];
  return {hospital,doctors:clinicians.map(d=>({...d,favorite:favorites.some(f=>f.itemId===d.id)})),services:clinicians.length?packages.filter(p=>p.enabled):[],specialties:hospital.specialties,gallery,ownReviews,reviewScope:'own',source:'group-figma-and-local-app',canBook:clinicians.length>0};
 }
 async favorite(userId:string,type:string,id:string,selected:boolean){await this.detail(userId,type,id);if(selected)await this.db().collection('favorites').updateOne({userId,type,itemId:id},{$setOnInsert:{userId,type,itemId:id,createdAt:new Date()}},{upsert:true});else await this.db().collection('favorites').deleteOne({userId,type,itemId:id});return {favorite:selected};}
 async home(userId:string){const catalog=await this.search(userId,{});const appointments=await this.db().collection('appointments').find({userId,$or:[{status:{$in:['confirmed','paid']},startsAt:{$gte:new Date()}},{status:{$in:['checked_in','in_consultation']}}]},{projection:{_id:0,userId:0}}).sort({startsAt:1}).limit(5).toArray();return {...catalog,appointments,services:['Nội khoa','Tim mạch','Xét nghiệm']};}
}
@ApiTags('discovery') @ApiBearerAuth() @UseGuards(SessionGuard) @Controller('discovery')
export class DiscoveryController {
 constructor(@Inject(DiscoveryService)private readonly service:DiscoveryService){}
 @Get('home') home(@Req() req:AuthRequest){return this.service.home(req.auth!.userId);}
 @Get('search') search(@Req() req:AuthRequest,@Query() query:SearchDto){return this.service.search(req.auth!.userId,query);}
 @Get('hospital/:id/content') hospitalContent(@Req()req:AuthRequest,@Param('id')id:string){return this.service.hospitalContent(req.auth!.userId,id);}
 @Get(':type/:id') detail(@Req() req:AuthRequest,@Param('type') type:string,@Param('id') id:string){return this.service.detail(req.auth!.userId,type,id);}
 @Put(':type/:id/favorite') favorite(@Req() req:AuthRequest,@Param('type') type:string,@Param('id') id:string){return this.service.favorite(req.auth!.userId,type,id,true);}
 @Delete(':type/:id/favorite') unfavorite(@Req() req:AuthRequest,@Param('type') type:string,@Param('id') id:string){return this.service.favorite(req.auth!.userId,type,id,false);}
}
@Module({imports:[AuthModule],providers:[DiscoveryService],controllers:[DiscoveryController]})
export class DiscoveryModule{}


