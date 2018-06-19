const version = "10";
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

  var requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.startsWith('/images/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }
  }

  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, {ignoreSearch: true}))
      .then(response => {
      return response || fetch(event.request);
    })
  );
});

function servePhoto(request) {
  var storageUrl = request.url.replace(/-\d+px\.jpg$/, '');

  return caches.open(cacheName).then(function(cache) {
    return cache.match(storageUrl).then(function(response) {
      if (response) return response;

      return fetch(request).then(function(networkResponse) {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}
