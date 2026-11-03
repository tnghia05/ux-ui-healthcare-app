import {randomUUID} from 'node:crypto';
import mongoose from 'mongoose';

const uri=process.env.MONGODB_URI;
if(!uri||new URL(uri).pathname!=='/uxui')throw new Error('Expected UX_UI application database');
const connection=await mongoose.createConnection(uri).asPromise();
try{
 const db=connection.db;
 const user=await db.collection('users').findOne({email:'admin@gmail.com'},{projection:{_id:1,name:1}});
 if(!user)throw new Error('Admin account not found');
 const userId=String(user._id);
 await db.collection('payment_card_labels').updateOne(
  {userId,brand:'visa',last4:'4242',source:'coursework_sample'},
  {$setOnInsert:{id:new mongoose.Types.ObjectId().toHexString(),userId,brand:'visa',last4:'4242',holder:user.name||'Admin',expiry:'12/2028',chargeable:false,source:'coursework_sample',idempotencyKey:randomUUID(),createdAt:new Date()}},
  {upsert:true},
 );
 console.log(JSON.stringify({email:'admin@gmail.com',savedCardLabels:await db.collection('payment_card_labels').countDocuments({userId})}));
}finally{await connection.close();}
