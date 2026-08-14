'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const mainSource = fs.readFileSync(path.join(root, 'src', 'jellyfin-lyric-motion.js'), 'utf8');
const romanizerSource = fs.readFileSync(path.join(root, 'src', 'jellyfin-lyric-romanizer.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src', 'jellyfin-lyric-motion.css'), 'utf8');

let assertions = 0;
function ok(value, message) { assert.ok(value, message); assertions += 1; }
function eq(actual, expected, message) { assert.strictEqual(actual, expected, message); assertions += 1; }

const romanizerContext = { window: {} };
vm.createContext(romanizerContext);
vm.runInContext(romanizerSource, romanizerContext);
const romanizer = romanizerContext.window.JellyfinLyricRomanizer;
ok(romanizer, 'romanizer API exported');
eq(romanizer.version, '5.1.0', 'LyricG2P v5 version');
ok(romanizer.offlineOnly === true, 'Romanizer declares fully offline operation');
ok(typeof romanizer.mapBoundary === 'function', 'Romanizer exposes source-to-Roman cue boundary mapping');
ok(typeof romanizer.mapExternalBoundary === 'undefined', 'provider/external boundary mapper was removed');
ok(Array.isArray(romanizer.supportedLanguageFamilies), 'Romanizer reports supported language families');
ok(romanizer.supportedLanguageFamilies.some(value => /Malayalam/.test(value)), 'Malayalam is first-class');
ok(romanizer.supportedLanguageFamilies.some(value => /Tamil/.test(value)), 'Tamil is first-class');
ok(romanizer.supportedLanguageFamilies.some(value => /Telugu/.test(value)), 'Telugu is first-class');
ok(romanizer.supportedLanguageFamilies.some(value => /Kannada/.test(value)), 'Kannada is first-class');
ok(romanizer.supportedLanguageFamilies.some(value => /Punjabi/.test(value)), 'Punjabi is first-class');
ok(romanizer.fallbackEntries > 40000, 'broad offline Unicode fallback map remains bundled');
ok(/offline-lyricg2p-v5/.test(romanizer.strategy), 'strategy identifies the in-house offline LyricG2P engine');

