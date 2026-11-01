// Offline cache for local UI assets only. Does not cache external search results.
const CACHE = 'kerynq-static-v8';
const CORE = ['./', './index.html', './assets/js/core/search-query-core.js', './assets/js/core/privacy-core.js', './assets/js/core/source-packs-core.js', './assets/js/core/catalog-core.js', './assets/js/app.js', './assets/css/styles.css', './assets/icons/app-icon.svg', './assets/icons/favicon.svg', './manifest.webmanifest'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(names => Promise.all(names.filter(name => name.startsWith('kerynq-static-') && name !== CACHE).map(name => caches.delete(name)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok && response.type === 'basic') {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)));
    }
    return response;
  }).catch(() => caches.match(request).then(cached => cached || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
