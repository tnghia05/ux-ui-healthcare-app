import {Text,View,Pressable,StyleSheet} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {Frame,when} from './BookingScreens';
import {LoadState,useData} from '../discovery/DiscoveryScreens';
import {Action,styles as shared} from '../auth/ui';
import {colors} from '../../theme/tokens';

type LabBooking={id:string;code:string;testName:string;hospitalName:string;startsAt:string;status:string;history:{status:string;at:string}[]};
const stages=[
 {status:'confirmed',label:'Đã xác nhận lịch hẹn'},
 {status:'waiting_sample',label:'Chờ lấy mẫu'},
 {status:'sample_received',label:'Đã tiếp nhận mẫu'},
 {status:'analysing',label:'Đang phân tích'},
 {status:'result_ready',label:'Có kết quả'},
] as const;

export function LabTrackingScreen(){
 const {id}=useLocalSearchParams<{id:string}>();
 const result=useData<LabBooking>('labs/bookings/'+encodeURIComponent(id??''));
 const booking=result.data;
 const completed=new Set(booking?.history.map(event=>event.status)??[]);
 const current=booking?.status==='confirmed'?'waiting_sample':booking?.status==='sample_received'?'analysing':booking?.status==='analysing'?'result_ready':'';
 const hasResult=booking?.status==='result_ready';
 return <Frame title="Theo dõi xét nghiệm">
  <LoadState {...result}/>
  {booking?<>
   <Text style={s.muted}>Mã đặt lịch: {booking.code}</Text>
   <View style={s.card}><Text style={s.heading}>{booking.testName}</Text><Text style={s.muted}>{booking.hospitalName}</Text><Text style={s.muted}>{when(booking.startsAt)}</Text></View>
   <Text style={s.heading}>Tiến độ xét nghiệm</Text>
   <View style={s.card}>{stages.map(stage=>{const event=booking.history.find(item=>item.status===stage.status);const done=completed.has(stage.status)||(stage.status==='waiting_sample'&&(completed.has('sample_received')||completed.has('analysing')||completed.has('result_ready')));const active=stage.status===current;return <View key={stage.status} style={s.stage}><Text style={[s.symbol,{color:done||active?colors.primary:colors.muted}]}>{done?'✓':active?'●':'○'}</Text><Text style={[s.stageText,{color:done||active?colors.ink:colors.muted}]}>{stage.label}{event?' · '+when(event.at):''}</Text></View>;})}</View>
   <Text style={s.muted}>{hasResult?'Đã có kết quả xét nghiệm cho lịch này.':'Kết quả sẽ hiển thị khi cơ sở hoàn tất xét nghiệm.'}</Text>
   <Action label={hasResult?'Xem kết quả':'Chưa có kết quả'} disabled={!hasResult} onPress={()=>router.push({pathname:'/labs/result',params:{id:booking.id}})}/>
   <Pressable accessibilityRole="button" onPress={()=>router.navigate('/home')} style={s.secondary}><Text style={s.secondaryText}>Về trang chủ</Text></Pressable>
  </>:null}
  {!booking&&!result.loading?<Action label="Tải lại" secondary onPress={result.retry}/>:null}
 </Frame>;
}

const s=StyleSheet.create({
 card:{borderWidth:1,borderColor:colors.border,borderRadius:8,padding:14,gap:9},
 heading:{fontFamily:'InterSemiBold',fontSize:16,lineHeight:22,color:colors.ink},
 muted:{...shared.label,fontSize:13,lineHeight:19},
 stage:{minHeight:24,flexDirection:'row',alignItems:'center',gap:6},
 symbol:{fontFamily:'InterSemiBold',fontSize:15,width:16,textAlign:'center'},
 stageText:{fontFamily:'Inter',fontSize:13,lineHeight:19,flex:1},
 secondary:{minHeight:48,borderRadius:24,backgroundColor:colors.tint,alignItems:'center',justifyContent:'center',paddingHorizontal:16},
 secondaryText:{fontFamily:'Inter',fontSize:14,color:colors.primary},
});
