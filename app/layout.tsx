import type { Metadata } from 'next';
import './globals.css';
import {headers} from 'next/headers';
export const metadata: Metadata = {title:'Nexo · Herramientas para tu día a día',description:'Calcula, convierte y entiende tus resultados. Herramientas gratuitas que funcionan en tu dispositivo.',icons:{icon:'/favicon.svg'},robots:{index:false,follow:true}};
export default async function RootLayout({children,params}: {children: React.ReactNode;params:Promise<{locale?:string}>}){const locale=(await headers()).get('x-nexo-locale')||'es';return <html lang={locale==='en'?'en':'es'} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"try{if(JSON.parse(localStorage.getItem('nexo.preferences')||'{}').theme==='dark')document.documentElement.classList.add('dark')}catch(e){}"}}/></head><body>{children}</body></html>;}

