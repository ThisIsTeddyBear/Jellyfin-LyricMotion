# Changelog

All notable public changes are documented here. The project follows Semantic Versioning.

## [3.2.0] - 2026-08-15

### Final optimization and hardening

#### Added
- Dedicated fast production Romanization path that avoids detailed provenance/edit alignment during normal playback unless guarded morphology actually requires it.
- Browser-runtime smoke coverage for stale Romanizer rejection, duplicate-load protection, normal desktop startup and stock-TV bypass.
- TTML converter tests for frame/tick/offset timing, nested timing, background vocals, auxiliary Romanization exclusion, DTD/entity rejection and atomic output preservation.
- Research-pipeline tests for leakage-connected dataset splitting, input validation and Dakshina normalization/attestation aggregation.
- Deterministic double-package verification, checksum generation and static JS/CSS safety gates.

#### Fixed
- Duplicate candidate spellings discarding stronger later model/provider metadata.
- Invalid/non-finite/boolean candidate confidence metadata being coerced into misleading numeric evidence.
- Pathological single-token inputs being able to force unbounded quadratic edit-distance memory.
- Stale in-memory LyricG2P 6.5.0 globals being accepted by a 3.2.0 runtime that requires LyricG2P 6.5.1.
- Nested TTML intervals resolving to an end before their begin.
- Installer live assets being replaced before the complete new overlay asset set had been staged successfully.
- Dataset preparation accepting invalid dev/test fractions or unusable rows without required language/native/Roman fields.

#### Performance
- Replaced boxed 2D provenance alignment matrices with flat typed storage while preserving tie-breaking and cue boundaries.
- Replaced candidate Levenshtein full matrices with linear-memory typed rows.
- Cached production morphology suffix tables and avoided diagnostic suffix construction on the hot path.
- In controlled five-process Node measurements, mixed normal `romanize()` improved from 0.1587 ms/op to 0.0408 ms/op, Punjabi from 0.0688 to 0.0137, and Devanagari from 0.1045 to 0.0151. Detailed and candidate-ranking paths also improved.

### LyricG2P 6.5.1 merge

#### Added
- Two compact sparse Hindi/Punjabi schwa classifiers as lazy diagnostic/candidate advisors, with model provenance metadata and no network runtime.
- Malayalam display-vs-phonetic IR for contextual realizations without forcing phonetic spelling into the player.
- Stronger phrase-level Hindi/Marathi/Bhojpuri/Nepali shared-script context while preserving ambiguity on weak isolated tokens.
- Category-aware candidate ranking that protects curated/morphology-assisted local knowledge and gives learned/provider alternatives more authority only when local evidence is weak.
- G2P-specific version file and cache-busting identity while the Jellyfin LyricMotion application remains 3.2.0.
- Focused 6.5.1 hybrid/ranker/model/provenance tests plus an expanded deterministic Unicode fuzz gate.

#### Fixed
- Punjabi learned-weight cache assignment from the alternate implementation.
- Metadata-bearing candidate objects being stringified to `[object Object]` in the alternate ranking path.
- Cross-script ZWJ/ZWNJ ranges being claimed by the wrong script-specific cue mapper.
- Consecutive joiner chains switching cue-mapping strategies and causing a backward boundary.
- Context-sensitive generic prefix/suffix mapping producing non-monotonic cue positions on malformed text.
- NFC-normalized Romanization losing a safe mapping back to original UTF-16 cue coordinates.
- Malformed overlapping token provenance escaping its owning displayed span.
- Overlapping malformed token spans moving detailed word start/end boundaries away from real output endpoints.

#### Changed
- Learned schwa inference is now off the normal `romanize()` playback path and available through detailed diagnostics/candidate research, preserving near-deterministic hot-path performance.
- Candidate ranker is `hybrid-category-aware-style-context-confidence-v3`.
- Romanizer version is `6.5.1`; app version remains `3.2.0`.

### Original 3.2.0 / LyricG2P 6.5 foundation

- Named ASCII song-style Romanization contract.
- Shared-script language evidence, structured phonological IR, production known-stem morphology and transform-carried provenance.
- Malayalam legacy chillu correction.
- Conservative n-best style variants, origin/risk evidence and privacy-safe case export.
- Dakshina import, leakage-resistant splitting, exact/CER/top-3/style evaluation, calibration and runtime benchmarking tools.
- Research-only tiny character Transformer harness; no full transliteration checkpoint bundled.

## [3.1.1] - 2026-08-15

### Added

- **LyricG2P 6.0** mixed-script/code-switch segmentation with structured span context and source/output provenance.
- Phoneme-like diagnostic units, conservative morphology evidence, deterministic confidence, weak-span reporting, candidate ranking and local `explain()` diagnostics.
- Compact timing assistant with 0.1 s fine adjustment, 0.5 s coarse adjustment, one-tap word/line synchronization, session undo and reset.
- Exact lyric-timeline fingerprinting for timing persistence, including cue character end positions.
- Research-only corpus tooling around the maintainer-supplied smart lyrics fetcher, including native/Roman pair extraction, deterministic dataset splitting and exact/CER evaluation.

### Changed

- The normal lyrics toolbar is now a compact two-control row: an `A` Romanization control and a `⏱` timing control.
- Timing correction is deliberately constant-offset only; the development-only three-point calibration/drift feature was removed with its runtime, state, persistence, CSS, API and test surface.
- Timing corrections without an exact lyric fingerprint are ignored rather than applied to a potentially different lyric timeline.
- Romanization diagnostics explicitly identify code switching, path confidence and lower-confidence fallback spans without changing production Romanization output.
- Learned-model inclusion remains benchmark-gated. v3.1.1 does not ship unvalidated neural weights or add a network/model-download dependency.

### Fixed

