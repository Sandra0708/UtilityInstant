import {fuel,electricity,pace,seconds,inputNumber,timeString,type FuelUnit,type PriceUnit} from './engines/mobility.ts';
import type {MobilityId} from './mobility-tools.ts';
import {mobilityText,type MobilityKey} from './localization/mobility.ts';
import type {Language} from './localization/languages.ts';
import type {Result} from './engine.ts';
export type MobilityResult=Result&{a?:ReturnType<typeof fuel>;b?:ReturnType<typeof fuel>;energy?:ReturnType<typeof electricity>;running?:ReturnType<typeof pace>};
export function mobilityDefaults(id:MobilityId):Record<string,string>{return id==='fuel'?{distance:'500',distanceUnit:'km',consumption:'6.5',unit:'l100',price:'1.6',priceUnit:'litre',people:'2',compare:'no',bConsumption:'16',bUnit:'kwh100',bPrice:'0.25',bPriceUnit:'kwh'}:id==='electricity'?{watts:'60',hours:'5',days:'30',price:'0.25',standby:'2'}:{value:'5:00',unit:'minkm',distance:'10',splitUnit:'km',predict:'no',referenceDistance:'10',referenceTime:'0:50:00'};}
export function calculateMobility(id:MobilityId,raw:Record<string,string>,locale:Language):MobilityResult{
 const v={...mobilityDefaults(id),...raw},t=(k:MobilityKey)=>mobilityText(locale,k),n=(key:string,min=0,max=1e9)=>inputNumber(v[key],min,max);
 const result:MobilityResult={main:0,label:t('total'),metrics:[],columns:[],rows:[]};
 if(id==='fuel'){
  const base={distance:n('distance',0,100000),distanceUnit:v.distanceUnit as 'km'|'mi',people:n('people',1,100)};
  result.a=fuel({...base,consumption:n('consumption',.000001,10000),unit:v.unit as FuelUnit,price:n('price',0,10000),priceUnit:v.priceUnit as PriceUnit});
  if(!['yes','no'].includes(v.compare))throw new Error('invalid');
  if(v.compare==='yes')result.b=fuel({...base,consumption:n('bConsumption',.000001,10000),unit:v.bUnit as FuelUnit,price:n('bPrice',0,10000),priceUnit:v.bPriceUnit as PriceUnit});
  const a=result.a;result.main=a.cost;result.money=true;result.columns=[t('result'),t('vehicleA'),...(result.b?[t('vehicleB')]:[])];
  result.rows=[[t('distance')+' (km)',a.km,...(result.b?[result.b.km]:[])],[t('total'),a.cost,...(result.b?[result.b.cost]:[])],[t('perPerson'),a.perPerson,...(result.b?[result.b.perPerson]:[])],[t('perKm'),a.perKm,...(result.b?[result.b.perKm]:[])],[t('amount'),`${a.amount} ${v.unit==='kwh100'?'kWh':'L'}`,...(result.b?[`${result.b.amount} ${v.bUnit==='kwh100'?'kWh':'L'}`]:[])]];
  result.metrics=[{label:t('perPerson'),value:a.perPerson,money:true},{label:t('perKm'),value:a.perKm,money:true}];if(result.b)result.metrics.push({label:t('difference'),value:result.b.cost-a.cost,money:true});
 }else if(id==='electricity'){
  const r=electricity({watts:n('watts'),hours:n('hours'),days:n('days'),price:n('price'),standby:n('standby')});result.energy=r;result.main=r.cost;result.money=true;
  result.columns=[t('result'),'kWh',t('total')];result.rows=[[t('active'),r.active,r.activeCost],[t('idle'),r.idle,r.idleCost],[t('total'),r.kwh,r.cost],[t('annual'),r.annualStandby,r.annualStandbyCost]];result.metrics=[{label:'kWh',value:r.kwh},{label:t('annual')+' · kWh',value:r.annualStandby},{label:t('annual'),value:r.annualStandbyCost,money:true}];
 }else{
  if(!['yes','no'].includes(v.predict))throw new Error('invalid');
  const r=pace({value:v.value,unit:v.unit as 'minkm'|'minmi'|'kmh',distance:n('distance',.001,200),splitUnit:v.splitUnit as 'km'|'mi',reference:v.predict==='yes'?{distance:n('referenceDistance',.001,200),seconds:seconds(v.referenceTime,true)}:undefined});
  result.running=r;result.main=timeString(r.time,true);result.label=t('time');result.metrics=[{label:t('minkm'),value:timeString(r.perKm)},{label:t('minmi'),value:timeString(r.perMile)},{label:'km/h',value:r.speed}];result.columns=[t('distance')+' ('+v.splitUnit+')',t('splits'),t('cumulative')];result.rows=r.rows.map(row=>[Number(row.distance.toFixed(6)),timeString(row.duration,true),timeString(row.elapsed,true)]);
 }
 return result;
}
