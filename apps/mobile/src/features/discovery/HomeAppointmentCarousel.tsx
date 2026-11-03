import {useRef,useState} from 'react';
import type {ComponentRef} from 'react';
import {Image,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {router} from 'expo-router';
import {AppIcon} from '../../components/icons/AppIcon';
import {colors} from '../../theme/tokens';
import {assets} from './assets';

export type HomeAppointment={id:string;doctorId?:string;doctorName:string;specialty?:string;startsAt:string;endsAt?:string;durationMinutes?:number;imageKey?:string};
export type HomeDoctor={id:string;name:string;specialty:string;rating:number};

const day=(value:string)=>new Date(value).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Asia/Ho_Chi_Minh'});
const hour=(value:string)=>new Date(value).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Ho_Chi_Minh'});

export function HomeAppointmentCarousel({appointments,doctors}:{appointments:HomeAppointment[];doctors:HomeDoctor[]}){
 const list=useRef<ComponentRef<typeof ScrollView>>(null);
 const [width,setWidth]=useState(350);
 const [active,setActive]=useState(0);
 const cardWidth=Math.min(width,350);
 function select(index:number){setActive(index);list.current?.scrollTo({x:index*cardWidth,animated:true});}
 return <View style={styles.wrap} onLayout={event=>setWidth(event.nativeEvent.layout.width)}>
  <ScrollView ref={list} horizontal pagingEnabled snapToInterval={cardWidth} decelerationRate="fast" showsHorizontalScrollIndicator={false} style={{width:cardWidth,maxWidth:'100%'}} onScroll={event=>setActive(Math.min(appointments.length-1,Math.max(0,Math.round(event.nativeEvent.contentOffset.x/cardWidth))))} scrollEventThrottle={32}>
   {appointments.map(appointment=>{
    const doctor=doctors.find(item=>item.id===appointment.doctorId||item.name===appointment.doctorName);
    const end=appointment.endsAt??(appointment.durationMinutes?new Date(new Date(appointment.startsAt).getTime()+appointment.durationMinutes*60000).toISOString():null);
    return <Pressable key={appointment.id} accessibilityRole="button" accessibilityLabel={'Chi tiết lịch khám với '+appointment.doctorName} onPress={()=>router.push({pathname:'/appointment/[id]',params:{id:appointment.id}})} style={({pressed})=>[styles.card,{width:cardWidth},pressed&&{opacity:.88}]}>
     <View style={styles.doctorRow}>
      {appointment.imageKey&&assets[appointment.imageKey]?<Image source={assets[appointment.imageKey]} accessibilityIgnoresInvertColors resizeMode="contain" style={styles.avatar}/>:<View style={styles.avatar}/>}
      <View style={styles.doctorInfo}>
       <Text numberOfLines={2} style={styles.name}>{appointment.doctorName}</Text>
       <Text numberOfLines={1} style={styles.specialty}>{appointment.specialty||doctor?.specialty||'Bác sĩ'}</Text>
       {doctor?.rating?<Text style={styles.rating}>★ {doctor.rating.toLocaleString('vi-VN',{maximumFractionDigits:1})}</Text>:null}
      </View>
     </View>
     <View style={styles.dateBar}><AppIcon name="calendar" size={12} color={colors.surface}/><Text style={styles.dateText}>{day(appointment.startsAt)}</Text><View style={styles.divider}/><AppIcon name="clock" size={12} color={colors.surface}/><Text style={styles.dateText}>{hour(appointment.startsAt)} – {end?hour(end):'—'}</Text></View>
    </Pressable>;
   })}
  </ScrollView>
  {appointments.length>1?<View style={[styles.dots,{width:cardWidth}]}>{appointments.map((appointment,index)=><Pressable key={appointment.id} accessibilityRole="button" accessibilityLabel={'Xem lịch hẹn '+(index+1)} accessibilityState={{selected:active===index}} onPress={()=>select(index)} hitSlop={8} style={styles.dotTouch}><Image source={assets[active===index?'dot-active':'dot']} style={styles.dot}/></Pressable>)}</View>:null}
 </View>;
}

const styles=StyleSheet.create({
 wrap:{marginTop:-10,alignItems:'flex-start'},
 card:{height:163,borderRadius:18,backgroundColor:colors.subtle,overflow:'hidden'},
 doctorRow:{flexDirection:'row',alignItems:'flex-start',paddingLeft:24,paddingRight:12,paddingTop:20,gap:29},
 avatar:{width:105,height:105,borderRadius:52.5,backgroundColor:colors.subtle},
 doctorInfo:{flex:1,gap:7,paddingTop:8},
 name:{fontFamily:'InterSemiBold',fontSize:13,lineHeight:18,color:colors.ink},
 specialty:{fontFamily:'Inter',fontSize:12,lineHeight:17,color:colors.muted},
 rating:{fontFamily:'Inter',fontSize:12,lineHeight:17,color:'#FFA12E'},
 dateBar:{position:'absolute',left:10,right:10,bottom:8,height:36,borderRadius:5,backgroundColor:colors.primary,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6},
 dateText:{fontFamily:'Inter',fontSize:12,lineHeight:17,color:colors.surface},
 divider:{width:1,height:16,backgroundColor:'rgba(255,255,255,.45)',marginHorizontal:5},
 dots:{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:0,marginTop:5},
 dotTouch:{width:16,height:24,alignItems:'center',justifyContent:'center'},
 dot:{width:7,height:7},
});