const languageCorpora = {
    Hindi: [
        ['मुंडा सदा डोली चढ़ गया', 'munda sada doli chad gaya'],
        ['बैंड बज गया ओए होए होए', 'band baj gaya oye hoye hoye'],
        ['छड्ड के सारियां एह कवारियां', 'chhad ke saariyan eh kawariyan'],
        ['मुझे तुमसे प्यार है', 'mujhe tumse pyaar hai'],
        ['ज़िंदगी में क्यों नहीं', 'zindagi mein kyon nahin'],
        ['मैं तुम्हारा हूँ', 'main tumhaara hoon'],
        ['करता करती जनता समझता', 'karta karti janta samajhta'],
        ['मेरे दिल में हम तुम', 'mere dil mein hum tum'],
        ['मिलकर चलते हैं', 'milkar chalte hain'],
        ['कमल', 'kamal']
    ],
    Punjabi: [
        ['ਪੰਜਾਬੀ ਮੁੰਡਾ ਸਾਡਾ', 'panjabi munda saada'],
        ['ਛੱਡ ਕੇ ਸਾਰੀਆਂ ਕੁਆਰੀਆਂ', 'chhad ke saariyan kuwaariyan'],
        ['ਤੇਰੇ ਬਿਨਾ ਜੀਣਾ ਕੀ', 'tere bina jeena ki'],
        ['ਦਿਲ ਮੇਰਾ ਤੈਨੂੰ ਚਾਹੁੰਦਾ', 'dil mera tainu chahunda'],
        ['ਅੱਖੀਆਂ ਵਿਚ ਤੂੰ', 'akhiyan vich tu'],
        ['ਸੋਹਣੀਏ ਮੇਰੀ ਜਾਨ', 'sohniye meri jaan'],
        ['ਰੱਬ ਜਾਣੇ', 'rabb jaane'],
        ['ਕੁੜੀ', 'kudi'],
        ['ਕੁੜੀਆਂ', 'kudiyan'],
        ['ਚੜ੍ਹ', 'chadh'],
        ['ਚੜ੍ਹਦਾ', 'chadhda'],
        ['ਖੁਸ਼', 'khush'],
        ['ਜ਼ਿੰਦਗੀ', 'zindagi'],
        ['ਸੰਗੀਤ', 'sangeet'],
        ['ਕਹਿੰਦਾ', 'kehnda'],
        ['ਰਹਿੰਦਾ', 'rehnda'],
        ['ਕੰਮ', 'kamm'],
        ['ਪੱਤਾ', 'patta'],
        ['ਕਰਨਾ', 'karna'],
        ['ਸੁੰਦਰ', 'sundar'],
        ['ਗਿਆ ਗਈ ਹੋਇਆ', 'gaya gayi hoya'],
        ['ਕਿਉਂ ਸਾਡੀਆਂ', 'kyun saadiyan'],
        ['ਤੁਹਾਨੂੰ ਸਾਨੂੰ ਮੁੰਡਿਆਂ', 'tuhanu sanu mundeyan'],
        ['ਨੱਚਣਾ ਸ਼ਹਿਰ', 'nachna shehar']
    ],
    Malayalam: [
        ['ഓമലേ', 'o male'],
        ['പുലരികളേ', 'pularikale'],
        ['മറഞ്ഞു പോയതോ എങ്ങനെ', 'maranju poyatho engane'],
        ['നിനക്കായി കരുതി', 'ninakkayi karuthi'],
        ['ജനലിൽ എന്നും', 'janalil ennum'],
        ['കാതോർത്തിരുന്നു', 'kathorthirunnu'],
        ['എവിടെയോ ഒതുങ്ങി നിന്നോ', 'evideyo othungi ninno'],
        ['വെറുമൊരു സ്വപ്നമായി', 'verumoru swapnamayi'],
        ['ചിരിയായി കഥയായി', 'chiriyayi kadhayayi'],
        ['കാറ്റിൻ തൂവൽ പോലെ മെല്ലെ തഴുകാനേ', 'kaattin thooval pole melle thazhukaane'],
        ['മോഹം പൂത്തെൻ നെഞ്ചിനുള്ളിൽ മഴ പോലെ', 'moham poothen nenjinullil mazha pole'],
        ['അവളുടെ കരിമഷി മിഴി ഉണ്ടല്ലോ', 'avalude karimashi mizhi undallo'],
        ['മിഴികളിൽ നിറയുന്ന മൊഴിയുണ്ടല്ലോ', 'mizhikalil nirayunna mozhiyundallo'],
        ['മറുപടി പറയുവാൻ മടിയുണ്ടല്ലോ', 'marupadi parayuvaan madiyundallo'],
        ['നിന്റെ നുണക്കുഴി കണ്ടപ്പോ', 'ninte nunakkuzhi kandappo'],
        ['അടിവയറ്റിൽ മഞ്ഞുള്ള രാത്രി', 'adivayattil manjulla raathri'],
        ['നിന്റെ ചിരിയതു കണ്ടപ്പോ', 'ninte chiriyathu kandappo'],
        ['കുഞ്ഞേ നീ എവിടെ പോകുന്നു', 'kunje nee evide pokunnu'],
        ['എന്റെ മനസ്സിൽ ഒരു സ്വപ്നം', 'ente manassil oru swapnam'],
        ['സംഗീതം മനോഹരം', 'sangeetham manoharam'],
        ['ഇത് അത് എന്ത് ആണ്', 'ithu athu enthu aanu'],
        ['വരുന്നത് നല്ലത് എന്നത്', 'varunnathu nallathu ennathu'],
        ['മനസ്സ്', 'manassu'],
        ['ഇടിമിന്നലാടി നിനക്കെന്താ പേടി', 'idiminnalaadi ninakkenthaa pedi'],
        ['കതക് അടച്ചോടി അടുത്തു നീ വാടി', 'kathak adachodi aduthu nee vaadi'],
        ['കാർ - കൂന്തലു കണ്ടപ്പോൾ കണ്ണൊന്ന് ഉടക്കി', 'kaar - koonthalu kandappol kannonnu udakki'],
        ['ഇടി പേടി വാടി ഉടക്കി', 'idi pedi vaadi udakki'],
        ['പത്ത് നിന്ന് വന്ന്', 'pathu ninnu vannu'],
        ['വീട് നാട് പാട്ട്', 'veedu naadu paattu'],
        ['കതക് പുലരികളേ', 'kathak pularikale']
    ],
    Tamil: [
        ['வணக்கம் காதலே', 'vanakkam kaadhale'],
        ['உன்னை காதலிக்கிறேன்', 'unnai kaadhalikkiren'],
        ['என் உயிரே', 'en uyire'],
        ['என் மனதில் ஒரு கனவு', 'en manadhil oru kanavu'],
        ['மழையில் நனைந்தேன்', 'mazhaiyil nanaindhen'],
        ['பூவே உனக்காக', 'poove unakkaaga'],
        ['நெஞ்சம் மறப்பதில்லை', 'nenjam marappadhillai'],
        ['சின்ன சின்ன ஆசை', 'chinna chinna aasai'],
        ['அகம் பகல் மகள்', 'agam pagal magal'],
        ['அஞ்சலி', 'anjali'],
        ['பட்டு கத்தி பச்சை', 'pattu kathi pachai'],
        ['சொல்லு', 'sollu'],
        ['ஃபோன்', 'fon']
    ],
    Telugu: [
        ['తెలుగు పాట', 'telugu paata'],
        ['నిన్ను ప్రేమిస్తున్నాను', 'ninnu premistunnaanu'],
        ['నా హృదయంలో ప్రేమ ఉంది', 'naa hrudayamlo prema undi'],
        ['నా మనసులో నీవే ఉన్నావు', 'naa manasulo neeve unnaavu'],
        ['నీ కళ్లలో ప్రేమ', 'nee kallalo prema'],
        ['సంగీతం అంకితం', 'sangeetam ankitam'],
        ['సంవత్సరం సంసారం', 'samvatsaram samsaaram'],
        ['చిన్న', 'chinna']
    ],
    Kannada: [
        ['ಕನ್ನಡ ಹಾಡು', 'kannada haadu'],
        ['ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ', 'ninnannu preetisuttene'],
        ['ನನ್ನ ಮನಸು ನಿನ್ನದು', 'nanna manasu ninnadu'],
        ['ನೀನು ನನ್ನ ಪ್ರೀತಿ', 'neenu nanna preeti'],
        ['ಸಂಗೀತ ಅಂಕಿತ', 'sangeeta ankita'],
        ['ಸಂವಾದ ಸಂಸ್ಕಾರ', 'samvaada samskaara'],
        ['ಚಿಕ್ಕ', 'chikka']
    ],
    BengaliAssamese: [
        ['বাংলা গান', 'bangla gan'],
        ['অসমীয়া গান', 'asomiya gan'],
        ['আমি তোমাকে ভালোবাসি', 'ami tomake bhalobashi'],
        ['আমার হৃদয়ে তুমি', 'amar hridoye tumi'],
        ['সংগীত আমার জীবন', 'sangeet amar jibon'],
        ['আমি তোমায় ভালোবাসি', 'ami tomay bhalobashi']
    ],
    Gujarati: [
        ['ગુજરાતી ગીત', 'gujarati geet'],
        ['મારી આંખોમાં તું છે', 'mari aankhoma tu chhe'],
        ['મારું દિલ તારા માટે', 'maru dil tara mate'],
        ['પ્રેમ એક સફર છે', 'prem ek safar chhe']
    ],
    Odia: [
        ['ଓଡ଼ିଆ ଗୀତ', 'odia geet'],
        ['ମୁଁ ତୁମେ ପ୍ରେମ', 'mu tume prem']
    ],
    UrduShahmukhi: [
        ['دل میں محبت ہے', 'dil mein mohabbat hai'],
        ['میں تم سے پیار کرتا ہوں', 'mein tum se pyaar karta hoon'],
        ['تیری آنکھوں میں خواب', 'teri aankhon mein khwaab'],
        ['زندگی ایک سفر ہے', 'zindagi ek safar hai'],
        ['رب جانے', 'rab jaane']
    ]
};

