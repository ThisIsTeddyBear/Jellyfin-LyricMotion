'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let runtimeSource = fs.readFileSync(
    path.join(ROOT, 'src', 'jellyfin-lyric-motion.js'),
    'utf8'
);

runtimeSource = runtimeSource.replace(
    /\n\}\)\(\);\s*$/,
    `\n    window.__LyricMotionCoreTest = {\n        isLyricsUrl,\n        lyricsRequestIdentity,\n        lyricsResponseDisposition,\n        beginLyricsRequest,\n        acceptLyricsPayload,\n        clearCapturedLyrics,\n        getJellyfinActiveLineIndex,\n        cueEndTicks,\n        finiteTick,\n        orderedCuesBySourcePosition,\n        getStartTimeTicksFromUrl,\n        chooseTimelineTicks,\n        sourceTimelineTicks,\n        currentUnadjustedTimelineTicks,\n        resetPlaybackClock,\n        clampTimingOffsetSeconds,\n        setTimingOffsetSeconds,\n        adjustTimingOffsetSeconds,\n        resetTimingOffsetValue,\n        undoTimingOffset,\n        captureTimingSync,\n        handleTimingPickClick,\n        handleTimingPopoverDismissPointerDown,\n        handleLyricSeekClick,\n        focusLyricLineIndex,\n        suspendLyricAutoFollow,\n        resumeLyricAutoFollow,\n        applyUserTimingOffsetTicks,\n        removeUserTimingOffsetTicks,\n        mediaSeekSecondsForTimelineTicks,\n        readPerformanceMode,\n        detectPerformanceProfile,\n        setPerformanceMode,\n        readAccentMode,\n        applyAccentTheme,\n        selectSongAccent,\n        songPreferenceKeyForLyrics,\n        timingTimelineFingerprint,\n        applySongPreferences,\n        persistCurrentSongPreference,\n        readAtmosphereMode,\n        setAtmosphereMode,\n        maybeRefreshAtmosphere,\n        updateWordVisual,\n        wordTargetProgress,\n        smoothWordProgress,\n        classicGlowEnergies,\n        createInstrumentalGapRow,\n        instrumentalWaveGeometry,\n        setInstrumentalGapFill,\n        installLyricVisualWatchdog,\n        shouldRunAnimationLoop,\n        wakeAnimationLoop,\n        renderFrame,\n        activateDynamicBackgroundAtmosphere,\n        dynamicArtworkFingerprintFromPixels,\n        dynamicArtworkFingerprintsEquivalent,\n        dynamicRequestStillCurrent,\n        normalizedMediaSource,\n        lyricDomIdentity,\n        lyricsDomReadyForPayload,\n        lineRecordHealthy,\n        instrumentalGapRowsHealthy,\n        lyricVisualDomHealthy,\n        dynamicDomArtworkCandidateAllowed,\n        dynamicDomArtworkSignalsPresence,\n        dynamicDomArtworkTiming,\n        mediaElementScore,\n        rendererFingerprint,\n        state,\n        accents: PREMIUM_ACCENTS,\n        TICKS_PER_SECOND\n    };\n})();\n`
);

class MockStyle {
    constructor() { this.values = new Map(); }
    setProperty(name, value) { this.values.set(String(name), String(value)); }
    removeProperty(name) { this.values.delete(String(name)); }
    getPropertyValue(name) { return this.values.get(String(name)) || ''; }
}

class MockElement {
    constructor(tag = 'div') {
        this.tagName = String(tag).toUpperCase();
        this.children = [];
        this.parentNode = null;
        this.dataset = {};
        this.style = new MockStyle();
        this.attributes = new Map();
        this.isConnected = true;
        this.hidden = false;
        this._classes = new Set();
        this._matches = new Set();
        this._query = new Map();
        this._queryAll = new Map();
        this.classList = {
            add: (...names) => names.forEach(name => this._classes.add(String(name))),
            remove: (...names) => names.forEach(name => this._classes.delete(String(name))),
            contains: name => this._classes.has(String(name)),
            toggle: (name, force) => {
                const key = String(name);
                if (force === true) { this._classes.add(key); return true; }
                if (force === false) { this._classes.delete(key); return false; }
                if (this._classes.has(key)) { this._classes.delete(key); return false; }
                this._classes.add(key); return true;
            }
        };
    }
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; }
    insertBefore(child, reference) { child.parentNode = this; const index = this.children.indexOf(reference); if (index < 0) this.children.push(child); else this.children.splice(index, 0, child); return child; }
    removeChild(child) { this.children = this.children.filter(x => x !== child); child.parentNode = null; return child; }
    setAttribute(name, value) { this.attributes.set(String(name), String(value)); }
    getAttribute(name) { return this.attributes.has(String(name)) ? this.attributes.get(String(name)) : null; }
    removeAttribute(name) { this.attributes.delete(String(name)); }
    addEventListener() {}
    removeEventListener() {}
    querySelector(selector) { return this._query.get(String(selector)) || null; }
    querySelectorAll(selector) { return this._queryAll.get(String(selector)) || []; }
    closest(selector) { return selector === '.lyricPage' ? this._lyricPage || null : null; }
    matches(selector) {
        const text = String(selector);
        if (this._matches.has(text)) return true;
        if (text === '[aria-current="true"]') return this.getAttribute('aria-current') === 'true';
        if (text === '[data-current="true"]') return this.dataset.current === 'true';
        if (text === '[data-active="true"]') return this.dataset.active === 'true';
        if (text.startsWith('.')) return this.classList.contains(text.slice(1));
        return false;
    }
    contains(other) {
        if (other === this) return true;
        return this.children.some(child => child.contains && child.contains(other));
    }
    getClientRects() { return this.hidden ? [] : [{}]; }
    getBoundingClientRect() { return { width: 100, height: 30, left: 0, top: 0, right: 100, bottom: 30 }; }
    scrollIntoView(options) {
        if (!this._scrollIntoViewCalls) this._scrollIntoViewCalls = [];
        this._scrollIntoViewCalls.push(options === undefined ? null : options);
    }
}

function storageStub(initial = {}) {
    const values = new Map(Object.entries(initial).map(([k, v]) => [String(k), String(v)]));
    return {
        getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
        setItem(key, value) { values.set(String(key), String(value)); },
        removeItem(key) { values.delete(String(key)); },
        clear() { values.clear(); },
        _values: values
    };
}

