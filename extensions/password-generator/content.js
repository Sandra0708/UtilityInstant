/**
 * Detects password fields on the page and, only when the user has enabled
 * the feature in the popup, overlays a small button that inserts a
 * generated password. Runs entirely locally:
 *  - never reads the value of any field on the page,
 *  - never sends anything over the network,
 *  - only writes a value when the user clicks the button it renders.
 */
(function () {
  'use strict';

  var Gen = self.UIPasswordGen;
  var Storage = self.UIPasswordStorage;
  var I18n = self.UIPasswordI18n;

  var enabled = false;
  // input -> { host, cleanup }; overlays.has(input) is also the single
  // source of truth for "already has a button", so add/remove stay in sync
  // (a separate processed-set previously drifted from this map after a
  // disable/re-enable cycle and left fields without a button).
  var overlays = new Map();
  var locale = I18n.detectBrowserLocale();
  var t = I18n.translator(locale);

  var CONFIRM_HINTS = /confirm|repeat|repite|repetir|verify|verifica|again|retype|re-?enter|confirma/i;

  function isPasswordField(el) {
    return el && el.tagName === 'INPUT' && (el.getAttribute('type') || '').toLowerCase() === 'password';
  }

  function isVisible(el) {
    if (!(el instanceof Element)) return false;
    var rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    var style = window.getComputedStyle(el);
    return style.visibility !== 'hidden' && style.display !== 'none';
  }

  function fieldSignature(el) {
    return [el.name, el.id, el.placeholder, el.getAttribute('aria-label'), el.autocomplete]
      .filter(Boolean).join(' ').toLowerCase();
  }

  // Many modern sign-up forms don't use a <form> element at all, so falling
  // back to the whole document would happily match an unrelated password
  // field elsewhere on the page. Instead, walk up from the input to the
  // smallest ancestor that actually contains more than one password field.
  function findScopeContainer(input) {
    if (input.form) return input.form;
    var el = input.parentElement;
    var depth = 0;
    while (el && depth < 6) {
      if (el.querySelectorAll('input[type="password"]').length > 1) return el;
      el = el.parentElement;
      depth++;
    }
    return input.parentElement || input.getRootNode();
  }

  function findConfirmField(input) {
    var scope = findScopeContainer(input);
    if (!scope || typeof scope.querySelectorAll !== 'function') return null;
    var candidates = Array.prototype.slice.call(scope.querySelectorAll('input[type="password"]'))
      .filter(function (el) { return el !== input; });
    if (!candidates.length) return null;

    var inputSignature = fieldSignature(input);
    var byHint = candidates.find(function (el) { return CONFIRM_HINTS.test(fieldSignature(el)); });
    if (byHint) return byHint;

    if (candidates.length === 1 && !CONFIRM_HINTS.test(inputSignature)) {
      return candidates[0];
    }
    return null;
  }

  function setNativeValue(input, value) {
    var proto = window.HTMLInputElement.prototype;
    var descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, value);
    } else {
      input.value = value;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function generateOne() {
    var options = await Storage.getSettings(Gen.DEFAULT_OPTIONS);
    var passwords = Gen.generatePasswords(options, '', locale === 'en');
    return passwords[0];
  }

  function buildOverlay(input) {
    var host = document.createElement('span');
    host.style.all = 'initial';
    host.style.position = 'fixed';
    host.style.zIndex = '2147483647';
    host.setAttribute('data-uip-overlay', '1');

    var shadow = host.attachShadow({ mode: 'closed' });
    var style = document.createElement('style');
    style.textContent = [
      ':host{all:initial}',
      '.wrap{display:flex;align-items:center;gap:2px;font-family:Arial,Helvetica,sans-serif}',
      'button{cursor:pointer;border:1px solid #2b384d;background:#172130;color:#edf2fb;',
      'width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;',
      'padding:0;box-shadow:0 1px 4px rgba(0,0,0,.3);}',
      'button:hover{border-color:#315fdf;color:#8daaff}',
      'button.close{width:16px;height:16px;font-size:10px;background:transparent;border:0;box-shadow:none;color:#a6b1c2}',
      'svg{width:14px;height:14px;pointer-events:none}',
    ].join('');
    shadow.appendChild(style);

    var wrap = document.createElement('div');
    wrap.className = 'wrap';

    var insertBtn = document.createElement('button');
    insertBtn.type = 'button';
    insertBtn.title = t('insertButtonLabel');
    insertBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5L19 11"/></svg>';

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'close';
    closeBtn.title = t('hideButtonTitle');
    closeBtn.textContent = '×';

    wrap.appendChild(insertBtn);
    wrap.appendChild(closeBtn);
    shadow.appendChild(wrap);
    document.documentElement.appendChild(host);

    var confirmField = findConfirmField(input);
    insertBtn.title = confirmField ? t('insertBothTitle') : t('insertOneTitle');

    insertBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      e.stopPropagation();
      try {
        var password = await generateOne();
        setNativeValue(input, password);
        if (confirmField) setNativeValue(confirmField, password);
      } catch (err) {
        // Silently ignore generation errors here; user can open the popup for details.
      }
    });

    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      removeOverlay(input);
    });

    function reposition() {
      if (!input.isConnected || !isVisible(input)) {
        host.style.display = 'none';
        return;
      }
      host.style.display = '';
      var rect = input.getBoundingClientRect();
      var top = rect.top + rect.height / 2 - 12;
      var left = rect.right - 58;
      host.style.top = Math.max(0, top) + 'px';
      host.style.left = Math.max(0, left) + 'px';
    }

    reposition();
    var raf = null;
    function scheduleReposition() {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = null; reposition(); });
    }
    window.addEventListener('scroll', scheduleReposition, true);
    window.addEventListener('resize', scheduleReposition);

    var resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleReposition);
      resizeObserver.observe(input);
    }

    return {
      host: host,
      cleanup: function () {
        window.removeEventListener('scroll', scheduleReposition, true);
        window.removeEventListener('resize', scheduleReposition);
        if (resizeObserver) resizeObserver.disconnect();
        if (host.parentNode) host.parentNode.removeChild(host);
      },
    };
  }

  function removeOverlay(input) {
    var entry = overlays.get(input);
    if (entry) {
      entry.cleanup();
      overlays.delete(input);
    }
  }

  function addOverlay(input) {
    if (overlays.has(input)) return;
    var entry = buildOverlay(input);
    overlays.set(input, entry);
  }

  function removeAllOverlays() {
    overlays.forEach(function (entry) { entry.cleanup(); });
    overlays.clear();
  }

  function scanForPasswordFields(root) {
    if (!enabled) return;
    var scope = root || document;
    var inputs = scope.querySelectorAll ? scope.querySelectorAll('input[type="password"]') : [];
    inputs.forEach(function (input) {
      if (isPasswordField(input)) addOverlay(input);
    });
  }

  var observer = new MutationObserver(function (mutations) {
    if (!enabled) return;
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (isPasswordField(node)) addOverlay(node);
        else if (node.querySelectorAll) scanForPasswordFields(node);
      });
      mutation.removedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (isPasswordField(node)) removeOverlay(node);
        else if (node.querySelectorAll) {
          node.querySelectorAll('input[type="password"]').forEach(removeOverlay);
        }
      });
    });
  });

  function startObserving() {
    scanForPasswordFields(document);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function stopObserving() {
    observer.disconnect();
    removeAllOverlays();
  }

  function setEnabled(next) {
    if (enabled === next) return;
    enabled = next;
    if (enabled) startObserving();
    else stopObserving();
  }

  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area !== 'local') return;
    if (changes[Storage.KEYS.fieldDetection]) {
      setEnabled(!!changes[Storage.KEYS.fieldDetection].newValue);
    }
  });

  Storage.getFieldDetectionEnabled().then(setEnabled).catch(function () {});
})();
