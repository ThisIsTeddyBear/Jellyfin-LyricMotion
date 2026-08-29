'use strict';

const assert = require('assert');
global.window = global;
require('../src/jellyfin-lyric-romanizer.js');

const R = global.JellyfinLyricRomanizer;

assert.strictEqual(R.version, '6.6.0');

const exactCases = new Map([
    ['ऑल द अनजाना से येह येह येह', 'All the anajaana say yeh yeh yeh'],
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

const nativeControls = new Map([
    ['मैं तेरे प्यार में', 'main tere pyaar mein'],
    ['बेबी मेरा दिल', 'bebee mera dil'],
    ['दिल से', 'dil se'],
    ['हम तुम', 'hum tum'],
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

assert.strictEqual(R.romanize('तू मेरा हमसफर है'), 'too mera humsafar hai');
assert.strictEqual(R.romanize('फूल फिर खिले'), 'phool phir khile');

for (const source of [...exactCases.keys(), ...loanwordCases.keys()]) {
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
