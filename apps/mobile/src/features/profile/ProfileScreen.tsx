import {LegacyIcon} from '../../components/icons/LegacyIcon';
import { useState } from 'react';
import { Alert,Pressable,Text,View } from 'react-native';
import { router } from 'expo-router';


import back from '../../assets/auth/back.svg';
import { useSession } from '../auth/session';
import type { ProfileInput } from '../auth/session';
import { Action,Field,Screen,styles } from '../auth/ui';
import { ApiError } from '../../api/client';
import { colors } from '../../theme/tokens';
function displayDate(date:string){const parts=date.split('-');return parts.length===3?`${parts[2]}/${parts[1]}/${parts[0]}`:date;}
export function ProfileScreen(){const session=useSession();const [name,setName]=useState(session.user?.name??''),[phone,setPhone]=useState(session.user?.phone??''),[birthDate,setBirthDate]=useState(displayDate(session.user?.birthDate??'')),[gender,setGender]=useState<ProfileInput['gender']>(session.user?.gender??'not_specified'),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [genderOpen,setGenderOpen]=useState(false);
 const genderLabels={female:'Nữ',male:'Nam',other:'Khác',not_specified:'Không muốn cung cấp'};
 async function save(){if(busy)return;setError('');const parts=birthDate.split('/');const iso=parts.length===3?`${parts[2]}-${parts[1]}-${parts[0]}`:'';
 if(name.trim().length<2){setError('Vui lòng nhập họ tên ít nhất 2 ký tự.');return;}
 if(!/^(0|\+84)[0-9]{9}$/.test(phone.replace(/\s/g,''))){setError('Số điện thoại chưa hợp lệ. Ví dụ: 0901234567.');return;}
 if(!/^\d{4}-\d{2}-\d{2}$/.test(iso)){setError('Nhập ngày sinh theo định dạng DD/MM/YYYY.');return;}
 setBusy(true);try{await session.updateProfile({name:name.trim(),phone:phone.replace(/\s/g,''),birthDate:iso,gender});router.replace('/account');Alert.alert('Đã lưu','Thông tin cá nhân đã được cập nhật.');}catch(e){setError(e instanceof ApiError?e.message:'Không lưu được hồ sơ. Vui lòng thử lại.');}finally{setBusy(false);}}
 return <Screen><View style={[styles.row,{alignItems:'center',minHeight:56,paddingHorizontal:16}]}><Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={()=>router.replace('/account')} style={{minWidth:44,minHeight:48,justifyContent:'center'}}><LegacyIcon source={back} size={24}/></Pressable><Text style={styles.title}>Hoàn thiện hồ sơ</Text></View><View style={[styles.form,{paddingTop:16}]}><View accessibilityLabel="Chưa có ảnh đại diện" style={{width:48,height:48,borderRadius:24,backgroundColor:colors.border,alignSelf:'center'}}/><Action label="Đổi ảnh đại diện — sắp có" secondary disabled onPress={()=>{}}/><Text style={[styles.label,{textAlign:'center'}]}>Thông tin cá nhân chỉ hiển thị với bạn và người được bạn cho phép.</Text><Field label="Họ và tên" value={name} onChangeText={setName} autoComplete="name"/><Field label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel"/><Field label="Ngày sinh" value={birthDate} onChangeText={setBirthDate} placeholder="DD/MM/YYYY" keyboardType="numbers-and-punctuation" maxLength={10}/><Text style={styles.label}>Giới tính</Text><Pressable accessibilityRole="button" accessibilityLabel="Chọn giới tính" accessibilityState={{expanded:genderOpen}} onPress={()=>setGenderOpen(v=>!v)} style={[styles.input,{justifyContent:'center'}]}><Text style={styles.body}>{genderLabels[gender]}</Text></Pressable>{genderOpen?<View accessibilityRole="radiogroup" style={{gap:8}}>{(Object.keys(genderLabels) as ProfileInput['gender'][]).map(key=><Pressable key={key} accessibilityRole="radio" accessibilityState={{checked:gender===key}} aria-checked={gender===key} onPress={()=>{setGender(key);setGenderOpen(false);}} style={{minHeight:44,borderRadius:8,padding:12,backgroundColor:gender===key?colors.tint:colors.subtle,borderWidth:1,borderColor:gender===key?colors.primary:colors.border}}><Text style={styles.body}>{genderLabels[key]}</Text></Pressable>)}</View>:null}{error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}<Action label="Lưu hồ sơ" busy={busy} onPress={()=>void save()}/></View></Screen>;
}
