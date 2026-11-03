import mongoose from 'mongoose';
import {randomUUID} from 'node:crypto';

const email=process.argv[2];
if(!email)throw new Error('Usage: node --env-file=apps/api/.env scripts/seed-figma-aftercare.mjs <account email>');
const uri=process.env.MONGODB_URI;
if(!uri||!['uxui','ux_ui'].includes(new URL(uri).pathname.slice(1)))throw new Error('Expected UX_UI application database');
const connection=await mongoose.createConnection(uri).asPromise(),db=connection.db;
try{
 const user=await db.collection('users').findOne({email},{projection:{_id:1,name:1}});if(!user)throw new Error('Account not found');
 const userId=String(user._id),now=new Date(),oid=()=>new mongoose.Types.ObjectId().toHexString();
 const video=await db.collection('appointments').findOne({userId,status:'completed',packageId:'video',completionSource:'demo_simulation'},{sort:{completedAt:-1}});
 if(!video)throw new Error('No completed video booking for this account');
 let second=await db.collection('appointments').findOne({userId,code:{$in:['DEMO-KH001302','KH001302']}});
 if(!second){
  const id=oid();await db.collection('appointments').insertOne({id,userId,code:'KH001302',doctorId:'nguyen-cong-canh',doctorName:'BS. Nguyễn Công Cảnh',imageKey:'m1_imgNhBacSi3',specialty:'Nhi khoa',hospitalId:'vinmec-da-nang',hospitalName:'Vinmec Đà Nẵng',hospitalAddress:'Đường 30 Tháng 4, Đà Nẵng',packageId:'standard',packageName:'Khám trực tiếp',status:'completed',startsAt:new Date('2026-08-28T03:00:00.000Z'),endsAt:new Date('2026-08-28T03:30:00.000Z'),paymentStatus:'unpaid',paymentMethod:'cash',amountVnd:0,discountVnd:0,durationMinutes:30,patient:{name:user.name||'Người khám',phone:'',gender:'not_specified',age:0,reason:'Khám trực tiếp'},completionSource:'figma_seed',completedAt:new Date('2026-08-28T03:30:00.000Z'),occupiesSlot:false,createdAt:now});second=await db.collection('appointments').findOne({id,userId});
 }else if(second.code!=='KH001302'){await db.collection('appointments').updateOne({id:second.id,userId},{$set:{code:'KH001302',completionSource:'figma_seed','patient.reason':'Khám trực tiếp'}});second.code='KH001302';}
 const notes=[
  {visitId:video.id,reason:'Đau tức ngực nhẹ, huyết áp cao',symptoms:'Hồi hộp, chóng mặt buổi sáng',summary:'Bệnh nhân có huyết áp dao động 135–140/85–90 mmHg trong 2 tuần. Không có dấu hiệu đau ngực khi gắng sức.',conclusion:'Tăng huyết áp độ 1, cần theo dõi tại nhà và dùng thuốc theo đơn. Hướng dẫn tiếp theo: đo huyết áp 2 lần/ngày, giảm muối, tái khám sau 4 tuần.',goal:'Huyết áp dưới 130/80 mmHg sau 8 tuần',tasks:[{title:'Giảm muối, tăng rau xanh',detail:'Dưới 5 g muối mỗi ngày',status:'in_progress'},{title:'Đo huyết áp 2 lần/ngày',detail:'Sáng sau khi thức dậy và tối trước khi ngủ',status:'in_progress'},{title:'Đi bộ 30 phút',detail:'5 buổi mỗi tuần',status:'not_started'},{title:'Tái khám',detail:'21/11/2026 · 09:00 với BS. Nguyễn Quốc Việt',status:'not_started'}]},
  {visitId:second.id,reason:'Khám trực tiếp',symptoms:'Theo dõi sức khỏe định kỳ',summary:'Tóm tắt lần khám ngày 28/08/2026.',conclusion:'Tiếp tục theo dõi theo lịch hẹn.',goal:'Theo dõi sức khỏe định kỳ',tasks:[{title:'Tái khám',detail:'Theo lịch hẹn tiếp theo',status:'not_started'}]}
 ];
 for(const note of notes){await db.collection('aftercare_notes').updateOne({userId,visitId:note.visitId},{$set:{...note,source:'figma_reference',verified:false,updatedAt:now},$setOnInsert:{userId,version:1,createdAt:now}},{upsert:true});}
 const med=(name,time,instructions,startDate,endDate)=>({id:oid(),name,dose:'1 viên',route:'Uống',instructions,startDate,endDate,times:[time]});
 const specs=[
  {oldCode:'DEMO-DT-VIDEO',code:'DT-2026-1020',visitId:video.id,doctorName:video.doctorName,imageKey:video.imageKey,issuedDate:'2026-10-20',archived:false,reminderEnabled:true,medications:[med('Amlodipine 5 mg','07:30','Sau bữa sáng','2026-10-20','2026-11-17'),med('Losartan 50 mg','19:30','Sau bữa tối','2026-10-20','2026-11-17'),med('Aspirin 81 mg','12:00','Sau bữa trưa, không uống khi đói','2026-10-20','2026-11-17')]},
  {oldCode:'DEMO-DT-2026-0828',code:'DT-2026-0828',visitId:second.id,doctorName:second.doctorName,imageKey:second.imageKey,issuedDate:'2026-08-28',archived:true,reminderEnabled:false,medications:[med('Thuốc theo đơn 1','08:00','','2026-08-28','2026-09-04'),med('Thuốc theo đơn 2','20:00','','2026-08-28','2026-09-04')]},
  {oldCode:'DEMO-DT-2026-0828-B',code:'DT-2026-0615',visitId:video.id,doctorName:video.doctorName,imageKey:video.imageKey,issuedDate:'2026-06-15',archived:true,reminderEnabled:false,medications:[med('Thuốc theo đơn 1','08:00','','2026-06-15','2026-06-20'),med('Thuốc theo đơn 2','12:00','','2026-06-15','2026-06-20'),med('Thuốc theo đơn 3','17:00','','2026-06-15','2026-06-20'),med('Thuốc theo đơn 4','20:00','','2026-06-15','2026-06-20')]}
 ];
 for(const p of specs){
  const existing=await db.collection('prescriptions').findOne({userId,code:{$in:[p.oldCode,p.code]}});
  const values={visitId:p.visitId,code:p.code,prescriber:p.doctorName,doctorName:p.doctorName,imageKey:p.imageKey,issuedDate:p.issuedDate,medications:p.medications.map((medicine,index)=>({...medicine,id:existing?.medications?.[index]?.id??medicine.id})),archived:p.archived,reminderEnabled:p.reminderEnabled,source:'figma_reference',verified:false,documentId:null};
  if(existing)await db.collection('prescriptions').updateOne({id:existing.id,userId},{$set:values});
  else await db.collection('prescriptions').insertOne({id:oid(),userId,...values,version:1,idempotencyKey:randomUUID(),createdAt:now});
 }
 const first=await db.collection('prescriptions').findOne({userId,code:'DT-2026-1020'}),today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const oldIntakes=await db.collection('medication_intakes').find({userId,prescriptionId:first.id}).toArray();
 await db.collection('medication_intakes').deleteMany({userId,prescriptionId:first.id,source:'demo_sample'});
 if(today>='2026-10-20'&&today<='2026-11-17'&&new Date(today+'T07:30:00+07:00')<now){const a=first.medications[0];await db.collection('medication_intakes').updateOne({userId,prescriptionId:first.id,medicationId:a.id,date:today,time:'07:30'},{$setOnInsert:{userId,prescriptionId:first.id,medicationId:a.id,date:today,time:'07:30',status:'taken',version:1,recordedAt:new Date(today+'T07:30:00+07:00'),snoozedUntil:null}},{upsert:true});}
 console.log(JSON.stringify({account:email,existingBooking:{id:video.id,code:video.code},completedVisits:2,prescriptions:specs.map(p=>p.code),priorIntakes:oldIntakes.length}));
}finally{await connection.close();}
