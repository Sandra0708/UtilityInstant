import {adsTxt} from '@/lib/adsense-account';
export function GET(){return new Response(adsTxt,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=300'}});}
