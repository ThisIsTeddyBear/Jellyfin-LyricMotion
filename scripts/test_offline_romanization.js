'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const romanizerSource = fs.readFileSync(path.join(root, 'src', 'jellyfin-lyric-romanizer.js'), 'utf8');
const mainSource = fs.readFileSync(path.join(root, 'src', 'jellyfin-lyric-motion.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src', 'jellyfin-lyric-motion.css'), 'utf8');
const installSh = fs.readFileSync(path.join(root, 'scripts', 'install.sh'), 'utf8');
const installPs = fs.readFileSync(path.join(root, 'scripts', 'install.ps1'), 'utf8');
const dockerfile = fs.readFileSync(path.join(root, 'docker', 'Dockerfile'), 'utf8');

let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }
function eq(actual, expected, message) { assert.strictEqual(actual, expected, message); assertions += 1; }

const forbidden = [
    /translate\.googleapis\.com/i,
    /lyrics-api\.binimum\.org/i,
    /lyricsplus\.binimum\.org/i,
    /kpoe/i,
    /BiniLyrics/i,
    /Google[- ]?dt[-=]?rm/i,
    /romanization-sources\.js/i
];
for (const [name, source] of Object.entries({ romanizerSource, mainSource, installSh, installPs, dockerfile })) {
    for (const pattern of forbidden) {
        ok(!pattern.test(source), `${name} excludes remote/provider Romanization dependency ${pattern}`);
    }
}
ok(!/\bfetch\s*\(/.test(romanizerSource), 'Romanizer itself cannot perform network I/O');
ok(!/XMLHttpRequest|WebSocket|EventSource/.test(romanizerSource), 'Romanizer has no alternate network transport');
ok(!fs.existsSync(path.join(root, 'src', 'jellyfin-lyric-romanization-sources.js')), 'legacy remote adapter is absent from package source');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(romanizerSource, context);
const romanizer = context.window.JellyfinLyricRomanizer;
eq(romanizer.version, '5.1.0', 'offline engine version');
ok(romanizer.offlineOnly, 'offline contract exported');

const corpus = [
    'മറഞ്ഞു പോയതോ എങ്ങനെ', 'കാറ്റിൻ തൂവൽ പോലെ മെല്ലെ തഴുകാനേ', 'മോഹം പൂത്തെൻ നെഞ്ചിനുള്ളിൽ മഴ പോലെ', 'ഇടിമിന്നലാടി നിനക്കെന്താ പേടി', 'കതക് അടച്ചോടി അടുത്തു നീ വാടി',
    'என் மனதில் ஒரு கனவு', 'மழையில் நனைந்தேன்', 'சின்ன சின்ன ஆசை',
    'నా హృదయంలో ప్రేమ ఉంది', 'నిన్ను ప్రేమిస్తున్నాను', 'నీ కళ్లలో ప్రేమ',
    'ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ', 'ನನ್ನ ಮನಸು ನಿನ್ನದು', 'ಕನ್ನಡ ಹಾಡು', 'ಸಂವಾದ ಸಂಸ್ಕಾರ',
    'ਮੁੰਡਾ ਸਾਡਾ', 'ਅੱਖੀਆਂ ਵਿਚ ਤੂੰ', 'ਰੱਬ ਜਾਣੇ', 'ਕੁੜੀ ਚੜ੍ਹਦਾ ਖੁਸ਼',
    'ज़िंदगी में क्यों नहीं', 'मुझे तुमसे प्यार है', 'मिलकर चलते हैं',
    'সংগীত আমার জীবন', 'আমি তোমাকে ভালোবাসি', 'অসমীয়া গান',
    'મારી આંખોમાં તું છે', 'પ્રેમ એક સફર છે', 'ગુજરાતી ગીત',
    'ଓଡ଼ିଆ ଗୀତ', 'ମୁଁ ତୁମେ ପ୍ରେମ',
    'دل میں محبت ہے', 'زندگی ایک سفر ہے', 'رب جانے'
];

for (let round = 0; round < 20; round += 1) {
    for (const input of corpus) {
        const first = romanizer.romanize(input);
        const second = romanizer.romanize(input);
        eq(second, first, `deterministic offline result round ${round}: ${input}`);
        ok(first.length > 0, `non-empty result round ${round}: ${input}`);
        ok(!/[\u0900-\u0D7F]/u.test(first), `Indic source script removed round ${round}: ${input}`);
    }
}

/* A generous non-benchmark guard catches accidental exponential alignment or
 * whole-dataset work on every lyric call without making CI dependent on CPU. */
const start = Date.now();
for (let i = 0; i < 4000; i += 1) {
    romanizer.romanize(corpus[i % corpus.length]);
}
const elapsed = Date.now() - start;
ok(elapsed < 10000, `4000 cached-size lyric conversions stay bounded (${elapsed} ms)`);

/* Normal UI exposes exactly the requested feature controls: one Romanize
 * button plus one timing-offset group. There is no source-policy button. */
ok(mainSource.includes("button.className = 'ak-romanization-toggle'"), 'Romanize control exists');
ok(mainSource.includes("controls.className = 'lyrics-timing-controls ak-lyrics-timing-controls'"), 'timing offset control exists');
ok(!/romanization-quality|quality-toggle|smart-mode|offline-mode/i.test(mainSource + css), 'no Smart/Offline source-policy control remains');
ok((css.match(/\.lyricPage \.ak-romanization-toggle/g) || []).length >= 1, 'Romanize styling exists');
ok((css.match(/\.ak-lyrics-timing-controls/g) || []).length >= 1, 'timing styling exists');

console.log(`Offline Romanization isolation/stress: ${assertions} assertions passed (${elapsed} ms stress pass).`);
