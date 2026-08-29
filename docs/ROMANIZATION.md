# Offline LyricG2P Romanization

Release: `3.2.5`
Romanizer: `6.6.0`

## Goal

LyricMotion Romanization is now a completely local/on-device feature. It does not query BiniLyrics, LyricsPlus/KPoe, Google Translate, or any other network service. The old tv.11 remote source adapter was removed from the package and installers.

The target is not academic one-codepoint transliteration. The target is readable, familiar **song-style Roman spelling**: the sort of Latin spelling listeners actually expect beside Hindi, Punjabi, Malayalam, Tamil, Telugu, Kannada and other Indian-language lyrics.

The renderer keeps Jellyfin as the timing authority. Romanization changes display text and cue character positions only; cue timestamps never change.

## Why LyricG2P is not a simple Unicode transliterator

A literal script conversion frequently produces the wrong thing for lyrics. Important examples include:

- Hindi/modern Indo-Aryan inherent-vowel deletion (`करता -> karta`, not `karata`).
- nasalization and place-sensitive nasals (`बैंड -> band`, not `baimda`).
- Tamil context-sensitive voicing where one letter can be heard differently depending on position.
- Malayalam chillus, conjuncts, doubled consonants and conventional song spellings.
- Dravidian long vowels (`aa`, `ee`, `oo`) where retaining length materially improves familiar Roman spelling.
- Gurmukhi addak and nasal signs.
- Perso-Arabic Urdu/Shahmukhi omitting many short vowels entirely, which makes perfect pronunciation recovery impossible from spelling alone.

For that reason LyricG2P is a hybrid **grapheme-to-pronunciation + Roman spelling engine**, not a character lookup table.

## Research direction

The design was informed by publicly documented Indian-language transliteration work rather than by the removed online service stack:

- **Aksharantar / IndicXlit** demonstrates that high-quality Indic transliteration benefits from language-aware learned context across a large multilingual transliteration corpus rather than isolated character substitution.
- **Dakshina** is particularly relevant to the product goal because it contains attested Romanization lexicons and full-sentence native/Latin parallel data for major South Asian languages.
- Published Hindi/Punjabi G2P work identifies schwa deletion as a central pronunciation problem that naive Devanagari transliterators get wrong.

No Aksharantar, IndicXlit or Dakshina model weights/datasets are bundled in this build. LyricG2P keeps deterministic production output with mixed-script segmentation, phoneme-like diagnostics, morphology evidence, confidence and candidate ranking. Any future learned model would require independent evidence of improvement and acceptable browser cost. See [LyricG2P 6.6.0](LYRICG2P-6.6.0.md).


## LyricG2P 6.6 scripted-English recovery

Lyric providers sometimes encode **English pronunciation in an Indic script** instead of supplying the original English spelling. A plain transliterator cannot recover that spelling because the source is phonetic, not graphemic. For example:

```text
ऑल द अनजाना से येह येह येह
-> All the anajaana say yeh yeh yeh

आई मेट अ बॉय एंड हिस नेम इस अनजाना
-> I met a boy and his name is anajaana
```

6.6 adds a conservative contextual recovery stage after the normal script-specific G2P pass. It compares the baseline Roman pronunciation with a compact offline English pronunciation-signature index, requires multiple nearby English anchors, protects known native lyric words, and only permits ambiguous native-looking forms such as `आई`, `इस`, and `से` to switch when an English run has already been established.

This is deliberately **not** a global spell-corrector. Native lines such as `मैं तेरे प्यार में`, `दिल से`, and `हम तुम` retain the existing Indic Romanization. The same recovery architecture is enabled for the first-class vowel-bearing Indic handlers (Devanagari, Gurmukhi, Bengali/Assamese, Gujarati, Odia, Tamil, Telugu, Kannada and Malayalam), while Perso-Arabic Urdu/Shahmukhi remains excluded because omitted short vowels make this kind of reconstruction substantially more ambiguous.

