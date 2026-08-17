'use strict';

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const runtimeSource = fs.readFileSync(path.join(ROOT, 'src', 'jellyfin-lyric-motion.js'), 'utf8');
const romanizerSource = fs.readFileSync(path.join(ROOT, 'src', 'jellyfin-lyric-romanizer.js'), 'utf8');

class MockElement {
    constructor(tagName = 'div') {
        this.tagName = String(tagName).toUpperCase();
        this.children = [];
        this.parentNode = null;
        this.dataset = {};
        this.style = {};
        this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
        this.attributes = new Map();
        this.textContent = '';
        this.src = '';
    }
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; }
    removeChild(child) { this.children = this.children.filter(item => item !== child); child.parentNode = null; return child; }
    addEventListener() {}
    removeEventListener() {}
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
    removeAttribute(name) { this.attributes.delete(name); }
    querySelector() { return null; }
    querySelectorAll() { return []; }
    closest() { return null; }
    matches() { return false; }
    contains() { return false; }
    getBoundingClientRect() { return { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 }; }
}

function storageStub() {
    const values = new Map();
    return {
        getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
        setItem(key, value) { values.set(String(key), String(value)); },
        removeItem(key) { values.delete(String(key)); },
        clear() { values.clear(); }
    };
}

function makeContext({ userAgent = 'Mozilla/5.0 desktop', romanizer = null, maxTouchPoints = 1, remoteOnlyPointer = false } = {}) {
    const body = new MockElement('body');
    const head = new MockElement('head');
    const documentElement = new MockElement('html');
    const document = {
        body,
        head,
        documentElement,
        hidden: false,
        readyState: 'complete',
        fonts: null,
        createElement(tag) { return new MockElement(tag); },
        createTextNode(text) { const node = new MockElement('#text'); node.textContent = String(text); return node; },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        getElementsByTagName() { return []; },
        addEventListener() {},
        removeEventListener() {}
    };

    class MockMutationObserver {
        constructor(callback) { this.callback = callback; }
        observe() {}
        disconnect() {}
    }

    class MockXHR {
        open() {}
        send() {}
        addEventListener() {}
        removeEventListener() {}
        setRequestHeader() {}
    }

    const localStorage = storageStub();
    const sessionStorage = storageStub();
    const noop = () => {};
    const context = {
        console: { log: noop, info: noop, warn: noop, error: noop, debug: noop },
        document,
        navigator: { userAgent, platform: 'Linux x86_64', maxTouchPoints },
        location: { hash: '', href: 'http://localhost/web/index.html' },
        localStorage,
        sessionStorage,
        MutationObserver: MockMutationObserver,
        XMLHttpRequest: MockXHR,
        fetch: async () => ({ clone() { return this; }, json: async () => ({}) }),
        performance: { now: () => 0 },
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
        getComputedStyle: () => ({ getPropertyValue: () => '', display: 'none', visibility: 'hidden' }),
        matchMedia: query => ({ matches: remoteOnlyPointer && String(query).includes('(hover: none)'), addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop })
    };
    context.window = context;
    context.globalThis = context;
    context.window.addEventListener = noop;
    context.window.removeEventListener = noop;
    context.window.matchMedia = context.matchMedia;
    context.window.navigator = context.navigator;
    if (romanizer) context.window.JellyfinLyricRomanizer = romanizer;
    return vm.createContext(context);
}

function runRuntime(context) {
    vm.runInContext(runtimeSource, context, { filename: 'jellyfin-lyric-motion.js' });
    return context.window.JellyfinLyricMotion;
}

{
    const context = makeContext();
    const api = runRuntime(context);
    assert(api, 'desktop runtime should install');
    assert.strictEqual(api.version, '3.2.5');
    assert.strictEqual(api.romanization().requiredRomanizerVersion, '6.5.1');
    assert.strictEqual(api.romanization().romanizerVersion, null);
    const instrumental = api.instrumentalBreaks();
    assert.strictEqual(instrumental.symbol, '♪');
    assert.strictEqual(instrumental.visualRenderer, 'inline-svg-liquid-wave-v3');
    assert.strictEqual(instrumental.liquidSurface, 'media-time-wave+progressive-flattening');
    assert.strictEqual(instrumental.reducedMotionSurface, 'flat');
    assert.strictEqual(instrumental.transitionModel, 'future-active-past');
    assert.strictEqual(instrumental.rectangularTextClipArtifact, false);
    assert.strictEqual(instrumental.minimumGapSeconds, 2);
    assert.strictEqual(instrumental.detected, 0);
    const accents = api.accents();
    assert.strictEqual(accents.length, 5);
    assert(accents.every(accent => accent.primaryRgb && accent.secondaryRgb && accent.tertiaryRgb),
        'every Classic Bloom palette must expose all three color layers');
}

