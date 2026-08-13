'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const packageDir = path.resolve(__dirname, '..', 'src');
const jsPath = path.join(packageDir, 'jellyfin-lyric-motion.js');
const cssPath = path.join(packageDir, 'jellyfin-lyric-motion.css');
const source = fs.readFileSync(jsPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

function extractFunction(name) {
    const marker = `function ${name}(`;
    const start = source.indexOf(marker);
    assert(start >= 0, `missing function ${name}`);
    const bodyStart = source.indexOf('{', start);
    let depth = 0;
    let quote = '';
    let escaped = false;
    let lineComment = false;
    let blockComment = false;

    for (let index = bodyStart; index < source.length; index += 1) {
        const char = source[index];
        const next = source[index + 1];

        if (lineComment) {
            if (char === '\n') lineComment = false;
            continue;
        }
        if (blockComment) {
            if (char === '*' && next === '/') {
                blockComment = false;
                index += 1;
            }
            continue;
        }
        if (quote) {
            if (escaped) escaped = false;
            else if (char === '\\') escaped = true;
            else if (char === quote) quote = '';
            continue;
        }
        if (char === '/' && next === '/') {
            lineComment = true;
            index += 1;
            continue;
        }
        if (char === '/' && next === '*') {
            blockComment = true;
            index += 1;
            continue;
        }
        if (char === '"' || char === "'" || char === '`') {
            quote = char;
            continue;
        }
        if (char === '{') depth += 1;
        if (char === '}') {
            depth -= 1;
            if (depth === 0) return source.slice(start, index + 1);
        }
    }
    throw new Error(`unterminated function ${name}`);
}

const context = {
    BACKGROUND_VOCAL_SENTINEL: '\u2063\u2060',
    state: {
        lyrics: [],
        lineData: [],
        lineEndPrefix: []
    }
};
vm.createContext(context);

for (const name of [
    'cueValue',
    'lyricValue',
    'lyricTextProfile',
    'finiteTick',
    'nextLyricStartTicks',
    'calculateLineBounds',
    'findActiveLineIndexesAtTicks'
]) {
    vm.runInContext(extractFunction(name), context);
}

const tagged = context.lyricTextProfile({
    Text: '\u2063\u2060(Brazil)'
});
assert.strictEqual(tagged.text, '(Brazil)');
assert.strictEqual(tagged.positionOffset, 2);
assert.strictEqual(tagged.isBackgroundVocal, true);

const untagged = context.lyricTextProfile({ Text: 'Lead' });
assert.strictEqual(untagged.text, 'Lead');
assert.strictEqual(untagged.positionOffset, 0);
assert.strictEqual(untagged.isBackgroundVocal, false);

context.state.lyrics = [
    { Start: 365960000 },
    { Start: 372840000 }
];
const bounds = context.calculateLineBounds(
    context.state.lyrics[0],
    0,
    [{ start: 365960000, end: 382650000 }],
    [],
    18
);
assert.strictEqual(bounds.startTicks, 365960000);
assert.strictEqual(
    bounds.endTicks,
    382650000,
    'the previous line must retain its cue end after the next line starts'
);

context.state.lineData = [
    { startTicks: 359000000, endTicks: 367470000 },
    { startTicks: 365960000, endTicks: 382650000 },
    { startTicks: 372840000, endTicks: 387190000 },
    { startTicks: 385150000, endTicks: 400810000 }
];
let prefix = -Infinity;
context.state.lineEndPrefix = context.state.lineData.map(line => {
    prefix = Math.max(prefix, line.endTicks);
    return prefix;
});

assert.deepStrictEqual(
    Array.from(context.findActiveLineIndexesAtTicks(366500000, 1)),
    [0, 1]
);
assert.deepStrictEqual(
    Array.from(context.findActiveLineIndexesAtTicks(375000000, 2)),
    [1, 2]
);
assert.deepStrictEqual(
    Array.from(context.findActiveLineIndexesAtTicks(383000000, 2)),
    [2]
);
assert.deepStrictEqual(
    Array.from(context.findActiveLineIndexesAtTicks(390000000, 3)),
    [3]
);

context.state.lineData = [
    { startTicks: 0, endTicks: 100000000 },
    { startTicks: 10000000, endTicks: 11000000 },
    { startTicks: 20000000, endTicks: 21000000 },
    { startTicks: 30000000, endTicks: 31000000 },
    { startTicks: 40000000, endTicks: 41000000 },
    { startTicks: 50000000, endTicks: 51000000 },
    { startTicks: 60000000, endTicks: 61000000 },
    { startTicks: 70000000, endTicks: 80000000 }
];
prefix = -Infinity;
context.state.lineEndPrefix = context.state.lineData.map(line => {
    prefix = Math.max(prefix, line.endTicks);
    return prefix;
});
assert.deepStrictEqual(
    Array.from(context.findActiveLineIndexesAtTicks(75000000, 7)),
    [0, 7],
    'a long response line must survive beyond the local line neighborhood'
);

context.state.lineData = [
    { startTicks: 441960000, endTicks: 456030000, isBackgroundVocal: true },
    { startTicks: 441960000, endTicks: 480190000, isBackgroundVocal: false }
];
prefix = -Infinity;
context.state.lineEndPrefix = context.state.lineData.map(line => {
    prefix = Math.max(prefix, line.endTicks);
    return prefix;
});

assert.deepStrictEqual(
    Array.from(context.findActiveLineIndexesAtTicks(445000000, 1)),
    [0, 1],
    'background and lead lines with the same start must render together'
);
assert.deepStrictEqual(
    Array.from(context.findActiveLineIndexesAtTicks(460000000, 1)),
    [1],
    'the background lane must finish at its own final cue'
);

for (const selector of [
    '.ak-overlap-current',
    '.ak-background-vocal',
    '.ak-background-vocal .ak-glow-core',
    '.ak-background-vocal .ak-glow-halo'
]) {
    assert(css.includes(selector), `missing CSS contract ${selector}`);
}

console.log('Overlap/background runtime contract: 19 assertions passed.');
