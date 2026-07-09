const CACHE_NAME = 'machado-tennis-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Instalação apenas dos arquivos locais internos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Limpeza de versões velhas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Gerenciamento de rede seguro sem quebrar com CORS de terceiros
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback silencioso caso esteja offline e o recurso não esteja em cache
      });
    })
  );
});