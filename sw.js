// sw.js — auto-update agressif pour éviter l’ancien cache
const CACHE_NAME = 'clickheure-v2';
const CORE = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// HTML = réseau d’abord (toujours la dernière version)
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(new Request(req, { cache: 'no-store' }));
        const copy = fresh.clone();
        (await caches.open(CACHE_NAME)).put(req, copy);
        return fresh;
      } catch {
        const cached = await caches.match(req);
        return cached || caches.match('./index.html');
      }
    })());
    return;
  }

  // même origine: stale-while-revalidate
  if (url.origin === location.origin) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then(res => { cache.put(req, res.clone()); return res; }).catch(()=>cached);
      return cached || fetchPromise;
    })());
    return;
  }

  // externe: réseau d’abord, fallback cache
  e.respondWith(
    fetch(req).then(r => { caches.open(CACHE_NAME).then(c => c.put(req, r.clone())); return r; })
              .catch(()=>caches.match(req))
  );
});
