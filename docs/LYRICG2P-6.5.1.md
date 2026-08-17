# LyricG2P 6.5.1 Architecture

Jellyfin LyricMotion: `3.2.4`

Romanizer: `6.5.1`

Runtime: local/offline, lazy-loaded on desktop/mobile

## Purpose

LyricG2P 6.5.1 is the merged maintenance release of the in-house lyric-specific Romanization engine. It combines the safer production architecture of the 3.2.0/6.5.0 branch with the useful linguistic experiments from the alternate 6.5 implementation, then gates each imported feature behind regression, Unicode, provenance and performance tests.

The result is deliberately hybrid. The engine does not hand every word to a single learned model. Different evidence sources are authoritative for different problem classes.

## Runtime pipeline

```text
complete lyric line
        ↓
NFC normalization for pronunciation output
        ↓
source-coordinate-preserving script/span analysis
        ↓
shared-script language evidence
        ↓
dedicated grapheme / akshara parsing
        ↓
phonological IR
        ↓
deterministic language phonology
        ↓
curated lyric lexicon + guarded morphology
        ↓
ASCII song-style display spelling
        ↓
category-aware candidate ranking when alternatives exist
        ↓
monotonic source→Roman cue boundary mapping
```

Development diagnostics additionally run the compact learned schwa advisors where applicable.

## Best-of-both merge decisions

| Category | 6.5.1 choice | Reason |
|---|---|---|
| Release/version/cache architecture | 3.2.0 base | Correct app/G2P version separation and browser cache control |
| Malayalam legacy chillu handling | 3.2.0 base | Correct `ന്‍/ന്‌/ണ്‍` behavior and joiner-aware segmentation |
| Source provenance and cue mapping | 3.2.0 base, hardened further | Better transform-carried ranges and monotonic karaoke contract |
| Production morphology | 3.2.0 base | Protects known stems while deriving the tail from the complete word |
| Candidate object/ranking plumbing | 3.2.0 base, redesigned | Avoids alternate build's object-stringification failure and supports metadata |
| Hindi/Punjabi schwa learning | alternate 6.5 coefficients, policy changed | Useful narrow learned evidence, moved off the playback hot path |
| Malayalam phonetic/display separation | alternate concept | Richer phonetic IR without making displayed lyrics mechanical |
| Shared Devanagari phrase inference | alternate concept, conservative ambiguity retained | Better Nepali/Bhojpuri/Marathi phrase context while avoiding false certainty |
| Punjabi tone | existing 3.2.0 implementation retained | Re-audit showed it was already functional; no reason to replace working logic |
| Romanization style contract | combined | Human-readable policy plus machine-readable `lyricmotion-song-ascii-1` |
| Full sequence model | not shipped | No independent song-domain evidence yet justifies the dependency |

## Targeted learned schwa advisors

6.5.1 bundles two fixed sparse logistic coefficient tables:

- `hi-schwa-logreg`, 487 nonzero feature weights;
- `pa-schwa-logreg`, 194 nonzero feature weights.

They predict whether an orthographic inherent schwa should be kept or deleted from local grapheme/context features. The runtime records probability plus `keep`, `delete` or `uncertain` advice.

The models are intentionally **lazy advisors**:

```text
romanize()          -> deterministic production only
romanizeDetailed()  -> deterministic output + learned schwa evidence
hybrid ranking      -> can consume learned/provider candidates
```

This policy was selected after local profiling showed that running the learned inference in every Punjabi production word substantially increased hot-path time while not changing the tested accepted outputs under conservative thresholds.

The coefficient metadata includes recorded held-out accuracy values from the source implementation. 6.5.1 marks these as `embedded-build-metadata-not-independently-reproduced-in-this-release`; they are not whole-word Romanization accuracy claims.

`learnedTransliterationModelBundled` remains `false`.

## Phonological IR

Dedicated Indic tokens can expose:

- source start/end;
- output start/end;
- display onset;
- phonetic onset;
- vowel quality/length;
- consonant place/manner/voicing/aspiration;
- cluster/gemination state;
- contextual nasal realization;
- deterministic schwa decision;
- learned schwa advice/probability where eligible;
- Punjabi tone evidence;
- named rules;
- provenance mode.

Malayalam now makes the display/phonetic distinction explicit. A conservative display spelling can coexist with a more realistic contextual phonetic onset in diagnostics.

## Shared-script language evidence

Devanagari remains a shared script. 6.5.1 uses lexical markers, suffix/pattern evidence and neighboring decisive spans to distinguish Hindi, Marathi, Bhojpuri and Nepali when evidence is strong.

