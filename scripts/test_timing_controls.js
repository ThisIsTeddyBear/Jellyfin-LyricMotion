'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src', 'jellyfin-lyric-motion.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src', 'jellyfin-lyric-motion.css'), 'utf8');
let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }
function eq(actual, expected, message) { assert.strictEqual(actual, expected, message); assertions += 1; }

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
    for (let i = bodyStart; i < source.length; i += 1) {
        const c = source[i];
        const n = source[i + 1];
        if (lineComment) { if (c === '\n') lineComment = false; continue; }
        if (blockComment) { if (c === '*' && n === '/') { blockComment = false; i += 1; } continue; }
        if (quote) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) quote = ''; continue; }
        if (c === '/' && n === '/') { lineComment = true; i += 1; continue; }
        if (c === '/' && n === '*') { blockComment = true; i += 1; continue; }
        if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
        if (c === '{') depth += 1;
        if (c === '}') { depth -= 1; if (depth === 0) return source.slice(start, i + 1); }
    }
    throw new Error(`unterminated ${name}`);
}

const store = new Map();
const context = {
    state: {
        timingOffsetSeconds: 0,
        timingOffsetChangeCount: 0,
        songPreferenceKey: 'song:a',
        songPreferences: Object.create(null),
        romanizationMode: 'native',
        lyricsAcceptedKey: '',
        lyricsRequestKey: ''
    },
    TICKS_PER_SECOND: 10000000,
    TIMING_OFFSET_MIN_SECONDS: -15,
    TIMING_OFFSET_MAX_SECONDS: 15,
    TIMING_OFFSET_STEP_SECONDS: 0.5,
    SONG_PREFERENCES_MAX_ENTRIES: 300,
    SONG_PREFERENCES_STORAGE_KEY: 'prefs',
    localStorage: {
        getItem(key) { return store.has(key) ? store.get(key) : null; },
        setItem(key, value) { store.set(key, String(value)); },
        removeItem(key) { store.delete(key); }
    },
    songPreferenceKeyForLyrics() { return context.state.songPreferenceKey; },
    updateRomanizationToggleUi() {},
    updateTimingControlsUi() {}
};
vm.createContext(context);
vm.runInContext([
    'finiteNumber',
    'clampTimingOffsetSeconds',
    'pruneSongPreferences',
    'persistSongPreferences',
    'persistCurrentSongPreference',
    'applySongPreferences',
    'formatTimingOffset',
    'applyUserTimingOffsetTicks'
].map(extractFunction).join('\n'), context);

// Offset semantics: + delay means lyrics render later (timeline behind media).
eq(context.clampTimingOffsetSeconds(99), 15, 'positive offset is clamped');
eq(context.clampTimingOffsetSeconds(-99), -15, 'negative offset is clamped');
eq(context.formatTimingOffset(0), '+0.0s', 'zero display');
eq(context.formatTimingOffset(0.5), '+0.5s', 'positive delay display');
eq(context.formatTimingOffset(-0.5), '-0.5s', 'negative earlier display');
context.state.timingOffsetSeconds = 0.5;
eq(context.applyUserTimingOffsetTicks(100000000), 95000000, '+0.5s delays lyrics by half a second');
context.state.timingOffsetSeconds = -0.5;
eq(context.applyUserTimingOffsetTicks(100000000), 105000000, '-0.5s advances lyrics by half a second');

// Song-scoped preference model keeps romanization and sync offset together.
context.state.songPreferenceKey = 'song:a';
context.state.romanizationMode = 'romanized';
context.state.timingOffsetSeconds = 1.5;
ok(context.persistCurrentSongPreference(), 'song preference persisted');
eq(context.state.songPreferences['song:a'].romanization, 'romanized', 'romanization is song-scoped');
eq(context.state.songPreferences['song:a'].timingOffsetSeconds, 1.5, 'timing offset is song-scoped');

context.state.songPreferenceKey = 'song:b';
context.state.romanizationMode = 'native';
context.state.timingOffsetSeconds = -0.5;
context.persistCurrentSongPreference();
eq(context.state.songPreferences['song:b'].timingOffsetSeconds, -0.5, 'second song gets independent offset');

context.state.songPreferenceKey = 'song:a';
context.state.romanizationMode = 'native';
context.state.timingOffsetSeconds = 0;
context.applySongPreferences();
eq(context.state.romanizationMode, 'romanized', 'stored song romanization restores');
eq(context.state.timingOffsetSeconds, 1.5, 'stored song timing restores');

context.state.songPreferenceKey = 'song:b';
context.applySongPreferences();
eq(context.state.romanizationMode, 'native', 'other song native mode restores');
eq(context.state.timingOffsetSeconds, -0.5, 'other song offset restores');

context.state.romanizationMode = 'native';
context.state.timingOffsetSeconds = 0;
context.persistCurrentSongPreference();
ok(!context.state.songPreferences['song:b'], 'default per-song settings are pruned');

// Bounded preference store cannot grow forever.
context.state.songPreferences = Object.create(null);
for (let i = 0; i < 305; i += 1) {
    context.state.songPreferences[`old:${i}`] = {
        romanization: 'native',
        timingOffsetSeconds: 0.5,
        updatedAt: i
    };
}
context.pruneSongPreferences();
eq(Object.keys(context.state.songPreferences).length, 300, 'preference store is bounded to 300 entries');
ok(!context.state.songPreferences['old:0'], 'oldest preference is evicted first');
ok(context.state.songPreferences['old:304'], 'newest preference is retained');

// DOM contract from the user request.
for (const id of [
    'lyrics-timing-minus-btn',
    'lyrics-timing-display',
    'lyrics-timing-plus-btn',
    'lyrics-timing-reset-btn'
]) {
    ok(source.includes(`'${id}'`), `${id} is implemented`);
}
ok(source.includes('Decrease delay (lyrics earlier) -0.5s'), 'minus control semantics match request');
ok(source.includes('Increase delay (lyrics later) +0.5s'), 'plus control semantics match request');
ok(source.includes('setTimingOffset: setTimingOffsetSeconds'), 'timing API is exposed');
ok(source.includes('adjustTimingOffset: adjustTimingOffsetSeconds'), 'timing adjustment API is exposed');
ok(source.includes('applyUserTimingOffsetTicks(timelineTicks)'), 'user timing offset is applied to final lyric timeline');
ok((source.match(/applyUserTimingOffsetTicks\(timelineTicks\)/g) || []).length === 1, 'timing correction is applied exactly once to the final timeline');
ok(extractFunction('invalidateTimingPaintState').includes('wakeAnimationLoop()'), 'timing changes bypass paused low-rate timer and wake immediately');
ok(!extractFunction('setTimingOffsetSeconds').includes('currentTime'), 'timing correction never seeks or writes media playback time');
ok(source.includes('TIMING_OFFSET_STEP_SECONDS = 0.5'), 'UI timing step is exactly 0.5 seconds');
ok(source.includes('removeTimingControls();'), 'route/lifecycle cleanup removes timing controls');
ok(source.indexOf('if (stockTvEnvironment.detected)') < source.indexOf('const SONG_PREFERENCES_STORAGE_KEY'), 'TV exits before timing/romanization runtime');
ok(css.includes('.ak-lyrics-tools .ak-lyrics-timing-controls'), 'timing control styling is scoped behind LyricMotion-owned host');
ok(css.includes('font-variant-numeric: tabular-nums'), 'timing display avoids width jitter');

console.log(`Romanization + timing controls contract: ${assertions} assertions passed.`);
