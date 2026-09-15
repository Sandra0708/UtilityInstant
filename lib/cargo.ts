// All geometric calculations use millimetres and kilograms (including inch conversions).
export const palletPresets = [
 ['eur','EUR / EPAL 1',1200,800],['industrial','Industrial / UK / EPAL 2–3',1200,1000],
 ['gma','GMA · USA / Canada · 48 × 40 in',1219.2,1016],['asia','Asia · T11',1100,1100],
 ['au','Australia',1165,1165],['fin','FIN / Finlandia',1200,1000],['japan','Japón / Japan T11',1100,1100],['iso','ISO · 42 × 42 in',1066.8,1066.8],
 ['half','Medio / Half · EUR 6 / EPAL 6',800,600],['quarter','Cuarto / Quarter · Display',600,400],
 ['cp1','CP1',1200,1000],['cp2','CP2',1200,800],['cp3','CP3',1140,1140],['cp4','CP4',1300,1100],['cp5','CP5',1140,760],['cp6','CP6',1200,1000],['cp7','CP7',1300,1100],['cp8','CP8',1140,1140],['cp9','CP9',1140,1140],
 ['us48','USA · 48 × 48 in',1219.2,1219.2],['us4842','USA · 48 × 42 in',1219.2,1066.8],['us4036','USA · 40 × 36 in',1016,914.4],['us4845','USA · 48 × 45 in',1219.2,1143],['custom','Personalizado / Custom',1200,800],
] as const;
export const vehiclePresets = [
 {id:'trailer',es:'Semirremolque · ejemplo 13,6 m',en:'Semi-trailer · 13.6 m example',length:13600,width:2450,height:2700,doorWidth:0,doorHeight:0},
 {id:'mega',es:'Megatráiler · ejemplo',en:'Mega trailer · example',length:13600,width:2450,height:3000,doorWidth:0,doorHeight:0},
 {id:'rigid',es:'Camión rígido · ejemplo 7,2 m',en:'Rigid truck · 7.2 m example',length:7200,width:2450,height:2400,doorWidth:0,doorHeight:0},
 {id:'van',es:'Furgón · espacio rectangular útil',en:'Van · usable rectangular space',length:3200,width:1700,height:1800,doorWidth:0,doorHeight:0},
 {id:'20',es:'Contenedor 20′ seco',en:'20′ dry container',length:5900,width:2352,height:2395,doorWidth:2340,doorHeight:2292},
 {id:'40',es:'Contenedor 40′ seco',en:'40′ dry container',length:12032,width:2352,height:2395,doorWidth:2340,doorHeight:2292},
 {id:'40hc',es:'Contenedor 40′ High Cube',en:'40′ High Cube container',length:12032,width:2352,height:2700,doorWidth:2340,doorHeight:2597},
 {id:'45hc',es:'Contenedor 45′ High Cube',en:'45′ High Cube container',length:13556,width:2352,height:2700,doorWidth:2340,doorHeight:2597},
 {id:'truck',es:'Camión · ejemplo',en:'Truck · example',length:6000,width:2400,height:2400,doorWidth:0,doorHeight:0},
 {id:'reefer',es:'Frigorífico · ejemplo editable',en:'Refrigerated truck · editable example',length:13000,width:2400,height:2500,doorWidth:0,doorHeight:0},
 {id:'warehouse',es:'Almacén · ejemplo',en:'Warehouse · example',length:10000,width:6000,height:4000,doorWidth:0,doorHeight:0},
 {id:'custom',es:'Espacio definido por mí',en:'Custom space',length:6000,width:3000,height:2500,doorWidth:0,doorHeight:0},
];
export type Zone={id:string;kind:'blocked'|'aisle';x:number;y:number;width:number;length:number};
export type Space={length:number;width:number;height:number;margin:number;gap:number;maxWeight:number;doorWidth:number;doorHeight:number;zones?:Zone[];requireAccess?:boolean;maxStackRatio?:number};
export type Cargo={id:string;name:string;length:number;width:number;height:number;weight:number;quantity:number;rotate:boolean;levels:number;topLoad?:number};
export type Placed={id:string;index:number;x:number;y:number;z:number;width:number;length:number;height:number;weight:number;rotated:boolean};
type Rect={x:number;y:number;width:number;length:number};
export const defaultSpace:Space={...vehiclePresets[0],margin:20,gap:0,maxWeight:0};
export const defaultCargo:Cargo={id:'p1',name:'EUR / EPAL 1',length:1200,width:800,height:1200,weight:250,quantity:33,rotate:true,levels:1};
export function validateCargo(space:Space,items:Cargo[]) {
 for(const k of ['length','width','height'] as const)if(!Number.isFinite(space[k])||space[k]<100||space[k]>50000)throw Error('SPACE');
 for(const k of ['margin','gap','maxWeight','doorWidth','doorHeight'] as const)if(!Number.isFinite(space[k])||space[k]<0||space[k]>1000000)throw Error('SPACE');
 if(space.margin*2>=Math.min(space.width,space.length))throw Error('SPACE');
 if(space.maxStackRatio!==undefined&&(!Number.isFinite(space.maxStackRatio)||space.maxStackRatio<0||space.maxStackRatio>20))throw Error('SPACE');
 if(space.requireAccess!==undefined&&typeof space.requireAccess!=='boolean')throw Error('SPACE');
 if(space.zones!==undefined&&(!Array.isArray(space.zones)||space.zones.length>20||space.zones.some(z=>!z||!['blocked','aisle'].includes(z.kind)||typeof z.id!=='string'||!['x','y','width','length'].every(k=>Number.isFinite(z[k as 'x']))||z.x<0||z.y<0||z.width<=0||z.length<=0||z.x+z.width>space.width||z.y+z.length>space.length)))throw Error('ZONES');
 if(space.zones&&(new Set(space.zones.map(z=>z.id)).size!==space.zones.length||space.zones.some(z=>!z.id)))throw Error('ZONES');
 if(!Array.isArray(items)||!items.length||items.length>20||items.some(x=>!x||typeof x!=='object')||new Set(items.map(x=>x.id)).size!==items.length)throw Error('ITEMS');
 let total=0;
 for(const item of items){if(typeof item.id!=='string'||!item.id||typeof item.name!=='string'||!item.name||item.name.length>100)throw Error('ITEMS');for(const k of ['length','width','height'] as const)if(!Number.isFinite(item[k])||item[k]<10||item[k]>50000)throw Error('ITEMS');if(!Number.isFinite(item.weight)||item.weight<0||item.weight>1000000||!Number.isInteger(item.quantity)||item.quantity<1||!Number.isInteger(item.levels)||item.levels<1||item.levels>10||typeof item.rotate!=='boolean')throw Error('ITEMS');total+=item.quantity;}
 if(total>500)throw Error('LIMIT');
 for(const item of items)if(item.topLoad!==undefined&&(!Number.isFinite(item.topLoad)||item.topLoad<0||item.topLoad>1000000))throw Error('ITEMS');
}
const eps=.001;
const overlaps=(a:Rect,b:Rect)=>a.x<b.x+b.width-eps&&a.x+a.width>b.x+eps&&a.y<b.y+b.length-eps&&a.y+a.length>b.y+eps;
// A straight entrance corridor is required: blocked areas can disconnect an aisle.
function accessibleAisles(space:Space){
 const zones=space.zones||[], blocked=zones.filter(z=>z.kind==='blocked');
 const aisles=zones.filter(z=>z.kind==='aisle'&&!blocked.some(b=>overlaps(z,b)));
 const connected=new Set(aisles.filter(z=>z.y<=eps&&(!space.doorWidth||z.x<=(space.width+space.doorWidth)/2&&z.x+z.width>=(space.width-space.doorWidth)/2)).map(z=>z.id));
 for(let i=0;i<aisles.length;i++)for(const a of aisles)if(!connected.has(a.id)&&aisles.some(b=>connected.has(b.id)&&((a.x<b.x+b.width-eps&&a.x+a.width>b.x+eps&&a.y<=b.y+b.length+eps&&a.y+a.length>=b.y-eps)||(a.y<b.y+b.length-eps&&a.y+a.length>b.y+eps&&a.x<=b.x+b.width+eps&&a.x+a.width>=b.x-eps))))connected.add(a.id);
 return aisles.filter(z=>connected.has(z.id));
}
function hasAccess(r:Rect,w:number,l:number,aisles:Zone[],space:Space){
 const doorWidth=space.doorWidth||space.width;
 if(r.y<=space.margin+eps&&r.x>=(space.width-doorWidth)/2-eps&&r.x+w<=(space.width+doorWidth)/2+eps)return true;
 // Require a full pallet edge beside a connected reserved aisle, not just a corner.
 return aisles.some(a=>((Math.abs(r.x+w+space.gap-a.x)<eps||Math.abs(a.x+a.width+space.gap-r.x)<eps)&&r.y>=a.y-eps&&r.y+l<=a.y+a.length+eps)||((Math.abs(r.y+l+space.gap-a.y)<eps||Math.abs(a.y+a.length+space.gap-r.y)<eps)&&r.x>=a.x-eps&&r.x+w<=a.x+a.width+eps));
}
function reservedArea(zones:Zone[]){
 const xs=[...new Set(zones.flatMap(z=>[z.x,z.x+z.width]))].sort((a,b)=>a-b);let area=0;
 for(let i=1;i<xs.length;i++){const intervals=zones.filter(z=>z.x<xs[i]&&z.x+z.width>xs[i-1]).map(z=>[z.y,z.y+z.length]).sort((a,b)=>a[0]-b[0]);let start=0,end=0,total=0;for(const [a,b] of intervals){if(a>end){total+=end-start;start=a;end=b;}else end=Math.max(end,b);}area+=(total+end-start)*(xs[i]-xs[i-1]);}return area/1e6;
}
function split(free:Rect[],used:Rect):Rect[]{
 const next:Rect[]=[];
 for(const r of free){if(used.x>=r.x+r.width-eps||used.x+used.width<=r.x+eps||used.y>=r.y+r.length-eps||used.y+used.length<=r.y+eps){next.push(r);continue;}
 if(used.x>r.x)next.push({...r,width:used.x-r.x});
 if(used.x+used.width<r.x+r.width)next.push({...r,x:used.x+used.width,width:r.x+r.width-used.x-used.width});
 if(used.y>r.y)next.push({...r,length:used.y-r.y});
 if(used.y+used.length<r.y+r.length)next.push({...r,y:used.y+used.length,length:r.y+r.length-used.y-used.length});}
 return next.filter((r,i)=>r.width>eps&&r.length>eps&&!next.some((q,j)=>i!==j&&q.x<=r.x+eps&&q.y<=r.y+eps&&q.x+q.width>=r.x+r.width-eps&&q.y+q.length>=r.y+r.length-eps&&(j<i||q.width*q.length>r.width*r.length+eps)));
}
function attempt(space:Space,items:Cargo[],order:number,orientation:number){
 let free:Rect[]=[{x:space.margin,y:space.margin,width:space.width-2*space.margin+space.gap,length:space.length-2*space.margin+space.gap}],weight=0;
 for(const z of space.zones||[])free=split(free,{x:Math.max(0,z.x-space.gap),y:Math.max(0,z.y-space.gap),width:z.width+space.gap*2,length:z.length+space.gap*2});
 const aisles=accessibleAisles(space);
 const placed:Placed[]=[];
 const sorted=[...items].sort((a,b)=>order===0?b.length*b.width-a.length*a.width:order===1?a.length*a.width-b.length*b.width:order===2?a.weight-b.weight:0);
 for(const item of sorted){let remaining=item.quantity;
 while(remaining>0){
  if(item.height>space.height+eps||(space.doorHeight>0&&item.height>space.doorHeight+eps))break;
  if(space.maxWeight>0&&item.weight===0)break;
  let best:{r:Rect;w:number;l:number;rotated:boolean;score:number}|undefined;
  const orientations=item.rotate?[[item.width,item.length,false],[item.length,item.width,true]] as const:[[item.width,item.length,false]] as const;
  for(const [w,l,rotated] of orientations){if(space.doorWidth>0&&w>space.doorWidth+eps)continue;for(const r of free){if(w+space.gap>r.width+eps||l+space.gap>r.length+eps)continue;
   // Conservative straight loading path from the entrance; load deepest rows first.
   if((space.zones||[]).some(z=>z.kind==='blocked'&&overlaps({x:r.x,y:0,width:w,length:r.y+l},z)))continue;
   if(space.requireAccess&&!hasAccess(r,w,l,aisles,space))continue;
   const score=orientation===0?Math.min(r.width-w-space.gap,r.length-l-space.gap)*1e8+r.y*1000+r.x:orientation===1?r.y*1e8+r.x*1000+l:r.x*1e8+r.y*1000+w;
   if(!best||score<best.score)best={r,w,l,rotated,score};}}
  if(!best)break;
  let levels=Math.min(remaining,item.levels,Math.floor((space.height+eps)/item.height));
  // Levels authorise geometric stacking. An optional declared load limit adds a check.
  if(item.topLoad!==undefined)levels=Math.min(levels,item.weight>0?1+Math.floor((item.topLoad+eps)/item.weight):1);
  if(space.maxStackRatio)levels=Math.min(levels,Math.floor(Math.min(item.width,item.length)*space.maxStackRatio/item.height+eps));
  if(space.maxWeight>0&&item.weight>0)levels=Math.min(levels,Math.floor((space.maxWeight-weight+eps)/item.weight));
  if(levels<1)break;
  for(let level=0;level<levels;level++){placed.push({id:item.id,index:item.quantity-remaining+1,x:best.r.x,y:best.r.y,z:level*item.height,width:best.w,length:best.l,height:item.height,weight:item.weight,rotated:best.rotated});remaining--;weight+=item.weight;}
  free=split(free,{x:best.r.x,y:best.r.y,width:best.w+space.gap,length:best.l+space.gap});
 }}
 return {placed,weight};
}
export function planCargo(space:Space,items:Cargo[]){
 validateCargo(space,items);let best=attempt(space,items,0,0);
 for(let order=0;order<4;order++)for(let orientation=0;orientation<3;orientation++){if(!order&&!orientation)continue;const candidate=attempt(space,items,order,orientation);if(candidate.placed.length>best.placed.length)best=candidate;}
 const volume=best.placed.reduce((n,p)=>n+p.width*p.length*p.height,0)/1e9;
 const floor=best.placed.filter(p=>p.z===0).reduce((n,p)=>n+p.width*p.length,0)/1e6;
 const counts=items.map(item=>{const loaded=best.placed.filter(p=>p.id===item.id).length;return {id:item.id,name:item.name,requested:item.quantity,loaded,left:item.quantity-loaded};});
 return {...best,volume,floor,capacity:space.length*space.width*space.height/1e9,counts,requested:items.reduce((n,x)=>n+x.quantity,0),unknownWeight:items.some(x=>x.weight===0)};
}
export function compareCargo(space:Space,items:Cargo[]){
 const operative=planCargo(space,items);
 const geometricSpace={...space,margin:0,gap:0,maxWeight:0,doorWidth:0,doorHeight:0,zones:[],requireAccess:false,maxStackRatio:0};
 const geometric=planCargo(geometricSpace,items.map(i=>({...i,weight:1,topLoad:1000000})));
 const reserved=reservedArea(space.zones||[]);
 return {...operative,geometricCount:Math.max(geometric.placed.length,operative.placed.length),reservedFloor:reserved,freeFloor:Math.max(0,space.width*space.length/1e6-reserved-operative.floor),freeVolume:Math.max(0,operative.capacity-reserved*space.height/1000-operative.volume)};
}
