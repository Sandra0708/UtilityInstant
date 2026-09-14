import {translate,fullCatalog,type Language} from './index.ts';
export function localError(error:unknown,locale:Language,fields:Record<string,string>={}):string{
 const message=error instanceof Error?error.message:String(error);
 const t=(es:string,en:string)=>translate(locale,es,en);
 const syntax=message.match(/^Invalid syntax at character (\d+)$/);
 if(syntax)return t('Error en el carácter {n}.','Error at character {n}.').replace('{n}',syntax[1]);
 if(message.startsWith('Duplicate key: '))return t('Clave duplicada: {key}','Duplicate key: {key}').replace('{key}',message.slice(15));
 const parser:Record<string,[string,string]>={
 'Empty input / maximum 100,000 characters':['Entrada vacía o superior a 100.000 caracteres.','Empty input or more than 100,000 characters.'],
 'Maximum nesting depth: 100':['Máximo 100 niveles de anidación.','Maximum nesting depth: 100.'],
 'Maximum 2,000 columns':['Máximo 2.000 columnas.','Maximum 2,000 columns.'],
 'Invalid ObjectId':['ObjectId no válido.','Invalid ObjectId.']};
 if(parser[message])return t(...parser[message]);
 if(message.includes(' / ')){const [es,en]=message.split(' / ');if(message.startsWith('Completa el campo / Complete field: ')){const key=message.split(': ').at(-1)!;return t('Completa todos los campos numéricos.','Complete all number fields.')+(fields[key]?' '+fields[key]:'');}return t(es,en);}
 if(fields[message])return t('Revisa los datos.','Check your inputs.')+' '+fields[message];
 // Keep messages already produced by this locale; never expose raw internal codes.
 if(locale!=='es'&&locale!=='en'&&Object.values(fullCatalog[locale]).includes(message))return message;
 if(locale==='es'||locale==='en')return message;
 return t('No se pudo completar la operación. Revisa los datos e inténtalo de nuevo.','The operation could not be completed. Check inputs and retry.');
}
