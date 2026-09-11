export type FinanceId='mortgage'|'loan'|'compound'|'percentage'|'discount'|'vat';
export type Inputs=Record<string,string>;
export type Extra={period:number;amount:number};
export type DebtOptions={principal:number;years:number;rate:number;frequency:number;system:'french'|'german'|'american';kind:'fixed'|'variable'|'mixed';fixedYears:number;index:number;spread:number;reviewMonths:number;ratePath:number[];grace:number;graceType:'interest'|'total';opening:number;openingPercent:number;annualFees:number;insurance:number;extraFee:number;extraMode:'payment'|'term';recurringExtra:number;extras:Extra[]};
export type DebtRow={period:number;year:number;rate:number;opening:number;interest:number;capitalized:number;principal:number;extra:number;fees:number;insurance:number;payment:number;balance:number};
const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
const check=(n:number,min:number,max:number,label:string)=>{if(!Number.isFinite(n)||n<min||n>max)throw Error(label);return n;};
export function annuity(capital:number,rate:number,periods:number){return Math.abs(rate)<1e-12?capital/periods:capital*rate/-Math.expm1(-periods*Math.log1p(rate));}
export function debtSchedule(o:DebtOptions){
 check(o.principal,.01,1e9,'Capital / Principal');check(o.years,1/52,60,'Plazo / Term');check(o.rate,0,100,'Tipo / Rate');
 if(![1,2,4,12,52].includes(o.frequency)||!['french','german','american'].includes(o.system)||!['fixed','variable','mixed'].includes(o.kind)||!['interest','total'].includes(o.graceType)||!['payment','term'].includes(o.extraMode))throw Error('Opciones / Options');
 const total=Math.round(o.years*o.frequency);if(Math.abs(total-o.years*o.frequency)>1e-6||total<1)throw Error('El plazo debe contener pagos completos / Term must contain whole payments');
 if(!Number.isInteger(o.grace)||o.grace<0||o.grace>=total)throw Error('Carencia menor que el plazo / Grace must be shorter than term');
 for(const [k,v] of Object.entries(o))if(typeof v==='number'&&!Number.isFinite(v))throw Error(k);
 for(const k of ['opening','openingPercent','annualFees','insurance','extraFee','recurringExtra','fixedYears','spread'] as const)check(o[k],0,k==='openingPercent'||k==='extraFee'?100:1e9,k);
 check(o.index,-20,100,'Índice / Index');if(![1,3,6,12].includes(o.reviewMonths))throw Error('Revisión / Review');
 if(o.kind==='mixed'&&o.fixedYears>=o.years)throw Error('El tramo fijo debe ser menor que el plazo / Fixed phase must be shorter than term');
 if(o.ratePath.length>60||o.ratePath.some(n=>!Number.isFinite(n)||n< -20||n>100))throw Error('Escenario de índices / Index scenario');
 if(o.extras.length>100||o.extras.some(e=>!Number.isInteger(e.period)||e.period<1||e.period>total||!Number.isFinite(e.amount)||e.amount<0||e.amount>1e9))throw Error('Amortización extraordinaria / Extra repayment');
 let balance=round(o.principal),target=total,payment=0,principalStep=0,lastRate=-1,recalculate=true;
 const rows:DebtRow[]=[];
 for(let p=1;p<=target&&balance>.004;p++){
  const elapsed=(p-1)/o.frequency,fixed=o.kind==='fixed'||o.kind==='mixed'&&elapsed<o.fixedYears;
  const reviewYear=Math.floor(Math.floor((elapsed-(o.kind==='mixed'?o.fixedYears:0))*12/o.reviewMonths)*o.reviewMonths/12+(o.kind==='mixed'?o.fixedYears:0));
  const index=o.ratePath.length?o.ratePath[Math.min(Math.max(reviewYear,0),o.ratePath.length-1)]:o.index;
  const annual=fixed?o.rate:Math.max(0,index+o.spread),r=annual/100/o.frequency;
  const opening=balance,interest=round(balance*r),inGrace=p<=o.grace;
  let paidPrincipal=0,capitalized=0,paidInterest=interest;
  if(inGrace){if(o.graceType==='total'){capitalized=interest;balance=round(balance+interest);paidInterest=0;}recalculate=true;}
  else{
   if(recalculate||annual!==lastRate){payment=round(annuity(balance,r,target-p+1));principalStep=round(balance/(target-p+1));recalculate=false;}
   paidPrincipal=o.system==='american'?(p===target?balance:0):o.system==='german'?Math.min(balance,principalStep):Math.min(balance,Math.max(0,round(payment-interest)));
   if(p===target)paidPrincipal=balance;
   balance=round(balance-paidPrincipal);
  }
  const extra=round(Math.min(balance,o.recurringExtra+o.extras.filter(e=>e.period===p).reduce((n,e)=>n+e.amount,0)));balance=round(balance-extra);
  if(extra>0&&!inGrace&&balance>0){
   if(o.extraMode==='payment')recalculate=true;
   else if(o.system!=='american'){
    const remaining=o.system==='german'?Math.ceil(balance/Math.max(principalStep,.01)):r===0?Math.ceil(balance/Math.max(payment,.01)):payment>balance*r?Math.ceil(-Math.log1p(-balance*r/payment)/Math.log1p(r)):target-p;
    target=Math.min(target,p+Math.max(1,remaining));
   }
  }
  if(!Number.isFinite(balance)||balance>1e12)throw Error('El saldo supera el límite de cálculo / Balance exceeds the calculation limit');
  const fees=round(o.annualFees/o.frequency+extra*o.extraFee/100),insurance=round(o.insurance/o.frequency);
  rows.push({period:p,year:p/o.frequency,rate:annual,opening,interest,capitalized,principal:paidPrincipal,extra,fees,insurance,payment:round(paidPrincipal+paidInterest+extra+fees+insurance),balance});lastRate=annual;
 }
 const upfront=round(o.opening+o.principal*o.openingPercent/100),outflow=round(upfront+rows.reduce((n,r)=>n+r.payment,0));
 return {rows,upfront,total:outflow,cost:round(outflow-o.principal),interest:round(rows.reduce((n,r)=>n+r.interest,0)),fees:round(upfront+rows.reduce((n,r)=>n+r.fees+r.insurance,0)),first:rows[0]?.payment||0,last:rows.at(-1)?.payment||0,years:rows.length/o.frequency,balance};
}
export type InvestmentOptions={initial:number;contribution:number;frequency:number;years:number;rate:number;inflation:number;feePercent:number;feeAnnual:number;entryFee:number;tax:number;taxTiming:'end'|'annual';timing:'start'|'end';growth:number};
export function investment(o:InvestmentOptions){
 for(const [k,v] of Object.entries(o))if(typeof v==='number')check(v,k==='rate'||k==='inflation'||k==='growth'?-99:0,k==='years'?60:1e9,k);
 if(o.years<1||!Number.isInteger(o.years)||![1,2,4,12].includes(o.frequency)||!['end','annual'].includes(o.taxTiming)||!['start','end'].includes(o.timing)||o.tax>100||o.feePercent>100||o.entryFee>100||o.rate>100||o.inflation>100||o.growth>100)throw Error('Revisa plazo, frecuencia y porcentajes / Check term, frequency and percentages');
 let balance=o.initial*(1-o.entryFee/100),contributed=o.initial,fees=o.initial*o.entryFee/100,taxes=0,costBasis=balance;
 let unitValue=1,units=balance;const rows:{year:number;contributed:number;balance:number;net:number;real:number;profit:number;fees:number;taxes:number}[]=[];
 const monthly=Math.expm1(Math.log1p(o.rate/100)/12),feeFactor=1-Math.pow(1-o.feePercent/100,1/12);
 for(let m=1;m<=o.years*12;m++){
  const year=Math.floor((m-1)/12),amount=o.contribution*Math.pow(1+o.growth/100,year),interval=12/o.frequency;
  const add=()=>{const fee=amount*o.entryFee/100,net=amount-fee;contributed+=amount;fees+=fee;balance+=net;costBasis+=net;if(unitValue>0)units+=net/unitValue;};
  if(o.timing==='start'&&(m-1)%interval===0)add();
  const old=balance;balance*=1+monthly;const fee=Math.min(balance,balance*feeFactor+o.feeAnnual/12);balance-=fee;fees+=fee;
  if(old>0)unitValue*=balance/old;
  if(o.timing==='end'&&m%interval===0)add();
  if(m%12===0){
   if(o.taxTiming==='annual'){const tax=Math.max(0,balance-costBasis)*o.tax/100;const before=balance;balance-=tax;taxes+=tax;costBasis=balance;if(before>0)unitValue*=balance/before;}
   const exitTax=o.taxTiming==='end'?Math.max(0,balance-costBasis)*o.tax/100:0,net=balance-exitTax;
   rows.push({year:m/12,contributed,balance,net,real:net/Math.pow(1+o.inflation/100,m/12),profit:net-contributed,fees,taxes:taxes+exitTax});
  }
  if(!Number.isFinite(balance)||balance>1e16)throw Error('Resultado fuera de rango / Result out of range');
 }
 const last=rows.at(-1)!;const terminalTax=o.taxTiming==='end'?Math.max(0,balance-costBasis)*o.tax/100:0;
 const returnFactor=unitValue*(balance>0?(balance-terminalTax)/balance:1);
 return {...last,rows,roi:contributed>0?(last.net-contributed)/contributed*100:null,cagr:units>0?(Math.pow(Math.max(0,returnFactor),1/o.years)-1)*100:null};
}
export type PriceOptions={price:number;quantity:number;discounts:number[];increase:number;vat:number;included:boolean;retention:number;shipping:number;cost:number};
export function priceCalculation(o:PriceOptions){
 for(const [k,v] of Object.entries(o))if(typeof v==='number')check(v,0,k==='vat'||k==='retention'?100:1e12,k);
 if(o.quantity<=0||o.discounts.length>20||o.discounts.some(x=>!Number.isFinite(x)||x<0||x>100))throw Error('Cantidad y descuentos / Quantity and discounts');
 const original=o.price*o.quantity,discountFactor=o.discounts.reduce((v,x)=>v*(1-x/100),1);
 const after=original*(1+o.increase/100)*discountFactor,netGoods=o.included?after/(1+o.vat/100):after;
 const base=round(netGoods+o.shipping),vat=round(base*o.vat/100),retention=round(base*o.retention/100),total=round(base+vat-retention),profit=round(base-o.cost*o.quantity-o.shipping);
 return {original,base,vat,retention,total,profit,saving:original*(1+o.increase/100)*(1-discountFactor)/(o.included?1+o.vat/100:1),margin:base>0?profit/base*100:null,markup:o.cost*o.quantity+o.shipping>0?profit/(o.cost*o.quantity+o.shipping)*100:null,effectiveDiscount:(1-discountFactor)*100,unit:total/o.quantity};
}
export const financeDefaults=(id:FinanceId):Inputs=>({principal:id==='loan'?'15000':'180000',years:id==='loan'?'5':id==='compound'?'20':'30',rate:id==='loan'?'6':id==='compound'?'5':'3',frequency:'12',system:'french',kind:'fixed',fixedYears:'5',index:'2.5',spread:'1',reviewMonths:'12',ratePath:'',grace:'0',graceType:'interest',opening:'0',openingPercent:'0',annualFees:'0',insurance:'0',extraFee:'0',extraMode:'payment',recurringExtra:'0',initial:'10000',contribution:'200',inflation:'2',feePercent:'0',feeAnnual:'0',entryFee:'0',tax:'0',taxTiming:'end',timing:'end',growth:'0',scenario:'1',price:'100',quantity:'1',discounts:id==='discount'?'20':'',increase:'0',vat:id==='vat'?'21':'0',included:'no',retention:'0',shipping:'0',cost:'0',percentMode:'of',percent:'20',base:'100',final:'120'});
export function numeric(v:Inputs,k:string){if(v[k]===undefined||v[k].trim()==='')throw Error('Completa el campo / Complete field: '+k);return check(Number(v[k].replace(',','.')),-1e12,1e12,k);}
export function numbers(s:string){if(!s.trim())return [];return s.split(/[;\n]+/).map(v=>{if(!v.trim()||!Number.isFinite(Number(v.trim().replace(',','.'))))throw Error('Separa los valores con ; / Separate values with ;');return Number(v.trim().replace(',','.'));});}
export function debtOptions(v:Inputs,extras:Extra[],mortgage:boolean):DebtOptions{const keys=['principal','years','rate','frequency','fixedYears','index','spread','reviewMonths','grace','opening','openingPercent','annualFees','insurance','extraFee','recurringExtra'];return {...Object.fromEntries(keys.map(k=>[k,numeric(v,k)])),frequency:mortgage?12:numeric(v,'frequency'),kind:mortgage?v.kind:'fixed',system:mortgage?'french':v.system,graceType:v.graceType,extraMode:v.extraMode,ratePath:numbers(v.ratePath),extras} as DebtOptions;}
export function investmentOptions(v:Inputs):InvestmentOptions{return {...Object.fromEntries(['initial','contribution','frequency','years','rate','inflation','feePercent','feeAnnual','entryFee','tax','growth'].map(k=>[k,numeric(v,k)])),timing:v.timing,taxTiming:v.taxTiming} as InvestmentOptions;}
export function priceOptions(v:Inputs):PriceOptions{return {...Object.fromEntries(['price','quantity','increase','vat','retention','shipping','cost'].map(k=>[k,numeric(v,k)])),discounts:numbers(v.discounts),included:v.included==='yes'} as PriceOptions;}
export function percentage(v:Inputs){const base=numeric(v,'base'),p=numeric(v,'percent'),end=numeric(v,'final');switch(v.percentMode){case 'of':return base*p/100;case 'increase':return base*(1+p/100);case 'decrease':return base*(1-p/100);case 'change':if(base===0)throw Error('La base no puede ser cero / Base cannot be zero');return (end-base)/Math.abs(base)*100;case 'ratio':if(base===0)throw Error('La base no puede ser cero / Base cannot be zero');return end/base*100;default:throw Error('Modo / Mode');}}
