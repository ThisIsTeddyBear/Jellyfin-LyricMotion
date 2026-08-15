# Jellyfin LyricMotion 3.2.0 / LyricG2P 6.5.1 Final Optimization and Hardening Report

Date: 2026-08-15

Application: `3.2.0`

Romanizer: `6.5.1`

This pass freezes the accepted LyricG2P 6.5.1 Romanization behavior and optimizes the implementation around it. The objective is not to create new spellings. It is to make the same accepted engine faster, safer on hostile provider input, easier to validate, and harder to deploy in a mixed/stale state.

## Release decision

The optimized 6.5.1 build is the recommended 3.2.0 release. It preserves every output in the frozen 6.5.1 differential checks used in this pass while materially reducing hot-path work.

The largest improvement came from separating **production Romanization** from **diagnostic provenance construction**. Before this pass, normal `romanize()` reused detailed Indic word routines and therefore paid for source-to-output edit alignment even when ordinary lyric rendering did not consume that alignment. 6.5.1 now keeps exact provenance in `romanizeDetailed()` while using a dedicated fast production path. Exact alignment is still invoked in production when guarded morphology actually needs it.

## Frozen-behavior verification

The optimized engine was compared directly against the pre-optimization 6.5.1 Romanizer copied before code changes.

- 5,000 deterministic random mixed-script strings: identical `romanize()` output.
- The same 5,000 strings: identical `romanizeDetailed().text`.
- Every UTF-16 source boundary for those strings: identical `mapBoundary(..., 'start')` and `mapBoundary(..., 'end')` results.
- Dakshina Tamil held-out lexicon, 2,500 native word types: zero optimized-vs-frozen output differences.
- Dakshina exact-any-human-variant score remains 1,400 / 2,500, exactly matching frozen 6.5.1.
- Existing reviewed LyricG2P suite remains 32 / 32.

The 10,000-string all-boundary differential was intentionally not substituted for weaker checking when it exceeded the execution window. The release keeps the 5,000-string exhaustive-boundary differential plus a separate 10,000-case adversarial invariant fuzz suite.

## Production-path optimization

### 1. Dedicated fast Indic word path

Normal production previously delegated to `*WordDetailed()` helpers for Devanagari, Gurmukhi and configured Indic scripts. Those helpers build exact source-to-output provenance through edit-distance alignment.

6.5.1 now has a production path that performs only the work required to emit the Roman text:

```text
source word
  -> grapheme/token parse
  -> deterministic phonology
  -> schwa/context rules
  -> lyric spelling
  -> lexicon override
  -> morphology probe
  -> exact alignment only if known-stem morphology needs it
```

`romanizeDetailed()` retains the complete provenance/IR pipeline.

This is the dominant runtime optimization in this release.

### 2. Morphology probe split

Production morphology no longer constructs diagnostic suffix Romanizations just to determine whether a known stem exists. A lightweight production hint path identifies candidate stem/suffix boundaries first. Full diagnostic suffix information remains available in detailed mode.

Sorted suffix tables are cached once per language family and frozen against accidental mutation.

### 3. Boundary-cache prewarming

`romanizeDetailed()` already knows the final whole-line output. The boundary cache now accepts that known output rather than forcing the first subsequent boundary query to Romanize the full line again.

### 4. Lower-allocation edit alignment

Exact ASCII/provenance alignment was rewritten from nested JavaScript arrays to a flat `Uint32Array` cost matrix plus compact operation storage. The original diagonal/delete/insert tie-breaking order is retained.

This reduces boxed allocation and improves diagnostic/provenance performance without changing boundary results on ordinary inputs.

### 5. Linear-memory Levenshtein

Candidate-distance scoring now uses two typed rows rather than a full boxed matrix. The output distance is identical while memory scales linearly with the shorter dynamic-programming dimension.

## Pathological-input hardening

Provider lyrics should not be able to cause quadratic memory growth merely by supplying a single enormous malformed token.