Recovered words carry explicit `scripted-english-recovery` provenance in `romanizeDetailed()` / `detectLanguages()`. Source-to-Roman boundary maps are recomposed through the English spelling transform so ELRC cue timing remains monotonic and attached to the original source characters.

## LyricG2P 6.6 native loanword pronunciation

6.6 also addresses a different failure mode from scripted English: common Devanagari lyric spellings that omit nukta marks. Plain `फ` remains `ph` by default, but a curated high-confidence loanword lexicon restores established `/f/` pronunciations where spelling alone is misleading. This fixes `हमसफर -> humsafar`, `सफर -> safar`, `वफा -> wafa`, `फिक्र -> fikr`, and related common forms while explicitly preserving native controls such as `फूल -> phool`, `फिर -> phir`, and `फल -> phal`.

The correction is lexical rather than a global character rewrite, because `फ` genuinely represents both situations in real lyric data. Exact corrected words retain source-to-Roman boundary maps and expose `curated-loanword-pronunciation` provenance through detailed diagnostics.

## v3.2.5 / LyricG2P 6.5.1 implementation

LyricG2P 6.5 makes several pieces that were diagnostic scaffolding in 6.0 materially useful to production: conservative shared-script language evidence, structured phonological tokens, known-stem morphology, transform-carried provenance, n-best style variants and a richer candidate ranker. It also fixes legacy Malayalam chillu sequences whose joiners were previously discarded before final-short-u handling.

The public confidence field remains an engineering evidence score, not a calibrated probability.

No learned model or training pipeline is bundled. See [LyricG2P 6.5.1](LYRICG2P-6.5.1.md).

### Historical 6.0 foundation

## v3.1.1 / LyricG2P 6 implementation

LyricG2P 6.0 preserves the final pre-release language output rules but changes how broad fallback and cue alignment are stored/executed. The 60,513-entry ICU-derived fallback is packaged as compact tab/newline data and converted to a lookup object only when a script outside the dedicated handlers actually needs it. Common emoji/variation-selector ranges known not to have fallback entries bypass that materialization entirely.

Source-to-Roman boundary mapping now keeps a bounded 256-line cache containing the complete Romanized result, prefix lengths and detailed word maps. This is especially important for ELRC, where many cue boundaries in one line otherwise caused the same prefixes/suffixes to be repeatedly Romanized. The cache is bounded independently of the main 1,800-entry display Romanization cache.

The boundary mapper also detects when NFC normalization changes UTF-16 length. Linguistic conversion still uses NFC, but cue indexes from Jellyfin are mapped in the original source coordinate system so decomposed vowel signs cannot shift karaoke boundaries.

## Runtime architecture

```text
native Jellyfin lyric line
        |
        v
mixed-script span segmentation
        |
        +--> preserve Latin/code-switched spans
        |
        +--> first-class Indian LyricG2P engine
        |      - whole-word parsing
        |      - conjunct/virama clusters
        |      - vowel length policy
        |      - contextual nasal handling
        |      - language-specific pronunciation rules
        |      - compact high-confidence lyric lexicon
        |      - structured context/confidence diagnostics
        |      - phoneme-like source provenance
        |
        +--> dedicated non-Indic handlers where available
        |      - Japanese kana
        |      - Korean Hangul
        |      - Chinese/Han mapping
        |
        +--> ICU-derived broad Unicode fallback
        |
        v
complete Romanized line
        |
        v
source-character -> Roman-character boundary mapping
        |
        v
existing Jellyfin ELRC cue timestamps, unchanged
```

## First-class Indian coverage

### Malayalam

The Malayalam path understands independent vowels, vowel signs, chillus, conjuncts, doubled consonants, nasal marks and common pronunciation conventions. The engine contains a compact exception/pronunciation lexicon for high-confidence song words while unseen words still use the general parser.

Examples that motivated the Malayalam handling include a systematic song-orthography case where singleton medial `ട` becomes `d` in the high-confidence vocalic environment where listeners expect it, while word-initial and geminated `ട` remain `t/tt`. Word-final chandrakkala also receives a conservative short-u pass for native endings, without blindly appending `u` to every modern loanword.

