# Changelog

All notable public changes are documented here. The project follows Semantic Versioning.

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
