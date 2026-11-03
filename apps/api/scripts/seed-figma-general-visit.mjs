import mongoose from 'mongoose';

const email='admin@gmail.com';
const code='HS-001284';
const uri=process.env.MONGODB_URI;
if(!uri||new URL(uri).pathname!=='/uxui')throw new Error('Expected UX_UI application database');
const connection=await mongoose.createConnection(uri).asPromise();
try{
 const db=connection.db;
 const user=await db.collection('users').findOne({email},{projection:{_id:1}});
 if(!user)throw new Error('Account not found');
 const userId=String(user._id);
 const existing=await db.collection('appointments').findOne({userId,code});
 const id=existing?.id??new mongoose.Types.ObjectId().toHexString();
 const startsAt=new Date('2026-10-10T02:00:00.000Z');
 const endsAt=new Date('2026-10-10T02:30:00.000Z');
 const values={id,userId,code,doctorId:'nguyen-quoc-viet',doctorName:'BS. Nguyễn Quốc Việt',specialty:'Tim mạch',hospitalId:'vinmec-da-nang',hospitalName:'Vinmec Đà Nẵng',hospitalAddress:'Đường 30 Tháng 4, Đà Nẵng',packageId:'general',packageName:'Khám tổng quát',status:'completed',startsAt,endsAt,patient:{name:'Nguyễn An',phone:'',gender:'not_specified',age:0,reason:'Khám sức khỏe định kỳ'},vitals:{bloodPressure:'118/76',pulse:72,temperature:36.5},vitalsSource:'coursework_sample',paymentStatus:'unpaid',paymentMethod:'cash',amountVnd:0,discountVnd:0,durationMinutes:30,completionSource:'figma_seed',occupiesSlot:false,source:'coursework_sample',completedAt:endsAt};
 await db.collection('appointments').updateOne({userId,code},{$set:values,$setOnInsert:{createdAt:new Date()}},{upsert:true});
 await db.collection('aftercare_notes').updateOne({userId,visitId:id},{$set:{summary:'Khám sức khỏe định kỳ. Các chỉ số sinh hiệu ổn định; đã chỉ định xét nghiệm máu.',conclusion:'Dặn dò: xem kết quả và tái khám theo lịch hẹn.',source:'coursework_sample',verified:false,updatedAt:new Date()},$setOnInsert:{userId,visitId:id,version:1,createdAt:new Date()}},{upsert:true});
 console.log(JSON.stringify({email,code,id,result:existing?'updated':'created'}));
}finally{await connection.close();}
