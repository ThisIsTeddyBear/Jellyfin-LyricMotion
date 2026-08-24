# Contributing

Thanks for helping improve Jellyfin LyricMotion.

## Bug reports

Include the Jellyfin Server and Web versions, operating system or container image, browser/version, lyric type, language/script, private-window reproduction result, and `JellyfinLyricMotion.diagnostics()` when useful.

Do not attach copyrighted commercial audio or full lyric files unless you have permission to redistribute them.

## Pull requests

LyricMotion should remain a rendering enhancement. Keep playback ownership inside Jellyfin.

## Release packaging

Release archives are generated from strict platform allowlists and must never be edited by hand.

Build all local release assets with:

```bash
python3 scripts/package_release.py \
  --version "$(cat VERSION)" \
  --platform all \
  --output-dir dist
```

The detailed tagging procedure is documented in [Releasing Jellyfin LyricMotion](docs/RELEASING.md).
