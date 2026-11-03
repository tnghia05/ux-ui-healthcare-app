import {useMemo,useState} from 'react';
import {Text,View} from 'react-native';
import RealMap from '../../components/maps/RealMap';
import {hospitalAvatars} from '../../components/maps/hospital-avatars';
import {validPoint} from '../../components/maps/types';
import type {MapFocus,MapPoint} from '../../components/maps/types';
import {Action,styles} from '../auth/ui';
import {colors} from '../../theme/tokens';

type Hospital={id:string;name:string;imageKey?:string;coordinates?:{latitude:number;longitude:number}};
// Same verified locations as the hospital catalog; covers older running API responses.
const knownCoordinates:Record<string,{latitude:number;longitude:number}>={
 'vinmec-da-nang':{latitude:16.0387507,longitude:108.2112279},
 'hoan-my-da-nang':{latitude:16.059401,longitude:108.2098753},
 'gia-dinh-da-nang':{latitude:16.051289,longitude:108.210203},
};
const knownImageKeys:Record<string,string>={
 'vinmec-da-nang':'f1_imgNhBnhVin',
 'hoan-my-da-nang':'f1_imgNhBnhVin1',
 'gia-dinh-da-nang':'f1_imgNhBnhVin2',
};

export function LabFacilityMap({hospitals,selectedId,onSelect}:{hospitals:Hospital[];selectedId:string;onSelect:(id:string)=>void}){
 const [mapKey,setMapKey]=useState(0),[error,setError]=useState(false),[focus,setFocus]=useState<MapFocus>({kind:'all',serial:1});
 const points=useMemo<MapPoint[]>(()=>hospitals.flatMap(h=>{const coordinates=h.coordinates&&validPoint(h.coordinates)?h.coordinates:knownCoordinates[h.id];const imageKey=h.imageKey??knownImageKeys[h.id];return coordinates&&validPoint(coordinates)?[{id:h.id,name:h.name,latitude:coordinates.latitude,longitude:coordinates.longitude,avatar:hospitalAvatars[imageKey??'']}]:[];}),[hospitals]);
 function choose(id:string){onSelect(id);setFocus(f=>({kind:'point',id,serial:f.serial+1}));}
 return <View testID="lab-facility-map" style={{height:280,borderRadius:12,overflow:'hidden',backgroundColor:colors.subtle}}>
  {points.length?<RealMap key={mapKey} points={points} selectedId={selectedId} onSelect={choose} focus={focus} compact onStatus={status=>{if(status==='tile-error')setError(true);if(status==='tiles-loaded')setError(false);}}/>:<View style={{flex:1,justifyContent:'center',alignItems:'center',padding:16}}><Text style={styles.label}>Chưa có tọa độ cho các cơ sở xét nghiệm.</Text></View>}
  {error?<View style={{position:'absolute',top:8,left:8,right:8,backgroundColor:'white',borderRadius:8,padding:8}}><Text style={styles.label}>Chưa tải được nền bản đồ.</Text><Action label="Tải lại bản đồ" secondary onPress={()=>{setError(false);setMapKey(k=>k+1);}}/></View>:null}
 </View>;
}
