import test from 'node:test';
import assert from 'node:assert/strict';
import {debtSchedule,debtOptions,financeDefaults} from '../lib/finance.ts';
import {compareStrategies} from '../lib/finance-advisor.ts';
const base=()=>debtOptions(financeDefaults('mortgage'),[],true);
test('extra interval default preserves every-payment schedules for all frequencies',()=>{
 for(const frequency of [1,2,4,12,52]){const o={...base(),frequency,recurringExtra:100};assert.deepEqual(debtSchedule(o),debtSchedule({...o,extraFrequencyMonths:12/frequency}));}
});
test('annual extras are applied annually, not on each monthly payment',()=>{
 const r=debtSchedule({...base(),years:3,recurringExtra:1200,extraFrequencyMonths:12});
 assert.ok(r.rows[11].extra===1200);assert.ok(r.rows[23].extra===1200);
 for(const row of r.rows)if(row.period%12)assert.equal(row.extra,0);
});
test('extras between payment dates accrue at next scheduled payment',()=>{
 const r=debtSchedule({...base(),frequency:4,recurringExtra:100,extraFrequencyMonths:1});assert.equal(r.rows[0].extra,300);
 const weekly=debtSchedule({...base(),frequency:52,recurringExtra:100,extraFrequencyMonths:1});assert.equal(weekly.rows[3].extra,0);assert.equal(weekly.rows[4].extra,100);
});
test('strategy comparison rejects unaffordable budgets and compares equal contributions',()=>{
 const o=base(),baseline=debtSchedule(o);assert.throws(()=>compareStrategies(o,baseline.first,1));
 const r=compareStrategies(o,baseline.first+200,1);assert.equal(r.extra,200);assert.ok(r.payment.savings>0);assert.ok(r.term.savings>r.payment.savings);assert.ok(r.term.years<r.payment.years);
 const yearly=compareStrategies(o,baseline.first+200,12);assert.equal(yearly.extra,2400);
});
test('budget includes prepayment charges and non-finite inputs are rejected',()=>{
 const o={...base(),extraFee:2};const r=compareStrategies(o,debtSchedule(o).first+102,1);assert.equal(r.extra,100);
 assert.throws(()=>compareStrategies(o,Infinity,1));assert.throws(()=>compareStrategies(o,2000,0));
});
test('18 months equals 1.5 years and incompatible quarterly terms are rejected',()=>{
 assert.deepEqual(debtSchedule({...base(),years:18/12}),debtSchedule({...base(),years:1.5}));assert.throws(()=>debtSchedule({...base(),years:17/12,frequency:4}),/whole payments/);
});
