'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src', 'jellyfin-lyric-romanizer.js'), 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);
const romanizer = context.window.JellyfinLyricRomanizer;

let assertions = 0;
function eq(actual, expected, message) { assert.strictEqual(actual, expected, message); assertions += 1; }
function ok(actual, message) { assert.ok(actual, message); assertions += 1; }

const corpora = {
    Malayalam: [
        ['ഇടിമിന്നലാടി നിനക്കെന്താ പേടി', 'idiminnalaadi ninakkenthaa pedi'],
        ['കതക് അടച്ചോടി അടുത്തു നീ വാടി', 'kathak adachodi aduthu nee vaadi'],
        ['കാർ - കൂന്തലു കണ്ടപ്പോൾ കണ്ണൊന്ന് ഉടക്കി', 'kaar - koonthalu kandappol kannonnu udakki'],
        ['ഇടി', 'idi'], ['പേടി', 'pedi'], ['വാടി', 'vaadi'], ['ഉടക്കി', 'udakki'],
        ['ഇത്', 'ithu'], ['അത്', 'athu'], ['എന്ത്', 'enthu'], ['ആണ്', 'aanu'],
        ['വരുന്നത്', 'varunnathu'], ['നല്ലത്', 'nallathu'], ['എന്നത്', 'ennathu'],
        ['നിന്ന്', 'ninnu'], ['വന്ന്', 'vannu'], ['ഉണ്ട്', 'undu'], ['മനസ്സ്', 'manassu'],
        ['വീട്', 'veedu'], ['നാട്', 'naadu'], ['പാട്ട്', 'paattu'],
        ['കതക്', 'kathak'], ['പുലരികളേ', 'pularikale'], ['ടാ', 'taa']
    ],
    Tamil: [
        ['அகம்', 'agam'], ['பகல்', 'pagal'], ['மகள்', 'magal'], ['அஞ்சலி', 'anjali'],
        ['பட்டு', 'pattu'], ['கத்தி', 'kathi'], ['பச்சை', 'pachai'], ['சொல்லு', 'sollu'],
        ['வந்தேன்', 'vandhen'], ['கொஞ்சம்', 'konjam'], ['நன்றி', 'nandri'], ['காற்று', 'kaatru'],
        ['மதுரை', 'madhurai'], ['இதுதான்', 'idhudhaan'], ['ஃபோன்', 'fon']
    ],
    Telugu: [
        ['సంగీతం', 'sangeetam'], ['అంకితం', 'ankitam'], ['సంవత్సరం', 'samvatsaram'],
        ['సంసారం', 'samsaaram'], ['సంస్కారం', 'samskaaram'], ['చిన్న', 'chinna'],
        ['నువ్వే', 'nuvve'], ['ఎందుకే', 'enduke'], ['వెళ్లిపోకు', 'vellipoku'],
        ['కన్నీళ్లు', 'kanneellu'], ['సంతోషం', 'santosham'], ['ప్రాణం', 'praanam']
    ],
    Kannada: [
        ['ಸಂಗೀತ', 'sangeeta'], ['ಅಂಕಿತ', 'ankita'], ['ಸಂವಾದ', 'samvaada'],
        ['ಸಂಸ್ಕಾರ', 'samskaara'], ['ಚಿಕ್ಕ', 'chikka'], ['ಯಾಕೆ', 'yaake'],
        ['ಬಂದೆ', 'bande'], ['ಹೋಗಬೇಡ', 'hogabeda'], ['ಕಣ್ಣೀರು', 'kanneeru'],
        ['ಸಂತೋಷ', 'santosha'], ['ಅಂದವಾಗಿ', 'andavaagi'], ['ಹೃದಯದಲ್ಲಿ', 'hridayadalli']
    ],
    Punjabi: [
        ['ਕੁੜੀ', 'kudi'], ['ਕੁੜੀਆਂ', 'kudiyan'], ['ਚੜ੍ਹ', 'chadh'], ['ਚੜ੍ਹਦਾ', 'chadhda'],
        ['ਚੜ੍ਹਦੀ', 'chadhdi'], ['ਖੁਸ਼', 'khush'], ['ਖ਼ੁਸ਼', 'khush'], ['ਜ਼ਿੰਦਗੀ', 'zindagi'],
        ['ਸੰਗੀਤ', 'sangeet'], ['ਕਹਿੰਦਾ', 'kehnda'], ['ਰਹਿੰਦਾ', 'rehnda'], ['ਗਿਆ', 'gaya'],
        ['ਗਈ', 'gayi'], ['ਗਏ', 'gaye'], ['ਹੋਇਆ', 'hoya'], ['ਕਿਉਂ', 'kyun'],
        ['ਸਾਡੀਆਂ', 'saadiyan'], ['ਤੁਹਾਨੂੰ', 'tuhanu'], ['ਸਾਨੂੰ', 'sanu'], ['ਮੁੰਡਿਆਂ', 'mundeyan'],
        ['ਨੱਚਣਾ', 'nachna'], ['ਸ਼ਹਿਰ', 'shehar'], ['ਕੰਮ', 'kamm'], ['ਪੱਤਾ', 'patta'],
        ['ਅੱਖ', 'akh'], ['ਕਰਨਾ', 'karna'], ['ਸੁੰਦਰ', 'sundar']
    ]
};

const nativeBlocks = /[\u0A00-\u0A7F\u0B80-\u0D7F]/u;
for (const [language, cases] of Object.entries(corpora)) {
    for (const [input, expected] of cases) {
        const output = romanizer.romanize(input);
        eq(output, expected, `${language}: ${input}`);
        eq(romanizer.romanize(input), output, `${language} deterministic: ${input}`);
        ok(!nativeBlocks.test(output), `${language} removes native script: ${input}`);
        ok(romanizer.canRomanize(input), `${language} is romanizable: ${input}`);

        let lastStart = -1;
        let lastEnd = -1;
        for (let i = 0; i <= input.length; i += 1) {
            const start = romanizer.mapBoundary(input, i, 'start');
            const end = romanizer.mapBoundary(input, i, 'end');
            ok(Number.isInteger(start) && start >= 0 && start <= output.length, `${language} start boundary in range ${i}: ${input}`);
            ok(Number.isInteger(end) && end >= 0 && end <= output.length, `${language} end boundary in range ${i}: ${input}`);
            ok(start >= lastStart, `${language} start boundary monotonic ${i}: ${input}`);
            ok(end >= lastEnd, `${language} end boundary monotonic ${i}: ${input}`);
            lastStart = start;
            lastEnd = end;
        }
    }
}

/* Explicitly protect the two most important Malayalam contrasts introduced in
 * v5: a singleton medial ട voices, while word-initial/geminated ട does not. */
eq(romanizer.romanize('ഇടി ടാ പാട്ട്'), 'idi taa paattu', 'Malayalam contextual retroflex voicing does not over-apply');
eq(romanizer.romanize('ബസ് മനസ്സ്'), 'bas manassu', 'Malayalam short-u restoration does not blindly vocalize loan-like single final s');
eq(romanizer.romanize('അക്ഷ്'), 'aksh', 'Malayalam short-u restoration does not vocalize a Sanskrit-style final conjunct');

console.log(`Indic lyric-quality polish: ${assertions} assertions passed.`);
