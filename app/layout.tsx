import type { Metadata } from 'next';
import './globals.css';
import {headers} from 'next/headers';
import {adsensePublisher} from '@/lib/adsense-account';
import {AdsBootstrap} from '@/components/ads';
import {AnalyticsBootstrap} from '@/components/analytics';
export const metadata: Metadata = {title:'UtilityInstant · Herramientas para tu día a día',description:'Calcula, convierte y entiende tus resultados. Herramientas gratuitas que funcionan en tu dispositivo.',icons:{icon:[{url:'/utilityinstant-favicon.png',type:'image/png',sizes:'104x104'}]},robots:{index:true,follow:true},other:{'google-adsense-account':adsensePublisher}};
export default async function RootLayout({children,params}: {children: React.ReactNode;params:Promise<{locale?:string}>}){const locale=(await headers()).get('x-nexo-locale')||'es';return <html className="dark" lang={locale==='en'?'en':'es'} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"try{if(JSON.parse(localStorage.getItem('nexo.theme')||'null')==='light')document.documentElement.classList.remove('dark')}catch(e){}"}}/></head><body><AnalyticsBootstrap/><AdsBootstrap/>{children}</body></html>;}

