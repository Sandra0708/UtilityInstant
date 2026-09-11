import type {FinanceReport} from '@/lib/finance-report';
export default function FinanceChart({report,en}:{report:FinanceReport;en:boolean}){
 const points=report.chart;if(!points.length)return null;
 const low=Math.min(0,...points.flatMap(p=>[p.a,p.b])),high=Math.max(1,...points.flatMap(p=>[p.a,p.b])),maxX=Math.max(1,...points.map(p=>p.x));
 const x=(v:number)=>80+v/maxX*650,y=(v:number)=>235-(v-low)/(high-low)*195;
 const n=(v:number)=>new Intl.NumberFormat(en?'en-US':'es-ES',{notation:'compact',maximumFractionDigits:1}).format(v);
 return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" role="img" aria-label={report.series.join(' / ')} style={{width:'100%',display:'block'}}><title>{report.series.join(' / ')}</title><rect width="800" height="300" fill="#f6f8fc" rx="10"/>{[0,.5,1].map(v=>{const value=low+(high-low)*v;return <g key={v}><line x1="80" x2="730" y1={y(value)} y2={y(value)} stroke="#d4deec"/><text x="70" y={y(value)+4} textAnchor="end" fill="#42546e" fontSize="13">{n(value)}</text></g>;})}{(['a','b'] as const).map((key,i)=><polyline key={key} points={points.map(p=>`${x(p.x)},${y(p[key])}`).join(' ')} fill="none" stroke={i?'#0a967d':'#315fdf'} strokeWidth="3"/>)}<text x="80" y="260" fill="#42546e" fontSize="13">0</text><text x="730" y="260" fill="#42546e" textAnchor="end" fontSize="13">{maxX} {en?'years':'años'}</text>{report.series.map((label,i)=><text key={label} x={80+i*330} y="287" fontSize="14" fill={i?'#087b66':'#315fdf'}>{label}</text>)}</svg>;
}
