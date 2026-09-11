/**
 * UtilityInstant Passwords - core generator.
 * Pure logic, no DOM. Loaded as a classic script in the popup and the
 * content script (attaches to `self.UIPasswordGen`), and importable from
 * Node tests via `module.exports`.
 *
 * Security: all randomness comes from crypto.getRandomValues with
 * rejection sampling. Math.random is never used.
 */
(function (root) {
  'use strict';

  var LOWER = 'abcdefghijklmnopqrstuvwxyz';
  var UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var DIGITS = '0123456789';
  var DEFAULT_SYMBOLS = '!@#$%&*+-_';

  // Characters that commonly break CSV/TSV/JSON exporters or password
  // import files: quotes, separators, backslashes and control characters.
  var PROBLEMATIC_CHARS = '"\',;\t\n\r\\`';

  var DEFAULT_OPTIONS = {
    length: 20,
    count: 1,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    edgeSymbols: false,
    symbolSet: DEFAULT_SYMBOLS,
    exclude: '',
    mode: 'random',
  };

  function getCrypto() {
    var c = (typeof self !== 'undefined' && self.crypto) || (typeof globalThis !== 'undefined' && globalThis.crypto);
    if (!c || typeof c.getRandomValues !== 'function') {
      throw new Error('crypto.getRandomValues is not available in this context.');
    }
    return c;
  }

  // Uniform integer in [0, max) via rejection sampling on a 32-bit source.
  function randomInt(max) {
    if (!Number.isInteger(max) || max <= 0) throw new Error('max must be a positive integer');
    var crypto = getCrypto();
    var range = Math.floor(0x100000000 / max) * max;
    var buf = new Uint32Array(1);
    var value;
    do {
      crypto.getRandomValues(buf);
      value = buf[0];
    } while (value >= range);
    return value % max;
  }

  function pickChar(pool) {
    return pool.charAt(randomInt(pool.length));
  }

  function dedupe(str) {
    return Array.from(new Set(str.split(''))).join('');
  }

  function cleanPool(pool, exclude) {
    var excludeSet = new Set((exclude || '').split(''));
    var problematicSet = new Set(PROBLEMATIC_CHARS.split(''));
    var out = '';
    var seen = new Set();
    for (var i = 0; i < pool.length; i++) {
      var c = pool.charAt(i);
      if (excludeSet.has(c) || problematicSet.has(c) || seen.has(c)) continue;
      seen.add(c);
      out += c;
    }
    return out;
  }

  function fail(es, en, useEnglish) {
    var err = new Error(useEnglish ? en : es);
    err.es = es;
    err.en = en;
    throw err;
  }

  function buildGroups(o) {
    var groups = [];
    if (o.uppercase) groups.push({ key: 'uppercase', pool: cleanPool(UPPER, o.exclude) });
    if (o.lowercase) groups.push({ key: 'lowercase', pool: cleanPool(LOWER, o.exclude) });
    if (o.numbers) groups.push({ key: 'numbers', pool: cleanPool(DIGITS, o.exclude) });
    if (o.symbols) groups.push({ key: 'symbols', pool: cleanPool(o.symbolSet || DEFAULT_SYMBOLS, o.exclude) });
    return groups;
  }

  function normalizeOptions(options) {
    var o = {};
    var keys = Object.keys(DEFAULT_OPTIONS);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      o[k] = options && options[k] !== undefined ? options[k] : DEFAULT_OPTIONS[k];
    }
    return o;
  }

  function generateOne(o, groups, alphabet, edgePool, seedChars) {
    for (var attempt = 0; attempt < 10000; attempt++) {
      var chars = seedChars.slice();
      while (chars.length < o.length) {
        var atEdge = !o.edgeSymbols && (chars.length === 0 || chars.length === o.length - 1);
        var pool = atEdge ? edgePool : alphabet;
        chars.push(pickChar(pool));
      }
      if (!o.edgeSymbols) {
        if (edgePool.indexOf(chars[0]) === -1) chars[0] = pickChar(edgePool);
        if (o.length > 1 && edgePool.indexOf(chars[chars.length - 1]) === -1) {
          chars[chars.length - 1] = pickChar(edgePool);
        }
      }
      var ok = true;
      for (var g = 0; g < groups.length; g++) {
        var found = false;
        for (var c = 0; c < chars.length; c++) {
          if (groups[g].pool.indexOf(chars[c]) !== -1) { found = true; break; }
        }
        if (!found) { ok = false; break; }
      }
      if (ok) return chars.join('');
    }
    return null;
  }

  /**
   * @param {Partial<typeof DEFAULT_OPTIONS>} options
   * @param {string} [phrase] used when options.mode === 'phrase'
   * @param {boolean} [useEnglish] error message language
   * @returns {string[]}
   */
  function generatePasswords(options, phrase, useEnglish) {
    var o = normalizeOptions(options);

    if (!Number.isInteger(o.length) || o.length < 8 || o.length > 128) {
      fail('La longitud debe ser un número entero entre 8 y 128.', 'Length must be a whole number between 8 and 128.', useEnglish);
    }
    if (!Number.isInteger(o.count) || o.count < 1 || o.count > 50) {
      fail('La cantidad debe ser un número entero entre 1 y 50.', 'Count must be a whole number between 1 and 50.', useEnglish);
    }
    if (o.symbols && (!/^[\x21-\x7e]*$/.test(o.symbolSet) || /[a-z0-9]/i.test(o.symbolSet))) {
      fail('Los símbolos permitidos deben ser signos de puntuación, sin letras, números ni espacios.', 'Allowed symbols must be punctuation only, without letters, digits or spaces.', useEnglish);
    }

    var groups = buildGroups(o);
    if (!groups.length) {
      fail('Selecciona al menos un grupo: mayúsculas, minúsculas, números o símbolos.', 'Select at least one group: uppercase, lowercase, numbers or symbols.', useEnglish);
    }
    for (var i = 0; i < groups.length; i++) {
      if (!groups[i].pool.length) {
        fail('Uno de los grupos activos se quedó sin caracteres disponibles (revisa exclusiones).', 'One of the enabled groups has no characters left (check exclusions).', useEnglish);
      }
    }

    var alphabet = dedupe(groups.map(function (g) { return g.pool; }).join(''));
    var alnumGroups = groups.filter(function (g) { return g.key !== 'symbols'; });
    var edgePool = dedupe(alnumGroups.map(function (g) { return g.pool; }).join(''));

    if (!o.edgeSymbols && !edgePool) {
      fail('Con solo símbolos activos, activa "permitir símbolos al principio y al final".', 'With only symbols enabled, turn on "allow symbols at the start and end".', useEnglish);
    }
    if (!edgePool) edgePool = alphabet;

    var seedChars = [];
    if (o.mode === 'phrase' && phrase) {
      var normalized = String(phrase).normalize('NFKD').replace(/[̀-ͯ]/g, '');
      var maxSeed = Math.floor(o.length / 2);
      for (var p = 0; p < normalized.length && seedChars.length < maxSeed; p++) {
        var ch = normalized.charAt(p);
        if (alphabet.indexOf(ch) !== -1) seedChars.push(ch);
        else if (alphabet.indexOf(ch.toLowerCase()) !== -1) seedChars.push(ch.toLowerCase());
        else if (alphabet.indexOf(ch.toUpperCase()) !== -1) seedChars.push(ch.toUpperCase());
      }
    }

    var results = [];
    for (var n = 0; n < o.count; n++) {
      var pwd = generateOne(o, groups, alphabet, edgePool, seedChars);
      if (!pwd) {
        fail('Estas reglas son demasiado restrictivas para generar una contraseña. Prueba con menos exclusiones o más longitud.', 'These rules are too restrictive to generate a password. Try fewer exclusions or a longer length.', useEnglish);
      }
      results.push(pwd);
    }
    return results;
  }

  /**
   * Basic local heuristic, not a breach/reuse checker.
   * @param {string} password
   */
  function evaluateStrength(password) {
    if (!password) return { score: 0, common: false, groups: 0 };
    var common = /password|contrase[nñ]a|qwerty|azerty|123456|letmein|admin|^(.)\1+$/i.test(password);
    var groupTests = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/];
    var groups = groupTests.filter(function (r) { return r.test(password); }).length;
    var score = common ? 0 : Math.min(4, Math.floor(password.length / 5) + (groups > 2 ? 1 : 0));
    return { score: score, common: common, groups: groups };
  }

  var api = {
    DEFAULT_OPTIONS: DEFAULT_OPTIONS,
    PROBLEMATIC_CHARS: PROBLEMATIC_CHARS,
    generatePasswords: generatePasswords,
    evaluateStrength: evaluateStrength,
    _internal: { randomInt: randomInt, cleanPool: cleanPool },
  };

  root.UIPasswordGen = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof self !== 'undefined' ? self : this);
