import {origin} from '@/lib/seo';
export function GET(){return new Response(`User-agent: *\nAllow: /\nDisallow: /__debug\nSitemap: ${origin}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain'}});}
