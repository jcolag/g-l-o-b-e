# GLOBE
A generator for daily scavenger hunt puzzles

**G**eo-**L**ocate **O**bjects **B**efore **E**nemies!

The name is unfortunately more adventurous than the game-play.  Each turn, you can guess which country that you're looking for.  You will be told how far away the center of your guess is from the center of the target country, as well as the direction to travel.

The version in my head---which may potentially become part of the game, someday---is that you must find your target country before the "enemy" can do so, probably measured in total miles traveled.

## Localization

At this time, the game is in English.  However, if you set the `lang` variable to the two-letter ISO code for your language/country (br, cn, de, en, es, fa, fr, hr, it, ja, kr, nl, or pt, at this time) in your browser's JavaScript console, the game will accept and print country names in that language.

Eventually, the game will get a drop-down menu for languages---and probably units of distance, too, so metric people aren't stuck wondering what a "mile" is---but translating *should* change the title of the game and any additional verbiage that appears, too.

## Dependencies

This game couldn't work without the `countries.json` file from [**Countries States Cities Database**](https://github.com/dr5hn/countries-states-cities-database) under the terms of the OdBL 1.0, or the somewhat-stale [**Maps Icons**](https://github.com/djaiss/mapsicon) with its custom attribution license.

