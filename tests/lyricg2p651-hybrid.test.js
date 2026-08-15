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
assert.strictEqual(r.learnedModelBundled, false);
assert.strictEqual(r.learnedTransliterationModelBundled, false);
assert.strictEqual(r.targetedLearnedAdvisorsBundled, true);
assert.strictEqual(r.learnedComponentsBundled, true);
assert.strictEqual(r.learnedComponents.length, 2);
assert.deepStrictEqual(Array.from(r.learnedComponents, x => x.id), ['hi-schwa-logreg', 'pa-schwa-logreg']);
assert.strictEqual(r.learnedComponents[0].weightCount, 487);
assert.strictEqual(r.learnedComponents[1].weightCount, 194);
assert.strictEqual(r.learnedComponents[0].role, 'lazy-schwa-advisor');
assert.ok(r.learnedComponentPolicy.includes('deterministic-production-hot-path'));

// Learned schwa is advisory in diagnostics and must not silently mutate the hot path.
for (const input of ['ਪਿਆਰ', 'ਕਮਲ', 'ਘਰ', 'ਪੰਜਾਬੀ', 'प्यार', 'दिल']) {
  const normal = r.romanize(input);
  const detailed = r.romanizeDetailed(input);
  assert.strictEqual(detailed.text, normal, `${input}: detailed/production mismatch`);
}
const paAdvice = r.romanizeDetailed('ਕਮਲ').spans[0].phonemes.filter(x => x.schwaKeepProbability !== null);
assert.ok(paAdvice.length >= 2);
assert.ok(paAdvice.every(x => x.schwaModel === 'pa-schwa-logreg'));
assert.ok(paAdvice.every(x => x.schwaAdvice && ['keep', 'delete', 'uncertain'].includes(x.schwaAdvice.action)));
assert.ok(paAdvice.some(x => (x.rules || []).some(rule => rule.startsWith('SCHWA_ADVICE_'))));
const hiAdvice = r.romanizeDetailed('प्यार').spans[0].phonemes.filter(x => x.schwaKeepProbability !== null);
assert.ok(hiAdvice.length >= 1);
assert.ok(hiAdvice.every(x => x.schwaModel === 'hi-schwa-logreg'));

// Malayalam keeps a conservative readable display while carrying richer phonetics.
const ml = r.romanizeDetailed('അകലം');
assert.strictEqual(ml.text, 'akalam');
assert.strictEqual(ml.spans[0].phoneticRomanized, 'agalam');
assert.ok(ml.spans[0].phonemes.some(x => x.phoneticOnset === 'g' && x.onset === 'k'));

// Shared-script context: phrase evidence may identify language, isolated ambiguity remains explicit.
assert.ok(r.detectLanguages('तिमीलाई माया गर्छ').every(x => x.language === 'ne'));
assert.ok(r.detectLanguages('हमार दिल बा').every(x => x.language === 'bho'));
assert.ok(r.detectLanguages('माझं प्रेम आहे').every(x => x.language === 'mr'));
assert.ok(r.detectLanguages('दिल में प्रेम है').every(x => x.language === 'hi'));
const solo = r.detectLanguages('प्रेम');
assert.strictEqual(solo[0].language, 'hi-mr-bho-ne');
assert.strictEqual(solo[0].decisive, false);

