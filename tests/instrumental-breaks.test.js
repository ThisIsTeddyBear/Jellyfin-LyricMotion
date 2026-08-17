'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const sourcePath = path.join(ROOT, 'src', 'jellyfin-lyric-motion.js');
let runtimeSource = fs.readFileSync(sourcePath, 'utf8');

runtimeSource = runtimeSource.replace(
    /\n\}\)\(\);\s*$/,
    `\n    window.__LyricMotionInstrumentalTest = {\n        calculateLineBounds,\n        planInstrumentalGaps,\n        findInstrumentalGapInList,\n        instrumentalGapProgress,\n        instrumentalWaveGeometry,\n        createInstrumentalGapRow,\n        updateInstrumentalGapVisual,\n        updateLineState,\n        state,\n        minimumTicks: INSTRUMENTAL_GAP_MIN_TICKS,\n        ticksPerSecond: TICKS_PER_SECOND\n    };\n})();\n`
);

class MockElement {
    constructor(tagName = 'div') {
        this.tagName = String(tagName).toUpperCase();
        this.children = [];
        this.parentNode = null;
        this.dataset = {};
        const styleValues = new Map();
        this.style = {
            setProperty(name, value) { styleValues.set(String(name), String(value)); },
            removeProperty(name) { styleValues.delete(String(name)); },
            getPropertyValue(name) { return styleValues.get(String(name)) || ''; }
        };
        const classes = new Set();
        this.classList = {
            add(...names) { names.forEach(name => classes.add(String(name))); },
            remove(...names) { names.forEach(name => classes.delete(String(name))); },
            toggle(name, force) {
                const key = String(name);
                if (force === true) { classes.add(key); return true; }
                if (force === false) { classes.delete(key); return false; }
                if (classes.has(key)) { classes.delete(key); return false; }
                classes.add(key); return true;
            },
            contains(name) { return classes.has(String(name)); }
        };
        Object.defineProperty(this, 'className', {
            get: () => Array.from(classes).join(' '),
            set: value => {
                classes.clear();
                String(value || '').split(/\s+/).filter(Boolean).forEach(name => classes.add(name));
            }
        });
        this.attributes = new Map();
        this.textContent = '';
        this.src = '';
        this.isConnected = true;
    }
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; }
    insertBefore(child, reference) {
        child.parentNode = this;
        const index = this.children.indexOf(reference);
        if (index < 0) this.children.push(child);
        else this.children.splice(index, 0, child);
        return child;
    }
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
        removeItem(key) { values.delete(String(key)); }
    };
}

function makeContext() {
    const noop = () => {};
    const document = {
        body: new MockElement('body'),
        head: new MockElement('head'),
        documentElement: new MockElement('html'),
        hidden: false,
        readyState: 'complete',
        fonts: null,
        createElement(tag) { return new MockElement(tag); },
        createElementNS(_namespace, tag) { return new MockElement(tag); },
        createTextNode(text) { const node = new MockElement('#text'); node.textContent = String(text); return node; },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        getElementsByTagName() { return []; },
        addEventListener() {},
        removeEventListener() {}
    };

    class MockMutationObserver { observe() {} disconnect() {} }
    class MockXHR { open() {} send() {} addEventListener() {} removeEventListener() {} setRequestHeader() {} }

    const context = {
        console: { log: noop, info: noop, warn: noop, error: noop, debug: noop },
        document,
        navigator: { userAgent: 'Mozilla/5.0 desktop', platform: 'Linux x86_64', maxTouchPoints: 1 },
        location: { hash: '', href: 'http://localhost/web/index.html' },
        localStorage: storageStub(),
        sessionStorage: storageStub(),
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
        matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop })
    };
    context.window = context;
    context.globalThis = context;
    context.window.addEventListener = noop;
    context.window.removeEventListener = noop;
    return vm.createContext(context);
}

const context = makeContext();
vm.runInContext(runtimeSource, context, { filename: 'jellyfin-lyric-motion.instrumental-test.js' });
const api = context.window.__LyricMotionInstrumentalTest;
assert(api, 'instrumental test helpers must be exported by the instrumented runtime');

