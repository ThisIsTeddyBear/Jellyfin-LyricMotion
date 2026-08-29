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
assert(start >= 0 && end > start, 'Google-only service must be embedded in the runtime');

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
    `${source.slice(start, end)}\nthis.googleApi = { googleRomanizationUrl, parseGoogleRomanization, googleRomanizeLine };`,
    context
);

async function run() {
    assert(context.googleApi.googleRomanizationUrl('記憶').includes('dt=rm'));
    assert(context.googleApi.googleRomanizationUrl('a b').includes('q=a%20b'));
    assert.strictEqual(
        context.googleApi.parseGoogleRomanization([[['', '記憶', null, 'Kioku']]]),
        'Kioku'
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

    assert(!source.includes('jellyfin-lyric-romanizer.js'));
    assert(!source.includes('JellyfinLyricRomanizer'));
    console.log('Google-only Romanization regression suite passed.');
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
