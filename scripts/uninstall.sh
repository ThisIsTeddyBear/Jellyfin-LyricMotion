#!/usr/bin/env sh
set -eu

WEB_DIR=""

usage() {
  echo "Usage: $0 [--webdir /path/to/jellyfin-web]"
  exit 2
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --webdir) [ "$#" -ge 2 ] || usage; WEB_DIR=$2; shift 2 ;;
    -h|--help) usage ;;
    *) usage ;;
  esac
done

is_webdir() { [ -n "${1:-}" ] && [ -f "$1/index.html" ]; }

if ! is_webdir "$WEB_DIR"; then
  if is_webdir "${JELLYFIN_WEB_DIR:-}"; then
    WEB_DIR=$JELLYFIN_WEB_DIR
  else
    for candidate in \
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

command -v python3 >/dev/null 2>&1 || {
  echo "python3 is required by this uninstaller."
  exit 1
}

INDEX="$WEB_DIR/index.html"

if [ ! -w "$WEB_DIR" ] || [ ! -w "$INDEX" ]; then
  echo "Web directory is not writable. Re-run with sudo."
  exit 1
fi

python3 - "$INDEX" <<'PY'
from pathlib import Path
import re, sys

path = Path(sys.argv[1])
content = path.read_text(encoding="utf-8")

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

path.write_text(content, encoding="utf-8")
PY

rm -f \
  "$WEB_DIR/jellyfin-lyric-motion.js" \
  "$WEB_DIR/jellyfin-lyric-motion.css" \
  "$WEB_DIR/apple-karaoke.js" \
  "$WEB_DIR/apple-karaoke.css"

echo "Jellyfin LyricMotion removed. Hard-refresh Jellyfin Web."
