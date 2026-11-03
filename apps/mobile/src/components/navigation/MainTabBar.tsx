import {useEffect, useRef, useState} from 'react';
import {AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View} from 'react-native';
import {router} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppIcon} from '../icons/AppIcon';
import type {IconName} from '../icons/registry';
import type {MainTab} from '../../navigation/routes';
import {colors} from '../../theme/tokens';

const tabs:{key:MainTab;label:string;icon:IconName;href:'/home'|'/explore'|'/appointments'|'/messages'|'/account'}[]=[
  {key:'home',label:'Trang chủ',icon:'home',href:'/home'},
  {key:'explore',label:'Khám phá',icon:'location',href:'/explore'},
  {key:'appointments',label:'Lịch hẹn',icon:'calendar',href:'/appointments'},
  {key:'messages',label:'Tin nhắn',icon:'message',href:'/messages'},
  {key:'account',label:'Tài khoản',icon:'user',href:'/account'},
];

export function MainTabBar({active}:{active:MainTab}) {
  const selected=tabs.findIndex(tab=>tab.key===active);
  const position=useRef(new Animated.Value(selected)).current;
  const [width,setWidth]=useState(0);
  const [reduceMotion,setReduceMotion]=useState(false);
  const insets=useSafeAreaInsets();

  useEffect(()=>{
    let mounted=true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(mounted)setReduceMotion(value);});
    const listener=AccessibilityInfo.addEventListener('reduceMotionChanged',value=>setReduceMotion(value));
    return()=>{mounted=false;listener.remove();};
  },[]);
  useEffect(()=>{
    if(reduceMotion){position.setValue(selected);return;}
    const animation=Animated.timing(position,{toValue:selected,duration:460,easing:Easing.out(Easing.cubic),useNativeDriver:true});
    animation.start();
    return()=>animation.stop();
  },[position,reduceMotion,selected]);

  const slotWidth=width/5;
  const translateX=position.interpolate({inputRange:[0,4],outputRange:[0,slotWidth*4]});
  return <View style={[styles.bar,{paddingBottom:Math.max(8,insets.bottom)}]} onLayout={event=>setWidth(event.nativeEvent.layout.width)}>
    <View style={styles.row}>
      {tabs.map((tab,index)=><Pressable key={tab.key} accessibilityRole="button" accessibilityLabel={tab.label} accessibilityState={{selected:index===selected}} onPress={()=>{if(index!==selected)router.navigate(tab.href);}} style={({pressed})=>[styles.item,pressed&&styles.pressed]}>
        {index===selected?<View style={styles.iconSpace}/>:<AppIcon name={tab.icon} size={24} color={colors.ink}/>} 
        <Text style={[styles.label,index===selected&&styles.selectedLabel]}>{tab.label}</Text>
      </Pressable>)}
    </View>
    {width>0?<Animated.View pointerEvents="none" style={[styles.movingIcon,{width:slotWidth,transform:[{translateX}]}]}><AppIcon name={tabs[selected].icon} size={24} color={colors.primary} spring="smooth"/></Animated.View>:null}
  </View>;
}

const styles=StyleSheet.create({
  bar:{backgroundColor:colors.surface,borderTopWidth:.5,borderTopColor:colors.border,paddingTop:8},
  row:{flexDirection:'row',alignItems:'center'},
  item:{flex:1,minHeight:52,alignItems:'center',justifyContent:'center',gap:4},
  pressed:{opacity:.65},
  iconSpace:{width:24,height:24},
  label:{fontFamily:'Inter',fontSize:10,lineHeight:14,color:colors.muted},
  selectedLabel:{color:colors.primary},
  movingIcon:{position:'absolute',top:8,left:0,height:24,alignItems:'center',justifyContent:'center'},
});
