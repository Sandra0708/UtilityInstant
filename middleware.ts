import {isLanguage} from './lib/localization/languages.ts';
import {NextResponse,type NextRequest} from 'next/server';
import {domainRedirect} from './lib/domains';
import {preferredLocale} from './lib/locale';
export function middleware(request:NextRequest){const redirect=domainRedirect(request.url);if(redirect)return NextResponse.redirect(redirect,308);if(request.nextUrl.pathname==='/'){const url=request.nextUrl.clone();const country=(request as NextRequest & {cf?:{country?:string}}).cf?.country;url.pathname='/'+preferredLocale(country,request.headers.get('accept-language')||'');const response=NextResponse.redirect(url,302);response.headers.set('Vary','Accept-Language, CF-IPCountry');response.headers.set('Cache-Control','private, no-store');return response;}const headers=new Headers(request.headers);headers.set('x-nexo-locale',isLanguage(request.nextUrl.pathname.split('/')[1])?request.nextUrl.pathname.split('/')[1]:'en');return NextResponse.next({request:{headers}});}
export const config={matcher:['/((?!_next|__debug).*)']};
