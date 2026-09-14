import test from 'node:test';
import assert from 'node:assert/strict';
import {preferredLocale} from '../lib/locale.ts';

test('browser preference takes precedence over hosting country', () => {
  for (const country of ['ES','MX','AR','co']) assert.equal(preferredLocale(country,'en-US'), 'en');
  for (const country of ['US','GB','FR','DE']) assert.equal(preferredLocale(country,'es-ES'), 'es');
});
test('unknown country uses supported browser preferences and English fallback', () => {
  assert.equal(preferredLocale(undefined,'en-US,en;q=0.9,es;q=0.5'),'en');
  assert.equal(preferredLocale('XX','es-MX, en;q=0.8'),'es');
  assert.equal(preferredLocale('T1','es;q=0,en;q=0.5'),'en');
  assert.equal(preferredLocale(undefined,'es;q=0.2,en;q=0.8'),'en');
  assert.equal(preferredLocale(undefined,'fr-FR'),'fr');
  assert.equal(preferredLocale(),'en');
});
