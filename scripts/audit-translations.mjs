import ts from 'typescript';
import {readdirSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
const catalog=new Map();
const values=n=>ts.isStringLiteralLike(n)?[n.text]:ts.isConditionalExpression(n)?[...values(n.whenTrue),...values(n.whenFalse)]:ts.isArrayLiteralExpression(n)?n.elements.flatMap(values):[];
function pair(a,b,file){const aa=values(a),bb=values(b);if(aa.length===bb.length)aa.forEach((es,i)=>{if(es&&es!==bb[i]){const old=catalog.get(es);catalog.set(es,{es,en:bb[i],files:[...new Set([...(old?.files||[]),file])]});}});}
function visitFile(file){const source=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);function visit(n){if(ts.isCallExpression(n)){const name=n.expression.getText(source);if(['bi','t','say'].includes(name)&&n.arguments.length>=2)pair(n.arguments[0],n.arguments[1],file);if(['n','field'].includes(name)&&n.arguments.length>=3)pair(n.arguments[1],n.arguments[2],file);}if(ts.isConditionalExpression(n)){const cond=n.condition.getText(source).replaceAll(' ','');if(cond==='en'||cond==="locale==='en'"||cond==='locale==="en"')pair(n.whenFalse,n.whenTrue,file);if(cond==="locale==='es'"||cond==='locale==="es"')pair(n.whenTrue,n.whenFalse,file);}ts.forEachChild(n,visit);}visit(source);}
function walk(dir){for(const d of readdirSync(dir,{withFileTypes:true})){if(['ui','localization'].includes(d.name))continue;const f=join(dir,d.name);if(d.isDirectory())walk(f);else if(/\.(tsx|ts)$/.test(f))visitFile(f);}}
['app','components','lib'].forEach(walk);mkdirSync('work',{recursive:true});writeFileSync('work/translation-inventory.json',JSON.stringify([...catalog.values()],null,2)+'\n','utf8');console.log(`${catalog.size} distinct translation pairs`);
