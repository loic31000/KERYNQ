/* KERYNQ · applique le thème enregistré avant le premier rendu. Chargé dans le head, avant la feuille de style.
   Mêmes règles que load() et normalize() dans app.js ; lit le stockage sans jamais y écrire. */
(function () {
  'use strict';
  // Identiques à catalog-core.js et styles.css : un test vérifie la correspondance.
  var THEMES = {
    kerynq: ['#efece3', 'light'], dark: ['#0b0d12', 'dark'], light: ['#f6f6f3', 'light'], pro: ['#eef1f5', 'light'],
    cyber: ['#05060d', 'dark'], girly: ['#fff1f7', 'light'], aurora: ['#0a0f1f', 'dark'], manga: ['#fbfaf5', 'light'],
    medecine: ['#eef8f8', 'light'], tuning: ['#0b0b0d', 'dark'], animaux: ['#fbf4e8', 'light'], finance: ['#07140f', 'dark']
  };
  var DEFAULT_THEME = 'kerynq', LEGACY_THEME = 'dark';

  function isRecord(value) { return !!value && typeof value === 'object' && !Array.isArray(value); }
  function valid(name) { return typeof name === 'string' && Object.prototype.hasOwnProperty.call(THEMES, name) ? name : DEFAULT_THEME; }

  function savedTheme() {
    try {
      var raw = localStorage.getItem('kerynq-premium-v5');
      if (raw) {
        var stored = JSON.parse(raw);
        if (!isRecord(stored)) return DEFAULT_THEME;
        return valid(stored.theme ? stored.theme : LEGACY_THEME);
      }
      var old = localStorage.getItem('kerynq-premium-v1');
      if (old) {
        var previous = JSON.parse(old);
        if (!isRecord(previous)) return LEGACY_THEME;
        return valid('theme' in previous ? previous.theme : LEGACY_THEME);
      }
    } catch (error) { /* Stockage indisponible ou illisible : thème par défaut, comme app.js. */ }
    return DEFAULT_THEME;
  }

  function savedDestination() {
    try {
      if (localStorage.getItem('kerynq-premium-v5')) {
        var stored = JSON.parse(localStorage.getItem('kerynq-premium-v5'));
        return isRecord(stored) && stored.previewTab === 'prompt' ? 'prompt' : 'web';
      }
    } catch (error) { /* Même repli que le thème. */ }
    return 'web';
  }

  var theme = savedTheme();
  var root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-boot-destination', savedDestination());
  var color = document.querySelector('meta[name="theme-color"]');
  if (color) color.setAttribute('content', THEMES[theme][0]);
  var scheme = document.querySelector('meta[name="color-scheme"]');
  if (scheme) scheme.setAttribute('content', THEMES[theme][1]);

  // Tant que app.js n'a pas terminé, un fichier manquant ou une erreur ne doit pas laisser croire que tout fonctionne.
  function showFailure() {
    var select = document.getElementById('engineSelect'), run = document.getElementById('runSearch');
    if (select && select.options[0]) select.options[0].textContent = 'Indisponible';
    if (run) run.textContent = 'Indisponible';
  }
  window.addEventListener('error', function (event) {
    if (!root.classList.contains('is-booting')) return;
    var target = event.target;
    if (target && target !== window && target.tagName !== 'SCRIPT' && target.tagName !== 'LINK') return;
    root.classList.add('boot-failed');
    showFailure();
    document.addEventListener('DOMContentLoaded', showFailure);
  }, true);
})();
