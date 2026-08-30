'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'jellyfin-lyric-motion.js'),
    'utf8'
);
const start = source.indexOf('function googleRomanizationUrl(text)');
const end = source.indexOf('function cacheGoogleRomanization', start);
assert(start >= 0 && end > start, 'Google service must be embedded in the runtime');

const routeStart = source.indexOf('function usesIndicRomanizer(text)');
const routeEnd = source.indexOf('let romanizerLoadPromise', routeStart);
assert(routeStart >= 0 && routeEnd > routeStart, 'Indic routing must be embedded in the runtime');
const routeContext = {};
vm.createContext(routeContext);
vm.runInContext(`${source.slice(routeStart, routeEnd)}\nthis.usesIndicRomanizer = usesIndicRomanizer;`, routeContext);
assert.strictEqual(routeContext.usesIndicRomanizer('\u0924\u0942'), true, 'Indian Brahmic scripts use LyricG2P');
assert.strictEqual(routeContext.usesIndicRomanizer('\u8a18\u61b6'), false, 'Japanese uses Google Romanization');
assert.strictEqual(routeContext.usesIndicRomanizer('\u0627\u0644\u0639\u0631\u0628\u064a\u0629'), false, 'Arabic uses Google Romanization');

const context = {
    AbortController,
    encodeURIComponent,
    setTimeout,
    clearTimeout,
    GOOGLE_ROMANIZATION_TIMEOUT_MS: 20,
    GOOGLE_ROMANIZATION_MAX_RETRIES: 3,
    GOOGLE_ROMANIZATION_RETRY_DELAY_MS: 1,
    hasNativeScriptCandidate: text => /[^\u0000-\u024f]/u.test(String(text || '')),
    fetch: null
};
vm.createContext(context);
vm.runInContext(
    `${source.slice(start, end)}\nthis.googleApi = { googleRomanizationUrl, parseGoogleRomanization, simplifyGoogleRomanization, googleRomanizeLine };`,
    context
);

const boundaryStart = source.indexOf('function romanizedTextChunks(text)');
const boundaryEnd = source.indexOf('function cloneCueWithPositions', boundaryStart);
assert(
    boundaryStart >= 0 && boundaryEnd > boundaryStart,
    'Romanized ELRC cue-boundary mapper must be embedded in the runtime'
);
vm.runInContext(
    `${source.slice(boundaryStart, boundaryEnd)}\nthis.boundaryApi = { buildRomanizedBoundaryMap, romanizedBoundary };`,
    context
);

const tokenStart = source.indexOf('function cueDerivedTokenRanges(text, cueRecords)');
const tokenEnd = source.indexOf('function cueRecordStart(record)', tokenStart);
assert(tokenStart >= 0 && tokenEnd > tokenStart, 'Romanized phrase token renderer must be present');
context.detectScriptProfile = () => 'latin';
context.usesCueTokenization = () => false;
vm.runInContext(
    `${source.slice(tokenStart, tokenEnd)}\nthis.tokenApi = { getWordRanges };`,
    context
);

