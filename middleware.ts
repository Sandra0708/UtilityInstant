import {NextResponse,type NextRequest} from 'next/server';
export function middleware(request:NextRequest){const headers=new Headers(request.headers);headers.set('x-nexo-locale',request.nextUrl.pathname.split('/')[1]==='en'?'en':'es');return NextResponse.next({request:{headers}});}
export const config={matcher:['/((?!_next|favicon.svg|__debug).*)']};