Examples exercised by the regression suite:

```text
तिमीलाई माया गर्छ  -> Nepali context
हमार दिल बा         -> Bhojpuri context
माझं प्रेम आहे       -> Marathi context
दिल में प्रेम है      -> Hindi context
प्रेम                -> remains hi-mr-bho-ne when isolated
```

The key rule is that phrase context may resolve ambiguity, but weak evidence does not become fake certainty.

## Category-aware hybrid candidate ranking

6.5.1 classifies the local result before comparing alternatives:

- `curated-lexicon`
- `morphology-assisted`
- `deterministic-phonology`
- `origin-sensitive`
- `shared-script-ambiguous`
- `weak-or-fallback`
- `preserved-or-common`

The local authority bonus depends on that category. Candidate metadata can include:

```js
{
  text: 'adrak',
  source: 'learned-model',
  confidence: 0.97,
  language: 'hi'
}
```

The ranker then evaluates language context, candidate source, confidence, ASCII style, native residue, punctuation/Latin preservation and agreement with local phonology.

Expected policy behavior:

```text
प्यार
local curated: pyaar
learned:        pyar @ .999
winner:         pyaar

ਪਿਆਰਾਂ
local morphology: pyaaran
learned:          piaaran @ .999
winner:           pyaaran

अदरक
local ambiguous: adarak
learned:         adrak @ .97
winner:          adrak
```

This is the central "best candidate for the category" rule of 6.5.1.

## Unicode and karaoke-boundary hardening

The bug hunt found two deeper boundary classes beyond the original 6.5.0 legacy-chillu fix.

### Cross-script joiner capture

Script-specific word-range detection could accidentally claim a bare ZWJ/ZWNJ because Devanagari/Gurmukhi predicates intentionally treat joiners as word characters. 6.5.1 requires a real script anchor inside the candidate range before using a script-specific boundary map.

### Consecutive joiners and malformed combining sequences

Independently Romanized prefixes/suffixes can shrink when context changes, producing a backward cue boundary. 6.5.1 now:

- maps normalization-unstable original coordinates into NFC coordinates first;
- uses script-aware maps where possible;
- monotonizes the generic fallback across the whole source string;
- clamps malformed transform provenance to the owning span;
- reasserts word boundary endpoints after overlapping token interpolation.

These changes are about timing safety, not pretending malformed strings have a linguistically meaningful pronunciation.

## Performance policy

The player uses `romanize()`, not `romanizeDetailed()`.

The learned advisors and expanded diagnostics are therefore off the rendering hot path. A local Node 22 cross-build benchmark recorded the 6.5.1 normal Punjabi path close to the previous deterministic 6.5.0 base and substantially faster than the alternate build that evaluated learned schwa on the normal path. The exact machine-readable development measurements are in:

- `research/lyricg2p651-benchmark-node.json`
- `research/lyricg2p651-cross-build-benchmark.json`

Those values are not browser, Android TV or WebView guarantees.

## Confidence semantics

LyricG2P confidence remains an **evidence score, not a probability**. The checked-in calibration utility measures how evidence bands correspond to held-out correctness without silently relabeling them as calibrated probabilities.

## Research/model ship gate

A full native-to-Roman model is still not shipped. It must demonstrate, on licensed and leakage-resistant held-out data:

1. better song-domain exact/CER/style performance than the deterministic/hybrid baseline;
2. no unacceptable regression in the primary languages;
3. bounded model/package size;
4. acceptable browser/mobile latency and memory;
5. fully local operation;
6. karaoke-safe monotonic alignment/provenance;
7. license compatibility.

The repository keeps corpus import/evaluation and tiny-model research tooling so that decision can be made from measurements rather than model fashion.

## Public development surface

The Romanizer exposes:

```text
romanize()
romanizeDetailed()
segmentText()
detectLanguages()
phonologicalIR()
romanizationVariants()
rankCandidates()
selectCandidate()
exportRomanizationCase()
mapBoundary()
explain()
```

`JellyfinLyricMotion` exposes the corresponding development helpers and reports both the app version and LyricG2P version.

## Release invariants

- Jellyfin LyricMotion 3.2.4 retains LyricG2P `6.5.1` unchanged.
- LyricG2P is `6.5.1`.
- The Romanizer asset is cache-busted with `?v=6.5.1`.
- The 3.2.x main-script injection also carries `&g2p=6.5.1`, preserving an independent Romanizer cache identity across application releases.
- Runtime Romanization is offline.
- No full neural transliteration checkpoint is bundled.
- TV-class clients retain the stock bypass and do not load LyricMotion Romanization.
