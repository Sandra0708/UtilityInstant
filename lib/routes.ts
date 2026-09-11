export const routeSource='https://transport.ec.europa.eu/transport-modes/road/social-provisions/driving-time-and-rest-periods_en';
export const euCountries=['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'];
export type Stop={name:string;km:number;source:'manual'|'estimated'|'external';reference:string;service:number;refuel:number;fuelCost:number;toll:number;nights:number;delivery:boolean};
export type DriverHistory={week:number;previous:number;extensions:number};
export type RouteInput={origin:string;departure:string;offset:number;vehicle:string;speed:number;stops:Stop[];load:number;nightHours:number;tacho:boolean;country:string;international:boolean;drivers:1|2;extended:boolean;history:DriverHistory[];sinceWeekly:number;kmRate:number;hourRate:number;hourBasis:'work'|'drive'|'total';allowance:number;nightRate:number;currency:string};
export type RouteEvent={kind:'drive'|'service'|'refuel'|'break'|'daily'|'weekly'|'night';start:number;end:number;place:string;driver:number;km:number};
export const stopDefault:Stop={name:'',km:0,source:'manual',reference:'',service:0,refuel:0,fuelCost:0,toll:0,nights:0,delivery:true};
export function routeDefaults():RouteInput{return {origin:'',departure:'',offset:120,vehicle:'truck',speed:70,stops:[{...stopDefault}],load:0,nightHours:11,tacho:false,country:'ES',international:false,drivers:1,extended:false,history:[{week:0,previous:0,extensions:0},{week:0,previous:0,extensions:0}],sinceWeekly:0,kmRate:0,hourRate:0,hourBasis:'work',allowance:0,nightRate:0,currency:'EUR'};}
const minute=60000,day=1440,week=10080,eps=1e-7;
export function departureTime(value:string,offset:number){if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))throw Error('date');const parsed=Date.parse(value+':00Z');if(!Number.isFinite(parsed)||new Date(parsed).toISOString().slice(0,16)!==value)throw Error('date');return parsed/minute-offset;}
export function routeDate(time:number,offset:number){return new Date((time+offset)*minute).toISOString().slice(0,16).replace('T',' ');}
function monday(time:number,offset:number){const date=new Date((time+offset)*minute);const midnight=Math.floor((time+offset)/day)*day;return midnight-((date.getUTCDay()+6)%7)*day-offset;}
export function planRoute(input:RouteInput){
 const i=input,finite=(v:number,min=0,max=1e6)=>Number.isFinite(v)&&v>=min&&v<=max;
 if(!i.origin.trim()||i.origin.length>200||!i.stops.length||i.stops.length>25||i.stops.some(s=>!s.name.trim()||s.name.length>200||!finite(s.km,0,20000)||!finite(s.service,0,1440)||!finite(s.refuel,0,180)||!finite(s.fuelCost)||!finite(s.toll)||!Number.isInteger(s.nights)||!finite(s.nights,0,14)||!['manual','estimated','external'].includes(s.source)||s.source==='external'&&!s.reference.trim()))throw Error('stops');
 if(!finite(i.speed,1,160)||!finite(i.offset,-720,840)||!finite(i.load,0,1440)||!finite(i.nightHours,8,24)||!finite(i.sinceWeekly,0,144)||![1,2].includes(i.drivers)||![i.kmRate,i.hourRate,i.allowance,i.nightRate].every(v=>finite(v))||!['work','drive','total'].includes(i.hourBasis))throw Error('input');
 if(i.tacho&&!euCountries.includes(i.country))throw Error('country');
 if(i.history.length<2||i.history.some(h=>!finite(h.week,0,56)||!finite(h.previous,0,56)||h.week+h.previous>90||!Number.isInteger(h.extensions)||!finite(h.extensions,0,2)))throw Error('history');
 const start=departureTime(i.departure,i.offset),events:RouteEvent[]=[],initialWeek=monday(start,i.offset);
 let now=start,shift=start,weeklyEnd=start-i.sinceWeekly*60,active=0,iterations=0;
 const drivers=Array.from({length:i.drivers},(_,idx)=>({daily:0,continuous:0,passive:0,extended:false,weeks:new Map([[initialWeek,i.history[idx].week*60],[initialWeek-week,i.history[idx].previous*60]]),extensions:new Map([[initialWeek,i.history[idx].extensions]])}));
 const add=(kind:RouteEvent['kind'],duration:number,place:string,driver=0,km=0)=>{if(duration<eps)return;events.push({kind,start:now,end:now+duration,place,driver,km});now+=duration;if(events.length>10000||now-start>180*day)throw Error('limit');};
 const reset=()=>{shift=now;drivers.forEach(d=>{d.daily=0;d.continuous=0;d.passive=0;d.extended=false;});};
 const rest=(kind:'daily'|'weekly'|'night',place:string,requested=0)=>{const duration=kind==='weekly'?Math.max(45*60,requested):Math.max((i.drivers===2?9:11)*60,requested);add(kind,duration,place);reset();if(kind==='weekly'||duration>=45*60)weeklyEnd=now;};
 const budget=(idx:number)=>{const d=drivers[idx],w=monday(now,i.offset),used=d.weeks.get(w)||0;return Math.max(0,Math.min(56*60-used,90*60-used-(d.weeks.get(w-week)||0)));};
 const dailyLimit=(idx:number)=>{const d=drivers[idx],used=d.extensions.get(monday(now,i.offset))||0;return i.extended&&(d.extended||used<2)?600:540;};
 const windowLeft=()=>Math.min((i.drivers===2?21:13)*60-(now-shift),weeklyEnd+6*day-now);
 function work(kind:'service'|'refuel',duration:number,place:string){while(duration>eps){if(!i.tacho){add(kind,duration,place);return;}if(now>=weeklyEnd+6*day-eps){rest('weekly',place);continue;}if(windowLeft()<eps){rest('daily',place);continue;}const part=Math.min(duration,windowLeft());add(kind,part,place);drivers.forEach(d=>d.passive=0);duration-=part;}}
 work('service',i.load,i.origin);
 const arrivals:number[]=[];
 for(let leg=0;leg<i.stops.length;leg++){
  const stop=i.stops[leg],from=leg?i.stops[leg-1].name:i.origin,place=from+' → '+stop.name;let remaining=stop.km/i.speed*60;
  while(remaining>eps){
   if(++iterations>20000)throw Error('limit');
   if(!i.tacho){add('drive',remaining,place,1,remaining*i.speed/60);remaining=0;break;}
   if(now>=weeklyEnd+6*day-eps){rest('weekly',place);continue;}
   if(windowLeft()<eps){rest('daily',place);continue;}
   const can=(idx:number)=>Math.min(270-drivers[idx].continuous,dailyLimit(idx)-drivers[idx].daily,budget(idx));
   if(can(active)<eps){const other=drivers.findIndex((_,idx)=>can(idx)>eps);if(other>=0)active=other;else{
    if(drivers.every((_,idx)=>budget(idx)<eps)){rest('weekly',place,initialWeek+week*(Math.floor((now-initialWeek)/week)+1)-now);continue;}
    if(drivers.every((d,idx)=>d.daily>=dailyLimit(idx)-eps||budget(idx)<eps)){rest('daily',place);continue;}
    // A full break is modelled; loading and refuelling are never counted as rest.
    if(windowLeft()<45){rest('daily',place);continue;}add('break',45,place);drivers.forEach(d=>{d.continuous=0;d.passive=0;});continue;
   }}
   const d=drivers[active],w=monday(now,i.offset),part=Math.min(remaining,can(active),windowLeft(),w+week-now);
   if(part<eps)throw Error('schedule');
   if(d.daily+part>540+eps&&!d.extended){d.extended=true;d.extensions.set(w,(d.extensions.get(w)||0)+1);}
   add('drive',part,place,active+1,part*i.speed/60);d.daily+=part;d.continuous+=part;d.passive=0;d.weeks.set(w,(d.weeks.get(w)||0)+part);
   drivers.forEach((other,idx)=>{if(idx!==active){other.passive+=part;if(other.passive>=45-eps)other.continuous=0;}});remaining-=part;
  }
  arrivals.push(now);work('service',stop.service,stop.name);work('refuel',stop.refuel,stop.name);
  for(let n=0;n<stop.nights;n++){if(i.tacho){if(now>=weeklyEnd+6*day-eps)rest('weekly',stop.name,Math.max(45*60,i.nightHours*60));else rest('night',stop.name,i.nightHours*60);}else add('night',i.nightHours*60,stop.name);}
 }
 const km=i.stops.reduce((sum,s)=>sum+s.km,0),drive=events.filter(e=>e.kind==='drive').reduce((s,e)=>s+e.end-e.start,0)/60,workHours=drive+events.filter(e=>e.kind==='service'||e.kind==='refuel').reduce((s,e)=>s+e.end-e.start,0)/60,totalHours=(now-start)/60;
 const nights=events.filter(e=>['daily','weekly','night'].includes(e.kind)).reduce((s,e)=>s+Math.max(1,Math.ceil((e.end-e.start)/(24*60))),0),days=Math.max(1,Math.ceil(totalHours/24)),deliveries=i.stops.filter(s=>s.delivery).length;
 const costs={mileage:km*i.kmRate,time:(i.hourBasis==='total'?totalHours:i.hourBasis==='drive'?drive:workHours)*i.hourRate,allowance:days*i.allowance,nights:nights*i.nightRate,fuel:i.stops.reduce((s,p)=>s+p.fuelCost,0),tolls:i.stops.reduce((s,p)=>s+p.toll,0)};
 const totalCost=Object.values(costs).reduce((s,n)=>s+n,0);
 const weeks=drivers.flatMap((d,idx)=>[...d.weeks].filter(([w])=>w>=initialWeek).map(([w,minutes])=>({driver:idx+1,start:w,hours:minutes/60,fortnight:(minutes+(d.weeks.get(w-week)||0))/60,extensions:d.extensions.get(w)||0})));
 return {input:i,events,arrivals,start,finish:now,arrival:arrivals.at(-1)!,km,drive,totalHours,workHours,nights,days,deliveries,costs,totalCost,perDelivery:deliveries?totalCost/deliveries:null,weeks,breaks:events.filter(e=>e.kind==='break').length,rests:events.filter(e=>['daily','weekly','night'].includes(e.kind)).length};
}
export type RoutePlan=ReturnType<typeof planRoute>;
const escapeIcs=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
export function routeCalendar(plan:RoutePlan,labels:Record<RouteEvent['kind'],string>){
 const calendarId=crypto.randomUUID();
 const date=(n:number)=>new Date(Math.round(n*minute)).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//UtilityInstant//Routes//EN','CALSCALE:GREGORIAN',...plan.events.flatMap((e,idx)=>['BEGIN:VEVENT',`UID:${calendarId}-${idx}@utilityinstant.com`,`DTSTAMP:${date(plan.start)}`,`DTSTART:${date(e.start)}`,`DTEND:${date(e.end)}`,`SUMMARY:${escapeIcs(labels[e.kind]+' · '+e.place)}`,`DESCRIPTION:${escapeIcs('UtilityInstant · '+e.km.toFixed(2)+' km · '+e.driver)}`,'END:VEVENT']),'END:VCALENDAR'];
 // Fold by UTF-8 octets, including the continuation space (RFC 5545).
 return lines.map(line=>{let out='',bytes=0;for(const ch of line){const n=new TextEncoder().encode(ch).length;if(bytes+n>75){out+='\r\n ';bytes=1;}out+=ch;bytes+=n;}return out;}).join('\r\n')+'\r\n';
}
