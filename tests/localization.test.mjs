import test from 'node:test';
import assert from 'node:assert/strict';
import {browserLanguage,languages} from '../lib/localization/languages.ts';
import {commonRows,commonCatalog,addedLanguages} from '../lib/localization/common.ts';
import {translate} from '../lib/localization/index.ts';
import {toolRows} from '../lib/localization/tools.ts';
test('browser language uses quality, regional tags and supported fallback',()=>{
 assert.equal(browserLanguage('fr-CA,ja;q=0.5'),'fr');
 assert.equal(browserLanguage('pt-BR;q=0.3,nl-BE;q=0.9'),'nl');
 assert.equal(browserLanguage('de;q=0,ja;q=0.8,en;q=0.4'),'ja');
 assert.equal(browserLanguage('zz,fr;q=2,de;q=no'),'en');
 assert.equal(browserLanguage('ja-JP'),'ja');
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
