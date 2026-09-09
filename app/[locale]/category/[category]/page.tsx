import {notFound} from 'next/navigation';
import {HomeScreen} from '@/components/platform';
import {categories,type Locale} from '@/lib/tools';
import {alternate} from '@/lib/seo';
export async function generateMetadata({params}:{params:Promise<{locale:Locale;category:string}>}){const {locale,category}=await params;const cat=categories.find(c=>c.id===category);if(!cat)return {};return {title:cat.title[locale]+' · Nexo',description:locale==='es'?`Herramientas gratuitas de ${cat.title.es.toLowerCase()} con procesamiento local.`:`Free ${cat.title.en.toLowerCase()} tools with local processing.`,alternates:alternate(locale,'/category/'+category)};}
export default async function Page({params}:{params:Promise<{locale:Locale;category:string}>}){const {locale,category}=await params;if(!categories.some(c=>c.id===category))notFound();return <HomeScreen locale={locale} category={category}/>;}
