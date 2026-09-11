(function () {
  'use strict';

  var Gen = self.UIPasswordGen;
  var Storage = self.UIPasswordStorage;
  var I18n = self.UIPasswordI18n;

  var els = {};
  ['appName', 'appSubtitle', 'languageLabel', 'langSelect', 'generatorForm', 'length', 'count',
    'uppercase', 'lowercase', 'numbers', 'symbols', 'groupError', 'edgeSymbols', 'mode',
    'modeRandomOption', 'modePhraseOption', 'phraseField', 'phrase', 'phraseHint',
    'symbolSet', 'exclude', 'generateError', 'generateBtn', 'regenerateBtn',
    'resultsList', 'resultsEmpty', 'resultsActions', 'copyAllBtn', 'localNote',
    'historyList', 'historyEmpty', 'toggleHistoryBtn', 'clearHistoryBtn',
    'fieldDetectionToggle', 'fieldDetectionHint', 'notice', 'moreToolsLink',
    'lengthLabel', 'countLabel', 'uppercaseLabel', 'lowercaseLabel', 'numbersLabel', 'symbolsLabel',
    'edgeSymbolsLabel', 'modeLabel', 'phraseLabel', 'customizeLabel', 'allowedSymbolsLabel',
    'excludeLabel', 'yourPasswordsLabel', 'historyLabel', 'fieldDetectionTitle',
    'fieldDetectionToggleLabel', 'moreToolsLabel', 'historyHint'].forEach(function (id) {
    els[id] = document.getElementById(id);
  });

  var state = {
    lang: 'auto',
    locale: I18n.detectBrowserLocale(),
    t: I18n.translator(I18n.detectBrowserLocale()),
    options: Object.assign({}, Gen.DEFAULT_OPTIONS),
    lastPasswords: [],
    historyReveal: false,
    noticeTimer: null,
  };

  var STATIC_TEXT_MAP = {
    appName: 'appName', appSubtitle: 'appSubtitle', languageLabel: 'language',
    lengthLabel: 'length', countLabel: 'count', uppercaseLabel: 'uppercase',
    lowercaseLabel: 'lowercase', numbersLabel: 'numbers', symbolsLabel: 'symbols',
    edgeSymbolsLabel: 'edgeSymbols', modeLabel: 'mode', modeRandomOption: 'modeRandom',
    modePhraseOption: 'modePhrase', phraseLabel: 'phraseLabel', phraseHint: 'phraseHint',
    customizeLabel: 'customize', allowedSymbolsLabel: 'allowedSymbols', excludeLabel: 'exclude',
    yourPasswordsLabel: 'yourPasswords', resultsEmpty: 'pressGenerate', localNote: 'localNote',
    historyLabel: 'history', historyEmpty: 'historyEmpty', historyHint: 'historyHint',
    fieldDetectionTitle: 'fieldDetectionTitle', fieldDetectionToggleLabel: 'fieldDetectionToggle',
    fieldDetectionHint: 'fieldDetectionHint', moreToolsLabel: 'moreTools',
    generateBtn: 'generate', regenerateBtn: 'regenerate', copyAllBtn: 'copyAll',
    clearHistoryBtn: 'clearHistory',
  };

  function applyTexts() {
    var t = state.t;
    Object.keys(STATIC_TEXT_MAP).forEach(function (id) {
      if (els[id]) els[id].textContent = t(STATIC_TEXT_MAP[id]);
    });
    els.toggleHistoryBtn.textContent = state.historyReveal ? t('hide') : t('show');
    document.documentElement.lang = state.locale;
  }

  function setNotice(text) {
    els.notice.textContent = text;
    if (state.noticeTimer) clearTimeout(state.noticeTimer);
    if (text) state.noticeTimer = setTimeout(function () { els.notice.textContent = ''; }, 4000);
  }

  function activeGroupKeys() {
    return ['uppercase', 'lowercase', 'numbers', 'symbols'].filter(function (k) { return state.options[k]; });
  }

  function syncFormFromState() {
    var o = state.options;
    els.length.value = o.length;
    els.count.value = o.count;
    els.uppercase.checked = o.uppercase;
    els.lowercase.checked = o.lowercase;
    els.numbers.checked = o.numbers;
    els.symbols.checked = o.symbols;
    els.edgeSymbols.checked = o.edgeSymbols;
    els.edgeSymbols.disabled = !o.symbols;
    els.mode.value = o.mode;
    els.symbolSet.value = o.symbolSet;
    els.exclude.value = o.exclude;
    els.phraseField.hidden = o.mode !== 'phrase';
  }

  async function persistSettings() {
    try {
      await Storage.setSettings(state.options);
    } catch (e) {
      setNotice(state.t('settingsError'));
    }
  }

  function onCheckboxGroupChange(key, checked) {
    if (!checked) {
      var others = activeGroupKeys().filter(function (k) { return k !== key; });
      if (!others.length) {
        els[key].checked = true;
        els.groupError.hidden = false;
        els.groupError.textContent = state.t('atLeastOneGroup');
        setTimeout(function () { els.groupError.hidden = true; }, 2500);
        return;
      }
    }
    state.options[key] = checked;
    if (key === 'symbols') {
      els.edgeSymbols.disabled = !checked;
      if (!checked) state.options.edgeSymbols = false;
    }
    syncFormFromState();
    persistSettings();
  }

  function renderStrengthTag(password) {
    var result = Gen.evaluateStrength(password);
    var labelKey = ['strengthWeak', 'strengthWeak', 'strengthFair', 'strengthGood', 'strengthStrong'][result.score];
    var span = document.createElement('span');
    span.className = 'strength-tag strength-' + result.score;
    span.textContent = result.common ? state.t('strengthCommon') : state.t(labelKey);
    return span;
  }

  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(state.t('copied'));
    } catch (e) {
      setNotice(state.t('copyError'));
    }
  }

  function renderResults(passwords) {
    els.resultsList.innerHTML = '';
    if (!passwords.length) {
      els.resultsList.hidden = true;
      els.resultsEmpty.hidden = false;
      els.resultsActions.hidden = true;
      els.regenerateBtn.hidden = true;
      return;
    }
    els.resultsList.hidden = false;
    els.resultsEmpty.hidden = true;
    els.resultsActions.hidden = false;
    els.regenerateBtn.hidden = false;

    passwords.forEach(function (pwd) {
      var li = document.createElement('li');
      var code = document.createElement('code');
      code.textContent = pwd;
      var tag = renderStrengthTag(pwd);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'small-button';
      btn.textContent = state.t('copy');
      btn.addEventListener('click', function () { copyText(pwd); });
      li.appendChild(code);
      li.appendChild(tag);
      li.appendChild(btn);
      els.resultsList.appendChild(li);
    });
  }

  async function renderHistory() {
    var history = await Storage.getHistory();
    els.historyList.innerHTML = '';
    els.historyEmpty.hidden = history.length > 0;
    history.forEach(function (pwd, i) {
      var li = document.createElement('li');
      var code = document.createElement('code');
      code.textContent = state.historyReveal ? pwd : '••••••••••••';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'small-button';
      btn.textContent = state.t('copy');
      btn.setAttribute('aria-label', state.t('copy') + ' ' + (i + 1));
      btn.addEventListener('click', function () { copyText(pwd); });
      li.appendChild(code);
      li.appendChild(btn);
      els.historyList.appendChild(li);
    });
  }

  function readOptionsFromForm() {
    state.options.length = Number(els.length.value);
    state.options.count = Number(els.count.value);
    state.options.mode = els.mode.value;
    state.options.symbolSet = els.symbolSet.value;
    state.options.exclude = els.exclude.value;
  }

  function generate() {
    readOptionsFromForm();
    els.generateError.hidden = true;
    try {
      var useEnglish = state.locale === 'en';
      var passwords = Gen.generatePasswords(state.options, els.phrase.value, useEnglish);
      state.lastPasswords = passwords;
      renderResults(passwords);
      persistSettings();
      Storage.pushHistory(passwords).then(renderHistory);
    } catch (e) {
      els.generateError.hidden = false;
      els.generateError.textContent = e.message;
      renderResults([]);
    }
  }

  function wireEvents() {
    els.generatorForm.addEventListener('submit', function (e) {
      e.preventDefault();
      generate();
    });

    ['uppercase', 'lowercase', 'numbers', 'symbols'].forEach(function (key) {
      els[key].addEventListener('change', function () { onCheckboxGroupChange(key, els[key].checked); });
    });

    els.edgeSymbols.addEventListener('change', function () {
      state.options.edgeSymbols = els.edgeSymbols.checked;
      persistSettings();
    });

    els.mode.addEventListener('change', function () {
      state.options.mode = els.mode.value;
      els.phraseField.hidden = state.options.mode !== 'phrase';
      persistSettings();
    });

    els.symbolSet.addEventListener('change', function () {
      state.options.symbolSet = els.symbolSet.value;
      persistSettings();
    });
    els.exclude.addEventListener('change', function () {
      state.options.exclude = els.exclude.value;
      persistSettings();
    });

    els.regenerateBtn.addEventListener('click', generate);

    els.copyAllBtn.addEventListener('click', function () {
      copyText(state.lastPasswords.join('\n'));
    });

    els.toggleHistoryBtn.addEventListener('click', function () {
      state.historyReveal = !state.historyReveal;
      els.toggleHistoryBtn.textContent = state.historyReveal ? state.t('hide') : state.t('show');
      renderHistory();
    });

    els.clearHistoryBtn.addEventListener('click', async function () {
      await Storage.clearHistory();
      renderHistory();
    });

    els.fieldDetectionToggle.addEventListener('change', async function () {
      await Storage.setFieldDetectionEnabled(els.fieldDetectionToggle.checked);
    });

    els.langSelect.addEventListener('change', async function () {
      state.lang = els.langSelect.value;
      await Storage.setLang(state.lang);
      applyLanguage();
    });
  }

  function applyLanguage() {
    var effective = state.lang === 'auto' ? I18n.detectBrowserLocale() : state.lang;
    state.locale = effective;
    state.t = I18n.translator(effective);
    applyTexts();
    renderResults(state.lastPasswords);
    renderHistory();
  }

  async function init() {
    var savedLang = await Storage.getLang();
    state.lang = savedLang;
    els.langSelect.value = savedLang;

    state.options = await Storage.getSettings(Gen.DEFAULT_OPTIONS);
    syncFormFromState();

    var fieldDetectionOn = await Storage.getFieldDetectionEnabled();
    els.fieldDetectionToggle.checked = fieldDetectionOn;

    wireEvents();
    applyLanguage();
    renderResults([]);
  }

  init();
})();
