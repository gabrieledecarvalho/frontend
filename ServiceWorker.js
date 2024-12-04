const cacheName = "Ifsc-Feira De Jogos-1.1";
const contentToCache = [
    "Build/FeiraDejogos1.1.loader.js",
    "Build/FeiraDejogos1.1.framework.js.gz",
    "Build/FeiraDejogos1.1.data.gz",
    "Build/FeiraDejogos1.1.wasm.gz",
    "TemplateData/style.css"
//add other files -> notion
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

self.addEventListener('fetch', function (event) {
    event.respondWith((async function () {
      let response = await caches.match(event.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(event.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(event.request, response.clone());
      return response;
    })());
});
