import {commonCatalog} from './common.ts';
import {toolCatalog} from './tools.ts';
import {addedLanguages} from './common.ts';
import {sourceMessages} from './source.ts';
import {extra} from './extra.ts';
import {financeLabels} from './finance-labels.ts';
import {dataTools} from './data-tools.ts';
import {routeLabels} from './route-labels.ts';
import {resultLabels} from './results.ts';
import {calculationLabels} from './calculations.ts';
import {explanations} from './explanations.ts';
import {optionSource} from './options-source.ts';
import {optionRows} from './options.ts';
import {supplement} from './supplement.ts';
import {isLanguage,languages,type Language} from './languages.ts';
export {languages,isLanguage,type Language};
const rows={...extra,...financeLabels,...dataTools,...routeLabels,...resultLabels,...calculationLabels,...explanations};
export const fullCatalog=Object.fromEntries(addedLanguages.map((code,i)=>[code,{...commonCatalog[code],...toolCatalog[code],...Object.fromEntries(Object.entries(rows).map(([id,values])=>[sourceMessages[Number(id)][0],values[i]])),...Object.fromEntries(Object.entries(optionRows).map(([id,values])=>[optionSource[Number(id)][0],values[i]]))}])) as Record<typeof addedLanguages[number],Record<string,string>>;
for(const [i,code] of addedLanguages.entries())for(const row of supplement)fullCatalog[code][row[0]]=row[i+1];
/** Explicit fallback preserves usability while a catalog is being authored. */
export function translate(locale:string,es:string,en:string):string {
 if(!isLanguage(locale))return en;
 if(locale==='es')return es;
 if(locale==='en')return en;
 return fullCatalog[locale][es]??en;
}
export function translatedCopy(es:string,en:string):Record<Language,string>{
 return Object.fromEntries(languages.map(({code})=>[code,translate(code,es,en)])) as Record<Language,string>;
}
