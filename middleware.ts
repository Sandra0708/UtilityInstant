import {NextResponse,type NextRequest} from 'next/server';
import {domainRedirect} from './lib/domains';
export function middleware(request:NextRequest){const redirect=domainRedirect(request.url);if(redirect)return NextResponse.redirect(redirect,308);const headers=new Headers(request.headers);headers.set('x-nexo-locale',request.nextUrl.pathname.split('/')[1]==='en'?'en':'es');return NextResponse.next({request:{headers}});}
export const config={matcher:['/((?!_next|__debug).*)']};
