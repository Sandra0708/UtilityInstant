import {adult,bounded,sexValue,type Sex} from './health-input.ts';
export function idealWeight(height:number,sex:Sex,age:number) {
  bounded(height,100,250); adult(age); sexValue(sex);
  const inches=height/2.54-60, male=sex==='male';
  // Historical equations start at five feet; do not extrapolate below that height.
  const formulas=height<152.4?[]:[
    {name:'Devine',value:(male?50:45.5)+2.3*inches},
    {name:'Robinson',value:(male?52:49)+(male?1.9:1.7)*inches},
    {name:'Miller',value:(male?56.2:53.1)+(male?1.41:1.36)*inches},
    // Hamwi was published in pounds; convert the original coefficients exactly.
    {name:'Hamwi',value:((male?106:100)+(male?6:5)*inches)*.45359237}
  ];
  return {lower:18.5*(height/100)**2,upper:25*(height/100)**2,formulas};
}
