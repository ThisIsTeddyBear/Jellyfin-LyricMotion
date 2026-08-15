#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { performance } = require('perf_hooks');

const context = { window: {}, console };
vm.createContext(context);
const source = path.join(__dirname, '..', 'src', 'jellyfin-lyric-romanizer.js');
const loadStart = performance.now();
vm.runInContext(fs.readFileSync(source, 'utf8'), context, { filename: source });
const loadMs = performance.now() - loadStart;
const r = context.window.JellyfinLyricRomanizer;

const corpora = {
  mixed: [
    'നീ എന്റെ ഹൃദയം പോലെ baby',
    'காதல் என் உயிரே love நீதான்',
    'ప్రేమ మనసులో వెలుగై ఉంది',
    'ನಿನ್ನ ಪ್ರೀತಿ ನನ್ನ ಹೃದಯದಲ್ಲಿ ಇದೆ',
    'ਤੇਰਾ ਪਿਆਰ ਮੇਰੇ ਦਿਲ ਵਿੱਚ ਹੈ',
    'दिल में तेरा प्यार है',
    'माझं प्रेम तुझ्यासाठी आहे',
    'तिमीलाई माया गर्छ'
  ],
  punjabi: [
    'ਪਿਆਰਾਂ ਘਰ ਸਾਡਾ', 'ਮੈਨੂੰ ਤੇਰੇ ਨਾਲ ਪਿਆਰ ਹੈ', 'ਕਮਲ ਪੰਜਾਬੀ ਮੁੰਡਾ',
    'ਘਰ ਭਰਾ ਧੀ ਘੋੜਾ', 'ਸਾਡੀਆਂ ਅੱਖੀਆਂ ਵਿੱਚ ਪਿਆਰ', 'ਰੱਬ ਦੀ ਮੇਹਰ'
  ],
  devanagari: [
    'मुझे तुमसे प्यार है', 'दिल में तेरा प्यार है', 'माझं प्रेम आहे',
    'तिमीलाई माया गर्छ', 'हमार दिल बा', 'अदरक और कमल'
  ]
};

function median(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function bench(name, items, fn, loops, samples = 5) {
  for (let w = 0; w < 30; w += 1) for (const item of items) fn(item);
  const runs = [];
  let chars = 0;
  for (let sample = 0; sample < samples; sample += 1) {
    const start = performance.now();
    let localChars = 0;
    for (let loop = 0; loop < loops; loop += 1) {
      for (const item of items) {
        fn(item);
        localChars += item.length;
      }
    }
    const elapsed = performance.now() - start;
    runs.push(elapsed / (loops * items.length));
    chars = localChars;
  }
  const medianMs = median(runs);
  return {
    name,
    operationsPerSample: loops * items.length,
    samples,
    medianMsPerOperation: +medianMs.toFixed(6),
    minMsPerOperation: +Math.min(...runs).toFixed(6),
    maxMsPerOperation: +Math.max(...runs).toFixed(6),
    approxCharsPerSecondAtMedian: Math.round((chars / (loops * items.length)) / (medianMs / 1000))
  };
}

const candidateCases = [
  ['अदरक', [{ text: 'adrak', source: 'learned-model', confidence: 0.97, language: 'hi' }]],
  ['प्यार', [{ text: 'pyar', source: 'learned-model', confidence: 0.999, language: 'hi' }]],
  ['ਪਿਆਰਾਂ', [{ text: 'piaaran', source: 'learned-model', confidence: 0.999, language: 'pa' }]],
  ['प्रेम', [{ text: 'prem', source: 'provider', confidence: 0.9, language: 'mr' }]]
];

const report = {
  product: 'Jellyfin LyricMotion 3.2.0',
  engine: r.version,
  node: process.version,
  platform: `${process.platform}/${process.arch}`,
  loadMs: +loadMs.toFixed(3),
  policy: {
    learnedComponentPolicy: r.learnedComponentPolicy,
    candidateSelectionPolicy: r.candidateSelectionPolicy,
    candidateRanker: r.candidateRanker
  },
  benchmarks: [
    bench('mixed-romanize-hot-path', corpora.mixed, line => r.romanize(line), 180),
    bench('punjabi-romanize-hot-path', corpora.punjabi, line => r.romanize(line), 220),
    bench('devanagari-romanize-hot-path', corpora.devanagari, line => r.romanize(line), 220),
    bench('mixed-detailed-with-advisors', corpora.mixed, line => r.romanizeDetailed(line), 18),
    bench('punjabi-detailed-with-schwa-advisor', corpora.punjabi, line => r.romanizeDetailed(line), 24),
    bench('hybrid-candidate-ranking', candidateCases, item => r.rankCandidates(item[0], item[1]), 45)
  ],
  note: 'Local Node benchmark only. It is a relative development measurement, not a browser/TV latency guarantee.'
};

console.log(JSON.stringify(report, null, 2));