// Category-aware hybrid ranking: trusted local knowledge stays authoritative,
// but a high-confidence learned candidate can beat an ambiguous local fallback.
const weakRank = r.rankCandidates('अदरक', [
  { text: 'adrak', source: 'learned-model', confidence: 0.97, language: 'hi' }
]);
assert.strictEqual(weakRank[0].text, 'adrak');
assert.strictEqual(weakRank[0].decisionCategory, 'shared-script-ambiguous');
assert.ok(weakRank[0].reasons.includes('learned-candidate-uncertain-local'));
const lexRank = r.rankCandidates('प्यार', [
  { text: 'pyar', source: 'learned-model', confidence: 0.999, language: 'hi' }
]);
assert.strictEqual(lexRank[0].text, 'pyaar');
assert.strictEqual(lexRank[0].decisionCategory, 'curated-lexicon');
const morphRank = r.rankCandidates('ਪਿਆਰਾਂ', [
  { text: 'piaaran', source: 'learned-model', confidence: 0.999, language: 'pa' }
]);
assert.strictEqual(morphRank[0].text, 'pyaaran');
assert.strictEqual(morphRank[0].decisionCategory, 'morphology-assisted');
const objectRank = r.rankCandidates('प्यार', [
  { text: 'pyār', source: 'learned-model', confidence: 0.99, language: 'hi' }
]);
assert.ok(objectRank.every(x => x.text !== '[object Object]'));
assert.ok(objectRank.find(x => x.text === 'pyār').reasons.includes('academic-diacritics'));
const duplicateEvidenceRank = r.rankCandidates('अदरक', [
  { text: 'adrak', source: 'external', confidence: 0.1, language: 'hi' },
  { text: 'adrak', source: 'learned-model', confidence: 0.97, language: 'hi' }
]);
const duplicateAdrak = duplicateEvidenceRank.filter(x => x.text === 'adrak');
assert.strictEqual(duplicateAdrak.length, 1);
assert.strictEqual(duplicateAdrak[0].source, 'learned-model');
assert.strictEqual(duplicateAdrak[0].confidence, 0.97);
const nullConfidenceRank = r.rankCandidates('अदरक', [
  { text: 'adrak', source: 'learned-model', confidence: null, language: 'hi' }
]);
assert.strictEqual(nullConfidenceRank.find(x => x.text === 'adrak').confidence, null);
assert.ok(!nullConfidenceRank.find(x => x.text === 'adrak').reasons.includes('candidate-confidence-evidence'));
const booleanConfidenceRank = r.rankCandidates('अदरक', [
  { text: 'adrak', source: 'learned-model', confidence: false, language: 'hi' }
]);
assert.strictEqual(booleanConfidenceRank.find(x => x.text === 'adrak').confidence, null);
assert.ok(!booleanConfidenceRank.find(x => x.text === 'adrak').reasons.includes('candidate-confidence-evidence'));
const selected = r.selectCandidate('अदरक', [
  { text: 'adrak', source: 'learned-model', confidence: 0.97, language: 'hi' }
]);
assert.strictEqual(selected.text, 'adrak');
assert.strictEqual(selected.selectionPolicy, r.candidateSelectionPolicy);

const wrongLanguageRank = r.rankCandidates('अदरक', [
  { text: 'adrak', source: 'learned-model', confidence: 0.99, language: 'pa' }
]);
assert.strictEqual(wrongLanguageRank[0].text, 'adarak');
assert.ok(wrongLanguageRank.find(x => x.text === 'adrak').reasons.includes('context-language-mismatch'));

// Canonically equivalent nukta spellings must normalize to the same Roman output.
for (const input of ['क़लम', 'क़लम', 'ਖ਼ਬਰ', 'ਖ਼ਬਰ']) {
  assert.strictEqual(r.romanize(input.normalize('NFC')), r.romanize(input.normalize('NFD')), input);
}
// Legacy Malayalam chillus and joiners remain one logical script span.
for (const [input, expected] of [['ന്‍', 'n'], ['ന്‌', 'n'], ['ണ്‍', 'n']]) {
  assert.strictEqual(r.romanize(input), expected);
  const d = r.romanizeDetailed(input);
  assert.strictEqual(d.spans.length, 1);
  assert.strictEqual(d.spans[0].language, 'ml');
}

