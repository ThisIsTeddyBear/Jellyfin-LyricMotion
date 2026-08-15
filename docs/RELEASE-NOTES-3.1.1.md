# Jellyfin LyricMotion v3.1.1

v3.1.1 is a feature/stabilization release on top of the 3.1.0 audited baseline. It expands the in-house Romanization architecture and replaces the old timing row with a compact, safer one-tap timing workflow.

## LyricG2P 6.0

- Adds first-class mixed-script/language span segmentation while preserving Latin code-switched text.
- Adds `romanizeDetailed()`, `segmentText()`, `rankCandidates()` and `explain()` diagnostics.
- Adds phoneme-like per-unit diagnostics with source provenance and contextual-voicing flags.
- Adds conservative morphology evidence for Malayalam, Tamil, Telugu, Kannada, Punjabi/Gurmukhi and Devanagari.
- Adds path-aware deterministic confidence and weak-span reporting.
- Preserves all 3.1.0 first-class language rules, offline operation, whole-line conversion and ELRC boundary mapping.
- Does not bundle an unvalidated neural model. The repository includes a reproducible corpus/evaluation pipeline so a future learned component must beat the deterministic engine before shipping.

## Compact timing assistant

- Replaces the always-visible timing buttons with one `⏱` timing chip.
- Adds `0.1s` fine adjustment while preserving `0.5s` coarse adjustment.
- Adds `Sync lyric to now`, using a clicked word cue start when available or the line start otherwise.
- Keeps session `Undo`, `Reset`, and the existing ±15 second safety bounds.
- Persists timing correction against an exact lyric-timeline fingerprint, now including cue `EndPosition` as well as cue position/start/end timing.
- Rejects old unfingerprinted preview timing corrections rather than risking a stale offset on replacement lyrics.
- Fixes symmetric tenth-second rounding for negative offsets, so negative half-step values round as users expect.
- Adds clearer `A` and `⏱` visual symbols, matched button geometry, horizontal two-control layout, active-state styling, and dialog accessibility state.

Three-point calibration and timing-drift correction from an earlier 3.1.1 development build were intentionally removed before release. The final model is a single, predictable constant lyric offset.

## Research tooling

The source repository adds development-only tooling around the maintainer's smart lyrics fetcher to collect provider-supplied Romanization, extract native/Roman pairs, prepare deterministic data splits and evaluate LyricG2P exact accuracy/CER by language.

No provider fetcher is used by the Jellyfin runtime and no fetched lyric dataset is bundled in the release.

## Compatibility

- Romanization remains entirely on-device and offline.
- Stock-TV hard bypass is unchanged.
- Existing 3.1.0 Romanization preferences remain accepted.
- Timing correction restores only when its stored lyric-timeline fingerprint matches the current lyrics.
- The existing manual timing API remains available while obsolete calibration/drift APIs are removed.
