import {isLanguage} from '@/lib/localization';
import {translate,type Language} from '@/lib/localization';
﻿import {notFound} from 'next/navigation';
import {Provider} from '@/components/platform';
import type {Locale} from '@/lib/tools';
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){const {locale}=await params;if(!isLanguage(locale))notFound();return <Provider locale={locale as Locale}><a className="skip-link" href="#main">{translate(locale,"Saltar al contenido","Skip to content")}</a>{children}</Provider>;}
