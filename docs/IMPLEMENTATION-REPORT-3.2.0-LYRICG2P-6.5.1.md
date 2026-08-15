# Implementation Report: Jellyfin LyricMotion 3.2.0 / LyricG2P 6.5.1

Date: 2026-08-15

## Executive result

LyricG2P 6.5.1 is a merged, bug-hardened release built from two independent 6.5 implementations:

1. the prior Jellyfin LyricMotion 3.2.0 / LyricG2P 6.5.0 release; and
2. the alternate Jellyfin LyricMotion 3.1.1 / LyricG2P 6.5.0 implementation supplied for comparison.

The merge was not performed as a union of all features. Each category was selected according to production correctness, timing provenance, regression behavior, model value and runtime cost.

The final product version remains **3.2.0** as requested. The Romanizer version is **6.5.1**.

## Selection matrix

| Engineering/linguistic category | Selected basis | 6.5.1 treatment |
|---|---|---|
| App/runtime integration | 3.2.0 base | Retained and version-separated from G2P |
| Malayalam legacy chillus | 3.2.0 base | Retained `n`, not alternate `nu` regression |
| ZWJ/ZWNJ span handling | 3.2.0 base | Retained, then hardened further |
| Production morphology | 3.2.0 base | Retained for lexical-stem protection |
| Punjabi tone | 3.2.0 base | Retained after re-audit confirmed it is functional |
| Candidate metadata support | 3.2.0 base | Retained and redesigned into category-aware ranker |
| Hindi schwa learning | alternate | Coefficients imported, converted to lazy advisory role |
| Punjabi schwa learning | alternate | Coefficients imported, cache bug fixed, converted to lazy advisory role |
| Malayalam phonetic/display distinction | alternate concept | Integrated into phonological IR |
| Devanagari phrase language context | alternate concept | Integrated with conservative isolated ambiguity |
| Release/test/research infrastructure | 3.2.0 base | Retained and expanded |
| Full sequence transliteration model | neither | Not shipped without independent song-domain evidence |

## Why the model strategy changed

The alternate build ran compact learned schwa inference as part of ordinary Hindi/Punjabi processing. The models are attractive because schwa keep/delete is a narrow ambiguity where a classifier can add useful evidence.

However, local testing showed an important product tradeoff:

- under the conservative thresholds, sampled accepted production outputs did not change relative to the deterministic path;
- Punjabi normal-path runtime became materially more expensive when learned inference ran for every eligible word;
- the model coefficients are useful evidence, but their recorded training/held-out pipeline is not completely reproduced in the supplied artifact.

6.5.1 therefore uses the classifiers as **lazy advisors**:

```text
normal player rendering
    -> deterministic LyricG2P hot path

development diagnostics / candidate research
    -> deterministic output + learned schwa probability/advice
```

This is the best current performance/correctness tradeoff for LyricMotion. It preserves the learned information without making unproven model decisions the universal authority.

### Embedded learned components

| ID | Language | Type | Nonzero weights | Role |
|---|---|---|---:|---|
| `hi-schwa-logreg` | Hindi | sparse logistic schwa keep/delete | 487 | lazy advisor |
| `pa-schwa-logreg` | Punjabi | sparse logistic schwa keep/delete | 194 | lazy advisor |

The coefficient metadata carries recorded held-out accuracy values from the source implementation. 6.5.1 exports the explicit status `embedded-build-metadata-not-independently-reproduced-in-this-release`. Those values are **not** reported as independently reproduced whole-word Romanization accuracy.

`learnedTransliterationModelBundled` remains `false`.

## Category-aware candidate selection

A major 6.5.1 change is that alternatives are no longer treated as if every source word has the same local authority.

The local result is categorized as:

- curated lexicon;
- morphology-assisted;
- deterministic phonology;
- origin-sensitive;
- shared-script ambiguous;
- weak/fallback;
- preserved/common.

The ranker then combines category authority with:

- candidate source;
- optional candidate confidence;
- language compatibility;
- ASCII song-style compliance;
- academic-diacritic penalty;
- native-script residue;
- punctuation/source-Latin preservation;
- phonological similarity to the deterministic result.

### Expected examples

**Curated lexical authority**

```text
native:   प्यार
local:    pyaar
candidate pyar, learned-model, confidence .999
selected: pyaar
```

