let restaurants,
  neighborhoods,
  cuisines;
var map;
var markers = [];

/**
 * Fetch all neighborhoods and set their HTML.
 */
let fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Set neighborhoods HTML.
 */
let fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
let fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
let fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
//  updateRestaurants();
};

window.addEventListener('load', function(event) {
  // if(!window.initMap)
  updateRestaurants();
}.bind(this));

/**
 * Update page and map for current restaurants.
 */
let updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
let resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
let fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
let createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

 const pictures = {
    'desktop': { 'folder': 'images/desktop_tiles', 'suffix': '-436x327.jpg'},
    'mobile': { 'folder':'images/mobile_tiles',  'suffix':'-640x450.jpg'},
    'high': { 'folder':'images/high_res',  'suffix':'-940x707.jpg'}
  };

  const desktopDetails = pictures.desktop;
  const mobileDetails = pictures.mobile;
  const highDetails = pictures.high;

  const picture = document.createElement('picture');

  const src1 = document.createElement('source');
  src1.setAttribute('media' ,'(max-width: 650px)');
  src1.setAttribute('srcset', DBHelper.imageUrlForRestaurant(restaurant,desktopDetails));
  picture.append(src1);

  const src2 = document.createElement('source');
  src2.setAttribute('media' ,'(min-width: 650px) and (max-width: 900px)');
  src2.setAttribute('srcset', DBHelper.imageUrlForRestaurant(restaurant,mobileDetails));
  picture.append(src2);

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.alt = 'Restaurant Image - '+restaurant.name;
  image.src = DBHelper.imageUrlForRestaurant(restaurant,desktopDetails);
  picture.append(image);

  li.append(picture);
  const name = document.createElement('h2');
  name.innerHTML = '  '+restaurant.name;
  name.setAttribute('class', 'fontawesome-food');
  // name.class = 'fontawesome-food';
  li.append(name);
  const div = document.createElement('div');

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  neighborhood.setAttribute('class', 'typicons-compass');
  div.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  div.append(address);

  li.append(div);
  const more = document.createElement('button');
  more.innerHTML = 'View Details';
  more.onclick = () => {
    window.location = DBHelper.urlForRestaurant(restaurant);};
  // more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
let addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};


/*
Register Service worker
*/
if('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(function(registration) {
          console.log('Service Worker Registered');
    })
    .catch( error => console.log(error));

  navigator.serviceWorker.ready.then(function(registration) {
     console.log('Service Worker Ready');
  })
  .catch( error => console.log(error));
}