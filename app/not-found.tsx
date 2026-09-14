import {headers} from 'next/headers';
import {translate,isLanguage} from '@/lib/localization';
export default async function NotFound(){const h=await headers();const code=h.get('x-nexo-locale')??'';const locale=isLanguage(code)?code:'en';return <main className="not-found"><a className="brand" href={'/'+locale}>UtilityInstant.</a><p>404</p><h1>{translate(locale,'Esta herramienta no está aquí.','This tool could not be found.')}</h1><a className="primary-button" href={'/'+locale}>{translate(locale,'Explorar herramientas','Browse tools')} →</a></main>;}