function makeContext({ ua = 'Mozilla/5.0 desktop', platform = 'Win32', touch = 0, hash = '#/lyrics', reducedMotion = false, remoteOnlyPointer = false } = {}) {
    const page = new MockElement('div');
    page.classList.add('lyricPage');
    const container = new MockElement('div');
    container.classList.add('lyricsContainer');
    container._lyricPage = page;
    page.appendChild(container);

    const body = new MockElement('body');
    const head = new MockElement('head');
    const html = new MockElement('html');

    let mediaElement = null;
    const document = {
        body,
        head,
        documentElement: html,
        hidden: false,
        readyState: 'complete',
        fonts: null,
        createElement: tag => new MockElement(tag),
        createElementNS: (_ns, tag) => new MockElement(tag),
        createTextNode(text) { const n = new MockElement('#text'); n.textContent = String(text); return n; },
        querySelector(selector) {
            if (selector === '.lyricsContainer' || selector === '.lyricsContainer.ak-karaoke-container') return container;
            if (selector === '.lyricPage') return page;
            if (selector === 'audio,video') return mediaElement;
            return null;
        },
        querySelectorAll(selector) {
            if (selector === '.lyricsContainer' || selector === '.lyricsContainer.ak-karaoke-container') return [container];
            if (selector === '.lyricPage') return [page];
            if (selector === 'audio,video') return mediaElement ? [mediaElement] : [];
            return [];
        },
        getElementsByTagName() { return []; },
        addEventListener() {},
        removeEventListener() {}
    };

    class MockMutationObserver { observe() {} disconnect() {} }
    class MockXHR { open() {} send() {} addEventListener() {} removeEventListener() {} setRequestHeader() {} }
    const localStorage = storageStub();
    const sessionStorage = storageStub();
    const noop = () => {};
    let perfNow = 1000;
    const context = {
        console: { log: noop, info: noop, warn: noop, error: noop, debug: noop },
        document,
        navigator: { userAgent: ua, platform, maxTouchPoints: touch },
        location: { hash, href: 'http://localhost/web/index.html#/lyrics' },
        localStorage,
        sessionStorage,
        MutationObserver: MockMutationObserver,
        XMLHttpRequest: MockXHR,
        fetch: async () => ({ clone() { return this; }, json: async () => ({}) }),
        performance: { now: () => perfNow },
        requestAnimationFrame: () => 1,
        cancelAnimationFrame: noop,
        setTimeout: () => 1,
        clearTimeout: noop,
        setInterval: () => 1,
        clearInterval: noop,
        URL,
        URLSearchParams,
        Map,
        Set,
        WeakMap,
        WeakSet,
        Promise,
        Array,
        Object,
        String,
        Number,
        Boolean,
        RegExp,
        Date,
        Math,
        JSON,
        Error,
        TypeError,
        Uint8Array,
        Uint16Array,
        Uint32Array,
        Intl,
        TextEncoder,
        TextDecoder,
        Event: class Event {},
        CustomEvent: class CustomEvent {},
        HTMLElement: MockElement,
        Element: MockElement,
        Node: MockElement,
        getComputedStyle: () => ({ getPropertyValue: () => '', display: 'block', visibility: 'visible' }),
        matchMedia: query => ({ matches: String(query).includes('prefers-reduced-motion') ? reducedMotion : (String(query).includes('(hover: none)') ? remoteOnlyPointer : false), addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop })
    };
    context.window = context;
    context.globalThis = context;
    context.window.addEventListener = noop;
    context.window.removeEventListener = noop;
    context._page = page;
    context._container = container;
    context._setPerfNow = value => { perfNow = Number(value); };
    context._setMedia = value => { mediaElement = value; };
    return vm.createContext(context);
}

function loadCore(options) {
    const context = makeContext(options);
    vm.runInContext(runtimeSource, context, { filename: 'jellyfin-lyric-motion.core-test.js' });
    return { context, api: context.window.__LyricMotionCoreTest, publicApi: context.window.JellyfinLyricMotion };
}

// URL capture, normalization and item-id extraction.
{
    const { api } = loadCore();
    assert(api.isLyricsUrl('/Audio/ABC/Lyrics'));
    assert(api.isLyricsUrl('/Items/ABC/Lyrics?api_key=secret'));
    assert(api.isLyricsUrl('/Lyrics?itemId=ABC'));
    assert(!api.isLyricsUrl('/Items/ABC'));
    assert.strictEqual(
        api.lyricsRequestIdentity('http://x/Audio/ABC/Lyrics?api_key=one&foo=2'),
        '/audio/abc/lyrics'
    );
}

// Response status policy: only successful JSON and authoritative empty
// statuses may mutate the live lyric model.
{
    const { api } = loadCore();
    assert.strictEqual(api.lyricsResponseDisposition(200), 'json');
    assert.strictEqual(api.lyricsResponseDisposition(206), 'json');
    assert.strictEqual(api.lyricsResponseDisposition(204), 'empty');
    assert.strictEqual(api.lyricsResponseDisposition(404), 'empty');
    assert.strictEqual(api.lyricsResponseDisposition(401), 'ignore');
    assert.strictEqual(api.lyricsResponseDisposition(500), 'ignore');
    assert.strictEqual(api.lyricsResponseDisposition(0), 'ignore');
}

// Stale response protection including A -> B -> A ABA switching.
{
    const { api } = loadCore();
    const payload = { Lyrics: [{ Start: 0, Text: 'hello' }] };
    const a1 = api.beginLyricsRequest('/Audio/A/Lyrics');
    const a2 = api.beginLyricsRequest('/Audio/A/Lyrics?api_key=refresh');
    assert.strictEqual(api.acceptLyricsPayload(payload, 'test-new', a2), true);
    assert.strictEqual(api.acceptLyricsPayload({ Lyrics: [{ Start: 0, Text: 'old' }] }, 'test-old', a1), false,
        'older same-song response must not overwrite a newer accepted payload');

    const b = api.beginLyricsRequest('/Audio/B/Lyrics');
    const a3 = api.beginLyricsRequest('/Audio/A/Lyrics');
    assert.strictEqual(api.acceptLyricsPayload(payload, 'late-b', b), false,
        'late response from previous song must be dropped');
    assert.strictEqual(api.acceptLyricsPayload(payload, 'new-a', a3), true);
    assert(api.state.lyricsStaleResponseDrops >= 2);
}


// Optional timing parser must reject null-like and boolean values instead of Number(...) coercion.
{
    const { api } = loadCore();
    assert.strictEqual(api.finiteTick(null), null);
    assert.strictEqual(api.finiteTick(undefined), null);
    assert.strictEqual(api.finiteTick(''), null);
    assert.strictEqual(api.finiteTick(false), null);
    assert.strictEqual(api.finiteTick(true), null);
    assert.strictEqual(api.finiteTick('12500000'), 12500000);
    assert.strictEqual(api.finiteTick(0), 0);
}

// Missing/null source positions must preserve provider order rather than becoming position zero.
{
    const { api } = loadCore();
    const complete = [
        { Position: 8, Text: 'b' },
        { Position: 2, Text: 'a' },
        { Position: 12, Text: 'c' }
    ];
    assert.deepStrictEqual(
        api.orderedCuesBySourcePosition(complete).map(cue => cue.Text),
        ['a', 'b', 'c'],
        'complete source positions should be sorted numerically'
    );

    const partial = [
        { Position: 8, Text: 'first' },
        { Position: null, Text: 'unknown' },
        { Position: 2, Text: 'last' }
    ];
    assert.deepStrictEqual(
        api.orderedCuesBySourcePosition(partial).map(cue => cue.Text),
        ['first', 'unknown', 'last'],
        'partial source-position metadata must preserve provider order instead of coercing null to zero'
    );
}

// Optional/null cue timing must never collapse an inferred end to zero.
{
    const { api } = loadCore();
    api.state.lyrics = [
        { Start: 10000000, End: null, Text: 'one' },
        { Start: null, Text: 'two' }
    ];
    assert.strictEqual(
        api.cueEndTicks(0, 0, { Start: 10000000, End: null }, [
            { Start: 10000000, End: null },
            { Start: null }
        ]),
        17500000,
        'null next-cue/line timing must use the bounded fallback rather than Number(null) => 0'
    );

    api.state.lyrics = [
        { Start: 10000000, End: 13000000, Text: 'one' },
        { Start: 15000000, Text: 'two' }
    ];
    assert.strictEqual(
        api.cueEndTicks(0, 0, { Start: 10000000, End: 12000000 }, [
            { Start: 10000000, End: 12000000 }
        ]),
        12000000,
        'valid explicit cue endings must remain authoritative'
    );
}

