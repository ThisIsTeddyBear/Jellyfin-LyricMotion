# Releasing Jellyfin LyricMotion

Release maintainers build and publish one GitHub Release with four minimal platform archives:

- `jellyfin-lyric-motion-v<VERSION>-windows.zip`
- `jellyfin-lyric-motion-v<VERSION>-linux.zip`
- `jellyfin-lyric-motion-v<VERSION>-macos.zip`
- `jellyfin-lyric-motion-v<VERSION>-docker.zip`

Every ZIP has a matching `.sha256` sidecar. Repository documentation, examples, CI metadata, and release tooling are excluded because `scripts/package_release.py` uses strict allowlists.

## Pre-release checks

From the repository root:

```bash
git status --short
cat VERSION
```

`VERSION` must match the release being prepared.

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
  -m "Jellyfin LyricMotion $(cat VERSION)"
git push origin "v$(cat VERSION)"
```

There is no GitHub Actions release workflow in this repository. After pushing the verified tag, create the matching GitHub Release manually and upload the four ZIPs with their four `.sha256` sidecars.

Never force-move a published release tag. If publication needs correction, create a new release version rather than retagging an existing one.

## Post-release checks

1. Confirm the release contains exactly four ZIPs and four `.sha256` files.
2. Download each ZIP and inspect its file list.
3. Windows must contain only Windows installers plus common runtime/legal files.
4. Linux and macOS must contain only POSIX installers plus common runtime/legal files.
5. Docker must contain only the Dockerfile plus common runtime/legal files.
6. Confirm no repository-only documentation, examples, `.github/` metadata, or release scripts are inside any release ZIP.
