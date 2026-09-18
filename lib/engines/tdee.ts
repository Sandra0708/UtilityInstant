import {adult, bounded, dimensions, sexValue, type Sex} from './health-input.ts';
export function tdee(input: {weight:number;height:number;age:number;sex:Sex;activity:number;bodyFat?:number;method?:'mifflin'|'katch'}) {
  const {weight,height,age,sex,activity,bodyFat,method='mifflin'} = input;
  dimensions(weight,height); adult(age); sexValue(sex); bounded(activity,1.2,1.9);
  if (!['mifflin','katch'].includes(method)) throw new Error('invalid');
  if(method==='katch') bounded(bodyFat ?? NaN, 1, 70);
  const resting = method==='katch' ? 370+21.6*weight*(1-bodyFat!/100) : 10*weight+6.25*height-5*age+(sex==='male'?5:-161);
  bounded(resting, 400, 6000);
  const maintenance=resting*activity, floor=sex==='male'?1500:1200;
  const deficit = Math.max(floor, maintenance*.85);
  return {resting,maintenance,deficit:deficit<maintenance?deficit:null,surplus:maintenance*1.15,floorApplied:maintenance*.85<floor};
}
