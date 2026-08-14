'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src', 'jellyfin-lyric-romanizer.js'), 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);
const romanizer = context.window.JellyfinLyricRomanizer;
assert(romanizer, 'romanizer API missing');

let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }
function eq(actual, expected, message) { assert.strictEqual(actual, expected, message); assertions += 1; }

/* Exhaust every code point in the Indic blocks used by the local engines.
 * Unassigned code points and punctuation are deliberately included: malformed
 * or unusual lyric text must never throw or create runaway output. */
const blocks = [
    ['Devanagari', 0x0900, 0x097f],
    ['Bengali-Assamese', 0x0980, 0x09ff],
    ['Gurmukhi', 0x0a00, 0x0a7f],
    ['Gujarati', 0x0a80, 0x0aff],
    ['Odia', 0x0b00, 0x0b7f],
    ['Tamil', 0x0b80, 0x0bff],
    ['Telugu', 0x0c00, 0x0c7f],
    ['Kannada', 0x0c80, 0x0cff],
    ['Malayalam', 0x0d00, 0x0d7f],
    ['Urdu-Shahmukhi', 0x0600, 0x06ff]
];

for (const [name, start, end] of blocks) {
    for (let cp = start; cp <= end; cp += 1) {
        const input = String.fromCodePoint(cp);
        const once = romanizer.romanize(input);
        const twice = romanizer.romanize(input);
        ok(typeof once === 'string', `${name} U+${cp.toString(16)} returns a string`);
        eq(once, twice, `${name} U+${cp.toString(16)} is deterministic`);
        ok(once.length <= 64, `${name} U+${cp.toString(16)} output remains bounded`);
        ok(!once.includes('\u0000'), `${name} U+${cp.toString(16)} never emits NUL`);
    }
}

const timedSamples = [
    'मुंडा सदा डोली चढ़ गया',
    'ਪੰਜਾਬੀ ਮੁੰਡਾ ਸਾਡਾ',
    'മറഞ്ഞു പോയതോ എങ്ങനെ',
    'வணக்கம் காதலே',
    'తెలుగు పాట',
    'ಕನ್ನಡ ಹಾಡು',
    'বাংলা গান',
    'অসমীয়া গান',
    'ગુજરાતી ગીત',
    'ଓଡ଼ିଆ ଗୀତ'
];

for (const input of timedSamples) {
    const output = romanizer.romanize(input);
    let previousStart = -1;
    let previousEnd = -1;
    for (let index = 0; index <= input.length; index += 1) {
        const start = romanizer.mapBoundary(input, index, 'start');
        const end = romanizer.mapBoundary(input, index, 'end');
        ok(Number.isFinite(start) && start >= 0 && start <= output.length, `start boundary in range for ${input} @ ${index}`);
        ok(Number.isFinite(end) && end >= 0 && end <= output.length, `end boundary in range for ${input} @ ${index}`);
        ok(start >= previousStart, `start boundary monotonic for ${input} @ ${index}`);
        ok(end >= previousEnd, `end boundary monotonic for ${input} @ ${index}`);
        previousStart = start;
        previousEnd = end;
    }
}

/* Jellyfin lyric payloads can contain canonically equivalent decomposed Indic
 * vowel signs. romanize() normalizes to NFC for linguistic processing, but
 * mapBoundary() must keep using the original UTF-16 coordinate system so ELRC
 * cue positions do not drift when NFC changes string length. */
const normalizationSamples = [
    ['Malayalam', 'ക\u0d46\u0d3e'],
    ['Tamil', 'க\u0bc6\u0bbe'],
    ['Bengali', 'ক\u09c7\u09be'],
    ['Odia', 'କ\u0b47\u0b3e'],
    ['Kannada', 'ಕ\u0cc6\u0cc2']
];

for (const [name, input] of normalizationSamples) {
    const normalized = input.normalize('NFC');
    ok(input.length !== normalized.length, `${name} normalization fixture changes UTF-16 length`);
    eq(romanizer.romanize(input), romanizer.romanize(normalized), `${name} decomposed and NFC forms romanize identically`);

    const output = romanizer.romanize(input);
    let previousStart = -1;
    let previousEnd = -1;
    for (let index = 0; index <= input.length; index += 1) {
        const start = romanizer.mapBoundary(input, index, 'start');
        const end = romanizer.mapBoundary(input, index, 'end');
        ok(Number.isFinite(start) && start >= 0 && start <= output.length, `${name} decomposed start boundary in range @ ${index}`);
        ok(Number.isFinite(end) && end >= 0 && end <= output.length, `${name} decomposed end boundary in range @ ${index}`);
        ok(start >= previousStart, `${name} decomposed start boundary monotonic @ ${index}`);
        ok(end >= previousEnd, `${name} decomposed end boundary monotonic @ ${index}`);
        previousStart = start;
        previousEnd = end;
    }
}

/* Deterministic mixed-script fuzz. This intentionally combines marks, spaces,
 * punctuation and scripts that can appear in bilingual Indian lyric files. */
const pool = Array.from('മലയാളംதமிழ்తెలుగుಕನ್ನಡहिन्दीਪੰਜਾਬੀবাংলাગુજરાતીଓଡ଼ିଆاردو  -()!?.,0123456789');
let seed = 0x51f15e;
function random() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 0x100000000;
}
for (let caseIndex = 0; caseIndex < 400; caseIndex += 1) {
    const length = 1 + Math.floor(random() * 36);
    let input = '';
    for (let i = 0; i < length; i += 1) input += pool[Math.floor(random() * pool.length)];
    const first = romanizer.romanize(input);
    const second = romanizer.romanize(input);
    eq(first, second, `mixed-script fuzz case ${caseIndex} deterministic`);
    ok(first.length <= Math.max(128, input.length * 12), `mixed-script fuzz case ${caseIndex} bounded`);
    ok(!/[\u0000\uFFFD]/.test(first), `mixed-script fuzz case ${caseIndex} has no corrupt replacement output`);
}

console.log(`Romanization robustness contract: ${assertions} assertions passed.`);