for (const [language, corpus] of Object.entries(languageCorpora)) {
    for (const [input, expected] of corpus) {
        eq(romanizer.romanize(input), expected, `${language} lyric-style romanization: ${input}`);
        ok(romanizer.canRomanize(input), `${language} is detected as romanizable: ${input}`);
    }
}

const broadExamples = new Map([
    ['你好世界', 'ni hao shi jie'],
    ['こんにちは', 'konnichiha'],
    ['きょう', 'kyou'],
    ['안녕하세요', 'annyeonghaseyo'],
    ['පක්කා', 'pakkaa'],
    ['සිංහල', 'sinhala'],
    ['ສະບາຍດີ', 'sabaydi'],
    ['မင်္ဂလာပါ', 'mngglapa'],
    ['សួស្តី', 'suastii'],
    ['བཀྲ་ཤིས', 'bkr shis'],
    ['שלום', 'slwm'],
    ['ܫܠܡܐ', 'shlma'],
    ['ސަލާމް', 'salam'],
    ['Привет мир', 'Privet mir']
]);
for (const [input, expected] of broadExamples) {
    eq(romanizer.romanize(input), expected, `broad fallback romanizes ${input}`);
}

eq(romanizer.romanize(' café '), ' café ', 'Latin text and whitespace are preserved');
ok(!romanizer.canRomanize('Bonjour café'), 'Latin-only text never shows the Romanize control');
eq(romanizer.romanize('മലയാളം'.normalize('NFD')), 'malayalam', 'NFD input is normalized before conversion');
eq(romanizer.romanize('ടാ'), 'taa', 'Malayalam word-initial retroflex stop is not over-voiced');
eq(romanizer.romanize('പാട്ട്'), 'paattu', 'Malayalam geminate retroflex remains fortis while final short-u is restored');
eq(romanizer.romanize('പുലരികളേ'), 'pularikale', 'Malayalam contextual rule does not over-voice accepted non-retroflex lyric spelling');

