# Installation details

LyricMotion is an overlay, not a redistributed Jellyfin Web build. The installer adds its JavaScript and CSS to Jellyfin Web's `index.html`; it does not alter Jellyfin databases, media, playback, FFmpeg, or generated bundles.

It finds the normal web directory automatically, or accepts `-WebDir` on PowerShell, `--webdir` on POSIX, and `JELLYFIN_WEB_DIR` on either. Before changing HTML it creates a timestamped safety backup.

The uninstaller removes LyricMotion loader tags and assets while preserving unrelated changes made to `index.html`. Use `-KeepBackups` (PowerShell) or `--keep-backups` (POSIX) to retain the safety copies.

Jellyfin upgrades can replace the web directory. If LyricMotion disappears after an upgrade, rerun the installer.
