# Changelog

All notable changes are documented here. The project follows Semantic Versioning.

## [3.0.0] - 2026-08-13

### Added

- Independent active-set rendering for genuinely overlapping lyric lines.
- Background-vocal transport and presentation for converted TTML `x-bg` spans.
- Recursive `scripts/ttml_to_elrc.py` converter with clock, offset, frame, and tick timing support.
- Classic Bloom v3.1 dual-stage core/halo glow with 24 shuffled color themes.
- Adaptive, once-per-song album atmosphere with mobile/TV/eco raster limits.
- TV host-focus activation state machine with a 90 ms visual arm and bounded timing catch-up.
- Script profiles and atomic paint for Devanagari, Gurmukhi, Malayalam, Arabic, and joining scripts.
- End-glyph and Indic ink overscan.
- Runtime diagnostics for overlap, background vocals, TV activation, glow, atmosphere, performance, and script handling.
- Deterministic release packager, validation workflow, and tag-driven GitHub release workflow.
- Feature gallery and dedicated TTML/TV documentation.

### Changed

- Canonical public console API is now `JellyfinLyricMotion`; `AppleKaraoke` remains a compatibility alias.
- Canonical runtime assets are `jellyfin-lyric-motion.js` and `jellyfin-lyric-motion.css`.
- TV and eco line motion is opacity-only; whole-word glow layers are prepainted.
- Renderer work scales with currently active lines rather than the full lyric document.
- Automatic accent selection now uses a non-repeating shuffle bag instead of permanent song hashing.
- Installer backups now use collision-safe names.

### Fixed

- New lyric lines no longer cut off an older line that is still singing.
- Same-start lead and background lines share the TV presentation clock.
- Jellyfin TV focus casing no longer appears on enhanced lyric buttons.
- TV wipes no longer run ahead of Jellyfin's current-line focus transition.
- 120 Hz TV `requestAnimationFrame` sources are gated to the selected target cadence.
- Projected playback time remains monotonic during ordinary forward playback.
- Devanagari, Gurmukhi, and Malayalam conjuncts no longer receive spatial wipe seams or white fragments.
- Final glyphs and overhanging ink are no longer trimmed by the background-clip paint box.
- Completed spatial words switch to solid text, reducing paint work and protecting their final edge.

## [2.0.0] - 2026-08-12

Initial public repository baseline.

- Geometry-aware lyric swipe.
- Normal LRC fallback.
- Enhanced word/syllable cue rendering.
- Initial script-safe motion and accent glow.
- Windows, Linux, and Docker installation paths.
