import {useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {router} from 'expo-router';
import {Frame,when} from './BookingScreens';
import {Field,styles as shared} from '../auth/ui';
import {LoadState,useData} from '../discovery/DiscoveryScreens';
import {colors} from '../../theme/tokens';
import {LegacyIcon} from '../../components/icons/LegacyIcon';
import labIcon from '../../assets/records/r0_imgVector.svg';

type Item={bookingId:string;code:string;groupName:string;hospitalName:string;collectedAt:string;reportedAt:string;verified:boolean;source:string};
const monthOf=(value:string)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit'}).format(new Date(value));

export function LabResultsListScreen(){
 const [query,setQuery]=useState(''),[monthOnly,setMonthOnly]=useState(false);
 const results=useData<{items:Item[]}>('labs/results');
 const month=results.data?.items[0]?monthOf(results.data.items[0].reportedAt):'';
 const items=useMemo(()=>results.data?.items.filter(item=>{const text=(item.groupName+' '+item.hospitalName+' '+item.code).toLocaleLowerCase('vi-VN');return text.includes(query.trim().toLocaleLowerCase('vi-VN'))&&(!monthOnly||monthOf(item.reportedAt)===month);})??[],[results.data,query,monthOnly,month]);
 return <Frame title="Kết quả xét nghiệm">
  <Field label="Tìm kiếm kết quả" placeholder="Tìm tên xét nghiệm" value={query} onChangeText={setQuery}/>
  <View style={s.chips}><Pressable accessibilityRole="button" accessibilityState={{selected:!monthOnly}} onPress={()=>setMonthOnly(false)} style={[s.chip,!monthOnly&&s.chipActive]}><Text style={[s.chipText,!monthOnly&&s.chipTextActive]}>Tất cả</Text></Pressable>{month?<Pressable accessibilityRole="button" accessibilityState={{selected:monthOnly}} onPress={()=>setMonthOnly(true)} style={[s.chip,monthOnly&&s.chipActive]}><Text style={[s.chipText,monthOnly&&s.chipTextActive]}>Tháng {month.slice(5)}/{month.slice(0,4)}</Text></Pressable>:null}</View>
  <Text style={s.heading}>{items.length} kết quả xét nghiệm</Text>
  <LoadState {...results}/>
  {items.map(item=><Pressable key={item.bookingId+'-'+item.groupName} accessibilityRole="button" accessibilityLabel={'Xem '+item.groupName+' · '+item.code} onPress={()=>router.push({pathname:'/labs/result',params:{id:item.bookingId,group:item.groupName}})} style={s.card}><View style={s.icon}><LegacyIcon source={labIcon} size={22}/></View><View style={{flex:1,gap:5}}><Text style={s.name}>{item.groupName}</Text><Text style={s.muted}>{when(item.collectedAt).split(' · ')[0]} · {item.hospitalName}</Text><Text style={s.badge}>✓ Đã có kết quả{item.verified?'':' · Dữ liệu mẫu'}</Text></View><Text style={s.chevron}>›</Text></Pressable>)}
  {!results.loading&&items.length===0?<Text style={s.muted}>{query?'Không tìm thấy kết quả phù hợp.':'Chưa có kết quả xét nghiệm.'}</Text>:null}
  <Text style={s.muted}>Kết quả được lưu riêng trong hồ sơ sức khỏe của bạn. Dữ liệu mẫu chưa được bệnh viện xác nhận.</Text>
 </Frame>;
}

const s=StyleSheet.create({
 heading:{fontFamily:'InterSemiBold',fontSize:16,lineHeight:22,color:colors.ink},
 chips:{flexDirection:'row',gap:8},chip:{paddingHorizontal:14,minHeight:32,borderRadius:20,justifyContent:'center',backgroundColor:colors.subtle},chipActive:{backgroundColor:colors.tint},chipText:{...shared.label,color:colors.muted},chipTextActive:{color:colors.primary},
 card:{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,minHeight:82,flexDirection:'row',alignItems:'center',gap:10},
 icon:{width:38,height:38,borderRadius:10,backgroundColor:colors.tint,alignItems:'center',justifyContent:'center'},
 name:{fontFamily:'InterSemiBold',fontSize:14,color:colors.ink},muted:{...shared.label},badge:{fontFamily:'Inter',fontSize:11,color:'#16875B'},chevron:{fontSize:24,color:colors.muted},
});
