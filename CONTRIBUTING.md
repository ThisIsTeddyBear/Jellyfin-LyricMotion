# Contributing

Thanks for helping improve Jellyfin LyricMotion.

## Bug reports

Include:

- Jellyfin Server version
- Jellyfin Web version
- OS / container image
- browser/WebView and version
- lyric type (plain LRC, ELRC, converted TTML)
- language/script when the issue involves Romanization or shaping
- private-window reproduction result
- `JellyfinLyricMotion.diagnostics()` where useful

For Romanization defects, a short native-text excerpt plus the actual and expected Romanization is ideal. Do not attach copyrighted commercial audio or full lyric files unless you have permission to redistribute them.

## Pull requests

LyricMotion should remain a Jellyfin Web rendering enhancement. Keep playback ownership inside Jellyfin and keep Romanization fully local/on-device.

Run the complete suite before submitting:

```bash
sh scripts/test-all.sh
```

Important individual contracts include:

```bash
node --check src/jellyfin-lyric-motion.js
node --check src/jellyfin-lyric-romanizer.js
node scripts/test_romanization.js
node scripts/test_indic_polish.js
node scripts/test_offline_romanization.js
node scripts/test_romanization_robustness.js
node scripts/test_timing_controls.js
node scripts/test_stock_tv_bypass.js
node scripts/test_runtime_races.js
node scripts/test_full_experience_audit.js
node scripts/test_overlap_background.js
node scripts/test_script_safety.js
node scripts/test_audit_optimizations.js
python3 scripts/test_ttml_to_elrc.py
sh scripts/test_installers.sh
```

Test normal LRC, enhanced timing, seeking, pause/resume, overlapping lines, background vocals, RTL text, at least one Indic/contextual script, and a space-less timed script such as CJK. The stock-TV bypass contract must pass so detected TV-class clients never initialize LyricMotion.

## Release/version changes

Public releases use Semantic Versioning and a matching Git tag:

```text
VERSION = 3.1.0
tag     = v3.1.0
notes   = docs/RELEASE-NOTES-3.1.0.md
```

The release workflow rejects a tag whose version does not exactly match `VERSION`.
