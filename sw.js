const CACHE_NAME = 'ena-cache-v1';
const STATIC_ASSETS = [
  '/site_neo_apostolique_complet/index.html',
  '/site_neo_apostolique_complet/style.css',
  '/site_neo_apostolique_complet/script.js',
  '/site_neo_apostolique_complet/manifest.json',
  '/site_neo_apostolique_complet/eglise.html',
  '/site_neo_apostolique_complet/ministere.html',
  '/site_neo_apostolique_complet/cultes.html',
  '/site_neo_apostolique_complet/evenements.html',
  '/site_neo_apostolique_complet/medias.html',
  '/site_neo_apostolique_complet/actualites.html',
  '/site_neo_apostolique_complet/galerie.html',
  '/site_neo_apostolique_complet/communautes.html',
  '/site_neo_apostolique_complet/contact.html',
  '/site_neo_apostolique_complet/mission.html',
  '/site_neo_apostolique_complet/image/Nak_logo.svg.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
          .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var request = event.request;

  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(function(cached) {
      var fetchPromise = fetch(request).then(function(response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, copy);
          });
        }
        return response;
      }).catch(function() {
        return cached;
      });

      return cached || fetchPromise;
    })
  );
});
