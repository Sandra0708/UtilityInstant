import type {Tool,Field} from './tools.ts';
import {healthCopy as c,type HealthKey} from './localization/health.ts';
export const healthIds=['bmi','tdee','body-fat','ideal-weight'] as const;
export type HealthId=typeof healthIds[number];
export const isHealth=(id:string):id is HealthId=>healthIds.includes(id as HealthId);
const num=(id:string,key:HealthKey,value:number,min:number,max:number,unit:string):Field=>({id,label:c(key),help:c('precision'),type:'number',value:String(value),min,max,step:.01,unit});
const choice=(id:string,key:HealthKey,value:string,options:string[]):Field=>({id,label:c(key),help:c('precision'),type:'select',value,options});
const weight=num('weight','weight',70,20,500,'kg'), height=num('height','height',175,100,250,'cm'), age=num('age','age',30,18,120,''), sex=choice('sex','sex','male',['male','female']);
const shared={category:'health',limitations:c('safety')};
export const healthTools:Omit<Tool,'exportable'|'compare'|'related'>[]=[
 {...shared,id:'bmi',title:c('bmi'),description:c('bmiDesc'),fields:[weight,height,{id:'age',label:c('age'),help:c('bmiHelp'),type:'text',value:'',required:false},choice('region','region','international',['international','japan'])],formula:'BMI = kg / m²; reference: 18.5 ≤ BMI < 25',explanation:c('bmiHelp'),example:c('bmiDesc'),aliases:['imc','bmi','body mass index','indice masa corporal'],source:'https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html'},
 {...shared,id:'tdee',title:c('tdee'),description:c('tdeeDesc'),fields:[weight,height,age,sex,choice('activity','activity','1.55',['1.2','1.375','1.55','1.725','1.9']),choice('method','method','mifflin',['mifflin','katch'])],formula:'Mifflin: 10W + 6.25H − 5A + (5 / −161); Katch: 370 + 21.6 × FFM; TDEE = resting × activity',explanation:c('tdeeHelp'),example:c('tdeeDesc'),limitations:c('adults'),aliases:['tdee','calorias','calories','basal','metabolismo','bmr'],source:'https://pubmed.ncbi.nlm.nih.gov/2305711/'},
 {...shared,id:'body-fat',title:c('body-fat'),description:c('fatDesc'),fields:[weight,height,age,sex,choice('method','method','navy',['navy','deurenberg'])],formula:'Navy: 495 / density − 450; Deurenberg: 1.20 × BMI + 0.23 × age − 10.8 × sex − 5.4',explanation:c('fatHelp'),example:c('fatDesc'),limitations:c('adults'),aliases:['grasa','body fat','navy','deurenberg','masa magra'],source:'https://pubmed.ncbi.nlm.nih.gov/2043597/'},
 {...shared,id:'ideal-weight',title:c('ideal-weight'),description:c('idealDesc'),fields:[height,age,sex],formula:'Devine / Robinson / Miller / Hamwi; reference: 18.5 × m² ≤ kg < 25 × m²',explanation:c('idealHelp'),example:c('idealDesc'),aliases:['peso ideal','ideal weight','peso saludable'],source:'https://pubmed.ncbi.nlm.nih.gov/27030535/'}
];
