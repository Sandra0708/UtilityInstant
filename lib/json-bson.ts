export type JsonDocument = Record<string, unknown>;
// Data parser: never evaluate shell expressions or rewrite user strings.
export function readDocuments(source: string) {
  if (!source.trim() || source.length > 100000) throw Error('Empty input / maximum 100,000 characters');
  let i = 0;
  const fail = (): never => { throw Error(`Invalid syntax at character ${i + 1}`); };
  const space = () => { while (i < source.length && /\s/.test(source[i])) i++; };
  function string(): string {
    const start = i++; while (i < source.length) {
      if (source[i] === '\\') { i += 2; continue; }
      if (source[i++] === '"') { try { return JSON.parse(source.slice(start, i)); } catch { fail(); } }
    } return fail();
  }
  function value(depth = 0): unknown {
    if (depth > 100) throw Error('Maximum nesting depth: 100');
    space(); const c = source[i];
    if (c === '"') return string();
    if (c === '{' || c === '[') {
      const array = c === '['; const close = array ? ']' : '}'; i++; space();
      const result: unknown[] | JsonDocument = array ? [] : Object.create(null);
      if (source[i] === close) { i++; return result; }
      while (i < source.length) {
        space(); let key = '';
        if (!array) { if (source[i] !== '"') fail(); key = string(); space(); if (source[i++] !== ':') fail(); if (Object.hasOwn(result, key)) throw Error(`Duplicate key: ${key}`); }
        const v = value(depth + 1);
        if (array) (result as unknown[]).push(v); else (result as JsonDocument)[key] = v;
        space(); if (source[i] === close) { i++; return result; }
        if (source[i++] !== ',') fail();
      } return fail();
    }
    const token = source.slice(i).match(/^(true|false|null)(?![\w$])/);
    if (token) { i += token[0].length; return JSON.parse(token[0]); }
    const number = source.slice(i).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (number) { i += number[0].length; const n = Number(number[0]); return !Number.isFinite(n) || (Number.isInteger(n) && !Number.isSafeInteger(n)) ? number[0] : n; }
    const wrapper = source.slice(i).match(/^(ObjectId|ISODate|NumberLong|NumberInt|NumberDecimal|Decimal128|Double|BinData|Timestamp|UUID|MinKey|MaxKey)\s*\(/);
    if (!wrapper) return fail();
    i += wrapper[0].length; space(); const args: unknown[] = [];
    if (source[i] !== ')') { for (;;) { args.push(value(depth + 1)); space(); if (source[i] !== ',') break; i++; } }
    if (source[i++] !== ')') fail();
    const name = wrapper[1];
    if (name === 'MinKey' || name === 'MaxKey') { if (args.length) fail(); return {[name === 'MinKey' ? '$minKey' : '$maxKey']: 1}; }
    if (name === 'BinData' || name === 'Timestamp') { if (args.length !== 2) fail(); return name === 'BinData' ? {$binary:{base64:args[1],subType:args[0]}} : {$timestamp:{t:args[0],i:args[1]}}; }
    if (args.length !== 1 || !['string','number'].includes(typeof args[0])) fail();
    if (name === 'ObjectId' && !/^[0-9a-f]{24}$/i.test(String(args[0]))) throw Error('Invalid ObjectId');
    const key = ({ObjectId:'$oid',ISODate:'$date',NumberLong:'$numberLong',NumberInt:'$numberInt',NumberDecimal:'$numberDecimal',Decimal128:'$numberDecimal',Double:'$numberDouble',UUID:'$uuid'} as Record<string,string>)[name];
    return {[key]:String(args[0])};
  }
  const roots: unknown[] = [value()]; space();
  while (i < source.length) {
    if (source[i] === ',') { i++; space(); }
    if (source[i] !== '{' || roots.some(x => !x || Array.isArray(x) || typeof x !== 'object')) fail();
    roots.push(value()); space();
  }
  const root = roots.length === 1 ? roots[0] : roots;
  const list = Array.isArray(root) ? root : [root];
  return {root, grouped:roots.length > 1, documents:list.map(x => x && typeof x === 'object' && !Array.isArray(x) ? x as JsonDocument : {value:x})};
}
export function parseJsonBson(source: string) { return readDocuments(source).documents; }
export function toTable(documents: JsonDocument[]) {
  const rows = documents.map(doc => {
    const row: Record<string,string> = Object.create(null);
    const keyPath=(key:string)=>key.replace(/([.\\[\]])/g,'\\$1');
    function flat(v: unknown, path: string) {
      if (Object.keys(row).length > 2000) throw Error('Maximum 2,000 columns');
      if (v === null || v === undefined) { row[path] = ''; return; }
      if (typeof v !== 'object') { row[path] = String(v); return; }
      const entries = Object.entries(v);
      if (!entries.length) { row[path] = ''; return; }
      const [key, inner] = entries[0];
      if (entries.length === 1 && ['$oid','$date','$numberLong','$numberInt','$numberDecimal','$numberDouble','$uuid'].includes(key)) { flat(inner, path); return; }
      entries.forEach(([k,x]) => flat(x, Array.isArray(v) ? `${path}[${k}]` : path ? `${path}.${keyPath(k)}` : keyPath(k)));
    }
    Object.entries(doc).forEach(([k,v]) => flat(v,keyPath(k))); return row;
  });
  const columns = [...new Set(rows.flatMap(Object.keys))];
  if (columns.length > 2000) throw Error('Maximum 2,000 columns');
  return {columns,rows:rows.map(row => columns.map(key => row[key] ?? ''))};
}
