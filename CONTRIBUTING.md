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
```

Test normal LRC, enhanced timing, seeking, pause/resume, line handoff, Latin text and at least one complex script.
