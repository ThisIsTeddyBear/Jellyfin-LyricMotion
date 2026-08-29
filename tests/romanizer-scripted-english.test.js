'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
global.window = global;
require('../src/jellyfin-lyric-romanizer.js');

const R = global.JellyfinLyricRomanizer;

assert.strictEqual(R.version, '6.8.1');
const packagedLyricG2PVersion = fs.readFileSync(
    path.join(__dirname, '..', 'LYRICG2P_VERSION'),
    'utf8'
).trim();
const runtimeSource = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'jellyfin-lyric-motion.js'),
    'utf8'
);
assert.strictEqual(packagedLyricG2PVersion, R.version, 'packaged Romanizer version');
assert(
    runtimeSource.includes(`const LYRICG2P_VERSION = '${R.version}';`),
    'runtime Romanizer version must match the installed Romanizer asset'
);
assert.strictEqual(R.pipeline.handlerCount, 11);
assert.deepStrictEqual(R.pipeline.ids, [
    'latin-preserve', 'urdu-shahmukhi', 'explicit-script-map', 'kana', 'hangul',
    'devanagari', 'gurmukhi', 'configured-indic', 'generic-brahmic', 'sinhala', 'han-fallback'
]);

const exactCases = new Map([
    ['ऑल द अनजाना से येह येह येह', 'All the anajaana se yeh yeh yeh'],
    ['आई मेट अ बॉय एंड हिस नेम इस अनजाना', 'I met a boy and his name is anajaana'],
    ['आई लव यू', 'I love you'],
    ['व्हाट इस योर नेम', 'What is your name'],
    ['द एंड', 'The end'],
    ['ਆਈ ਲਵ ਯੂ', 'I love you'],
    ['ஐ லவ் யூ', 'I love you'],
    ['ఐ లవ్ యూ', 'I love you'],
    ['ಐ ಲವ್ ಯು', 'I love you'],
    ['ഐ ലവ് യു', 'I love you'],
    ['আই লাভ ইউ', 'I love you'],
    ['આઈ લવ યુ', 'I love you']
]);

for (const [source, expected] of exactCases) {
    assert.strictEqual(R.romanize(source), expected, source);
}

/* Adversarial phrase cases: the same English pronunciation is filtered
 * through different host-script phonotactics.  These catch greedy token
 * selection (to/too, be/pee), epenthetic vowels and r/l or b/v adaptation. */
const smartEnglishCases = new Map([
    ['आई वांट टू बी विथ यू', 'I want to be with you'],
    ['आई विल ऑलवेज़ लव यू', 'I will always love you'],
    ['व्हाय डिड यू लीव मी', 'Why did you leave me'],
    ['यू आर माय एवरीथिंग', 'You are my everything'],
    ['आई एम नॉट अलोन', 'I am not alone'],
    ['वी विल बी ऑलराइट', 'We will be alright'],
    ['व्हेन यू आर हियर', 'When you are here'],
    ['कैन यू फील द लव टुनाइट', 'Can you feel the love tonight'],
    ['टू बी ऑर नॉट टू बी', 'To be or not to be'],
    ['ஐ வான்ட் டு பீ வித் யூ', 'I want to be with you'],
    ['ഐ വാണ്ട് ടു ബി വിത്ത് യു', 'I want to be with you'],
    ['আই ওয়ান্ট টু বি উইথ ইউ', 'I want to be with you'],
    ['આઈ વોન્ટ ટુ બી વિથ યુ', 'I want to be with you'],
    ['アイ ラブ ユー', 'I love you'],
    ['アイ ウォント トゥ ビー ウィズ ユー', 'I want to be with you'],
    ['아이 러브 유', 'I love you'],
    ['아이 원트 투 비 위드 유', 'I want to be with you']
]);

for (const [source, expected] of smartEnglishCases) {
    assert.strictEqual(R.romanize(source), expected, `phrase decoder: ${source}`);
    const recovery = R.scriptedEnglishRecovery(source);
    assert.strictEqual(recovery.active, true, `phrase recovery active: ${source}`);
    assert(recovery.recognitions.every(item => item.evidence === 'multi-anchor-phrase-viterbi-context'));
}

const recoverySafetyCases = new Map([
    ['आई', 'aayi'],
    ['आई तुम से प्यार', 'aayi tum se pyaar'],
    ['येह येह येह', 'yeh yeh yeh'],
    ['आई लव यू। मैं तुम से प्यार करता हूं।', 'I love you। main tum se pyaar karta hoon।'],
    ['आई लव यू, बेबी मेरा दिल', 'I love you, bebee mera dil'],
    ['こんにちは 世界', 'konnichiha shi jie'],
    ['안녕하세요 친구', 'annyeonghaseyo chingu'],
    ['آئی لو یو', 'aayi lo yo']
]);

