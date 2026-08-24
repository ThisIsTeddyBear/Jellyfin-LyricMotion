#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
VERSION_FILE="$ROOT_DIR/VERSION"
[ -f "$VERSION_FILE" ] || { echo "Missing $VERSION_FILE"; exit 1; }
VERSION=$(tr -d '\r\n' < "$VERSION_FILE")
LYRICG2P_VERSION_FILE="$ROOT_DIR/LYRICG2P_VERSION"
[ -f "$LYRICG2P_VERSION_FILE" ] || { echo "Missing $LYRICG2P_VERSION_FILE"; exit 1; }
LYRICG2P_VERSION=$(tr -d '\r\n' < "$LYRICG2P_VERSION_FILE")
[ -n "$VERSION" ] || { echo "VERSION is empty"; exit 1; }
case "$VERSION" in
  *[!A-Za-z0-9._+-]*) echo "VERSION contains unsafe characters"; exit 1 ;;
esac
[ -n "$LYRICG2P_VERSION" ] || { echo "LYRICG2P_VERSION is empty"; exit 1; }
case "$LYRICG2P_VERSION" in
  *[!A-Za-z0-9._+-]*) echo "LYRICG2P_VERSION contains unsafe characters"; exit 1 ;;
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
  echo "Could not locate Jellyfin Web."
  echo "Use: $0 --webdir /path/to/jellyfin-web"
  exit 1
fi

PYTHON_BIN=${LYRICMOTION_PYTHON:-python3}
"$PYTHON_BIN" --version >/dev/null 2>&1 || {
  echo "Python 3 is required by this installer. Set LYRICMOTION_PYTHON when python3 is not on PATH."
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

stage_copy() {
  source_path=$1
  destination_path=$2
  destination_name=$(basename -- "$destination_path")
  temporary_path=$(mktemp "$WEB_DIR/.${destination_name}.XXXXXX.tmp")
  if cp "$source_path" "$temporary_path"; then
    printf '%s\n' "$temporary_path"
    return 0
  fi
  rm -f "$temporary_path"
  return 1
}

stage_existing_backup() {
  live_path=$1
  if [ ! -e "$live_path" ]; then
    printf '%s\n' ''
    return 0
  fi
  live_name=$(basename -- "$live_path")
  backup_path=$(mktemp "$WEB_DIR/.${live_name}.XXXXXX.rollback")
  if cp -p "$live_path" "$backup_path" 2>/dev/null || cp "$live_path" "$backup_path"; then
    printf '%s\n' "$backup_path"
    return 0
  fi
  rm -f "$backup_path"
  return 1
}

JS_DEST="$WEB_DIR/jellyfin-lyric-motion.js"
CSS_DEST="$WEB_DIR/jellyfin-lyric-motion.css"
ROMANIZER_DEST="$WEB_DIR/jellyfin-lyric-romanizer.js"

# Stage the complete replacement set, including the transformed index, before
# touching any live asset. A malformed Jellyfin index therefore fails before a
# partial LyricMotion upgrade can become visible.
JS_TEMP=''
CSS_TEMP=''
ROMANIZER_TEMP=''
INDEX_TEMP=''
JS_ROLLBACK=''
CSS_ROLLBACK=''
ROMANIZER_ROLLBACK=''
COMMITTING=0
COMMITTED=0

restore_live_asset() {
  destination_path=$1
  rollback_path=$2
  if [ -n "$rollback_path" ] && [ -f "$rollback_path" ]; then
    cp -p "$rollback_path" "$destination_path" 2>/dev/null \
      || cp "$rollback_path" "$destination_path" \
      || return 1
  else
    rm -f "$destination_path" || return 1
  fi
}

cleanup_transaction_files() {
  [ -z "$JS_TEMP" ] || rm -f "$JS_TEMP"
  [ -z "$CSS_TEMP" ] || rm -f "$CSS_TEMP"
  [ -z "$ROMANIZER_TEMP" ] || rm -f "$ROMANIZER_TEMP"
  [ -z "$INDEX_TEMP" ] || rm -f "$INDEX_TEMP"
  [ -z "$JS_ROLLBACK" ] || rm -f "$JS_ROLLBACK"
  [ -z "$CSS_ROLLBACK" ] || rm -f "$CSS_ROLLBACK"
  [ -z "$ROMANIZER_ROLLBACK" ] || rm -f "$ROMANIZER_ROLLBACK"
}

finish_install_transaction() {
  status=$?
  trap - EXIT HUP INT TERM
  if [ "$status" -ne 0 ] && [ "$COMMITTING" -eq 1 ] && [ "$COMMITTED" -eq 0 ]; then
    echo "Installation commit failed; restoring the previous LyricMotion assets." >&2
    restore_live_asset "$JS_DEST" "$JS_ROLLBACK" || true
    restore_live_asset "$CSS_DEST" "$CSS_ROLLBACK" || true
    restore_live_asset "$ROMANIZER_DEST" "$ROMANIZER_ROLLBACK" || true
    cp -p "$BACKUP" "$INDEX" 2>/dev/null || cp "$BACKUP" "$INDEX" || true
  fi
  cleanup_transaction_files
  exit "$status"
}
trap finish_install_transaction EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

JS_TEMP=$(stage_copy "$JS_SOURCE" "$JS_DEST")
CSS_TEMP=$(stage_copy "$CSS_SOURCE" "$CSS_DEST")
ROMANIZER_TEMP=$(stage_copy "$ROMANIZER_SOURCE" "$ROMANIZER_DEST")
INDEX_TEMP=$(stage_copy "$INDEX" "$INDEX")

# Snapshot the complete previous live asset set before the first commit. Empty
# rollback paths mean that asset did not exist and should be removed on rollback.
JS_ROLLBACK=$(stage_existing_backup "$JS_DEST")
CSS_ROLLBACK=$(stage_existing_backup "$CSS_DEST")
ROMANIZER_ROLLBACK=$(stage_existing_backup "$ROMANIZER_DEST")

"$PYTHON_BIN" - "$INDEX_TEMP" "$VERSION" "$LYRICG2P_VERSION" <<'PY'
from pathlib import Path
import os, re, sys

path = Path(sys.argv[1])
version = sys.argv[2]
lyricg2p_version = sys.argv[3]
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
    f'<script defer="defer" src="jellyfin-lyric-motion.js?v={version}&g2p={lyricg2p_version}"></script>'
)
content = content[:match.start()] + inject + content[match.start():]

with path.open("w", encoding="utf-8", newline="") as handle:
    handle.write(content)
    handle.flush()
    os.fsync(handle.fileno())
PY

# Each same-directory rename is atomic. If any commit fails, the EXIT trap
# restores every previously installed asset and the original index.html.
COMMITTING=1
mv -f "$JS_TEMP" "$JS_DEST"
JS_TEMP=''
mv -f "$CSS_TEMP" "$CSS_DEST"
CSS_TEMP=''
mv -f "$ROMANIZER_TEMP" "$ROMANIZER_DEST"
ROMANIZER_TEMP=''
mv -f "$INDEX_TEMP" "$INDEX"
INDEX_TEMP=''
COMMITTED=1
COMMITTING=0
cleanup_transaction_files
trap - EXIT HUP INT TERM

rm -f "$WEB_DIR/apple-karaoke.js" "$WEB_DIR/apple-karaoke.css"

echo
echo "Jellyfin LyricMotion v$VERSION / LyricG2P $LYRICG2P_VERSION installed."
echo "Web directory: $WEB_DIR"
echo "Backup: $BACKUP"
echo "Hard-refresh Jellyfin Web or use a private browser window."
echo