{
    const context = makeContext();
    const api = runRuntime(context);
    const seen = new Set();
    for (let index = 0; index < 5; index += 1) {
        seen.add(api.nextAccent().accent);
    }
    assert.strictEqual(seen.size, 5,
        'shuffle bag must expose every accent before repeating a palette');
}

{
    const staleRomanizer = {
        version: '6.5.0',
        strategy: 'stale-test',
        romanize: value => `stale:${value}`,
        canRomanize: () => true
    };
    const context = makeContext({ romanizer: staleRomanizer });
    const api = runRuntime(context);
    assert.strictEqual(api.romanization().romanizerVersion, null,
        'runtime must reject a stale 6.5.0 global when 6.5.1 is required');
}

{
    const context = makeContext();
    vm.runInContext(romanizerSource, context, { filename: 'jellyfin-lyric-romanizer.js' });
    const api = runRuntime(context);
    assert.strictEqual(api.romanization().romanizerVersion, '6.5.1');
    assert.strictEqual(api.explainRomanization('പേടി').text, 'pedi');
    const first = api;
    runRuntime(context);
    assert.strictEqual(context.window.JellyfinLyricMotion, first,
        'duplicate runtime load must be ignored without replacing the active API');
}

{
    const context = makeContext({ userAgent: 'Mozilla/5.0 (Linux; Android 11; Android TV) Jellyfin Android TV' });
    const api = runRuntime(context);
    assert.strictEqual(api.enabled, false);
    assert.strictEqual(api.renderer, 'stock-jellyfin');
    assert.strictEqual(api.reason, 'tv-stock-bypass');
}

console.log('LyricMotion runtime smoke: desktop, stale-G2P rejection, duplicate-load guard and TV bypass passed.');

// TV policy matrix: identified ten-foot clients must never install the runtime,
// while ordinary mobile/tablet browsers remain enhanced.
for (const [userAgent, family] of [
    ['Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit', 'lg-webos'],
    ['Mozilla/5.0 (SMART-TV; LINUX; Tizen 7.0)', 'samsung-tizen'],
    ['Mozilla/5.0 (Linux; Android 9; AFTMM Build/PS7273)', 'fire-tv'],
    ['Mozilla/5.0 (Linux; Android 12; SHIELD Android TV)', 'android-tv'],
    ['Mozilla/5.0 (PlayStation 5 3.20)', 'game-console-tv']
]) {
    const context = makeContext({ userAgent });
    const api = runRuntime(context);
    assert.strictEqual(api.enabled, false, `${family} must use stock Jellyfin`);
    assert.strictEqual(api.reason, 'tv-stock-bypass');
    assert.strictEqual(api.tvFamily, family);
}

for (const userAgent of [
    'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit Mobile',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit Mobile',
    'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit Mobile'
]) {
    const context = makeContext({ userAgent });
    const api = runRuntime(context);
    assert(api && api.enabled !== false, 'ordinary phones/tablets must not be false-positive TV bypasses');
}

{
    const context = makeContext({
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit kiosk-shell',
        maxTouchPoints: 0,
        remoteOnlyPointer: true
    });
    const api = runRuntime(context);
    assert(api && api.enabled !== false,
        'coarse/no-pointer desktop or kiosk shells must not be false-positive TV bypasses');
}


{
    const context = makeContext();
    vm.runInContext(romanizerSource, context, { filename: 'jellyfin-lyric-romanizer.public-api-test.js' });
    const api = runRuntime(context);
    assert.doesNotThrow(() => api.romanization());
    assert.doesNotThrow(() => api.explainRomanization('മലയാളം'));
    assert.doesNotThrow(() => api.segmentRomanization('Hello മലയാളം'));
    assert.doesNotThrow(() => api.detectRomanizationLanguages('माझं प्रेम आहे'));
    assert.doesNotThrow(() => api.romanizationIR('ਪੰਜਾਬੀ'));
    assert.doesNotThrow(() => api.romanizationVariants('தமிழ்', 3));
    assert.doesNotThrow(() => api.exportRomanizationCase('प्यार', 'pyaar'));
    assert.doesNotThrow(() => api.rankRomanizationCandidates('अदरक', [{ text: 'adrak', confidence: 0.97, language: 'hi' }]));
    assert.doesNotThrow(() => api.selectRomanizationCandidate('अदरक', [{ text: 'adrak', confidence: 0.97, language: 'hi' }]));
    assert.doesNotThrow(() => api.timing());
    assert.doesNotThrow(() => api.backgroundVocals());
    assert.doesNotThrow(() => api.instrumentalBreaks());
    assert.doesNotThrow(() => api.rendererFingerprint());
    assert.doesNotThrow(() => api.performance());
    assert.doesNotThrow(() => api.atmosphere());
    assert.doesNotThrow(() => api.refreshAtmosphere());
    assert.doesNotThrow(() => api.diagnostics());
}
