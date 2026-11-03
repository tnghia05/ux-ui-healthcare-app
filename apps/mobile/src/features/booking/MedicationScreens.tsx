import {useCallback, useEffect, useRef, useState} from 'react';
import {AccessibilityInfo, Animated, AppState, Easing, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {router, useFocusEffect, useLocalSearchParams} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppIcon} from '../../components/icons/AppIcon';
import {Guard, Header, LoadState, useData} from '../discovery/DiscoveryScreens';
import {useSession} from '../auth/session';
import {colors} from '../../theme/tokens';

const today = () => new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
type Dose = {medicationId:string;name:string;dose:string;instructions:string;time:string;status:string;version:number;canRecord:boolean;recordedAt:string|null;snoozedUntil:string|null};
type Schedule = {date:string;completed:number;items:Dose[];prescription:{reminderEnabled:boolean;archived:boolean;version:number}};

function useLiveSchedule(retry:()=>void) {
  const latest = useRef(retry);
  useEffect(() => {latest.current = retry;}, [retry]);
  useFocusEffect(useCallback(() => {
    const timer = setInterval(() => {if (AppState.currentState === 'active') latest.current();}, 30000);
    const state = AppState.addEventListener('change', value => {if (value === 'active') latest.current();});
    return () => {clearInterval(timer); state.remove();};
  }, []));
}

function Screen({title, children}:{title:string;children:React.ReactNode}) {
  return <Guard><SafeAreaView style={styles.safe}><Header title={title}/><ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">{children}</ScrollView><View style={styles.homeIndicator}/></SafeAreaView></Guard>;
}

function Pill({label, onPress, primary=false, disabled=false}:{label:string;onPress:()=>void;primary?:boolean;disabled?:boolean}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={[styles.pill, primary ? styles.pillPrimary : styles.pillLight, disabled && styles.disabled]}><Text style={[styles.pillText, primary && styles.pillTextPrimary]}>{label}</Text></Pressable>;
}

function instruction(value:string) {return value.trim().replace(/^uống\s+/i, '');}
function period(time:string) {const hour=Number(time.slice(0,2)); return hour<11?'Sáng':hour<17?'Trưa':'Tối';}
function dateHeading(date:string) {return new Intl.DateTimeFormat('vi-VN', {timeZone:'UTC',weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(date+'T12:00:00Z'));}
function validDate(value:string) {if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const parsed=new Date(value+'T12:00:00Z');return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;}
function MotionCheck({taken}:{taken:boolean}) {
  const scale=useRef(new Animated.Value(1)).current;
  useEffect(()=>{
    let cancelled=false;
    void AccessibilityInfo.isReduceMotionEnabled().then(reduced=>{
      if(cancelled||reduced)return;
      scale.setValue(.82);
      Animated.sequence([
        Animated.timing(scale,{toValue:1.17,duration:180,easing:Easing.out(Easing.quad),useNativeDriver:true}),
        Animated.spring(scale,{toValue:1,friction:5,useNativeDriver:true}),
      ]).start();
    });
    return()=>{cancelled=true;scale.stopAnimation();};
  },[taken,scale]);
  return <Animated.View style={{transform:[{scale}]}}><AppIcon name={taken?'checked':'unchecked'} size={20} color={taken?colors.primary:colors.ink}/></Animated.View>;
}

function MotionBell({enabled}:{enabled:boolean}) {
  const turn=useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    let cancelled=false;
    void AccessibilityInfo.isReduceMotionEnabled().then(reduced=>{
      if(cancelled||reduced||!enabled)return;
      turn.setValue(0);
      Animated.sequence([
        Animated.timing(turn,{toValue:1,duration:130,useNativeDriver:true}),
        Animated.timing(turn,{toValue:-1,duration:220,useNativeDriver:true}),
        Animated.timing(turn,{toValue:.65,duration:170,useNativeDriver:true}),
        Animated.spring(turn,{toValue:0,friction:6,useNativeDriver:true}),
      ]).start();
    });
    return()=>{cancelled=true;turn.stopAnimation();};
  },[enabled,turn]);
  const rotate=turn.interpolate({inputRange:[-1,0,1],outputRange:['-12deg','0deg','12deg']});
  return <Animated.View style={{transform:[{rotate}]}}><AppIcon name={enabled?'bell-ring':'bell'} size={28} color={colors.ink}/></Animated.View>;
}

