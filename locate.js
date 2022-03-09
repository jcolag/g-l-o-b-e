const earth = 24859.734;
let previousCountry = -1;
let distanceSoFar = 0;
let dclass = '';

window.addEventListener('load', (e) => {
  const input = document.getElementById('user-guess');
  input.addEventListener('input', handleKey);
  input.addEventListener('keypress', handleInput);
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
  distanceSoFar += miles;
  previousCountry = countryId;
}
