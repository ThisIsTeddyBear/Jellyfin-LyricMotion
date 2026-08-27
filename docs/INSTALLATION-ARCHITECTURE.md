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

Do not include Jellyfin's generated `index.html` or a full source checkout. Platform archives use a strict allowlist.

Every archive contains the generated platform `README.md`, `VERSION`, `LYRICG2P_VERSION`, runtime assets from `src/`, and the required license/notice files. The remaining contents are platform-specific:

- Windows: `INSTALL-WINDOWS.cmd`, `UNINSTALL-WINDOWS.cmd`, and the PowerShell installer/uninstaller.
- Linux and macOS: the POSIX installer and uninstaller.
- Docker: `docker/Dockerfile`.

Repository documentation, examples, CI metadata, and release tooling are excluded.

## Patch strategy

1. Validate the package version and required overlay assets.
2. Back up the user's current `index.html`.
3. Build an injection from the current `index.html`, removing older LyricMotion/legacy loader tags and locating `runtime.bundle.js`.
4. Replace each overlay JS/CSS asset through a same-directory temporary file/atomic commit so an in-place upgrade never exposes a partially copied asset. On Windows PowerShell 5.1, `System.IO.File.Replace` receives a real same-directory transient backup path (never `$null`) and that transient backup is deleted after commit.
5. Commit the edited `index.html` last through a same-directory atomic replacement.
6. Inject only the main LyricMotion CSS/JS immediately before Jellyfin's runtime bundle; the Romanizer remains a lazy sibling asset.
7. Leave Jellyfin's generated bundles untouched.

A normal uninstall surgically removes LyricMotion loader tags and assets, then deletes LyricMotion-owned `index.html.before-jellyfin-lyric-motion*` backups so the webroot is clean. Use `--keep-backups` on shell or `-KeepBackups` on PowerShell when the safety copies should remain. The uninstaller does not roll `index.html` back wholesale, so unrelated Jellyfin/custom changes made after installation are preserved.

## Jellyfin updates

Package managers and container updates may replace the webroot. Re-run or rebuild LyricMotion after an update when necessary.

Each GitHub release should publish a Jellyfin compatibility matrix.