- Negative tenth-second timing values now round symmetrically with positive values.
- Timing popover `aria-expanded` state is refreshed after the popover closes.
- Timeline fingerprints now include cue `EndPosition`, reducing false matches between structurally different word/syllable timelines.
- Romanization and timing buttons now expose clearer state-aware accessible labels and consistent active styling.

### Compatibility

- All v3.1.0 first-class language rules, Classic Bloom behavior, stock-TV hard bypass, request-race fixes, lazy fallback/boundary caches and installer hardening remain active.
- Existing Romanization preferences continue to restore. Legacy timing data without a timeline fingerprint falls back safely to source timing.

## [3.1.0] - 2026-08-15

### Added

- Fully offline **LyricG2P 5.1** Romanization with whole-line context and source-to-Roman ELRC boundary remapping.
- First-class lyric-aware Romanization for Malayalam, Tamil, Telugu, Kannada, Punjabi/Gurmukhi, Hindi/Devanagari-family languages, Bengali/Assamese, Gujarati and Odia, plus conservative Urdu/Shahmukhi handling and broad Unicode fallback.
- Per-song **Romanize / Romanized** preference and per-song lyric timing correction in 0.5-second steps.
- Multilingual Classic Bloom parity for shaping-safe Indic grapheme/akshara clusters.
- Stock-TV hard bypass: detected TV-class clients exit before LyricMotion runtime hooks initialize and use Jellyfin's native lyrics implementation.
- Dedicated regression suites for Romanization quality, Indic edge cases, cue-boundary mapping, timing controls, TV bypass, request races, full-experience behavior, optimization contracts and installer/uninstaller behavior.

### Changed

- Romanization is entirely on-device; the experimental Smart/provider/Google source stack from development previews is not part of the release.
- The lyrics tools UI is intentionally limited to Romanization and timing offset; there is no source/provider selector.
- The 60,513-entry ICU-derived broad Unicode fallback is packed and materialized lazily.
- Repeated source-to-Roman cue mappings use a bounded line cache.
- Multilingual geometry is measured after lyric DOM decoration and shared cue-prefix measurements are reused.
- Installers update overlay assets before committing `index.html`; normal uninstall removes LyricMotion-owned backups unless explicitly told to keep them.

### Fixed

- Malayalam contextual `ട -> d` cases exposed by real-song testing, including `ഇടിമിന്നലാടി ... പേടി`, `അടച്ചോടി ... വാടി`, and `... ഉടക്കി`, plus conservative short-u/chandrakkala handling.
- Tamil geminate/readability and modern loan-letter edge cases; Telugu/Kannada nasal handling; Punjabi/Gurmukhi `ੜ`, nukta `ਸ਼`, glide/schwa and common lyric-form edge cases.
- Jellyfin lyric interception is restricted to recognized lyric endpoint shapes and GET reads; write/delete requests no longer affect the live lyric model.
- Same-song refresh, late-response and A -> B -> A request races.
- Active-line ordering/out-of-range presentation handling and several hot-loop allocations.
- NFC normalization cases where normalized UTF-16 length differs from Jellyfin's original source coordinate system.
- Partial Romanization results that still contain recognized native script are no longer reported as successful conversion.
- TTML malformed/non-finite/negative timing, DTD/entity input, oversized input and endpoint-clamping cases.
- Docker reinjection with mixed quote styles.
- Windows PowerShell 5.1 installation failure `The path is not of a legal form.` caused by passing a null backup path to `System.IO.File.Replace`.

### Performance

- Lazy packed fallback avoids constructing the large broad-Unicode map on ordinary first-class Indian-script paths.
- Cached boundary maps eliminate repeated prefix/suffix Romanization during karaoke cue remapping.
- Active-line scratch storage and deferred geometry work reduce avoidable render/startup allocation and layout churn.

## [3.0.1] - 2026-08-13

### Fixed

- Windows install and uninstall launchers request Administrator access through UAC before modifying Jellyfin Web under `Program Files`.
- Elevated launchers wait for completion, preserve the elevated process exit code, and show a readable error instead of closing immediately.

### Documentation

- Clarified why desktop, mobile, and TV deliberately use different motion tiers.
- Clarified why connected scripts use atomic paint and restrained whole-word glow instead of Latin-style spatial/per-glyph animation.

## [3.0.0] - 2026-08-13

### Added

- Independent active-set rendering for genuinely overlapping lyric lines.
- Background-vocal transport and presentation for converted TTML `x-bg` spans.
- Recursive `scripts/ttml_to_elrc.py` converter with clock, offset, frame, and tick timing support.
- Classic Bloom v3.1 dual-stage core/halo glow with 24 shuffled color themes.
- Adaptive, once-per-song album atmosphere.
- Runtime diagnostics for overlap, background vocals, glow, atmosphere, performance and script handling.
- Deterministic release packaging, validation workflow and tag-driven GitHub release workflow.

### Changed

- Canonical public console API is `JellyfinLyricMotion`; `AppleKaraoke` remains a compatibility alias.
- Canonical runtime assets are `jellyfin-lyric-motion.js` and `jellyfin-lyric-motion.css`.
- Renderer work scales with currently active lines rather than the full lyric document.
- Installer backups use collision-safe names.

### Fixed

- New lyric lines no longer cut off an older line that is still singing.
- Same-start lead and background lines share timing correctly.
- Projected playback time remains monotonic during ordinary forward playback.
- Connected-script conjuncts avoid clipping/white-fragment failures.
- Final glyphs and overhanging ink are protected from paint-box trimming.

## [2.0.0] - 2026-08-12

Initial public repository baseline:

- Geometry-aware lyric swipe.
- Normal LRC fallback.
- Enhanced word/syllable cue rendering.
- Initial script-safe motion and accent glow.
- Windows, Linux and Docker installation paths.