const S = api.ticksPerSecond;
const line = (start, end, trustedEnd, extra = {}) => Object.assign({
    startTicks: start * S,
    endTicks: end * S,
    trustedEndTicks: trustedEnd == null ? null : trustedEnd * S,
    isBackgroundVocal: false
}, extra);

{
    const gaps = api.planInstrumentalGaps([
        line(3, 5, 5),
        line(8, 10, 10)
    ]);
    assert.strictEqual(gaps.length, 2, '3s intro and 3s internal gap should both render');
    assert.strictEqual(
        JSON.stringify(gaps.map(gap => [gap.startTicks / S, gap.endTicks / S, gap.nextLineIndex, gap.isIntro])),
        JSON.stringify([[0, 3, 0, true], [5, 8, 1, false]])
    );
}

{
    const gaps = api.planInstrumentalGaps([
        line(0, 4, 4),
        line(5.99, 8, 8)
    ]);
    assert.strictEqual(gaps.length, 0, '1.99s ordinary pause must not flash the note');
}

{
    const gaps = api.planInstrumentalGaps([
        line(0, 4, null),
        line(9, 11, 11)
    ]);
    assert.strictEqual(gaps.length, 0, 'unknown LRC line end must not invent an instrumental gap');
}

{
    const gaps = api.planInstrumentalGaps([
        line(0, 4, 4),
        line(2, 6, 6, { isBackgroundVocal: true }),
        line(9, 12, 12)
    ]);
    assert.strictEqual(gaps.length, 1, 'background vocal must postpone the instrumental gap');
    assert.strictEqual(gaps[0].startTicks / S, 6);
    assert.strictEqual(gaps[0].endTicks / S, 9);
}

{
    const gaps = api.planInstrumentalGaps([
        line(0, 4, 4),
        line(2, 10, 10, { isBackgroundVocal: true }),
        line(9, 12, 12)
    ]);
    assert.strictEqual(gaps.length, 0, 'a vocal overlapping the next line must suppress the note');
}

{
    const gaps = api.planInstrumentalGaps([
        line(0, 2, 2),
        line(0, 3, 3, { isBackgroundVocal: true }),
        line(6, 8, 8)
    ]);
    assert.strictEqual(gaps.length, 1, 'simultaneous lead/background starts are one vocal block');
    assert.strictEqual(gaps[0].startTicks / S, 3);
    assert.strictEqual(gaps[0].endTicks / S, 6);
}

{
    const gaps = api.planInstrumentalGaps([
        line(0, 2, 2),
        line(62, 64, 64)
    ]);
    assert.strictEqual(gaps.length, 1, 'a long instrumental must use one continuous note');
    assert.strictEqual(gaps[0].durationTicks / S, 60);

    const gap = gaps[0];
    assert.strictEqual(api.instrumentalGapProgress(gap, 2 * S), 0);
    assert.strictEqual(api.instrumentalGapProgress(gap, 32 * S), 0.5);
    assert.strictEqual(api.instrumentalGapProgress(gap, 62 * S), 1);
    assert.strictEqual(api.findInstrumentalGapInList(gaps, 32 * S), gap);
    assert.strictEqual(api.findInstrumentalGapInList(gaps, 62 * S), null,
        'the upcoming lyric owns the exact end tick');
}

{
    const bounds = api.calculateLineBounds(
        { Start: 0 },
        0,
        [],
        [
            { Position: 0, EndPosition: 4, Start: 0, End: 2 * S },
            { Position: 5, EndPosition: 9, Start: 2 * S }
        ],
        9
    );
    assert.strictEqual(bounds.trustedEndTicks, null,
        'an earlier explicit cue end must not pretend the final cue has ended');
}

{
    const bounds = api.calculateLineBounds(
        { Start: 0 },
        0,
        [],
        [
            { Position: 0, EndPosition: 4, Start: 0 },
            { Position: 5, EndPosition: 9, Start: 2 * S },
            { Position: 9, EndPosition: 9, Start: 4 * S }
        ],
        9
    );
    assert.strictEqual(bounds.trustedEndTicks, 4 * S,
        'final empty enhanced timestamp must be accepted as the true vocal end');
}

