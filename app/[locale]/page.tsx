import {translate,languages,type Language} from '@/lib/localization';
﻿import {HomeScreen} from '@/components/platform';
import {alternate,origin} from '@/lib/seo';
import type {Locale} from '@/lib/tools';
export async function generateMetadata({params}:{params:Promise<{locale:Locale}>}){
  const {locale}=await params;
  const title=translate(locale,"UtilityInstant — Calculadoras y herramientas online gratis","UtilityInstant — Free Online Calculators & Tools");
  const description=translate(locale,"UtilityInstant (Utility Instant): calculadoras, conversores y herramientas de texto gratis. Calcula, compara y entiende tus resultados.","UtilityInstant (Utility Instant): free online calculators, converters and text tools. Calculate, compare and understand your results.");
  return {title,description,alternates:alternate(locale),openGraph:{type:'website',siteName:'UtilityInstant',title,description,url:`${origin}/${locale}`,locale:languages.find(l=>l.code===locale)?.format.replace('-','_'),alternateLocale:languages.filter(l=>l.code!==locale).map(l=>l.format.replace('-','_'))}};
}
export default async function Page({params}:{params:Promise<{locale:Locale}>}){
  const {locale}=await params;
  const website={'@context':'https://schema.org','@type':'WebSite','@id':`${origin}/#website`,url:`${origin}/`,name:'UtilityInstant',alternateName:['Utility Instant','utilityinstant.com'],inLanguage:languages.map(l=>l.code)};
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(website).replace(/</g,'\\u003c')}}/><HomeScreen locale={locale}/></>;
}
