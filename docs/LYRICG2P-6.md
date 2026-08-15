# LyricG2P 6 architecture

Release: `3.1.1`  
Romanizer: `6.0.0`

LyricG2P 6 keeps Romanization completely offline and extends the 5.x word-oriented engine with explicit mixed-script segmentation, structured context, phoneme-like diagnostic units, morphology evidence, confidence scoring and source-to-output provenance.

## Goals

The engine targets readable song-style Romanization rather than academic transliteration. It must also preserve Jellyfin's original karaoke timestamps and source-coordinate semantics.

The production pipeline is:

```text
complete lyric line
    -> Unicode normalization
    -> script/language span segmentation
    -> dedicated script parser
    -> language phonology
    -> lyric pronunciation lexicon
    -> lyric-style Latin spelling
    -> source-to-Roman boundary mapping
```

The detailed diagnostic pipeline adds:

```text
span context
    + morphology hints
    + phoneme-like units
    + confidence/path classification
    + weak-span detection
```

## Mixed-script segmentation

`segmentText()` classifies consecutive spans into first-class language/script families while preserving Latin text. This allows lines such as:

```text
നീ എന്റെ baby ആണ്
दिल मेरा crazy है
என் love நீதான்
```

to keep the Latin words unchanged while the native-script spans use their own language engines.

`romanizeDetailed()` reports the languages seen, whether the line is code-switched, neighboring language context for each span, output positions and confidence.

## Phoneme-like intermediate diagnostics

The runtime still uses compact script-specific tokenizers for speed. LyricG2P 6 now exposes a normalized diagnostic representation derived from those tokens:

```text
source range
kind
onset
nucleus
nasal
Roman chunk
implicit/explicit vowel state
dead consonant state
cluster/gemination flags
contextual voicing flag
```

This is deliberately a phoneme-like representation rather than full IPA. It separates pronunciation decisions from the final Roman spelling while remaining small enough for a browser-side lyrics plugin.

For example, Malayalam contextual voicing can be diagnosed as a change in the onset rather than as a hard-coded word replacement.

## Morphology evidence

LyricG2P 6 recognizes a conservative set of common suffix families for Malayalam, Tamil, Telugu, Kannada, Punjabi/Gurmukhi and Devanagari. The current release uses this information for confidence, diagnostics and future candidate generation. It does not aggressively splice stems and suffixes into the displayed result because that can create incorrect sandhi or voicing at the boundary.

When a suffix is recognized, diagnostics include:

```text
role
suffix
stem
whether the stem exists in the curated pronunciation lexicon
stem Romanization when known
standalone suffix Romanization
```

This gives future rules and learned ranking a structured signal without making v3.1.1 less predictable.

## Candidate ranking and confidence

The public Romanizer API now exposes:

```javascript
JellyfinLyricRomanizer.romanizeDetailed(text)
JellyfinLyricRomanizer.segmentText(text)
JellyfinLyricRomanizer.rankCandidates(text, candidates)
JellyfinLyricRomanizer.explain(text)
```

The ranker is deterministic and local. It penalizes candidates that retain native script, wildly alter punctuation or have implausible length, and strongly rewards the known local G2P result when its dedicated path has high confidence.

Confidence is intentionally path-aware:

```text
preserved Latin/common text       highest confidence
curated lyric pronunciation       very high confidence
dedicated Indic phonology         high confidence
Urdu/Shahmukhi fallback           moderate confidence
generic Brahmic/Unicode fallback  lower confidence
unresolved native script          weak
```

Confidence is not presented as a statistical probability. It is a deterministic engineering signal used to identify weak areas for corpus review.

## Karaoke provenance

All production Romanization still happens on the whole lyric line. ELRC timing is preserved through `mapBoundary()`.

LyricG2P 6 adds explicit diagnostic provenance for every span and phoneme-like unit, but it does not rewrite Jellyfin cue times. Source starts/ends remain the authority.

The boundary cache introduced in 3.1.0 remains bounded to 256 lines, and the main Romanization result cache remains bounded to 1,800 entries.

## Language focus

The deepest first-class paths remain:

- Malayalam
- Tamil
- Telugu
- Kannada
- Punjabi/Gurmukhi
- Hindi/Devanagari-family lyrics

Bengali/Assamese, Gujarati and Odia remain first-class configured Indic paths. Urdu/Shahmukhi remains lexicon-assisted because ordinary Perso-Arabic writing can omit short vowels.

## Learned-model policy

LyricG2P 6 does **not** bundle an unvalidated neural model.

The project now contains a corpus pipeline specifically so a learned ranker can be evaluated honestly before it is shipped. A model is eligible for runtime inclusion only if it improves held-out song-style Romanization while meeting all of these constraints:

1. fully offline at inference time;
2. compact enough for Jellyfin Web clients;
3. acceptable CPU and memory behavior on mobile;
4. no regression in deterministic fallback behavior;
5. measurable improvement over the rule/lexicon engine on held-out data;
6. source-to-Roman timing provenance remains available;
7. redistribution license is compatible with the project.

A future model can be loaded lazily and use WASM as the compatibility baseline with optional WebGPU acceleration, but v3.1.1 intentionally does not add ONNX Runtime or model weights just to claim that a model exists.

## Research references

The training/evaluation design is informed by:

- Google Research Dakshina: human-attested word Romanizations and manually Romanized sentence data for South Asian languages. Dataset license: CC BY-SA 4.0.
- AI4Bharat Aksharantar: 26 million transliteration pairs across 21 Indic languages with a 103k-pair evaluation set.
- AI4Bharat IndicXlit: an approximately 11M-parameter multilingual transliteration model for native-to-Roman and Roman-to-native conversion.
- ONNX Runtime Web: browser-side WASM and optional WebGPU inference options if a future learned model passes the project benchmark gate.

See `docs/ROMANIZATION-RESEARCH.md` for the local corpus workflow.
