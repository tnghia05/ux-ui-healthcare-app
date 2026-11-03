import {Pressable,StyleSheet,Text,View} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {Frame,when} from './BookingScreens';
import {LoadState,useData} from '../discovery/DiscoveryScreens';
import {colors} from '../../theme/tokens';

type Visit={id:string;code:string;packageName:string;doctorName:string;hospitalName:string;startsAt:string;patient:{name:string};source?:string;vitalsSource?:string;vitals?:{bloodPressure?:string;pulse?:number;temperature?:number}|null;clinicalNotes?:{summary?:string;conclusion?:string;source?:string;verified?:boolean}|null};
const links=[
 {label:'Kết quả xét nghiệm',path:'/records/results',icon:'⚗'},
 {label:'Tài liệu lần khám',path:'/records/documents',icon:'▤'},
 {label:'Thông tin bảo hiểm',path:'/insurance',icon:'◇'},
 {label:'Dị ứng và bệnh nền',path:'/records/conditions',icon:'♙'},
 {label:'Lịch sử tiêm chủng',path:'/records/vaccinations',icon:'▣'},
] as const;

export function VisitDetailsScreen(){
 const {id}=useLocalSearchParams<{id:string}>();
 const data=useData<Visit>('records/visits/'+encodeURIComponent(id??''));
 const visit=data.data;
 return <Frame title="Chi tiết lần khám">
  <LoadState {...data}/>
  {visit?<>
   <View style={s.hero}><Text style={s.badge}>✓ Đã hoàn thành{visit.source==='coursework_sample'?' · Dữ liệu mẫu':''}</Text><Text style={s.heading}>{visit.packageName}</Text><Text style={s.muted}>{when(visit.startsAt)}</Text><Text style={s.body}>{visit.patient.name} · Mã hồ sơ {visit.code}</Text><Text style={s.link}>{visit.doctorName} · {visit.hospitalName}</Text></View>
   <View style={s.vitals}>{[
    {value:visit.vitals?.bloodPressure??'—',label:'Huyết áp · mmHg'},
    {value:visit.vitals?.pulse?String(visit.vitals.pulse):'—',label:'Mạch · lần/phút'},
    {value:visit.vitals?.temperature?visit.vitals.temperature.toLocaleString('vi-VN'):'—',label:'Thân nhiệt · °C'},
   ].map(item=><View key={item.label} style={s.vital}><Text style={s.vitalValue}>{item.value}</Text><Text style={s.vitalLabel}>{item.label}</Text></View>)}</View>
   <View style={s.card}><Text style={s.headingSmall}>Ghi nhận sau khám</Text><Text style={s.body}>{visit.clinicalNotes?.summary||'Chưa nhận ghi nhận sau khám từ cơ sở.'}</Text>{visit.clinicalNotes?.conclusion?<Text style={s.muted}>{visit.clinicalNotes.conclusion}</Text>:null}{visit.clinicalNotes&&!visit.clinicalNotes.verified?<Text style={s.muted}>Ghi chép mẫu hoặc tự khai · Chưa được cơ sở xác nhận</Text>:null}</View>
   <View>{links.map(link=><Pressable key={link.label} accessibilityRole="button" accessibilityLabel={link.label} onPress={()=>router.push({pathname:link.path,params:link.path==='/records/documents'?{visitId:visit.id}:{}})} style={s.row}><Text style={s.rowIcon}>{link.icon}</Text><Text style={s.rowLabel}>{link.label}</Text><Text style={s.chevron}>›</Text></Pressable>)}</View>
  </>:null}
 </Frame>;
}

const s=StyleSheet.create({
 hero:{backgroundColor:colors.tint,borderRadius:10,padding:14,gap:8},
 card:{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:14,gap:10},
 heading:{fontFamily:'InterSemiBold',fontSize:18,lineHeight:24,color:colors.ink},
 headingSmall:{fontFamily:'InterSemiBold',fontSize:15,lineHeight:21,color:colors.ink},
 body:{fontFamily:'Inter',fontSize:13,lineHeight:19,color:colors.ink},
 muted:{fontFamily:'Inter',fontSize:12,lineHeight:18,color:colors.muted},
 link:{fontFamily:'Inter',fontSize:12,color:colors.primary},
 badge:{fontFamily:'InterSemiBold',fontSize:11,color:'#16875B'},
 vitals:{flexDirection:'row',gap:6},
 vital:{flex:1,minWidth:0,backgroundColor:colors.subtle,borderRadius:8,padding:8,gap:5},
 vitalValue:{fontFamily:'InterSemiBold',fontSize:15,color:colors.ink},
 vitalLabel:{fontFamily:'Inter',fontSize:10,lineHeight:13,color:colors.muted},
 row:{minHeight:43,flexDirection:'row',alignItems:'center',gap:9},rowIcon:{width:20,fontSize:18,color:colors.primary,textAlign:'center'},rowLabel:{flex:1,fontFamily:'Inter',fontSize:13,color:colors.ink},chevron:{fontSize:20,color:colors.muted},
});
