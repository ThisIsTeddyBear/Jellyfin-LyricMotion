'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(
    path.resolve(
        __dirname,
        '..',
        'src',
        'jellyfin-lyric-motion.js'
    ),
    'utf8'
);

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

const state = {
    lyrics: [
        { Start: 365960000 },
        { Start: 372840000 }
    ],
    lineData: [
        {
            startTicks: 365960000,
            endTicks: 382650000,
            words: [{ start: 365960000 }]
        },
        {
            startTicks: 372840000,
            endTicks: 387190000,
            words: [{ start: 372840000 }]
        }
    ],
    lineEndPrefix: [382650000, 387190000],
    timedCueCount: 2,
    performanceProfile: 'tv',
    playbackClockSuspended: false,
    tvTimingLine: 0,
    tvPresentationLine: 0,
    tvPendingLine: -1,
    tvPendingSince: 0,
    tvPendingHostFrames: 0,
    tvHostLine: 0,
    tvHostSignalAt: 0,
    tvLastHostPollAt: 0,
    tvFocusedLine: 0,
    tvArmUntil: 0,
    tvVisualTicks: 365960000,
    tvVisualFrameAt: 1000,
    tvVisualDebtMs: 0,
    tvLastActivationWaitMs: 0,
    tvActivationSource: 'initial-host',
    tvActivationFallbacks: 0,
    tvStockTimingObserved: true,
    tvForceTimingCommit: false
};
let snapshot = { index: 0, neutralCount: 1, phasedCount: 1 };
const context = {
    state,
    TICKS_PER_SECOND: 10000000,
    TV_FOCUS_ARM_MS: 90,
    TV_HOST_MAX_WAIT_MS: 560,
    TV_HOST_POLL_INTERVAL_MS: 48,
    TV_VISUAL_CATCHUP_RATE: 1.45,
    lyricValue(lyric, pascal, camel) {
        return lyric && lyric[pascal] !== undefined
            ? lyric[pascal]
            : lyric && lyric[camel];
    },
    getJellyfinLineSnapshot() {
        return snapshot;
    }
};
vm.createContext(context);

for (const name of [
    'firstTimedTickForLine',
    'commitTvPresentationLine',
    'advanceTvVisualTicks',
    'resolveTvLineActivation',
    'findActiveLineIndexesAtTicks',
    'activeLineWordTicks'
]) {
    vm.runInContext(extractFunction(name), context);
}

const media = {
    paused: false,
    seeking: false,
    playbackRate: 1
};

/* Projected timing advances first: TV must hold the new line until host focus. */
let activation = context.resolveTvLineActivation(
    1,
    373000000,
    1100,
    media
);
assert.strictEqual(activation.activeLine, 0);
assert.strictEqual(state.tvPendingLine, 1);
assert.deepStrictEqual(
    Array.from(context.findActiveLineIndexesAtTicks(373000000, activation.activeLine)),
    [0],
    'the new swipe must not start before the TV host moves focus'
);

/* Focus/class commit: both real overlapping lines become current together. */
state.tvHostLine = 1;
state.tvFocusedLine = 1;
state.tvHostSignalAt = 1110;
snapshot = { index: 1, neutralCount: 1, phasedCount: 1 };
activation = context.resolveTvLineActivation(
    1,
    373200000,
    1120,
    media
);
assert.strictEqual(activation.activeLine, 1);
assert.strictEqual(state.tvActivationSource, 'host-focus');
assert.strictEqual(state.tvArmUntil, 1210);
assert.strictEqual(activation.wordTicks, 372840000);
assert.deepStrictEqual(
    Array.from(context.findActiveLineIndexesAtTicks(373200000, activation.activeLine)),
    [0, 1]
);

/* The outgoing overlap uses the real clock; the new/current line uses TV arm. */
assert.strictEqual(
    context.activeLineWordTicks(0, 1, activation.wordTicks, 373200000),
    373200000
);
assert.strictEqual(
    context.activeLineWordTicks(1, 1, activation.wordTicks, 373200000),
    372840000
);

/* At the older line's own end, only the newer line remains. */
assert.deepStrictEqual(
    Array.from(context.findActiveLineIndexesAtTicks(382650000, 1)),
    [1]
);

/* Same-start background + main lanes share the TV visual clock exactly. */
state.lineData = [
    { startTicks: 441960000, endTicks: 456030000 },
    { startTicks: 441960000, endTicks: 480190000 }
];
state.lineEndPrefix = [456030000, 480190000];
assert.strictEqual(
    context.activeLineWordTicks(0, 1, 441960000, 445000000),
    441960000,
    'background lane must not swipe before the synchronized main lane on TV'
);
assert.deepStrictEqual(
    Array.from(context.findActiveLineIndexesAtTicks(445000000, 1)),
    [0, 1]
);
assert.deepStrictEqual(
    Array.from(context.findActiveLineIndexesAtTicks(456030000, 1)),
    [1]
);

/* Seek/reset commits immediately and bypasses the host wait/arm. */
state.tvForceTimingCommit = true;
state.tvPresentationLine = 0;
state.tvPendingLine = 1;
activation = context.resolveTvLineActivation(
    1,
    470000000,
    1500,
    media
);
assert.strictEqual(activation.activeLine, 1);
assert.strictEqual(state.tvActivationSource, 'clock-reset');
assert.strictEqual(state.tvArmUntil, 0);
assert.strictEqual(activation.wordTicks, 470000000);

console.log('TV overlap/background activation: 20 assertions passed.');
