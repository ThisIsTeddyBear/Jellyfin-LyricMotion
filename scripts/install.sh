#!/usr/bin/env sh
set -eu

VERSION="3.0.1"
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
JS_SOURCE="$ROOT_DIR/src/jellyfin-lyric-motion.js"
CSS_SOURCE="$ROOT_DIR/src/jellyfin-lyric-motion.css"
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
  echo "Could not locate Jellyfin Web."
  echo "Use: $0 --webdir /path/to/jellyfin-web"
  exit 1
fi

command -v python3 >/dev/null 2>&1 || {
  echo "python3 is required by this installer."
  exit 1
}

INDEX="$WEB_DIR/index.html"
BACKUP_BASE="$WEB_DIR/index.html.before-jellyfin-lyric-motion-$(date +%Y%m%d-%H%M%S)"
BACKUP=$BACKUP_BASE
BACKUP_SUFFIX=1
while [ -e "$BACKUP" ]; do
  BACKUP="$BACKUP_BASE-$BACKUP_SUFFIX"
  BACKUP_SUFFIX=$((BACKUP_SUFFIX + 1))
done

if [ ! -w "$WEB_DIR" ] || [ ! -w "$INDEX" ]; then
  echo "Web directory is not writable. Re-run with sudo."
  exit 1
fi

cp "$INDEX" "$BACKUP"

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

match = re.search(
    r"<script\b[^>]*src=[\"']runtime\.bundle\.js[^\"']*[\"'][^>]*>",
    content,
    flags=re.I | re.S,
)
if not match:
    raise SystemExit("runtime.bundle.js was not found in index.html")

inject = (
    '<link rel="stylesheet" href="jellyfin-lyric-motion.css?v=3.0.1">'
    '<script defer="defer" src="jellyfin-lyric-motion.js?v=3.0.1"></script>'
)
content = content[:match.start()] + inject + content[match.start():]
path.write_text(content, encoding="utf-8")
PY

cp "$JS_SOURCE" "$WEB_DIR/jellyfin-lyric-motion.js"
cp "$CSS_SOURCE" "$WEB_DIR/jellyfin-lyric-motion.css"
rm -f "$WEB_DIR/apple-karaoke.js" "$WEB_DIR/apple-karaoke.css"

echo
echo "Jellyfin LyricMotion v$VERSION installed."
echo "Web directory: $WEB_DIR"
echo "Backup: $BACKUP"
echo "Hard-refresh Jellyfin Web or use a private browser window."
echo
