import type {Language} from './localization/languages.ts';
export const healthSlugs:Record<string,Record<Language,string>>={
 hours:{es:'calculadora-de-horas',en:'hours-calculator',de:'stundenrechner',fr:'calcul-heures',it:'calcolo-ore',pt:'calculadora-de-horas',nl:'uren-berekenen',ja:'時間計算'},
 timezones:{es:'conversor-zona-horaria',en:'time-zone-converter',de:'zeitzonenrechner',fr:'convertisseur-fuseau-horaire',it:'convertitore-fuso-orario',pt:'conversor-de-fuso-horario',nl:'tijdzone-omrekenen',ja:'時差計算'},
 bmi:{es:'calculadora-imc',en:'bmi-calculator',de:'bmi-rechner',fr:'calcul-imc',it:'calcolo-bmi',pt:'calculadora-imc',nl:'bmi-berekenen',ja:'bmi計算'},
 tdee:{es:'calculadora-calorias-diarias',en:'tdee-calculator',de:'kalorienbedarf-rechner',fr:'calcul-besoin-calorique',it:'calcolo-calorie-giornaliere',pt:'calculadora-de-calorias',nl:'calorie-behoefte-berekenen',ja:'カロリー計算'},
 'body-fat':{es:'calculadora-grasa-corporal',en:'body-fat-calculator',de:'koerperfett-rechner',fr:'calcul-masse-grasse',it:'calcolo-grasso-corporeo',pt:'calculadora-gordura-corporal',nl:'vetpercentage-berekenen',ja:'体脂肪率計算'},
 'ideal-weight':{es:'peso-orientativo',en:'ideal-weight-calculator',de:'idealgewicht-rechner',fr:'poids-de-reference',it:'peso-indicativo',pt:'peso-de-referencia',nl:'streefgewicht-berekenen',ja:'体重の目安'}
};
export function toolPath(id:string,locale:Language){return '/tools/'+(healthSlugs[id]?.[locale]??id);}
export function resolveToolId(slug:string){let decoded=slug;try{decoded=decodeURIComponent(slug);}catch{return slug;}return Object.entries(healthSlugs).find(([,byLocale])=>Object.values(byLocale).includes(decoded))?.[0]??decoded;}
