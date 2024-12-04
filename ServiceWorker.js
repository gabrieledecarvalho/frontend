const cacheName = "Ifsc-Feira De Jogos-1.1";
const contentToCache = [
    "Build/FeiraDejogos1.1.loader.js",
    "Build/FeiraDejogos1.1.framework.js.gz",
    "Build/FeiraDejogos1.1.data.gz",
    "Build/FeiraDejogos1.1.wasm.gz",
    "TemplateData/style.css",
    "TemplateData/Banco-Imagem.png",
    "TemplateData/progress-bar-empty-dark.png",
    "TemplateData/progress-bar-empty-light.png",
    "TemplateData/progress-bar-full-dark.png",
    "TemplateData/progress-bar-full-light.png",
    "TemplateData/unity-logo-dark.png",
    "TemplateData/unity-logo-light.png",
    //icones duplicados no repositório?
    "TemplateData/icons/unity-logo-dark.png",
    "TemplateData/icons/unity-logo-light.png",
    "StreamingAssets/UnityServicesProjectConfiguration.json",
    "jogos/arcade/0/logo.png",
    "jogos/arcade/1/logo.png",
    "jogos/arcade/2/logo.png",
    "jogos/arcade/3/logo.png",
    
//add other files -> produtos, resto dos jogos, verificar se é necessário fazer o preload de todos os arquivos, incluindo os js ou só as imagens
];

// ver exatamente de onde é esse template com function e async function
self.addEventListener('install', function (event) {
    
  console.log('[Service Worker] Install');
    
    event.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

// instalando o service worker e a constante content to cache entra no seu escopo
self.addEventListener('fetch', function (event) {
    event.respondWith((async function () {
      let response = await caches.match(event.request);
      console.log(`[Service Worker] Fetching resource: ${event.request.url}`);
      if (response) { return response; }


      // cachefirst -> verifica o cache, se não tiver, checa a rede e alimenta o cache com a nova informação
      response = await fetch(event.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
      cache.put(event.request, response.clone());
      return response;
    })());
});


/*
// Cachefirst
// Establish a cache name
const cacheName = 'MyFancyCacheName_v1';

self.addEventListener('fetch', (event) => {
  // Check if this is a request for an image
  if (event.request.destination === 'image') {
    event.respondWith(caches.open(cacheName).then((cache) => {
      // Go to the cache first
      return cache.match(event.request.url).then((cachedResponse) => {
        // Return a cached response if we have one
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, hit the network
        return fetch(event.request).then((fetchedResponse) => {
          // Add the network response to the cache for later visits
          cache.put(event.request, fetchedResponse.clone());

          // Return the network response
          return fetchedResponse;
        });
      });
    }));
  } else {
    return;
  }
});
*/