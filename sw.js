const CACHE_NAME = 'boulier-v3-8';
const urlsToCache = [
  '/Boulier/',
  '/Boulier/index.html'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    // NETWORK-FIRST : on tente toujours le réseau en priorité
    // Si le réseau répond → on met à jour le cache et on sert la nouvelle version
    // Si le réseau échoue (hors-ligne) → on sert le cache
    fetch(event.request).then(function(response) {
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      var responseToCache = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, responseToCache);
      });
      return response;
    }).catch(function() {
      // Hors-ligne : fallback sur le cache
      return caches.match(event.request).then(function(cached) {
        return cached || caches.match('/Boulier/index.html');
      });
    })
  );
});