Representative examples include:

```text
ഇടിമിന്നലാടി നിനക്കെന്താ പേടി
-> idiminnalaadi ninakkenthaa pedi

കതക് അടച്ചോടി അടുത്തു നീ വാടി
-> kathak adachodi aduthu nee vaadi

കാർ - കൂന്തലു കണ്ടപ്പോൾ കണ്ണൊന്ന് ഉടക്കി
-> kaar - koonthalu kandappol kannonnu udakki

ഇത് / അത് / എന്ത് / ആണ്
-> ithu / athu / enthu / aanu
```

Additional Malayalam examples:

```text
കാറ്റിൻ തൂവൽ പോലെ മെല്ലെ തഴുകാനേ
-> kaattin thooval pole melle thazhukaane

മോഹം പൂത്തെൻ നെഞ്ചിനുള്ളിൽ മഴ പോലെ
-> moham poothen nenjinullil mazha pole

അവളുടെ കരിമഷി മിഴി ഉണ്ടല്ലോ
-> avalude karimashi mizhi undallo

മിഴികളിൽ നിറയുന്ന മൊഴിയുണ്ടല്ലോ
-> mizhikalil nirayunna mozhiyundallo

മറുപടി പറയുവാൻ മടിയുണ്ടല്ലോ
-> marupadi parayuvaan madiyundallo

നിന്റെ നുണക്കുഴി കണ്ടപ്പോ
-> ninte nunakkuzhi kandappo

അടിവയറ്റിൽ മഞ്ഞുള്ള രാത്രി
-> adivayattil manjulla raathri
```

### Hindi / Devanagari-family lyrics

The Devanagari path keeps the previous Hindi regression fixes and expands schwa handling and common lyric pronunciation. It is also useful for Marathi, Bhojpuri and Nepali text, with a small Marathi pronunciation layer.

```text
मुंडा सदा डोली चढ़ गया -> munda sada doli chad gaya
बैंड बज गया ओए होए होए -> band baj gaya oye hoye hoye
मुझे तुमसे प्यार है -> mujhe tumse pyaar hai
मिलकर चलते हैं -> milkar chalte hain
```

The implementation does not blindly remove every inherent vowel. It uses token context and high-confidence cadence rules so words such as `कमल -> kamal` are not destroyed by over-aggressive deletion.

### Punjabi / Gurmukhi

Gurmukhi has dedicated handling for addak/gemination, vowel signs, bindi/tippi and common Punjabi lyric forms.

```text
ਪੰਜਾਬੀ ਮੁੰਡਾ ਸਾਡਾ -> panjabi munda saada
ਛੱਡ ਕੇ ਸਾਰੀਆਂ ਕੁਆਰੀਆਂ -> chhad ke saariyan kuwaariyan
ਅੱਖੀਆਂ ਵਿਚ ਤੂੰ -> akhiyan vich tu
ਰੱਬ ਜਾਣੇ -> rabb jaane
ਕੁੜੀ / ਚੜ੍ਹਦਾ / ਖੁਸ਼ -> kudi / chadhda / khush
ਗਿਆ / ਕਿਉਂ / ਨੱਚਣਾ -> gaya / kyun / nachna
```

### Tamil

Tamil uses contextual consonant voicing and a lyric-style vowel policy rather than treating every consonant as a fixed Latin letter.

```text
வணக்கம் காதலே -> vanakkam kaadhale
என் மனதில் ஒரு கனவு -> en manadhil oru kanavu
மழையில் நனைந்தேன் -> mazhaiyil nanaindhen
சின்ன சின்ன ஆசை -> chinna chinna aasai
பட்டு / கத்தி / பச்சை -> pattu / kathi / pachai
சொல்லு / ஃபோன் -> sollu / fon
```

### Telugu

Telugu preserves vowel length and common conjuncts/word forms:

