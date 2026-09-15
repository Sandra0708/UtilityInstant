import {debtSchedule,type DebtOptions} from './finance.ts';
export function compareStrategies(base:DebtOptions,affordablePayment:number,extraFrequencyMonths=12/base.frequency){
 const clean={...base,recurringExtra:0,extras:[]};
 const baseline=debtSchedule(clean);
 const basePayment=baseline.rows[base.grace]?.payment??baseline.first;
 if(!Number.isFinite(affordablePayment)||affordablePayment<=basePayment)throw Error('El importe debe superar la cuota actual con gastos / Amount must exceed the current payment including costs');
 if(!Number.isFinite(extraFrequencyMonths)||extraFrequencyMonths<=0||extraFrequencyMonths>720)throw Error('Frecuencia del extra / Extra frequency');
 const extra=(affordablePayment-basePayment)*extraFrequencyMonths/(12/base.frequency)/(1+base.extraFee/100);
 const payment=debtSchedule({...clean,recurringExtra:extra,extraFrequencyMonths,extraMode:'payment'});
 const term=debtSchedule({...clean,recurringExtra:extra,extraFrequencyMonths,extraMode:'term'});
 const summary=(r:ReturnType<typeof debtSchedule>)=>({interest:r.interest,total:r.total,cost:r.cost,years:r.years,savings:Math.round((baseline.interest-r.interest)*100)/100});
 return {basePayment,extra,extraFrequencyMonths,baseline:summary(baseline),payment:summary(payment),term:summary(term)};
}
