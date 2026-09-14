import test from 'node:test';
import assert from 'node:assert/strict';
import {browserLanguage,languages} from '../lib/localization/languages.ts';
import {commonRows,commonCatalog,addedLanguages} from '../lib/localization/common.ts';
import {translate,fullCatalog} from '../lib/localization/index.ts';
import {sourceMessages} from '../lib/localization/source.ts';
import {privacySource} from '../lib/localization/privacy-source.ts';
import {privacyRows,privacyContent} from '../lib/localization/privacy.ts';
import {optionSource} from '../lib/localization/options-source.ts';
import {optionRows} from '../lib/localization/options.ts';
import {localError} from '../lib/localization/errors.ts';
import {generatePasswords,passwordDefaults} from '../lib/passwords.ts';
import {financeReport} from '../lib/finance-view.ts';
import {financeDefaults} from '../lib/finance.ts';
import {toolRows} from '../lib/localization/tools.ts';
test('browser language uses quality, regional tags and supported fallback',()=>{
 assert.equal(browserLanguage('fr-CA,ja;q=0.5'),'fr');
 assert.equal(browserLanguage('pt-BR;q=0.3,nl-BE;q=0.9'),'nl');
 assert.equal(browserLanguage('de;q=0,ja;q=0.8,en;q=0.4'),'ja');
 assert.equal(browserLanguage('zz,fr;q=2,de;q=no'),'en');
 assert.equal(browserLanguage('ja-JP'),'ja');
});
test('every published UI source and option has all six authored translations',()=>{
 const excluded=new Set(['es','es_ES','en_US','es-ES']);
 for(const [es] of sourceMessages){if(excluded.has(es))continue;for(const code of addedLanguages)assert.ok(fullCatalog[code][es]?.trim(),`${code}: ${es}`);}
 for(const id of Object.keys(optionRows))for(const code of addedLanguages)assert.ok(fullCatalog[code][optionSource[id][0]]?.trim());
 for(const code of addedLanguages)for(const [key,value]of Object.entries(fullCatalog[code]))assert.ok(value&&!/[\uFFFD]|Ã[ƒ‚©³±]|â€|ðŸ/.test(value),`${code}: ${key}`);
 assert.equal(privacyRows.length,privacySource.length);
 for(const {code}of languages){const rows=privacyContent(code);assert.equal(rows.length,privacySource.length);assert.ok(rows.every(([tag,text])=>['h2','p'].includes(tag)&&text.length>0));}
});
test('localized validation and reports do not change calculations or user data',()=>{
 const originals=financeReport('mortgage',financeDefaults('mortgage'),[],'es');
 for(const code of addedLanguages){const report=financeReport('mortgage',financeDefaults('mortgage'),[],code);assert.deepEqual(report.metrics.map(m=>m.value),originals.metrics.map(m=>m.value));assert.notEqual(report.title,originals.title);assert.throws(()=>generatePasswords({...passwordDefaults,length:1},'',code),{message:fullCatalog[code]['Longitud: 8–128. Cantidad: 1–50.']});assert.ok(!localError(Error('Invalid syntax at character 15'),code).includes('Invalid syntax'));assert.ok(localError(Error('Duplicate key: _用户'),code).includes('_用户'));}
});
test('authored catalogs have unique keys, six complete columns and valid Unicode',()=>{
 const rows=[...commonRows,...toolRows];
 assert.equal(new Set(rows.map(r=>r[0])).size,rows.length);
 for(const row of rows){assert.equal(row.length,7);for(const value of row)assert.ok(value.trim()&&!/[\uFFFD]|Ã|Â/.test(value),value);}
 for(const code of addedLanguages)assert.equal(Object.keys(commonCatalog[code]).length,commonRows.length);
 assert.equal(languages.length,8);
});
test('Spanish and English stay unchanged; Japanese is authored Unicode',()=>{
 assert.equal(translate('es','Herramientas','Tools'),'Herramientas');
 assert.equal(translate('en','Herramientas','Tools'),'Tools');
 assert.equal(translate('ja','Herramientas','Tools'),'ツール');
 assert.equal(translate('pt','Formato numérico','Number format'),'Formato dos números');
 assert.equal(translate('xx','Guardar','Save'),'Save');
});