**Morphology authority**

```text
native:   ਪਿਆਰਾਂ
local:    pyaaran
candidate piaaran, learned-model, confidence .999
selected: pyaaran
```

**Ambiguous local result**

```text
native:   अदरक
local:    adarak
candidate adrak, learned-model, confidence .97
selected: adrak
```

This policy implements the requested "best candidate for the category" behavior rather than globally preferring either rules or models.

## Linguistic improvements

### Malayalam

6.5.1 keeps the production fixes from the base and imports the stronger phonetic/display distinction from the alternate implementation.

The player can display a conservative song spelling while diagnostics carry contextual phonetic voicing. For example, the regression path for `അകലം` keeps display `akalam` while exposing a phonetic form `agalam` in the detailed span.

Legacy chillu correctness remains protected:

```text
ന്‍ -> n
ന്‌ -> n
ണ്‍ -> n
```

### Shared Devanagari language inference

The engine now uses stronger phrase-level context for Hindi/Marathi/Bhojpuri/Nepali while preserving uncertainty for isolated forms.

Regression expectations include:

```text
तिमीलाई माया गर्छ -> Nepali evidence across the phrase
हमार दिल बा        -> Bhojpuri evidence across the phrase
माझं प्रेम आहे      -> Marathi evidence across the phrase
दिल में प्रेम है     -> Hindi evidence across the phrase
प्रेम               -> unresolved hi-mr-bho-ne family
```

### Punjabi

The existing functional tone evidence is retained. Learned schwa advice is available in detailed diagnostics. Production morphology remains authoritative for known-stem forms such as `ਪਿਆਰਾਂ`.

## Bugs found and fixed during the 6.5.1 merge

### 1. Alternate Punjabi learned-weight cache bug

The alternate unpacker checked a Punjabi cache but did not assign the unpacked Punjabi table back to that cache. This could repeatedly parse the packed coefficient text.

**Fix:** Punjabi weights are now cached exactly like Hindi weights. Packed-table integrity tests confirm 194 unique Punjabi rows and 487 unique Hindi rows.

### 2. Candidate object converted to `[object Object]`

The alternate ranking path stringified a metadata-bearing candidate too early. A candidate such as `{text, confidence, language, source}` could become literal `[object Object]`.

**Fix:** 6.5.1 normalizes candidate objects without discarding metadata and tests malformed/object inputs explicitly.

### 3. Learned inference on the normal Punjabi hot path

The alternate model evaluation cost was paid for ordinary production words even when the conservative learned thresholds did not alter tested accepted outputs.

**Fix:** learned classifiers are lazy advisors. Normal playback remains deterministic; detailed diagnostics run the learned evidence.

### 4. Engine-only stale-cache risk at app version 3.2.0

Because the requested application version remains `3.2.0`, simply changing the Romanizer could allow a browser to reuse the previous 3.2.0 main runtime and therefore the previous Romanizer URL.

**Fix:** installers inject:

```text
jellyfin-lyric-motion.js?v=3.2.0&g2p=6.5.1
```

and the runtime lazy-loads:

```text
jellyfin-lyric-romanizer.js?v=6.5.1
```

The G2P patch therefore has its own cache identity while the app build remains 3.2.0. The POSIX installer, PowerShell installer and Docker image path all consume `LYRICG2P_VERSION`; the Docker injection was specifically corrected during the final packaging audit so it cannot lag behind the normal installers.

### 5. Cross-script ZWJ/ZWNJ boundary capture

Devanagari/Gurmukhi word predicates intentionally accept joiners. A malformed joiner in another script could therefore be mistaken for a one-character Devanagari/Gurmukhi range and cause a wrong source→Roman boundary.

A concrete fuzz reproduction was:

```text
പ‍അആന
```

The old mapping could move from output boundary `2` backward to `1`.

**Fix:** a script-specific boundary range must contain a real code-point anchor from that script, not only a joiner.

### 6. Consecutive joiner boundary retreat

A run containing consecutive ZWJ/ZWNJ characters could switch between generic and configured-script mapping strategies at adjacent boundaries. One bias could therefore retreat.

**Fix:** configured Indic boundary detection scans through a local joiner chain to the nearest real script anchors and refuses conflicting-script guesses.

### 7. Generic prefix/suffix boundary non-monotonicity

