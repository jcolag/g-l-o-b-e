const fs = require('fs');
const path = require('path');

const countries = JSON.parse(fs.readFileSync('countries.json'));
const nCountries = countries.length;
const mapping = countries
  .map((c) => ({
    emoji: c.emoji,
    iso: c.iso2,
    latitude: c.latitude,
    longitude: c.longitude,
    translations: Object.assign(c.translations, { en: c.name }),
  }));
let index;
let target;
let svg = null;

while (svg === null) {
  index = Math.floor(Math.random() * nCountries);
  target = countries[index];
  const mapFile = path.join('maps', `${target.iso2.toLowerCase()}.svg`);

  if (fs.existsSync(mapFile)) {
    svg = fs.readFileSync(mapFile);
  }
}

const head = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
  '<link rel="stylesheet" href="style.css"><script>const countries = ' +
  JSON.stringify(mapping, ' ', 2) +
  `;targetCountry = ${index};lang = "en";` +
  '</script><script src="locate.js"></script>' +
  '<title>G.L.O.B.E.!</title></head><body>' +
  '<h1>G.L.O.B.E.</h1><div><b>G</b>eo-<b>L</b>ocate <b>O</b>bjects ' +
  '<b>B</b>efore <b>E</b>nemies!</div>';
const form = '<div id="guesses"></div><div class="form">' +
  '<input id="user-guess" type="text" list="suggest"></input>' +
  '<datalist id="suggest"></datalist></form></div>';
const foot = '</body><//html>';

const html = head + svg + form + foot;

fs.writeFileSync('play.html', html);

