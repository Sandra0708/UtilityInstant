import {test} from 'node:test';
import assert from 'node:assert/strict';
import {jpegPdf} from '../lib/cargo-export.ts';
test('PDF uses exact byte offsets and embeds image data',()=>{
 const bytes=jpegPdf(new Uint8Array([255,216,255,217]),1820,1700),s=new TextDecoder('latin1').decode(bytes);
 assert.ok(s.startsWith('%PDF-1.4'));const xref=Number(s.match(/startxref\n(\d+)/)[1]);assert.equal(s.slice(xref,xref+4),'xref');
 const entries=s.slice(xref).split('\n').slice(3,8);entries.forEach((entry,i)=>assert.equal(s.slice(Number(entry.slice(0,10)),Number(entry.slice(0,10))+7),`${i+1} 0 obj`));
 assert.ok(s.includes('/Filter /DCTDecode /Length 4'));assert.ok(s.endsWith('%%EOF\n'));
});