// StartTimeTicks branch must be callable and stock active-line probing must be conservative.
{
    const { context, api } = loadCore();
    const l0 = new MockElement('div');
    const l1 = new MockElement('div');
    l0.classList.add('lyricsLine');
    l1.classList.add('lyricsLine');
    l1.setAttribute('aria-current', 'true');
    context._container._queryAll.set('.lyricsLine', [l0, l1]);
    assert.strictEqual(api.getJellyfinActiveLineIndex(), 1);
    l1.removeAttribute('aria-current');
    assert.strictEqual(api.getJellyfinActiveLineIndex(), -1);

    const media = {
        currentTime: 2,
        playbackRate: 1,
        paused: false,
        seeking: false,
        ended: false,
        currentSrc: 'http://localhost/audio.m4a?StartTimeTicks=50000000',
        src: '',
        isConnected: true,
        addEventListener() {},
        removeEventListener() {}
    };
    api.state.lineData = [];
    api.resetPlaybackClock(media, 1000);
    context._setPerfNow(1000);
    const ticks = api.chooseTimelineTicks(media, 1000);
    assert.strictEqual(ticks, 70000000,
        '2s media time plus 5s StartTimeTicks must map to 7s source time when no stock marker exists');

    media.currentSrc = 'http://localhost/audio.m4a?StartTimeTicks=-50000000';
    api.state.mediaStartOffsetSource = '';
    assert.strictEqual(api.getStartTimeTicksFromUrl(media), 0,
        'negative StartTimeTicks must never rewind the source timeline');

    media.currentSrc = 'http://localhost/audio.m4a?StartTimeTicks=1e309';
    api.state.mediaStartOffsetSource = '';
    assert.strictEqual(api.getStartTimeTicksFromUrl(media), 0,
        'non-finite StartTimeTicks must be rejected');
}

// Timing assistant math, clamp, undo and inverse relationship.
{
    const { api } = loadCore();
    assert.strictEqual(api.clampTimingOffsetSeconds(99), 15);
    assert.strictEqual(api.clampTimingOffsetSeconds(-99), -15);
    api.setTimingOffsetSeconds(1.26, { rememberUndo: true });
    assert.strictEqual(api.state.timingOffsetSeconds, 1.3);
    const raw = 50 * api.TICKS_PER_SECOND;
    const adjusted = api.applyUserTimingOffsetTicks(raw);
    assert.strictEqual(adjusted, 48.7 * api.TICKS_PER_SECOND);
    assert.strictEqual(api.removeUserTimingOffsetTicks(adjusted), raw);
    api.adjustTimingOffsetSeconds(-0.3);
    assert.strictEqual(api.state.timingOffsetSeconds, 1);
    api.undoTimingOffset();
    assert.strictEqual(api.state.timingOffsetSeconds, 1.3);
    api.resetTimingOffsetValue();
    assert.strictEqual(api.state.timingOffsetSeconds, 0);
}

// Corrected lyric click seeking must target the displayed timeline, including
// per-song offset and Jellyfin StartTimeTicks remapping.
{
    const { context, api } = loadCore();
    const media = {
        currentTime: 50,
        duration: 300,
        playbackRate: 1,
        paused: false,
        seeking: false,
        ended: false,
        currentSrc: 'http://localhost/audio.m4a',
        src: '',
        isConnected: true,
        addEventListener() {},
        removeEventListener() {}
    };

    api.state.lineData = [];
    api.setTimingOffsetSeconds(2);
    context._setPerfNow(1000);
    assert.strictEqual(
        api.mediaSeekSecondsForTimelineTicks(
            media,
            60 * api.TICKS_PER_SECOND,
            1000
        ),
        62,
        '+2.0s lyric correction must make a 60s lyric anchor seek to 62s media time'
    );

    media.currentTime = 50;
    media.currentSrc = 'http://localhost/audio.m4a?StartTimeTicks=1000000000';
    api.state.mediaStartOffsetSource = '';
    api.state.mediaStartOffsetTicks = 0;
    assert.strictEqual(
        api.mediaSeekSecondsForTimelineTicks(
            media,
            160 * api.TICKS_PER_SECOND,
            1000
        ),
        62,
        'StartTimeTicks and lyric correction must compose without double-applying either offset'
    );

    api.setTimingOffsetSeconds(-1.5);
    media.currentTime = 50;
    media.currentSrc = 'http://localhost/audio.m4a';
    api.state.mediaStartOffsetSource = '';
    api.state.mediaStartOffsetTicks = 0;
    assert.strictEqual(
        api.mediaSeekSecondsForTimelineTicks(
            media,
            60 * api.TICKS_PER_SECOND,
            1000
        ),
        58.5,
        '-1.5s lyric correction must seek a 60s lyric anchor to 58.5s media time'
    );
}

// Every Classic Bloom palette must actually reach both CSS scopes, not just diagnostics.
{
    const { context, api, publicApi } = loadCore();
    assert.strictEqual(api.accents.length, 5);
    for (const accent of api.accents) {
        const result = publicApi.setAccent(accent.id);
        assert.strictEqual(result.tertiaryRgb, accent.tertiaryRgb);
        for (const target of [context._page, context._container]) {
            assert.strictEqual(target.style.getPropertyValue('--ak-glow-primary-rgb'), accent.rgb, `${accent.id}: primary`);
            assert.strictEqual(target.style.getPropertyValue('--ak-glow-secondary-rgb'), accent.secondaryRgb, `${accent.id}: secondary`);
            assert.strictEqual(target.style.getPropertyValue('--ak-glow-tertiary-rgb'), accent.tertiaryRgb, `${accent.id}: tertiary`);
            assert.strictEqual(target.dataset.akGlowTheme, accent.id, `${accent.id}: theme marker`);
        }
    }
    const rerolled = publicApi.nextAccent();
    assert.strictEqual(
        rerolled.tertiaryRgb,
        api.accents.find(accent => accent.id === rerolled.accent).tertiaryRgb,
        'manual accent reroll must expose the complete three-color palette'
    );

    context.localStorage.setItem('appleKaraokePremiumAccent', 'stale-invalid-palette');
    assert.strictEqual(api.readAccentMode(), 'shuffle',
        'invalid persisted accent values must migrate back to shuffle');

    publicApi.setAccent('off');
    assert.strictEqual(context._container.dataset.akGlowTheme, 'off');
}