Context-sensitive Romanization means that independently Romanizing every prefix or suffix is not guaranteed to produce monotonically increasing lengths on malformed combining-mark text.

**Fix:** the generic fallback now precomputes the entire boundary array and monotonizes it before returning any cue position.

### 8. NFC source-coordinate mismatch

Romanization normalizes to NFC, while Jellyfin cue offsets refer to the original UTF-16 source string.

**Fix:** normalization-unstable strings get explicit original→NFC start/end boundary maps, then use the normal script-aware mapper in normalized coordinates.

### 9. Transform provenance outside owning span

Malformed leading addak/mark sequences can cause an internal dedicated-word transform to disagree with the top-level production segmentation. Diagnostic token ranges could then exceed the owning displayed span.

**Fix:** transform-carried token provenance is clamped to the owning span and marked with `provenanceAdjusted` / `*-clamped` mode when correction is required.

### 10. Word endpoint interpolation corruption

Overlapping malformed token spans could rewrite boundary `0` or the terminal word boundary during interpolation.

**Fix:** word boundary endpoints are reasserted after token interpolation before monotonicization.

## Regression and fuzz validation

### Standard regression suite

`tests/lyricg2p65.test.js`:

- 32 explicit language/architecture regressions;
- 500 deterministic Unicode fuzz strings.

Status: **PASS**.

### 6.5.1 focused hybrid suite

`tests/lyricg2p651-hybrid.test.js` covers:

- version/model-policy metadata;
- Hindi/Punjabi learned advisor availability;
- production versus detailed text equality;
- Malayalam display/phonetic separation;
- Nepali/Bhojpuri/Marathi/Hindi phrase evidence;
- isolated Devanagari ambiguity;
- category-aware candidate ranking;
- curated/morphology authority;
- metadata candidate handling;
- NFC/NFD nukta equivalence;
- Malayalam legacy chillus;
- source/output span and token provenance;
- determinism;
- malformed candidates;
- start and end cue-boundary monotonicity.

Default fuzz count: **3,000**.

Status: **PASS**.

### Extended adversarial fuzz

The same focused test was rerun with:

```text
LYRICG2P_FUZZ_ROUNDS=10000
```

Status: **PASS** after the boundary defects above were fixed.

The exact cases that exposed the defects were added to the permanent focused regression set so future random seeds are not required to reproduce them.

## Regression-seed evaluation

The checked-in 28-row reviewed seed currently reports:

- exact: 28/28;
- top-3: 28/28;
- style-normalized: 28/28;
- CER: 0 on this seed.

This is a **regression smoke corpus**, not an independent language-accuracy benchmark. It must not be interpreted as 100% real-world accuracy.

Machine-readable result: `research/lyricg2p651-regression-report.json`.

## Differential production audit

A source-key audit extracted **1,498 non-ASCII mapping/lexical keys** from both supplied 6.5 source trees and compared their normal `romanize()` output.

Result:

- merged 6.5.1 vs previous 3.2.0/6.5.0 base: **0 production-output changes** across the 1,498 extracted keys;
- merged 6.5.1 vs alternate 6.5: **4 changes**, corresponding to the house long-vowel policy for base `ई`, `ऊ`, `ਈ`, `ਊ` mappings.

This supports the release strategy: the imported learned/context/IR improvements add diagnostics and candidate capability without silently destabilizing the accepted deterministic output baseline.

Machine-readable result: `research/lyricg2p651-differential-audit.json`.

## Final optimization and hardening addendum

A final code-wide optimization/hardening pass was completed after the original 6.5.1 merge. It preserves the frozen Romanization behavior while introducing a dedicated production Indic path, lower-allocation provenance alignment, bounded pathological-input fallbacks, stricter Romanizer version compatibility, candidate-metadata fixes, TTML timing validation, staged installers, research-pipeline validation and deterministic package gates.

The authoritative optimization details and fresh-process before/after measurements are in `docs/OPTIMIZATION-HARDENING-3.2.0-LYRICG2P-6.5.1.md`. The earlier performance numbers below describe the pre-optimization merged implementation and are retained as historical measurements.

## Performance measurements

These numbers are local Node 22.16.0 development measurements, not browser/mobile guarantees.

### 6.5.1 median benchmark

`research/lyricg2p651-benchmark-node.json` recorded approximately:

