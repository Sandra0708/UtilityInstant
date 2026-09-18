'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {Copy,Download,RotateCcw} from 'lucide-react';
import {usePrefs} from './platform';
import HelpLabel from './field-help';
import {translate,type Language} from '@/lib/localization';
import {healthText as text,type HealthKey} from '@/lib/localization/health';
import {healthTools,type HealthId} from '@/lib/health-tools';
import {calculateHealth,healthDefaults,healthNumber,type HealthResult} from '@/lib/health';
import {saveFile,delimited} from '@/lib/table-export';
import {healthFaq,healthHelp as helpKeys} from '@/lib/health-faq';
import s from './health-workspace.module.css';

const activityKeys:HealthKey[]=['sedentary','light','moderate','very','extra'];
const unitsFor=(key:string,imperial:boolean)=>key==='weight'?(imperial?'lb':'kg'):['height','waist','neck','hip'].includes(key)?(imperial?'in':'cm'):key==='bodyFat'?'%':'';
const factor=(key:string)=>key==='weight'?.45359237:['height','waist','neck','hip'].includes(key)?2.54:1;

export default function HealthWorkspace({id,locale,prefill}:{id:HealthId;locale:Language;prefill?:Record<string,string>}) {
 const tool=healthTools.find(t=>t.id===id)!,{prefs,record}=usePrefs();
 const initial={...healthDefaults(id,locale),...prefill};
 const [values,setValues]=useState(initial),[submitted,setSubmitted]=useState(initial),[imperial,setImperial]=useState(false);
 const [result,setResult]=useState<HealthResult|null>(()=>calculateHealth(id,initial,locale));
 const [dirty,setDirty]=useState(false),[example,setExample]=useState(!prefill),[error,setError]=useState(''),[notice,setNotice]=useState(''),[transfer,setTransfer]=useState<Record<string,string>|null>(null);
 const t=(key:HealthKey)=>text(locale,key),say=(es:string,en:string)=>translate(locale,es,en);
 const fmt=(v:number)=>new Intl.NumberFormat(prefs.number,{maximumFractionDigits:id==='tdee'?0:1}).format(v);
 const change=(key:string,value:string)=>{setValues(old=>({...old,[key]:value}));setDirty(true);setError('');setTransfer(null);};
 const setUnits=useCallback((next:boolean)=>{if(next===imperial)return;setValues(old=>Object.fromEntries(Object.entries(old).map(([key,val])=>{if(factor(key)===1||!val.trim())return[key,val];try{return[key,String(Number((healthNumber(val)*(next?1/factor(key):factor(key))).toFixed(8)))];}catch{return[key,val];}})));setImperial(next);},[imperial]);
 // React to preference changes, without overriding this form's manual unit choice.
 const previousPreference=useRef<string|null>(null);
 useEffect(()=>{if(previousPreference.current===prefs.units)return;previousPreference.current=prefs.units;setUnits(prefs.units==='imperial');},[prefs.units,setUnits]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),3500);return()=>clearTimeout(timer);},[notice]);
 const canonical=()=>Object.fromEntries(Object.entries(values).map(([key,val])=>[key,imperial&&factor(key)!==1?String(healthNumber(val)*factor(key)):val]));
 function run(){try{const input=canonical(),next=calculateHealth(id,input,locale);setResult(next);setSubmitted(input);setExample(false);setDirty(false);setError('');record(id);}catch(e){setResult(null);setError(e instanceof Error?e.message:t('invalid'));}}
 function reset(){setValues(initial);setSubmitted(initial);setResult(calculateHealth(id,initial,locale));setImperial(false);setExample(!prefill);setError('');setDirty(false);setTransfer(null);}
 const option=(v:string)=>v==='mifflin'?'Mifflin–St Jeor':v==='katch'?'Katch–McArdle':v==='navy'?'US Navy (Hodgdon–Beckett)':v==='deurenberg'?'Deurenberg':activityKeys[['1.2','1.375','1.55','1.725','1.9'].indexOf(v)]?t(activityKeys[['1.2','1.375','1.55','1.725','1.9'].indexOf(v)]):t(v as HealthKey);
 function input(key:string,label:HealthKey,optional=false) {
  const unit=unitsFor(key,imperial);
  return <HelpLabel key={key} locale={locale} className={s.field} htmlFor={'health-'+id+'-'+key} help={t(helpKeys[id])} optional={false}><span>{t(label)} {unit&&<small>({unit})</small>}{optional&&<small> ({t('optional')})</small>}</span><input id={'health-'+id+'-'+key} type="text" inputMode="decimal" autoComplete="off" maxLength={30} required={!optional} value={values[key]} onChange={e=>change(key,e.target.value)}/></HelpLabel>;
 }
 function select(key:string,label:HealthKey,options:string[]) {return <label className={s.field} key={key}><span>{t(label)}</span><select value={values[key]} onChange={e=>change(key,e.target.value)}>{options.map(v=><option key={v} value={v}>{option(v)}</option>)}</select></label>;}
 const summary=(): (string|number)[][] => !result?[]:[[tool.title[locale],result.main,result.unit||''],...(result.category?[[t('region'),option(submitted.region),t(result.category)]]:[]),...result.metrics.map(m=>[m.label,m.value]),...result.rows,[t('method'),result.method?option(result.method):tool.formula],[t('diet'),t('safety')],[t('how'),t(helpKeys[id])],...(result.floorApplied?[[t('floor')]]:[])];
 async function copy(){try{await navigator.clipboard.writeText(delimited(summary(),'\t',''));setNotice(say('Copiado al portapapeles','Copied to clipboard'));}catch{setNotice(say('No se pudo copiar.','Could not copy.'));}}
 async function excel(){try{const {workbook}=await import('@/lib/export');const data=workbook([{name:t('summary'),rows:summary()}]);saveFile(data as BlobPart,'xlsx',id,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');}catch{setNotice(say('No se pudo exportar. Inténtalo de nuevo.','The export failed. Please try again.'));}}
 const extraFields=id==='tdee'&&values.method==='katch'?input('bodyFat','knownFat'):id==='body-fat'&&values.method==='navy'?<>{input('waist','waist')}{input('neck','neck')}{values.sex==='female'&&input('hip','hip')}</>:null;
 return <div className={s.root}>
  <div className={s.workspace}>
   <form className={s.form} onSubmit={e=>{e.preventDefault();run();}}>
    <div className={s.toolbar}><h2>{say('Tu punto de partida','Your starting point')}</h2><button type="button" className="icon-button" onClick={reset} aria-label={say('Restablecer ejemplo','Reset example')}><RotateCcw size={17}/></button></div>
    <label className={s.units}>{t('units')}<select value={imperial?'imperial':'metric'} onChange={e=>setUnits(e.target.value==='imperial')}><option value="metric">kg / cm</option><option value="imperial">lb / in</option></select></label>
    <div className={s.fields}>{tool.fields.map(f=>f.type==='select'?select(f.id,f.id as HealthKey,f.options!):input(f.id,f.id as HealthKey,f.required===false))}{extraFields}</div>
    {id!=='bmi'&&<p className={s.note}>{t('adults')}</p>}
    {error&&<p className="error-message" role="alert">{error}</p>}
    <button type="submit" className="primary-button">{say('Calcular resultado','Calculate result')}</button>
    <p className={s.note}>{t('private')}</p>
   </form>
   <section className={s.result} aria-live="polite" aria-atomic="true">
    <p className={s.note}>{dirty?say('Has cambiado los datos. Calcula para actualizar el resultado.','Inputs changed. Calculate to update this result.'):example?t('example'):say('Calculado con tus datos','Calculated using your inputs')}</p>
    {result?<><h2>{result.label}</h2><div className={s.value}>{id==='ideal-weight'?`${fmt(result.lower!)} – <${fmt(result.upper!)}`:fmt(Number(result.main))}<small>{result.unit}</small></div>
     {result.category&&<p className={s.category}>{t(result.category)}</p>}
     {id==='bmi'&&result.category!=='minor'&&<figure className={s.scale} aria-label={`BMI ${fmt(Number(result.main))}: ${t(result.category!)}`}><div className={s.scaleTrack}><i style={{left:`${Math.max(0,Math.min(100,(Number(result.main)-10)/35*100))}%`}}/></div><div className={s.scaleTicks}>{[10,18.5,25,30,35,40,45].map(n=><span key={n} style={{left:`${(n-10)/35*100}%`}}>{fmt(n)}</span>)}</div></figure>}
     <dl className={s.metrics}>{result.metrics.map(m=><div key={m.label}><dt>{m.label}</dt><dd>{typeof m.value==='number'?fmt(m.value):m.value}{typeof m.value==='number'&&<small> {id==='tdee'?'kcal':'kg'}</small>}</dd></div>)}</dl>
     {id==='tdee'&&<div className={s.bars} aria-hidden="true">{result.metrics.filter(m=>typeof m.value==='number').map(m=><div key={m.label}><span>{m.label}</span><div style={{width:`${Number(m.value)/Number(result.main)/1.15*100}%`}}/></div>)}</div>}
     {!!result.rows.length&&<table className={s.table}><thead><tr><th>{t('method')}</th><th>kg</th></tr></thead><tbody>{result.rows.map(row=><tr key={row[0]}><td>{row[0]}</td><td>{fmt(Number(row[1]))}</td></tr>)}</tbody></table>}
     {result.floorApplied&&<p className={s.note}>{t('floor')}</p>}
     <div className={s.actions}><button type="button" className="secondary-button" disabled={dirty} onClick={copy}><Copy size={16}/>{say('Copiar','Copy')}</button><button type="button" className="secondary-button" disabled={dirty} onClick={excel}><Download size={16}/>Excel</button></div>
     {id==='body-fat'&&<button className="text-button" disabled={dirty} onClick={()=>setTransfer({...submitted,method:'katch',bodyFat:String(result.bodyFat),activity:'1.55'})}>{t('useFat')}</button>}
    </>:<p>{say('Tu resultado aparecerá aquí','Your result will appear here')}</p>}
   </section>
  </div>
  <p className={s.disclaimer}>{t('safety')} {t('professional')}</p>
  {transfer&&<section className={s.transfer}><h2>{t('tdee')}</h2><HealthWorkspace id="tdee" locale={locale} prefill={transfer}/></section>}
  <section className={s.explanation}><h2>{say('Más que un resultado. Una explicación.','More than a result. An explanation.')}</h2>{healthFaq(id,locale).map((faq,i)=><details key={faq.q} open={i===0}><summary>{faq.q}</summary><p>{faq.a}</p>{i===0&&<code>{tool.formula}</code>}</details>)}<div className={s.sources}><a href={tool.source} target="_blank" rel="noreferrer">{say('Consultar la metodología de referencia ↗','Read the reference methodology ↗')}</a>{id==='bmi'&&<a href="https://www.jasso.or.jp/data/magazine/pdf/chart_A.pdf" target="_blank" rel="noreferrer">JASSO ↗</a>}{id==='tdee'&&<a href="https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner" target="_blank" rel="noreferrer">NIDDK ↗</a>}{id==='body-fat'&&<a href="https://escholarship.org/content/qt9451r851/qt9451r851.pdf" target="_blank" rel="noreferrer">Hodgdon–Beckett / Siri ↗</a>}</div><p className={s.note}>{t('reviewed')}</p></section>
  {notice&&<output>{notice}</output>}
 </div>;
}
