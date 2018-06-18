const version = "5";
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
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(cacheArr);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
    .then(nameArray => nameArray
      .filter(keyName => keyName.startsWith('restuarant') && keyName !== cacheName)
      .map(name => caches.delete(name))
    ).catch( error => console.log('cache delete:',error))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, {ignoreSearch: true}))
      .then(response => {
      return response || fetch(event.request);
    })
  );
});
