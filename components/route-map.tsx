'use client';
import {useState} from 'react';
import s from './route-workspace.module.css';

export default function RouteMap({origin,stops,en}:{origin:string;stops:{name:string}[];en:boolean}){
 const t=(es:string,english:string)=>en?english:es;
 const key=process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY?.trim();
 const [leg,setLeg]=useState('all'),[shown,setShown]=useState(''),[avoid,setAvoid]=useState(false);
 const index=Number(leg);
 const all=leg==='all';
 const from=all?origin:(index===0?origin:stops[index-1]?.name||'');
 const to=all?stops.at(-1)?.name||'':stops[index]?.name||'';
 const via=all?stops.slice(0,-1).map(p=>p.name):[];
 const ready=!!from.trim()&&!!to.trim()&&via.every(p=>!!p.trim())&&via.length<=20;
 const params=new URLSearchParams({origin:from,destination:to,mode:'driving',language:en?'en':'es'});
 if(via.length)params.set('waypoints',via.join('|'));
 if(avoid)params.set('avoid','tolls');
 if(key)params.set('key',key);
 const src='https://www.google.com/maps/embed/v1/directions?'+params;
 // Maps URLs support fewer waypoints on mobile; per-leg links always remain available.
 const external=new URLSearchParams({api:'1',origin:from,destination:to,travelmode:'driving'});
 if(via.length)external.set('waypoints',via.join('|'));
 return <section className={s.stop} aria-label={t('Consultar recorrido','Look up route')}>
 <h3>{t('Consulta el recorrido','Look up your route')}</h3>
 <div className={s.grid}><label className={s.field}>{t('Recorrido que quieres ver','Route to display')}<select value={leg} onChange={e=>{setLeg(e.target.value);setShown('');}}><option value="all">{t('Viaje completo','Whole trip')}</option>{stops.map((p,j)=><option key={j} value={j}>{j+1}. {p.name||t('Tramo','Leg')}</option>)}</select></label>
 {key&&<label className={s.check}><input type="checkbox" checked={avoid} onChange={e=>{setAvoid(e.target.checked);setShown('');}}/>{t('Preferir evitar peajes','Prefer avoiding tolls')}</label>}</div>
 <p className={s.hint}>{t('Consulta los kilómetros de cada tramo y escríbelos arriba. El mapa no rellena los datos ni valida restricciones de camiones. Al abrirlo, Google recibe las direcciones consultadas.','Look up each leg’s kilometres and enter them above. The map does not fill in data or validate truck restrictions. Opening it sends the queried addresses to Google.')}</p>
 {!key&&<p className={s.hint}>{t('El mapa integrado todavía no está activado. Puedes consultar el recorrido en Google Maps.','The embedded map is not activated yet. You can look up the route in Google Maps.')}</p>}
 {!ready&&<p role="status">{via.length>20?t('Selecciona un tramo: el mapa integrado admite hasta 20 paradas intermedias.','Select a leg: the embedded map supports up to 20 intermediate stops.'):t('Completa la salida y los lugares del recorrido.','Complete the origin and route locations.')}</p>}
 <div className={s.actions}>{key&&<button type="button" className="secondary-button" disabled={!ready} onClick={()=>setShown(shown===src?'':src)}>{shown===src?t('Ocultar mapa','Hide map'):t('Mostrar recorrido en Google Maps','Show route in Google Maps')}</button>}
 {ready&&<a target="_blank" rel="noreferrer" href={'https://www.google.com/maps/dir/?'+external}>{t('Abrir en Google Maps ↗','Open in Google Maps ↗')}</a>}</div>
 {all&&via.length>3&&<p className={s.hint}>{t('El enlace externo puede omitir paradas según el dispositivo; consulta cada tramo para conservarlas todas.','The external link may omit stops depending on your device; look up each leg to preserve every stop.')}</p>}
 {key&&ready&&shown===src&&<iframe title={t('Recorrido en Google Maps','Route in Google Maps')} src={shown} width="100%" height="420" style={{border:0,borderRadius:10,marginTop:16}} referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>}
 </section>;
}