{
    const bounds = api.calculateLineBounds(
        { Start: 0, End: 4 * S },
        0,
        [],
        [],
        9
    );
    assert.strictEqual(bounds.trustedEndTicks, 4 * S,
        'explicit line end must be accepted for line-synced lyrics');
}



{
    const gap = {
        index: 0,
        startTicks: 4 * S,
        endTicks: 8 * S,
        durationTicks: 4 * S,
        nextLineIndex: 1
    };
    const previous = {
        element: new MockElement('div'),
        words: [],
        _akPhase: null,
        _akBand: null,
        _akOverlapCurrent: null
    };
    const upcoming = {
        element: new MockElement('div'),
        words: [],
        _akPhase: null,
        _akBand: null,
        _akOverlapCurrent: null
    };

    api.updateLineState(previous, 0, 1, [], 5 * S, 0, true, gap);
    api.updateLineState(upcoming, 1, 1, [], 5 * S, 0, true, gap);

    assert.strictEqual(previous.element.classList.contains('ak-past'), true,
        'finished lyric must become past while the instrumental note is active');
    assert.strictEqual(previous.element.classList.contains('ak-current'), false);
    assert.strictEqual(upcoming.element.classList.contains('ak-future'), true,
        'upcoming lyric must remain future until its exact start');
    assert.strictEqual(upcoming.element.classList.contains('ak-current'), false,
        'the music note, not the upcoming lyric, owns the gap');
    assert.strictEqual(previous.element.classList.contains('ak-near'), false,
        'finished lyric must not compete with the active instrumental note');
    assert.strictEqual(previous.element.classList.contains('ak-near2'), false);
    assert.strictEqual(upcoming.element.classList.contains('ak-near'), false,
        'upcoming lyric must remain visually subordinate to the active note');
    assert.strictEqual(upcoming.element.classList.contains('ak-near2'), false);
}

{
    const gap = {
        index: 0,
        startTicks: 10 * S,
        endTicks: 20 * S,
        durationTicks: 10 * S,
        nextLineIndex: 4,
        isIntro: false,
        element: null,
        lastProgress: -1
    };
    const row = api.createInstrumentalGapRow(gap);
    assert(row, 'instrumental row must be created');
    assert.strictEqual(row.getAttribute('aria-hidden'), null,
        'interactive instrumental note must not be hidden from accessibility APIs');
    assert.strictEqual(row.children.length, 1);
    assert.strictEqual(row.classList.contains('ak-future'), true);

    const note = row.children[0];
    assert.strictEqual(note.getAttribute('role'), 'button');
    assert.strictEqual(note.getAttribute('tabindex'), '0');
    assert(note.getAttribute('aria-label').includes('instrumental break'));
    const svg = note.children[0];
    const defs = svg.children[0];
    const fillClip = defs.children[0];
    const fillWave = fillClip.children[0];
    const surface = svg.children[3];
    assert.strictEqual(svg.tagName, 'SVG');
    assert.strictEqual(svg.getAttribute('viewBox'), '0 0 64 80');
    assert.strictEqual(svg.children.length, 4);
    assert.strictEqual(fillWave.tagName, 'PATH',
        'liquid clipping must use a vector wave path, not a rectangular crop');
    assert.strictEqual(surface.tagName, 'PATH');
    assert(fillWave.getAttribute('d').startsWith('M0.000 80.000'));

    const lyricHost = new MockElement('div');
    lyricHost.appendChild(row);
    api.state.instrumentalGaps = [gap];
    api.state.activeInstrumentalGapIndex = -1;
    const progress = api.updateInstrumentalGapVisual(gap, 15 * S);
    assert.strictEqual(progress, 0.5);
    assert.strictEqual(row.classList.contains('ak-active'), true);
    assert.strictEqual(row.classList.contains('ak-future'), false);
    const midpointPath = fillWave.getAttribute('d');
    assert(midpointPath.includes('L64 80 L0 80 Z'));

    /* Same media time means the visual remains frozen, which is pause-safe. */
    assert.strictEqual(api.updateInstrumentalGapVisual(gap, 15 * S), 0.5);
    assert.strictEqual(fillWave.getAttribute('d'), midpointPath);

    /* The surface oscillation is itself media-time-derived. */
    api.updateInstrumentalGapVisual(gap, 15.3 * S);
    assert.notStrictEqual(fillWave.getAttribute('d'), midpointPath,
        'advancing media time must move the liquid surface');

    /* Seeking is a direct time lookup, not a standalone animation timer. */
    assert.strictEqual(api.updateInstrumentalGapVisual(gap, 18 * S), 0.8);

    api.updateInstrumentalGapVisual(null, 20 * S);
    assert.strictEqual(row.classList.contains('ak-active'), false);
    assert.strictEqual(row.classList.contains('ak-past'), true);
    assert(fillWave.getAttribute('d').startsWith('M0.000 0.000'));

    /* Seek before the gap: the row returns to a dim future state, not hidden. */
    api.updateInstrumentalGapVisual(null, 5 * S);
    assert.strictEqual(row.classList.contains('ak-future'), true);
    assert.strictEqual(row.classList.contains('ak-past'), false);
    assert(fillWave.getAttribute('d').startsWith('M0.000 80.000'));

    const livingWave = api.instrumentalWaveGeometry(gap, 0.5, 15 * S);
    const laterWave = api.instrumentalWaveGeometry(gap, 0.5, 15.3 * S);
    assert(livingWave.amplitude > 0);
    assert.notStrictEqual(livingWave.surfacePath, laterWave.surfacePath);
    const settlingWave = api.instrumentalWaveGeometry(gap, 0.99, 19.9 * S);
    assert.strictEqual(settlingWave.amplitude, 0,
        'wave must settle flat immediately before the next lyric');

}


