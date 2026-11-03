export type MapPoint={id:string;name:string;avatar?:string;latitude:number;longitude:number};
export type UserPoint={latitude:number;longitude:number;accuracy?:number};
export type MapFocus={kind:'all'|'point'|'user';id?:string;serial:number};
export type MapStatus='ready'|'tiles-loaded'|'tile-error';
export type MapProps={points:MapPoint[];selectedId:string;onSelect:(id:string)=>void;focus?:MapFocus;userLocation?:UserPoint;route?:[number,number][];compact?:boolean;onStatus?:(status:MapStatus)=>void};
export const TILE_URL=process.env.EXPO_PUBLIC_MAP_TILE_URL||'https://tile.openstreetmap.de/{z}/{x}/{y}.png';
export const validPoint=(p:UserPoint)=>Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)&&Math.abs(p.latitude)<=85&&Math.abs(p.longitude)<=180;
