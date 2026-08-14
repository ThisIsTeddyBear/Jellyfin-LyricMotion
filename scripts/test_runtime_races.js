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
        if (lineComment) {
            if (c === '\n') lineComment = false;
            continue;
        }
        if (blockComment) {
            if (c === '*' && n === '/') {
                blockComment = false;
                i += 1;
            }
            continue;
        }
        if (quote) {
            if (escaped) escaped = false;
            else if (c === '\\') escaped = true;
            else if (c === quote) quote = '';
            continue;
        }
        if (c === '/' && n === '/') {
            lineComment = true;
            i += 1;
            continue;
        }
        if (c === '/' && n === '*') {
            blockComment = true;
            i += 1;
            continue;
        }
        if (c === '"' || c === "'" || c === '`') {
            quote = c;
            continue;
        }
        if (c === '{') depth += 1;
        if (c === '}') {
            depth -= 1;
            if (depth === 0) return source.slice(start, i + 1);
        }
    }
    throw new Error(`unterminated function ${name}`);
}

const state = {
    lyrics: null,
    generation: 0,
    decoratedGeneration: -1,
    lyricsRequestSeq: 0,
    lyricsRequestKey: '',
    lyricsRequestKeys: new Map(),
    lyricsAcceptedKey: '',
    lyricsAcceptedSeq: 0,
    lyricsStaleResponseDrops: 0,
    atmosphereMediaKey: '',
    atmosphereFailedKey: '',
    timedCueCount: 0,
    backgroundVocalCount: 0,
    lineData: [],
    lastActiveLine: -999,
    lastActiveLineSignature: '',
    activeLineIndexes: [],
    lineEndPrefix: [],
    overlapFrameCount: 0,
    maxSimultaneousLines: 1,
    geometryTimer: 0,
    atmosphereRoot: null,
    atmosphereArtwork: '',
    atmosphereSource: 'none',
    atmosphereColors: null
};

