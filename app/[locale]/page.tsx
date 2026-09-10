import {HomeScreen} from '@/components/platform';
import {alternate,origin} from '@/lib/seo';
import type {Locale} from '@/lib/tools';
export async function generateMetadata({params}:{params:Promise<{locale:Locale}>}){
  const {locale}=await params;
  const title=locale==='en'?'UtilityInstant — Free Online Calculators & Tools':'UtilityInstant — Calculadoras y herramientas online gratis';
  const description=locale==='en'?'UtilityInstant (Utility Instant): free online calculators, converters and text tools. Calculate, compare and understand your results.':'UtilityInstant (Utility Instant): calculadoras, conversores y herramientas de texto gratis. Calcula, compara y entiende tus resultados.';
  return {title,description,alternates:alternate(locale),openGraph:{type:'website',siteName:'UtilityInstant',title,description,url:`${origin}/${locale}`,locale:locale==='en'?'en_US':'es_ES',alternateLocale:locale==='en'?'es_ES':'en_US'}};
}
export default async function Page({params}:{params:Promise<{locale:Locale}>}){
  const {locale}=await params;
  const website={'@context':'https://schema.org','@type':'WebSite','@id':`${origin}/#website`,url:`${origin}/`,name:'UtilityInstant',alternateName:['Utility Instant','utilityinstant.com'],inLanguage:['en','es']};
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(website).replace(/</g,'\\u003c')}}/><HomeScreen locale={locale}/></>;
}
