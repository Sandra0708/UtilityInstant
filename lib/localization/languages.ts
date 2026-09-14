/** Language codes are kept separate from currencies and jurisdiction. */
export const languages = [
 {code:'en',name:'English',format:'en-US'},
 {code:'de',name:'Deutsch',format:'de-DE'},
 {code:'ja',name:'日本語',format:'ja-JP'},
 {code:'fr',name:'Français',format:'fr-FR'},
 {code:'es',name:'Español',format:'es-ES'},
 {code:'nl',name:'Nederlands',format:'nl-NL'},
 {code:'it',name:'Italiano',format:'it-IT'},
 {code:'pt',name:'Português',format:'pt-PT'},
] as const;
export type Language = typeof languages[number]['code'];
export type AddedLanguage = Exclude<Language,'es'|'en'>;
export const isLanguage=(value:string):value is Language=>languages.some(l=>l.code===value);
export function browserLanguage(header:string):Language {
 const choices=header.split(',').map((entry,index)=>{
  const [tag,...options]=entry.trim().toLowerCase().split(';');
  const quality=options.find(v=>v.trim().startsWith('q='));
  return {code:tag.split('-')[0],quality:quality?Number(quality.trim().slice(2)):1,index};
 }).filter(v=>isLanguage(v.code)&&Number.isFinite(v.quality)&&v.quality>0&&v.quality<=1)
 .sort((a,b)=>b.quality-a.quality||a.index-b.index);
 return (choices[0]?.code as Language)||'en';
}