{
    const bounds = api.calculateLineBounds(
        { Start: 0, End: 3 * S },
        0,
        [],
        [
            { Position: 0, EndPosition: 4, Start: 0 },
            { Position: 5, EndPosition: 9, Start: 4 * S }
        ],
        9
    );
    assert.strictEqual(bounds.trustedEndTicks, null,
        'a malformed line End before the final vocal start must not create false silence');
}

{
    const gaps = api.planInstrumentalGaps([
        Object.assign(line(0, 2, 2), { text: 'lead' }),
        Object.assign(line(4, 4, 4), { text: '   ' }),
        Object.assign(line(8, 10, 10), { text: 'next' })
    ]);
    assert.strictEqual(gaps.length, 1, 'empty timed rows must not fragment a real instrumental section');
    assert.strictEqual(gaps[0].startTicks / S, 2);
    assert.strictEqual(gaps[0].endTicks / S, 8);
}

{
    let seed = 0x6510321;
    const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 0x100000000;
    };

    const fuzzCases = Math.max(1, Number.parseInt(process.env.INSTRUMENTAL_FUZZ_CASES || '5000', 10) || 5000);
    for (let iteration = 0; iteration < fuzzCases; iteration += 1) {
        const records = [];
        let cursor = random() * 4;
        const count = 2 + Math.floor(random() * 18);

        for (let index = 0; index < count; index += 1) {
            const start = cursor;
            const vocalDuration = 0.25 + random() * 4.5;
            const trusted = random() < 0.82;
            const end = start + vocalDuration;
            records.push({
                text: random() < 0.03 ? '' : `line-${index}`,
                startTicks: Math.round(start * S),
                endTicks: Math.round(end * S),
                trustedEndTicks: trusted ? Math.round(end * S) : null,
                isBackgroundVocal: random() < 0.18
            });

            /* Sometimes add a genuine overlapping background-vocal lane. */
            if (random() < 0.12) {
                const overlapStart = start + random() * Math.max(0.05, vocalDuration * 0.6);
                const overlapEnd = overlapStart + 0.2 + random() * 3.5;
                records.push({
                    text: `bg-${index}`,
                    startTicks: Math.round(overlapStart * S),
                    endTicks: Math.round(overlapEnd * S),
                    trustedEndTicks: random() < 0.9 ? Math.round(overlapEnd * S) : null,
                    isBackgroundVocal: true
                });
            }

            cursor = start + vocalDuration + random() * 7;
        }

        const gaps = api.planInstrumentalGaps(records);
        let previousEnd = -Infinity;
        gaps.forEach(gap => {
            assert(gap.durationTicks >= api.minimumTicks,
                'every planned gap must satisfy the anti-pop minimum');
            assert(gap.startTicks < gap.endTicks,
                'planned instrumental gap must have positive duration');
            assert(gap.startTicks >= previousEnd,
                'planned gaps must be chronological and non-overlapping');
            previousEnd = gap.endTicks;

            const middle = gap.startTicks + gap.durationTicks / 2;
            assert.strictEqual(api.findInstrumentalGapInList(gaps, middle), gap);
            const progress = api.instrumentalGapProgress(gap, middle);
            assert(progress >= 0.499999 && progress <= 0.500001,
                'time-derived fill must remain stable at the temporal midpoint');
        });
    }
}

