import {translate} from '@/lib/localization';
﻿import {notFound} from 'next/navigation';
import {HomeScreen} from '@/components/platform';
import {categories,type Locale} from '@/lib/tools';
import {alternate} from '@/lib/seo';
export async function generateMetadata({params}:{params:Promise<{locale:Locale;category:string}>}){const {locale,category}=await params;const cat=categories.find(c=>c.id===category);if(!cat)return {};return {title:cat.title[locale]+' · UtilityInstant',description:translate(locale,'Herramientas gratuitas de {category} con procesamiento local.','Free {category} tools with local processing.').replace('{category}',cat.title[locale]),alternates:alternate(locale,'/category/'+category)};}
export default async function Page({params}:{params:Promise<{locale:Locale;category:string}>}){const {locale,category}=await params;if(!categories.some(c=>c.id===category))notFound();return <HomeScreen locale={locale} category={category}/>;}