| Path | Median ms / operation |
|---|---:|
| Mixed normal `romanize()` | 0.199 |
| Punjabi normal `romanize()` | 0.163 |
| Devanagari normal `romanize()` | 0.114 |
| Mixed `romanizeDetailed()` | 0.859 |
| Punjabi detailed + schwa advisor | 0.740 |
| Hybrid candidate ranking | 0.259 |

### Cross-build benchmark

On the same local harness:

| Path | Base 6.5.0 | Alternate 6.5 | Merged 6.5.1 |
|---|---:|---:|---:|
| Mixed normal | 0.194 ms | 0.228 ms | 0.201 ms |
| Punjabi normal | 0.153 ms | 0.414 ms | 0.161 ms |
| Devanagari normal | 0.104 ms | 0.154 ms | 0.111 ms |
| Mixed detailed | 0.633 ms | 0.520 ms | 0.823 ms |
| Punjabi detailed | 0.438 ms | 0.924 ms | 0.703 ms |

The relevant product result is the normal playback path. The merged Punjabi hot path is about 5% slower than the previous base in this run but about **2.56× faster than the alternate build**, while retaining the alternate model as detailed advisory evidence. Detailed diagnostics are intentionally heavier because they now include the learned advisors and expanded provenance/IR.

Machine-readable comparison: `research/lyricg2p651-cross-build-benchmark.json`.

## Confidence/calibration smoke result

The regression seed remains too small and too curated to fit probability calibration. The engine therefore keeps the semantic label:

```text
evidence-score-not-probability
```

The 28-row smoke calibration report records an expected calibration error against that seed for inspection only. No confidence constants were tuned to force the smoke set to look calibrated.

Machine-readable result: `research/lyricg2p651-confidence-smoke.json`.

## Release/API changes

### Version identity

```text
VERSION             = 3.2.0
LYRICG2P_VERSION     = 6.5.1
Romanizer.version    = 6.5.1
```

### Candidate policy metadata

```text
candidateRanker:
  hybrid-category-aware-style-context-confidence-v3

candidateSelectionPolicy:
  category-aware-authority+language+confidence+style+phonological-agreement

learnedComponentPolicy:
  lazy-advisor-only-on-diagnostics-and-candidate-research;
  deterministic-production-hot-path
```

### Learned model flags

```text
learnedModelBundled: false
learnedTransliterationModelBundled: false
learnedComponentsBundled: true
```

The first two flags retain the existing meaning of "no full learned transliteration model/checkpoint". `learnedComponentsBundled` reports the two targeted sparse schwa advisors.

## What is deliberately not claimed

6.5.1 does **not** claim:

- 100% accuracy for any supported language;
- independent reproduction of the embedded schwa-model held-out metrics;
- that the learned schwa classifiers improve whole-word lyric accuracy on an independent song corpus;
- that the Node benchmark predicts Android TV, mobile WebView or browser latency;
- that provider Romanization is automatically correct;
- that a full neural sequence model is inferior in principle.

Those questions require a larger independent song-domain benchmark with leakage control.

## Remaining research priorities

1. Build a larger human-reviewed song corpus with artist/song isolation.
2. Import licensed Dakshina/Aksharantar evaluation data through the checked-in adapters.
3. Evaluate the schwa advisors as actual candidate generators on held-out Hindi/Punjabi lyrics before allowing them to alter production.
4. Expand first-class name/loanword classification.
5. Continue Malayalam/Tamil phonetic-display research without destabilizing familiar lyric spelling.
6. Measure the final release in actual desktop/mobile browser and Jellyfin WebView environments.
7. Test a small full sequence candidate only if it can preserve monotonic provenance and beat the hybrid baseline at acceptable package/runtime cost.

## Final release assessment

LyricG2P 6.5.1 is intentionally more conservative than the alternate build in normal playback and more capable than the previous base in diagnostics/hybrid selection. The release gains targeted learning, better phrase context and richer phonetic IR while retaining the production outputs, morphology, Unicode correctness and release engineering that already tested better.

The most important 6.5.1 improvement is therefore not one additional mapping. It is a clearer authority model:

```text
use the strongest evidence for the category,
protect high-confidence deterministic knowledge,
allow learned candidates to win where local evidence is weak,
and never trade karaoke boundary safety for a prettier prediction.
```
