const prefix = 'sciencemath:' + self.registration.scope + ':';
const cacheName = prefix + 'v3';
const files = ['./', './styles.css', './app.mjs', './formulas.mjs', './manifest.webmanifest', './icons/atom.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png'];
const urls = new Set(files.map(path => new URL(path, self.registration.scope).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(files.map(path => new Request(path,{cache:'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(prefix) && key !== cacheName).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const {request} = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!url.href.startsWith(self.registration.scope)) return;
  // Keep each open app on the matching HTML, JS and CSS from one release.
  const home = new URL('./', self.registration.scope);
  const entry = request.mode === 'navigate' && (url.pathname === home.pathname || url.pathname === home.pathname + 'index.html')
    ? home.href : urls.has(url.href) ? url.href : null;
  if (entry) event.respondWith(caches.open(cacheName).then(async cache => (await cache.match(entry)) || fetch(request)));
});
