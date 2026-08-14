'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src', 'jellyfin-lyric-motion.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src', 'jellyfin-lyric-motion.css'), 'utf8');

const start = source.indexOf('    let unicodeMarkExpression');
const end = source.indexOf('    function cueRecordStart(', start);
assert(start >= 0 && end > start, 'multiscript safety source block is missing');

const glowStart = source.indexOf('    function canUseGraphemeMotionOverlay(');
const glowEnd = source.indexOf('    function classifyWordMotion(', glowStart);
assert(glowStart >= 0 && glowEnd > glowStart, 'grapheme glow policy function is missing');

const block = source.slice(start, end) + source.slice(glowStart, glowEnd) + `
globalThis.__scriptSafety = {
    getGraphemeBoundaries,
    canUseGraphemeMotionOverlay,
    detectScriptProfile,
    usesWholeShapedMotion,
    usesCueTokenization,
    firstStrongDirection,
    getWordRanges
};`;

function LegacyRegExp(pattern, flags) {
    if (String(pattern).includes('\\p{')) {
        throw new SyntaxError('Unicode property escapes unsupported');
    }
    return new RegExp(pattern, flags);
}
LegacyRegExp.prototype = RegExp.prototype;

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
    ['native', Intl, RegExp],
    ['no-segmenter', {}, RegExp],
    ['naive-segmenter', { Segmenter: NaiveSegmenter }, RegExp],
    ['legacy-regexp', {}, LegacyRegExp]
];

const markFixtures = [
    ['Arabic mark', 'مُ', 1],
    ['Hebrew mark', 'שָ', 1],
    ['Devanagari matra', 'का', 1],
    ['Bengali matra', 'কা', 1],
    ['Gurmukhi matra', 'ਕਾ', 1],
    ['Gujarati matra', 'કા', 1],
    ['Odia matra', 'କା', 1],
    ['Tamil matra', 'கா', 1],
    ['Telugu matra', 'కా', 1],
    ['Kannada matra', 'ಕಾ', 1],
    ['Malayalam matra', 'കാ', 1],
    ['Sinhala sign', 'කා', 1],
    ['Thai mark', 'กิ', 1],
    ['Lao mark', 'ກິ', 1],
    ['Myanmar vowel', 'ကာ', 1],
    ['Khmer vowel', 'កា', 1]
];

const profileFixtures = [
    ['hello', 'latin', false],
    ['Cafe\u0301', 'latin', false],
    ['Привет', 'cyrillic', false],
    ['κόσμος', 'greek', false],
    ['你好', 'cjk', false],
    ['مرحبا', 'arabic', true],
    ['שלום', 'hebrew', true],
    ['प्यार', 'devanagari', true],
    ['ভালো', 'bengali', true],
    ['ਪਿਆਰ', 'gurmukhi', true],
    ['પ્રેમ', 'gujarati', true],
    ['ପ୍ରେମ', 'odia', true],
    ['காதல்', 'tamil', true],
    ['ప్రేమ', 'telugu', true],
    ['ಪ್ರೀತಿ', 'kannada', true],
    ['സ്നേഹം', 'malayalam', true],
    ['ආදරය', 'sinhala', true],
    ['สวัสดี', 'thai', true],
    ['ສະບາຍດີ', 'lao', true],
    ['မင်္ဂလာပါ', 'myanmar', true],
    ['សួស្តី', 'khmer', true],
    ['བཀྲ་ཤིས', 'tibetan', true]
];

