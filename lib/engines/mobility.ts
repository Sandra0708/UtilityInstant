export function inputNumber(value:string,min=0,max=1e9){if(typeof value!=='string'||!/^\d+(?:[.,]\d+)?$/.test(value.trim()))throw new Error('invalid');const n=Number(value.trim().replace(',','.'));if(!Number.isFinite(n)||n<min||n>max)throw new Error('invalid');return n;}
export const mileKm=1.609344,usGallonL=3.785411784,ukGallonL=4.54609;
export type FuelUnit='l100'|'kml'|'mpgus'|'mpguk'|'kwh100';
export type PriceUnit='litre'|'usgal'|'ukgal'|'kwh';
export function consumptionPer100(value:number,unit:FuelUnit){if(!Number.isFinite(value)||value<=0||value>10000)throw new Error('invalid');switch(unit){case 'l100':case 'kwh100':return value;case 'kml':return 100/value;case 'mpgus':return 100*usGallonL/(value*mileKm);case 'mpguk':return 100*ukGallonL/(value*mileKm);default:throw new Error('invalid');}}
export function fuel(input:{distance:number;distanceUnit:'km'|'mi';consumption:number;unit:FuelUnit;price:number;priceUnit:PriceUnit;people:number}){
 const {distance,distanceUnit,consumption,unit,price,priceUnit,people}=input;
 if(!Number.isFinite(distance)||distance<0||distance>100000||!['km','mi'].includes(distanceUnit)||!Number.isFinite(price)||price<0||price>10000||!Number.isInteger(people)||people<1||people>100)throw new Error('invalid');
 if(unit==='kwh100'?priceUnit!=='kwh':!['litre','usgal','ukgal'].includes(priceUnit))throw new Error('invalid');
 const km=distance*(distanceUnit==='mi'?mileKm:1),per100=consumptionPer100(consumption,unit),amount=per100*km/100;
 const unitPrice=price/(priceUnit==='usgal'?usGallonL:priceUnit==='ukgal'?ukGallonL:1),cost=amount*unitPrice;
 return {km,per100,amount,cost,perPerson:cost/people,perKm:per100*unitPrice/100,conversions:unit==='kwh100'?null:{l100:per100,kml:100/per100,mpgus:100*usGallonL/(per100*mileKm),mpguk:100*ukGallonL/(per100*mileKm)}};
}
export function electricity({watts,hours,days,price,standby}:{watts:number;hours:number;days:number;price:number;standby:number}){
 if(![watts,hours,days,price,standby].every(Number.isFinite)||watts<0||watts>100000||standby<0||standby>100000||hours<0||hours>24||!Number.isInteger(days)||days<1||days>3660||price<0||price>10000)throw new Error('invalid');
 const activeDay=watts*hours/1000,standbyDay=standby*(24-hours)/1000,active=activeDay*days,idle=standbyDay*days;
 return {active,idle,kwh:active+idle,cost:(active+idle)*price,activeCost:active*price,idleCost:idle*price,annualStandby:standbyDay*365,annualStandbyCost:standbyDay*365*price};
}
export function seconds(value:string,full=false){const match=(full?/^(\d{1,3}):([0-5]\d):([0-5]\d)$/:/^(\d{1,3}):([0-5]\d)$/).exec(value.trim());if(!match)throw new Error('invalid');const n=full?Number(match[1])*3600+Number(match[2])*60+Number(match[3]):Number(match[1])*60+Number(match[2]);if(n<=0)throw new Error('invalid');return n;}
export function timeString(value:number,full=false){if(!Number.isFinite(value)||value<0)throw new Error('invalid');const n=Math.round(value),s=String(n%60).padStart(2,'0'),m=String(Math.floor(n/60)%60).padStart(2,'0');return full?`${Math.floor(n/3600)}:${m}:${s}`:`${Math.floor(n/60)}:${s}`;}
export function riegel(distance:number,referenceDistance:number,referenceSeconds:number){if(![distance,referenceDistance,referenceSeconds].every(Number.isFinite)||distance<=0||distance>200||referenceDistance<=0||referenceDistance>200||referenceSeconds<=0||referenceSeconds>604800)throw new Error('invalid');return referenceSeconds*(distance/referenceDistance)**1.06;}
export function pace({value,unit,distance,splitUnit,reference}:{value:string;unit:'minkm'|'minmi'|'kmh';distance:number;splitUnit:'km'|'mi';reference?:{distance:number;seconds:number}}){
 if(!['minkm','minmi','kmh'].includes(unit)||!['km','mi'].includes(splitUnit)||!Number.isFinite(distance)||distance<=0||distance>200)throw new Error('invalid');
 const perKm=unit==='kmh'?3600/inputNumber(value,.1,60):seconds(value)/(unit==='minmi'?mileKm:1);
 if(perKm<60||perKm>36000)throw new Error('invalid');
 const step=splitUnit==='mi'?mileKm:1,rows:{distance:number;duration:number;elapsed:number}[]=[];
 for(let previous=0;previous<distance-1e-9;){const end=Math.min(distance,previous+step);rows.push({distance:end/(splitUnit==='mi'?mileKm:1),duration:(end-previous)*perKm,elapsed:end*perKm});previous=end;}
 const races=[5,10,21.0975,42.195].map(km=>({km,time:km*perKm,prediction:reference?riegel(km,reference.distance,reference.seconds):undefined}));
 return {perKm,perMile:perKm*mileKm,speed:3600/perKm,time:distance*perKm,rows,races};
}
