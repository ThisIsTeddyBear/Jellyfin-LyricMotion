# Jellyfin LyricMotion v3.0.0

This is the first feature-complete major release of the new rendering engine.

## Highlights

- Multiple lyric lines can sing at the same time without cutting each other off.
- TTML background vocals such as `ttm:role="x-bg"` can be preserved as independently timed ELRC response lanes.
- Classic Bloom v3.1 restores the polished earlier glow model with a crisp core, delayed dual-color halo, luminance control, and 24 shuffled themes.
- LG/webOS presentation is synchronized with Jellyfin's focused/current lyric before the wipe starts.
- Hindi, Punjabi, Malayalam, Arabic, and other connected scripts use complete shaped-word paint instead of a clip edge through joined glyphs.
- Adaptive Album Atmosphere is rendered once per song rather than as a live playback blur.

## TV and mobile performance

The TV path uses prepainted whole-word glow, opacity-only line transitions, a real frame-rate gate, and a monotonic media projection. The Android/mobile path targets 30 fps and limits detailed motion while preserving timing and glow hierarchy. Only the currently active set receives per-frame word updates.

## TTML conversion

Run:

```bash
python scripts/ttml_to_elrc.py "/path/to/Song.ttml"
```

The converter recursively retains nested timed main text and `x-bg` text. Keep the original TTML as the lossless master because ELRC has no standard vocal-role field.

## Upgrade

1. Extract `jellyfin-lyric-motion-v3.0.0.zip`.
2. Run the appropriate installer from the extracted directory.
3. Fully close and reopen TV/mobile clients or hard-refresh the browser.
4. Refresh affected Jellyfin library items after replacing sidecar lyric files.

The installer removes loader tags from older `apple-karaoke` and `jellyfin-lyric-motion` builds before injecting v3.0.0.

## Validation

- JavaScript syntax and CSS contracts.
- 19 overlap/background runtime assertions.
- 20 TV activation/overlap assertions.
- 100,000 randomized active-set comparisons during development.
- TTML converter unit tests.
- PowerShell/POSIX installer parsing.
- Install, immediate reinstall, and uninstall simulation.
- Deterministic ZIP extraction and per-file hash comparison.

Actual rendering can still vary with Jellyfin Web version, LG firmware, browser engine, installed fonts, and sidecar timing quality. Please include `JellyfinLyricMotion.diagnostics()` with device-specific reports.

## Compatibility

- Targeted Jellyfin Web line: 10.11.x.
- Desktop browsers: enhanced renderer.
- Android/mobile browsers and web clients: adaptive mobile profile.
- LG webOS/TV layouts: dedicated focus-synchronized profile.

This project is unofficial and is not affiliated with the Jellyfin Project or Apple Inc.
