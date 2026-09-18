'use client';
import {useState,type ReactNode} from 'react';
import {Copy,Download} from 'lucide-react';
import {usePrefs} from './platform';
import ZonePicker from './zone-picker';
import HelpLabel from './field-help';
import {timeText,type TimeKey} from '@/lib/localization/time';
import type {Language} from '@/lib/localization';
import type {TimeId} from '@/lib/time-tools';
import {decimal,durationMinutes,durationText,shiftMinutes,roundMinutes,weeklyHours,addDays,type Shift,type Rounding} from '@/lib/engines/hours';
import {convertTime,TimeInputError,fixedOffset,offsetName,type Occurrence} from '@/lib/engines/timezones';
import {saveFile,delimited} from '@/lib/table-export';
import s from './time-workspace.module.css';

type Mode='duration'|'arithmetic'|'weekly'|'conversion';
type Output={main:string;rows:(string|number)[][];metrics:[TimeKey,string][];zoneResult?:ReturnType<typeof convertTime>;from?:string;to?:string};
const shift=():Shift=>({enabled:true,start:'09:15',end:'17:40',breakMinutes:'30',nextDay:false});
export default function TimeWorkspace({id,locale}:{id:TimeId;locale:Language}){
 const {prefs,record}=usePrefs(),t=(key:TimeKey)=>timeText(locale,key);
 const [mode,setMode]=useState<Mode>('duration'),[date,setDate]=useState('2026-09-14'),[single,setSingle]=useState<Shift>(shift),[week,setWeek]=useState<Shift[]>(()=>Array.from({length:7},(_,i)=>({...shift(),enabled:i<5})));
 const [zone,setZone]=useState('Europe/Madrid'),[from,setFrom]=useState('Europe/Madrid'),[to,setTo]=useState('Asia/Tokyo'),[wall,setWall]=useState('2026-09-18T09:00');
 const [rounding,setRounding]=useState<Rounding>('none'),[threshold,setThreshold]=useState('40'),[first,setFirst]=useState('3:45'),[second,setSecond]=useState('2:30'),[operation,setOperation]=useState('add'),[direction,setDirection]=useState('decimal'),[value,setValue]=useState('7,75');
 const [startOccurrence,setStartOccurrence]=useState<Occurrence>('reject'),[endOccurrence,setEndOccurrence]=useState<Occurrence>('reject');
 const [output,setOutput]=useState<Output|null>(null),[dirty,setDirty]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const changed=()=>{setDirty(true);setError('');setNotice('');};
 const number=(n:number)=>new Intl.NumberFormat(prefs.number,{maximumFractionDigits:4}).format(n);
 function field(label:TimeKey,child:ReactNode,help:TimeKey='help'){return <HelpLabel locale={locale} help={t(help)} optional={false} className={s.field}><span>{t(label)}</span>{child}</HelpLabel>;}
 function occurrence(label:TimeKey,current:Occurrence,set:(v:Occurrence)=>void){return field(label,<select value={current} onChange={e=>{set(e.target.value as Occurrence);changed();}}>{(['reject','earlier','later'] as const).map(k=><option key={k} value={k}>{t(k)}</option>)}</select>,'overlap');}
 function updateShift(index:number,patch:Partial<Shift>){if(index===-1)setSingle(v=>({...v,...patch}));else setWeek(v=>v.map((row,i)=>i===index?{...row,...patch}:row));changed();}
 function shiftFields(row:Shift,index:number){return <div className={s.shiftFields}>{field('start',<input type="time" required={row.enabled} disabled={!row.enabled} value={row.start} onChange={e=>updateShift(index,{start:e.target.value})}/>)}{field('end',<input type="time" required={row.enabled} disabled={!row.enabled} value={row.end} onChange={e=>updateShift(index,{end:e.target.value})}/>)}{field('rest',<input type="number" min="0" max="2880" step="1" required={row.enabled} disabled={!row.enabled} value={row.breakMinutes} onChange={e=>updateShift(index,{breakMinutes:e.target.value})}/>)}<label className={s.check}><input type="checkbox" disabled={!row.enabled} checked={row.nextDay} onChange={e=>updateShift(index,{nextDay:e.target.checked})}/>{t('next')}</label></div>;}
 function run(){try{
  let next:Output;
  if(id==='timezones'){
   const r=convertTime(wall,from,to,startOccurrence);
   next={main:r.destination.replace('T',' · '),zoneResult:r,from,to,rows:[[t('from'),from,r.source],[t('to'),to,r.destination],[t('difference'),durationText(r.difference)]],metrics:[['difference',(r.difference>0?'+':'')+durationText(r.difference)]]};
  }else{
   let total:number,actual:number,extra=0,rows:(string|number)[][]=[];
   if(mode==='weekly'){
    const r=weeklyHours(date,week.map(row=>({...row,startOccurrence,endOccurrence})),zone,decimal(threshold),rounding);total=r.total;actual=r.actual;extra=r.overtime;
    rows=[[t('date'),t('start'),t('end'),t('rest'),t('next'),t('actual'),t('total')],...r.rows.map((row,i)=>[row.date,row.enabled?week[i].start:'',row.enabled?week[i].end:'',row.enabled?week[i].breakMinutes:'',row.enabled&&(week[i].nextDay||week[i].end<week[i].start)?t('yes'):t('no'),durationText(row.actual),durationText(row.rounded)])];
   }else if(mode==='duration'){actual=shiftMinutes(date,{...single,startOccurrence,endOccurrence},zone);total=roundMinutes(actual,rounding);rows=[[t('date'),date],[t('zone'),zone],[t('start'),single.start],[t('end'),single.end],[t('rest'),single.breakMinutes]];}
   else if(mode==='arithmetic'){total=durationMinutes(first)+(operation==='add'?1:-1)*durationMinutes(second);actual=total;rows=[[t('first'),first],[t('operation'),t(operation as 'add'|'subtract')],[t('second'),second]];}
   else{total=direction==='decimal'?Math.round(decimal(value)*60):durationMinutes(value);actual=total;rows=[[t('input'),value],[t('direction'),t(direction as 'decimal'|'hm')]];}
   next={main:durationText(total),rows:[...rows,[t('total'),durationText(total)],[t('decimal'),total/60]],metrics:[['decimal',number(total/60)]]};
   if(mode==='weekly'||mode==='duration')next.metrics.push(['actual',durationText(actual)],['adjustment',durationText(total-actual)]);
   if(mode==='weekly'){next.metrics.push(['overtime',durationText(extra)]);next.rows.push([t('zone'),zone],[t('threshold'),decimal(threshold)],[t('overtime'),durationText(extra)],[t('rounding'),t(rounding)]);}
  }
  setOutput(next);setDirty(false);setError('');setNotice('');record(id);
 }catch(e){setError(t(e instanceof TimeInputError?e.code:'invalid'));setOutput(null);}}
 async function transfer(kind:'copy'|'csv'|'xlsx'){
  if(!output||dirty)return;
  try{if(kind==='copy'){await navigator.clipboard.writeText(delimited(output.rows,'\t',''));setNotice(t('copied'));}else if(kind==='csv')saveFile('\ufeff'+delimited(output.rows),'csv',id,'text/csv;charset=utf-8');else{const {workbook}=await import('@/lib/export');saveFile(workbook([{name:t('summary'),rows:output.rows}]) as BlobPart,'xlsx',id,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');}}catch{setNotice(t('failed'));}
 }
 const prettyDate=(dateTime:string)=>new Intl.DateTimeFormat(locale,{dateStyle:'full',timeStyle:'short',timeZone:'UTC',hour12:prefs.time==='12'}).format(new Date(dateTime+'Z'));
 const zoneName=(name:string,epoch:number)=>fixedOffset(name)!==null?name:new Intl.DateTimeFormat(locale,{timeZone:name,timeZoneName:'long'}).formatToParts(epoch).find(p=>p.type==='timeZoneName')?.value??name;
 const dayLabel=(i:number)=>{try{return new Intl.DateTimeFormat(locale,{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(addDays(date,i)+'T12:00Z'));}catch{return String(i+1);}};
 return <div className={s.root}>
  {id==='hours'&&<div className={s.modes} aria-label={t('operation')}>{(['duration','arithmetic','weekly','conversion'] as const).map(m=><button type="button" key={m} aria-pressed={mode===m} onClick={()=>{setMode(m);changed();setOutput(null);}}>{t(m)}</button>)}</div>}
  <form className={s.form} onSubmit={e=>{e.preventDefault();run();}}>
   {id==='timezones'?<div className={s.fields}>{field('wall',<input type="datetime-local" required min="1970-01-01T00:00" max="2100-12-31T23:59" value={wall} onChange={e=>{setWall(e.target.value);changed();}}/>,'zoneHelp')}<ZonePicker locale={locale} label={t('from')} value={from} onChange={v=>{setFrom(v);changed();}}/><ZonePicker locale={locale} label={t('to')} value={to} onChange={v=>{setTo(v);changed();}}/></div>:<>
    {(mode==='duration'||mode==='weekly')&&<div className={s.fields}>{field(mode==='weekly'?'startDate':'date',<input type="date" min="1970-01-01" max="2100-12-25" required value={date} onChange={e=>{setDate(e.target.value);changed();}}/>)}<ZonePicker label={t('zone')} locale={locale} value={zone} onChange={v=>{setZone(v);changed();}}/></div>}
    {mode==='duration'&&shiftFields(single,-1)}
    {mode==='weekly'&&<div className={s.week}>{week.map((row,i)=><div key={i} className={s.day}><label className={s.check}><input type="checkbox" checked={row.enabled} onChange={e=>updateShift(i,{enabled:e.target.checked})}/><strong>{dayLabel(i)}</strong><span className={s.sr}>{t('enabled')}</span></label>{shiftFields(row,i)}</div>)}</div>}
    {mode==='arithmetic'&&<div className={s.fields}>{field('first',<input required value={first} placeholder="3:45" onChange={e=>{setFirst(e.target.value);changed();}}/>,'convertHelp')}{field('operation',<select value={operation} onChange={e=>{setOperation(e.target.value);changed();}}><option value="add">{t('add')} (+)</option><option value="subtract">{t('subtract')} (−)</option></select>,'convertHelp')}{field('second',<input required value={second} placeholder="2:30" onChange={e=>{setSecond(e.target.value);changed();}}/>,'convertHelp')}</div>}
    {mode==='conversion'&&<div className={s.fields}>{field('direction',<select value={direction} onChange={e=>{setDirection(e.target.value);setValue(e.target.value==='decimal'?'7,75':'7:45');changed();}}><option value="decimal">{t('decimal')}</option><option value="hm">{t('hm')}</option></select>,'convertHelp')}{field('input',<input required value={value} onChange={e=>{setValue(e.target.value);changed();}}/>,'convertHelp')}</div>}
   </>}
   {(id==='timezones'||mode==='duration'||mode==='weekly')&&<details className={s.options}><summary>{t('advanced')}</summary><div className={s.fields}>
    {id==='hours'&&field('rounding',<select value={rounding} onChange={e=>{setRounding(e.target.value as Rounding);changed();}}>{(['none','nearest','down','up'] as const).map(v=><option key={v} value={v}>{t(v)}</option>)}</select>)}
    {id==='hours'&&mode==='weekly'&&field('threshold',<input required inputMode="decimal" value={threshold} onChange={e=>{setThreshold(e.target.value);changed();}}/>)}
    {occurrence('ambiguity',startOccurrence,setStartOccurrence)}
    {id==='hours'&&occurrence('end',endOccurrence,setEndOccurrence)}
   </div></details>}
   {error&&<p className="error-message" role="alert">{error}</p>}
   <div className={s.actions}><button className="primary-button" type="submit">{t('calculate')}</button><small>{t('privacy')}</small></div>
  </form>
  <section className={s.result} aria-live="polite"><p className={s.note}>{dirty?t('pending'):output?t('calculated'):t('example')}</p>{output?<><h2>{id==='timezones'?t('to'):t('total')}</h2><div className={s.value}>{id==='timezones'?prettyDate(output.zoneResult!.destination):output.main}<small>{id==='hours'?'h:mm':''}</small></div>
   <dl className={s.metrics}>{output.metrics.map(([key,val])=><div key={key}><dt>{t(key)}</dt><dd>{val}</dd></div>)}</dl>
   {output.zoneResult&&<div className={s.zoneCards}>{(['source','destination'] as const).map(k=><div key={k}><h3>{k==='source'?t('from'):t('to')}</h3><strong>{k==='source'?output.from:output.to}</strong><p>{zoneName((k==='source'?output.from:output.to)!,output.zoneResult!.epoch)} · {offsetName(output.zoneResult![k==='source'?'sourceOffset':'destinationOffset'])}</p><p>{prettyDate(output.zoneResult![k])}</p><p>{t('dst')}: {t(output.zoneResult![k==='source'?'sourceDst':'destinationDst'])}</p></div>)}</div>}
   {id==='hours'&&mode==='weekly'&&<div className={s.tableWrap}><table><thead><tr>{output.rows[0].map((v,i)=><th key={i}>{v}</th>)}</tr></thead><tbody>{output.rows.slice(1,8).map((row,i)=><tr key={i}>{row.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}
   <div className={s.actions}><button type="button" className="secondary-button" disabled={dirty} onClick={()=>transfer('copy')}><Copy size={16}/>{t('copy')}</button>{(['csv','xlsx'] as const).map(kind=><button type="button" key={kind} className="secondary-button" disabled={dirty} onClick={()=>transfer(kind)}><Download size={16}/>{kind==='xlsx'?'Excel':'CSV'}</button>)}</div>
  </>:<p>{t(id==='hours'?'hoursDesc':'zonesDesc')}</p>}<output>{notice}</output></section>
  <details className={s.help}><summary>{t('help').split('.')[0]}</summary><p>{t(id==='timezones'?'zoneHelp':mode==='arithmetic'||mode==='conversion'?'convertHelp':'help')}</p><p>{t('zoneHelp')}</p><a href="https://www.iana.org/time-zones" target="_blank" rel="noreferrer">IANA — Time Zone Database</a></details>
 </div>;
}
