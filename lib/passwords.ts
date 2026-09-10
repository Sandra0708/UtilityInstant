export const passwordDefaults = {length:20,count:1,uppercase:true,lowercase:true,numbers:true,symbols:true,edgeSymbols:false,symbolSet:'!@#$%&*+-_',exclude:'',mode:'random' as 'random'|'phrase'};
export type PasswordOptions = typeof passwordDefaults;
function pick(n:number) { const limit = Math.floor(4294967296/n)*n; const data=new Uint32Array(1); do { crypto.getRandomValues(data); } while(data[0]>=limit); return data[0]%n; }
export function generatePasswords(o:PasswordOptions,phrase='',en=false):string[] {
  const fail=(es:string,english:string):never=>{throw Error(en?english:es);};
  if(!Number.isInteger(o.length)||o.length<8||o.length>128||!Number.isInteger(o.count)||o.count<1||o.count>50) fail('Longitud: 8–128. Cantidad: 1–50.','Length: 8–128. Count: 1–50.');
  const clean=(s:string)=>[...new Set([...s].filter(c=>!o.exclude.includes(c)))].join('');
  const sets=[o.uppercase?'ABCDEFGHIJKLMNOPQRSTUVWXYZ':'',o.lowercase?'abcdefghijklmnopqrstuvwxyz':'',o.numbers?'0123456789':'',o.symbols?o.symbolSet:''].filter(Boolean).map(clean);
  if(!sets.length||sets.some(s=>!s)) fail('Selecciona al menos un grupo y deja caracteres disponibles en cada grupo activo.','Select at least one group and leave characters available in every enabled group.');
  if(o.symbols&&(!/^[\x21-\x7e]+$/.test(o.symbolSet)||/[a-z0-9]/i.test(o.symbolSet))) fail('Usa signos sin letras, números ni espacios en símbolos.','Use punctuation without letters, digits or spaces for symbols.');
  const alphabet=sets.join(''),edge=[...alphabet].filter(c=>/[a-z0-9]/i.test(c)).join('');
  if(!o.edgeSymbols&&!edge) fail('Con solo símbolos, activa permitir símbolos al principio y al final.','For symbols only, allow symbols at the beginning and end.');
  const seed=o.mode==='phrase'?[...phrase.normalize('NFKD').replace(/[\u0300-\u036f]/g,'')].map(c=>alphabet.includes(c)?c:alphabet.includes(c.toLowerCase())?c.toLowerCase():alphabet.includes(c.toUpperCase())?c.toUpperCase():'').join('').slice(0,Math.floor(o.length/2)):'';
  const make=()=>{ for(let attempt=0;attempt<10000;attempt++) {
    const chars=[...seed]; while(chars.length<o.length) { const pool=!o.edgeSymbols&&(chars.length===0||chars.length===o.length-1)?edge:alphabet; chars.push(pool[pick(pool.length)]); }
    if(!o.edgeSymbols&&!edge.includes(chars[0])) chars[0]=edge[pick(edge.length)];
    if(sets.every(s=>chars.some(c=>s.includes(c)))) return chars.join('');
  } return fail('Estas reglas son demasiado restrictivas.','These rules are too restrictive.'); };
  return Array.from({length:o.count},make);
}
