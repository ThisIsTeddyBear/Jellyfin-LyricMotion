#!/usr/bin/env sh
set -eu

WEB_DIR=""
WEB_DIR_EXPLICIT=0
KEEP_BACKUPS=0

usage() {
  echo "Usage: $0 [--webdir /path/to/jellyfin-web] [--keep-backups]"
  exit 2
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --webdir) [ "$#" -ge 2 ] || usage; WEB_DIR=$2; WEB_DIR_EXPLICIT=1; shift 2 ;;
    --keep-backups) KEEP_BACKUPS=1; shift ;;
    -h|--help) usage ;;
    *) usage ;;
  esac
done

is_webdir() { [ -n "${1:-}" ] && [ -f "$1/index.html" ]; }

if [ "$WEB_DIR_EXPLICIT" -eq 1 ] && ! is_webdir "$WEB_DIR"; then
  echo "The supplied --webdir is not a Jellyfin Web directory: $WEB_DIR"
  exit 1
fi

if ! is_webdir "$WEB_DIR"; then
  if is_webdir "${JELLYFIN_WEB_DIR:-}"; then
    WEB_DIR=$JELLYFIN_WEB_DIR
  else
    for candidate in \
      /Applications/Jellyfin.app/Contents/Resources/jellyfin-web \
      /usr/share/jellyfin/web \
      /usr/lib/jellyfin/bin/jellyfin-web \
      /opt/jellyfin/jellyfin-web \
      /jellyfin/jellyfin-web
    do
      if is_webdir "$candidate"; then WEB_DIR=$candidate; break; fi
    done
  fi
fi

if ! is_webdir "$WEB_DIR"; then
  echo "Could not locate Jellyfin Web. Use --webdir."
  exit 1
fi

PYTHON_BIN=${LYRICMOTION_PYTHON:-python3}
"$PYTHON_BIN" --version >/dev/null 2>&1 || {
    echo "Python 3 is required by this uninstaller. Set LYRICMOTION_PYTHON when python3 is not on PATH."
    exit 1
}
"$PYTHON_BIN" -c 'import sys; raise SystemExit(sys.version_info < (3, 8))' || {
  echo "Python 3.8 or newer is required by this uninstaller."
  exit 1
}

INDEX="$WEB_DIR/index.html"

if [ ! -w "$WEB_DIR" ] || [ ! -w "$INDEX" ]; then
  echo "Web directory is not writable. Re-run with sudo."
  exit 1
fi

"$PYTHON_BIN" - "$INDEX" <<'PY'
from pathlib import Path
import os, re, stat, sys, tempfile

path = Path(sys.argv[1])
# Preserve the original line-ending convention; this operation should only
# remove LyricMotion tags, not rewrite the rest of Jellyfin's index.html.
with path.open("r", encoding="utf-8", newline="") as handle:
    content = handle.read()

content = re.sub(
    r"<link\b[^>]*href=[\"'][^\"']*(?:jellyfin-lyric-motion|apple-karaoke)\.css(?:\?[^\"']*)?[\"'][^>]*>",
    "",
    content,
    flags=re.I | re.S,
)
content = re.sub(
    r"<script\b[^>]*src=[\"'][^\"']*(?:jellyfin-lyric-motion|apple-karaoke)\.js(?:\?[^\"']*)?[\"'][^>]*>\s*</script>",
    "",
    content,
    flags=re.I | re.S,
)

mode = stat.S_IMODE(path.stat().st_mode)
temporary = None
try:
    with tempfile.NamedTemporaryFile(
        mode="w", encoding="utf-8", newline="", dir=path.parent,
        prefix=f".{path.name}.", suffix=".tmp", delete=False
    ) as handle:
        temporary = Path(handle.name)
        handle.write(content)
        handle.flush()
        os.fsync(handle.fileno())
    # os.replace installs a new inode owned by the account running this script.
    # Keep the existing access bits but ensure Jellyfin can still read the
    # rebuilt index when the uninstaller was run through sudo.
    os.chmod(temporary, mode | stat.S_IRUSR | stat.S_IRGRP | stat.S_IROTH)
    os.replace(temporary, path)
    temporary = None
finally:
    if temporary is not None:
        try:
            temporary.unlink()
        except OSError:
            pass
PY

rm -f \
  "$WEB_DIR/jellyfin-lyric-motion.js" \
  "$WEB_DIR/jellyfin-lyric-motion.css" \
  "$WEB_DIR/jellyfin-lyric-romanizer.js" \
  "$WEB_DIR/jellyfin-lyric-romanization-sources.js" \
  "$WEB_DIR/apple-karaoke.js" \
  "$WEB_DIR/apple-karaoke.css"

if [ "$KEEP_BACKUPS" -eq 0 ]; then
  rm -f \
    "$WEB_DIR/index.html.before-jellyfin-lyric-motion" \
    "$WEB_DIR"/index.html.before-jellyfin-lyric-motion-*
fi

echo "Jellyfin LyricMotion removed. Hard-refresh Jellyfin Web."
