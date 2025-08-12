// Version du cache — à incrémenter à chaque mise à jour
const CACHE_NAME = "clickheure-v1.0.5";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
  // ajoute ici tes autres scripts, CSS, images...
];

// Installation du Service Worker
self.addEventListener("install", (evt) => {
  console.log("[SW] Installation — cache version", CACHE_NAME);
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Mise en cache des fichiers");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener("activate", (evt) => {
  console.log("[SW] Activation — suppression des anciens caches");
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Suppression du cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((response) => {
      return (
        response ||
        fetch(evt.request).then((fetchRes) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(evt.request, fetchRes.clone());
            return fetchRes;
          });
        })
      );
    })
  );
});
