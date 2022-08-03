const earth = 24859.734;
const detective = '🕵️';
const zwj = '\u200D';
const skin = [ '🏻', '🏼', '🏽', '🏾', '🏿' ];
const gender = [ '♀️', '♂️' ];
let previousCountry = -1;
let distanceSoFar = 0;
let dclass = '';
let lostGame = false;

window.addEventListener('load', (e) => {
  const input = document.getElementById('user-guess');
  input.addEventListener('input', handleKey);
  input.addEventListener('keypress', handleInput);
  document.getElementById('user-guess').focus();
});

function handleKey(event) {
  const input = document.getElementById('user-guess');
  const suggest = document.getElementById('suggest');
  const typed = input.value;
  const matches = countries.filter((c) =>
    c.translations[lang].toLowerCase().indexOf(typed.toLowerCase()) >= 0
  );

  suggest.innerHTML = '';
  matches.forEach((country) => {
    const option = document.createElement('option');
    option.value = country.translations[lang];
    option.text = country.translations[lang];
    suggest.appendChild(option);
  });
}

function handleInput(event) {
  if (event.code !== "Enter") {
    return;
  }

  const input = document.getElementById('user-guess');
  const guesses = document.getElementById('guesses');
  const target = countries[targetCountry];
  const guess = countries.filter(
    (c) => c.translations[lang].toLowerCase() === input.value.toLowerCase()
  );

  if (guess.length === 0) {
    guesses.innerHTML += '<div class="error">&ldquo;<b>' +
      `${input.value}</b>&rdquo; was not recognized as a country.</div>`;
    input.value = '';
    return;
  }

  const name = guess[0].translations[lang];
  const whichCountry = countries.indexOf(guess[0]);
  const distance = getDistanceBetweenCountries(target, guess[0]);
  const miles = Math.trunc(distance * 100 / 1.609344 + 0.5) / 100;
  const bearing = getDirectionBetweenCountries(target, guess[0]);
  let arrow = directionArrow(bearing);

  if (distance < 1) {
    arrow = '🎯';
    input.classList.add('hidden');
  }

  updateTravel(whichCountry);
  if (distanceSoFar > earth && !lostGame) {
    lostGame = true;
    guesses.innerHTML += '<div class="update">' +
      enemy() +
      ' The E.N.E.M.Y. agent found the artifact before you did,' +
      ' but keep playing to find out where.';
  }

  guesses.innerHTML += '<div class="update">' +
    `<div class="names">${name}</div>` +
    `<div class="flag">${guess[0].emoji}</div>` +
    `<div class="distance">${miles}mi</div>` +
    `<div class="direction">${arrow}</div>` +
    `<div class="total-distance ${dclass}">${distanceSoFar}mi traveled</div>` +
    '</div>';
  input.value = '';
}

function directionArrow(angle) {
  let degree = (angle * 180 / Math.PI + 540) % 360;

  if (degree < 22.5) {
    return '⬆️';
  } else if (degree < 67.5) {
    return '↗️';
  } else if (degree < 112.5) {
    return '➡️';
  } else if (degree < 157.5) {
    return '↘️';
  } else if (degree < 202.5) {
    return '⬇️';
  } else if (degree < 247.5) {
    return '↙️';
  } else if (degree < 292.5) {
    return '⬅️';
  } else if (degree < 337.5) {
    return '↖️';
  } else {
    return '⬆️';
  }
}

function getDirectionBetweenCountries(c1, c2) {
  const lat1 = deg2rad(c1.latitude);
  const lat2 = deg2rad(c2.latitude);
  const long1 = deg2rad(c1.longitude);
  const long2 = deg2rad(c2.longitude);
  const x = Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(long2 - long1);
  const y = Math.sin(long2 - long1) * Math.cos(lat2);

  return Math.atan2(y, x);
}

function getDistanceBetweenCountries(c1, c2) {
  return getDistanceBetweenPoints(
    c1.latitude,
    c1.longitude,
    c2.latitude,
    c2.longitude
  );
}

// Returns the distance in kilometers.
function getDistanceBetweenPoints(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);  // deg2rad below
  var dLon = deg2rad(lon2 - lon1); 
  var a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function updateTravel(countryId) {
  if (previousCountry < 0) {
    previousCountry = countryId;
    return;
  }

  const distance = getDistanceBetweenCountries(
    countries[previousCountry],
    countries[countryId]
  );
  const miles = Math.trunc(distance * 100 / 1.609344 + 0.5) / 100;
  distanceSoFar = Math.trunc(100 * (distanceSoFar + miles)) / 100;

  if (distanceSoFar / earth < 0.34) {
    dclass = 'status-good';
  } else if (distanceSoFar / earth < 0.67) {
    dclass = 'status-ok';
  } else if (distanceSoFar / earth < 1) {
    dclass = 'status-worry';
  } else {
    dclass = 'status-fail';
  }

  previousCountry = countryId;
}

function enemy() {
  const s = Math.floor(Math.random() * (skin.length + 1));
  const g = Math.floor(Math.random() * (gender.length + 1));

  return detective +
    (s === skin.length ? '' : skin[s]) +
    (g === gender.length ? '' : (zwj + gender[g])) +
    '\uFE0F';
}

function params() {
  var p = {};
  var parts = window.location.href
    .replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,k,v) {
      p[k] = v;
    });
  return p;
}

// From https://stackoverflow.com/a/47593316/3438854
function cyrb128(str) {
  let h1 = 1779033703,
      h2 = 3144134277,
      h3 = 1013904242,
      h4 = 2773480762;

  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }

  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);

  return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}
