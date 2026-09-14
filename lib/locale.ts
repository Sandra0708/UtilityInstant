import {browserLanguage,type Language} from './localization/languages.ts';
// Browser preference precedes the hosting country; no geolocation request.
export function preferredLocale(country?:string,acceptLanguage=''):Language {
 if(acceptLanguage.trim())return browserLanguage(acceptLanguage);
 const c=country?.toUpperCase()||'';
 if(['ES','MX','AR','CO','CL','PE','VE','UY','PY','BO','EC','CR','PA','DO','GT','HN','SV','NI','CU','PR','GQ'].includes(c))return 'es';
 if(['DE','AT','LI'].includes(c))return 'de';
 if(c==='JP')return 'ja';if(c==='FR')return 'fr';if(c==='NL')return 'nl';if(c==='IT')return 'it';if(['PT','BR'].includes(c))return 'pt';return 'en';
}