const nativeVocableCases = new Map([
    ['ता रा रम पम, ता रा रम पम', 'ta ra ram pam, ta ra ram pam'],
    ['ता रा रम पम', 'ta ra ram pam'],
    ['ना ना ना', 'na na na'],
    ['ला ला ला', 'la la la'],
    ['धिन ता धिन ता', 'dhin ta dhin ta'],
    ['ता तू तो ते', 'ta tu to te']
]);

for (const [source, expected] of nativeVocableCases) {
    assert.strictEqual(R.romanize(source), expected, `native vocable safety: ${source}`);
    assert.strictEqual(R.scriptedEnglishRecovery(source).active, false, `native vocable English recovery: ${source}`);
}

for (const [source, expected] of recoverySafetyCases) {
    assert.strictEqual(R.romanize(source), expected, `recovery safety: ${source}`);
}

const izafatCases = new Map([
    ['जान-ए-मन, जान-ए-मन, जान-ए-मन, जाएगा तू कहाँ?', 'jaan-e-man, jaan-e-man, jaan-e-man, jaayega tu kahan?'],
    ['तू है नूर-ए-नज़र मेरी, दिल मेरा तुझ पे फ़िदा', 'tu hai noor-e-nazar meri, dil mera tujh pe fida'],
    ['दिल-ए-नादान', 'dil-e-naadaan'],
    ['शान–ए–हिंद', 'shaan-e-hind']
]);

for (const [source, expected] of izafatCases) {
    assert.strictEqual(R.romanize(source), expected, `izafat protection: ${source}`);
    const marker = R.romanizeDetailed(source).spans.find(span => span.source === 'ए');
    assert(marker, `missing izafat marker: ${source}`);
    assert.notStrictEqual(marker.path, 'scripted-english-recovery', `izafat became English: ${source}`);
}

const nativeControls = new Map([
    ['मैं तेरे प्यार में', 'main tere pyaar mein'],
    ['बेबी मेरा दिल', 'bebee mera dil'],
    ['दिल से', 'dil se'],
    ['हम तुम', 'hum tum'],
    ['नचले वे नचले वे तू भी नचले वे', 'nachle ve nachle ve tu bhi nachle ve'],
    ['நான் உன்னை காதலிக்கிறேன்', 'naan unnai kaadhalikkiren'],
    ['ഞാൻ നിന്നെ സ്നേഹിക്കുന്നു', 'njaan ninne snehikkunnu'],
    ['నేను నిన్ను ప్రేమిస్తున్నాను', 'nenu ninnu premistunnaanu'],
    ['ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ', 'naanu ninnannu preetisuttene']
]);

for (const [source, expected] of nativeControls) {
    assert.strictEqual(R.romanize(source), expected, `native guard: ${source}`);
}


const loanwordCases = new Map([
    ['हमसफर', 'humsafar'],
    ['हमसफ़र', 'humsafar'],
    ['सफर', 'safar'],
    ['सफ़र', 'safar'],
    ['मुसाफिर', 'musaafir'],
    ['वफा', 'wafa'],
    ['बेवफा', 'bewafa'],
    ['माफ', 'maaf'],
    ['फिक्र', 'fikr'],
    ['फुर्सत', 'fursat'],
    ['फना', 'fana'],
    ['फिजा', 'fiza'],
    ['तूफान', 'toofaan'],
    ['काफिला', 'kaafila'],
    ['हफ्ता', 'hafta'],
    ['आफत', 'aafat'],
    ['दफा', 'dafa'],
    ['अफसोस', 'afsos'],
    ['खफा', 'khafa'],
    ['दफन', 'dafan'],
    ['लफ्ज', 'lafz']
]);

for (const [source, expected] of loanwordCases) {
    assert.strictEqual(R.romanize(source), expected, `loanword pronunciation: ${source}`);
    const span = R.romanizeDetailed(source).spans[0];
    assert.strictEqual(span.path, 'lexicon', `loanword path: ${source}`);
    assert.strictEqual(span.lexicon.source, 'curated-loanword-pronunciation', `loanword provenance: ${source}`);
}

