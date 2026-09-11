/**
 * chrome.storage.local wrapper with the extension's storage keys.
 * Local only (never chrome.storage.sync) so settings and the short
 * password history never leave the device via a signed-in browser sync.
 */
(function (root) {
  'use strict';

  var KEYS = {
    settings: 'uip.settings.v1',
    history: 'uip.history.v1',
    lang: 'uip.lang.v1',
    fieldDetection: 'uip.fieldDetection.v1',
  };

  var DEFAULT_LANG = 'auto';
  var DEFAULT_FIELD_DETECTION = false;
  var HISTORY_LIMIT = 5;

  function get(keys) {
    return new Promise(function (resolve, reject) {
      try {
        chrome.storage.local.get(keys, function (result) {
          var err = chrome.runtime.lastError;
          if (err) reject(err);
          else resolve(result);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  function set(items) {
    return new Promise(function (resolve, reject) {
      try {
        chrome.storage.local.set(items, function () {
          var err = chrome.runtime.lastError;
          if (err) reject(err);
          else resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async function getSettings(defaults) {
    var result = await get(KEYS.settings);
    var saved = result[KEYS.settings];
    if (!saved || typeof saved !== 'object') return Object.assign({}, defaults);
    var merged = Object.assign({}, defaults);
    Object.keys(defaults).forEach(function (k) {
      if (typeof saved[k] === typeof defaults[k]) merged[k] = saved[k];
    });
    return merged;
  }

  function setSettings(options) {
    var payload = {};
    payload[KEYS.settings] = options;
    return set(payload);
  }

  async function getHistory() {
    var result = await get(KEYS.history);
    var list = result[KEYS.history];
    if (!Array.isArray(list)) return [];
    return list.filter(function (x) { return typeof x === 'string' && x.length <= 128; }).slice(0, HISTORY_LIMIT);
  }

  async function pushHistory(passwords) {
    var current = await getHistory();
    var next = passwords.slice().reverse().concat(current).slice(0, HISTORY_LIMIT);
    var payload = {};
    payload[KEYS.history] = next;
    await set(payload);
    return next;
  }

  function clearHistory() {
    var payload = {};
    payload[KEYS.history] = [];
    return set(payload);
  }

  async function getLang() {
    var result = await get(KEYS.lang);
    var value = result[KEYS.lang];
    return value === 'es' || value === 'en' ? value : DEFAULT_LANG;
  }

  function setLang(value) {
    var payload = {};
    payload[KEYS.lang] = value;
    return set(payload);
  }

  async function getFieldDetectionEnabled() {
    var result = await get(KEYS.fieldDetection);
    var value = result[KEYS.fieldDetection];
    return typeof value === 'boolean' ? value : DEFAULT_FIELD_DETECTION;
  }

  function setFieldDetectionEnabled(value) {
    var payload = {};
    payload[KEYS.fieldDetection] = !!value;
    return set(payload);
  }

  root.UIPasswordStorage = {
    KEYS: KEYS,
    HISTORY_LIMIT: HISTORY_LIMIT,
    getSettings: getSettings,
    setSettings: setSettings,
    getHistory: getHistory,
    pushHistory: pushHistory,
    clearHistory: clearHistory,
    getLang: getLang,
    setLang: setLang,
    getFieldDetectionEnabled: getFieldDetectionEnabled,
    setFieldDetectionEnabled: setFieldDetectionEnabled,
  };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.UIPasswordStorage;
  }
})(typeof self !== 'undefined' ? self : this);
