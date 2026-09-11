import {test} from 'node:test';
import assert from 'node:assert/strict';
import {routeDefaults,stopDefault,planRoute,routeCalendar,routeDate,departureTime} from '../lib/routes.ts';
const input=(hours=10,patch={})=>({...routeDefaults(),origin:'Madrid',departure:'2026-09-14T08:00',offset:120,speed:60,stops:[{...stopDefault,name:'Destino',km:hours*60}],...patch});
test('route: free itinerary reconciles operations, distance and explicit payments',()=>{
 const r=planRoute(input(10,{load:30,kmRate:.3,hourRate:10,allowance:20,nightRate:70,stops:[{...stopDefault,name:'A',km:120,service:30,refuel:15,fuelCost:100,toll:20,delivery:true},{...stopDefault,name:'B',km:480,service:15,nights:1,delivery:true}]}));
 assert.equal(r.km,600);assert.equal(r.drive,10);assert.equal(r.workHours,11.5);assert.equal(r.totalHours,22.5);assert.equal(r.nights,1);assert.equal(r.totalCost,505);assert.equal(r.perDelivery,252.5);assert.equal(r.arrival-r.start,675);assert.equal(r.events.reduce((n,e)=>n+e.km,0),600);
});
test('route: 4.5 h exact arrival adds no pointless final break; next leg retains counter',()=>{
 assert.equal(planRoute(input(4.5,{tacho:true})).breaks,0);
 const r=planRoute(input(5,{tacho:true,stops:[{...stopDefault,name:'A',km:270,service:30},{...stopDefault,name:'B',km:30}]}));assert.equal(r.breaks,1);assert.equal(r.totalHours,6.25);
});
test('route: daily cap, optional 10 h, and two-driver genuine alternating schedule',()=>{
 const solo=planRoute(input(10,{tacho:true}));assert.equal(solo.drive,10);assert.equal(solo.totalHours,21.75);assert.equal(solo.rests,1);
 const extended=planRoute(input(10,{tacho:true,extended:true}));assert.equal(extended.rests,0);assert.equal(extended.breaks,2);assert.equal(extended.weeks[0].extensions,1);
 const team=planRoute(input(18,{tacho:true,drivers:2}));assert.equal(team.totalHours,18);assert.equal(team.breaks,0);assert.deepEqual(team.weeks.map(w=>w.hours),[9,9]);
 const next=planRoute(input(19,{tacho:true,drivers:2}));assert.equal(next.totalHours,28);assert.equal(next.rests,1);
});
test('route: loading consumes duty window and never replaces a rest',()=>{
 const r=planRoute(input(5,{tacho:true,load:600}));assert.equal(r.rests,1);assert.ok(r.events.some(e=>e.kind==='daily'&&e.end-e.start===660));assert.equal(r.drive,5);
});
test('route: weekly and rolling fortnight histories enforced, including Monday rollover',()=>{
 const r=planRoute(input(10,{tacho:true,history:[{week:55,previous:34,extensions:0},{week:0,previous:0,extensions:0}]}));
 assert.ok(r.events.some(e=>e.kind==='weekly'));for(const w of r.weeks){assert.ok(w.hours<=56+1e-6);assert.ok(w.fortnight<=90+1e-6);}
 assert.equal(r.weeks[0].hours,56);assert.equal(r.weeks[0].fortnight,90);
 const midnight=planRoute(input(3,{tacho:true,departure:'2026-09-20T23:00'}));assert.equal(midnight.weeks.length,2);assert.equal(midnight.weeks[0].hours,1);assert.equal(midnight.weeks[1].hours,2);
});
test('route: long trip respects daily, duty, 6-day weekly and extension limits',()=>{
 for(const count of [1,2]){
 const r=planRoute(input(140,{tacho:true,drivers:count,extended:true}));let shift=r.start,weekly=r.start,perDriver=[0,0];
 for(const e of r.events){if(['daily','night','weekly'].includes(e.kind)){assert.ok(e.start-shift<=(count===1?13:21)*60+1e-5);assert.ok(e.start-weekly<=144*60+1e-5);shift=e.end;perDriver=[0,0];if(e.kind==='weekly')weekly=e.end;}else if(e.kind==='drive'){perDriver[e.driver-1]+=(e.end-e.start)/60;assert.ok(perDriver[e.driver-1]<=10+1e-5);}}
 for(const w of r.weeks){assert.ok(w.hours<=56+1e-5);assert.ok(w.fortnight<=90+1e-5);assert.ok(w.extensions<=2);}assert.ok(Math.abs(r.drive-140)<1e-5);
 }
});
test('route: external provenance, missing fields and invalid limits are rejected',()=>{
 assert.throws(()=>planRoute(input(1,{origin:''})));assert.throws(()=>planRoute(input(1,{speed:0})));assert.throws(()=>planRoute(input(1,{tacho:true,country:'US'})));assert.throws(()=>planRoute(input(1,{history:[{week:56,previous:56,extensions:0},{week:0,previous:0,extensions:0}]})));
 assert.throws(()=>planRoute(input(1,{stops:[{...stopDefault,name:'A',km:10,source:'external'}]})));assert.throws(()=>departureTime('2026-02-30T08:00',120));assert.equal(routeDate(departureTime('2026-09-11T08:00',120),120),'2026-09-11 08:00');
 const r=planRoute(input(1,{stops:[{...stopDefault,name:'A',km:60,source:'estimated',delivery:false}]}));assert.equal(r.perDelivery,null);
});
test('calendar: UTC times, UTF-8 line folding and injection escaping',()=>{
 const r=planRoute(input(1,{origin:'Madrid;\nBEGIN:VEVENT',stops:[{...stopDefault,name:'á'.repeat(90),km:60}]}));const text=routeCalendar(r,{drive:'Conducción',service:'Carga',refuel:'Repostaje',break:'Pausa',daily:'Diario',weekly:'Semanal',night:'Noche'});
 assert.match(text,/DTSTART:20260914T060000Z/);assert.equal((text.match(/^BEGIN:VEVENT$/gm)||[]).length,1);for(const line of text.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
});
