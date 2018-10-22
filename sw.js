
  importScripts('./js/idbCaching.js');
  importScripts('./js/idb.js');

  const version = 1;
  const cacheName = `restaurant-${version}`;


  self.addEventListener('install', e => {
    const timeStamp = Date.now();
    const cacheArr = [
      'http://localhost:1337/restaurants',
      'http://localhost:1337/reviews',
      `/`,
      `/index.html`,
      `/js/main.js`,
      `/js/restaurant_info.js`,
      `/js/dbhelper.js`,
      `/css/styles.css`,
      '/restaurant.html',
    ];
    e.waitUntil(
      caches.open(cacheName).then(cache => {
        return cache.addAll(cacheArr);
      })
    );
  });


  self.addEventListener('activate', event => {
      event.waitUntil(
        createDB().then(() => caches.keys()
          .then(nameArray => nameArray
                              .filter(keyName => keyName.startsWith('restuarant') && keyName !== cacheName)
                              .forEach(name => { caches.delete(name); }))
          .catch( error => console.log('cache delete:',error))
      ).catch( error => console.error('idb:',error))
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
        .then(response =>  response || fetch(event.request))
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