/* Visual-state seek fuzz: synthetic rows must stay future/active/past rather
 * than being inserted/removed at the boundary, and vector clip geometry must
 * remain inside the 64x80 note viewport. */
{
    let seed = 0x322651;
    const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 0x100000000;
    };
    const rounds = 1200;

    for (let index = 0; index < rounds; index += 1) {
        const start = 1 + random() * 120;
        const duration = 2 + random() * 90;
        const gap = {
            index: 0,
            startTicks: Math.round(start * S),
            endTicks: Math.round((start + duration) * S),
            durationTicks: Math.round(duration * S),
            nextLineIndex: 1,
            isIntro: false,
            element: null,
                lastProgress: -1
        };
        const row = api.createInstrumentalGapRow(gap);
        const fuzzHost = new MockElement('div');
        fuzzHost.appendChild(row);
        const svg = row.children[0].children[0];
        const fillWave = svg.children[0].children[0].children[0];

        api.state.instrumentalGaps = [gap];
        api.state.activeInstrumentalGapIndex = -1;

        api.updateInstrumentalGapVisual(null, gap.startTicks - 1);
        assert(row.classList.contains('ak-future'));
        assert(fillWave.getAttribute('d').startsWith('M0.000 80.000'));

        const fraction = 0.05 + random() * 0.90;
        const inside = gap.startTicks + gap.durationTicks * fraction;
        const progress = api.updateInstrumentalGapVisual(gap, inside);
        assert(row.classList.contains('ak-active'));
        assert(progress > 0 && progress < 1);
        const geometry = api.instrumentalWaveGeometry(gap, progress, inside);
        assert(geometry.baseY >= 0 && geometry.baseY <= 80);
        assert(geometry.amplitude >= 0 && geometry.amplitude <= 2.35 + 1e-9);
        assert(geometry.fillPath.startsWith('M0.000 '));
        assert(geometry.fillPath.endsWith('L64 80 L0 80 Z'));
        const coordinates = geometry.surfacePath.match(/-?\d+(?:\.\d+)?/g).map(Number);
        for (let pair = 0; pair < coordinates.length; pair += 2) {
            const x = coordinates[pair];
            const y = coordinates[pair + 1];
            assert(x >= 0 && x <= 64);
            assert(y >= 0 && y <= 80,
                'wave surface must stay inside the SVG viewport');
        }

        api.updateInstrumentalGapVisual(null, gap.endTicks + 1);
        assert(row.classList.contains('ak-past'));
        assert(fillWave.getAttribute('d').startsWith('M0.000 0.000'));
    }
}

console.log(`Instrumental-break planning: threshold, intro, overlaps, trusted endings, long gaps and time-derived wave fill passed with ${process.env.INSTRUMENTAL_FUZZ_CASES || '5,000'} randomized timeline fuzz cases.`);
