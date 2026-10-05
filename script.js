function openApp() {
  document.getElementById('home').classList.add('hide');
  document.body.classList.remove('lock');
  if (typeof startLocation === 'function') {
    startLocation();   // defined in the main script below
  }
}

/* =====================================================
   1. SETTINGS
   ===================================================== */

// Optional: paste a Google Places API key here for Google photos and ratings.
const GOOGLE_KEY = '';

// Default location, used when the phone/browser location is off.
const HOME = { lat: 9.9252, lng: 78.1198, city: 'Madurai' };

// Free map servers (OpenStreetMap). We ask all three and use the first answer.
const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
];


/* =====================================================
   2. DATA: MOODS, BUILT-IN PLACES, VEHICLES
   ===================================================== */

// One kind of place for a mood.
// key/value = OpenStreetMap tag, cost = average ₹ per person, google = Google place type
function cat(key, value, name, icon, cost, google) {
  return { key: key, value: value, name: name, icon: icon, cost: cost, google: google };
}

const MOODS = {
  happy: { icon: '😄', name: 'Happy', text: 'Cafes, parks & fun', cats: [
    cat('amenity', 'cafe', 'Cafe', '☕', 250, 'cafe'),
    cat('leisure', 'park', 'Park', '🌳', 20, 'park'),
    cat('amenity', 'cinema', 'Entertainment', '🎬', 300, 'movie_theater'),
    cat('tourism', 'theme_park', 'Theme park', '🎡', 600, 'amusement_park') ] },
  relaxed: { icon: '😌', name: 'Relaxed', text: 'Beaches, parks & peace', cats: [
    cat('natural', 'beach', 'Beach', '🏖️', 50, 'tourist_attraction'),
    cat('leisure', 'park', 'Park', '🌳', 20, 'park'),
    cat('leisure', 'garden', 'Garden', '🌺', 30, 'garden'),
    cat('tourism', 'viewpoint', 'Peaceful spot', '🌅', 0, 'tourist_attraction') ] },
  romantic: { icon: '😍', name: 'Romantic', text: 'Dinners, views & couple spots', cats: [
    cat('amenity', 'restaurant', 'Restaurant', '🍽️', 450, 'restaurant'),
    cat('tourism', 'viewpoint', 'View point', '🌄', 0, 'tourist_attraction'),
    cat('leisure', 'garden', 'Couple spot', '💑', 30, 'garden'),
    cat('leisure', 'park', 'Couple spot', '💑', 20, 'park') ] },
  adventurous: { icon: '🤠', name: 'Adventurous', text: 'Trekking & activities', cats: [
    cat('natural', 'peak', 'Trek / Peak', '⛰️', 0, 'hiking_area'),
    cat('tourism', 'camp_site', 'Camping', '⛺', 400, 'campground'),
    cat('leisure', 'water_park', 'Water park', '🌊', 600, 'amusement_park'),
    cat('leisure', 'nature_reserve', 'Adventure spot', '🧗', 100, 'national_park') ] },
  focused: { icon: '🎯', name: 'Focused', text: 'Libraries & study cafes', cats: [
    cat('amenity', 'library', 'Library', '📚', 0, 'library'),
    cat('amenity', 'cafe', 'Study cafe', '💻', 200, 'cafe'),
    cat('amenity', 'coworking_space', 'Quiet workspace', '🪑', 150, 'library') ] },
  sad: { icon: '😔', name: 'Sad', text: 'Calm, nature & peace', cats: [
    cat('leisure', 'nature_reserve', 'Nature', '🍃', 20, 'national_park'),
    cat('leisure', 'park', 'Calm park', '🌳', 20, 'park'),
    cat('leisure', 'garden', 'Peaceful garden', '🌿', 30, 'garden'),
    cat('natural', 'water', 'Lake / water', '💧', 0, 'tourist_attraction') ] },
  social: { icon: '🥳', name: 'Social', text: 'Food, malls & gaming', cats: [
    cat('amenity', 'restaurant', 'Restaurant', '🍽️', 350, 'restaurant'),
    cat('shop', 'mall', 'Mall', '🛍️', 300, 'shopping_mall'),
    cat('leisure', 'amusement_arcade', 'Gaming zone', '🎮', 300, 'amusement_center'),
    cat('leisure', 'bowling_alley', 'Hangout', '🎳', 350, 'bowling_alley') ] },
  alone: { icon: '🧘', name: 'Alone', text: 'Quiet cafes & scenic places', cats: [
    cat('amenity', 'cafe', 'Quiet cafe', '☕', 200, 'cafe'),
    cat('natural', 'beach', 'Beach', '🏖️', 50, 'tourist_attraction'),
    cat('tourism', 'viewpoint', 'Scenic place', '🌄', 0, 'tourist_attraction'),
    cat('leisure', 'park', 'Scenic park', '🌳', 20, 'park') ] }
};

