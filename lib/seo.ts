export const origin='https://utilityinstant.com';
import {languages} from './localization/languages.ts';
export function alternate(locale:string,path=''){return {canonical:`${origin}/${locale}${path}`,languages:{...Object.fromEntries(languages.map(l=>[l.code,`${origin}/${l.code}${path}`])),'x-default':`${origin}/en${path}`}};}