let decorations = 0;
const context = {
    state,
    ROUTE_RE: /^#?!?\/?lyrics(?:[/?#]|$)/i,
    location: { hash: '', href: 'http://localhost:8096/web/index.html#/lyrics' },
    URL,
    document: {
        querySelector() { return { fake: true }; }
    },
    getCurrentLyricsContainer() {
        return { fake: true, isConnected: true };
    },
    elementHasLiveLayout() { return true; },
    isLyricsUrl(url) {
        return typeof url === 'string' && /\/lyrics(?:[/?#]|$)/i.test(url);
    },
    lyricValue(lyric, pascal, camel) {
        return lyric[pascal] !== undefined ? lyric[pascal] : lyric[camel];
    },
    selectSongAccent() {},
    resetPlaybackClock() {},
    applySongPreferences() {},
    cancelDecorationRetry() {},
    invalidateAtmosphereLoads() {},
    stopAnimationLoop() {},
    retireDecoratedLines() {},
    clearTimeout() {},
    log() {},
    warn() {},
    queueDecoration() { decorations += 1; }
};

vm.createContext(context);
vm.runInContext([
    'normalizeLyricsPayload',
    'clearCapturedLyrics',
    'lyricsRequestIdentity',
    'lyricItemIdFromUrl',
    'isLyricsUrl',
    'fetchInputMethod',
    'isLyricsReadMethod',
    'beginLyricsRequest',
    'acceptLyricsPayload',
    'isLyricsPage'
].map(extractFunction).join('\n'), context);

let assertions = 0;
const first = context.beginLyricsRequest('/Items/old/Lyrics');
const second = context.beginLyricsRequest('/Items/new/Lyrics');
assert.strictEqual(first, 1);
assertions += 1;
assert.strictEqual(second, 2);
assertions += 1;

/* Same-song refreshes get distinct generations so the latest response wins. */
const duplicateSecond = context.beginLyricsRequest(
    'http://localhost:8096/Items/new/Lyrics?api_key=secret&ts=123'
);
assert.strictEqual(duplicateSecond, 3);
assertions += 1;
assert.strictEqual(
    context.lyricsRequestIdentity('/Lyrics?itemId=ABC&api_key=one'),
    context.lyricsRequestIdentity('/Lyrics?api_key=two&itemId=ABC')
);
assertions += 1;

const oldPayload = { Lyrics: [{ Text: 'old', Cues: [] }] };
const newPayload = { Lyrics: [{ Text: 'new', Cues: [] }] };

assert.strictEqual(
    context.acceptLyricsPayload(oldPayload, 'fetch', first),
    false
);
assertions += 1;
assert.strictEqual(state.lyrics, null);
assertions += 1;
assert.strictEqual(state.lyricsStaleResponseDrops, 1);
assertions += 1;

/* An older same-song response may fill the UI while the refresh is pending. */
assert.strictEqual(
    context.acceptLyricsPayload(newPayload, 'fetch', second),
    true
);
assertions += 1;
assert.strictEqual(state.lyrics[0].Text, 'new');
assertions += 1;
assert.strictEqual(state.lyricsAcceptedSeq, second);
assertions += 1;

const refreshedPayload = { Lyrics: [{ Text: 'newest', Cues: [] }] };
assert.strictEqual(
    context.acceptLyricsPayload(refreshedPayload, 'fetch', duplicateSecond),
    true
);
assertions += 1;
assert.strictEqual(state.lyrics[0].Text, 'newest');
assertions += 1;
assert.strictEqual(state.lyricsAcceptedSeq, duplicateSecond);
assertions += 1;
assert.strictEqual(state.lyricsAcceptedKey, '/items/new/lyrics');
assertions += 1;
assert.strictEqual(decorations, 2);
assertions += 1;

/* Once a newer same-song response wins, a late older refresh cannot overwrite it. */
const olderRefresh = context.beginLyricsRequest('/Items/new/Lyrics?ts=older');
const newerRefresh = context.beginLyricsRequest('/Items/new/Lyrics?ts=newer');
assertions += 2;
assert.strictEqual(
    context.acceptLyricsPayload({ Lyrics: [{ Text: 'newest-2', Cues: [] }] }, 'fetch', newerRefresh),
    true
);
assertions += 1;
assert.strictEqual(
    context.acceptLyricsPayload({ Lyrics: [{ Text: 'late-old', Cues: [] }] }, 'fetch', olderRefresh),
    false
);
assertions += 1;
assert.strictEqual(state.lyrics[0].Text, 'newest-2');
assertions += 1;
assert.strictEqual(state.lyricsStaleResponseDrops, 2);
assertions += 1;

/* A -> B -> A is a separate track session even though the final URL key
 * matches the first one. A very late response from the first A must not leak
 * into the second A session (ABA race). */
const abaAFirst = context.beginLyricsRequest('/Items/aba-a/Lyrics');
const abaB = context.beginLyricsRequest('/Items/aba-b/Lyrics');
const abaASecond = context.beginLyricsRequest('/Items/aba-a/Lyrics');
assertions += 3;
assert.strictEqual(
    context.acceptLyricsPayload({ Lyrics: [{ Text: 'stale-aba-a', Cues: [] }] }, 'fetch', abaAFirst),
    false
);
assertions += 1;
assert.strictEqual(state.lyrics, null);
assertions += 1;
assert.strictEqual(
    context.acceptLyricsPayload({ Lyrics: [{ Text: 'fresh-aba-a', Cues: [] }] }, 'fetch', abaASecond),
    true
);
assertions += 1;
assert.strictEqual(state.lyrics[0].Text, 'fresh-aba-a');
assertions += 1;
void abaB;

/* Latest empty/no-lyrics response clears the previous accepted model. */
const third = context.beginLyricsRequest('/Items/no-lyrics/Lyrics');
assertions += 1;
assert.strictEqual(third, abaASecond + 1);
assertions += 1;
assert.strictEqual(state.lyrics, null);
assertions += 1;
assert.strictEqual(state.lyricsAcceptedKey, '');
assertions += 1;
assert.strictEqual(
    context.acceptLyricsPayload({ Lyrics: [] }, 'fetch', third),
    true
);
assertions += 1;
assert.strictEqual(state.lyrics, null);
assertions += 1;
assert.strictEqual(state.timedCueCount, 0);
assertions += 1;

/* Only Jellyfin lyric API shapes are intercepted; unrelated /lyrics URLs are ignored. */
assert.strictEqual(context.isLyricsUrl('/Items/abc/Lyrics'), true); assertions += 1;
assert.strictEqual(context.isLyricsUrl('/Audio/abc/Lyrics?api_key=x'), true); assertions += 1;
assert.strictEqual(context.isLyricsUrl('/Lyrics/abc'), true); assertions += 1;
assert.strictEqual(context.isLyricsUrl('/Lyrics?itemId=abc'), true); assertions += 1;
assert.strictEqual(context.isLyricsUrl('/plugins/example/lyrics'), false); assertions += 1;
assert.strictEqual(context.isLyricsUrl('/Lyrics'), false); assertions += 1;

/* The same official /Audio/{itemId}/Lyrics route is also used for write
 * operations. Only GET responses are lyric-display payloads. */
assert.strictEqual(context.fetchInputMethod('/Audio/abc/Lyrics', undefined), 'GET'); assertions += 1;
assert.strictEqual(context.fetchInputMethod({ url: '/Audio/abc/Lyrics', method: 'post' }, undefined), 'POST'); assertions += 1;
assert.strictEqual(context.fetchInputMethod({ url: '/Audio/abc/Lyrics', method: 'get' }, { method: 'DELETE' }), 'DELETE'); assertions += 1;
assert.strictEqual(context.isLyricsReadMethod('GET'), true); assertions += 1;
assert.strictEqual(context.isLyricsReadMethod('post'), false); assertions += 1;
assert.strictEqual(context.isLyricsReadMethod('DELETE'), false); assertions += 1;
assert(source.includes('isLyricsReadMethod(requestMethod)')); assertions += 1;
assert(source.includes('this.__appleKaraokeMethod')); assertions += 1;

/* A non-lyrics SPA hash must beat a stale lyrics container left in the DOM. */
context.location.hash = '#/music';
assert.strictEqual(context.isLyricsPage(), false);
assertions += 1;
context.location.hash = '#/music?returnUrl=/lyrics';
assert.strictEqual(context.isLyricsPage(), false);
assertions += 1;
context.location.hash = '#/lyrics';
assert.strictEqual(context.isLyricsPage(), true);
assertions += 1;
context.location.hash = '';
assert.strictEqual(context.isLyricsPage(), true);
assertions += 1;

assert(source.includes('lyricsStaleResponseDrops'));
assertions += 1;
assert(source.includes('beginLyricsRequest(requestUrl)'));
assertions += 1;
assert(source.includes('this.__appleKaraokeLyricsSeq'));
assertions += 1;
assert(source.includes('document.hidden || !isLyricsPage() || !state.lyrics'));
assertions += 1;
assert(!source.includes('const watchChrome ='));
assertions += 1;
assert(source.includes('node.matches(lyricSelector)'));
assertions += 1;

console.log(`Runtime race/route contract: ${assertions} assertions passed.`);
