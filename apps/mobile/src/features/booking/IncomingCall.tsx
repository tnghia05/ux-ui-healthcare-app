import {useCallback,useState} from 'react';
import {AppState,Text,View} from 'react-native';
import {router,useFocusEffect} from 'expo-router';
import {useSession} from '../auth/session';
import {Action,styles} from '../auth/ui';
import type {Call} from './CallScreens';
export function IncomingCall({roomId}:{roomId:string}){const {request}=useSession();const [call,setCall]=useState<Call|null>(null);useFocusEffect(useCallback(()=>{let cancelled=false,busy=false;const abort=new AbortController();async function poll(){if(busy||AppState.currentState!=='active')return;busy=true;try{const r=await request<{call:Call|null}>('calls/room/'+roomId,abort.signal);if(!cancelled)setCall(r.call);}catch{if(!cancelled)setCall(null);}finally{busy=false;}}void poll();const timer=setInterval(()=>void poll(),3000);return()=>{cancelled=true;abort.abort();clearInterval(timer);};},[roomId,request]));return call?<View style={{padding:14,borderRadius:12,backgroundColor:'#EDF3FF',gap:10}}><Text style={styles.body}>{call.isCaller?'Cuộc gọi đang hoạt động':'Có cuộc gọi '+(call.mode==='video'?'video':'thoại')}</Text><Action label="Mở cuộc gọi" onPress={()=>router.push({pathname:'/calls/[id]',params:{id:call.id}})}/></View>:null;}