```text
తెలుగు పాట -> telugu paata
నిన్ను ప్రేమిస్తున్నాను -> ninnu premistunnaanu
నా హృదయంలో ప్రేమ ఉంది -> naa hrudayamlo prema undi
సంవత్సరం / సంసారం -> samvatsaram / samsaaram
```

### Kannada

```text
ಕನ್ನಡ ಹಾಡು -> kannada haadu
ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ -> ninnannu preetisuttene
ನನ್ನ ಮನಸು ನಿನ್ನದು -> nanna manasu ninnadu
ಸಂವಾದ / ಸಂಸ್ಕಾರ -> samvaada / samskaara
```

### Bengali / Assamese, Gujarati and Odia

These scripts now use first-class configurable word parsers rather than relying primarily on the broad character fallback.

Examples:

```text
সংগীত আমার জীবন -> sangeet amar jibon
অসমীয়া গান -> asomiya gan
મારી આંખોમાં તું છે -> mari aankhoma tu chhe
પ્રેમ એક સફર છે -> prem ek safar chhe
ଓଡ଼ିଆ ଗୀତ -> odia geet
```

### Urdu / Shahmukhi

Urdu/Shahmukhi is fundamentally harder offline because ordinary Perso-Arabic spelling omits many short vowels. LyricG2P therefore uses a high-frequency Hindustani/Punjabi song lexicon first, then a conservative consonant/diacritic parser for unknown words.

```text
دل میں محبت ہے -> dil mein mohabbat hai
میں تم سے پیار کرتا ہوں -> mein tum se pyaar karta hoon
زندگی ایک سفر ہے -> zindagi ek safar hai
```

Unknown unvowelled Urdu words can still be imperfect. The engine intentionally does not invent confidence it does not have.

## Whole-line context and karaoke timing

The most important architectural rule retained from the reference work is: **do not Romanize karaoke fragments independently**.

For a timed line, LyricMotion Romanizes the complete native line once. It then asks LyricG2P to map each original source-character cue boundary into the completed Roman line. This preserves neighboring consonants, conjuncts, schwa decisions and word-level exceptions.

For example, a provider may split `बैंड` into timed source spans. LyricG2P still computes `band` as a word, then maps the original boundary so the visual cues can become `ban | d`. The cue `Start` values remain untouched.

The same mechanism is used for Malayalam and the other first-class Indic engines.

## Cache and performance

Romanized strings are held in an LRU-style cache capped at **1,800 entries**. Hits refresh recency; long playback sessions evict old lines rather than clearing the entire cache.

The Romanizer is a lazy sibling asset. It is loaded only when a native-script lyric candidate needs it. Stock TV clients hard-exit before this runtime is initialized.

The runtime is designed to preserve deterministic, bounded handling across its supported Indic and Urdu/Shahmukhi scripts.

## UI

There is no source-policy UI. The lyrics page exposes only:

1. an icon-only **Romanization** toggle using the speech glyph
2. the compact **lyrics timing** chip

There is no Smart/Offline button, provider selector or hidden online Romanization mode.

## Privacy / networking

Romanization performs **zero third-party network requests**. Native lyric text, song metadata and Romanized text remain inside the Jellyfin page. The deleted tv.11 remote adapter is not installed by shell, PowerShell or Docker packaging.

The uninstaller still removes the old `jellyfin-lyric-romanization-sources.js` filename if it finds one, solely to clean upgrades from tv.11.

## Known limits

- A compact deterministic browser engine cannot claim the same published benchmark accuracy as a trained multilingual transformer unless it is evaluated on the same benchmark. This build makes no such claim.
- Song Romanization itself is not standardized: `aa` vs `a`, `dh` vs `d`, and similar spellings can all be reasonable depending on convention.
- Urdu/Shahmukhi short vowels cannot always be inferred from unvowelled text without a much larger pronunciation lexicon or a learned language model.
- The broad ICU-derived fallback is coverage insurance, not the pronunciation-quality target for first-class Indian languages.