// Boundary/provenance stress set covering learned-advisor scripts, morphology, emoji and code-switching.
const boundaryInputs = [
  'മലയാളം ന്‍ love കാറ്റിൻ', 'என் love நீதான்!', 'తెలుగు పాట✨', 'ಕನ್ನಡ ಹಾಡು 2026',
  'ਪਿਆਰਾਂ ਘਰ ❤️', 'ਮੈਨੂੰ ਤੇਰੇ ਨਾਲ ਪਿਆਰ ਹੈ', 'मुझे तुमसे प्यार है',
  'तिमीलाई माया गर्छ', 'हमार दिल बा', 'माझं प्रेम आहे', 'क़लम और क़लम',
  'പ‍അആന', '✨ൺൾപതടനമ‍‌ആതാഇനട', 'ੱਿੰਖਮਂਨਬੰਦ਼ਂੁੇ', 'ੱਆ love 2026!'
];
for (const input of boundaryInputs) {
  const output = r.romanize(input);
  const detailed = r.romanizeDetailed(input);
  assert.strictEqual(detailed.text, output);
  let lastStart = 0, lastEnd = 0;
  for (let i = 0; i <= input.length; i += 1) {
    const start = r.mapBoundary(input, i, 'start');
    const end = r.mapBoundary(input, i, 'end');
    assert.ok(start >= lastStart && start <= output.length, `${input}: start ${i}`);
    assert.ok(end >= lastEnd && end <= output.length, `${input}: end ${i}`);
    lastStart = start; lastEnd = end;
  }
  for (const span of detailed.spans) {
    assert.ok(span.outputStart >= 0 && span.outputEnd <= output.length && span.outputStart <= span.outputEnd);
    for (const unit of span.phonemes || []) {
      assert.ok(unit.sourceStartGlobal <= unit.sourceEndGlobal);
      assert.ok(unit.outputStart <= unit.outputEnd);
      assert.ok(unit.outputStart >= span.outputStart && unit.outputEnd <= span.outputEnd);
    }
  }
}

// Determinism and malformed candidate resilience.
const deterministicInputs = ['കാറ്റിൻ', 'தமிழ்', 'సంసారం', 'ಪ್ರೀತಿಗಳು', 'ਪਿਆਰਾਂ', 'माझं प्रेम आहे', 'तिमीलाई माया गर्छ'];
for (const input of deterministicInputs) {
  const expected = r.romanize(input);
  for (let i = 0; i < 30; i += 1) assert.strictEqual(r.romanize(input), expected);
}
for (const candidates of [null, [], [null, undefined, ''], [{}, { text: null }], [42, false]]) {
  const ranked = r.rankCandidates('प्यार', candidates);
  assert.ok(Array.isArray(ranked));
  assert.ok(ranked.length >= 1);
  assert.strictEqual(ranked[0].text, 'pyaar');
}

// Pathological-length guards: diagnostics/ranking stay bounded rather than allocating
// an unbounded quadratic edit-distance matrix on corrupt provider input.
const pathologicalIndic = 'अ'.repeat(1100);
const pathologicalDetailed = r.romanizeDetailed(pathologicalIndic);
assert.strictEqual(pathologicalDetailed.text, r.romanize(pathologicalIndic));
let pathologicalPrevious = 0;
for (let i = 0; i <= pathologicalIndic.length; i += 37) {
  const mapped = r.mapBoundary(pathologicalIndic, i, 'start');
  assert.ok(mapped >= pathologicalPrevious && mapped <= pathologicalDetailed.text.length);
  pathologicalPrevious = mapped;
}
const pathologicalGeneric = 'Latin-'.repeat(220);
const pathologicalGenericOutput = r.romanize(pathologicalGeneric);
let genericPrevious = 0;
for (let i = 0; i <= pathologicalGeneric.length; i += 41) {
  const mapped = r.mapBoundary(pathologicalGeneric, i, 'start');
  assert.ok(mapped >= genericPrevious && mapped <= pathologicalGenericOutput.length);
  genericPrevious = mapped;
}
const pathologicalNfd = 'e\u0301'.repeat(600);
const pathologicalNfdOutput = r.romanize(pathologicalNfd);
let nfdPrevious = 0;
for (let i = 0; i <= pathologicalNfd.length; i += 31) {
  const mapped = r.mapBoundary(pathologicalNfd, i, 'end');
  assert.ok(mapped >= nfdPrevious && mapped <= pathologicalNfdOutput.length);
  nfdPrevious = mapped;
}