// Song preferences: Romanization may survive a lyric-timeline replacement, but
// a timing correction may only restore when its exact timing fingerprint matches.
{
    const { api } = loadCore();
    const key = '/audio/song/preferences-test/lyrics';
    const original = [
        { Start: 10000000, End: 20000000, Text: 'पहली पंक्ति', Cues: [] },
        { Start: 30000000, End: 40000000, Text: 'दूसरी पंक्ति', Cues: [] }
    ];
    const replacementLyrics = [
        { Start: 11000000, End: 21000000, Text: 'पहली पंक्ति', Cues: [] },
        { Start: 31000000, End: 41000000, Text: 'दूसरी पंक्ति', Cues: [] }
    ];

    api.state.lyricsAcceptedKey = key;
    api.state.lyricsRequestKey = key;
    api.state.songPreferences[key] = {
        romanization: 'romanized',
        timingOffsetSeconds: 1.4,
        timingFingerprint: api.timingTimelineFingerprint(original),
        updatedAt: 1
    };

    api.applySongPreferences(original);
    assert.strictEqual(api.state.romanizationMode, 'romanized');
    assert.strictEqual(api.state.timingOffsetSeconds, 1.4);

    assert.notStrictEqual(
        api.timingTimelineFingerprint([{ Start: 0, End: null, Text: 'x', Cues: [{ Position: null, Start: null }] }]),
        api.timingTimelineFingerprint([{ Start: 0, End: 0, Text: 'x', Cues: [{ Position: 0, Start: 0 }] }]),
        'timeline fingerprints must distinguish missing timing/source positions from explicit zero values'
    );

    api.applySongPreferences(replacementLyrics);
    assert.strictEqual(api.state.romanizationMode, 'romanized',
        'Romanization preference is safe to preserve for the same song');
    assert.strictEqual(api.state.timingOffsetSeconds, 0,
        'timing correction must reset when the provider timeline changes');
}

// Performance-mode validation and automatic mobile selection.
{
    const desktop = loadCore();
    assert.strictEqual(desktop.api.detectPerformanceProfile(), 'desktop');
    assert.throws(() => desktop.publicApi.setPerformance('potato'), /Performance mode/);
    assert.throws(() => desktop.publicApi.setPerformance('eco'), /Performance mode/, 'legacy Eco mode is removed in God Mode');

    const mobile = loadCore({ ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile', touch: 5 });
    assert.strictEqual(mobile.api.detectPerformanceProfile(), 'mobile');
}

// Dynamic artwork visual identity must deduplicate same pixels across track-specific URLs
// without collapsing genuinely different covers.
{
    const { api } = loadCore();
    const makePixels = (variant = 0, perturb = 0) => {
        const width = 24;
        const height = 24;
        const data = new Uint8Array(width * height * 4);
        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                const index = (y * width + x) * 4;
                const left = x < 12;
                let r = left ? 28 : 188;
                let g = left ? 74 : 42;
                let b = left ? 164 : 64;
                if (variant === 1 && y > 10) { r = 232; g = 180; b = 34; }
                if (perturb) {
                    const delta = ((x * 17 + y * 11) % 3) - 1;
                    r = Math.max(0, Math.min(255, r + delta * perturb));
                    g = Math.max(0, Math.min(255, g - delta * perturb));
                }
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
                data[index + 3] = 255;
            }
        }
        return { data, width, height };
    };

    const basePixels = makePixels(0, 0);
    const samePixels = makePixels(0, 1);
    const differentPixels = makePixels(1, 0);
    const base = api.dynamicArtworkFingerprintFromPixels(basePixels.data, basePixels.width, basePixels.height);
    const same = api.dynamicArtworkFingerprintFromPixels(samePixels.data, samePixels.width, samePixels.height);
    const different = api.dynamicArtworkFingerprintFromPixels(differentPixels.data, differentPixels.width, differentPixels.height);

    assert(base && same && different, 'dynamic artwork fingerprints must be generated from decoded pixels');
    assert(api.dynamicArtworkFingerprintsEquivalent(base, same),
        'minor decode/resample noise must still identify the same visual artwork');
    assert(!api.dynamicArtworkFingerprintsEquivalent(base, different),
        'a genuinely different cover composition must not be deduplicated');

}

{
    const { api, publicApi } = loadCore();
    publicApi.setAtmosphere('dynamic');
    const root = api.state.atmosphereRoot;
    const canvas = root.children.find(child => child.className === 'ak-atmosphere-dynamic-canvas' || (child.classList && child.classList.contains('ak-atmosphere-dynamic-canvas')));
    canvas.classList.add('ak-atmosphere-dynamic-canvas');
    let loads = 0;
    const fakeRenderer = {
        hasCurrent: false,
        loadImageElement() { loads += 1; this.hasCurrent = true; return true; },
        start() {},
        stop() {},
        renderFrame() {},
        resizeToDisplaySize() { return false; },
        diagnostics() { return {}; }
    };
    api.state.atmosphereDynamicRenderer = fakeRenderer;
    api.state.atmosphereDynamicCanvas = canvas;

    const makeSolid = (r, g, b) => {
        const data = new Uint8Array(24 * 24 * 4);
        for (let index = 0; index < 24 * 24; index += 1) {
            const p = index * 4; data[p] = r; data[p + 1] = g; data[p + 2] = b; data[p + 3] = 255;
        }
        return api.dynamicArtworkFingerprintFromPixels(data, 24, 24);
    };
    const artA = makeSolid(40, 80, 160);
    const artASame = makeSolid(41, 80, 159);
    const artB = makeSolid(210, 45, 35);
    const image = {};

    api.activateDynamicBackgroundAtmosphere(image, 'http://localhost/Items/TRACK-A/Images/Primary', 'test', artA);
    assert.strictEqual(loads, 1, 'first artwork must upload into the Dynamic renderer');
    api.activateDynamicBackgroundAtmosphere(image, 'http://localhost/Items/TRACK-B/Images/Primary', 'test', artASame);
    assert.strictEqual(loads, 1, 'same visual artwork under a different track URL must not restart the GPU background');
    assert.strictEqual(api.state.atmosphereDynamicIdentityMethod, 'visual-fingerprint');
    assert.strictEqual(api.state.atmosphereDynamicVisualDedupCount, 1);
    api.activateDynamicBackgroundAtmosphere(image, 'http://localhost/Items/TRACK-C/Images/Primary', 'test', artB);
    assert.strictEqual(loads, 2, 'genuinely different visual artwork must upload and transition');
    api.activateDynamicBackgroundAtmosphere(image, 'http://localhost/Items/TRACK-C/Images/Primary', 'test', artA);
    assert.strictEqual(loads, 3,
        'pixel identity must override URL identity when Jellyfin reuses one image URL after the cover content changes');

    root.classList.add('ak-atmosphere-ready');
    api.state.atmosphereArtwork = 'http://localhost/Items/TRACK-C/Images/Primary';
    api.clearCapturedLyrics('same-page-track-change');
    assert(root.classList.contains('ak-atmosphere-ready'),
        'Dynamic background must stay visible while the lyric payload is cleared/replaced on the same lyrics page');
    assert.strictEqual(api.state.atmosphereArtwork, 'http://localhost/Items/TRACK-C/Images/Primary',
        'lyric lifecycle churn must not erase the currently visible Dynamic artwork identity');
}

// Reduced-motion diagnostics must reflect OS preference, not only eco mode.
{
    const { api } = loadCore({ reducedMotion: true });
    const fingerprint = api.rendererFingerprint();
    assert.strictEqual(fingerprint.reducedMotionRequested, true);
    assert.strictEqual(fingerprint.reducedMotionApplied, true);
}

