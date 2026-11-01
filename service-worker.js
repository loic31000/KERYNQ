// Offline cache for local UI assets only. Does not cache external search results.
const CACHE = 'kerynq-static-v21';
const CORE = ['./', './index.html', './assets/js/core/search-query-core.js', './assets/js/core/privacy-core.js', './assets/js/core/file-core.js', './assets/js/core/prompt-core.js', './assets/js/core/catalog-core.js', './assets/js/app.js', './assets/js/file-panel.js', './assets/js/register-sw.js', './assets/css/styles.css', './assets/icons/favicon.svg', './manifest.webmanifest'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE.map(url => new Request(url, {cache: 'reload'})))).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(names => Promise.all(names.filter(name => name.startsWith('kerynq-static-') && name !== CACHE).map(name => caches.delete(name)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  // Seules les ressources de l'application passent ici : jamais un fichier importé (blob:).
  if (request.method !== 'GET' || !/^https?:$/.test(url.protocol) || url.origin !== self.location.origin) return;
  event.respondWith(fetch(request, {cache: 'no-cache'}).then(response => {
    if (response.ok && response.type === 'basic') {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)));
    }
    return response;
  }).catch(() => caches.match(request, {ignoreSearch: true}).then(cached => cached || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