const pathologicalCandidateSource = 'abcdef'.repeat(300);
const pathologicalCandidate = 'ghijkl'.repeat(300);
const pathologicalRank = r.rankCandidates(pathologicalCandidateSource, [
  { text: pathologicalCandidate, source: 'learned-model', confidence: 0.99 }
]);
assert.ok(pathologicalRank.find(x => x.text === pathologicalCandidate).reasons.includes('phonological-distance-skipped:pathological-length'));

// Larger deterministic Unicode fuzz. This tests safety, normalization and monotonic mapping,
// not linguistic correctness of random nonsense strings.
let seed = 0x651B16B5;
function random() {
  seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
  return seed / 0x100000000;
}
const pools = [
  ['അ','ആ','ഇ','ക','ച','ട','ത','പ','മ','ന','ഴ','ാ','ി','ു','െ','േ','്','ൻ','ൺ','ൾ','\u200D','\u200C'],
  ['அ','ஆ','இ','க','ச','ட','த','ப','ம','ன','ழ','ா','ி','ு','ெ','ே','்'],
  ['అ','ఆ','ఇ','క','చ','ట','త','ప','మ','న','ం','ా','ి','ు','ె','ే','్'],
  ['ಅ','ಆ','ಇ','ಕ','ಚ','ಟ','ತ','ಪ','ಮ','ನ','ಂ','ಾ','ಿ','ು','ೆ','ೇ','್'],
  ['अ','आ','इ','क','ख','ग','त','द','प','ब','म','न','र','ा','ि','ु','े','ो','्','ं','़','\u200D','\u200C'],
  ['ਅ','ਆ','ਇ','ਕ','ਖ','ਗ','ਤ','ਦ','ਪ','ਬ','ਮ','ਨ','ਰ','ਾ','ਿ','ੁ','ੇ','ੋ','੍','ੰ','ਂ','਼','ੱ']
];
const fuzzRounds = Math.max(1, Number(process.env.LYRICG2P_FUZZ_ROUNDS) || 3000);
for (let round = 0; round < fuzzRounds; round += 1) {
  const pool = pools[Math.floor(random() * pools.length)];
  let input = '';
  const n = 1 + Math.floor(random() * 18);
  for (let i = 0; i < n; i += 1) input += pool[Math.floor(random() * pool.length)];
  if (round % 5 === 0) input += ' love';
  if (round % 7 === 0) input = '✨' + input;
  if (round % 13 === 0) input += ' 2026!';
  const output = r.romanize(input);
  assert.strictEqual(typeof output, 'string');
  const detailed = r.romanizeDetailed(input);
  assert.strictEqual(detailed.text, output);
  assert.ok(detailed.spans.every(span => (
    span.outputStart >= 0 && span.outputStart <= span.outputEnd && span.outputEnd <= output.length
  )), `fuzz ${round}: span provenance`);
  assert.ok(detailed.spans.every(span => (span.phonemes || []).every(unit => (
    unit.outputStart >= span.outputStart
    && unit.outputStart <= unit.outputEnd
    && unit.outputEnd <= span.outputEnd
  ))), `fuzz ${round}: unit provenance`);
  let prevStart = 0;
  let prevEnd = 0;
  for (let i = 0; i <= input.length; i += 1) {
    const start = r.mapBoundary(input, i, 'start');
    const end = r.mapBoundary(input, i, 'end');
    assert.ok(start >= prevStart && start <= output.length, `fuzz ${round}/${i} start`);
    assert.ok(end >= prevEnd && end <= output.length, `fuzz ${round}/${i} end`);
    prevStart = start;
    prevEnd = end;
  }
}

console.log(`LyricG2P 6.5.1 hybrid audit: focused model/ranker/Unicode/provenance tests + ${fuzzRounds} fuzz cases passed.`);