// Dynamic Background God Mode: single engine, lifecycle continuity, and visual-art deduplication.
{
    const { api, publicApi } = loadCore();
    assert.strictEqual(api.readAtmosphereMode(), 'dynamic');
    assert.throws(() => publicApi.setAtmosphere('balanced'), /only the "dynamic" atmosphere/);
    assert.throws(() => publicApi.setAtmosphere('cinematic'), /only the "dynamic" atmosphere/);
    assert.throws(() => publicApi.setAtmosphere('off'), /only the "dynamic" atmosphere/);
    assert.strictEqual(publicApi.setAtmosphere('dynamic').mode, 'dynamic');
    assert(api.state.atmosphereRoot, 'God Mode must allocate the Dynamic atmosphere root');
    assert.strictEqual(api.state.atmosphereRoot.children.length, 4,
        'Dynamic-only root must contain exactly 2 fallback layers + canvas + shade');

    const dynamicCanvas = api.state.atmosphereRoot.children.find(child =>
        child.className === 'ak-atmosphere-dynamic-canvas'
        || (child.classList && child.classList.contains('ak-atmosphere-dynamic-canvas'))
    );
    assert(dynamicCanvas, 'Dynamic-only mode must allocate the WebGL canvas target');
    dynamicCanvas.classList.add('ak-atmosphere-dynamic-canvas');

    const pixels = (r, g, b, tweak = 0) => {
        const data = new Uint8Array(24 * 24 * 4);
        for (let i = 0; i < 24 * 24; i += 1) {
            const p = i * 4;
            const local = (i % 17 === 0) ? tweak : 0;
            data[p] = Math.max(0, Math.min(255, r + local));
            data[p + 1] = Math.max(0, Math.min(255, g + local));
            data[p + 2] = Math.max(0, Math.min(255, b + local));
            data[p + 3] = 255;
        }
        return data;
    };
    const fpA = api.dynamicArtworkFingerprintFromPixels(pixels(20, 80, 170), 24, 24);
    const fpSame = api.dynamicArtworkFingerprintFromPixels(pixels(20, 80, 170, 1), 24, 24);
    const fpDifferent = api.dynamicArtworkFingerprintFromPixels(pixels(170, 45, 30), 24, 24);
    assert(fpA && fpSame && fpDifferent);
    assert.strictEqual(api.dynamicArtworkFingerprintsEquivalent(fpA, fpSame), true,
        'minor decode/resample differences must deduplicate the same visual cover');
    assert.strictEqual(api.dynamicArtworkFingerprintsEquivalent(fpA, fpDifferent), false,
        'genuinely different artwork must not be deduplicated');

    let uploads = 0;
    const fakeRenderer = {
        hasCurrent: true,
        loadImageElement() { uploads += 1; this.hasCurrent = true; return true; },
        start() {}, stop() {}, renderFrame() {}, diagnostics() { return { fake: true }; }
    };
    api.state.atmosphereDynamicRenderer = fakeRenderer;
    api.state.atmosphereDynamicCanvas = dynamicCanvas;
    api.state.atmosphereDynamicCurrentArtwork = '';
    api.state.atmosphereDynamicCurrentFingerprint = null;

    api.activateDynamicBackgroundAtmosphere({}, 'http://localhost/Items/TRACK-A/Images/Primary', 'test', fpA);
    assert.strictEqual(uploads, 1, 'first visual cover must upload once');
    api.activateDynamicBackgroundAtmosphere({}, 'http://localhost/Items/TRACK-B/Images/Primary', 'test', fpSame);
    assert.strictEqual(uploads, 1,
        'same album art behind a different track-specific URL must not upload/restart the shader');
    assert.strictEqual(api.state.atmosphereDynamicIdentityMethod, 'visual-fingerprint');
    assert(api.state.atmosphereDynamicVisualDedupCount >= 1);

    // The exact bug reported by real-world album playback: lyric payload teardown
    // must never blank the already-running atmosphere before the next art resolves.
    api.state.lyrics = [{ Start: 0, Text: 'same album next song', Cues: [] }];
    api.state.atmosphereRoot.classList.add('ak-atmosphere-ready');
    const artworkBeforeClear = api.state.atmosphereArtwork;
    api.clearCapturedLyrics('request-switch');
    assert.strictEqual(api.state.atmosphereRoot.classList.contains('ak-atmosphere-ready'), true,
        'request-switch must not remove atmosphere-ready on the lyric route');
    assert.strictEqual(api.state.atmosphereArtwork, artworkBeforeClear,
        'lyric teardown must not clear current Dynamic artwork state');

    api.activateDynamicBackgroundAtmosphere({}, 'http://localhost/Items/TRACK-C/Images/Primary', 'test', fpDifferent);
    assert.strictEqual(uploads, 2, 'different cover must upload and start a real art transition');
    assert.strictEqual(publicApi.atmosphere().dynamicBackground.transitionMs, 260);
    assert.strictEqual(publicApi.atmosphere().dynamicBackground.audioResponsive, false);
    assert.strictEqual(publicApi.atmosphere().dynamicBackground.lyricReactive, false);

    const media = { currentSrc: 'http://localhost/Audio/abc123/universal?Api_Key=secret&StartTimeTicks=55&PlaySessionId=session&foo=stable' };
    const identity = api.normalizedMediaSource(media);
    assert(identity.includes('/Audio/abc123/universal'));
    assert(identity.includes('foo=stable'));
    assert(!/api_key=/i.test(identity));
    assert(!/starttimeticks=/i.test(identity));
    assert(!/playsessionid=/i.test(identity));
}

// Rapid-skip artwork commits must be owned by the live media element at the
// instant of commit, not merely by the element/source that began the decode.
{
    const { context, api } = loadCore();
    const media = new context.HTMLElement('audio');
    media.currentSrc = 'http://localhost/Audio/TRACK-B/universal?api_key=secret';
    media.src = media.currentSrc;
    media.paused = false;
    media.ended = false;
    media.readyState = 4;
    media.currentTime = 3;
    api.state.mediaElement = media;
    api.state.atmosphereLoadSeq = 77;
    const keyB = api.normalizedMediaSource(media);
    assert.strictEqual(api.dynamicRequestStillCurrent(77, keyB), true,
        'current artwork decode may commit while its media source is still live');

    media.currentSrc = 'http://localhost/Audio/TRACK-C/universal?api_key=secret';
    media.src = media.currentSrc;
    assert.strictEqual(api.dynamicRequestStillCurrent(77, keyB), false,
        'a skipped-song decode must be rejected once the live media source has advanced');
    assert(api.state.atmosphereDynamicStaleCommitDrops >= 1);
}


// DOM ownership regression: Jellyfin may reuse a .lyricsLine shell while
// replacing all of LyricMotion's generated children. That must invalidate the
// renderer immediately instead of animating detached spans.
{
    const { api } = loadCore();
    const line = new MockElement('div');
    line.classList.add('ak-enhanced-line');
    line.dataset.akGeneration = '9';
    const owned = new MockElement('span');
    owned.classList.add('ak-word');
    line.appendChild(owned);
    const record = { element: line, ownedNodes: [owned] };
    api.state.generation = 9;
    api.state.decoratedGeneration = 9;
    api.state.lineData = [record];
    api.state.instrumentalGaps = [];
    assert.strictEqual(api.lineRecordHealthy(record), true);
    assert.strictEqual(api.lyricVisualDomHealthy(), true);
    line.removeChild(owned);
    assert.strictEqual(api.lineRecordHealthy(record), false,
        'reused lyric line with replaced children must be considered stale');
    assert.strictEqual(api.lyricVisualDomHealthy(), false,
        'detached sweep/glow nodes must invalidate the visual renderer');
}