export function MedicationScheduleScreen() {
  const {id}=useLocalSearchParams<{id:string}>();
  const [date,setDate]=useState(today());
  const [draftDate,setDraftDate]=useState(date);
  const [editingDate,setEditingDate]=useState(false);
  const [busyKey,setBusyKey]=useState('');
  const [optimistic,setOptimistic]=useState<Record<string,string>>({});
  const [error,setError]=useState('');
  const {request}=useSession();
  const data=useData<Schedule>('aftercare/prescriptions/'+id+'/schedule?date='+date,true);
  const schedule=data.data?.date===date?data.data:null;
  const items=schedule?.items.map(item=>({...item,status:optimistic[item.medicationId+item.time]??item.status}));
  useLiveSchedule(data.retry);
  const lock=useRef(false);
  useEffect(()=>{setOptimistic({});},[data.data]);

  async function mark(item:Dose) {
    if (lock.current || !item.canRecord) return;
    lock.current=true; setBusyKey(item.medicationId+item.time); setError('');
    try {
      await request('aftercare/prescriptions/'+id+'/intakes',undefined,{method:'POST',body:{medicationId:item.medicationId,date,time:item.time,status:item.status==='taken'?'pending':'taken',expectedVersion:item.version}});
      setOptimistic(current=>({...current,[item.medicationId+item.time]:item.status==='taken'?'pending':'taken'}));
      data.retry();
    } catch (cause) {setError(cause instanceof Error?cause.message:'Chưa cập nhật được lịch uống thuốc.');}
    finally {lock.current=false; setBusyKey('');}
  }

  function open(item:Dose) {router.push({pathname:'/aftercare/reminder',params:{id,medicationId:item.medicationId,time:item.time,date}});}

  return <Screen title="Lịch uống thuốc">
    <Pressable accessibilityRole="button" accessibilityLabel="Chọn ngày xem lịch uống thuốc" onPress={()=>{setDraftDate(date);setEditingDate(value=>!value);}} style={styles.dateLine}><Text style={styles.muted}>{dateHeading(date)} · Hoàn thành {items?.filter(item=>item.status==='taken').length??0}/{items?.length??0}</Text></Pressable>
    {editingDate?<View style={styles.dateEditor}><Text style={styles.muted}>Ngày xem lịch (YYYY-MM-DD)</Text><TextInput accessibilityLabel="Ngày xem lịch" value={draftDate} onChangeText={setDraftDate} maxLength={10} style={styles.dateInput}/><Pill label="Xem ngày này" disabled={!validDate(draftDate)} onPress={()=>{setDate(draftDate);setEditingDate(false);}}/></View>:null}
    <LoadState {...data} loading={data.loading&&!schedule}/>
    {items?.map(item=><View key={item.medicationId+item.time} style={styles.doseCard}>
      <Pressable accessibilityRole="button" accessibilityLabel={'Mở nhắc uống '+item.name+' lúc '+item.time} onPress={()=>open(item)} style={styles.doseInfo}>
        <Text style={styles.muted}>{period(item.time)} · {item.time}</Text>
        <Text style={styles.medName}>{item.name}</Text>
        <Text style={styles.muted}>{item.dose} · {instruction(item.instructions)}</Text>
      </Pressable>
      <Pressable accessibilityRole="checkbox" accessibilityLabel={item.name+' '+item.time+' '+(item.status==='taken'?'Đã uống':'Chưa uống')} aria-checked={item.status==='taken'} accessibilityState={{checked:item.status==='taken',disabled:!item.canRecord||!!busyKey||!!optimistic[item.medicationId+item.time]}} disabled={!item.canRecord||!!busyKey||!!optimistic[item.medicationId+item.time]} onPress={()=>void mark(item)} style={styles.checkArea}>
        <MotionCheck taken={item.status==='taken'}/>
        <Text style={styles.checkText}>{item.status==='taken'?'Đã uống':item.status==='skipped'?'Đã bỏ qua':item.status==='snoozed'?'Đã hoãn':'Chưa uống'}</Text>
      </Pressable>
    </View>)}
    {items?.length===0?<Text style={styles.muted}>Không có mốc dùng thuốc trong ngày này.</Text>:null}
    {error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}
    <Pill label="Cài đặt nhắc nhở" onPress={()=>{const first=items?.[0];if(first)open(first);}} disabled={!items?.length}/>
    <Pill label="Xem chi tiết đơn thuốc" onPress={()=>router.push({pathname:'/aftercare/prescription',params:{id}})}/>
  </Screen>;
}

