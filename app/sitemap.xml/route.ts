import {tools,categories} from '@/lib/tools';
import {origin} from '@/lib/seo';
import {languages,type Language} from '@/lib/localization';
import {toolPath} from '@/lib/tool-paths';
export function GET(){
 const paths:((locale:Language)=>string)[]=[()=>'',...tools.map(t=>(locale:Language)=>toolPath(t.id,locale)),...categories.map(c=>()=>'/category/'+c.id)];
 const rows=languages.flatMap(({code})=>paths.map(path=>'<url><loc>'+origin+'/'+code+path(code)+'</loc>'+languages.map(l=>'<xhtml:link rel="alternate" hreflang="'+l.code+'" href="'+origin+'/'+l.code+path(l.code)+'"/>').join('')+'<xhtml:link rel="alternate" hreflang="x-default" href="'+origin+'/en'+path('en')+'"/></url>'));
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+rows.join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
