import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiRequest } from '../../api/client';
import { colors } from '../../theme/tokens';
export function FoundationScreen() {
 const [attempt,setAttempt] = useState(0);
 const [state,setState] = useState<'loading'|'ready'|'error'>('loading');
 useEffect(()=>{const controller = new AbortController();setState('loading');apiRequest<{status:string}>('health/ready',controller.signal).then(()=>setState('ready')).catch(()=>{if(!controller.signal.aborted)setState('error');});return ()=>controller.abort();},[attempt]);
 return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
 <Text style={styles.label}>UX_UI · Môi trường phát triển</Text><Text style={styles.title}>Nền tảng ứng dụng sức khỏe</Text>
 <Text style={styles.body}>Đang triển khai giao diện từ Figma của nhóm.</Text>
 <View style={styles.card}><Text style={styles.section}>Kết nối dịch vụ</Text>
 {state==='loading'?<ActivityIndicator accessibilityLabel="Đang kiểm tra kết nối" color={colors.primary}/>:<Text accessibilityLiveRegion="polite" style={styles.body}>{state==='ready'?'API và cơ sở dữ liệu sẵn sàng':'Chưa kết nối được dịch vụ. Kiểm tra địa chỉ API và mạng.'}</Text>}
 <Pressable accessibilityRole="button" disabled={state==='loading'} onPress={()=>setAttempt(n=>n+1)} style={({pressed})=>[styles.button,{opacity:pressed || state==='loading'?0.6:1}]}><Text style={styles.buttonText}>Kiểm tra lại</Text></Pressable></View>
 <Text style={styles.body}>Bản nền tảng G0.1. Các chức năng khám, đặt lịch và hồ sơ đang được phát triển.</Text>
 </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({safe:{flex:1,backgroundColor:colors.surface},content:{padding:24,gap:24},label:{fontSize:14,color:colors.ink},title:{fontSize:28,fontWeight:'700',color:colors.ink},body:{fontSize:16,lineHeight:24,color:colors.ink},card:{padding:20,gap:20,borderWidth:1,borderColor:colors.border,borderRadius:16},section:{fontSize:18,fontWeight:'600',color:colors.ink},button:{minHeight:48,justifyContent:'center',alignItems:'center',backgroundColor:colors.primary,borderRadius:24,padding:12},buttonText:{color:colors.surface,fontSize:16,fontWeight:'600'}});