let assertions = 0;
for (const [mode, intl, regexpConstructor] of modes) {
    const context = { Intl: intl, RegExp: regexpConstructor, Object, String, Array, Math };
    vm.createContext(context);
    vm.runInContext(block, context);
    const api = context.__scriptSafety;

    for (const [name, text, unsafeBoundary] of markFixtures) {
        const boundaries = Array.from(api.getGraphemeBoundaries(text));
        assert(!boundaries.includes(unsafeBoundary), `${mode}: ${name} split at ${unsafeBoundary}: ${boundaries}`);
        assert.strictEqual(boundaries[0], 0, `${mode}: ${name} start`);
        assert.strictEqual(boundaries[boundaries.length - 1], text.length, `${mode}: ${name} end`);
        assertions += 3;
    }

    const zwj = 'क्\u200dष';
    assert.deepStrictEqual(Array.from(api.getGraphemeBoundaries(zwj)), [0, zwj.length], `${mode}: ZWJ conjunct split`);
    assertions += 1;

    const flag = '🇮🇳';
    assert.deepStrictEqual(Array.from(api.getGraphemeBoundaries(flag)), [0, flag.length], `${mode}: regional-indicator flag split`);
    const twoFlags = '🇮🇳🇯🇵';
    assert.deepStrictEqual(Array.from(api.getGraphemeBoundaries(twoFlags)), [0, flag.length, twoFlags.length], `${mode}: two flags incorrectly merged`);
    const hangulJamo = '가';
    assert.deepStrictEqual(Array.from(api.getGraphemeBoundaries(hangulJamo)), [0, hangulJamo.length], `${mode}: Hangul Jamo cluster split`);
    const twoHangulSyllables = '가나';
    assert.deepStrictEqual(Array.from(api.getGraphemeBoundaries(twoHangulSyllables)), [0, 2, twoHangulSyllables.length], `${mode}: adjacent Hangul Jamo syllables incorrectly merged`);
    assertions += 4;

    for (const [text, profile, whole] of profileFixtures) {
        assert.strictEqual(api.detectScriptProfile(text), profile, `${mode}: profile ${text}`);
        assert.strictEqual(api.usesWholeShapedMotion(profile), whole, `${mode}: shaping mode ${profile}`);
        assertions += 2;
    }

    assert.strictEqual(api.canUseGraphemeMotionOverlay({ text: 'प्यार', scriptProfile: 'devanagari' }), true, `${mode}: Devanagari gets per-akshara Classic Bloom`);
    assert.strictEqual(api.canUseGraphemeMotionOverlay({ text: 'കാറ്റിൻ', scriptProfile: 'malayalam' }), true, `${mode}: Malayalam gets per-akshara Classic Bloom`);
    assert.strictEqual(api.canUseGraphemeMotionOverlay({ text: 'காதல்', scriptProfile: 'tamil' }), true, `${mode}: Tamil gets per-grapheme Classic Bloom`);
    assert.strictEqual(api.canUseGraphemeMotionOverlay({ text: 'ప్రేమ', scriptProfile: 'telugu' }), true, `${mode}: Telugu gets per-akshara Classic Bloom`);
    assert.strictEqual(api.canUseGraphemeMotionOverlay({ text: 'ಪ್ರೀತಿ', scriptProfile: 'kannada' }), true, `${mode}: Kannada gets per-akshara Classic Bloom`);
    assert.strictEqual(api.canUseGraphemeMotionOverlay({ text: 'مرحبا', scriptProfile: 'arabic' }), false, `${mode}: Arabic keeps joining-safe whole-run bloom`);
    assert.strictEqual(api.canUseGraphemeMotionOverlay({ text: 'क्\u200dष', scriptProfile: 'devanagari' }), false, `${mode}: explicit joiner prevents unsafe glyph splitting`);
    assertions += 7;

    assert.strictEqual(api.firstStrongDirection('مرحبا 123'), 'rtl');
    assert.strictEqual(api.firstStrongDirection('שלום world'), 'rtl');
    assert.strictEqual(api.firstStrongDirection('Hello مرحبا'), 'ltr');
    assert.strictEqual(api.firstStrongDirection('123 مرحبا'), 'rtl');
    assert.strictEqual(api.firstStrongDirection('١٢٣ Hello'), 'ltr');
    assert.strictEqual(api.firstStrongDirection('١٢٣ مرحبا'), 'rtl');
    assert.strictEqual(api.firstStrongDirection('ָHello'), 'ltr');
    assert.strictEqual(api.firstStrongDirection('你好 world'), 'ltr');
    assertions += 8;

    const cjkCues = [
        { startPos: 0, endPos: 1 },
        { startPos: 1, endPos: 3 },
        { startPos: 3, endPos: 4 }
    ];
    assert.deepStrictEqual(
        Array.from(api.getWordRanges('你好世界', cjkCues), r => [r.start, r.end, r.text]),
        [[0, 1, '你'], [1, 3, '好世'], [3, 4, '界']],
        `${mode}: CJK source cue tokens not preserved`
    );
    const englishCues = [
        { startPos: 0, endPos: 2 },
        { startPos: 2, endPos: 5 },
        { startPos: 6, endPos: 11 }
    ];
    assert.deepStrictEqual(
        Array.from(api.getWordRanges('hello world', englishCues), r => r.text),
        ['hello', 'world'],
        `${mode}: English syllables were incorrectly promoted to words`
    );
    assertions += 2;
}

assert(/\.ak-word\.ak-paint-shaped\s*\{[\s\S]*?letter-spacing:\s*normal/.test(css));
assert(!/\.ak-word\.ak-paint-shaped\s*\{[\s\S]{0,700}?background(?:-image)?:\s*none\s*!important/.test(css));
assert(/\.ak-word\.ak-word-rtl[\s\S]{0,260}?direction:\s*rtl/.test(css));
assert(/\.ak-word\.ak-word-rtl\s*\{[\s\S]*?unicode-bidi:\s*isolate/.test(css));
assert(/\.lyricPage \.ak-word\.ak-word-rtl\s*\{[\s\S]*?linear-gradient\(\s*270deg/.test(css));
assert(/\.ak-script-arabic/.test(css));
assert(/\.ak-script-bengali/.test(css));
assert(/\.ak-script-tamil/.test(css));
assert(/\.ak-script-thai/.test(css));
assert(/\.ak-script-cjk/.test(css));
assert(/\.ak-has-shaped-script/.test(css));
assert(!/ak-paint-atomic|--ak-atomic-alpha|atomic-uniform-luminance/.test(source + css));
assert(source.includes("paintMode:\n                    usesWholeShapedMotion(scriptProfile)\n                        ? 'shaped'\n                        : 'spatial'"));
assert(source.includes("span.classList.add('ak-word-rtl')"));
assert(source.includes("firstStrongDirection(range.text) === 'rtl'"), 'mixed-script token direction must follow first strong character');
assert(source.includes("lineElement.setAttribute('dir', lineDirection)"));
assert(/word\.motionGlow\s*=\s*\n\s*growable;/.test(source), 'glow eligibility must be script-neutral');
assert(!/motionGlow[\s\S]{0,120}paintMode/.test(source), 'glow eligibility must not depend on script paint mode');
assert(source.includes("'arabic',\n            'complex',\n            'universal'"), 'only joining/unknown complex profiles are excluded from grapheme glow');
assert(source.includes('getGraphemeRanges() refuses boundaries after viramas'), 'source documents akshara-safe Classic Bloom policy');
assert(!/ak-paint-shaped\s*>\s*\.ak-glow-(?:core|halo)/.test(css), 'shaped scripts must use the same Classic Bloom layers');
assertions += 21;

console.log(`Multiscript safety/rendering contract: ${assertions} assertions passed.`);
