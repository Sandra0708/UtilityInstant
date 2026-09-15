import {env} from 'cloudflare:workers';

type Point={lat:number;lng:number;label:string};
const cache=new Map<string,{point:Point|null;expires:number}>();
const inFlight=new Map<string,Promise<Point|null>>();
let requests:number[]=[];
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(!origin||origin!==new URL(request.url).origin)return Response.json({error:'origin'},{status:403});
 if(Number(request.headers.get('content-length')||0)>2048)return Response.json({error:'input'},{status:400});
 let address:string;try{const body=await request.json() as {address?:unknown};if(typeof body.address!=='string')throw Error();address=body.address.trim().replace(/\s+/g,' ');if(address.length<2||address.length>300)throw Error();}catch{return Response.json({error:'input'},{status:400});}
 const key=(env as unknown as Record<string,string>).ORS_API_KEY||process.env.ORS_API_KEY;
 if(!key)return Response.json({error:'unavailable'},{status:503});
 const normalized=address.toLocaleLowerCase(),now=Date.now(),hit=cache.get(normalized);
 if(hit&&hit.expires>now)return Response.json({point:hit.point});
 try{
  let pending=inFlight.get(normalized);
  if(!pending){
   requests=requests.filter(t=>now-t<60000);
   if(requests.length>=40)return Response.json({error:'limit'},{status:429,headers:{'Retry-After':'60'}});
   requests.push(now);
   pending=(async()=>{
    const query=new URLSearchParams({text:address,size:'1'});
    const response=await fetch('https://api.heigit.org/pelias/v1/search?'+query,{headers:{Authorization:key,'User-Agent':'UtilityInstant/1.0 (+https://utilityinstant.com)'},signal:AbortSignal.timeout(12000)});
    if(!response.ok)throw new Error(response.status===429?'limit':'upstream');
    const data=await response.json() as {features?:{geometry?:{coordinates?:number[]};properties?:{label?:string}}[]};
    const first=data.features?.[0],c=first?.geometry?.coordinates;
    const point=c&&Number.isFinite(c[0])&&Number.isFinite(c[1])&&Math.abs(c[0])<=180&&Math.abs(c[1])<=90?{lat:c[1],lng:c[0],label:first?.properties?.label||address}:null;
    if(cache.size>=500)cache.delete(cache.keys().next().value!);
    cache.set(normalized,{point,expires:Date.now()+24*60*60*1000});return point;
   })();inFlight.set(normalized,pending);
  }
  return Response.json({point:await pending},{headers:{'Cache-Control':'no-store'}});
 }catch(e){const limited=e instanceof Error&&e.message==='limit';return Response.json({error:limited?'limit':'unavailable'},{status:limited?429:503,headers:{'Retry-After':'60'}});}
 finally{inFlight.delete(normalized);}
}
