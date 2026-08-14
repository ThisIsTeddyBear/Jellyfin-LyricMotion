'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const mainPath = path.join(root, 'src', 'jellyfin-lyric-motion.js');
const romanizerPath = path.join(root, 'src', 'jellyfin-lyric-romanizer.js');
const mainSource = fs.readFileSync(mainPath, 'utf8');
const romanizerSource = fs.readFileSync(romanizerPath, 'utf8');
const packageVersion = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();

let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }
function eq(actual, expected, message) { assert.strictEqual(actual, expected, message); assertions += 1; }

function extractFunction(source, name) {
    const marker = `function ${name}(`;
    const start = source.indexOf(marker);
    assert(start >= 0, `missing function ${name}`);
    const bodyStart = source.indexOf('{', start);
    let depth = 0;
    let quote = '';
    let escaped = false;
    let lineComment = false;
    let blockComment = false;
    for (let i = bodyStart; i < source.length; i += 1) {
        const c = source[i];
        const n = source[i + 1];
        if (lineComment) { if (c === '\n') lineComment = false; continue; }
        if (blockComment) { if (c === '*' && n === '/') { blockComment = false; i += 1; } continue; }
        if (quote) {
            if (escaped) escaped = false;
            else if (c === '\\') escaped = true;
            else if (c === quote) quote = '';
            continue;
        }
        if (c === '/' && n === '/') { lineComment = true; i += 1; continue; }
        if (c === '/' && n === '*') { blockComment = true; i += 1; continue; }
        if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
        if (c === '{') depth += 1;
        if (c === '}') {
            depth -= 1;
            if (depth === 0) return source.slice(start, i + 1);
        }
    }
    throw new Error(`unterminated function ${name}`);
}

const versionMatch = mainSource.match(/const VERSION = '([^']+)'/);
ok(versionMatch, 'main runtime declares VERSION');
eq(versionMatch[1], packageVersion, 'runtime VERSION matches package VERSION');

ok(romanizerSource.includes("const VERSION = '5.1.0';"), 'Romanizer 5.1 optimization revision is packaged');
ok(romanizerSource.includes('const FALLBACK_DATA = '), 'broad fallback is stored in packed form');
ok(romanizerSource.includes('let fallbackMap = null;'), 'broad fallback starts unmaterialized');
ok(romanizerSource.includes('function getFallbackMap()'), 'fallback is materialized lazily');
ok(!romanizerSource.includes('const FALLBACK_MAP = {'), 'eager 60k-entry object literal was removed');
ok(!romanizerSource.includes("FALLBACK_DATA.split('\\n')"), 'lazy fallback parser avoids a temporary 60k-row array');
ok(romanizerSource.includes('const BOUNDARY_CACHE_MAX_ENTRIES = 256;'), 'source-to-Roman boundary cache is bounded');
ok(romanizerSource.includes('normalizationStable'), 'boundary mapper protects original UTF-16 offsets across NFC changes');
ok(romanizerSource.includes('function skipsBroadFallback('), 'common emoji can bypass broad fallback materialization');
ok(fs.statSync(romanizerPath).size < 850000, 'packed Romanizer stays below 850 KB');

ok(!mainSource.includes('words.forEach(prepareWordGeometry);'), 'line decoration no longer forces per-line synchronous geometry');
ok(mainSource.includes('const prefixWidths = new Map();'), 'shared cue boundaries reuse measured prefix geometry');
ok(mainSource.includes('state.activeLineScratch'), 'active-line hot path reuses a scratch array');
ok(mainSource.includes('function sameIndexList('), 'active-set comparisons avoid per-frame signature allocation');
ok(!mainSource.includes('function lineDistanceBand('), 'dead line-distance helper removed');
ok(!mainSource.includes('function isHanOnlySegment('), 'dead Han-only helper removed');
ok(!mainSource.includes('function isHanCodePoint('), 'orphaned Han code-point helper removed');
ok(!mainSource.includes('dataset.akText'), 'unused duplicate lyric text is not written into data-* attributes');
ok(!mainSource.includes('dataset.akWord'), 'unused per-word data-* index writes removed');
ok(!mainSource.includes('dataset.akScript'), 'unused per-word data-* script writes removed');
ok(!mainSource.includes('dataset.akDirection'), 'unused line direction data-* write removed');
ok(!romanizerSource.includes('function renderDevanagariTokens('), 'dead Devanagari renderer removed');
ok(!romanizerSource.includes('function cpHex('), 'dead fallback key helper removed after lazy-map refactor');

const activeState = {
    lineData: [
        { startTicks: 0, endTicks: 20 },
        { startTicks: 10, endTicks: 30 }
    ],
    lineEndPrefix: [20, 30],
    activeLineScratch: []
};
const activeContext = { state: activeState };
vm.createContext(activeContext);
vm.runInContext([
    extractFunction(mainSource, 'findLineIndexAtTicks'),
    extractFunction(mainSource, 'sameIndexList'),
    extractFunction(mainSource, 'findActiveLineIndexesAtTicks')
].join('\n'), activeContext);
eq(activeContext.findLineIndexAtTicks(15), 1, 'active-line search uses rendered lineData');
eq(activeContext.findLineIndexAtTicks(-1), -1, 'active-line search handles pre-roll');
eq(JSON.stringify(Array.from(activeContext.findActiveLineIndexesAtTicks(15, 7))), '[0,1]', 'out-of-range presentation indexes are never injected');
eq(JSON.stringify(Array.from(activeContext.findActiveLineIndexesAtTicks(5, 1))), '[0,1]', 'presentation fallback preserves ascending active-line order');
ok(activeContext.sameIndexList([0, 2], [0, 2]), 'sameIndexList identifies unchanged sets');
ok(!activeContext.sameIndexList([0, 2], [0, 3]), 'sameIndexList detects changed sets');

const romanizerContext = { window: {} };
vm.createContext(romanizerContext);
const loadStarted = process.hrtime.bigint();
vm.runInContext(romanizerSource, romanizerContext);
const loadMs = Number(process.hrtime.bigint() - loadStarted) / 1e6;
const romanizer = romanizerContext.window.JellyfinLyricRomanizer;
ok(romanizer, 'Romanizer API loads');
eq(romanizer.romanize('കാർ - കൂന്തലു കണ്ടപ്പോൾ കണ്ണൊന്ന് ഉടക്കി'), 'kaar - koonthalu kandappol kannonnu udakki', 'Malayalam quality baseline survives optimization');
eq(romanizer.romanize('മഴ ❤️ 🎵'), 'mazha ❤️ 🎵', 'emoji survives without altering native-script Romanization');
ok(!romanizer.canRomanize('❤️ 🎵'), 'emoji-only lyrics are not misclassified as Romanizable');

const timed = 'കാർ - കൂന്തലു കണ്ടപ്പോൾ കണ്ണൊന്ന് ഉടക്കി';
const boundaryStarted = process.hrtime.bigint();
for (let pass = 0; pass < 100; pass += 1) {
    for (let index = 0; index <= timed.length; index += 1) {
        romanizer.mapBoundary(timed, index, 'start');
        romanizer.mapBoundary(timed, index, 'end');
    }
}
const boundaryMs = Number(process.hrtime.bigint() - boundaryStarted) / 1e6;
ok(boundaryMs < 500, `cached repeated boundary mapping remains fast (${boundaryMs.toFixed(1)} ms)`);

console.log(`Full-audit optimization contract: ${assertions} assertions passed (Romanizer load ${loadMs.toFixed(1)} ms; cached boundary stress ${boundaryMs.toFixed(1)} ms).`);