// Payload/DOM identity regression: a new lyric response must not decorate the
// outgoing song's still-visible DOM, but should proceed once Jellyfin replaces it.
{
    const { api } = loadCore();
    const line = new MockElement('div');
    const oldLyric = { Start: 0, Text: 'old song lyric', Cues: [] };
    const newLyric = { Start: 0, Text: 'new song lyric', Cues: [] };
    line.dataset.akLyricIdentity = api.lyricDomIdentity(oldLyric);
    const owned = new MockElement('span');
    owned.classList.add('ak-word');
    line.appendChild(owned);
    assert.strictEqual(api.lyricsDomReadyForPayload([line], [newLyric]), false,
        'new timing must never be painted onto an outgoing owned lyric line');
    line.removeChild(owned);
    delete line.dataset.akLyricIdentity;
    line.textContent = 'new song lyric';
    assert.strictEqual(api.lyricsDomReadyForPayload([line], [newLyric]), true,
        'decoration may resume after Jellyfin exposes the matching new lyric text');
}

// Synthetic instrumental rows are part of visual ownership too.
{
    const { api } = loadCore();
    const row = new MockElement('div');
    const host = new MockElement('div');
    host.appendChild(row);
    api.state.instrumentalGaps = [{ element: row }];
    assert.strictEqual(api.instrumentalGapRowsHealthy(), true);
    host.removeChild(row);
    assert.strictEqual(api.instrumentalGapRowsHealthy(), false,
        'removed instrumental SVG row must trigger recovery rather than animate detached DOM');
}

// Rapid-skip DOM artwork stays baseline-gated, while album-inherited artwork
// may be used when Jellyfin binds the now-playing node to the current track.
{
    const { api } = loadCore();
    const baseline = new Set(['http://localhost/Items/OLD/Images/Primary']);
    assert.strictEqual(api.dynamicDomArtworkCandidateAllowed({
        url: 'http://localhost/Items/SKIPPED/Images/Primary',
        boundToCurrentItem: false,
        conflictsCurrentItem: true
    }, baseline), false);
    assert.strictEqual(api.dynamicDomArtworkCandidateAllowed({
        url: 'http://localhost/Items/CURRENT/Images/Primary',
        boundToCurrentItem: true,
        conflictsCurrentItem: false
    }, baseline), true);
    assert.strictEqual(api.dynamicDomArtworkCandidateAllowed({
        url: 'http://localhost/Items/OLD/Images/Primary',
        boundToCurrentItem: false,
        conflictsCurrentItem: false
    }, baseline), false);
    assert.strictEqual(api.dynamicDomArtworkCandidateAllowed({
        url: 'http://localhost/Items/ALBUM/Images/Primary',
        boundToCurrentItem: true,
        inheritedArtworkCandidate: true,
        playbackContext: true,
        conflictsCurrentItem: false
    }, new Set(['http://localhost/Items/ALBUM/Images/Primary'])), true,
    'album-inherited art bound to the current track must survive the baseline gate');
    assert.strictEqual(api.dynamicDomArtworkCandidateAllowed({
        url: 'http://localhost/Items/ALBUM2/Images/Primary',
        boundToCurrentItem: false,
        inheritedArtworkCandidate: true,
        playbackContext: true,
        conflictsCurrentItem: false
    }, baseline), true,
    'new stable now-playing album art may be considered even when its item id is the album id');
    assert.strictEqual(api.dynamicDomArtworkSignalsPresence({
        url: 'http://localhost/Items/ALBUM/Images/Primary',
        boundToCurrentItem: false,
        inheritedArtworkCandidate: true,
        playbackContext: true,
        conflictsCurrentItem: false
    }), true,
    'visible album-inherited artwork must prevent a false confirmed-no-art state');
    const currentTiming = api.dynamicDomArtworkTiming({
        url: 'http://localhost/Items/CURRENT/Images/Primary',
        boundToCurrentItem: true,
        inheritedArtworkCandidate: false,
        playbackContext: true,
        conflictsCurrentItem: false
    });
    assert.strictEqual(currentTiming.mediaStableMs, 0,
        'current-item DOM artwork should not pay a media stability delay');
    assert.strictEqual(currentTiming.confirmMs, 0,
        'current-item DOM artwork should not pay a confirmation delay');
    assert.strictEqual(currentTiming.inheritedFastPath, false);

    const inheritedTiming = api.dynamicDomArtworkTiming({
        url: 'http://localhost/Items/ALBUM/Images/Primary',
        boundToCurrentItem: false,
        inheritedArtworkCandidate: true,
        playbackContext: true,
        conflictsCurrentItem: false
    });
    assert.strictEqual(inheritedTiming.mediaStableMs, 0,
        'new album-inherited now-playing art must be eligible immediately');
    assert.strictEqual(inheritedTiming.confirmMs, 0,
        'baseline-gated inherited art must not pay a second confirmation delay');
    assert.strictEqual(inheritedTiming.inheritedFastPath, true);

    const genericTiming = api.dynamicDomArtworkTiming({
        url: 'http://localhost/Items/OTHER/Images/Primary',
        boundToCurrentItem: false,
        inheritedArtworkCandidate: false,
        playbackContext: false,
        conflictsCurrentItem: false
    });
    assert.strictEqual(genericTiming.mediaStableMs, 900,
        'generic unbound art must retain the conservative media stability gate');
    assert.strictEqual(genericTiming.confirmMs, 1500,
        'generic unbound art must retain the conservative rapid-skip confirmation gate');
    assert.strictEqual(genericTiming.inheritedFastPath, false);
}

// Stability must be tracked independently per artwork URL. A single shared
// candidate timestamp could be reset forever when Jellyfin exposed more than
// one now-playing image/background candidate at the same time.
{
    const { api } = loadCore();
    api.state.atmosphereDynamicDomCandidateSinceByUrl.set('album-a', 100);
    api.state.atmosphereDynamicDomCandidateSinceByUrl.set('album-b', 220);
    assert.strictEqual(api.state.atmosphereDynamicDomCandidateSinceByUrl.get('album-a'), 100);
    assert.strictEqual(api.state.atmosphereDynamicDomCandidateSinceByUrl.get('album-b'), 220);
}

// Timing sync must survive the outside-pointerdown dismiss path and sample
// the exact media clock rather than the projected animation clock.
{
    const { context, api } = loadCore();
    const media = new MockElement('audio');
    media.currentSrc = 'http://localhost/Audio/CURRENT/stream';
    media.src = media.currentSrc;
    media.currentTime = 10.25;
    media.duration = 200;
    media.playbackRate = 1;
    media.readyState = 4;
    media.paused = false;
    media.seeking = false;
    media.ended = false;
    context._setMedia(media);

    const wordElement = new MockElement('span');
    wordElement.dataset.akTimingLineIndex = '0';
    wordElement.dataset.akTimingWordIndex = '0';
    const lineElement = new MockElement('div');
    lineElement.dataset.akTimingLineIndex = '0';
    const target = new MockElement('span');
    target.closest = selector => {
        if (selector === '.ak-word') return wordElement;
        if (selector === '.ak-enhanced-line') return lineElement;
        if (selector === '.ak-word, .ak-enhanced-line') return wordElement;
        if (selector === '#ak-lyrics-timing-popover') return null;
        if (selector === '#lyrics-timing-display') return null;
        return null;
    };

    api.state.lineData = [{
        startTicks: 80000000,
        words: [{ start: 80000000, text: 'hello', element: wordElement }]
    }];
    api.state.timingOffsetSeconds = 1.0;
    api.state.timingPickActive = true;
    api.state.timingPopover = new MockElement('div');

    api.handleTimingPopoverDismissPointerDown({ target });
    assert.strictEqual(api.state.timingPickActive, true,
        'pointerdown on the lyric sync target must not cancel sync mode before click');
    assert(api.state.timingPopover,
        'sync popover must survive pointerdown until the lyric click is captured');

    const captured = api.captureTimingSync(target);
    assert(captured, 'timing sync should capture a timed word');
    assert(Math.abs(captured.actualSeconds - 10.25) < 1e-9,
        'timing sync must sample exact media.currentTime, not projected render time');
    assert(Math.abs(captured.offsetSeconds - 2.3) < 1e-9,
        'timing sync should round the exact media/source delta to the supported tenth-second grid');
}


