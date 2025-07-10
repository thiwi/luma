self.addEventListener('install', event => {
  event.waitUntil(caches.open('luma-cache').then(cache => cache.addAll(['/','/index.html','/app.jsx'])));
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
