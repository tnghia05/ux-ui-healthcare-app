import {LegacyIcon} from '../../components/icons/LegacyIcon';
import { useState } from 'react';
import { Platform,Pressable,Text,View } from 'react-native';
import { router,Redirect } from 'expo-router';
import * as Location from 'expo-location';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';
import back from '../../assets/auth/back.svg';
import { introAssets as a } from './assets';
import { useSession } from '../auth/session';
import type { Preferences } from '../auth/session';
import { Action,Field,Screen,styles } from '../auth/ui';
import { ApiError } from '../../api/client';
import { colors } from '../../theme/tokens';
export function PermissionScreen({mode}:{mode:'location'|'manual'|'notifications'}){
 const session=useSession();const [busy,setBusy]=useState(false),[error,setError]=useState(''),[address,setAddress]=useState(session.user?.preferences?.address??'');
 if(session.loading)return <Screen><Text style={styles.body}>Đang tải…</Text></Screen>;
 if(!session.user)return <Redirect href="/sign-in"/>;
 const title=mode==='manual'?'Nhập vị trí thủ công':mode==='location'?'Cấp quyền vị trí':'Cấp quyền thông báo';
 async function save(input:Preferences,next:'/home'|'/notification-permission'){await session.updatePreferences(input);router.replace(next);}
 async function manual(){if(busy)return;setError('');if(address.trim().length<3){setError('Vui lòng nhập địa điểm ít nhất 3 ký tự.');return;}setBusy(true);try{await save({locationMode:'manual',address:address.trim(),locationPermission:'skipped'},'/notification-permission');}catch(e){setError(e instanceof ApiError?e.message:'Chưa lưu được vị trí. Vui lòng thử lại.');}finally{setBusy(false);}}
 async function device(){if(busy)return;setBusy(true);setError('');try{
  const permission=await Location.requestForegroundPermissionsAsync();
  if(!permission.granted){await session.updatePreferences({locationMode:'none',locationPermission:permission.status==='denied'?'denied':'undetermined'});setError('Chưa được cấp quyền vị trí. Bạn có thể nhập thủ công hoặc bỏ qua.');return;}
  const position=await Promise.race([Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced}),new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('location timeout')),12000))]);
  await save({locationMode:'device',latitude:position.coords.latitude,longitude:position.coords.longitude,locationPermission:'granted'},'/notification-permission');
 }catch{setError('Chưa lấy được vị trí. Kiểm tra GPS hoặc nhập thủ công.');}finally{setBusy(false);}}
 async function skipLocation(){if(busy)return;setBusy(true);setError('');try{await save({locationMode:'none',locationPermission:'skipped'},'/notification-permission');}catch{setError('Chưa lưu được lựa chọn. Vui lòng thử lại.');}finally{setBusy(false);}}
 async function notifications(skip=false){if(busy)return;setBusy(true);setError('');try{
  if(skip){await save({notificationPermission:'skipped',setupCompleted:true},'/home');return;}
  if(Platform.OS==='web'){setError('Bản web chưa hỗ trợ thông báo hệ thống. Bạn có thể chọn Để sau.');return;}
  const native=await import('expo-notifications');
  if(Platform.OS==='android')await native.setNotificationChannelAsync('appointments',{name:'Lịch hẹn',importance:native.AndroidImportance.DEFAULT});
  const result=await native.requestPermissionsAsync();
  const allowed=result.granted || result.ios?.status===native.IosAuthorizationStatus.PROVISIONAL;
  if(!allowed){await session.updatePreferences({notificationPermission:'denied'});setError('Chưa được cấp quyền thông báo. Bạn vẫn có thể chọn Để sau.');return;}
  await save({notificationPermission:'granted',setupCompleted:true},'/home');
 }catch{setError('Chưa xin được quyền thông báo. Bạn có thể chọn Để sau.');}finally{setBusy(false);}}
 return <Screen><View style={[styles.row,{alignItems:'center',minHeight:56,paddingHorizontal:16}]}><Pressable accessibilityRole="button" accessibilityLabel="Quay lại" style={{minWidth:44,minHeight:48,justifyContent:'center'}} onPress={()=>router.replace(mode==='manual'?'/location-permission':'/account')}><LegacyIcon source={back} size={24}/></Pressable><Text style={styles.title}>{title}</Text></View>{mode==='manual'?<View style={styles.form}><Field label="Địa điểm" value={address} onChangeText={setAddress} placeholder="Ví dụ: Đường 30 Tháng 4, Đà Nẵng" maxLength={250}/><Action label="Sử dụng vị trí hiện tại" secondary busy={busy} onPress={()=>void device()}/><Text style={[styles.title,{fontSize:16}]}>Địa điểm bạn nhập</Text><View style={{borderWidth:1,borderColor:colors.border,borderRadius:8,padding:14,gap:6}}><Text style={styles.body}>{address.trim()||'Chưa có địa điểm'}</Text><Text style={styles.label}>Địa chỉ do bạn cung cấp; chưa xác minh tọa độ trên bản đồ.</Text></View>{error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}<Action label="Xác nhận vị trí" busy={busy} onPress={()=>void manual()}/></View>:<View style={[styles.form,{flex:1,justifyContent:'center',paddingVertical:40}]}><View style={{alignSelf:'center'}}><SvgUri uri={Asset.fromModule(mode==='location'?a.location:a.notification).uri}/></View><Text style={[styles.title,{textAlign:'center'}]}>{mode==='location'?'Vị trí của bạn ở đâu?':'Bật thông báo'}</Text><Text style={[styles.label,{textAlign:'center'}]}>{mode==='location'?'Cho phép vị trí để tìm bác sĩ và bệnh viện gần bạn.':'Nhận nhắc lịch khám, cập nhật kết quả xét nghiệm và thông báo quan trọng.'}</Text>{error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}<Action label={mode==='location'?'Cho phép truy cập vị trí':'Cho phép thông báo'} busy={busy} onPress={()=>void (mode==='location'?device():notifications())}/>{mode==='location'?<><Action label="Nhập vị trí thủ công" secondary disabled={busy} onPress={()=>router.replace('/manual-location')}/><Action label="Bỏ qua vị trí" secondary disabled={busy} onPress={()=>void skipLocation()}/></>:<Action label="Để sau" secondary disabled={busy} onPress={()=>void notifications(true)}/>}</View>}</Screen>;
}
