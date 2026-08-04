const CACHE_NAME = "magic-block-blitz-2026-v2";

const ASSETS = [
  "./",
  "./index.html", 
  "./manifest.json",
  "./css/google-fonts.css",
  "./css/all-min.css",

  "./assets/apple-icon-180.png",
  "./assets/manifest-icon-192.any.png",
  "./assets/manifest-icon-192.maskable.png",
  "./assets/manifest-icon-512.any.png",
  "./assets/manifest-icon-512.maskable.png",

  "./assets/screenshot-1-1366x768.png",
  "./assets/screenshot-2-1366x768.png",
  "./assets/screenshot-3-1366x768.png",
  "./assets/screenshot-4-1366x768.png",
  "./assets/screenshot-5-1366x768.png",
  "./assets/screenshot-6-768x1366.png",
  "./assets/screenshot-7-768x1366.png",
  "./assets/screenshot-8-768x1366.png",
  "./assets/screenshot-9-768x1366.png",
  "./assets/screenshot-10-768x1366.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});