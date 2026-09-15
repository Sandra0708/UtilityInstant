import {translate,type Language} from '@/lib/localization';
import type {Cargo,Space,Placed} from '@/lib/cargo';
export const cargoColors=['#477cf5','#13a18a','#cf8526','#9263d8','#d65c84','#238eaa','#859836','#a67252'];
export default function CargoDiagram({space,items,placed,view,en:language,onSelect}:{space:Space;items:Cargo[];placed:Placed[];view:'top'|'side'|'perspective';en:boolean|Language;onSelect?:(p:Placed)=>void}){
 const locale=typeof language==='boolean'?(language?'en':'es'):language;const en=locale==='en';
 const {length:L,width:W,height:H}=space,perspective=view==='perspective',side=view==='side';
 const scale=perspective?Math.min(760/(L+W*.45),340/((W+H)*.65)):Math.min(820/L,330/(side?H:W));
 const base=side?70+H*scale:perspective?70+H*scale*.65:70;
 const point=(x:number,y:number,z=0):[number,number]=>perspective?[45+(y+x*.45)*scale,base+(x-z)*scale*.65]:side?[45+y*scale,base-z*scale]:[45+y*scale,base+x*scale];
 const poly=(points:number[][])=>points.map(p=>p.join(',')).join(' ');
 const floor=side?[point(0,0),point(0,L),point(0,L,H),point(0,0,H)]:[point(0,0),point(0,L),point(W,L),point(W,0)];
 const ordered=[...placed].sort((a,b)=>side?b.x-a.x||a.z-b.z:a.z-b.z||a.x-b.x||a.y-b.y);
 return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 910 500" role="img" aria-label={translate(locale,"Distribución de carga con medidas interiores","Cargo layout with internal dimensions")} style={{color:'#7f8fa8'}}>
 <title>{`${translate(locale,"Plano de carga","Load plan")} · ${L} × ${W} × ${H} mm`}</title>
 <polygon points={poly(floor)} fill="#8192aa12" stroke="#7f8fa8" strokeWidth="2"/>
 {perspective&&<g stroke="#7f8fa8" strokeDasharray="5 5" fill="none">{[[0,0],[0,L],[W,L],[W,0]].map(([x,y],i)=><line key={i} x1={point(x,y)[0]} y1={point(x,y)[1]} x2={point(x,y,H)[0]} y2={point(x,y,H)[1]}/>)}<polygon points={poly([point(0,0,H),point(0,L,H),point(W,L,H),point(W,0,H)])}/></g>}
 {(space.zones||[]).map(zone=>{const {x,y,width:w,length:l}=zone;const corners=side?[point(x,y),point(x,y+l),point(x,y+l,H),point(x,y,H)]:[point(x,y),point(x,y+l),point(x+w,y+l),point(x+w,y)];return <polygon key={zone.id} points={poly(corners)} fill={zone.kind==='aisle'?'#13a18a':'#d04b59'} fillOpacity=".22" stroke={zone.kind==='aisle'?'#13a18a':'#d04b59'} strokeDasharray="4 3"><title>{zone.kind==='aisle'?(translate(locale,"Pasillo reservado","Reserved aisle")):(translate(locale,"Zona bloqueada","Blocked zone"))}</title></polygon>;})}
 {ordered.filter(p=>view!=='top'||p.z===0).map(p=>{const color=cargoColors[items.findIndex(i=>i.id===p.id)%cargoColors.length];const x=p.x,y=p.y,z=p.z,h=perspective?p.height:0;const top=side?[point(x,y,z),point(x,y+p.length,z),point(x,y+p.length,z+p.height),point(x,y,z+p.height)]:[point(x,y,z+h),point(x,y+p.length,z+h),point(x+p.width,y+p.length,z+h),point(x+p.width,y,z+h)];const name=items.find(i=>i.id===p.id)?.name;return <g key={`${p.id}-${p.index}`} role={onSelect?'button':undefined} tabIndex={onSelect?0:undefined} aria-label={`${name} #${p.index}`} onClick={()=>onSelect?.(p)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect?.(p);}}} style={{cursor:onSelect?'pointer':undefined}}>
 <title>{`${name} #${p.index} · ${p.length} × ${p.width} × ${p.height} mm · ${p.weight} kg · z ${p.z} mm`}</title>
 {perspective&&<><polygon points={poly([point(x+p.width,y,z),point(x+p.width,y+p.length,z),top[2],top[3]])} fill={color} fillOpacity=".65" stroke="#0f253c" strokeWidth=".7"/><polygon points={poly([point(x,y+p.length,z),point(x+p.width,y+p.length,z),top[2],top[1]])} fill={color} fillOpacity=".85" stroke="#0f253c" strokeWidth=".7"/></>}
 <polygon points={poly(top)} fill={color} stroke="#0f253c" strokeWidth="1"/>
 {p.length*scale>22&&<text x={top.reduce((n,q)=>n+q[0],0)/4} y={top.reduce((n,q)=>n+q[1],0)/4+3} textAnchor="middle" fill="#fff" fontSize="10" fontFamily="Arial">{items.findIndex(i=>i.id===p.id)+1}.{p.index}</text>}</g>;})}
 <text x="45" y="25" fill="currentColor" fontSize="16" fontFamily="Arial">{translate(locale,"Fondo","Length")}: {L} mm · {translate(locale,"Ancho","Width")}: {W} mm · {translate(locale,"Alto","Height")}: {H} mm</text>
 <text x="45" y="450" fill="currentColor" fontSize="13" fontFamily="Arial">{side?(translate(locale,"Proyección lateral: los palets próximos pueden ocultar otros","Side projection: nearer pallets may hide others")):(translate(locale,"Rojo: zona bloqueada · Verde: pasillo reservado","Red: blocked · Green: reserved aisle"))}</text>
 <text x="45" y="475" fill="currentColor" fontSize="14" fontFamily="Arial">{translate(locale,"Puerta / acceso: izquierda · Pulsa un palet para ver su posición","Door / access: left · Click a pallet for its position")}</text>
 </svg>;
}