6.5.1 therefore adds bounded fallbacks:

- exact ASCII alignment is limited to 1,000,000 DP cells;
- candidate similarity is limited to 1,000,000 DP cells;
- exceptionally long generic/normalization boundary maps use a monotonic proportional fallback beyond the exact source-length threshold;
- candidate ranking records when pathological-distance comparison is skipped rather than pretending an exact similarity score was computed.

The ordinary lyric path remains exact. These fallbacks exist for pathological inputs that are far beyond normal lyric word/line lengths.

## Candidate-ranker fixes

### Duplicate candidate evidence

Previously, two candidates with the same Roman text could collapse to the first occurrence even when the later duplicate carried substantially stronger provider/model metadata.

6.5.1 now performs metadata-aware duplicate selection. The local LyricG2P candidate remains protected when it owns the spelling. For non-local duplicates, the stronger scored evidence is retained.

### Confidence metadata validation

`null`, empty, non-finite and boolean confidence values are no longer coerced into misleading numeric evidence. Valid numeric confidence is clamped to `[0, 1]`.

### Pathological candidate distance

A huge candidate can no longer force unbounded quadratic Levenshtein work. The ranker records `phonological-distance-skipped:pathological-length` when it deliberately omits that evidence.

## Main Jellyfin runtime hardening

### Strict Romanizer compatibility

The application build deliberately remains `3.2.0` while the Romanizer is `6.5.1`. A Jellyfin single-page session could therefore have had a stale `6.5.0` global left in memory even when the loader URL requested 6.5.1.

`getRomanizer()` now validates the exact required LyricG2P version, not merely the presence of compatible-looking functions. The public diagnostics surface reports the required Romanizer version.

A VM browser-runtime smoke test verifies:

- desktop startup;
- rejection of a stale 6.5.0 Romanizer global;
- acceptance of the real 6.5.1 Romanizer;
- duplicate runtime-load protection;
- stock Jellyfin bypass on the TV user-agent path.

### Allocation cleanup

Large fallback mark ranges and Indic virama membership data are now allocated once instead of rebuilding array/range literals during repeated classification calls. Small Hangul membership checks were converted to direct comparisons.

These are secondary optimizations compared with the Romanizer fast-path split, but they remove avoidable runtime allocation.

## TTML converter bug hunt

The converter now rejects a resolved nested timing interval whose end precedes its begin. This prevents malformed provider TTML from silently producing invalid ELRC timing.

A new converter suite covers:

- frames;
- ticks;
- offset clock expressions;
- nested absolute timing;
- auxiliary `x-roman` exclusion;
- `x-bg` background-vocal preservation;
- invalid child timing rejection;
- DTD/entity rejection;
- atomic output preservation after failure.

The tests verify that a failed conversion does not overwrite an existing output file.

## Installer hardening

The POSIX and PowerShell installers now **stage the complete asset set before replacing live Jellyfin Web assets**. Copy/disk failures therefore occur before any live overlay file is replaced.

The POSIX installer is executed in the synthetic release gate. PowerShell is not installed in this Linux validation environment, so its path is syntax/structure audited rather than claimed as executed.

The existing independent G2P cache identity remains in place so a 3.2.0 application upgrade can still force 6.5.1 assets.

## Dataset/research pipeline hardening

The leakage-aware dataset splitter now:

- validates development/test fractions individually;
- rejects a combined fraction of 1.0 or more;
- drops rows without language/native/Roman data rather than creating unusable training records.

The Dakshina importer now:

- NFC-normalizes native and Roman forms;
- safely defaults invalid/nonpositive attestation counts;
- preserves and aggregates multiple references.

Tests exercise connected-component leakage prevention across shared native tokens, lemmas and songs.

## Packaging and release reproducibility

The release packager now:

- rejects accidental `.onnx`, `.pt`, `.pth` and `.bin` payloads;
- emits a SHA-256 sidecar automatically;
- retains sorted/fixed-timestamp deterministic ZIP output.

