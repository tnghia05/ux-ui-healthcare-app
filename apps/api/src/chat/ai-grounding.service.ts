import {Injectable} from '@nestjs/common';
import {InjectConnection} from '@nestjs/mongoose';
import type {Connection} from 'mongoose';

export type AiGrounding={retrievedAt:string;source:'mongodb';scope:'public-catalog';truncated:boolean;doctors:Record<string,unknown>[];hospitals:Record<string,unknown>[];services:Record<string,unknown>[]};
@Injectable()
export class AiGroundingService {
 constructor(@InjectConnection()private readonly connection:Connection){}
 async retrieve():Promise<AiGrounding>{
  if(!this.connection.db)throw new Error('Database unavailable');const db=this.connection.db;
  // Explicit public-field projections: never send user accounts, sessions or medical records to the provider.
  const [doctors,hospitals,services]=await Promise.all([
   db.collection('doctors').find({active:true},{projection:{_id:0,id:1,name:1,specialty:1,hospitalId:1,description:1,experienceYears:1,rating:1}}).sort({id:1}).limit(51).toArray(),
   db.collection('hospitals').find({active:true},{projection:{_id:0,id:1,name:1,address:1,city:1,specialties:1,description:1,website:1,rating:1,source:1}}).sort({id:1}).limit(51).toArray(),
   db.collection('service_catalog').find({active:true},{projection:{_id:0,id:1,name:1,description:1,hospitalId:1,amountVnd:1,source:1}}).sort({id:1}).limit(51).toArray(),
  ]);
  // Bound catalog context even if an administrator has imported unusually long descriptions.
  const clean=(rows:typeof doctors)=>rows.slice(0,50).map(row=>Object.fromEntries(Object.entries(row).map(([key,value])=>[key,typeof value==='string'?value.slice(0,1000):Array.isArray(value)?value.filter(v=>typeof v==='string').slice(0,15).map(v=>v.slice(0,100)):value])));
  return {retrievedAt:new Date().toISOString(),source:'mongodb',scope:'public-catalog',truncated:[doctors,hospitals,services].some(rows=>rows.length>50),doctors:clean(doctors),hospitals:clean(hospitals),services:clean(services)};
 }
}