eq(romanizer.mapBoundary('बैंड', 3, 'end'), 3, 'Devanagari override maps timed prefix to ban');
eq(romanizer.mapBoundary('बैंड', 3, 'start'), 3, 'Devanagari override starts final d at same boundary');
eq(romanizer.mapBoundary('करता', 1, 'end'), 2, 'schwa-aware mapping keeps ka as a complete cue');
eq(romanizer.mapBoundary('ਮੁੰਡਾ', 3, 'end'), 3, 'Gurmukhi mapping preserves contextual nasal boundary');

function extractFunction(source, name) {
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
        if (lineComment) { if (c === '\n') lineComment = false; continue; }
        if (blockComment) { if (c === '*' && n === '/') { blockComment = false; i += 1; } continue; }
        if (quote) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) quote = ''; continue; }
        if (c === '/' && n === '/') { lineComment = true; i += 1; continue; }
        if (c === '/' && n === '*') { blockComment = true; i += 1; continue; }
        if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
        if (c === '{') depth += 1;
        if (c === '}') { depth -= 1; if (depth === 0) return source.slice(start, i + 1); }
    }
    throw new Error(`unterminated ${name}`);
}

const context = {
    window: { JellyfinLyricRomanizer: romanizer },
    state: { romanizationCache: new Map(), romanizationLineCount: 0 },
    BACKGROUND_VOCAL_TOKEN: '[ak:bg]',
    LEGACY_BACKGROUND_VOCAL_SENTINEL: '\u2063\u2060',
    cueValue(cue, pascal, camel) { return cue[pascal] !== undefined ? cue[pascal] : cue[camel]; },
    lyricValue(lyric, pascal, camel) { return lyric[pascal] !== undefined ? lyric[pascal] : lyric[camel]; }
};
vm.createContext(context);
vm.runInContext(
    'const ROMANIZATION_CACHE_MAX_ENTRIES = 1800;\n' + [
        'getRomanizer', 'romanizeCached', 'cloneCueWithPositions', 'cloneLyricWithDisplay',
        'lyricTextProfile', 'romanizedBoundaryStart', 'romanizedBoundaryEnd', 'romanizedLyricView'
    ].map(name => extractFunction(mainSource, name)).join('\n'),
    context
);

const chinese = {
    Text: '你好',
    Cues: [
        { Position: 0, EndPosition: 1, Start: 10000000 },
        { Position: 1, EndPosition: 2, Start: 12000000 }
    ]
};
const chineseRoman = context.romanizedLyricView(chinese);
eq(chineseRoman.Text, 'ni hao', 'Han line is romanized as one complete line');
eq(chineseRoman.Cues[0].Position, 0, 'first Han cue starts at zero');
eq(chineseRoman.Cues[0].EndPosition, 2, 'first Han cue ends after ni');
eq(chineseRoman.Cues[1].Position, 3, 'second Han cue starts after generated separator');
eq(chineseRoman.Cues[1].EndPosition, 6, 'second Han cue ends after hao');
eq(chineseRoman.Cues[1].Start, 12000000, 'Han cue timestamp is unchanged');

