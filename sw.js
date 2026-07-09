const CACHE_NAME = 'machado-tennis-v4'; // Subimos para v4 para forçar a limpeza do v3 anterior
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Instalação apenas dos arquivos locais internos
self.addEventListener('install', (event) => {
  // Força o Service Worker novo a se tornar ativo imediatamente, sem esperar abas fecharem
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Limpeza de versões velhas
self.addEventListener('activate', (event) => {
  // Força o Service Worker a tomar controle total das páginas abertas imediatamente
  event.waitUntil(
    clients.claim().then(() => {
      return caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      });
    })
  );
});

// Gerenciamento inteligente (Estratégia: Stale-While-Revalidate)
self.addEventListener('fetch', (event) => {
  // Ignora requisições de CDN externas (como Firebase, Tailwind, Fonts) do cache local do SW
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Dispara a busca na rede em segundo plano para atualizar o cache
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Fallback silencioso se estiver totalmente offline
        });

        // Retorna o cache se existir, se não, espera a resposta da rede
        return cachedResponse || fetchPromise;
      });
    })
  );
});