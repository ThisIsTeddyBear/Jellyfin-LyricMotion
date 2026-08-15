'use strict';
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

function loadRomanizer(file) {
  const context = { window: {}, console };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  return context.window.JellyfinLyricRomanizer;
}

const root = path.resolve(__dirname, '..');
const r = loadRomanizer(path.join(root, 'src', 'jellyfin-lyric-romanizer.js'));
assert.strictEqual(r.version, '6.5.1');
assert.strictEqual(r.offlineOnly, true);
assert.strictEqual(r.learnedModelBundled, false);
assert.strictEqual(r.romanizationStyle.id, 'lyricmotion-song-ascii-1');

const cases = [
  ['പേടി', 'pedi'], ['ഇടി', 'idi'], ['വാടി', 'vaadi'], ['കാറ്റിൻ', 'kaattin'],
  ['എന്ത്', 'enthu'], ['ഇത്', 'ithu'], ['അത്', 'athu'], ['ഴ', 'zha'],
  ['ന്‍', 'n'], ['ന്‌', 'n'], ['ണ്‍', 'n'], ['ൻ', 'n'], ['ൺ', 'n'],
  ['காதல்', 'kaadhal'], ['நீதான்', 'needhaan'], ['தமிழ்', 'tamil'],
  ['తెలుగు', 'telugu'], ['సంవత్సరం', 'samvatsaram'], ['సంసారం', 'samsaaram'],
  ['ಕನ್ನಡ', 'kannada'], ['ಪ್ರೀತಿಗಳು', 'preetigalu'],
  ['ਪੰਜਾਬੀ', 'panjabi'], ['ਪਿਆਰਾਂ', 'pyaaran'], ['ਦਿਲਾਂ', 'dilan'], ['ਕੁੜੀਆਂ', 'kudiyan'],
  ['प्यार', 'pyaar'], ['दिल', 'dil'], ['माझं प्रेम आहे', 'majha prem aahe'],
  ['दिल में प्रेम है', 'dil mein prem hai'], ['मेरो मन छ', 'mero man chh'],
  ['നീ എന്റെ baby ആണ്', 'nee ente baby aanu'], ['என் love நீதான்', 'en love needhaan']
];
for (const [input, expected] of cases) {
  assert.strictEqual(r.romanize(input), expected, input);
  assert.ok(!r.containsNativeScript(r.romanize(input)), `native residue: ${input}`);
}

const mr = r.detectLanguages('माझं प्रेम आहे');
assert.strictEqual(mr[0].language, 'mr');
assert.strictEqual(mr[1].language, 'mr');
assert.strictEqual(mr[1].contextInherited, true);
assert.strictEqual(mr[2].language, 'mr');
const hi = r.detectLanguages('दिल में प्रेम है');
assert.ok(hi.every(item => item.language === 'hi'));
const ambiguous = r.detectLanguages('प्रेम');
assert.strictEqual(ambiguous[0].language, 'hi-mr-bho-ne');
assert.strictEqual(ambiguous[0].decisive, false);

const morph = r.romanizeDetailed('ਪਿਆਰਾਂ');
assert.strictEqual(morph.spans[0].path, 'morphology+phonology');
assert.ok(morph.spans[0].morphology.some(h => h.knownStem));
assert.strictEqual(morph.confidenceKind, 'evidence-score-not-probability');

const legacy = r.romanizeDetailed('ന്‍');
assert.deepStrictEqual(Array.from(legacy.languages), ['ml']);
assert.strictEqual(legacy.spans.length, 1);
assert.ok(legacy.spans[0].phonemes.every(u => u.outputStart <= u.outputEnd));

const ir = r.phonologicalIR('करता ਪੰਜਾਬੀ');
assert.strictEqual(ir.engine, 'LyricG2P 6.5.1');
assert.ok(ir.units.length > 0);
assert.ok(ir.units.some(u => (u.rules || []).some(rule => rule.startsWith('SCHWA_'))));
assert.ok(ir.units.every(u => Number.isInteger(u.sourceStartGlobal) && Number.isInteger(u.outputStart)));