// Timing-pick capture suppresses Jellyfin's stock lyric click, so LyricMotion
// must explicitly restore the selected line to focus and resume auto-follow.
{
    const { context, api } = loadCore();
    const media = new MockElement('audio');
    media.currentTime = 12.4;
    media.duration = 220;
    media.playbackRate = 1;
    media.readyState = 4;
    media.paused = false;
    media.seeking = false;
    media.ended = false;
    media.currentSrc = 'http://localhost/audio.m4a';
    media.src = '';
    context._setMedia(media);

    const lineElement = new MockElement('div');
    lineElement.dataset.akTimingLineIndex = '0';
    const wordElement = new MockElement('span');
    wordElement.dataset.akTimingLineIndex = '0';
    wordElement.dataset.akTimingWordIndex = '0';
    const target = new MockElement('span');
    target.closest = selector => {
        if (selector === '.ak-word, .ak-enhanced-line') return wordElement;
        if (selector === '.ak-word') return wordElement;
        if (selector === '.ak-enhanced-line') return lineElement;
        return null;
    };

    api.state.lineData = [{
        startTicks: 100000000,
        element: lineElement,
        words: [{ start: 100000000, text: 'focus', element: wordElement }]
    }];
    api.state.timingPickActive = true;
    api.state.timingPopover = new MockElement('div');
    api.state.lyricAutoFollowSuspendedUntil = 999999;

    let prevented = false;
    let stopped = false;
    api.handleTimingPickClick({
        target,
        button: 0,
        preventDefault() { prevented = true; },
        stopImmediatePropagation() { stopped = true; },
        stopPropagation() { stopped = true; }
    });

    assert(prevented && stopped,
        'timing-pick click must suppress Jellyfin stock seek');
    assert.strictEqual(api.state.timingPickActive, false,
        'successful timing capture must leave timing-pick mode');
    assert.strictEqual(api.state.lyricAutoFollowSuspendedUntil, 0,
        'successful timing capture must resume lyric auto-follow immediately');
    assert.strictEqual(api.state.lyricAutoFollowLastReason, 'timing-sync');
    assert.strictEqual(lineElement._scrollIntoViewCalls.length, 1,
        'timing capture must center the selected lyric line');
    assert.strictEqual(lineElement._scrollIntoViewCalls[0].block, 'center');
}

// Corrected lyric clicks are intercepted before Jellyfin and must therefore
// restore focus themselves after a manual scroll.
{
    const { context, api } = loadCore();
    const media = new MockElement('audio');
    media.currentTime = 20;
    media.duration = 240;
    media.playbackRate = 1;
    media.readyState = 4;
    media.paused = false;
    media.seeking = false;
    media.ended = false;
    media.currentSrc = 'http://localhost/audio.m4a';
    media.src = '';
    context._setMedia(media);

    const lineElement = new MockElement('div');
    lineElement.dataset.akTimingLineIndex = '0';
    const target = new MockElement('span');
    target.closest = selector => {
        if (selector === '.ak-instrumental-note') return null;
        if (selector === '.ak-enhanced-line') return lineElement;
        return null;
    };

    api.state.lineData = [{
        startTicks: 300000000,
        element: lineElement,
        words: []
    }];
    api.state.timingOffsetSeconds = 1.2;
    api.state.lyricAutoFollowSuspendedUntil = 999999;

    let prevented = false;
    api.handleLyricSeekClick({
        target,
        button: 0,
        preventDefault() { prevented = true; },
        stopImmediatePropagation() {},
        stopPropagation() {}
    });

    assert(prevented,
        'non-zero timing correction must still intercept Jellyfin stock seek');
    assert.strictEqual(api.state.lyricAutoFollowSuspendedUntil, 0,
        'corrected lyric click must resume auto-follow');
    assert.strictEqual(api.state.lyricAutoFollowLastReason, 'lyric-click');
    assert.strictEqual(lineElement._scrollIntoViewCalls.length, 1,
        'corrected lyric click must center the clicked lyric');
    assert(Math.abs(media.currentTime - 31.2) < 1e-9,
        'corrected click must seek to the lyric anchor plus timing correction');
}

// Manual scroll gets a short grace period, but an explicit resume clears it.
{
    const { context, api } = loadCore();
    const lineElement = new MockElement('div');
    api.state.lineData = [{ element: lineElement, words: [] }];
    context._setPerfNow(1000);

    api.suspendLyricAutoFollow('manual-wheel', 1000);
    assert.strictEqual(api.focusLyricLineIndex(0, {
        force: false,
        reason: 'playback-follow'
    }), false);

    api.resumeLyricAutoFollow('test-resume');
    assert.strictEqual(api.focusLyricLineIndex(0, {
        force: false,
        reason: 'playback-follow'
    }), true);
    assert.strictEqual(lineElement._scrollIntoViewCalls.length, 1);
}

// Glow shuffle is uniform by selection and normalized by effective primary
// luminance so yellow/green/gold choices do not dominate visually.
{
    const { api } = loadCore();
    const effective = api.accents.map(accent => {
        const [r, g, b] = accent.rgb.split(',').map(Number);
        const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        return luma * accent.gain;
    });
    const spread = Math.max(...effective) - Math.min(...effective);
    assert(spread < 0.045,
        `effective accent luminance spread must stay perceptually balanced, got ${spread}`);
}

// ELRC visual regression: a timed word must paint a progressing neutral sweep
// and drive Classic Bloom opacity while active. This protects the main karaoke
// effect from atmosphere/lifecycle refactors.
{
    const { api } = loadCore();
    const wordElement = new MockElement('span');
    const coreGlow = new MockElement('span');
    const haloGlow = new MockElement('span');
    const word = {
        element: wordElement,
        text: 'worry',
        start: 0,
        end: 10_000_000,
        length: 5,
        segments: [{
            start: 0,
            end: 10_000_000,
            startPos: 0,
            endPos: 5,
            visualStart: 0,
            visualEnd: 1
        }],
        visualProgress: 0,
        lastPaintAt: 900,
        motionMode: 'grow',
        motionDurationMs: 1000,
        motionGlyphs: [],
        wholeMotion: {
            shadowIntensity: 1,
            maxScale: 1.028,
            peakYEm: -0.045,
            offsetXEm: 0
        },
        glowLayers: [coreGlow, haloGlow],
        _akStaticState: 'active',
        _akMotionIsReset: false
    };

    api.updateWordVisual(word, 4_000_000, 1000);
    const progress = parseFloat(wordElement.style.getPropertyValue('--ak-word-progress'));
    assert(progress > 30 && progress < 60, `active ELRC word should expose progressing wipe, got ${progress}`);
    assert(wordElement.classList.contains('ak-word-active'), 'active ELRC word should carry ak-word-active');
    assert(!wordElement.classList.contains('ak-word-zero'), 'active ELRC word should leave zero-progress guard');
    assert(Number(coreGlow.style.opacity || 0) > 0, 'Classic Bloom core should be visible during active word');
    assert(Number(haloGlow.style.opacity || 0) > 0, 'Classic Bloom halo should be visible during active word');
}

