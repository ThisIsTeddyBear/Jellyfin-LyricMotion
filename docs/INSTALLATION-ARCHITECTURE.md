# Installation Architecture

Jellyfin LyricMotion should be distributed as an **overlay**, not as a pre-patched Jellyfin Web build.

## Web directory discovery

Jellyfin officially resolves its web directory from:

1. `--webdir`
2. `JELLYFIN_WEB_DIR`
3. `jellyfin-web` beside the Jellyfin binary

Common locations include:

- Linux packages: `/usr/share/jellyfin/web`
- Official Docker image: `/jellyfin/jellyfin-web`
- Windows installer: usually under the Jellyfin Server installation folder

## Release artifact

Do not include Jellyfin's generated `index.html`.

Ship:

```text
src/
scripts/
docker/
examples/
docs/
VERSION
README.md
CHANGELOG.md
LICENSE
THIRD_PARTY_NOTICES.md
```

## Patch strategy

1. Back up the user's current `index.html`.
2. Remove existing LyricMotion loader tags.
3. Find the `runtime.bundle.js` script element.
4. Insert LyricMotion CSS/JS immediately before it.
5. Copy LyricMotion assets into that webroot.
6. Leave Jellyfin's bundles untouched.

## Jellyfin updates

Package managers and container updates may replace the webroot. Re-run or rebuild LyricMotion after an update when necessary.

Each GitHub release should publish a tested Jellyfin compatibility matrix.

## Automated release

`scripts/package_release.py` creates both the extracted release folder and its
deterministic ZIP under `dist/local-testing`. A pushed `v*` tag is validated by
GitHub Actions, packaged from the matching `VERSION`, and published with its
SHA-256 checksum. Generated `dist` content is intentionally not committed.
