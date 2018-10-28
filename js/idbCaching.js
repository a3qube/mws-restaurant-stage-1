async function fetchRestaurantsData(fetchFromIDB) {
    if(fetchFromIDB){
        const db = await self.getDBPromise();
        var tx = db.transaction([detailsObjectStoreName], 'readonly');
        var store = tx.objectStore(detailsObjectStoreName);
        return store.getAll();
    }
    try{
        const restURL = 'http://localhost:1337/restaurants';
        // const reiviewsURL = 'http://localhost:1337/reviews';// As this is limited to 30 changing the end point to per hotel
        // const response = await Promise.all([fetch(restURL),fetch(reiviewsURL)]);
        // const data = await Promise.all([response[0].json(), response[1].json()]);
        const response = await fetch(restURL);
        return await response.json();
        // data[0].forEach(element => {
        //     element['reviews'] = data[1].map(({ restaurant_id, rating, comments, name, updatedAt: date }) => {
        //         const obj = { restaurant_id, rating, comments, name, date };
        //         if(restaurant_id === element.id){
        //             return obj;
        //         }
        //     })
        //     .filter(e => !!e);
        // });
        // return data;
    } catch(error){
        console.log('error in fetchRestaurantsData', error)
    }

}
const reviewObjectStoreName = 'restaurant-reviews-details';
const detailsObjectStoreName = 'restaurant-details';

async function fetchRestaurantReviews(id) {
        const reiviewsURL = `http://localhost:1337/reviews/?restaurant_id=${id}`;
        const response = await fetch(reiviewsURL);
        return response.json();
}
self.getDBPromise = () => {
    const DBVersion = 1;
    const idbName ='restaurant-reviews_dataBase';

    return self.idb.open(idbName, DBVersion, (upgradeDb) => {
        console.log(upgradeDb.oldVersion);
        // upgradeDb.oldVersion = 0;
        const { oldVersion } = upgradeDb;
        switch (oldVersion) {
            case 0:
                upgradeDb.createObjectStore(detailsObjectStoreName,{keyPath: 'id'});
                // upgradeDb.createObjectStore(reviewObjectStoreName,{keyPath: 'id'});
            case 1:
                upgradeDb.transaction.objectStore(detailsObjectStoreName).createIndex("neighborhood",'neighborhood');
                upgradeDb.transaction.objectStore(detailsObjectStoreName).createIndex("cuisine_type",'cuisine_type');
                // upgradeDb.transaction.objectStore(reviewObjectStoreName).createIndex("restaurant_id",'restaurant_id');
          }

    })
}
self.createDB = function() {
    //check for support
    if (!('indexedDB' in self)) {
      console.log('This browser doesn\'t support IndexedDB');
      return;
    }
    return  this.fetchRestaurantsData(false)
            .then(data => {
                console.log('creating the idb');

            return self.getDBPromise().then((db) => {
                let tx = db.transaction(detailsObjectStoreName, 'readwrite');
                let store = tx.objectStore(detailsObjectStoreName);
                data.forEach((rs) => { store.put(rs); });
                return tx.complete;
            });
            })
            .catch( error => console.log('there is an error ', error));

  };


self.getAllData = function() {

     return this.fetchRestaurantsData();
};
self.getDatabyNeighbourhood = function(nh) {

    return self.getDBPromise().then(function(db) {
        var tx = db.transaction([detailsObjectStoreName], 'readonly');
        var store = tx.objectStore(detailsObjectStoreName);
        return store.index('neighborhood').getAll(IDBKeyRange.only(nh));
    });
 };
 self.getDatabyCuisine = function(ct) {

    return self.getDBPromise().then(function(db) {
        var tx = db.transaction([detailsObjectStoreName], 'readonly');
        var store = tx.objectStore(detailsObjectStoreName);
        return store.index('cuisine_type').getAll(IDBKeyRange.only(ct));
    });
 };

 self.getRestaurantDetails = function(id){
    return self.getDBPromise()
    .then( async db => {
        let tx = db.transaction([detailsObjectStoreName], 'readonly');
        let store = tx.objectStore(detailsObjectStoreName);
        const data = await store.get(+id);
        if(data && !data.reviews) {
            const reviewsData = await this.fetchRestaurantReviews(+id);
            data.reviews = reviewsData;
            tx = db.transaction([detailsObjectStoreName], 'readwrite');
            store = tx.objectStore(detailsObjectStoreName);
            await store.openCursor(IDBKeyRange.only(data.id)).then(async cursor=> {
                // const { value } = cursor;
                //  value.reviews = reviewsData;
                 await cursor.update(data);
             });
        }
        return data;
    });
 };

self.addReview =  function(data, callBack){
    return self.getDBPromise()
    .then((db) => {
        let tx = db.transaction([detailsObjectStoreName], 'readwrite');
        let store = tx.objectStore(detailsObjectStoreName);
        return store.openCursor(IDBKeyRange.only(data.restaurant_id)).then(cursor=> {
           const { value } = cursor;
            value.reviews.push(data);
            return cursor.update(value);
        })
    .then(data => {
            console.log('review is aded to IDB');
        })
        .catch(e => {
            console.log('Error while adding review to IDB. Please check after some time');
        });
    });
 };

function getCurrentDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd;
    }

    if(mm<10) {
        mm = '0'+mm;
    }

    today = mm + '/' + dd + '/' + yyyy;
    return today;
}
