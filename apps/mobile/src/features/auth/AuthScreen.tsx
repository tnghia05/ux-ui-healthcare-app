import {LegacyIcon} from '../../components/icons/LegacyIcon';
import backIcon from '../../assets/auth/back.svg';
import checkboxIcon from '../../assets/auth/checkbox.svg';
import { useEffect,useState } from 'react';
import { Alert,Pressable,Text,View } from 'react-native';
import { router } from 'expo-router';


import { ApiError,apiRequest } from '../../api/client';
import { useSession } from './session';
import { Action,Brand,Field,PasswordField,OtpField,Screen,Social,styles } from './ui';
export function AuthScreen({mode}:{mode:'login'|'register'|'verify'}){
 const session=useSession();const [email,setEmail]=useState(''),[name,setName]=useState(''),[password,setPassword]=useState(''),[code,setCode]=useState(''),[accepted,setAccepted]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[now,setNow]=useState(Date.now());
 useEffect(()=>{if(mode!=='verify')return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[mode]);
 const remaining=Math.max(0,Math.ceil((Date.parse(session.draft?.expiresAt??'')-now)/1000))||0;
 async function submit(){if(busy)return;setError('');
 const loginEmail=mode==='login' && email.trim().toLowerCase()==='admin'?'admin@gmail.com':email.trim().toLowerCase();
  if(mode!=='verify' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)){setError('Vui lòng nhập email hợp lệ.');return;}
  if(mode==='register' && (name.trim().length<2||password.length<12||!accepted)){setError('Nhập họ tên, mật khẩu ít nhất 12 ký tự và đồng ý chính sách.');return;}
  if(mode==='login' && !password){setError('Vui lòng nhập mật khẩu.');return;}
  if(mode==='verify' && (!session.draft || !/^\d{6}$/.test(code))){setError('Vui lòng nhập đủ 6 chữ số.');return;}
  setBusy(true);try{
   if(mode==='login'){const user=await session.login(loginEmail,password);router.replace(user.preferences?.setupCompleted?'/home':'/location-permission');}
   else if(mode==='register'){const result=await apiRequest<{challengeId:string;expiresAt:string}>('auth/register',undefined,{method:'POST',body:{email:email.trim().toLowerCase(),name:name.trim(),password}});session.setDraft({...result,email:email.trim().toLowerCase(),name,password});setPassword('');router.replace('/verify');}
   else {await apiRequest('auth/verify',undefined,{method:'POST',body:{challengeId:session.draft!.challengeId,code}});session.setDraft(null);router.replace('/sign-in');Alert.alert('Xác thực thành công','Bạn có thể đăng nhập bằng tài khoản vừa tạo.');}
  }catch(e){setError(e instanceof ApiError?e.message:'Không kết nối được dịch vụ. Vui lòng thử lại.');}finally{setBusy(false);}
 }
 async function resend(){if(!session.draft||busy)return;setBusy(true);setError('');try{const {email,name,password}=session.draft;const result=await apiRequest<{challengeId:string;expiresAt:string}>('auth/register',undefined,{method:'POST',body:{email,name,password}});session.setDraft({...result,email,name,password});setCode('');setNow(Date.now());}catch(e){setError(e instanceof ApiError?e.message:'Chưa gửi lại được mã.');}finally{setBusy(false);}}
 if(mode==='verify')return <Screen><View style={[styles.row,{alignItems:'center',paddingHorizontal:16,minHeight:56}]}><Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={()=>{session.setDraft(null);router.replace('/register');}} style={{minWidth:44,minHeight:48,justifyContent:'center'}}><LegacyIcon source={backIcon} size={24}/></Pressable><Text style={styles.title}>Xác thực OTP</Text></View><View style={[styles.form,{paddingTop:80}]}><Text style={[styles.title,{textAlign:'center'}]}>Kiểm tra email của bạn</Text><Text style={[styles.label,{textAlign:'center'}]}>Nhập mã xác thực đã gửi đến{`\n${session.draft?.email??''}`}</Text><OtpField value={code} onChangeText={setCode}/><Text style={[styles.label,{textAlign:'center'}]}>{remaining?`Mã có hiệu lực trong ${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`:'Mã hết hạn hoặc chưa có yêu cầu xác thực.'}</Text>{error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}<Action label="Gửi lại mã" onPress={()=>void resend()} secondary disabled={busy||!session.draft}/><Action label="Xác thực" onPress={()=>void submit()} busy={busy} disabled={!remaining}/></View></Screen>;
 return <Screen><Brand compact={mode==='register'} title={mode==='register'?'Tạo tài khoản':'Chào mừng bạn trở lại!'} subtitle={mode==='register'?'Điền thông tin hoặc dùng tài khoản liên kết.':'Đăng nhập để tiếp tục chăm sóc sức khỏe.'}/><View style={styles.form}>{mode==='register'?<><Social register/><Text style={[styles.label,{textAlign:'center'}]}>Hoặc tiếp tục với email</Text><Field label="Họ và tên" value={name} onChangeText={setName} autoComplete="name"/></>:null}<Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email"/><PasswordField label="Mật khẩu" value={password} onChangeText={setPassword} autoComplete={mode==='register'?'new-password':'current-password'}/>{mode==='register'?<><Text style={styles.label}>Dùng ít nhất 12 ký tự.</Text><Pressable accessibilityRole="checkbox" aria-checked={accepted} accessibilityState={{checked:accepted}} onPress={()=>setAccepted(v=>!v)} style={[styles.row,{alignItems:'center',minHeight:48}]}><View style={{width:20,height:20,borderWidth:1,borderColor:'#797979',borderRadius:4,backgroundColor:accepted?'#EDF3FF':'white'}}>{accepted?<LegacyIcon source={checkboxIcon} size={16}/>:null}</View><Text style={[styles.body,{flex:1,fontSize:12}]}>Tôi đồng ý với Chính sách bảo mật</Text></Pressable><Action label="Đọc chính sách bảo mật" secondary onPress={()=>router.push('/privacy')}/></>:<View style={{alignItems:'flex-end',marginBottom:20}}><Action secondary label="Quên mật khẩu?" onPress={()=>router.replace('/forgot-password')}/></View>}{error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}<Action label={mode==='register'?'Đăng ký':'Đăng nhập'} busy={busy} onPress={()=>void submit()}/>{mode==='login'?<><Text style={[styles.label,{textAlign:'center'}]}>Hoặc đăng nhập bằng</Text><Social/></>:null}<Action secondary label={mode==='register'?'Đã có tài khoản? Đăng nhập':'Chưa có tài khoản? Đăng ký'} onPress={()=>router.replace(mode==='register'?'/sign-in':'/register')}/>{mode==='login'?<Action secondary label="Chính sách bảo mật" onPress={()=>router.push('/privacy')}/>:null}</View></Screen>;
}