const variants = r.romanizationVariants('കാറ്റിൻ');
assert.strictEqual(variants[0].text, 'kaattin');
assert.ok(variants.some(v => v.text === 'kaatin'));
assert.ok(new Set(variants.map(v => v.text)).size === variants.length);

const ranked = r.rankCandidates('प्यार', [
  { text: 'pyār', source: 'learned-model', confidence: 0.98 },
  'pyaar', 'piar'
]);
assert.strictEqual(ranked[0].text, 'pyaar');
assert.ok(ranked.find(x => x.text === 'pyār').reasons.includes('academic-diacritics'));
const contextRanked = r.rankCandidates('माझं प्रेम आहे', [
  { text: 'majha prem aahe', source: 'learned-model', confidence: 0.8, language: 'mr' },
  { text: 'majha prem aahe!', source: 'learned-model', confidence: 0.99, language: 'hi' }
]);
assert.ok(contextRanked[0].reasons.includes('context-language-match') || contextRanked[0].local);
const selected = r.selectCandidate('प्यार', [{ text: 'pyār', source: 'learned-model', confidence: 0.99, language: 'hi' }]);
assert.strictEqual(selected.text, 'pyaar');

const exported = r.exportRomanizationCase('പേടി', 'pedi');
assert.strictEqual(exported.generated, 'pedi');
assert.strictEqual(exported.expected, 'pedi');
assert.ok(exported.spans[0].rules.includes('ML_CONTEXTUAL_STOP_VOICING'));

const boundaryStrings = [
  'നീ baby ആണ്', '🎵 காதல்! ❤️', 'ന്‍ test', 'दिल में love है', 'ਪਿਆਰਾਂ✨', 'ಸಂಸಾರ 123'
];
for (const input of boundaryStrings) {
  const output = r.romanize(input);
  let lastStart = 0;
  let lastEnd = 0;
  for (let i = 0; i <= input.length; i += 1) {
    const a = r.mapBoundary(input, i, 'start');
    const b = r.mapBoundary(input, i, 'end');
    assert.ok(a >= 0 && a <= output.length, `${input} start ${i}`);
    assert.ok(b >= 0 && b <= output.length, `${input} end ${i}`);
    assert.ok(a >= lastStart, `${input} nonmonotonic start ${i}`);
    assert.ok(b >= lastEnd, `${input} nonmonotonic end ${i}`);
    lastStart = a; lastEnd = b;
  }
}

// Deterministic Unicode fuzz: safety and provenance, not linguistic correctness.
let seed = 0x65C0FFEE;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 0x100000000;
}
const pools = [
  ['അ','ക','ട','ന','മ','ഴ','ാ','ി','ു','്','ൻ','\u200D','\u200C'],
  ['அ','க','ச','ட','த','ப','ழ','ா','ி','ு','்'],
  ['అ','క','ట','త','ప','మ','ం','ా','ి','ు','్'],
  ['ಅ','ಕ','ಟ','ತ','ಪ','ಮ','ಂ','ಾ','ಿ','ು','್'],
  ['अ','क','त','प','म','न','ा','ि','ु','्','ं'],
  ['ਅ','ਕ','ਤ','ਪ','ਮ','ਨ','ਾ','ਿ','ੁ','੍','ੰ','ਂ']
];
for (let round = 0; round < 500; round += 1) {
  const pool = pools[Math.floor(random() * pools.length)];
  let input = '';
  const n = 1 + Math.floor(random() * 12);
  for (let i = 0; i < n; i += 1) input += pool[Math.floor(random() * pool.length)];
  if (round % 7 === 0) input += ' love';
  if (round % 11 === 0) input = '✨' + input;
  const output = r.romanize(input);
  assert.strictEqual(typeof output, 'string');
  const detailed = r.romanizeDetailed(input);
  assert.strictEqual(detailed.text, output);
  assert.ok(detailed.spans.every(span => span.outputStart <= span.outputEnd));
  let prev = 0;
  for (let i = 0; i <= input.length; i += 1) {
    const mapped = r.mapBoundary(input, i, 'start');
    assert.ok(mapped >= prev && mapped <= output.length);
    prev = mapped;
  }
}

console.log(`LyricG2P ${r.version}: ${cases.length} regression cases + 500 Unicode fuzz cases passed.`);
