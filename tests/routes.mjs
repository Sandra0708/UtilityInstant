import assert from 'node:assert/strict';
import {tools,categories} from '../lib/tools.ts';
import {writeFileSync} from 'node:fs';
const origin=process.env.TEST_ORIGIN||'http://localhost:3000';
const cases=['es','en'].flatMap(locale=>[{path:`/${locale}`,locale},...tools.map(t=>({path:`/${locale}/tools/${t.id}`,locale,title:t.title[locale]})),...categories.map(c=>({path:`/${locale}/category/${c.id}`,locale}))]);
const results=[];
for(let i=0;i<cases.length;i+=4){await Promise.all(cases.slice(i,i+4).map(async c=>{const r=await fetch(origin+c.path);const html=await r.text();assert.equal(r.status,200,c.path);assert.ok(html.includes(`<html lang="${c.locale}"`),c.path+' language');assert.ok(html.includes('rel="canonical"'),c.path+' canonical');assert.ok(html.includes('hrefLang="es"')||html.includes('hreflang="es"'),c.path+' alternate');if(c.title)assert.ok(html.includes(c.title),c.path+' title');results.push({path:c.path,status:r.status});}));}
for(const path of ['/es/tools/missing-tool','/es/category/missing','/fr']){const r=await fetch(origin+path);assert.equal(r.status,404,path);results.push({path,status:r.status});}
const sitemap=await (await fetch(origin+'/sitemap.xml')).text();assert.equal((sitemap.match(/<loc>/g)||[]).length,cases.length);assert.ok(!(await (await fetch(origin+'/robots.txt')).text()).includes('undefined'));
writeFileSync('outputs/routes.json',JSON.stringify(results,null,2));console.log(`${cases.length} localized pages, 3 true 404s, sitemap and robots verified`);
