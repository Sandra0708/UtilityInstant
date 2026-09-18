import {toolPath,resolveToolId} from '@/lib/tool-paths';
import {isHealth} from '@/lib/health-tools';
import {healthFaq} from '@/lib/health-faq';
import {languages} from '@/lib/localization';
import {isLanguage} from '@/lib/localization';
import {translate,type Language} from '@/lib/localization';
﻿import {notFound} from 'next/navigation';
import ToolScreen from '@/components/tool-screen';
import {getTool,categories,type Locale} from '@/lib/tools';
import {origin} from '@/lib/seo';
export async function generateMetadata({params}:{params:Promise<{locale:Locale;slug:string}>}){const {locale,slug}=await params;const tool=getTool(resolveToolId(slug));if(!tool||!isLanguage(locale))return {};return {title:tool.title[locale]+' · UtilityInstant',description:tool.description[locale],alternates:{canonical:origin+'/'+locale+toolPath(tool.id,locale),languages:{...Object.fromEntries(languages.map(l=>[l.code,origin+'/'+l.code+toolPath(tool.id,l.code)])),'x-default':origin+'/en'+toolPath(tool.id,'en')}}};}
export default async function Page({params}:{params:Promise<{locale:Locale;slug:string}>}){const {locale,slug}=await params;const tool=getTool(resolveToolId(slug));if(!tool||(!isLanguage(locale)))notFound();const cat=categories.find(c=>c.id===tool.category)!;const schema:Record<string,unknown>[]=[{'@context':'https://schema.org','@type':'WebApplication',name:tool.title[locale],description:tool.description[locale],applicationCategory:'UtilitiesApplication',operatingSystem:'Any',inLanguage:locale,url:`${origin}/${locale}${toolPath(tool.id,locale)}`},{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:translate(locale,"Herramientas","Tools"),item:`${origin}/${locale}`},{'@type':'ListItem',position:2,name:cat.title[locale],item:`${origin}/${locale}/category/${cat.id}`},{'@type':'ListItem',position:3,name:tool.title[locale],item:`${origin}/${locale}${toolPath(tool.id,locale)}`}]}];if(isHealth(tool.id))schema.push({'@context':'https://schema.org','@type':'FAQPage',mainEntity:healthFaq(tool.id,locale).map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))});return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><ToolScreen id={tool.id} locale={locale}/></>;}
