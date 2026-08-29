# LyricG2P 6.6.0 Architecture

Release host: Jellyfin LyricMotion 3.2.5/3.2.6 development line  
Romanizer: `6.6.0`

## Purpose

LyricG2P 6.6.0 adds **scripted-English recovery**: English words that lyric providers have written phonetically in an Indic script can be reconstructed as normal English spelling without turning ordinary native-language lyrics into English lookalikes. It also strengthens native Devanagari pronunciation for common Perso-Arabic/Urdu loanwords whose nukta marks are frequently omitted by lyric providers, plus lexicalized compounds such as `हमसफर -> humsafar`.

The existing 6.5.1 phonology, morphology, schwa handling, native lyric lexicons, provenance, confidence scoring, candidate ranking and lazy ICU fallback remain in place. The 6.6 pronunciation layers sit on top of the script-specific G2P result while preserving source-to-output boundary provenance.

## Pipeline

```text
native lyric line
  -> script segmentation
  -> existing Indic G2P baseline
  -> compact English pronunciation-signature lookup
  -> multi-anchor contextual span detection
  -> native-word protection / ambiguity policy
  -> local English candidate disambiguation
  -> source-to-output boundary recomposition
  -> final Romanized lyric line
```

## Why context is required

Many forms are genuinely ambiguous. `आई` is normal Hindi for *aayi* in one context and a phonetic spelling of English *I* in another; `से` is normal Hindi *se* but can represent English *say*. Therefore a single-word lookup would be unsafe.

6.6 requires at least two nearby independent English anchors before a run becomes eligible. Curated native lexicon hits are strong guards and do not act as English anchors. A deliberately small context-convertible set covers forms whose interpretation can safely change only inside an already-established English run.

Examples:

```text
ऑल द अनजाना से येह येह येह
-> All the anajaana se yeh yeh yeh

आई मेट अ बॉय एंड हिस नेम इस अनजाना
-> I met a boy and his name is anajaana

आई लव यू
-> I love you

व्हाट इस योर नेम
-> What is your name
```

Native controls remain unchanged:

```text
मैं तेरे प्यार में -> main tere pyaar mein
दिल से -> dil se
हम तुम -> hum tum
```

## Native loanword pronunciation recovery

Devanagari `फ` normally represents an aspirated native consonant and therefore maps to `ph`. In common Urdu/Perso-Arabic loanwords, however, lyric providers often omit the nukta from `फ़ /f/`. A global `फ -> f` rule would be wrong because it would damage native forms such as `फूल -> phool`, `फिर -> phir`, `फल -> phal` and `फिसल -> phisal`.

6.6 therefore uses a conservative curated pronunciation layer for high-frequency lyric forms and their nukta/no-nukta spellings. Examples include:

```text
हमसफर / हमसफ़र -> humsafar
सफर / सफ़र       -> safar
मुसाफिर           -> musaafir
वफा / वफ़ा        -> wafa
बेवफा             -> bewafa
फिक्र              -> fikr
फुर्सत             -> fursat
तूफान              -> toofaan
```

The lexicon is applied before productive morphology and is reported with `curated-loanword-pronunciation` provenance. These entries are also treated as strong native evidence by scripted-English recovery, preventing a loanword correction from accidentally becoming an English anchor.

## English candidate evidence

The browser bundle contains a compact pronunciation-signature index for a hand-curated common-English and song vocabulary. Its phone signatures are derived from CMU Pronouncing Dictionary pronunciations and normalized toward the kinds of Latin phonetic forms emitted by the Indic G2P layer. The full CMU dictionary is not bundled.

Common ambiguity is resolved with lightweight local syntax evidence rather than a network language model. For example, an Indic spelling that produces `end` can resolve to **and** in `boy and his`, while `the end` remains **The end**.

## Script coverage

The contextual recovery layer is enabled for the first-class vowel-bearing Indic handlers:

- Devanagari
- Gurmukhi
- Bengali/Assamese
- Gujarati
- Odia
- Tamil
- Telugu
- Kannada
- Malayalam

Urdu/Shahmukhi is intentionally excluded from this stage because the script frequently omits short vowels, making English reconstruction much less constrained. Existing Urdu/Shahmukhi Romanization continues unchanged.

## Karaoke boundary safety

English recovery can change output length (`नेम -> name`, `द -> the`). 6.6 therefore composes the existing native source-to-baseline maps with an ASCII edit alignment from the baseline pronunciation to the recovered English spelling. The result is clamped and monotonized before `mapBoundary()` exposes it to ELRC cue placement.

If a future transform violates the exact span-assembly invariant, the mapper fails safely to a monotonic proportional map instead of returning misleading cue offsets.

## Diagnostics

`detectLanguages()` and `romanizeDetailed()` report recovered tokens as English with `scriptedEnglish` evidence and the path `scripted-english-recovery`. The public helper `scriptedEnglishRecovery(text)` exposes the recovered text plus recognition/replacement decisions for debugging.

## Offline/privacy behavior

Everything remains local. There are no provider lookups, translation APIs, model downloads, remote dictionaries or network inference calls.