const hindiLine = 'बैंड बज गया ओए होए होए';
const hindiWords = ['बैंड', 'बज', 'गया', 'ओए', 'होए', 'होए'];
const hindiRomanWords = ['band', 'baj', 'gaya', 'oye', 'hoye', 'hoye'];
let searchFrom = 0;
const hindiCues = hindiWords.map((word, index) => {
    const position = hindiLine.indexOf(word, searchFrom);
    searchFrom = position + word.length;
    return { Position: position, EndPosition: position + word.length, Start: 30000000 + index * 1000000 };
});
const hindiRoman = context.romanizedLyricView({ Text: hindiLine, Cues: hindiCues });
eq(hindiRoman.Text, 'band baj gaya oye hoye hoye', 'Hindi complete-line context is used before cue remapping');
hindiRoman.Cues.forEach((cue, index) => {
    eq(hindiRoman.Text.slice(cue.Position, cue.EndPosition), hindiRomanWords[index], `Hindi cue ${index + 1} maps to natural Roman word`);
    eq(cue.Start, hindiCues[index].Start, `Hindi cue ${index + 1} keeps exact timestamp`);
});

const mlLine = 'കാറ്റിൻ തൂവൽ പോലെ മെല്ലെ തഴുകാനേ';
const mlWords = ['കാറ്റിൻ', 'തൂവൽ', 'പോലെ', 'മെല്ലെ', 'തഴുകാനേ'];
const mlRomanWords = ['kaattin', 'thooval', 'pole', 'melle', 'thazhukaane'];
searchFrom = 0;
const mlCues = mlWords.map((word, index) => {
    const position = mlLine.indexOf(word, searchFrom);
    searchFrom = position + word.length;
    return { Position: position, EndPosition: position + word.length, Start: 50000000 + index * 900000 };
});
const mlRoman = context.romanizedLyricView({
    Text: mlLine,
    romanizedText: 'THIS PROVIDER FIELD MUST BE IGNORED',
    Cues: mlCues
});
eq(mlRoman.Text, 'kaattin thooval pole melle thazhukaane', 'runtime ignores provider romanizedText and uses in-house engine');
mlRoman.Cues.forEach((cue, index) => {
    eq(mlRoman.Text.slice(cue.Position, cue.EndPosition), mlRomanWords[index], `Malayalam cue ${index + 1} maps to LyricG2P output`);
    eq(cue.Start, mlCues[index].Start, `Malayalam cue ${index + 1} keeps exact timestamp`);
});

const mlVoicingLine = 'കതക് അടച്ചോടി അടുത്തു നീ വാടി';
const mlVoicingWords = ['കതക്', 'അടച്ചോടി', 'അടുത്തു', 'നീ', 'വാടി'];
const mlVoicingRomanWords = ['kathak', 'adachodi', 'aduthu', 'nee', 'vaadi'];
searchFrom = 0;
const mlVoicingCues = mlVoicingWords.map((word, index) => {
    const position = mlVoicingLine.indexOf(word, searchFrom);
    searchFrom = position + word.length;
    return { Position: position, EndPosition: position + word.length, Start: 60000000 + index * 850000 };
});
const mlVoicingRoman = context.romanizedLyricView({ Text: mlVoicingLine, Cues: mlVoicingCues });
eq(mlVoicingRoman.Text, 'kathak adachodi aduthu nee vaadi', 'Malayalam contextual voicing line Romanizes as a complete line');
mlVoicingRoman.Cues.forEach((cue, index) => {
    eq(mlVoicingRoman.Text.slice(cue.Position, cue.EndPosition), mlVoicingRomanWords[index], `Malayalam v5 cue ${index + 1} maps to natural Roman word`);
    eq(cue.Start, mlVoicingCues[index].Start, `Malayalam v5 cue ${index + 1} keeps exact timestamp`);
});

const bg = {
    Text: '[ak:bg]नमस्ते',
    Cues: [{ Position: 7, EndPosition: 13, Start: 20000000 }]
};
const bgRoman = context.romanizedLyricView(bg);
eq(bgRoman.Text, '[ak:bg]namaste', 'background-vocal transport marker survives Romanization');
eq(bgRoman.Cues[0].Position, 7, 'background cue keeps marker offset');
eq(bgRoman.Cues[0].EndPosition, 14, 'background cue end follows converted text length');

