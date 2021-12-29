const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/styles.css',
    '/index.js',
    '/idb.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
  ];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Success --- Files pre-cached');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('Removing old cache data', key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// fetch
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('/api/transaction ')) {
    e.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then(async (cache) => {
          try {
            const response = await fetch(e.request);
            if (response.status === 200) {
              cache.put(e.request.url, response.clone());
            }
            return response;
          } catch (err) {
            return await cache.match(e.request);
          }
        })
        .catch((err) => console.log(err))
    );

    return;
  }

  e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
});