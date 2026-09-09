import {HomeScreen} from '@/components/platform';
import {alternate} from '@/lib/seo';
import type {Locale} from '@/lib/tools';
export async function generateMetadata({params}:{params:Promise<{locale:Locale}>}){const {locale}=await params;return {title:locale==='en'?'Nexo · Tools for your everyday':'Nexo · Herramientas para tu día a día',description:locale==='en'?'Free calculators, converters and text tools. Understand, compare and export your results.':'Calculadoras, conversores y herramientas de texto gratis. Entiende, compara y exporta tus resultados.',alternates:alternate(locale)};}
export default async function Page({params}:{params:Promise<{locale:Locale}>}){const {locale}=await params;return <HomeScreen locale={locale}/>;}
