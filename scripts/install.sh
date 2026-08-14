#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
VERSION_FILE="$ROOT_DIR/VERSION"
[ -f "$VERSION_FILE" ] || { echo "Missing $VERSION_FILE"; exit 1; }
VERSION=$(tr -d '\r\n' < "$VERSION_FILE")
[ -n "$VERSION" ] || { echo "VERSION is empty"; exit 1; }
case "$VERSION" in
  *[!A-Za-z0-9._+-]*) echo "VERSION contains unsafe characters"; exit 1 ;;
esac
JS_SOURCE="$ROOT_DIR/src/jellyfin-lyric-motion.js"
CSS_SOURCE="$ROOT_DIR/src/jellyfin-lyric-motion.css"
ROMANIZER_SOURCE="$ROOT_DIR/src/jellyfin-lyric-romanizer.js"
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

[ -f "$JS_SOURCE" ] || {
  echo "Missing $JS_SOURCE"
  exit 1
}
[ -f "$CSS_SOURCE" ] || {
  echo "Missing $CSS_SOURCE"
  exit 1
}
[ -f "$ROMANIZER_SOURCE" ] || {
  echo "Missing $ROMANIZER_SOURCE"
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

atomic_copy() {
  source_path=$1
  destination_path=$2
  destination_name=$(basename -- "$destination_path")
  temporary_path=$(mktemp "$WEB_DIR/.${destination_name}.XXXXXX.tmp")
  if cp "$source_path" "$temporary_path" && mv -f "$temporary_path" "$destination_path"; then
    return 0
  fi
  rm -f "$temporary_path"
  return 1
}

# Existing installations already reference these filenames, so update each
# overlay asset with a same-directory rename. A browser can see either the old
# complete file or the new complete file, never a partially copied asset.
atomic_copy "$JS_SOURCE" "$WEB_DIR/jellyfin-lyric-motion.js"
atomic_copy "$CSS_SOURCE" "$WEB_DIR/jellyfin-lyric-motion.css"
atomic_copy "$ROMANIZER_SOURCE" "$WEB_DIR/jellyfin-lyric-romanizer.js"

python3 - "$INDEX" "$VERSION" <<'PY'
from pathlib import Path
import os, re, stat, sys, tempfile

path = Path(sys.argv[1])
version = sys.argv[2]
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
    r"<script\b[^>]*src=[\"'][^\"']*runtime\.bundle\.js(?:\?[^\"']*)?[\"'][^>]*>",
    content,
    flags=re.I | re.S,
)
if not match:
    raise SystemExit("runtime.bundle.js was not found in index.html")

inject = (
    f'<link rel="stylesheet" href="jellyfin-lyric-motion.css?v={version}">'
    f'<script defer="defer" src="jellyfin-lyric-motion.js?v={version}"></script>'
)
content = content[:match.start()] + inject + content[match.start():]

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
    os.chmod(temporary, mode)
    os.replace(temporary, path)
    temporary = None
finally:
    if temporary is not None:
        try:
            temporary.unlink()
        except OSError:
            pass
PY

rm -f "$WEB_DIR/apple-karaoke.js" "$WEB_DIR/apple-karaoke.css"

echo
echo "Jellyfin LyricMotion v$VERSION installed."
echo "Web directory: $WEB_DIR"
echo "Backup: $BACKUP"
echo "Hard-refresh Jellyfin Web or use a private browser window."
echo