export function MedicationReminderScreen() {
  const {id,medicationId,time,date}=useLocalSearchParams<{id:string;medicationId:string;time:string;date:string}>();
  const data=useData<Schedule>('aftercare/prescriptions/'+id+'/schedule?date='+date,true);
  const {request}=useSession();
  const rawItem=data.data?.items.find(value=>value.medicationId===medicationId&&value.time===time);
  const [optimisticStatus,setOptimisticStatus]=useState<string|null>(null);
  const item=rawItem&&optimisticStatus?{...rawItem,status:optimisticStatus}:rawItem;
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const lock=useRef(false);
  useLiveSchedule(data.retry);
  useEffect(()=>{setOptimisticStatus(null);},[data.data]);

  async function record(status:string) {
    if (lock.current||!item) return;
    lock.current=true;setBusy(true);setError('');
    try {
      await request('aftercare/prescriptions/'+id+'/intakes',undefined,{method:'POST',body:{medicationId,date,time,status,expectedVersion:item.version}});
      setOptimisticStatus(status);
      data.retry();
    } catch (cause) {setError(cause instanceof Error?cause.message:'Chưa ghi nhận được.');}
    finally {lock.current=false;setBusy(false);}
  }

  async function toggle() {
    if (lock.current||!data.data) return;
    lock.current=true;setBusy(true);setError('');
    try {
      await request('aftercare/prescriptions/'+id+'/reminder',undefined,{method:'PATCH',body:{enabled:!data.data.prescription.reminderEnabled,expectedVersion:data.data.prescription.version}});
      data.retry();
    } catch (cause) {setError(cause instanceof Error?cause.message:'Chưa đổi được nhắc nhở.');}
    finally {lock.current=false;setBusy(false);}
  }

  return <Screen title="Nhắc uống thuốc">
    <LoadState {...data} loading={data.loading&&!data.data}/>
    {item&&data.data?<>
      <View style={styles.reminderCard}>
        <View style={styles.bellCircle}><MotionBell enabled={data.data.prescription.reminderEnabled}/></View>
        <Text style={styles.time}>{item.time}</Text>
        <Text style={styles.reminderName}>{item.name}</Text>
        <Text style={styles.muted}>{item.dose} · {instruction(item.instructions)}</Text>
      </View>
      <Pressable accessibilityRole="switch" accessibilityLabel="Bật nhắc nhở hằng ngày" aria-checked={data.data.prescription.reminderEnabled} accessibilityState={{checked:data.data.prescription.reminderEnabled,disabled:busy||data.data.prescription.archived}} disabled={busy||data.data.prescription.archived} onPress={()=>void toggle()} style={styles.switchRow}>
        <View style={[styles.switchTrack,data.data.prescription.reminderEnabled&&styles.switchOn]}><View style={[styles.switchThumb,data.data.prescription.reminderEnabled&&styles.switchThumbOn]}/></View>
        <Text style={styles.switchText}>Bật nhắc nhở hằng ngày</Text>
      </Pressable>
      <Pill label="Đã uống" primary disabled={busy||!!optimisticStatus||!item.canRecord||item.status==='taken'} onPress={()=>void record('taken')}/>
      <Pill label="Nhắc lại sau 15 phút" disabled={busy||!!optimisticStatus||!item.canRecord||!data.data.prescription.reminderEnabled||date!==today()||['taken','skipped'].includes(item.status)} onPress={()=>void record('snoozed')}/>
      <Pill label="Bỏ qua" disabled={busy||!!optimisticStatus||!item.canRecord||item.status==='skipped'} onPress={()=>void record('skipped')}/>
      <View style={styles.note}><Text style={styles.noteText}>Trạng thái được lưu trong ứng dụng. Lời nhắc hiện chỉ hiển thị khi mở lịch uống thuốc.</Text></View>
      {!item.canRecord?<Text style={styles.muted}>Chưa đến giờ hoặc đơn đã lưu trữ; chưa thể ghi nhận.</Text>:null}
      {item.snoozedUntil?<Text style={styles.muted}>Đã hẹn nhắc trong ứng dụng sau 15 phút.</Text>:null}
      {error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}
      {item.version>0?<Pressable accessibilityRole="button" accessibilityLabel="Sửa ghi nhận" disabled={busy||!!optimisticStatus||!item.canRecord} onPress={()=>void record('pending')}><Text style={styles.editLink}>Sửa ghi nhận</Text></Pressable>:null}
    </>:data.data?<Text style={styles.muted}>Không có mốc nhắc này trong đơn thuốc.</Text>:null}
  </Screen>;
}

