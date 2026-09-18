import {bmi} from './engines/bmi.ts';
import {tdee} from './engines/tdee.ts';
import {bodyFat} from './engines/body-fat.ts';
import {idealWeight} from './engines/ideal-weight.ts';
import {healthTools,type HealthId} from './health-tools.ts';
import {healthText,type HealthKey} from './localization/health.ts';
import type {Language} from './localization/languages.ts';
import type {Result} from './engine.ts';
import type {Sex} from './engines/health-input.ts';
export type HealthResult=Result & {category?:HealthKey;lower?:number;upper?:number;floorApplied?:boolean;bodyFat?:number;method?:string};
/** Explicit decimal parser: accepts a comma or point, never grouped or partially parsed input. */
export function healthNumber(raw:string) {
 if(typeof raw!=='string'||!/^[-+]?\d+(?:[.,]\d+)?$/.test(raw.trim()))throw new Error('invalid');
 const value=Number(raw.trim().replace(',','.'));if(!Number.isFinite(value))throw new Error('invalid');return value;
}
export function calculateHealth(id:HealthId,raw:Record<string,string>,locale:Language):HealthResult {
 const t=(key:HealthKey)=>healthText(locale,key);
 try {
  const def=healthTools.find(tool=>tool.id===id)!;
  for(const f of def.fields){const value=raw[f.id];if(typeof value!=='string'||value.length>100)throw new Error('invalid');if(f.type==='select'&&!f.options!.includes(value))throw new Error('invalid');if(f.type==='number'){const n=healthNumber(value);if(n<f.min!||n>f.max!)throw new Error('invalid');}}
  const num=(key:string)=>healthNumber(raw[key]);
  const metric=(key:HealthKey,value:number|string)=>({label:t(key),value});
  const height=num('height'),sex=raw.sex as Sex;
  const result:HealthResult={main:0,label:t(id),metrics:[],columns:[t('method'),'kg'],rows:[]};
  if(id==='bmi') {
   const r=bmi(num('weight'),height,raw.age?.trim()?num('age'):undefined,raw.region as 'international'|'japan');
   result.main=r.value;result.unit='kg/m²';result.category=r.category as HealthKey;
   result.metrics=[];
   if(r.category!=='minor'){result.lower=r.lower;result.upper=r.upper;result.metrics=[metric('minimum',r.lower),metric('maximum',r.upper)];}
  } else if(id==='tdee') {
   const r=tdee({weight:num('weight'),height,age:num('age'),sex,activity:num('activity'),method:raw.method as 'mifflin'|'katch',bodyFat:raw.method==='katch'?num('bodyFat'):undefined});
   result.main=r.maintenance;result.label=t('maintenance');result.unit=t('perDay');result.method=raw.method;result.floorApplied=r.floorApplied;
   result.metrics=[metric('resting',r.resting),metric(r.floorApplied?'limitedDeficit':'deficit',r.deficit??t('unavailable')),metric('surplus',r.surplus)];
  } else if(id==='body-fat') {
   const r=bodyFat({weight:num('weight'),height,age:num('age'),sex,method:raw.method as 'navy'|'deurenberg',waist:raw.method==='navy'?num('waist'):undefined,neck:raw.method==='navy'?num('neck'):undefined,hip:raw.method==='navy'&&sex==='female'?num('hip'):undefined});
   result.main=r.percent;result.unit='%';result.bodyFat=r.percent;result.method=raw.method;result.metrics=[metric('fat',r.fatMass),metric('lean',r.leanMass)];
  } else {
   const r=idealWeight(height,sex,num('age'));result.main=r.lower;result.lower=r.lower;result.upper=r.upper;result.label=t('reference');result.unit='kg';result.rows=r.formulas.map(f=>[f.name,f.value]);result.metrics=[metric('minimum',r.lower),metric('maximum',r.upper)];
  }
  return result;
 } catch {throw new Error(t('invalid'));}
}
export function healthDefaults(id:HealthId,locale:Language):Record<string,string> {
 return {...Object.fromEntries(healthTools.find(t=>t.id===id)!.fields.map(f=>[f.id,f.value])),waist:'85',neck:'38',hip:'95',bodyFat:'20',...(id==='bmi'?{region:locale==='ja'?'japan':'international'}:{})};
}
