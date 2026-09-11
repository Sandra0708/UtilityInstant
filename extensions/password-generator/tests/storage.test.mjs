import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function installChromeStub() {
  const mem = {};
  globalThis.chrome = {
    runtime: { lastError: null },
    storage: {
      onChanged: { addListener: function () {} },
      local: {
        get: function (keys, cb) {
          const result = {};
          if (typeof keys === 'string') {
            if (keys in mem) result[keys] = mem[keys];
          } else if (Array.isArray(keys)) {
            keys.forEach((k) => { if (k in mem) result[k] = mem[k]; });
          } else {
            Object.assign(result, mem);
          }
          cb(result);
        },
        set: function (items, cb) {
          Object.assign(mem, items);
          if (cb) cb();
        },
      },
    },
  };
  return mem;
}

function freshStorageModule() {
  installChromeStub();
  const path = require.resolve('../lib/storage.js');
  delete require.cache[path];
  return require('../lib/storage.js');
}

test('getSettings returns defaults when nothing is saved yet', async () => {
  const Storage = freshStorageModule();
  const defaults = { length: 20, count: 1, symbols: true };
  const settings = await Storage.getSettings(defaults);
  assert.deepEqual(settings, defaults);
});

test('setSettings + getSettings round-trips and remembers configuration', async () => {
  const Storage = freshStorageModule();
  const defaults = { length: 20, count: 1, symbols: true };
  await Storage.setSettings({ length: 32, count: 3, symbols: false });
  const settings = await Storage.getSettings(defaults);
  assert.equal(settings.length, 32);
  assert.equal(settings.count, 3);
  assert.equal(settings.symbols, false);
});

test('getSettings ignores keys with a mismatched type and falls back to the default', async () => {
  const Storage = freshStorageModule();
  const defaults = { length: 20, count: 1 };
  await Storage.setSettings({ length: 'not-a-number', count: 5 });
  const settings = await Storage.getSettings(defaults);
  assert.equal(settings.length, 20);
  assert.equal(settings.count, 5);
});

test('history keeps only the last 5 entries, most recent first', async () => {
  const Storage = freshStorageModule();
  await Storage.pushHistory(['a1', 'a2']);
  await Storage.pushHistory(['b1']);
  await Storage.pushHistory(['c1', 'c2', 'c3', 'c4']);
  const history = await Storage.getHistory();
  assert.equal(history.length, 5);
  assert.deepEqual(history, ['c4', 'c3', 'c2', 'c1', 'b1']);
});

test('clearHistory empties the stored history', async () => {
  const Storage = freshStorageModule();
  await Storage.pushHistory(['x1', 'x2']);
  await Storage.clearHistory();
  const history = await Storage.getHistory();
  assert.deepEqual(history, []);
});

test('field detection flag defaults to disabled and can be toggled', async () => {
  const Storage = freshStorageModule();
  assert.equal(await Storage.getFieldDetectionEnabled(), false);
  await Storage.setFieldDetectionEnabled(true);
  assert.equal(await Storage.getFieldDetectionEnabled(), true);
});

test('language preference defaults to auto and can be overridden', async () => {
  const Storage = freshStorageModule();
  assert.equal(await Storage.getLang(), 'auto');
  await Storage.setLang('en');
  assert.equal(await Storage.getLang(), 'en');
});
