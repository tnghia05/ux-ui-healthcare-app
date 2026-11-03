import RealMap from '../../components/maps/RealMap';
import {hospitalAvatars} from '../../components/maps/hospital-avatars';
import {validPoint} from '../../components/maps/types';
import type {MapPoint,MapStatus,UserPoint} from '../../components/maps/types';
import {useCallback,useMemo,useRef,useState} from 'react';
import {Linking,Text,View} from 'react-native';
import * as Location from 'expo-location';
import {router,useFocusEffect,useLocalSearchParams} from 'expo-router';
import {Frame} from './BookingScreens';
import {LoadState,useData} from '../discovery/DiscoveryScreens';
import {Action,styles} from '../auth/ui';
import {useSession} from '../auth/session';
import {ApiError} from '../../api/client';
import {colors} from '../../theme/tokens';

type Destination={bookingId:string;hospitalId:string;hospitalName:string;hospitalAddress:string;imageKey?:string;coordinates:UserPoint|null};
type Step={distanceMeters:number;road:string;type:string;modifier:string;exit?:number};
type Route={geometry:[number,number][];distanceMeters:number;durationSeconds:number;steps:Step[];calculatedAt:string};
const distance=(m:number)=>m<1000?Math.round(m)+' m':(m/1000).toLocaleString('vi-VN',{maximumFractionDigits:1})+' km';
function instruction(s:Step){const directions:Record<string,string>={left:'rẽ trái',right:'rẽ phải','slight left':'chếch trái','slight right':'chếch phải','sharp left':'rẽ ngoặt trái','sharp right':'rẽ ngoặt phải',straight:'đi thẳng',uturn:'quay đầu'};const action=s.type==='depart'?'Bắt đầu di chuyển':s.type==='arrive'?'Đến điểm đích':s.type==='roundabout'||s.type==='rotary'?'Đi qua vòng xuyến'+(s.exit?', ra ở lối '+s.exit:''):directions[s.modifier]||'Tiếp tục đi';return action.charAt(0).toUpperCase()+action.slice(1)+(s.road?' · '+s.road:'');}
export default function DirectionsScreen(){
 const {id}=useLocalSearchParams<{id:string}>(),{request}=useSession();const r=useData<Destination>('navigation/'+encodeURIComponent(id??''));
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[origin,setOrigin]=useState<UserPoint>(),[route,setRoute]=useState<Route>(),[focused,setFocused]=useState(false),[mapError,setMapError]=useState(false),[mapKey,setMapKey]=useState(0);
 const generation=useRef(0),lock=useRef(false),controller=useRef<AbortController|null>(null);
 useFocusEffect(useCallback(()=>{setFocused(true);setBusy(false);setOrigin(undefined);setRoute(undefined);setError('');return()=>{setFocused(false);generation.current++;controller.current?.abort();lock.current=false;};},[id]));
 const points=useMemo<MapPoint[]>(()=>r.data?.coordinates?[{id:r.data.hospitalId,name:r.data.hospitalName,...r.data.coordinates,avatar:hospitalAvatars[r.data.imageKey??'']}]:[],[r.data]);
 async function locate(){if(lock.current||!r.data?.coordinates)return;lock.current=true;const version=++generation.current;setBusy(true);setError('');setRoute(undefined);setOrigin(undefined);let timer:ReturnType<typeof setTimeout>|undefined;const c=new AbortController();controller.current=c;
  try{const permission=await Location.requestForegroundPermissionsAsync();if(permission.status!=='granted')throw new Error('permission');const pos=await Promise.race([Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High}),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('gps')),15000);})]);if(version!==generation.current)return;const p={latitude:pos.coords.latitude,longitude:pos.coords.longitude,...(pos.coords.accuracy?{accuracy:pos.coords.accuracy}:{})};if(!validPoint(p))throw new Error('gps');setOrigin(p);const result=await request<Route>('navigation/'+encodeURIComponent(id)+'/route',c.signal,{method:'POST',body:{latitude:p.latitude,longitude:p.longitude,consent:true}});if(version===generation.current)setRoute(result);
  }catch(e){if(version===generation.current){if(e instanceof Error&&e.message==='permission'){setOrigin(undefined);setError('Chưa được cấp quyền vị trí. Bạn có thể bật lại quyền hoặc mở Google Maps để chọn điểm xuất phát.');}else if(e instanceof ApiError)setError(e.status>=500?'Chưa tính được tuyến đường. Thử lại hoặc mở Google Maps.':e.message);else setError('Chưa lấy được vị trí hoặc lộ trình. Kiểm tra GPS, quyền vị trí và kết nối; web cần HTTPS hoặc localhost.');}}
  finally{if(timer)clearTimeout(timer);if(version===generation.current){lock.current=false;setBusy(false);}}
 }
 async function open(){if(!r.data)return;const dest=r.data.coordinates?r.data.coordinates.latitude+','+r.data.coordinates.longitude:r.data.hospitalName+', '+r.data.hospitalAddress+', Đà Nẵng, Việt Nam';const url='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(dest)+'&travelmode=driving&dir_action=navigate'+(origin?'&origin='+encodeURIComponent(origin.latitude+','+origin.longitude):'');try{await Linking.openURL(url);}catch{setError('Không mở được Google Maps. Bạn có thể tìm bệnh viện bằng địa chỉ bên dưới.');}}
 function status(s:MapStatus){if(s==='tiles-loaded')setMapError(false);if(s==='tile-error')setMapError(true);}
 return <Frame title="Chỉ đường đến bệnh viện" footer={<Action label="Tôi đã đến" disabled={!r.data} onPress={()=>router.push({pathname:'/appointment/arrived',params:{id:r.data!.bookingId}})}/>}><LoadState {...r}/>{r.data?<>
  <View style={{height:330,borderRadius:16,overflow:'hidden',backgroundColor:colors.subtle}}>{focused?<RealMap key={mapKey} points={points} selectedId={r.data.hospitalId} onSelect={()=>{}} userLocation={origin} route={route?.geometry} compact onStatus={status}/>:null}{mapError?<View style={{position:'absolute',top:12,left:12,right:60,backgroundColor:'white',borderRadius:8,padding:8}}><Text style={styles.label}>Chưa tải được nền bản đồ.</Text><Action label="Tải lại bản đồ" secondary onPress={()=>{setMapError(false);setMapKey(k=>k+1);}}/></View>:null}</View>
  <Text style={styles.title}>{r.data.hospitalName}</Text><Text selectable style={styles.body}>{r.data.hospitalAddress}</Text>
  {r.data.coordinates?<><Action label={origin?'Cập nhật vị trí và lộ trình':'Lấy vị trí và tìm đường'} busy={busy} onPress={()=>void locate()}/><Text style={styles.label}>Bấm tìm đường sẽ gửi vị trí hiện tại và điểm đến qua backend tới OSRM/FOSSGIS để tính tuyến ô tô. Vị trí không được lưu trong hồ sơ.</Text></>:<Text style={styles.label}>Bệnh viện chưa có tọa độ đã kiểm tra. Mở Google Maps để tìm theo địa chỉ.</Text>}
  {route?<><View style={{padding:16,backgroundColor:colors.tint,borderRadius:12,gap:8}}><Text style={[styles.body,{fontFamily:'InterSemiBold'}]}>{distance(route.distanceMeters)} · khoảng {Math.max(1,Math.ceil(route.durationSeconds/60))} phút</Text><Text style={styles.label}>Tuyến ô tô · Chưa tính giao thông trực tiếp</Text><Text style={styles.label}>Cập nhật {new Date(route.calculatedAt).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}{origin?.accuracy?' · GPS ±'+Math.round(origin.accuracy)+' m':''}</Text></View><Text style={[styles.body,{fontFamily:'InterSemiBold'}]}>Lộ trình</Text>{route.steps.map((s,i)=><View key={i} style={{paddingVertical:8,borderBottomWidth:1,borderColor:colors.border,gap:4}}><Text style={styles.body}>{i+1}. {instruction(s)}</Text><Text style={styles.label}>{distance(s.distanceMeters)}</Text></View>)}</>:null}
  <Text style={styles.label}>Mở Google Maps để dẫn đường từng chặng. Điểm đến lấy từ bệnh viện trong lịch khám; ứng dụng không tự xác nhận check-in.</Text>
  <Action label="Mở chỉ đường trong bản đồ" secondary onPress={()=>void open()}/>
  <Action label="Mở mã QR check-in" secondary onPress={()=>router.push({pathname:'/appointment/qr',params:{id:r.data!.bookingId}})}/>
 </>:null}{error?<Text accessibilityRole="alert" style={styles.error}>{error}</Text>:null}</Frame>;
}