const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.surface},scroll:{flex:1,minHeight:0},content:{paddingHorizontal:20,paddingTop:8,paddingBottom:28,gap:12,flexGrow:1},
  homeIndicator:{width:108,height:4,borderRadius:4,backgroundColor:colors.ink,alignSelf:'center',marginBottom:6},
  dateLine:{minHeight:20,justifyContent:'center'},muted:{fontFamily:'Inter',fontSize:13,lineHeight:18,color:colors.muted},
  dateEditor:{gap:5},dateInput:{height:40,borderWidth:1,borderColor:colors.border,borderRadius:8,paddingHorizontal:12,fontFamily:'Inter',fontSize:13,color:colors.ink},
  doseCard:{minHeight:88,borderWidth:1,borderColor:colors.border,borderRadius:12,padding:14,flexDirection:'row',alignItems:'center',gap:8},
  doseInfo:{flex:1,gap:3},medName:{fontFamily:'InterSemiBold',fontSize:15,lineHeight:20,color:colors.ink},checkArea:{flexDirection:'row',alignItems:'center',gap:4,minHeight:44},checkText:{fontFamily:'Inter',fontSize:12,color:colors.ink},
  pill:{height:44,borderRadius:24,alignItems:'center',justifyContent:'center'},pillLight:{backgroundColor:colors.tint},pillPrimary:{backgroundColor:colors.primary},pillText:{fontFamily:'Inter',fontSize:14,color:colors.primary},pillTextPrimary:{color:'white'},disabled:{opacity:.5},
  reminderCard:{minHeight:184,borderWidth:1,borderColor:colors.border,borderRadius:12,alignItems:'center',justifyContent:'center',padding:14,gap:8},
  bellCircle:{width:64,height:64,borderRadius:32,backgroundColor:colors.subtle,alignItems:'center',justifyContent:'center'},
  time:{fontFamily:'InterSemiBold',fontSize:20,lineHeight:26,color:colors.ink},reminderName:{fontFamily:'InterSemiBold',fontSize:16,lineHeight:22,color:colors.ink},
  switchRow:{minHeight:40,flexDirection:'row',alignItems:'center',gap:8},switchTrack:{width:36,height:20,borderRadius:10,backgroundColor:colors.border,padding:2,justifyContent:'center'},switchOn:{backgroundColor:colors.primary},switchThumb:{width:16,height:16,borderRadius:8,backgroundColor:'white'},switchThumbOn:{alignSelf:'flex-end'},switchText:{fontFamily:'Inter',fontSize:12,color:colors.ink},
  note:{backgroundColor:colors.subtle,borderRadius:8,padding:12,minHeight:64,justifyContent:'center'},noteText:{fontFamily:'Inter',fontSize:11,lineHeight:16,color:colors.ink},
  error:{fontFamily:'Inter',fontSize:13,color:'#C53B3B'},editLink:{fontFamily:'Inter',fontSize:12,color:colors.primary,textAlign:'center',paddingVertical:8},
});
