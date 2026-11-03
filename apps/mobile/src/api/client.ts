import { Platform } from 'react-native';
import Constants from 'expo-constants';
function localExpoApiUrl(){
 if(Platform.OS==='web'||!__DEV__)return null;
 const hostUri=Constants.expoConfig?.hostUri;
 if(!hostUri)return null;
 try{const host=new URL('http://'+hostUri).hostname;if(!host||host.endsWith('.exp.direct'))return null;return `http://${host}:3001/api/v1`;}catch{return null;}
}
const baseUrl=Platform.OS==='web' ? (process.env.EXPO_PUBLIC_WEB_API_URL ?? process.env.EXPO_PUBLIC_API_URL) : (localExpoApiUrl() ?? process.env.EXPO_PUBLIC_API_URL);
export class ApiError extends Error {constructor(public status:number,public code:string,message:string){super(message);}}
export async function apiRequest<T>(path:string,signal?:AbortSignal,options:{method?:string;body?:unknown;token?:string;binary?:boolean}={}):Promise<T>{
 if(!baseUrl)throw new Error('Chưa cấu hình địa chỉ dịch vụ');
 const controller=new AbortController();const abort=()=>controller.abort();signal?.addEventListener('abort',abort);if(signal?.aborted)abort();
 const timer=setTimeout(abort,options.body instanceof FormData?60000:15000);
 try {
  const response=await fetch(`${baseUrl.replace(/\/$/,'')}/${path.replace(/^\//,'')}`,{method:options.method??'GET',signal:controller.signal,headers:{Accept:'application/json',...(options.body&&!(options.body instanceof FormData)?{'Content-Type':'application/json'}:{}),...(options.token?{Authorization:`Bearer ${options.token}`}:{})},...(options.body?{body:options.body instanceof FormData?options.body:JSON.stringify(options.body)}:{})});
  const body=response.ok&&options.binary?await response.arrayBuffer():response.status===204?undefined:await response.json();
  if(!response.ok)throw new ApiError(response.status,body?.error?.code??'HTTP_ERROR',body?.error?.message??'Không thể kết nối');
  return body as T;
 }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
