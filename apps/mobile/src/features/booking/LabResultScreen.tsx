import {Text,View,StyleSheet} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {Frame,when} from './BookingScreens';
import {LoadState,useData} from '../discovery/DiscoveryScreens';
import {Action} from '../auth/ui';
import {colors} from '../../theme/tokens';

type Measure={name:string;value:string;unit:string};
type Result={bookingId:string;code:string;collectedAt:string;reportedAt:string;source:string;verified:boolean;groups:{name:string;measures:Measure[]}[]};
type Response={booking:{id:string;code:string;testName:string;hospitalName:string;startsAt:string};result:Result};

export function LabResultScreen(){
 const {id,group}=useLocalSearchParams<{id:string;group?:string}>();
 const data=useData<Response>('labs/bookings/'+encodeURIComponent(id??'')+'/result');
 const item=data.data;
 const selected=group?item?.result.groups.find(entry=>entry.name===group):undefined;
 const groups=selected?[selected]:item?.result.groups??[];
 return <Frame title={group?'Chi tiết xét nghiệm':'Kết quả xét nghiệm'}>
  <LoadState {...data}/>
  {item?<>
   <View style={s.hero}><Text style={s.heading}>{selected?.name??item.booking.testName}</Text><Text style={s.muted}>Ngày lấy mẫu: {when(item.result.collectedAt).split(' · ')[0]}</Text><Text style={s.muted}>{item.booking.hospitalName} · Mã {item.booking.code}</Text><Text style={s.badge}>✓ Đã trả kết quả</Text></View>
   {groups.map(entry=><View key={entry.name} style={s.card}><Text style={s.heading}>{entry.name}</Text><View style={s.row}><Text style={[s.muted,{flex:1}]}>Chỉ số</Text><Text style={s.muted}>Kết quả</Text></View>{entry.measures.map(measure=><View key={measure.name} style={s.row}><Text style={[s.body,{flex:1}]}>{measure.name}</Text><Text style={s.value}>{measure.value} {measure.unit}</Text></View>)}</View>)}
   {group&&!selected?<Text style={s.muted}>Không tìm thấy nhóm xét nghiệm này trong kết quả.</Text>:null}
   <View style={s.notice}><Text style={s.noticeText}>{item.result.verified?'Kết quả đã được xác minh':'Dữ liệu mẫu cho bài tập · Chưa được bệnh viện xác nhận'}</Text></View>
   <Text style={s.muted}>Các chỉ số trên chỉ để xem luồng giao diện. Không dùng để đánh giá hoặc quyết định điều trị.</Text>
   <Action label="Xem tài liệu y tế" onPress={()=>router.push('/records/documents')}/>
   <Action label={group?'Về kết quả xét nghiệm':'Về theo dõi xét nghiệm'} secondary onPress={()=>group?router.navigate('/records/results'):router.navigate({pathname:'/labs/tracking',params:{id:item.booking.id}})}/>
  </>:null}
 </Frame>;
}

const s=StyleSheet.create({
 card:{borderWidth:1,borderColor:colors.border,borderRadius:8,padding:14,gap:10},
 hero:{backgroundColor:colors.tint,borderRadius:8,padding:14,gap:8},
 heading:{fontFamily:'InterSemiBold',fontSize:16,lineHeight:22,color:colors.ink},
 body:{fontFamily:'Inter',fontSize:13,lineHeight:20,color:colors.ink},
 muted:{fontFamily:'Inter',fontSize:12,lineHeight:18,color:colors.muted},
 row:{flexDirection:'row',justifyContent:'space-between',gap:10,borderTopWidth:1,borderColor:colors.border,paddingTop:10},
 value:{fontFamily:'InterSemiBold',fontSize:13,lineHeight:20,color:colors.ink,textAlign:'right'},
 notice:{backgroundColor:colors.tint,borderRadius:8,padding:12},
 noticeText:{fontFamily:'InterSemiBold',fontSize:12,lineHeight:18,color:colors.primary},
 badge:{fontFamily:'Inter',fontSize:12,color:'#16875B'},
});
