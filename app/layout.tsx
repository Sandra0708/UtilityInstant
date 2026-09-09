import type { Metadata } from 'next';
import './globals.css';
import {headers} from 'next/headers';
import {adsensePublisher} from '@/lib/adsense-account';
export const metadata: Metadata = {title:'UtilityInstant · Herramientas para tu día a día',description:'Calcula, convierte y entiende tus resultados. Herramientas gratuitas que funcionan en tu dispositivo.',icons:{icon:[{url:'/utilityinstant-favicon.png',type:'image/png',sizes:'104x104'}]},robots:{index:true,follow:true},other:{'google-adsense-account':adsensePublisher}};
export default async function RootLayout({children,params}: {children: React.ReactNode;params:Promise<{locale?:string}>}){const locale=(await headers()).get('x-nexo-locale')||'es';return <html lang={locale==='en'?'en':'es'} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"try{if(JSON.parse(localStorage.getItem('nexo.preferences')||'{}').theme==='dark')document.documentElement.classList.add('dark')}catch(e){}"}}/></head><body>{children}</body></html>;}

