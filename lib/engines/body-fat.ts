import {adult,bounded,dimensions,sexValue,type Sex} from './health-input.ts';
export function bodyFat(input:{weight:number;height:number;age:number;sex:Sex;method:'navy'|'deurenberg';waist?:number;neck?:number;hip?:number}) {
  const {weight,height,age,sex,method,waist,neck,hip}=input;
  dimensions(weight,height); adult(age); sexValue(sex);
  let percent:number;
  if(method==='deurenberg') percent=1.2*weight/(height/100)**2+.23*age-(sex==='male'?10.8:0)-5.4;
  else if(method==='navy') {
    bounded(waist??NaN,30,250); bounded(neck??NaN,15,80);
    if(sex==='female') bounded(hip??NaN,40,250);
    const girth=sex==='male'?waist!-neck!:waist!+hip!-neck!;
    bounded(girth,.1,500);
    const density=sex==='male'?1.0324-.19077*Math.log10(girth)+.15456*Math.log10(height):1.29579-.35004*Math.log10(girth)+.221*Math.log10(height);
    percent=495/density-450;
  } else throw new Error('invalid');
  bounded(percent,1,70);
  return {percent,fatMass:weight*percent/100,leanMass:weight*(1-percent/100)};
}
