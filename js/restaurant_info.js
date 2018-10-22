let restaurant;
var map;
/**
 * Get current restaurant from page URL.
 */
let fetchRestaurantFromURL = (callback) => {
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
let fillRestaurantHTML = (restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const pictures = {
    'desktop': { 'folder': 'images/desktop_tiles', 'suffix': '-436x327.jpg'},
    'mobile': { 'folder':'images/mobile_tiles',  'suffix':'-640x450.jpg'},
    'high': { 'folder':'images/high_res',  'suffix':'-940x707.jpg'}
  };

  const desktopDetails = pictures.desktop;
  const mobileDetails = pictures.mobile;
  const highDetails = pictures.high;

  const picture  = document.getElementById('restaurant-pic');

  const src1 = document.createElement('source');
  src1.setAttribute('media' ,'(max-width: 460px)');
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


  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
let fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
let fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  title.setAttribute('class','reviewTitle');
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
let createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.setAttribute('style', 'font-weight:bold;');
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  date.setAttribute('style', 'font-weight:bold;');
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute('style', 'font-weight:bold;');
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
let fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
let getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};



/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

// tTest
window.addEventListener('load', function(event) {
    fetchRestaurantFromURL((error, restaurant) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
      fillRestaurantHTML(restaurant);
      fillBreadcrumb();
      }
    });
}.bind(this));

function handleAddReview() {
  var modal = document.getElementById('myModal');
  modal.style.display = "block";
  Array.from(document.getElementsByClassName("fa")).forEach(element => element.style.color = "");
}

function handleDialogClose() {
  var modal = document.getElementById('myModal');
  modal.style.display = "none";
  this.rating = 0;
}

const ratingClass = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
};
// let rating = 0;
function onIncrRating(e) {
  if (!this.rating) {
    this.rating = 0;
  }

  if(this.rating < 5){
    this.rating++;
    document.getElementsByClassName(ratingClass[this.rating])[0].style.color = "orange";
    document.getElementsByClassName("incrBtn")[0].disabled = this.rating === 5;
    document.getElementsByClassName("decrBtn")[0].disabled = this.rating === 0;
  }
}

function onDecrRating(e) {
  if (!this.rating) {
    this.rating = 0;
  }
  if(this.rating > 0){
    document.getElementsByClassName(ratingClass[this.rating])[0].style.color = "";
    this.rating--;
    document.getElementsByClassName("decrBtn")[0].disabled = this.rating === 0;
    document.getElementsByClassName("incrBtn")[0].disabled = this.rating === 5;
  }
}

function onReviewSubmit(e) {
  const comments = document.getElementById('reviewComments').value;
  const id = 1;
  const {rating} = this;
  const name = "Test reviewer";
  const update = {
    id,
    name,
    rating,
    comments,
  };
  this.submitReviews(update);
}

function submitReviews(data) {
  //Save to the DB
  const { id, name, rating, comments}= data;
  let payload = {
    "restaurant_id": id,
    "name": name,
    "rating": rating,
    "comments":comments,
  };

  fetch("http://localhost:1337/reviews/",
  {
    method: "POST",
    body: JSON.stringify(payload)
  });
    //Save to IDB
    DBHelper.addReview(payload, () => {
    console.log('reviews inserted successfully');
  });
}