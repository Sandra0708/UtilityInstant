import test from 'node:test';
import assert from 'node:assert/strict';
import {shiftMinutes,weeklyHours,decimal,durationMinutes,durationText,roundMinutes} from '../lib/engines/hours.ts';
import {convertTime,localCandidates,resolveLocal,offsetAt,TimeInputError} from '../lib/engines/timezones.ts';
import {timeMessages} from '../lib/localization/time.ts';
import {bmi} from '../lib/engines/bmi.ts';
const shift=(patch={})=>({enabled:true,start:'09:15',end:'17:40',breakMinutes:'0',nextDay:false,...patch});
test('durations subtract breaks and recognise overnight and full-day shifts',()=>{
 assert.equal(shiftMinutes('2026-09-18',shift(),'Europe/Madrid'),505);
 assert.equal(shiftMinutes('2026-09-18',shift({breakMinutes:'30'}),'Europe/Madrid'),475);
 assert.equal(shiftMinutes('2026-09-18',shift({start:'22:00',end:'06:00'}),'Europe/Madrid'),480);
 assert.equal(shiftMinutes('2026-09-18',shift({start:'09:00',end:'09:00',nextDay:true}),'Europe/Madrid'),1440);
 assert.throws(()=>shiftMinutes('2026-09-18',shift({breakMinutes:'506'}),'Europe/Madrid'),e=>e.code==='break');
});
test('actual elapsed time follows spring clock changes including half hours',()=>{
 assert.equal(shiftMinutes('2026-03-29',shift({start:'01:30',end:'03:30'}),'Europe/Madrid'),60);
 assert.equal(shiftMinutes('2026-10-04',shift({start:'01:30',end:'03:30'}),'Australia/Lord_Howe'),90);
 assert.throws(()=>resolveLocal('2026-03-29T02:30','Europe/Madrid'),e=>e instanceof TimeInputError&&e.code==='gap');
});
test('autumn repeated hours require an explicit choice',()=>{
 const candidates=localCandidates('2026-10-25T02:30','Europe/Madrid');assert.equal(candidates.length,2);assert.equal(candidates[1]-candidates[0],3600000);
 assert.throws(()=>resolveLocal('2026-10-25T02:30','Europe/Madrid'),e=>e.code==='overlap');
 assert.equal(resolveLocal('2026-10-25T02:30','Europe/Madrid','later'),candidates[1]);
 assert.equal(shiftMinutes('2026-10-25',shift({start:'02:15',end:'02:45',startOccurrence:'earlier',endOccurrence:'later'}),'Europe/Madrid'),90);
});
test('six-day timesheet rounds each day and computes threshold separately',()=>{
 const shifts=Array.from({length:7},(_,i)=>shift({enabled:i<6,breakMinutes:'30'}));
 const r=weeklyHours('2026-09-14',shifts,'Europe/Madrid',40,'nearest');
 assert.equal(r.actual,6*475);assert.equal(r.total,2880);assert.equal(r.adjustment,30);assert.equal(r.overtime,480);assert.equal(r.rows[6].actual,0);
 assert.equal(roundMinutes(475,'down'),465);assert.equal(roundMinutes(475,'up'),480);
});
test('decimal and h:mm durations preserve signs and exceed one day',()=>{
 assert.equal(decimal('7,75')*60,465);assert.equal(durationMinutes('7:45')/60,7.75);
 assert.equal(durationText(durationMinutes('3:45')+durationMinutes('2:30')),'6:15');
 assert.equal(durationText(durationMinutes('1:00')-durationMinutes('2:30')),'-1:30');
 assert.equal(durationMinutes('27:15'),1635);assert.throws(()=>durationMinutes('7:75'));assert.throws(()=>decimal('7,5,2'));
});
test('zones cross dates and support quarter-hour fixed offsets',()=>{
 const r=convertTime('2026-09-18T01:00','Asia/Tokyo','America/Los_Angeles');
 assert.equal(r.destination,'2026-09-17T09:00');assert.equal(r.difference,-960);
 assert.equal(convertTime('2026-09-18T00:00','UTC','UTC+05:45').destination,'2026-09-18T05:45');
 assert.equal(offsetAt(Date.UTC(2026,8,18),'Asia/Kathmandu'),345);
 assert.throws(()=>resolveLocal('2026-02-30T01:00','UTC'));assert.throws(()=>resolveLocal('2026-01-01T01:00','UTC+02:99'));
});
test('all time labels have eight nonempty translations',()=>{
 for(const [key,values] of Object.entries(timeMessages)){assert.equal(values.length,8,key);assert.ok(values.every(v=>v.trim()),key);}
});
test('BMI number stays constant while regional classification can change',()=>{
 const a=bmi(68,170,37,'international'),b=bmi(68,170,37,'japan');assert.equal(a.value,b.value);assert.equal(a.category,b.category);
 const c=bmi(78,170,37,'international'),d=bmi(78,170,37,'japan');assert.equal(c.value,d.value);assert.notEqual(c.category,d.category);
});
