/**
 * Minimal ES/EN dictionary shared by the popup and the content script.
 * Mirrors the web app's bi(es, en) convention instead of pulling in a
 * separate i18n library.
 */
(function (root) {
  'use strict';

  var STRINGS = {
    appName: { es: 'UtilityInstant', en: 'UtilityInstant' },
    appSubtitle: { es: 'Generador de contraseñas', en: 'Password generator' },
    generate: { es: 'Generar', en: 'Generate' },
    regenerate: { es: 'Regenerar', en: 'Regenerate' },
    copy: { es: 'Copiar', en: 'Copy' },
    copyAll: { es: 'Copiar todas', en: 'Copy all' },
    copied: { es: 'Copiado.', en: 'Copied.' },
    copyError: { es: 'No se pudo copiar; selecciona el texto.', en: 'Could not copy; select the text.' },
    length: { es: 'Longitud', en: 'Length' },
    count: { es: 'Cantidad', en: 'Count' },
    uppercase: { es: 'Mayúsculas', en: 'Uppercase' },
    lowercase: { es: 'Minúsculas', en: 'Lowercase' },
    numbers: { es: 'Números', en: 'Numbers' },
    symbols: { es: 'Símbolos', en: 'Symbols' },
    edgeSymbols: { es: 'Permitir símbolos al principio y al final', en: 'Allow symbols at the start and end' },
    mode: { es: 'Modo', en: 'Mode' },
    modeRandom: { es: 'Aleatoria', en: 'Random' },
    modePhrase: { es: 'Desde palabra o frase', en: 'From a word or phrase' },
    phraseLabel: { es: 'Palabra o frase (opcional)', en: 'Word or phrase (optional)' },
    phraseHint: {
      es: 'Sin frase, la generación es aleatoria. Se conserva hasta la mitad de la longitud y se añaden caracteres aleatorios. Una frase conocida reduce la seguridad.',
      en: 'Without a phrase, generation is random. Up to half the length is kept and random characters are added. A known phrase reduces security.',
    },
    customize: { es: 'Personalizar caracteres', en: 'Customize characters' },
    allowedSymbols: { es: 'Símbolos permitidos', en: 'Allowed symbols' },
    exclude: { es: 'Excluir caracteres (por ejemplo O0Il1)', en: 'Exclude characters (for example O0Il1)' },
    atLeastOneGroup: {
      es: 'Debe quedar activo al menos un grupo de caracteres.',
      en: 'At least one character group must stay enabled.',
    },
    yourPasswords: { es: 'Tus contraseñas', en: 'Your passwords' },
    pressGenerate: { es: 'Pulsa Generar para comenzar.', en: 'Press Generate to begin.' },
    localNote: {
      es: 'Generadas en tu dispositivo. Nunca se envían a ningún servidor.',
      en: 'Generated on your device. Never sent to any server.',
    },
    strengthWeak: { es: 'Débil', en: 'Weak' },
    strengthFair: { es: 'Aceptable', en: 'Fair' },
    strengthGood: { es: 'Buena', en: 'Good' },
    strengthStrong: { es: 'Excelente', en: 'Excellent' },
    strengthCommon: { es: 'Patrón común', en: 'Common pattern' },
    history: { es: 'Últimas 5 contraseñas', en: 'Last 5 passwords' },
    historyEmpty: { es: 'Aún no hay contraseñas guardadas.', en: 'No saved passwords yet.' },
    historyHint: {
      es: 'Se guardan sin cifrar solo en este navegador. Puedes borrarlas cuando quieras.',
      en: 'Saved unencrypted only in this browser. You can delete them anytime.',
    },
    show: { es: 'Mostrar', en: 'Show' },
    hide: { es: 'Ocultar', en: 'Hide' },
    clearHistory: { es: 'Borrar historial', en: 'Clear history' },
    fieldDetectionTitle: { es: 'Detección de campos de contraseña', en: 'Password field detection' },
    fieldDetectionToggle: {
      es: 'Mostrar botón para insertar contraseña en formularios',
      en: 'Show button to insert password into forms',
    },
    fieldDetectionHint: {
      es: 'Desactivado por defecto. Al activarlo, verás un pequeño botón junto a los campos de contraseña de cualquier web para insertar una contraseña generada. Nunca se lee ni se envía el contenido de esos campos.',
      en: 'Off by default. When enabled, a small button appears next to password fields on any site to insert a generated password. Field contents are never read or sent anywhere.',
    },
    moreTools: { es: 'Más utilidades en UtilityInstant', en: 'More tools on UtilityInstant' },
    settingsSaved: { es: 'Configuración recordada en este navegador.', en: 'Settings remembered in this browser.' },
    settingsError: { es: 'No se pudo guardar la configuración.', en: 'Could not save settings.' },
    insertButtonLabel: { es: 'Insertar contraseña generada', en: 'Insert generated password' },
    insertBothTitle: { es: 'Insertar en este campo y en la confirmación', en: 'Insert here and in the confirmation field' },
    insertOneTitle: { es: 'Insertar contraseña generada', en: 'Insert generated password' },
    hideButtonTitle: { es: 'Ocultar este botón', en: 'Hide this button' },
    language: { es: 'Idioma', en: 'Language' },
  };

  function detectBrowserLocale() {
    try {
      var lang = (navigator.language || 'en').toLowerCase();
      return lang.indexOf('es') === 0 ? 'es' : 'en';
    } catch (e) {
      return 'en';
    }
  }

  function translator(locale) {
    var lang = locale === 'es' ? 'es' : 'en';
    return function t(key) {
      var entry = STRINGS[key];
      if (!entry) return key;
      return entry[lang] || entry.en || key;
    };
  }

  root.UIPasswordI18n = {
    STRINGS: STRINGS,
    detectBrowserLocale: detectBrowserLocale,
    translator: translator,
  };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.UIPasswordI18n;
  }
})(typeof self !== 'undefined' ? self : this);
