// Cache hors ligne des fichiers de l'interface uniquement. Cycle décrit dans docs/MISES_A_JOUR.md.
// Chaque version installe un instantané complet et ne sert que lui : une page ne mélange jamais deux versions.
const VERSION = '21';
const CACHE = 'kerynq-static-v21';
const CORE = ['./', './index.html', './assets/js/theme-boot.js?v=21', './assets/js/core/search-query-core.js?v=21', './assets/js/core/privacy-core.js?v=21', './assets/js/core/prompt-core.js?v=21', './assets/js/core/catalog-core.js?v=21', './assets/js/app.js?v=21', './assets/js/register-sw.js?v=21', './assets/css/styles.css?v=21', './assets/icons/favicon.svg', './manifest.webmanifest'];

async function install() {
  // Tout est téléchargé et contrôlé avant d'écrire : une version incomplète n'est jamais installée.
  // Chaque contenu est lu en entier : une réponse non lue garderait sa connexion et bloquerait les suivantes.
  const files = await Promise.all(CORE.map(async url => {
    const response = await fetch(new Request(url, {cache: 'reload'}));
    if (!response.ok) throw new Error('Version incomplete');
    return {url, headers: response.headers, body: await response.arrayBuffer()};
  }));
  const page = new TextDecoder().decode(files[CORE.indexOf('./index.html')].body);
  if (!page.includes(`name="kerynq-build" content="${VERSION}"`)) throw new Error('Page from another version');
  const cache = await caches.open(CACHE);
  await Promise.all(files.map(file => cache.put(file.url, new Response(file.body, {headers: file.headers}))));
}

self.addEventListener('install', event => event.waitUntil(install()));

// Seul le cache de l'interface est retiré : le stockage local des utilisateurs n'est jamais touché.
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(names => Promise.all(names.filter(name => name.startsWith('kerynq-static-') && name !== CACHE).map(name => caches.delete(name))))));

// La nouvelle version attend, conformément au cycle du navigateur, jusqu'à la demande explicite de l'utilisateur.
self.addEventListener('message', event => {
  if (event.data === 'kerynq-activate') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(cache => cache.match(request.mode === 'navigate' ? './index.html' : request)).then(cached => cached || fetch(request)));
});
