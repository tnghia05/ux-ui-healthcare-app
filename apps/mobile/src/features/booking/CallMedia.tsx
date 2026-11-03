import {useState} from 'react';
import {Text} from 'react-native';
import {Frame} from './BookingScreens';
import {styles,Action} from '../auth/ui';
import {useSession} from '../auth/session';
import {router} from 'expo-router';
import {ApiError} from '../../api/client';
export default function CallMedia({id}:{id:string}){const {request}=useSession();const [busy,setBusy]=useState(false),[error,setError]=useState('');async function end(){setBusy(true);try{await request('calls/'+id+'/actions',undefined,{method:'POST',body:{action:'end'}});router.replace({pathname:'/calls/end',params:{id}});}catch(e){setError(e instanceof ApiError?e.message:'Chưa kết thúc được yêu cầu. Vui lòng thử lại.');}finally{setBusy(false);}}return <Frame title="Cuộc gọi"><Text style={styles.body}>Cuộc gọi WebRTC hiện hỗ trợ bản web trên HTTPS/localhost. Expo Go chưa có thư viện gọi native.</Text><Action label="Kết thúc yêu cầu gọi" busy={busy} onPress={()=>void end()}/>{error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}</Frame>;}
