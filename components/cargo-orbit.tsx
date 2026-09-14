'use client';
import {translate,type Language} from '@/lib/localization';

import {useRef,useState} from 'react';
import type {Space,Cargo,Placed} from '@/lib/cargo';
import {cargoColors} from './cargo-diagram';
type Point=[number,number,number];
export default function CargoOrbit({space,items,placed,en:language,onSelect}:{space:Space;items:Cargo[];placed:Placed[];en:boolean|Language;onSelect:(p:Placed)=>void}){
 const locale=typeof language==='boolean'?(language?'en':'es'):language;const en=locale==='en';
 const [angle,setAngle]=useState({yaw:.65,pitch:.55,zoom:1});
 const drag=useRef<{x:number;y:number;id:number}|null>(null);
 const project=([x,y,z]:Point)=>{x-=space.width/2;y-=space.length/2;z-=space.height/2;const a=x*Math.cos(angle.yaw)+y*Math.sin(angle.yaw),b=-x*Math.sin(angle.yaw)+y*Math.cos(angle.yaw);return [a,b*Math.sin(angle.pitch)-z*Math.cos(angle.pitch),b*Math.cos(angle.pitch)+z*Math.sin(angle.pitch)];};
 const corners=(x:number,y:number,z:number,w:number,l:number,h:number):Point[]=>[[x,y,z],[x+w,y,z],[x+w,y+l,z],[x,y+l,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+l,z+h],[x,y+l,z+h]];
 const room=corners(0,0,0,space.width,space.length,space.height).map(project),xs=room.map(p=>p[0]),ys=room.map(p=>p[1]);
 const scale=Math.min(800/(Math.max(...xs)-Math.min(...xs)),390/(Math.max(...ys)-Math.min(...ys)))*angle.zoom;
 const xy=(p:number[])=>`${455+p[0]*scale},${250+p[1]*scale}`;
 const faces=[[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]];
 const polygons=placed.flatMap(p=>{const pts=corners(p.x,p.y,p.z,p.width,p.length,p.height).map(project);return faces.map((f,i)=>({p,i,pts:f.map(j=>pts[j]),depth:f.reduce((v,j)=>v+pts[j][2],0)/4}));}).sort((a,b)=>a.depth-b.depth);
 return <><div style={{display:'flex',gap:8,flexWrap:'wrap',padding:10}}><span>{translate(locale,"Arrastra para girar · Flechas del teclado para rotar","Drag to rotate · Arrow keys to turn")}</span><button type="button" onClick={()=>setAngle(a=>({...a,zoom:Math.min(3,a.zoom*1.2)}))} aria-label={translate(locale,"Acercar","Zoom in")}>+</button><button type="button" onClick={()=>setAngle(a=>({...a,zoom:Math.max(.5,a.zoom/1.2)}))} aria-label={translate(locale,"Alejar","Zoom out")}>−</button><button type="button" onClick={()=>setAngle({yaw:.65,pitch:.55,zoom:1})}>{translate(locale,"Restablecer vista","Reset view")}</button></div>
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 910 500" tabIndex={0} role="img" aria-label={translate(locale,"Carga 3D interactiva: arrastra o usa las flechas","Interactive 3D load: drag or use arrow keys")} style={{touchAction:'none',cursor:'grab',width:'100%'}} onPointerDown={e=>{drag.current={x:e.clientX,y:e.clientY,id:e.pointerId};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;drag.current={x:e.clientX,y:e.clientY,id:e.pointerId};setAngle(a=>({...a,yaw:a.yaw+dx*.01,pitch:Math.max(-1.5,Math.min(1.5,a.pitch+dy*.01))}));}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();setAngle(a=>({...a,yaw:a.yaw+(e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0),pitch:Math.max(-1.5,Math.min(1.5,a.pitch+(e.key==='ArrowUp'?.15:e.key==='ArrowDown'?-.15:0)))}));}}>
 <polygon points={room.slice(0,4).map(xy).join(' ')} fill="#8192aa22" stroke="#8192aa"/>
 {(space.zones||[]).map(z=><polygon key={z.id} points={corners(z.x,z.y,0,z.width,z.length,0).slice(0,4).map(project).map(xy).join(' ')} fill={z.kind==='aisle'?'#13a18a66':'#d04b5966'}/>)}
 {polygons.map(f=><polygon key={`${f.p.id}-${f.p.index}-${f.i}`} points={f.pts.map(xy).join(' ')} fill={cargoColors[items.findIndex(i=>i.id===f.p.id)%cargoColors.length]} stroke="#172436" strokeWidth=".7" style={{filter:`brightness(${.65+f.i*.06})`}} onDoubleClick={()=>onSelect(f.p)}><title>{items.find(i=>i.id===f.p.id)?.name} #{f.p.index} · Z {f.p.z} mm</title></polygon>)}
 <g fill="none" stroke="#8192aa" strokeDasharray="5 5">{[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].map(([a,b])=><polyline key={`${a}-${b}`} points={`${xy(room[a])} ${xy(room[b])}`}/>)}</g>
 </svg></>;
}
