/**
 * Common database helper functions.
 */
class DBHelper {

  static get cacheName(){
    const version = 3;// should be same as the cache version in sw.js
    return `restaurant-${version}`;
  }
  // static get dataURL(){
  //   return  `data/restaurants.json`;
  // }
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static getDB_REST_URL(id) {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants/${id}`;
  }

  static get desktop_res(){
    return 'desktop';
  }
  static get mobile_res(){
    return 'mobile';
  }
  static get high_res(){
    return 'high';
  }
  /**
   * Fetch all restaurants.
   */
  static async fetchRestaurants(callback) {
      const data = await self.getAllData();
      // .then(data => {
        callback(null,data,null);
      // });
      // .catch(() => {
      // });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {

    self.getRestaurantDetails(id).then(response => {
      callback(null,response);
    }).catch( error => {
      callback('Restaurant does not exist ', null);
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {

    self.getDatabyNeighbourhood(neighborhood)
    .then( results => {
      callback(null, results);
    })
    .catch(error => callback(error, null));
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    let isAllCuisine = cuisine === 'all';
    let isAllNh= neighborhood === 'all';

    if (isAllCuisine && isAllNh) {
      self.getAllData().then(data => {
        callback(null,data);
      });
    }
    else if ( isAllCuisine && !isAllNh ){
      self.getDatabyNeighbourhood(neighborhood)
        .then( results => {
          callback(null, results);
        })
        .catch(error => callback(error, null));
    } else if ( !isAllCuisine && isAllNh ){
      self.getDatabyCuisine(cuisine)
      .then( results => {
        callback(null, results);
      })
      .catch(error => callback(error, null));
    } else {
      self.getDatabyNeighbourhood(neighborhood)
      .then( results => {
        callback(null, results.filter(rest => rest.cuisine_type === cuisine));
      })
      .catch(error => callback(error, null));
    }
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant, resolution={ 'folder':'images/high_res',  'suffix':'-940x707.jpg'}) {
    return (`${resolution.folder}/${restaurant.photograph}${resolution.suffix}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurants, imgElement) {
    const center = '40.722216,-73.987501';
    const zoom = 11;
    const markers =  Array.isArray(restaurants) ?
                      restaurants.map(r => `markers=label:H|${r.latlng.lat},${r.latlng.lng}`).join('&') :
                      `markers=label:H|${restaurants.latlng.lat},${restaurants  .latlng.lng}`;
    const apiKey = 'AIzaSyDpN1cJAPw-IOvG3iFGz5vYc_TwKcX7ti0';
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=700x228&scale=2&${markers}&key=${apiKey}`
    imgElement.src = url;
  }

  /**
   *
   * Add review
   */

   static addReview(data, callBack){
    return self.addReview(data, callBack);
   }

  /*
   * get the proper-file prefix
   *
   */
  static getFileSuffix(resolution, callback) {
    DBHelper.fetchRestaurants((error, restaurants, pictures) => {
      if (error) {
        callback(error, null);
      } else {
          callback(pictures[resolution]);
      }
    });
  }
}
