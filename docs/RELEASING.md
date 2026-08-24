# Releasing Jellyfin LyricMotion

The release pipeline publishes one GitHub Release with four minimal platform archives:

- `jellyfin-lyric-motion-v<VERSION>-windows.zip`
- `jellyfin-lyric-motion-v<VERSION>-linux.zip`
- `jellyfin-lyric-motion-v<VERSION>-macos.zip`
- `jellyfin-lyric-motion-v<VERSION>-docker.zip`

Every ZIP has a matching `.sha256` sidecar. Repository-only tests, research, docs, benchmarks, examples, CI metadata, and release tooling are never included because `scripts/package_release.py` uses strict allowlists.

## Pre-release checks

From the repository root:

```bash
git status --short
cat VERSION
cat LYRICG2P_VERSION
```

For v3.2.5 the version files must be:

```text
VERSION          = 3.2.5
LYRICG2P_VERSION = 6.5.1
```

## Build the same platform assets locally

```bash
rm -rf dist
python3 scripts/package_release.py \
  --version "$(cat VERSION)" \
  --platform all \
  --output-dir dist
```

Verify them:

```bash
for zip in dist/*.zip; do unzip -t "$zip"; done
for sum in dist/*.zip.sha256; do (cd dist && sha256sum -c "$(basename "$sum")"); done
```

## Tagging

Never force-move a published release tag. Check first:

```bash
git fetch --tags --prune
git tag --list "v$(cat VERSION)"
git ls-remote --tags origin "refs/tags/v$(cat VERSION)"
```

If the tag does not exist:

```bash
git tag -a "v$(cat VERSION)" \
  -m "Jellyfin LyricMotion $(cat VERSION) / LyricG2P $(cat LYRICG2P_VERSION)"
git push origin "v$(cat VERSION)"
```

Pushing the tag triggers `.github/workflows/release.yml`. The workflow reruns the full validation gate, builds all four deterministic archives, verifies their checksums, and publishes them on one GitHub Release.

## Manual rerun

If the tag already exists but the GitHub Action needs to be rerun, open **Actions → Release → Run workflow**, enter the existing tag such as `v3.2.5`, and run it. Do not move the tag just to rerun the workflow.

## Post-release checks

1. Confirm the release contains exactly four ZIPs and four `.sha256` files.
2. Download each ZIP and inspect its file list.
3. Windows must contain only Windows installers plus common runtime/legal files.
4. Linux and macOS must contain only POSIX installers plus common runtime/legal files.
5. Docker must contain only the Dockerfile plus common runtime/legal files.
6. Confirm no `tests/`, `research/`, `docs/`, `examples/`, `.github/`, benchmarks, or release scripts are inside any release ZIP.