// Instrumental SVG regression: use one closed vector silhouette for base/liquid
// clipping and ensure mid-gap liquid geometry has a live wave surface.
{
    const { api } = loadCore();
    const gap = {
        index: 2,
        startTicks: 10_000_000,
        endTicks: 50_000_000,
        durationTicks: 40_000_000,
        nextLineIndex: 3
    };
    const row = api.createInstrumentalGapRow(gap);
    assert(row, 'instrumental gap row should be created');
    const svg = row.children[0] && row.children[0].children[0];
    assert(svg, 'instrumental note SVG should exist');
    const baseGroup = svg.children.find(child => child.getAttribute && child.getAttribute('class') === 'ak-instrumental-note-base-vector');
    assert(baseGroup, 'instrumental note base vector group should exist');
    assert.strictEqual(baseGroup.children.length, 1, 'instrumental note should be a single closed silhouette path');
    const path = baseGroup.children[0];
    assert.strictEqual(path.tagName, 'PATH');
    assert((path.getAttribute('d') || '').includes('V13.45'), 'instrumental note should use the corrected continuous SVG path');

    const geometry = api.instrumentalWaveGeometry(gap, 0.5, 30_000_000);
    assert(geometry.amplitude > 0, 'mid-gap liquid wave should have non-zero amplitude');
    assert(geometry.fillPath.includes('Z'), 'liquid fill clip should be a closed path');
    api.setInstrumentalGapFill(gap, 0.5, 30_000_000);
    assert(gap.surfaceElement.style.opacity === '1', 'liquid surface should be visible through the middle of a gap');
}



// Real frame-path regression for the production failure: a valid enhanced word
// must survive syncStaticLineStates(), advance --ak-word-progress, and leave the
// frame scheduler alive. This catches dangling variables left by mode cleanup.
{
    const { context, api } = loadCore();
    const media = new MockElement('audio');
    media.classList.add('mediaPlayerAudio');
    media.currentSrc = 'http://localhost/Audio/FRAMEOK/stream';
    media.src = media.currentSrc;
    media.currentTime = 0.4;
    media.duration = 120;
    media.playbackRate = 1;
    media.paused = false;
    media.ended = false;
    media.readyState = 4;

    const originalQuery = context.document.querySelector.bind(context.document);
    context.document.querySelector = selector => selector === '.mediaPlayerAudio' ? media : originalQuery(selector);
    context.document.querySelectorAll = selector => selector === 'audio,video' ? [media] : [];

    const lineElement = new MockElement('div');
    lineElement.classList.add('lyricsLine', 'ak-enhanced-line');
    lineElement.dataset.akGeneration = '1';
    const wordElement = new MockElement('span');
    const word = {
        element: wordElement,
        text: 'alive',
        start: 0,
        end: 10_000_000,
        length: 5,
        segments: [{ start: 0, end: 10_000_000, startPos: 0, endPos: 5, visualStart: 0, visualEnd: 1 }],
        visualProgress: 0,
        lastPaintAt: 900,
        motionMode: 'none',
        motionGlyphs: [],
        glowLayers: [],
        _akStaticState: 'future',
        _akMotionIsReset: true
    };
    api.state.lyrics = [{ Start: 0, Text: 'alive' }];
    api.state.generation = 1;
    api.state.decoratedGeneration = 1;
    api.state.lineData = [{
        element: lineElement,
        lineIndex: 0,
        startTicks: 0,
        endTicks: 10_000_000,
        trustedEndTicks: 10_000_000,
        words: [word]
    }];
    api.state.lineEndPrefix = [10_000_000];
    api.state.activeLineIndexes = [];
    api.state.lastActiveLine = -999;
    api.state.activeInstrumentalGapIndex = -1;
    api.state.timedCueCount = 1;
    api.state.atmosphereLastCheck = 1000;
    api.state.animationLoopRunning = true;
    api.state.frameTimer = 0;
    api.state.rafId = 1;
    context._setPerfNow(1000);

    api.renderFrame();
    assert.strictEqual(api.state.animationLoopErrors, 0, 'valid lyric frame must not throw');
    const progress = parseFloat(wordElement.style.getPropertyValue('--ak-word-progress'));
    assert(progress > 30 && progress < 60, `real frame should advance ELRC wipe, got ${progress}`);
    assert(wordElement.classList.contains('ak-word-active'), 'real frame should mark the timed word active');
    assert(api.state.rafId || api.state.frameTimer, 'real frame should schedule its successor');
}

// Animation-loop containment regression: one bad visual object must not kill
// future ELRC/instrumental frames. The frame is isolated and recovery is queued.
{
    const { context, api } = loadCore();
    const media = new MockElement('audio');
    media.classList.add('mediaPlayerAudio');
    media.currentSrc = 'http://localhost/Audio/TEST/stream';
    media.src = media.currentSrc;
    media.currentTime = 0.4;
    media.duration = 120;
    media.playbackRate = 1;
    media.paused = false;
    media.ended = false;
    media.readyState = 4;

    const originalQuery = context.document.querySelector.bind(context.document);
    context.document.querySelector = selector => selector === '.mediaPlayerAudio' ? media : originalQuery(selector);
    context.document.querySelectorAll = selector => selector === 'audio,video' ? [media] : [];

    const lineElement = new MockElement('div');
    lineElement.classList.add('lyricsLine', 'ak-enhanced-line');
    lineElement.dataset.akGeneration = '1';
    api.state.lyrics = [{ Start: 0, Text: 'broken visual fixture' }];
    api.state.generation = 1;
    api.state.decoratedGeneration = 1;
    api.state.lineData = [{
        element: lineElement,
        lineIndex: 0,
        startTicks: 0,
        endTicks: 10_000_000,
        trustedEndTicks: 10_000_000,
        words: [{ element: new MockElement('span'), segments: null }]
    }];
    api.state.lineEndPrefix = [10_000_000];
    api.state.atmosphereLastCheck = 1000;
    api.state.animationLoopRunning = true;
    api.state.frameTimer = 0;
    api.state.rafId = 1;
    context._setPerfNow(1000);

    api.renderFrame();
    assert.strictEqual(api.state.animationLoopErrors, 1, 'visual frame error should be contained');
    assert.strictEqual(api.state.animationLoopRecoveries, 1, 'visual frame error should schedule loop recovery');
    assert.strictEqual(api.state.frameTimer, 1, 'recovery timer should be armed');
    assert(api.state.lastAnimationLoopError.includes('Cannot read properties of null'), 'diagnostics should preserve the visual frame failure');
}

console.log('LyricMotion runtime core: URL capture, stale-response protection, timing, performance, Dynamic-only lifecycle continuity and same-art visual deduplication passed.');