// Built-in Madurai places. Used ONLY if live map data cannot load. Positions are approximate.
// spot(name, lat, lng, type, icon, ₹ per person, moods it suits, Wikipedia page name)
function spot(name, lat, lng, type, icon, cost, moods, wiki) {
  return { name: name, lat: lat, lng: lng, type: type, icon: icon, cost: cost, moods: moods.split(' '), wiki: wiki };
}
const MADURAI_PLACES = [
  spot('Meenakshi Amman Temple', 9.9195, 78.1193, 'Temple', '🛕', 0, 'happy relaxed sad alone', 'Meenakshi_Temple,_Madurai'),
  spot('Thirumalai Nayakkar Mahal', 9.9158, 78.1286, 'Palace', '🏛️', 50, 'happy romantic social', 'Thirumalai_Nayakkar_Palace'),
  spot('Gandhi Memorial Museum', 9.9333, 78.1366, 'Museum', '🏛️', 0, 'focused relaxed alone', 'Gandhi_Memorial_Museum'),
  spot('Teppakulam', 9.9300, 78.1450, 'Lake / tank', '💧', 0, 'happy relaxed romantic sad social', 'Mariamman_Teppakulam'),
  spot('Rajaji Park', 9.9320, 78.1370, 'Park', '🌳', 10, 'happy romantic relaxed alone', ''),
  spot('Alagar Kovil & hills', 10.0743, 78.2064, 'Hill / temple', '⛰️', 0, 'adventurous relaxed sad', 'Alagar_Koil'),
  spot('Thiruparankundram Hill Temple', 9.8786, 78.0711, 'Hill temple', '⛰️', 0, 'adventurous relaxed sad', 'Thiruparankundram'),
  spot('Yanaimalai (Elephant Hill)', 9.9857, 78.1822, 'Hill', '⛰️', 0, 'adventurous alone', 'Yanaimalai'),
  spot('Famous Jigarthanda', 9.9180, 78.1170, 'Dessert cafe', '☕', 80, 'happy', ''),
  spot('Kalaignar Centenary Library', 9.9470, 78.1440, 'Library', '📚', 0, 'focused alone', 'Kalaignar_Centenary_Library'),
  spot('Samanar Hills', 9.922325, 78.049018, 'Hill', '⛰️', 100, 'relaxed alone', ''),
  spot('Elite Cafe', 9.937309, 78.145251, 'Cafe', '☕', 100, 'happy romantic alone', ''),
  spot('Sundaram Park', 9.9338431, 78.1498581, 'Park', '🌳', 40, 'romantic alone', 'Sundaram_Park'),
  spot('Vishaal De Mall', 9.9389427, 78.1358690, 'mall', '🏛️', 100, 'happy romantic', 'Vishal_Mall) 
];

// Vehicles.
// fare = startFee + perKm × (km − freeKm)
// capacity = people per vehicle (bus = 1, so the bus fare is per person)
const VEHICLES = [
  { id: 'walk', icon: '🚶', name: 'Walk',      capacity: 99, speed: 5,  startFee: 0,  freeKm: 0,   perKm: 0 },
  { id: 'bike', icon: '🏍️', name: 'Bike',      capacity: 2,  speed: 30, startFee: 0,  freeKm: 0,   perKm: 3.5 },
  { id: 'auto', icon: '🛺', name: 'Auto',      capacity: 3,  speed: 22, startFee: 50, freeKm: 1.8, perKm: 18 },
  { id: 'car',  icon: '🚗', name: 'Cab / Car', capacity: 4,  speed: 28, startFee: 50, freeKm: 0,   perKm: 14 },
  { id: 'bus',  icon: '🚌', name: 'Bus',       capacity: 1,  speed: 18, startFee: 5,  freeKm: 0,   perKm: 1.2 }
];


/* =====================================================
   3. APP MEMORY (what the user has chosen so far)
   ===================================================== */
const state = {
  lat: HOME.lat,
  lng: HOME.lng,
  city: HOME.city,
  step: 1,            // which page is showing (1 to 4)
  mood: null,
  places: [],
  place: null,        // the place the user tapped
  people: 2,
  vehicle: 'walk',
  roundTrip: true,
  spendStyle: 1,      // 0.7 saver, 1 normal, 1.6 premium
  note: ''
};

let failReason = '';       // why no places were found
let toastTimer = null;
let locationReady = null;  // finishes when the location is known
let searchId = 0;          // lets us ignore old searches if the user taps another mood


/* =====================================================
   4. SMALL HELPER FUNCTIONS
   ===================================================== */

// Find an element by its id
function $(id) {
  return document.getElementById(id);
}

// Make text safe to put inside HTML
function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Show money like ₹1,250
function inr(amount) {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

// Show minutes like "25 min" or "1 h 10 min"
function showTime(minutes) {
  if (minutes < 60) {
    return Math.max(1, Math.round(minutes)) + ' min';
  }
  return Math.floor(minutes / 60) + ' h ' + Math.round(minutes % 60) + ' min';
}

// Straight-line distance in km between two points (haversine formula)
function distanceKm(lat1, lng1, lat2, lng2) {
  function toRad(degrees) { return degrees * Math.PI / 180; }
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 12742 * Math.asin(Math.sqrt(h));
}

// Show a small message at the bottom of the screen
function toast(message) {
  const box = $('toast');
  box.textContent = message;
  box.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { box.classList.remove('on'); }, 4500);
}

// Download JSON from a web address, and give up after timeoutMs
async function getJson(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, timeoutMs || 15000);
  try {
    const settings = Object.assign({}, options, { signal: controller.signal });
    const response = await fetch(url, settings);
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

// Switch to page number n (1 to 4)
function showStep(n) {
  state.step = n;
  const pages = document.querySelectorAll('.step');
  for (let i = 0; i < pages.length; i++) {
    pages[i].classList.toggle('on', i === n - 1);
  }
  const dots = document.querySelectorAll('.dots i');
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.toggle('on', i < n);
  }
  window.scrollTo(0, 0);
}

function findVehicle(id) {
  for (let i = 0; i < VEHICLES.length; i++) {
    if (VEHICLES[i].id === id) return VEHICLES[i];
  }
}


/* =====================================================
   5. WELCOME PAGE → APP
   (the Go button itself is handled by openApp() at the top)
   ===================================================== */

// Called by openApp() when Go is tapped: find the user's location
function startLocation() {
  if (!locationReady) {
    locationReady = findLocation();
  }
}

$('back').onclick = function () {
  if (state.step > 1) {
    showStep(state.step - 1);
  } else {
    // On the first page, Back returns to the welcome page
    $('home').classList.remove('hide');
    document.body.classList.add('lock');
  }
};


/* =====================================================
   6. LIVE LOCATION
   ===================================================== */

// Ask OpenStreetMap for the city name of our position
async function nameCity() {
  try {
    const url = 'https://nominatim.openstreetmap.org/reverse?format=json&zoom=12&lat=' + state.lat + '&lon=' + state.lng;
    const data = await getJson(url, {}, 6000);
    const a = data.address || {};
    state.city = a.city || a.town || a.village || a.suburb || a.county || 'your location';
  } catch (error) {
    state.city = 'your location';
  }
  $('loc').textContent = '📍 ' + state.city;
}

// Get the user's position. If that fails, use Madurai.
function findLocation() {
  $('loc').textContent = '📍 Locating…';

  return new Promise(function (done) {

    function useDefault() {
      state.lat = HOME.lat;
      state.lng = HOME.lng;
      state.city = HOME.city;
      $('loc').textContent = '📍 ' + state.city + ' (default)';
      toast('Location is off, so we are using ' + state.city + '. Allow location access and tap the pin to retry.');
      done();
    }

    if (!navigator.geolocation) {
      useDefault();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async function (position) {
        state.lat = position.coords.latitude;
        state.lng = position.coords.longitude;
        await nameCity();
        done();
      },
      useDefault,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

// Tapping the pin button tries the location again
$('loc').onclick = function () {
  locationReady = findLocation();
};


/* =====================================================
   7. PAGE 1 OF APP: CHOOSE A MOOD
   ===================================================== */
let moodButtons = '';
for (const key in MOODS) {
  const m = MOODS[key];
  moodButtons += '<button type="button" class="mood" onclick="chooseMood(\'' + key + '\')">' +
    '<b>' + m.icon + '</b><span>' + m.name + '</span><small>' + m.text + '</small></button>';
}
$('moods').innerHTML = moodButtons;

async function chooseMood(key) {
  state.mood = key;
  failReason = '';
  state.note = '';
  searchId = searchId + 1;
  const myId = searchId;
  const mood = MOODS[key];

  $('t2').textContent = mood.icon + ' ' + mood.name + ' places near ' + state.city;
  $('places').innerHTML = '';
  $('st').innerHTML = '<div class="spin"></div>Finding places near you…';
  showStep(2);

  await locationReady;                 // wait until we know where the user is
  if (myId !== searchId) return;       // user already tapped another mood
  $('t2').textContent = mood.icon + ' ' + mood.name + ' places near ' + state.city;

  state.places = await findPlaces(mood);
  if (myId !== searchId) return;

  if (state.places.length === 0) {
    let message = 'No places found.';
    if (failReason) {
      message += ' Reason: ' + esc(failReason) + '.';
    }
    $('st').innerHTML = message + ' <button type="button" class="ghost" id="retry" style="margin:0;padding:8px 18px">Try again</button>';
    $('retry').onclick = function () { chooseMood(key); };
    return;
  }

  $('st').textContent = state.note;
  showPlaces();
}


/* =====================================================
   8. FINDING NEARBY PLACES
   ===================================================== */

// Make one place object. km = straight distance × 1.3 (a rough road distance)
function makePlace(name, lat, lng, category, photo, wiki) {
  const straight = distanceKm(state.lat, state.lng, lat, lng);
  return {
    name: name,
    lat: lat,
    lng: lng,
    cat: category,
    photo: photo,
    wiki: wiki || '',
    km: Number((straight * 1.3).toFixed(1))
  };
}

// Keep the nearest places: at most 4 of each kind, 12 in total
function chooseBest(list) {
  list.sort(function (a, b) { return a.km - b.km; });
  const countPerKind = {};
  const result = [];
  for (let i = 0; i < list.length; i++) {
    const kind = list[i].cat.name;
    countPerKind[kind] = (countPerKind[kind] || 0) + 1;
    if (countPerKind[kind] <= 4 && result.length < 12) {
      result.push(list[i]);
    }
  }
  return result;
}

// Ask ONE OpenStreetMap server
async function askServer(url, query) {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query)
  };
  const data = await getJson(url, options, 20000);
  if (!data.elements || /error|timed out/i.test(data.remark || '')) {
    throw new Error('server busy');
  }
  return data;
}

// Search with OpenStreetMap (free, no key needed)
async function searchOSM(mood, radius) {
  // Build the question for the map server
  let query = '[out:json][timeout:20];(';
  for (let i = 0; i < mood.cats.length; i++) {
    const c = mood.cats[i];
    query += 'nwr["' + c.key + '"="' + c.value + '"]["name"](around:' + radius + ',' + state.lat + ',' + state.lng + ');';
  }
  query += ');out center 120;';

  // Ask all 3 servers at the same time and use the first good answer
  const requests = [];
  for (let i = 0; i < OVERPASS_SERVERS.length; i++) {
    requests.push(askServer(OVERPASS_SERVERS[i], query));
  }
  const data = await Promise.any(requests);

  // Turn the answer into our place objects
  const seen = {};
  const found = [];
  for (let i = 0; i < data.elements.length; i++) {
    const item = data.elements[i];
    const tags = item.tags;

    // Position: points have lat/lon, bigger places have a center
    let lat = item.lat;
    let lng = item.lon;
    if (lat == null && item.center) {
      lat = item.center.lat;
      lng = item.center.lon;
    }

    // Which of the mood's categories is this?
    let category = null;
    for (let j = 0; j < mood.cats.length; j++) {
      if (tags[mood.cats[j].key] === mood.cats[j].value) {
        category = mood.cats[j];
        break;
      }
    }
    if (!category || lat == null) continue;

    // Skip duplicates
    const id = tags.name + category.name;
    if (seen[id]) continue;
    seen[id] = true;

    // Photo: from Wikimedia Commons, or the "image" tag
    let photo = '';
    const commons = tags.wikimedia_commons || '';
    if (commons.toLowerCase().indexOf('file:') === 0) {
      photo = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(commons.slice(5)) + '?width=500';
    } else if ((tags.image || '').indexOf('https:') === 0) {
      photo = tags.image;
    }

    // Wikipedia page name (for a photo later)
    let wiki = '';
    if ((tags.wikipedia || '').indexOf('en:') === 0) {
      wiki = tags.wikipedia.slice(3);
    }

    found.push(makePlace(tags.name, lat, lng, category, photo, wiki));
  }
  return chooseBest(found);
}

// Search with Google Places (only used if GOOGLE_KEY is filled in)
async function searchGoogle(mood, radius) {
  // List each Google type once
  const types = [];
  for (let i = 0; i < mood.cats.length; i++) {
    if (types.indexOf(mood.cats[i].google) === -1) {
      types.push(mood.cats[i].google);
    }
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_KEY,
      'X-Goog-FieldMask': 'places.displayName,places.location,places.rating,places.photos,places.types'
    },
    body: JSON.stringify({
      includedTypes: types,
      maxResultCount: 20,
      rankPreference: 'DISTANCE',
      locationRestriction: {
        circle: { center: { latitude: state.lat, longitude: state.lng }, radius: Math.min(radius, 50000) }
      }
    })
  };
  const data = await getJson('https://places.googleapis.com/v1/places:searchNearby', options);

  const googlePlaces = data.places || [];
  const found = [];
  for (let i = 0; i < googlePlaces.length; i++) {
    const g = googlePlaces[i];

    // Which category matches Google's types? (use the first one if none match)
    let category = mood.cats[0];
    for (let j = 0; j < mood.cats.length; j++) {
      if (g.types && g.types.indexOf(mood.cats[j].google) !== -1) {
        category = mood.cats[j];
        break;
      }
    }

    let photo = '';
    if (g.photos && g.photos.length > 0) {
      photo = 'https://places.googleapis.com/v1/' + g.photos[0].name + '/media?maxHeightPx=500&key=' + GOOGLE_KEY;
    }

    const place = makePlace(g.displayName.text, g.location.latitude, g.location.longitude, category, photo, '');
    place.rating = g.rating;
    found.push(place);
  }
  return chooseBest(found);
}

// Built-in list. Works only when the user is near Madurai.
function offlineList() {
  if (distanceKm(state.lat, state.lng, HOME.lat, HOME.lng) > 80) {
    return [];
  }
  const found = [];
  for (let i = 0; i < MADURAI_PLACES.length; i++) {
    const s = MADURAI_PLACES[i];
    if (s.moods.indexOf(state.mood) === -1) continue;
    const category = { name: s.type, icon: s.icon, cost: s.cost };
    const place = makePlace(s.name, s.lat, s.lng, category, '', s.wiki);
    place.q = s.name + ', Madurai';   // used for the Google Maps links
    found.push(place);
  }
  return chooseBest(found);
}

// Find places: search near, then wider (4 km, 12 km, 30 km) until we have at least 6
async function findPlaces(mood) {
  let list = [];
  try {
    const radii = [4000, 12000, 30000];
    for (let i = 0; i < radii.length; i++) {
      if (GOOGLE_KEY) {
        try {
          list = await searchGoogle(mood, radii[i]);
        } catch (error) {
          list = await searchOSM(mood, radii[i]);   // Google failed, use OpenStreetMap
        }
      } else {
        list = await searchOSM(mood, radii[i]);
      }
      if (list.length >= 6) break;
    }
  } catch (error) {
    console.warn(error);
    failReason = 'live map servers did not answer';
  }

  // Nothing found? Use the built-in list.
  if (list.length === 0) {
    list = offlineList();
    if (list.length > 0) {
      state.note = 'Live map data could not be loaded, so you are seeing our built-in Madurai list (positions are approximate).';
    }
  }
  return list;
}


/* =====================================================
   9. SHOW THE PLACE CARDS
   ===================================================== */

// Text used to search a place on Google Maps
function mapSearchText(place) {
  return encodeURIComponent(place.q || (place.name + ' ' + place.lat + ',' + place.lng));
}

// Where Google Maps directions should go
function mapDestination(place) {
  if (place.q) return encodeURIComponent(place.q);
  return place.lat + ',' + place.lng;
}

function showPlaces() {
  const list = state.places;
  let html = '';

  for (let i = 0; i < list.length; i++) {
    const p = list[i];

    let photoTag = '';
    if (p.photo) {
      photoTag = '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy" onerror="this.remove()">';
    }

    let ratingText = '';
    if (p.rating) {
      ratingText = ' · ⭐ ' + p.rating;
    }

    let costText = 'free entry';
    if (p.cat.cost) {
      costText = 'about ' + inr(p.cat.cost) + ' per person';
    }

    html += '<article class="place" data-i="' + i + '" tabindex="0" onclick="choosePlaceIndex(' + i + ')" ' +
              'onkeydown="if (event.target === this && event.key === \'Enter\') choosePlaceIndex(' + i + ')">' +
              '<div class="ph">' + p.cat.icon + photoTag + '</div>' +
              '<div class="pb">' +
                '<span class="tag">' + p.cat.icon + ' ' + p.cat.name + '</span>' +
                '<h3>' + esc(p.name) + '</h3>' +
                '<p>≈ ' + p.km + ' km away' + ratingText + ' · ' + costText + '</p>' +
                '<a href="https://www.google.com/maps/search/?api=1&query=' + mapSearchText(p) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">📷 See photos on Google Maps</a>' +
              '</div>' +
            '</article>';
  }
  $('places').innerHTML = html;

  // Load Wikipedia photos for places that have a Wikipedia page
  for (let i = 0; i < list.length; i++) {
    loadWikiPhoto(list, i);
  }
}

async function loadWikiPhoto(list, i) {
  const p = list[i];
  if (p.photo || !p.wiki) return;
  try {
    const data = await getJson('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(p.wiki), {}, 10000);
    const box = document.querySelector('.place[data-i="' + i + '"] .ph');
    if (data.thumbnail && box && list === state.places) {
      box.insertAdjacentHTML('beforeend', '<img src="' + esc(data.thumbnail.source) + '" alt="' + esc(p.name) + '" loading="lazy" onerror="this.remove()">');
    }
  } catch (error) {
    // no photo available, that is fine
  }
}

// The user tapped a place card
function choosePlaceIndex(i) {
  state.place = state.places[i];
  state.vehicle = bestVehicle();
  showTrip();
  showStep(3);
}


/* =====================================================
   10. PLAN THE TRIP: PEOPLE, VEHICLE, OPTIONS
   ===================================================== */

// Price of ONE vehicle, ONE way
function fare(vehicle) {
  const paidKm = Math.max(0, state.place.km - vehicle.freeKm);
  return vehicle.startFee + vehicle.perKm * paidKm;
}

// Total travel cost for everyone (more vehicles for bigger groups, doubled for a return trip)
function travelCost(vehicle) {
  const vehiclesNeeded = Math.ceil(state.people / vehicle.capacity);
  let total = vehiclesNeeded * fare(vehicle);
  if (state.roundTrip) {
    total = total * 2;
  }
  return total;
}

// Suggest the best vehicle for the distance and group size
function bestVehicle() {
  const km = state.place.km;
  if (km <= 1.5) return 'walk';
  if (km <= 6) {
    if (state.people <= 2) return 'bike';
    return 'auto';
  }
  if (state.people <= 4) return 'car';
  return 'bus';
}

function showTrip() {
  const p = state.place;
  const bestId = bestVehicle();
  const best = findVehicle(bestId);

  // The place at the top
  $('pl').innerHTML = '<div class="big">' + p.cat.icon + '</div>' +
    '<div><h3>' + esc(p.name) + '</h3><p>' + p.cat.name + ' · ≈ ' + p.km + ' km from you</p></div>';

  $('ppl').textContent = state.people;

  // The advice box
  let advice;
  if (bestId === 'walk') {
    advice = '🚶 It is only <b>' + p.km + ' km</b>, so walking is the best choice (about ' + showTime(p.km / 5 * 60) + '). It is free and you enjoy the way.';
  } else {
    let word = 'people';
    if (state.people === 1) word = 'person';
    advice = '💡 <b>' + p.km + ' km</b> is too far to walk comfortably. For <b>' + state.people + '</b> ' + word + ' we suggest <b>' + best.icon + ' ' + best.name + '</b>.';
    if (state.vehicle === 'walk' && p.km > 3) {
      advice += ' Walking will take ' + showTime(p.km / 5 * 60) + ' each way.';
    }
  }
  $('adv').innerHTML = advice;

  // The vehicle buttons
  let tripWord = 'one way';
  if (state.roundTrip) tripWord = 'round trip';

  let html = '';
  for (let i = 0; i < VEHICLES.length; i++) {
    const v = VEHICLES[i];
    let selected = '';
    if (v.id === state.vehicle) selected = ' on';
    let badge = '';
    if (v.id === bestId) badge = '<em>Best for you</em>';

    html += '<button type="button" class="veh' + selected + '" onclick="chooseVehicle(\'' + v.id + '\')">' +
              badge + '<b>' + v.icon + '</b><span>' + v.name + '</span>' +
              '<small>' + inr(travelCost(v)) + ' ' + tripWord + '<br>' + showTime(p.km / v.speed * 60) + ' one way</small>' +
            '</button>';
  }
  $('veh').innerHTML = html;
}

function chooseVehicle(id) {
  state.vehicle = id;
  showTrip();
}

$('minus').onclick = function () {
  state.people = Math.max(1, state.people - 1);
  showTrip();
};
$('plus').onclick = function () {
  state.people = Math.min(30, state.people + 1);
  showTrip();
};
$('rt').onchange = function () {
  state.roundTrip = $('rt').checked;
  showTrip();
};
$('sty').onchange = function () {
  state.spendStyle = Number($('sty').value);
};
$('toBudget').onclick = function () {
  showBudget();
  showStep(4);
};


/* =====================================================
   11. FINAL BUDGET
   ===================================================== */
function showBudget() {
  const p = state.place;
  const v = findVehicle(state.vehicle);
  const vehiclesNeeded = Math.ceil(state.people / v.capacity);

  const travel = travelCost(v);
  const spend = p.cat.cost * state.people * state.spendStyle;   // food and entry
  const extra = (travel + spend) * 0.1;                         // 10% extra
  const total = travel + spend + extra;

  // Labels
  let vehicleLabel = vehiclesNeeded + ' × ' + v.name;
  if (v.id === 'walk') vehicleLabel = 'Walk';
  if (v.id === 'bus') vehicleLabel = 'Bus (per person)';

  let tripsText = ', one way';
  if (state.roundTrip) tripsText = ' × 2 trips';

  let styleName = 'Normal';
  if (state.spendStyle === 0.7) styleName = 'Saver';
  if (state.spendStyle === 1.6) styleName = 'Premium';

  let foodLabel = 'Entry & activities (free)';
  if (p.cat.cost) {
    foodLabel = 'Food & entry (' + inr(p.cat.cost * state.spendStyle) + ' × ' + state.people + ', ' + styleName + ')';
  }

  $('sum').innerHTML =
    '<div class="row"><span>Place</span><b>' + p.cat.icon + ' ' + esc(p.name) + '</b></div>' +
    '<div class="row"><span>Distance</span><b>≈ ' + p.km + ' km one way</b></div>' +
    '<div class="row"><span>People</span><b>' + state.people + '</b></div>' +
    '<div class="row"><span>Vehicle</span><b>' + v.icon + ' ' + vehicleLabel + ' · ' + showTime(p.km / v.speed * 60) + ' one way</b></div>' +
    '<div class="row"><span>Travel (' + vehiclesNeeded + ' × ' + inr(fare(v)) + tripsText + ')</span><b>' + inr(travel) + '</b></div>' +
    '<div class="row"><span>' + foodLabel + '</span><b>' + inr(spend) + '</b></div>' +
    '<div class="row"><span>Extra spending (10%)</span><b>' + inr(extra) + '</b></div>' +
    '<div class="total"><small>Final budget</small><big>' + inr(total) + '</big><small>' + inr(total / state.people) + ' per person</small></div>';

  // Google Maps directions button
  const travelModes = { walk: 'walking', bike: 'two-wheeler', auto: 'driving', car: 'driving', bus: 'transit' };
  $('dir').href = 'https://www.google.com/maps/dir/?api=1&origin=' + state.lat + ',' + state.lng +
                  '&destination=' + mapDestination(p) + '&travelmode=' + travelModes[v.id];
}

$('again').onclick = function () {
  showStep(1);
};
