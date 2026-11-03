import mongoose from 'mongoose';

const code='XN639832F3E6';
const uri=process.env.MONGODB_URI;
if(!uri||new URL(uri).pathname!=='/uxui')throw new Error('Expected UX_UI application database');
const connection=await mongoose.createConnection(uri).asPromise();
try{
 const db=connection.db;
 const booking=await db.collection('lab_bookings').findOne({code});
 if(!booking||booking.testId!=='general'||booking.status==='cancelled')throw new Error('Expected active general lab booking was not found');
 const existing=await db.collection('lab_results').findOne({userId:booking.userId,bookingId:booking.id});
 if(existing){console.log(JSON.stringify({code,bookingId:booking.id,result:'already_exists'}));}
 else{
  const reportedAt=new Date();
  const collectedAt=booking.history.find(event=>event.status==='sample_received')?.at??reportedAt;
  const groups=[
   {name:'Công thức máu',measures:[{name:'Hồng cầu',value:'4,72',unit:'T/L'},{name:'Hemoglobin',value:'14,1',unit:'g/dL'},{name:'Bạch cầu',value:'6,8',unit:'G/L'},{name:'Tiểu cầu',value:'248',unit:'G/L'}]},
   {name:'Đường huyết',measures:[{name:'Glucose máu',value:'5,2',unit:'mmol/L'}]},
   {name:'Mỡ máu',measures:[{name:'Cholesterol toàn phần',value:'4,6',unit:'mmol/L'},{name:'Triglyceride',value:'1,3',unit:'mmol/L'},{name:'HDL-C',value:'1,2',unit:'mmol/L'},{name:'LDL-C',value:'2,7',unit:'mmol/L'}]},
  ];
  await db.collection('lab_results').updateOne({userId:booking.userId,bookingId:booking.id},{$setOnInsert:{bookingId:booking.id,userId:booking.userId,code,source:'coursework_sample',verified:false,collectedAt,reportedAt,groups,createdAt:reportedAt}},{upsert:true});
  await db.collection('lab_bookings').updateOne({id:booking.id,userId:booking.userId,status:{$ne:'result_ready'}},{$set:{status:'result_ready'},$push:{history:{status:'result_ready',at:reportedAt,source:'coursework_sample'}}});
  console.log(JSON.stringify({code,bookingId:booking.id,result:'created',groups:groups.length,measures:groups.reduce((sum,group)=>sum+group.measures.length,0)}));
 }
}finally{await connection.close();}
