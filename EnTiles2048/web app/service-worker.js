const CACHE_NAME = 'tile-master-cache-v1.0.1';
const HOSTNAME_WHITELIST = [self.location.hostname];

const PRECACHE_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'assets/apple-icon-180.png',
  'assets/manifest-icon-192.maskable.png',
  'assets/manifest-icon-512.maskable.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  if (HOSTNAME_WHITELIST.indexOf(requestUrl.hostname) === -1) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cachedResponse => {
        const networkFetch = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => null);

        return cachedResponse || networkFetch;
      })
    )
  );
});