for (let i = 0; i < 1825; i += 1) context.romanizeCached(`മലയാളം ${i}`);
eq(context.state.romanizationCache.size, 1800, 'Romanization LRU remains bounded');
context.romanizeCached('മലയാളം 25');
eq(context.state.romanizationCache.size, 1800, 'LRU cache hit does not increase cache size');

ok(mainSource.indexOf('if (stockTvEnvironment.detected)') < mainSource.indexOf('const SONG_PREFERENCES_STORAGE_KEY'), 'Stock TV bypass runs before Romanization runtime initialization');
ok(mainSource.includes("const ROMANIZER_ASSET = 'jellyfin-lyric-romanizer.js'"), 'in-house Romanizer is a lazy sibling asset');
ok(mainSource.includes('ensureRomanizerLoaded().then'), 'native-script lyrics lazy-load the local Romanizer');
ok(mainSource.includes('ROMANIZATION_CACHE_MAX_ENTRIES = 1800'), 'Romanization cache is memory bounded');
ok(mainSource.includes('state.romanizationCache.delete(oldest.value)'), 'Romanization cache uses LRU-style eviction');
ok(mainSource.includes('ROMANIZER_LOAD_TIMEOUT_MS = 8000'), 'lazy local asset load has a bounded timeout');
ok(mainSource.includes('setRomanization: setRomanizationMode'), 'Romanize mode remains available through diagnostics/API');
ok(mainSource.includes("state.romanizationMode === 'romanized'"), 'renderer has Romanized display mode');
ok(mainSource.includes('persistCurrentSongPreference()'), 'Romanization preference persists per song');
ok(mainSource.includes('const displayLyric = displayLyricForCurrentMode(lyric)'), 'Romanization feeds the existing renderer instead of creating a second renderer');
ok(!/BiniLyrics|LyricsPlus|lyrics-api\.binimum|translate\.googleapis|dt=rm|romanizationQuality|romanizationOnline/i.test(mainSource), 'main runtime contains no remote Romanization/provider stack');
ok(!/BiniLyrics|LyricsPlus|lyrics-api\.binimum|translate\.googleapis|dt=rm/i.test(romanizerSource), 'Romanizer contains no network/provider integration');
ok(!/\bfetch\s*\(/.test(romanizerSource), 'Romanizer performs no network fetches');
ok(!fs.existsSync(path.join(root, 'src', 'jellyfin-lyric-romanization-sources.js')), 'remote source adapter asset was deleted');
ok(css.includes('.lyricPage .ak-romanization-toggle'), 'Romanize button remains page-scoped');
ok(!css.includes('.ak-romanization-quality-toggle'), 'Smart/Offline button styling was removed');
ok(!/Smart|Offline/.test(css), 'Romanization source-policy labels are absent from UI CSS');

const installSh = fs.readFileSync(path.join(root, 'scripts', 'install.sh'), 'utf8');
const installPs = fs.readFileSync(path.join(root, 'scripts', 'install.ps1'), 'utf8');
const uninstallSh = fs.readFileSync(path.join(root, 'scripts', 'uninstall.sh'), 'utf8');
const uninstallPs = fs.readFileSync(path.join(root, 'scripts', 'uninstall.ps1'), 'utf8');
for (const [name, value] of Object.entries({ installSh, installPs })) {
    ok(value.includes('jellyfin-lyric-romanizer.js'), `${name} installs local Romanizer`);
    ok(!value.includes('ROMANIZATION_SOURCES_SOURCE') && !value.includes('RomanizationSourcesSource'), `${name} has no remote-source asset variable`);
}
ok(uninstallSh.includes('jellyfin-lyric-romanization-sources.js'), 'shell uninstall cleans legacy tv.11 remote adapter if present');
ok(uninstallPs.includes('jellyfin-lyric-romanization-sources.js'), 'PowerShell uninstall cleans legacy tv.11 remote adapter if present');
ok(!/src=["'][^"']*jellyfin-lyric-romanizer\.js/i.test(installSh), 'shell installer does not inject Romanizer on every page');
ok(!/src=["'][^"']*jellyfin-lyric-romanizer\.js/i.test(installPs), 'Windows installer does not inject Romanizer on every page');

console.log(`Offline LyricG2P Romanization contract: ${assertions} assertions passed.`);
