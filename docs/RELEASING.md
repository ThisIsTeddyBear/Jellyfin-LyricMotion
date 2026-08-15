# Releasing Jellyfin LyricMotion

Current application version: `3.2.0`

Current LyricG2P version: `6.5.1`

## Pre-release checklist

From the repository root:

```bash
git status --short
cat VERSION
cat LYRICG2P_VERSION
sh scripts/test-all.sh
```

Expected version files:

```text
VERSION          = 3.2.0
LYRICG2P_VERSION = 6.5.1
```

Build the deterministic release asset:

```bash
mkdir -p dist
python3 scripts/package_release.py \
  --version "$(cat VERSION)" \
  --output "dist/jellyfin-lyric-motion-v$(cat VERSION).zip"
```

Verify the archive and checksum:

```bash
unzip -t "dist/jellyfin-lyric-motion-v$(cat VERSION).zip"
sha256sum -c "dist/jellyfin-lyric-motion-v$(cat VERSION).zip.sha256"
```

## Tagging

Do not force-move a published tag. Check first:

```bash
git fetch --tags --prune
git tag --list "v$(cat VERSION)"
```

If no tag is returned:

```bash
git tag -a "v$(cat VERSION)" \
  -m "Jellyfin LyricMotion $(cat VERSION) / LyricG2P $(cat LYRICG2P_VERSION)"
git push origin "v$(cat VERSION)"
```

Pushing the tag triggers `.github/workflows/release.yml`, which reruns the full validation gate, rebuilds the deterministic ZIP, and publishes the GitHub Release from `GITHUB-RELEASE.md`.

## Manual GitHub CLI release

If you prefer not to use the tag workflow, create the release manually after pushing the tag:

```bash
VERSION="$(cat VERSION)"
gh release create "v${VERSION}" \
  "dist/jellyfin-lyric-motion-v${VERSION}.zip" \
  "dist/jellyfin-lyric-motion-v${VERSION}.zip.sha256" \
  --repo ThisIsTeddyBear/Jellyfin-LyricMotion \
  --title "Jellyfin LyricMotion v${VERSION} · LyricG2P $(cat LYRICG2P_VERSION)" \
  --notes-file GITHUB-RELEASE.md \
  --latest
```

## Existing v3.2.0 tag

If `v3.2.0` already exists remotely, do not silently repoint it. Either keep the existing release and publish a distinct maintenance tag such as `v3.2.0-lyricg2p6.5.1`, or intentionally create a new application version before release. A published tag should normally remain immutable.

## Post-release checks

1. Confirm the GitHub Release has both the ZIP and `.sha256` asset.
2. Confirm the README release badge resolves to the new release.
3. Download the GitHub-hosted ZIP, extract it, and run `sh scripts/test-all.sh` once more if you want an end-to-end artifact check.
4. Install it into a disposable Jellyfin Web tree before replacing a production installation.
5. Verify the browser loads LyricMotion `3.2.0` and LyricG2P `6.5.1` in `JellyfinLyricMotion.romanization()` diagnostics.
