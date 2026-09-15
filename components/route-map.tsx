'use client';
import HelpLabel from './field-help';
import {translate,type Language} from '@/lib/localization';
import {useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import type {MapPoint} from './route-leaflet';
import s from './route-workspace.module.css';
const Leaflet=dynamic(()=>import('./route-leaflet'),{ssr:false});
const cache=new Map<string,Omit<MapPoint,'index'>|null>();
let queue:Promise<unknown>=Promise.resolve(),lastRequest=0;
function locate(address:string){const key=address.trim().toLocaleLowerCase();const job=queue.catch(()=>{}).then(async()=>{if(cache.has(key))return cache.get(key)!;await new Promise(r=>setTimeout(r,Math.max(0,1600-(Date.now()-lastRequest))));lastRequest=Date.now();const response=await fetch('/api/geocode',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address})});if(!response.ok)throw Error(response.status===429?'limit':'unavailable');const data=await response.json() as {point:Omit<MapPoint,'index'>|null};if(cache.size>=300)cache.delete(cache.keys().next().value!);cache.set(key,data.point);return data.point as Omit<MapPoint,'index'>|null;});queue=job;return job;}
export default function RouteMap({origin,stops,en:language}:{origin:string;stops:{name:string}[];en:boolean|Language}){
 const locale=typeof language==='boolean'?(language?'en':'es'):language,t=(es:string,en:string)=>translate(locale,es,en);
 const [leg,setLeg]=useState('all'),[shown,setShown]=useState(false),[points,setPoints]=useState<MapPoint[]>([]),[failures,setFailures]=useState<string[]>([]),[busy,setBusy]=useState(false),[limit,setLimit]=useState(false);const generation=useRef(0);
 const all=leg==='all',index=Number(leg),from=all?origin:index===0?origin:stops[index-1]?.name||'',to=all?stops.at(-1)?.name||'':stops[index]?.name||'',via=all?stops.slice(0,-1).map(p=>p.name):[],addresses=[from,...via,to],ready=addresses.every(p=>p.trim())&&addresses.length<=50;
 const signature=JSON.stringify(addresses);
 useEffect(()=>{generation.current++;setShown(false);setBusy(false);setPoints([]);setFailures([]);},[signature]);
 useEffect(()=>()=>{generation.current++;},[]);
 async function show(){const token=++generation.current;setShown(true);setPoints([]);setFailures([]);setBusy(true);setLimit(false);for(const [i,address] of addresses.entries()){if(token!==generation.current)return;try{const point=await locate(address);if(token!==generation.current)return;if(point)setPoints(old=>[...old,{...point,index:i}]);else setFailures(old=>[...old,address]);}catch(e){if(token!==generation.current)return;setFailures(old=>[...old,address]);if((e as Error).message==='limit'){setLimit(true);break;}}}if(token===generation.current)setBusy(false);}
 const external=new URLSearchParams({api:'1',origin:from,destination:to,travelmode:'driving'});if(via.length)external.set('waypoints',via.join('|'));
 return <section className={s.stop} aria-label={t('Consultar recorrido','Look up route')}><h3>{t('Consulta el recorrido','Look up your route')}</h3><div className={s.grid}><HelpLabel locale={locale} helpKey="Recorrido que quieres ver" className={s.field}>{t('Recorrido que quieres ver','Route to display')}<select value={leg} onChange={e=>setLeg(e.target.value)}><option value="all">{t('Viaje completo','Whole trip')}</option>{stops.map((p,j)=><option key={j} value={j}>{j+1}. {p.name||t('Tramo','Leg')}</option>)}</select></HelpLabel></div>
 <p className={s.hint}>{t('El mapa localiza lugares; no calcula carreteras, kilómetros ni restricciones de camiones. Al mostrarlo se consultan las direcciones en HeiGIT y los mapas en OpenStreetMap.','The map locates places; it does not calculate roads, distances or truck restrictions. Showing it queries addresses through HeiGIT and maps through OpenStreetMap.')}</p>
 {!ready&&<p role="status">{t('Completa la salida y los lugares del recorrido.','Complete the origin and route locations.')}</p>}
 <div className={s.actions}><button type="button" className="secondary-button" disabled={!ready||busy} onClick={()=>void show()}>{busy?t('Localizando…','Locating…'):t('Mostrar lugares en el mapa','Show places on the map')}</button>{ready&&<a target="_blank" rel="noreferrer" href={'https://www.google.com/maps/dir/?'+external}>{t('Abrir en Google Maps ↗','Open in Google Maps ↗')}</a>}</div>
 {all&&via.length>3&&<p className={s.hint}>{t('El enlace externo puede omitir paradas según el dispositivo; consulta cada tramo para conservarlas todas.','The external link may omit stops depending on your device; look up each leg to preserve every stop.')}</p>}
 {shown&&<div style={{marginTop:16}}><Leaflet points={points}/></div>}
 <div role="status">{failures.map((place,i)=><p key={i}>{t('No se ha podido localizar','Could not locate')} «{place}». {t('Revisa la dirección o consúltala en Google Maps.','Check the address or look it up in Google Maps.')}</p>)}{limit&&<p>{t('Límite temporal de consultas. Espera un minuto antes de volver a intentarlo.','Temporary query limit. Wait a minute before trying again.')}</p>}</div></section>;
}