const aspiratedNativeControls = new Map([
    ['फूल', 'phool'],
    ['फिर', 'phir'],
    ['फल', 'phal'],
    ['फिसल', 'phisal']
]);

for (const [source, expected] of aspiratedNativeControls) {
    assert.strictEqual(R.romanize(source), expected, `native ph guard: ${source}`);
}

assert.strictEqual(R.romanize('तू मेरा हमसफर है'), 'tu mera humsafar hai');
assert.strictEqual(R.romanize('फूल फिर खिले'), 'phool phir khile');

const routeCases = new Map([
    ['தமிழ்', ['tamil', 'ta']],
    ['മലയാളം', ['malayalam', 'ml']],
    ['বাংলা', ['bengali', 'bn-as']],
    ['ગુજરાતી', ['gujarati', 'gu']],
    ['සිංහල', ['sinhala', 'si']],
    ['こんにちは', ['kana', 'ja']],
    ['안녕하세요', ['hangul', 'ko']]
]);

for (const [source, [key, language]] of routeCases) {
    const span = R.romanizeDetailed(source).spans.find(item => item.source === source);
    assert(span, `missing detailed span for ${source}`);
    assert.strictEqual(span.language, language, `language route for ${source}`);
    assert.strictEqual(R.segmentText(source)[0].key, key, `segment route for ${source}`);
}

for (const source of [...exactCases.keys(), ...smartEnglishCases.keys(), ...recoverySafetyCases.keys(), ...loanwordCases.keys()]) {
    const output = R.romanize(source);
    let previousStart = 0;
    let previousEnd = 0;
    for (let index = 0; index <= source.length; index += 1) {
        const start = R.mapBoundary(source, index, 'start');
        const end = R.mapBoundary(source, index, 'end');
        assert(start >= previousStart, `start boundary retreated at ${index}: ${source}`);
        assert(end >= previousEnd, `end boundary retreated at ${index}: ${source}`);
        assert(start >= 0 && start <= output.length, `start boundary out of range: ${source}`);
        assert(end >= 0 && end <= output.length, `end boundary out of range: ${source}`);
        previousStart = start;
        previousEnd = end;
    }

    const detailed = R.romanizeDetailed(source);
    assert.strictEqual(
        detailed.spans.map(span => span.romanized).join(''),
        output,
        `detailed span reconstruction: ${source}`
    );
}

/* A native full line can have a prefix which accidentally resembles an
 * English phrase. Generic cue maps must remain based on deterministic G2P,
 * not that prefix-only contextual interpretation. */
const mixedScriptBoundaryCase = 'રയලழに界وアちગ';
const mixedScriptOutput = R.romanize(mixedScriptBoundaryCase);
let mixedPreviousStart = 0;
let mixedPreviousEnd = 0;
for (let index = 0; index <= mixedScriptBoundaryCase.length; index += 1) {
    const start = R.mapBoundary(mixedScriptBoundaryCase, index, 'start');
    const end = R.mapBoundary(mixedScriptBoundaryCase, index, 'end');
    assert(start >= mixedPreviousStart, `mixed-script start boundary retreated at ${index}`);
    assert(end >= mixedPreviousEnd, `mixed-script end boundary retreated at ${index}`);
    assert(start >= 0 && start <= mixedScriptOutput.length);
    assert(end >= 0 && end <= mixedScriptOutput.length);
    mixedPreviousStart = start;
    mixedPreviousEnd = end;
}

const englishLine = 'आई मेट अ बॉय एंड हिस नेम इस अनजाना';
const languages = R.detectLanguages(englishLine)
    .filter(item => item.source.trim())
    .map(item => [item.source, item.language]);
assert.deepStrictEqual(languages.slice(0, 8), [
    ['आई', 'en'], ['मेट', 'en'], ['अ', 'en'], ['बॉय', 'en'],
    ['एंड', 'en'], ['हिस', 'en'], ['नेम', 'en'], ['इस', 'en']
]);
assert.strictEqual(languages[8][1], 'hi-mr-bho-ne');

const recovery = R.scriptedEnglishRecovery(englishLine);
assert.strictEqual(recovery.active, true);
assert(recovery.recognitions.length >= 8);
assert(recovery.replacements.some(item => item.source === 'एंड' && item.text === 'and'));
assert(recovery.replacements.some(item => item.source === 'नेम' && item.text === 'name'));

console.log(`LyricG2P ${R.version}: regression suite passed (${exactCases.size} scripted-English, ${loanwordCases.size} loanword, ${nativeControls.size + aspiratedNativeControls.size} native-control cases).`);
