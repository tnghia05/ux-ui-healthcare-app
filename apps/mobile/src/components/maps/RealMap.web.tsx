import {useEffect,useMemo,useRef,useState} from 'react';
import {buildMapHtml} from './map-html';
import type {MapProps} from './types';
export default function RealMap(props:MapProps){
 const frame=useRef<HTMLIFrameElement>(null),latest=useRef(props),token=useRef('map-'+Date.now()+'-'+Math.random().toString(36).slice(2));latest.current=props;
 const [ready,setReady]=useState(false);const html=useMemo(()=>buildMapHtml(token.current),[]);
 const send=()=>{const p=latest.current;frame.current?.contentWindow?.postMessage({channel:'uxui-map',token:token.current,type:'update',points:p.points,selectedId:p.selectedId,focus:p.focus,userLocation:p.userLocation,route:p.route,compact:p.compact},window.location.origin);};
 useEffect(()=>{function receive(e:MessageEvent){if(e.source!==frame.current?.contentWindow||!e.data||e.data.channel!=='uxui-map'||e.data.token!==token.current)return;const d=e.data;if(d.type==='ready'){setReady(true);latest.current.onStatus?.('ready');send();}else if(d.type==='select'&&typeof d.id==='string'&&latest.current.points.some(p=>p.id===d.id))latest.current.onSelect(d.id);else if(d.type==='tiles-loaded'||d.type==='tile-error')latest.current.onStatus?.(d.type);}window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[]);
 useEffect(()=>{if(ready)send();},[ready,props.points,props.selectedId,props.focus,props.userLocation,props.route,props.compact]);
 return <iframe ref={frame} title="Bản đồ bệnh viện Đà Nẵng" srcDoc={html} sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin" onLoad={()=>{setReady(true);send();}} style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0}}/>;
}
