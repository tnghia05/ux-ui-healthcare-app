export default async function readiness(){
 for(const url of ['http://127.0.0.1:3002/api/v1/health/ready','http://127.0.0.1:8081']){
  let ready=false;
  for(let attempt=0;attempt<20;attempt++){
   try{const response=await fetch(url,{signal:AbortSignal.timeout(2000)});if(response.ok){ready=true;break;}}catch{}
   await new Promise(resolve=>setTimeout(resolve,500));
  }
  if(!ready)throw new Error(`Dịch vụ chưa sẵn sàng: ${url}. Hãy bật API và Expo trước khi chạy E2E.`);
 }
}
