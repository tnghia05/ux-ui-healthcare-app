import {createHash, randomUUID} from 'node:crypto';
import mongoose from 'mongoose';

const email='admin@gmail.com';
const uri=process.env.MONGODB_URI;
if(!uri||new URL(uri).pathname!=='/uxui')throw new Error('Expected UX_UI application database');
const connection=await mongoose.createConnection(uri).asPromise();
try{
 const db=connection.db;
 const user=await db.collection('users').findOne({email},{projection:{_id:1,name:1,birthDate:1}});
 if(!user)throw new Error('Admin account not found');
 const userId=String(user._id);
 const healthSamples=[
  {kind:'allergy',name:'Penicillin',notes:'Phản ứng ghi nhận: phát ban',date:'2026-10-10'},
  {kind:'condition',name:'Viêm mũi dị ứng',notes:'Ghi nhận từ năm 2024',date:'2024-06-15'},
  {kind:'vaccination',name:'Vắc xin cúm mùa',notes:'Bản ghi mẫu để xem giao diện',date:'2026-09-15',dose:'Mũi 1',facility:'Bệnh viện Đà Nẵng'},
  {kind:'vaccination',name:'Vắc xin viêm gan B',notes:'Bản ghi mẫu để xem giao diện',date:'2025-04-20',dose:'Mũi 3',facility:'Trung tâm Y tế Hải Châu'},
 ];
 const now=new Date();
 for(const sample of healthSamples){
  const {kind,name,notes,date}=sample;
  await db.collection('health_info').updateOne(
   {userId,kind,name,source:'coursework_sample'},
   {$setOnInsert:{id:new mongoose.Types.ObjectId().toHexString(),userId,kind,name,notes,date,facility:sample.facility??null,dose:sample.dose??null,source:'coursework_sample',verified:false,version:1,idempotencyKey:randomUUID(),createdAt:now,updatedAt:now}},
   {upsert:true},
  );
 }
 const cardNumber='DEMO20260001';
 await db.collection('insurance_cards').updateOne(
  {userId,cardHash:createHash('sha256').update(cardNumber).digest('hex')},
  {$setOnInsert:{id:new mongoose.Types.ObjectId().toHexString(),userId,cardNumber,cardHash:createHash('sha256').update(cardNumber).digest('hex'),holderName:user.name||'Admin',birthDate:user.birthDate||'2005-11-07',validTo:'2027-12-31',registeredFacility:'Bệnh viện Đà Nẵng',documentId:null,idempotencyKey:randomUUID(),source:'coursework_sample',verified:false,version:1,createdAt:now,updatedAt:now}},
  {upsert:true},
 );
 console.log(JSON.stringify({email,insurance:await db.collection('insurance_cards').countDocuments({userId}),allergiesAndConditions:await db.collection('health_info').countDocuments({userId,kind:{$in:['allergy','condition']}}),vaccinations:await db.collection('health_info').countDocuments({userId,kind:'vaccination'})}));
}finally{await connection.close();}
