#!/usr/bin/env node
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

function loadRomanizer(file) {
  const context = { window: {}, console };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  return context.window.JellyfinLyricRomanizer;
}
function styleNormalize(x) {
  return String(x || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/aa/g, 'a').replace(/ee/g, 'i').replace(/oo/g, 'u')
    .replace(/([bcdfghjklmnpqrstvwxyz])\1+/g, '$1').replace(/[^a-z0-9]+/g, '');
}
const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: node scripts/calibrate-lyricg2p65-confidence.js <corpus.tsv> [report.json]');
  process.exit(2);
}
const root = path.resolve(__dirname, '..');
const r = loadRomanizer(path.join(root, 'src', 'jellyfin-lyric-romanizer.js'));
const rows = [];
for (const line of fs.readFileSync(inputFile, 'utf8').split(/\r?\n/).filter(Boolean)) {
  if (/^language\t/i.test(line)) continue;
  const [language, native, refsRaw, source = ''] = line.split('\t');
  if (!native || !refsRaw) continue;
  const refs = refsRaw.split('||').map(x => x.trim()).filter(Boolean);
  const detailed = r.romanizeDetailed(native);
  const exact = refs.includes(detailed.text);
  const styleCorrect = refs.some(ref => styleNormalize(ref) === styleNormalize(detailed.text));
  rows.push({ language, native, source, output: detailed.text, confidence: detailed.confidence, exact, styleCorrect });
}
const buckets = Array.from({ length: 10 }, (_, i) => ({ lo: i / 10, hi: (i + 1) / 10, n: 0, exact: 0, style: 0, scoreSum: 0 }));
for (const row of rows) {
  const index = Math.min(9, Math.max(0, Math.floor(Number(row.confidence || 0) * 10)));
  const b = buckets[index]; b.n += 1; b.exact += row.exact ? 1 : 0; b.style += row.styleCorrect ? 1 : 0; b.scoreSum += row.confidence;
}
let eceExact = 0, eceStyle = 0;
const populated = buckets.filter(b => b.n).map(b => {
  const meanConfidence = b.scoreSum / b.n;
  const exactAccuracy = b.exact / b.n;
  const styleAccuracy = b.style / b.n;
  eceExact += (b.n / Math.max(1, rows.length)) * Math.abs(meanConfidence - exactAccuracy);
  eceStyle += (b.n / Math.max(1, rows.length)) * Math.abs(meanConfidence - styleAccuracy);
  return {
    range: `${b.lo.toFixed(1)}-${b.hi.toFixed(1)}`,
    count: b.n,
    meanEvidenceScore: +meanConfidence.toFixed(4),
    exactAccuracy: +exactAccuracy.toFixed(4),
    styleNormalizedAccuracy: +styleAccuracy.toFixed(4)
  };
});
const report = {
  engine: r.version,
  confidenceSemantics: r.confidenceSemantics,
  generatedAt: new Date().toISOString(),
  corpus: path.basename(inputFile),
  rows: rows.length,
  note: `LyricG2P ${r.version} confidence is an evidence score, not a probability. This report measures calibration error without relabeling it as probabilistic confidence.`,
  expectedCalibrationError: { exact: +eceExact.toFixed(4), styleNormalized: +eceStyle.toFixed(4) },
  buckets: populated
};
const out = process.argv[3];
if (out) fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