async function run() {
    assert(context.googleApi.googleRomanizationUrl('記憶').includes('dt=rm'));
    assert(context.googleApi.googleRomanizationUrl('a b').includes('q=a%20b'));
    assert.strictEqual(
        context.googleApi.parseGoogleRomanization([[['', '記憶', null, 'Kioku']]]),
        'Kioku'
    );
    assert.strictEqual(
        context.googleApi.simplifyGoogleRomanization("Masatī’ca masatā'ī zahirī javānī"),
        "Masati'ca masata'i zahiri javani",
        'academic diacritics and curly apostrophes become readable ASCII'
    );
    assert.strictEqual(
        context.googleApi.simplifyGoogleRomanization('Mainnē tō tērē nāla nacaṇā'),
        'Mainne to tere nala nacana'
    );
    assert.strictEqual(
        context.googleApi.simplifyGoogleRomanization(
            "Masatī’ca masatā'ī zahirī javānī",
            'ਮਸਤੀ ’ਚ ਮਸਤਾਈ ਜ਼ਹਿਰੀ ਜਵਾਨੀ'
        ),
        "Masati'ch masata'i zahiri javani",
        'Indic scholarly c and Gurmukhi apostrophe contractions become ch'
    );
    assert.strictEqual(
        context.googleApi.simplifyGoogleRomanization('nacaṇā', 'ਨੱਚਣਾ'),
        'nachana'
    );

    const compactCjkMap = context.boundaryApi.buildRomanizedBoundaryMap(
        '\u4f60\u597d\u4e16\u754c',
        'ni hao shi jie'
    );
    assert.deepStrictEqual(
        Array.from(compactCjkMap),
        [0, 4, 7, 11, 14],
        'every adjacent compact-script cue gets a shared, non-overlapping boundary'
    );
    for (let index = 1; index < compactCjkMap.length; index += 1) {
        assert(
            compactCjkMap[index] >= compactCjkMap[index - 1],
            'Romanized cue boundaries never move backward'
        );
    }

    const wordAnchoredMap = context.boundaryApi.buildRomanizedBoundaryMap(
        '\u0924\u0942 \u0939\u0948',
        'tu hai'
    );
    assert.deepStrictEqual(
        Array.from(wordAnchoredMap),
        [0, 1, 2, 3, 5, 6],
        'matching whitespace anchors preserve word starts and generated word widths'
    );

    const songSource = '\u8a18\u61b6\u3092\u8f9f\u3063\u3066 \u4e0d\u610f\u306b\u898b\u3048\u305f \u305d\u306e\u8996\u7dda\u306f';
    const songReading = 'Kioku o tadotte fui ni mieta sono shisen wa';
    const secondPhraseEnd = songReading.indexOf('sono');
    const phraseAnchoredMap = context.boundaryApi.buildRomanizedBoundaryMap(
        songSource,
        songReading,
        [
            { source: 0, target: 0 },
            { source: 7, target: 16 },
            { source: 14, target: secondPhraseEnd },
            { source: 19, target: songReading.length }
        ]
    );
    assert.deepStrictEqual(
        [phraseAnchoredMap[0], phraseAnchoredMap[7], phraseAnchoredMap[14], phraseAnchoredMap[19]],
        [0, 16, secondPhraseEnd, songReading.length],
        'the supplied RASEN ELRC phrase boundaries land on their actual Google Romanized phrases'
    );
    const romanizedPhraseRanges = context.tokenApi.getWordRanges(
        songReading,
        [
            { startPos: 0, endPos: 16, cue: { __akRomanizedPhraseCue: true } },
            { startPos: 16, endPos: secondPhraseEnd, cue: { __akRomanizedPhraseCue: true } },
            { startPos: secondPhraseEnd, endPos: songReading.length, cue: { __akRomanizedPhraseCue: true } }
        ]
    );
    assert.deepStrictEqual(
        Array.from(romanizedPhraseRanges, range => range.text),
        ['Kioku o tadotte', 'fui ni mieta', 'sono shisen wa'],
        'Romanized RASEN phrases remain one timed sweep each, rather than separate simultaneous Latin-word sweeps'
    );

    let attempts = 0;
    context.fetch = async () => {
        attempts += 1;
        if (attempts < 3) throw new Error('temporary failure');
        return { ok: true, status: 200, json: async () => [[['', '안녕', null, 'annyeong']]] };
    };
    assert.strictEqual(await context.googleApi.googleRomanizeLine('안녕'), 'annyeong');
    assert.strictEqual(attempts, 3, 'requests use bounded retries');

    context.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => [[['', '你好', null, null]]]
    });
    await assert.rejects(
        () => context.googleApi.googleRomanizeLine('你好'),
        /no Latin reading/
    );

    assert(source.includes('jellyfin-lyric-romanizer.js'));
    assert(source.includes('JellyfinLyricRomanizer'));
    assert(source.includes('&& !usesIndicRomanizer(text)'));
    console.log('Hybrid Romanization regression suite passed.');
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
