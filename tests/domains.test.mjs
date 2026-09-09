import test from 'node:test';
import assert from 'node:assert/strict';
import {domainRedirect,primaryOrigin} from '../lib/domains.ts';
import {adsensePublisher,adsTxt} from '../lib/adsense-account.ts';
test('aliases preserve paths and queries on the primary HTTPS origin',()=>{
 for(const host of ['www.utilityinstant.com','utilityinstant.net','www.utilityinstant.net','utilityinstant.org'])assert.equal(domainRedirect(`https://${host}/en/tools/mortgage?x=1&y=a%20b`),`${primaryOrigin}/en/tools/mortgage?x=1&y=a%20b`);
});
test('primary, preview, local and unrelated hosts do not redirect',()=>{
 for(const host of ['utilityinstant.com','nexo-herramientas-sgl.sandra0708.chatgpt.site','localhost:3000','utilityinstant.net.attacker.test'])assert.equal(domainRedirect(`https://${host}/es`),null);
 assert.equal(domainRedirect('https://utilityinstant.net/.well-known/acme-challenge/test'),null);
});
test('a path resembling another origin cannot change the destination',()=>{
 const result=new URL(domainRedirect('https://utilityinstant.net//attacker.test/path?next=https://attacker.test'));
 assert.equal(result.origin,primaryOrigin);
 assert.equal(result.pathname,'//attacker.test/path');
});
test('AdSense meta tag and ads.txt reference the same verified publisher',()=>{
 assert.match(adsensePublisher,/^ca-pub-\d{16}$/);
 assert.equal(adsTxt,`google.com, ${adsensePublisher.slice(3)}, DIRECT, f08c47fec0942fa0\n`);
});
