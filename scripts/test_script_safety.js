'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(
    path.join(root, 'src', 'jellyfin-lyric-motion.js'),
    'utf8'
);
const css = fs.readFileSync(
    path.join(root, 'src', 'jellyfin-lyric-motion.css'),
    'utf8'
);

const start = source.indexOf('    let unicodeMarkExpression');
const endMarker = '    function snapBoundary(';
const end = source.indexOf(endMarker, start);
assert(start >= 0 && end > start, 'script-safety source block is missing');

const block = source.slice(start, end) + `
globalThis.__scriptSafety = {
    getGraphemeBoundaries,
    detectScriptProfile,
    usesAtomicPaint
};`;

const fixtures = [
    ['और', [0, 1, 2], 'devanagari'],
    ['मोहब्बत', [0, 2, 3, 6, 7], 'devanagari'],
    ['प्यार', [0, 4, 5], 'devanagari'],
    ['क्\u200dष', [0, 4], 'devanagari'],
    ['ਪਿਆਰ', [0, 2, 3, 4], 'gurmukhi'],
    ['ਮੁਹੱਬਤ', [0, 2, 4, 5, 6], 'gurmukhi'],
    ['ਸ਼੍ਰੀ', [0, 5], 'gurmukhi'],
    ['സ്നേഹം', [0, 4, 6], 'malayalam'],
    ['മലയാളം', [0, 1, 2, 4, 6], 'malayalam'],
    ['ന്\u200d', [0, 3], 'malayalam'],
    ['glow', [0, 1, 2, 3, 4], 'spatial']
];

class NaiveSegmenter {
    segment(text) {
        let offset = 0;
        return Array.from(text, character => {
            const value = { index: offset, segment: character };
            offset += character.length;
            return value;
        });
    }
}

const modes = [
    ['native', Intl],
    ['no-segmenter', {}],
    ['naive-segmenter', { Segmenter: NaiveSegmenter }]
];

let assertions = 0;

for (const [mode, intl] of modes) {
    const context = { Intl: intl, RegExp };
    vm.createContext(context);
    vm.runInContext(block, context);
    const api = context.__scriptSafety;

    for (const [text, expected, profile] of fixtures) {
        assert.deepStrictEqual(
            Array.from(api.getGraphemeBoundaries(text)),
            expected,
            `${mode}: unsafe boundary for ${text}`
        );
        assert.strictEqual(api.detectScriptProfile(text), profile, `${mode}: profile for ${text}`);
        assert.strictEqual(api.usesAtomicPaint(profile), profile !== 'spatial');
        assertions += 3;
    }
}

assert(/\.ak-word\.ak-paint-atomic\s*\{[\s\S]*?background-image:\s*none\s*!important/.test(css));
assert(/\.ak-word\.ak-paint-atomic[\s\S]*?letter-spacing:\s*normal/.test(css));
assert(/\.ak-script-devanagari/.test(css));
assert(/\.ak-script-gurmukhi/.test(css));
assert(/\.ak-script-malayalam/.test(css));
assert(/\.ak-word-active\.ak-paint-atomic[\s\S]*?transform:\s*none\s*!important/.test(css));
assert(!/\.ak-word\.ak-paint-atomic[\s\S]{0,700}text-shadow:\s*[^;]*rgba\(255,\s*255,\s*255/.test(css));
assertions += 7;

console.log(`Script-safety contract: ${assertions} assertions passed.`);
