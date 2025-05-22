const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.png',
  // add other files that need to be cached, such as CSS, JS, images
];

// On service worker install, cache the specified files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// On fetch request, try to serve from cache first
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
