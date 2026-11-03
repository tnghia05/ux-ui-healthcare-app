import {BadRequestException,Body,Controller,Get,HttpException,Inject,Injectable,Module,NotFoundException,Param,Post,Req,ServiceUnavailableException,UseGuards} from '@nestjs/common';
import {InjectConnection} from '@nestjs/mongoose';
import type {Connection} from 'mongoose';
import {Equals,IsNumber,Max,Min} from 'class-validator';
import {AuthModule,SessionGuard} from '../auth/auth.module.js';
import type {AuthRequest} from '../auth/auth.module.js';

type Point={latitude:number;longitude:number};
const valid=(p:Point)=>Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)&&Math.abs(p.latitude)<=85&&Math.abs(p.longitude)<=180;
class RouteDto {
 @IsNumber() @Min(-85) @Max(85) latitude!:number;
 @IsNumber() @Min(-180) @Max(180) longitude!:number;
 @Equals(true) consent!:boolean;
}
type OsrmStep={distance:number;name?:string;ref?:string;maneuver:{type:string;modifier?:string;exit?:number};exit?:number};
@Injectable()
export class RoadRoutingService {
 private lastRequest=0;
 async route(origin:Point,destination:Point){
  if(Date.now()-this.lastRequest<1100)throw new HttpException('Vui lòng chờ một chút trước khi tính lại đường',429);this.lastRequest=Date.now();
  const base=process.env.OSRM_BASE_URL||'https://routing.openstreetmap.de/routed-car';const parsed=new URL(base);if(parsed.protocol!=='https:'||parsed.username||parsed.password)throw new ServiceUnavailableException();
  const url=base.replace(/\/$/,'')+`/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson&steps=true&alternatives=false&radiuses=1000;1000`;
  let r:Response;try{r=await fetch(url,{headers:{'User-Agent':'UXUIHealthcare/1.0 (non-commercial coursework)','Accept':'application/json'},signal:AbortSignal.timeout(10000)});}catch{throw new ServiceUnavailableException();}
  if(!r.ok){await r.body?.cancel();throw new ServiceUnavailableException();}
  const body=await r.json(),route=body.routes?.[0];if(body.code!=='Ok'||!route)throw new BadRequestException('Không tìm thấy tuyến ô tô tới điểm đến');
  const coordinates=route.geometry?.coordinates;
  if(!Array.isArray(coordinates)||coordinates.length<2||coordinates.length>20000||!coordinates.every((p:unknown)=>Array.isArray(p)&&p.length===2&&valid({longitude:p[0],latitude:p[1]}))||!Number.isFinite(route.distance)||route.distance<0||!Number.isFinite(route.duration)||route.duration<0)throw new ServiceUnavailableException();
  const steps:OsrmStep[]=route.legs?.flatMap((l:{steps:OsrmStep[]})=>l.steps??[])??[];
  return {geometry:coordinates.map((p:number[])=>[p[1],p[0]]),distanceMeters:route.distance,durationSeconds:route.duration,steps:steps.slice(0,200).map(s=>({distanceMeters:Number.isFinite(s.distance)?s.distance:0,road:String(s.name||s.ref||'').slice(0,200),type:String(s.maneuver?.type||'continue').slice(0,40),modifier:String(s.maneuver?.modifier||'').slice(0,40),exit:s.maneuver?.exit??s.exit})),provider:'OSRM / FOSSGIS',mode:'driving',calculatedAt:new Date().toISOString()};
 }
}
@Injectable()
export class NavigationService {
 constructor(@InjectConnection()private readonly connection:Connection,@Inject(RoadRoutingService)private readonly roads:RoadRoutingService){}
 async destination(userId:string,id:string){if(!/^[a-f0-9]{24}$/.test(id)||!this.connection.db)throw new NotFoundException('Không tìm thấy lịch khám');const booking=await this.connection.db.collection('appointments').findOne({id,userId});if(!booking)throw new NotFoundException('Không tìm thấy lịch khám');const hospital=await this.connection.db.collection('hospitals').findOne({id:booking.hospitalId});return {bookingId:id,hospitalId:booking.hospitalId,hospitalName:booking.hospitalName,hospitalAddress:booking.hospitalAddress,coordinates:hospital?.coordinates&&valid(hospital.coordinates)?{latitude:hospital.coordinates.latitude,longitude:hospital.coordinates.longitude}:null,imageKey:hospital?.imageKey};}
 async route(userId:string,id:string,b:RouteDto){const destination=await this.destination(userId,id);if(!destination.coordinates)throw new BadRequestException('Bệnh viện chưa có tọa độ đã kiểm tra');if(!valid(b)||b.consent!==true)throw new BadRequestException('Cần đồng ý sử dụng vị trí để tính đường');return {...await this.roads.route(b,destination.coordinates),destination};}
}
@UseGuards(SessionGuard) @Controller('navigation')
class NavigationController {
 constructor(@Inject(NavigationService)private readonly s:NavigationService){}
 @Get(':id') destination(@Req()r:AuthRequest,@Param('id')id:string){return this.s.destination(r.auth!.userId,id);}
 @Post(':id/route') route(@Req()r:AuthRequest,@Param('id')id:string,@Body()b:RouteDto){return this.s.route(r.auth!.userId,id,b);}
}
@Module({imports:[AuthModule],providers:[NavigationService,RoadRoutingService],controllers:[NavigationController]})
export class NavigationModule {}
