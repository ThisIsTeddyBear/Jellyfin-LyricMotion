'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'jellyfin-lyric-motion.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'jellyfin-lyric-motion.css'), 'utf8');

const tvFixtures = [
    ['lg-webos', 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36'],
    ['samsung-tizen', 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 7.0) AppleWebKit/537.36'],
    ['hbbtv', 'Mozilla/5.0 (Linux; U; HbbTV/1.5.1)'],
    ['hisense-vidaa', 'Mozilla/5.0 (Linux; U) AppleWebKit/537.36 VIDAA/6.0'],
    ['vizio', 'Mozilla/5.0 VIZIO SmartCast VizioTV'],
    ['panasonic-viera', 'Mozilla/5.0 (FreeBSD; U; Viera) AppleWebKit/537.36'],
    ['sony-bravia', 'Mozilla/5.0 (Linux; BRAVIA 4K GB ATV3)'],
    ['roku', 'Roku/DVP-12.5 (519.50E04154A)'],
    ['fire-tv', 'Mozilla/5.0 (Linux; Android 9; AFTMM Build/PS7273) AppleWebKit/537.36'],
    ['android-tv', 'Mozilla/5.0 (Linux; Android 11; SHIELD Android TV Build/RQ1A) AppleWebKit/537.36'],
    ['android-tv', 'Mozilla/5.0 (Linux; Android 12; Google TV) AppleWebKit/537.36'],
    ['apple-tv', 'Mozilla/5.0 (AppleTV; U; CPU OS 17_0 like Mac OS X)'],
    ['chromecast', 'Mozilla/5.0 (CrKey armv7l 1.56.291998) AppleWebKit/537.36'],
    ['opera-tv', 'Opera/9.80 (Linux armv7l; Opera TV Store)'],
    ['game-console-tv', 'Mozilla/5.0 (PlayStation 5 3.21) AppleWebKit/605.1.15'],
    ['game-console-tv', 'Mozilla/5.0 (Xbox; Xbox One) AppleWebKit/537.36'],
    ['generic-tv', 'Mozilla/5.0 (Linux; U; TV) AppleWebKit/537.36']
];

let assertions = 0;
for (const [family, userAgent] of tvFixtures) {
    let touchedDocument = false;
    let touchedFetch = false;
    let observerCreated = false;
    const win = {
        navigator: { userAgent, platform: '' },
        fetch() { touchedFetch = true; throw new Error('TV bypass must not wrap/call fetch'); }
    };
    const context = {
        window: win,
        navigator: win.navigator,
        console: { info() {}, warn() {}, log() {}, error() {} },
        Object, String, RegExp,
        document: new Proxy({}, { get() { touchedDocument = true; throw new Error('TV bypass touched document'); } }),
        MutationObserver: function () { observerCreated = true; throw new Error('TV bypass created observer'); }
    };
    vm.createContext(context);
    vm.runInContext(source, context);

    assert.strictEqual(win.JellyfinLyricMotion.enabled, false, `${family}: enabled`);
    assert.strictEqual(win.JellyfinLyricMotion.platform, 'tv', `${family}: platform`);
    assert.strictEqual(win.JellyfinLyricMotion.renderer, 'stock-jellyfin', `${family}: renderer`);
    assert.strictEqual(win.JellyfinLyricMotion.reason, 'tv-stock-bypass', `${family}: reason`);
    assert.strictEqual(win.JellyfinLyricMotion.tvFamily, family, `${family}: family`);
    assert.strictEqual(touchedDocument, false, `${family}: document touched`);
    assert.strictEqual(touchedFetch, false, `${family}: fetch touched`);
    assert.strictEqual(observerCreated, false, `${family}: observer created`);
    assertions += 8;
}

const detectorStart = source.indexOf('    function detectStockJellyfinTvEnvironment()');
const detectorEnd = source.indexOf('    const stockTvEnvironment', detectorStart);
assert(detectorStart >= 0 && detectorEnd > detectorStart);
const detectorBlock = source.slice(detectorStart, detectorEnd) + '\nglobalThis.__detectTv = detectStockJellyfinTvEnvironment;';
const nonTvFixtures = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    'Mozilla/5.0 (iPad; CPU OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_6) AppleWebKit/605.1.15 Safari/605.1.15'
];

/* A TV WebView with an unhelpful UA still bypasses when it is remote-only. */
{
    const win = {
        navigator: {
            userAgent: 'Mozilla/5.0 (Linux; U) AppleWebKit/537.36',
            platform: 'Linux armv8l',
            maxTouchPoints: 0
        },
        matchMedia() { return { matches: true }; }
    };
    const context = { window: win, navigator: win.navigator, Object, String, RegExp, Number };
    vm.createContext(context);
    vm.runInContext(detectorBlock, context);
    const result = context.__detectTv();
    assert.strictEqual(result.detected, true);
    assert.strictEqual(result.family, 'remote-only-tv');
    assertions += 2;
}

/* A coarse-pointer phone/tablet remains enhanced because it has touch points. */
{
    const win = {
        navigator: {
            userAgent: 'Mozilla/5.0 (Linux; Android 15; Tablet) AppleWebKit/537.36 Mobile',
            platform: 'Linux aarch64',
            maxTouchPoints: 5
        },
        matchMedia() { return { matches: true }; }
    };
    const context = { window: win, navigator: win.navigator, Object, String, RegExp, Number };
    vm.createContext(context);
    vm.runInContext(detectorBlock, context);
    assert.strictEqual(context.__detectTv().detected, false);
    assertions += 1;
}
for (const userAgent of nonTvFixtures) {
    const win = { navigator: { userAgent, platform: '' } };
    const context = { window: win, navigator: win.navigator, Object, String, RegExp };
    vm.createContext(context);
    vm.runInContext(detectorBlock, context);
    assert.strictEqual(context.__detectTv().detected, false, `false TV positive: ${userAgent}`);
    assertions += 1;
}

assert(!/ak-perf-tv|ak-tv-stage|ak-tv-fixed/.test(css));
assert(!/^\s*\.lyricPage\s*\{/m.test(css), 'stock lyricPage must receive no unscoped LyricMotion CSS');
assert(!source.includes("normalized !== 'tv'"));
assert(!source.includes("stored === 'tv'"));
assertions += 4;
console.log(`Stock TV bypass contract: ${assertions} assertions passed.`);
