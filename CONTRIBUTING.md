# Contributing

Thanks for helping improve Jellyfin LyricMotion.

## Bug reports

Include:

- Jellyfin Server version
- Jellyfin Web version
- OS / container image
- browser/version
- lyric type
- language/script
- private-window reproduction result
- `JellyfinLyricMotion.diagnostics()` where useful

Do not attach copyrighted commercial audio or full lyric files unless you have permission to redistribute them.

## Pull requests

LyricMotion should remain a rendering enhancement. Keep playback ownership inside Jellyfin.

Before submitting:

```bash
node --check src/jellyfin-lyric-motion.js
node scripts/test_overlap_background.js
node scripts/test_tv_overlap.js
node scripts/test_script_safety.js
node scripts/test_release_contract.js
python -m unittest discover -s scripts -p "test_*.py"
```

Test normal LRC, enhanced timing, seeking, pause/resume, overlapping lines,
background vocals, Latin text, and at least one joining script. TV changes must
also cover the delayed host-focus path documented in `docs/TV-VALIDATION.md`.

Release packages are generated, not edited by hand:

```bash
python scripts/package_release.py --version "$(cat VERSION)"
```
