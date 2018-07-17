self.createDB = function(url,cacheName) {
    //check for support
    if (!('indexedDB' in self)) {
      console.log('This browser doesn\'t support IndexedDB');
      return;
    }

    self.DBVersion = 2;
    return caches.open(cacheName)
    .then(cache => cache.match(url, {ignoreSearch: true}))
    .then(response => response.json().then(data => {
        console.log('data in cache', data);

        //IDB
    var dbPromise = self.idb.open('restaurant-reviews_dataBase', self.DBVersion , (upgradeDb) => {
        console.log(upgradeDb.oldVersion);
        // upgradeDb.oldVersion = 0;
        switch(upgradeDb.oldVersion){
          case 1:
            upgradeDb.createObjectStore('restaurant-reviews',{keyPath: 'id'});
          case 2:
             upgradeDb.transaction.objectStore("restaurant-reviews").createIndex("neighborhood",'neighborhood');
             upgradeDb.transaction.objectStore("restaurant-reviews").createIndex("cuisine_type",'cuisine_type');
        }
    });
    return dbPromise.then((db) => {

        let tx = db.transaction('restaurant-reviews', 'readwrite');
        let store = tx.objectStore('restaurant-reviews');

        for(let rs of data.restaurants)
        {
          store.put(rs);
        }

      return tx.complete;
    });
    }))
    .catch( error => console.log('there is an error ', error));
  };

self.getAllData = function() {

   return self.idb.open('restaurant-reviews_dataBase', self.DBVersion).then(function(db) {
    var tx = db.transaction(['restaurant-reviews'], 'readonly');
    var store = tx.objectStore('restaurant-reviews');
    return store.getAll();
    });
};
self.getDatabyNeighbourhood = function(nh) {

    return self.idb.open('restaurant-reviews_dataBase', self.DBVersion).then(function(db) {
        var tx = db.transaction(['restaurant-reviews'], 'readonly');
        var store = tx.objectStore('restaurant-reviews');
        return store.index('neighborhood').getAll(IDBKeyRange.only(nh));
    });
 };
 self.getDatabyCuisine = function(ct) {

    return self.idb.open('restaurant-reviews_dataBase', self.DBVersion).then(function(db) {
        var tx = db.transaction(['restaurant-reviews'], 'readonly');
        var store = tx.objectStore('restaurant-reviews');
        return store.index('cuisine_type').getAll(IDBKeyRange.only(ct));
    });
 };

 self.getRestaurantDetails = function(id){
    return self.idb.open('restaurant-reviews_dataBase', self.DBVersion)
    .then((db) => {
        let tx = db.transaction(['restaurant-reviews'], 'readonly');
        let store = tx.objectStore('restaurant-reviews');
        return store.get(+id);
    });
 };



