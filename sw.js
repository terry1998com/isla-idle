// Service worker de Isla Idle: guarda el juego para que funcione sin conexión.
// Cuando subas una versión nueva del juego, cambia el número de VERSION para que todos reciban la actualización.
const VERSION = 'isla-idle-20261025';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Muestra lo guardado al instante y lo actualiza en segundo plano (la próxima vez que abras el juego ya está la versión nueva).
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const mismo = new URL(e.request.url).origin === location.origin;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(guardado => {
    const red = fetch(e.request).then(r => {
      if (r.ok && mismo) { const copia = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copia)); }
      return r;
    }).catch(() => guardado || caches.match('./index.html'));
    return guardado || red;
  }));
});
