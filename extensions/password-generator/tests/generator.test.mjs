import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { generatePasswords, evaluateStrength, DEFAULT_OPTIONS, PROBLEMATIC_CHARS } = require('../lib/generator.js');

function opts(overrides) {
  return Object.assign({}, DEFAULT_OPTIONS, overrides);
}

test('generates a password with default options at the default length', () => {
  const [pwd] = generatePasswords(opts());
  assert.equal(pwd.length, DEFAULT_OPTIONS.length);
});

test('respects a custom length across the allowed range', () => {
  for (const length of [8, 12, 20, 64, 128]) {
    const [pwd] = generatePasswords(opts({ length }));
    assert.equal(pwd.length, length);
  }
});

test('rejects length outside 8-128', () => {
  assert.throws(() => generatePasswords(opts({ length: 7 })));
  assert.throws(() => generatePasswords(opts({ length: 129 })));
  assert.throws(() => generatePasswords(opts({ length: 8.5 })));
});

test('rejects when all four character groups are disabled', () => {
  assert.throws(() => generatePasswords(opts({ uppercase: false, lowercase: false, numbers: false, symbols: false })));
});

test('every combination of the four groups (at least one enabled) produces a valid password', () => {
  const keys = ['uppercase', 'lowercase', 'numbers', 'symbols'];
  for (let mask = 1; mask < 16; mask++) {
    const o = opts({ length: 16 });
    keys.forEach((k, i) => { o[k] = Boolean(mask & (1 << i)); });
    // Symbols-only combination needs edgeSymbols on (asserted separately below).
    if (mask === 0b1000) o.edgeSymbols = true;
    const [pwd] = generatePasswords(o);
    assert.equal(pwd.length, 16, `mask ${mask}`);
    if (o.uppercase) assert.match(pwd, /[A-Z]/, `mask ${mask} missing uppercase`);
    if (o.lowercase) assert.match(pwd, /[a-z]/, `mask ${mask} missing lowercase`);
    if (o.numbers) assert.match(pwd, /[0-9]/, `mask ${mask} missing numbers`);
    if (o.symbols) assert.match(pwd, /[^A-Za-z0-9]/, `mask ${mask} missing symbols`);
  }
});

test('generates multiple passwords honoring count', () => {
  const passwords = generatePasswords(opts({ count: 10 }));
  assert.equal(passwords.length, 10);
  const unique = new Set(passwords);
  assert.ok(unique.size > 5, 'expected mostly-unique passwords across 10 draws');
});

test('rejects count outside 1-50', () => {
  assert.throws(() => generatePasswords(opts({ count: 0 })));
  assert.throws(() => generatePasswords(opts({ count: 51 })));
});

test('edgeSymbols=false keeps symbols away from the first and last characters', () => {
  for (let i = 0; i < 50; i++) {
    const [pwd] = generatePasswords(opts({ length: 12, edgeSymbols: false }));
    assert.match(pwd[0], /[A-Za-z0-9]/, `iteration ${i} first char: ${pwd}`);
    assert.match(pwd[pwd.length - 1], /[A-Za-z0-9]/, `iteration ${i} last char: ${pwd}`);
  }
});

test('edgeSymbols=true allows (but does not require) symbols at the edges over many draws', () => {
  let sawEdgeSymbol = false;
  for (let i = 0; i < 200 && !sawEdgeSymbol; i++) {
    const [pwd] = generatePasswords(opts({ length: 10, edgeSymbols: true, symbolSet: '!@#$%' }));
    if (/[^A-Za-z0-9]/.test(pwd[0]) || /[^A-Za-z0-9]/.test(pwd[pwd.length - 1])) sawEdgeSymbol = true;
  }
  assert.ok(sawEdgeSymbol, 'expected at least one edge symbol across 200 draws');
});

test('symbols-only requires edgeSymbols to be enabled', () => {
  assert.throws(() => generatePasswords(opts({ uppercase: false, lowercase: false, numbers: false, symbols: true, edgeSymbols: false })));
  const [pwd] = generatePasswords(opts({ uppercase: false, lowercase: false, numbers: false, symbols: true, edgeSymbols: true, length: 10 }));
  assert.equal(pwd.length, 10);
});

test('exclude removes listed characters from the output', () => {
  for (let i = 0; i < 30; i++) {
    const [pwd] = generatePasswords(opts({ length: 30, exclude: 'O0Il1' }));
    assert.ok(!/[O0Il1]/.test(pwd), `iteration ${i}: ${pwd}`);
  }
});

test('problematic exporter characters never appear, even if added to the custom symbol set', () => {
  // Only the printable subset can actually reach the symbol-set field; control
  // characters (tab/newline/CR) are already rejected by the symbol-set format
  // check and can never be entered here.
  const dangerous = PROBLEMATIC_CHARS.split('').filter((c) => /[\x21-\x7e]/.test(c)).join('');
  assert.ok(dangerous.length > 0);
  for (let i = 0; i < 30; i++) {
    const [pwd] = generatePasswords(opts({ length: 24, symbolSet: '!@#$%' + dangerous, edgeSymbols: true }));
    for (const c of dangerous) assert.ok(!pwd.includes(c), `char ${JSON.stringify(c)} leaked into ${JSON.stringify(pwd)}`);
  }
});

test('control characters cannot be smuggled into the allowed-symbols field at all', () => {
  assert.throws(() => generatePasswords(opts({ symbolSet: '!@#\t', edgeSymbols: true })));
  assert.throws(() => generatePasswords(opts({ symbolSet: '!@#\n', edgeSymbols: true })));
});

test('phrase mode seeds from the given phrase without exceeding half the length', () => {
  const [pwd] = generatePasswords(opts({ length: 20, mode: 'phrase' }), 'correo electronico');
  assert.equal(pwd.length, 20);
});

test('phrase mode with no phrase falls back to fully random output', () => {
  const [pwd] = generatePasswords(opts({ length: 16, mode: 'phrase' }), '');
  assert.equal(pwd.length, 16);
});

test('evaluateStrength flags common patterns as weak', () => {
  assert.equal(evaluateStrength('password123').score, 0);
  assert.equal(evaluateStrength('aaaaaaaa').score, 0);
});

test('evaluateStrength scores longer, mixed passwords higher', () => {
  const weak = evaluateStrength('abcd');
  const strong = evaluateStrength('Tr7#mK9$pL2@qR5!');
  assert.ok(strong.score > weak.score);
});

test('does not call Math.random (source check)', () => {
  const src = require('node:fs').readFileSync(new URL('../lib/generator.js', import.meta.url), 'utf8');
  assert.ok(!/Math\.random\s*\(/.test(src), 'generator.js must not call Math.random()');
  assert.match(src, /crypto\.getRandomValues/);
});
