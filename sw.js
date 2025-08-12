// Click'Heure — Service Worker (v4)
// ➜ Incrémente CACHE_NAME à chaque mise à jour de ton code
const CACHE_NAME = "clickheure-v3";
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

// Installe la nouvelle version et force l’activation
self.addEventListener("install", (evt) => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE))
  );
});

// Nettoie les anciens caches puis prend le contrôle
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

// Message optionnel pour SKIP_WAITING déclenché par la page
self.addEventListener("message", (evt) => {
  if (evt.data && evt.data.type === "SKIP_WAITING") self.skipWaiting();
});

// Stratégies :
// - HTML = réseau d'abord (toujours la dernière version) + fallback cache
// - Assets même origine = stale-while-revalidate
// - Externe = réseau d'abord, fallback cache
self.addEventListener("fetch
