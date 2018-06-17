const version = "0.6.01";
const cacheName = `restuarant-${version}`;
self.addEventListener('install', e => {
  const timeStamp = Date.now();
  const cacheArr = [
    `/`,
    `/index.html`,
    `/js/main.js`,
    `/js/restaurant_info.js`,
    `/js/dbhelper.js`,
    `/css/styles.css`,
    `data/restaurants.json`,
    '/restaurant.html'
  ];
  console.log('arr=', cacheArr);
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(cacheArr)
          .then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  console.log(event.request.url);
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, {ignoreSearch: true}))
      .then(response => {
        response ? console.log('this is from cache') : console.log('will fetch');
      return response || fetch(event.request);
    })
  );
});
