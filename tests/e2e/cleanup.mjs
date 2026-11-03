import mongoose from 'mongoose';
export default async function cleanup(){
 const uri=process.env.E2E_MONGODB_URI;if(!uri)return;const parsed=new URL(uri);
 if(parsed.hostname!=='127.0.0.1'||parsed.port!=='27018'||!/^\/uxui_e2e_[0-9]+$/.test(parsed.pathname))throw new Error('Refusing to clean a non-E2E database');
 const connection=await mongoose.createConnection(uri,{serverSelectionTimeoutMS:5000}).asPromise();
 try{await connection.dropDatabase();}finally{await connection.close();}
}
