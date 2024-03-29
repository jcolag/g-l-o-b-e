const units = {
  R: {
    name: 'Earth Radii',
    ratio: 3958.75,
  },
  f: {
    name: 'Furlongs',
    ratio: 0.125,
  },
  km: {
    name: 'Kilometers',
    ratio: 0.6,
  },
  mi: {
    name: 'Miles',
    ratio: 1,
  },
  l: {
    name: 'Nautical Leagues',
    ratio: 3.452,
  },
  m: {
    name: 'Nautical Miles',
    ratio: 1.151,
  },
};
const earth = 24859.734;
const detective = '🕵️';
const zwj = '\u200D';
const skin = [ '🏻', '🏼', '🏽', '🏾', '🏿' ];
const gender = [ '♀️', '♂️' ];
const query = params();
const day = Math.floor(Date.now() / 86400000);
const storedSeed = localStorage.getItem('seed');
const seedSet = localStorage.getItem('seedSet');
const langSet = localStorage.getItem('langSet');
const unitSet = localStorage.getItem('unitSet');
let needRestart = false;
let lang = langSet === null ? 'en' : langSet;
let unit = unitSet === null ? 'mi' : unitSet;
let when = Object.prototype.hasOwnProperty.call(query, 'date')
  && !Number.isNaN(Date.parse(query['date']))
    ? new Date(query['date'])
    : new Date();

if (Object.prototype.hasOwnProperty.call(query, 'lang')) {
  lang = query['lang'];
}

if (Object.prototype.hasOwnProperty.call(query, 'unit')) {
  lang = query['unit'];
}

if (when > new Date()) {
  when = new Date();
} else if (Math.abs(Date.now() - when.valueOf()) > 10000) {
  when = new Date(when.setMinutes(when.getTimezoneOffset()));
}

when = when.toDateString();
if (storedSeed !== null) {
  let stext = storedSeed;

  if (Number(seedSet) === day) {
    if (storedSeed.indexOf(':') >= 0) {
      stext = new Date(Number(storedSeed)).toString();
    }

    when = stext;
  }
}

const seed = cyrb128(when);
const random = sfc32(seed[0], seed[1], seed[2], seed[3]);
let countries = {};
let mapping = {};
let previousCountry = -1;
let distanceSoFar = 0;
let dclass = '';
let lostGame = false;
let targetCountry = -1;

window.addEventListener('load', (e) => {
  const config = document.getElementById('config-modal');
  const openConfig = document.getElementById('config');
  const closeConfig = document.getElementById('close-config');
  const datePick = document.getElementById('target-game');
  const langPick = document.getElementById('language-select');
  const unitPick = document.getElementById('unit-select');
  const today = new Date().toISOString().split('T')[0];

  translate(lang);
  langPick.value = lang;
  datePick.max = today;
  openConfig.addEventListener(
    'click', () => config.classList.remove('hidden-modal')
  );
  closeConfig.addEventListener(
    'click', () => {
      config.classList.add('hidden-modal');
      if (needRestart) {
        window.location.reload();
      }
    }
  );
  Object.keys(units).forEach((k) => {
    const option = document.createElement('option');

    option.value = k;
    option.text = units[k].name;
    unitPick.appendChild(option);
  });
  unitPick.value = unit;
  fetch('./countries.json')
    .then(readJson);
});

function readJson(response) {
  response.arrayBuffer()
    .then(startGame);
}

function startGame(jsonBytes) {
  const input = document.getElementById('user-guess');
  const border = document.getElementById('country-svg');
  const decoder = new TextDecoder('utf-8');
  const json = decoder.decode(jsonBytes);
  countries = JSON.parse(json);
  targetCountry = Math.floor(random() * countries.length);
  border.src = './maps/'
    + countries[targetCountry].iso2.toLowerCase()
    + '.svg';
  input.addEventListener('input', handleKey);
  input.addEventListener('keypress', handleInput);
  document.getElementById('user-guess').focus();
  mapping = countries
    .map((c) => ({
      emoji: c.emoji,
      iso: c.iso2,
      latitude: c.latitude,
      longitude: c.longitude,
      translations: Object.assign(c.translations, { en: c.name }),
    }));
}

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
    guesses.innerHTML += '<div class="error">' +
      languages[lang]['bad-guess'].replaceAll('xxx', input.value) +
      '</div>';
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
      enemy() + '&nbsp;' +
      languages[lang]['game-over'];
  }

  const u = units[unit];
  const dist = Math.floor(miles * 100 / u.ratio) / 100;
  const total = distanceSoFar / u.ratio;
  guesses.innerHTML += '<div class="update">' +
    `<div class="names">${name}</div>` +
    `<div class="flag">${guess[0].emoji}</div>` +
    `<div class="distance">${dist}${unit}</div>` +
    `<div class="direction">${arrow}</div>` +
    `<div class="total-distance ${dclass}">${total} ${u.name} traveled</div>` +
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
  const s = Math.floor(random() * (skin.length + 1));
  const g = Math.floor(random() * (gender.length + 1));

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

function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

function setSeed(seed) {
  localStorage.setItem('seed', seed);
  localStorage.setItem('seedSet', Math.floor(Date.now() / 86400000));
  needRestart = true;
}

function dateSet() {
  const datePick = document.getElementById('target-game');
  const newDate = new Date(datePick.value);
  const when = new Date(newDate.setMinutes(newDate.getTimezoneOffset()));

  setSeed(when.toDateString());
}

function updateGame() {
  setSeed(Date.now().toString());
}

function updateLanguage() {
  const langPick = document.getElementById('language-select');
  const lang = langPick.value;
  localStorage.setItem('langSet', lang);
  needRestart = true;
}

function updateUnit() {
  const unitPick = document.getElementById('unit-select');
  const u = unitPick.value;
  localStorage.setItem('unitSet', u);
  needRestart = true;
}

function translate(l) {
  const xlat = languages[l];

  Object.keys(xlat).forEach((k) => {
    const widget = document.getElementById(k);

    if (widget === null) {
      return;
    }

    widget.innerHTML = xlat[k];
  });
}
