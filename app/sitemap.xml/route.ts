import {tools,categories} from '@/lib/tools';
import {origin} from '@/lib/seo';
import {languages} from '@/lib/localization';
export function GET(){const paths=['',...tools.map(t=>'/tools/'+t.id),...categories.map(c=>'/category/'+c.id)];const rows=languages.flatMap(({code})=>paths.map(path=>'<url><loc>'+origin+'/'+code+path+'</loc>'+languages.map(l=>'<xhtml:link rel="alternate" hreflang="'+l.code+'" href="'+origin+'/'+l.code+path+'"/>').join('')+'<xhtml:link rel="alternate" hreflang="x-default" href="'+origin+'/en'+path+'"/></url>'));return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+rows.join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8'}});}
