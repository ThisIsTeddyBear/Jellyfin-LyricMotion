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

let assertions = 0;
function ok(value, message) {
    assert(value, message);
    assertions += 1;
}
function equal(actual, expected, message) {
    assert.strictEqual(actual, expected, message);
    assertions += 1;
}

/* Duplicate injection must fail closed before any hooks are installed. */
ok(source.includes('duplicate runtime ignored; active version'), 'duplicate runtime guard missing');
ok(source.indexOf('duplicate runtime ignored; active version') < source.indexOf('installFetchInterceptor();'), 'duplicate guard must run before hooks');

/* Old webOS must never parse a Unicode-property regex literal. */
ok(source.includes("new RegExp('\\\\p{Mark}', 'u')"), 'dynamic Unicode mark capability probe missing');
ok(source.includes('latinGlyphExpression ='), 'Latin capability probe missing');
ok(!/\/[^\n/]*\\p\{[^\n/]*\/[a-z]*/.test(source), 'Unicode-property regex literal would be a parse-time trap');

/* replaceChildren is optional on older embedded Chromium/WebKit. */
ok(source.includes('function replaceChildrenCompat('), 'replaceChildren compatibility helper missing');
ok(source.includes("typeof element.replaceChildren === 'function'"), 'replaceChildren feature detection missing');
ok(source.includes('while (element.firstChild)'), 'replaceChildren fallback missing');
ok(source.includes('function directChildByClass('), 'direct-child compatibility helper missing');
ok(source.includes('function removeNodeCompat('), 'node-removal compatibility helper missing');
ok(!source.includes("':scope > .ak-motion-layer'"), ':scope motion lookup must not remain');
ok(!source.includes("':scope > .ak-atmosphere'"), ':scope atmosphere lookup must not remain');

/* Geometry invalidation must not retain stale word/segment measurements. */
const clearMotionLayerSource = extractFunction('clearMotionLayer');
ok(clearMotionLayerSource.includes('word.geometryReady = false'), 'geometryReady not invalidated');
ok(clearMotionLayerSource.includes("word.geometrySource = 'unprepared'"), 'geometrySource not invalidated');
ok(clearMotionLayerSource.includes('word.renderWidth = 0'), 'renderWidth not invalidated');
ok(clearMotionLayerSource.includes('delete segment.visualStart'), 'segment visualStart not invalidated');
ok(clearMotionLayerSource.includes('delete segment.visualEnd'), 'segment visualEnd not invalidated');

/* Runtime should be completely dormant outside a live decorated lyric page. */
const loopState = { lyrics: [{ Text: 'x' }], lineData: [{}] };
const loopContext = {
    state: loopState,
    document: { hidden: false },
    isLyricsPage: () => true
};
vm.createContext(loopContext);
vm.runInContext(extractFunction('shouldRunAnimationLoop'), loopContext);
equal(loopContext.shouldRunAnimationLoop(), true, 'live lyrics page should run');
loopContext.document.hidden = true;
equal(loopContext.shouldRunAnimationLoop(), false, 'hidden document should stop');
loopContext.document.hidden = false;
loopState.lyrics = null;
equal(loopContext.shouldRunAnimationLoop(), false, 'missing lyric model should stop');
loopState.lyrics = [{ Text: 'x' }];
loopState.lineData = [];
equal(loopContext.shouldRunAnimationLoop(), false, 'undecorated lyric DOM should stop');
loopState.lineData = [{}];
loopContext.isLyricsPage = () => false;
equal(loopContext.shouldRunAnimationLoop(), false, 'non-lyrics route should stop');

const startupSlice = source.slice(
    source.indexOf('state.performanceProfile ='),
    source.indexOf('function rendererFingerprint()')
);
ok(!/\bensureAnimationLoop\s*\(\s*\)\s*;/.test(startupSlice), 'animation loop must not start globally at boot');
ok(source.includes('MEDIA_DISCOVERY_RETRY_MS = 250'), 'bounded media discovery cadence missing');
ok(source.includes("'document-hidden'"), 'visibility shutdown missing');
ok(source.includes("'route-leave'"), 'route-leave shutdown missing');

/* Decoration retries must be bounded and route/data aware. */
ok(source.includes('DECORATION_RETRY_WINDOW_MS = 6000'), 'bounded decoration window missing');
ok(source.includes('state.decorationRetryExpiredCount += 1'), 'decoration expiry diagnostic missing');
ok(source.includes('cancelDecorationRetry(true)'), 'decoration retry cancellation missing');
const decorationAttempt = extractFunction('runDecorationAttempt');
ok(decorationAttempt.includes('!state.lyrics'), 'decoration retry must stop without lyrics');
ok(decorationAttempt.includes('!isLyricsPage()'), 'decoration retry must stop off-route');

/* URL extraction must handle fetch(string), Request-like and URL objects. */
const fetchContext = {
    URL,
};
vm.createContext(fetchContext);
vm.runInContext(extractFunction('fetchInputUrl'), fetchContext);
equal(fetchContext.fetchInputUrl('/Items/a/Lyrics'), '/Items/a/Lyrics');
equal(fetchContext.fetchInputUrl({ url: '/Items/b/Lyrics' }), '/Items/b/Lyrics');
equal(fetchContext.fetchInputUrl(new URL('http://localhost/Items/c/Lyrics')), 'http://localhost/Items/c/Lyrics');

/* Missing/removed same-song lyrics must clear stale model for both transports. */
ok(source.includes('response.status === 204'), 'fetch 204 clearing missing');
ok(source.includes('response.status === 404'), 'fetch 404 clearing missing');
ok(source.includes("'fetch-empty'"), 'fetch empty-response source missing');
ok(source.includes('this.status === 204'), 'XHR 204 clearing missing');
ok(source.includes('this.status === 404'), 'XHR 404 clearing missing');
ok(source.includes("'XMLHttpRequest-empty'"), 'XHR empty-response source missing');
ok(source.includes('function retireDecoratedLines('), 'retired lyric DOM cleanup missing');
ok(source.includes("element.style.visibility = 'hidden'"), 'stale lyric DOM must hide immediately');
ok(source.includes('element.dataset.akGeneration'), 'DOM generation tagging missing');

/* Media replacement must not let old elements mutate timing state. */
ok(source.includes('function mediaElementScore('), 'media candidate scoring missing');
ok(source.includes('state.mediaSwitchCount += 1'), 'media switch counter missing');
ok(source.includes('state.staleMediaEventDrops += 1'), 'stale media event guard missing');
ok(source.includes('state.mediaProbeAt = 0'), 'metadata event should force media re-probe');

/* Atmosphere work must dedupe, timeout, and be invalidatable on route/song/profile changes. */
ok(source.includes('ATMOSPHERE_IMAGE_TIMEOUT_MS = 6500'), 'artwork timeout missing');
ok(source.includes('state.atmospherePendingKey'), 'pending artwork dedupe missing');
ok(source.includes('state.atmosphereTimeoutCount += 1'), 'artwork timeout counter missing');
ok(source.includes("invalidateAtmosphereLoads('lyrics-accepted')"), 'new-song atmosphere invalidation missing');
ok(source.includes("invalidateAtmosphereLoads(\n                'performance-profile-change'"), 'profile-change atmosphere invalidation missing');
ok(source.includes("invalidateAtmosphereLoads(\n                    'route-leave'"), 'route-leave atmosphere invalidation missing');
ok(source.includes('key !== atmosphereMediaKey(media)'), 'stale artwork media-key check missing');

/* TV is deliberately outside LyricMotion in this branch. */
ok(source.includes('function detectStockJellyfinTvEnvironment()'), 'stock TV detector missing');
ok(source.includes("reason: 'tv-stock-bypass'"), 'stock TV bypass marker missing');
ok(source.includes("renderer: 'stock-jellyfin'"), 'stock Jellyfin TV renderer marker missing');
ok(!source.includes('TV_ACTIVATION_DEDUPE_MS'), 'retired TV activation code should be absent');
ok(!source.includes('function ensureTvLayoutObservers'), 'retired TV layout observers should be absent');
ok(!source.includes('handleTvLyricActivationIntent'), 'retired TV activation handler should be absent');

ok(source.includes("'pagehide'"), 'pagehide lifecycle shutdown missing');
ok(source.includes("'pageshow'"), 'pageshow lifecycle recovery missing');

/* Route detection must prefer the SPA hash over stale detached/hidden DOM. */
const routeContext = {
    ROUTE_RE: /^#?!?\/?lyrics(?:[/?#]|$)/i,
    location: { hash: '#/music?returnUrl=/lyrics' },
    document: { querySelector: () => ({ stale: true }) }
};
vm.createContext(routeContext);
vm.runInContext(extractFunction('isLyricsPage'), routeContext);
equal(routeContext.isLyricsPage(), false, 'query containing /lyrics must not activate route');
routeContext.location.hash = '#/lyrics';
equal(routeContext.isLyricsPage(), true, 'actual lyrics route must activate');
routeContext.location.hash = '';
routeContext.getCurrentLyricsContainer = () => ({ live: true });
routeContext.elementHasLiveLayout = () => false;
equal(routeContext.isLyricsPage(), false, 'empty-hash hidden lyrics DOM must not activate route');
routeContext.elementHasLiveLayout = () => true;
equal(routeContext.isLyricsPage(), true, 'empty-hash live lyrics DOM may activate route');

/* Late font/orientation changes must invalidate measured multilingual geometry. */
ok(source.includes('function installFontGeometryHooks()'), 'font geometry hook missing');
ok(source.includes("fonts.addEventListener('loadingdone', refreshForFonts)"), 'FontFaceSet loadingdone refresh missing');
ok(source.includes('fonts.ready.then(refreshForFonts)'), 'FontFaceSet ready refresh missing');
ok(source.includes("'orientationchange'"), 'orientation geometry refresh missing');
ok(source.includes('fontGeometryRefreshCount'), 'font geometry diagnostic missing');

/* Public diagnostics should expose the new lifecycle/race counters. */
for (const token of [
    'animationLoopRunning',
    'animationLoopStarts',
    'animationLoopStops',
    'decorationRetryExpiredCount',
    'mediaSwitchCount',
    'staleMediaEventDrops',
    'atmosphereTimeoutCount',
    'tvPolicy'
]) {
    ok(source.includes(token), `diagnostic token missing: ${token}`);
}

console.log(`Full-experience audit contract: ${assertions} assertions passed.`);
