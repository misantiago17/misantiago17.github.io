// Nome do cache
const CACHE_NAME = 'michelle-santiago-portfolio-v1';

// Arquivos para cache inicial
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/mobile.css',
  '/script.js',
  '/manifest.json',
  '/assets/cv_michelle_santiago.pdf',
  // Fontes essenciais
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Press+Start+2P&display=swap'
];

// Instalação do service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepta requisições e serve do cache quando possível
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrar no cache, retorna
        if (response) {
          return response;
        }

        // Não está no cache, busca na rede
        return fetch(event.request)
          .then(response => {
            // Se a resposta não for válida, retorna diretamente
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone para armazenar no cache e retornar
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Não faz cache de URLs de outros domínios
                if (event.request.url.startsWith(self.location.origin)) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          });
      })
  );
});

// Atualização do cache - remove caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 