The release gate packages the tree twice and requires the two archives to be byte-identical.

Static checks additionally reject dynamic-code/unsafe HTML-write constructs in source JS and validate CSS structural balance.

## Performance benchmark

Method: five fresh Node 22.16.0 processes for the frozen pre-optimization 6.5.1 build and five fresh processes for the optimized build. Medians are reported. These are development-container measurements, not browser/TV latency guarantees.

| Workload | Frozen 6.5.1 | Optimized 6.5.1 | Change |
|---|---:|---:|---:|
| Romanizer load | 6.135 ms | 6.158 ms | 0.4% slower, effectively noise |
| Mixed normal `romanize()` | 0.1587 ms | **0.0408 ms** | **74.3% faster** |
| Punjabi normal `romanize()` | 0.0688 ms | **0.0137 ms** | **80.1% faster** |
| Devanagari normal `romanize()` | 0.1045 ms | **0.0151 ms** | **85.6% faster** |
| Mixed `romanizeDetailed()` | 0.6364 ms | **0.4586 ms** | **27.9% faster** |
| Punjabi `romanizeDetailed()` | 0.2871 ms | **0.1935 ms** | **32.6% faster** |
| Hybrid `rankCandidates()` | 0.6974 ms | **0.5515 ms** | **20.9% faster** |

Machine-readable runs are stored in `research/lyricg2p651-optimization-benchmark.json`.

The checked-in standard benchmark, run after the optimization, reports approximately 0.046 ms/op for its mixed normal hot path, 0.021 ms/op Punjabi and 0.016 ms/op Devanagari on this container. The difference between benchmark harnesses is expected; the fresh-process comparison above is the valid before/after measurement because both builds use the same harness.

## Final test gate

After all source changes:

- 32 reviewed Romanization regressions: PASS
- 500 base Unicode fuzz cases: PASS
- focused 6.5.1 hybrid/model/ranker/provenance suite: PASS
- 3,000 default expanded fuzz cases: PASS
- 10,000 extended Unicode/provenance fuzz cases: PASS
- 5,000 frozen-vs-optimized exhaustive boundary differential strings: PASS
- 2,500 held-out Dakshina Tamil outputs: zero differences vs frozen 6.5.1
- runtime browser smoke: PASS
- TTML converter tests: 5 / 5 PASS
- research pipeline tests: 3 / 3 PASS
- static source/CSS tests: 3 / 3 PASS
- synthetic POSIX install/uninstall: PASS
- deterministic double-package comparison: PASS
- archive corruption/hygiene checks: PASS

The complete full-project gate finished in approximately 12.9 seconds in the final working tree. The separate 10,000-case hybrid fuzz run finished in approximately 6.7 seconds. These wall times are environment-specific and are included only as reproducibility notes.

## What remains intentionally unchanged

This optimization pass does not change the public Romanization style or claim new language accuracy. It does not bundle a full neural transliteration checkpoint. It does not move the targeted Hindi/Punjabi schwa advisors onto the playback hot path.

The remaining high-value work is predominantly data and real-client measurement:

1. larger independent song-domain gold corpora;
2. actual Jellyfin browser/Android TV/Fire TV profiling;
3. proper-name and loanword evidence;
4. model-candidate experiments that beat the hybrid baseline on held-out songs;
5. continued fuzzing of provider-specific malformed TTML/Unicode.

## Final assessment

The most important result of this pass is that 6.5.1 is now faster **because less unnecessary work is performed**, not because linguistic checks were disabled. Production and diagnostics have different computational needs, and the code now reflects that distinction.

The optimized build retains full detailed provenance when requested, retains guarded morphology when it matters, retains the learned advisors in diagnostics/hybrid research, and substantially reduces normal lyric-rendering cost. It also closes deployment, TTML, candidate-metadata and pathological-input failure modes discovered outside the Romanizer itself.
