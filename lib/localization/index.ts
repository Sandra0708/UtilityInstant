import {commonCatalog} from './common.ts';
import {toolCatalog} from './tools.ts';
import {isLanguage,languages,type Language} from './languages.ts';
export {languages,isLanguage,type Language};
/** Explicit fallback preserves usability while a catalog is being authored. */
export function translate(locale:string,es:string,en:string):string {
 if(!isLanguage(locale))return en;
 if(locale==='es')return es;
 if(locale==='en')return en;
 return commonCatalog[locale][es]??toolCatalog[locale][es]??en;
}
export function translatedCopy(es:string,en:string):Record<Language,string>{
 return Object.fromEntries(languages.map(({code})=>[code,translate(code,es,en)])) as Record<Language,string>;
}
