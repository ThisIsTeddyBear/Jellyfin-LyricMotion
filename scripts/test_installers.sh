#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
TMP_ROOT=$(mktemp -d)
trap 'rm -rf "$TMP_ROOT"' EXIT HUP INT TERM

assert_count() {
  expected=$1
  pattern=$2
  file=$3
  actual=$(grep -o "$pattern" "$file" | wc -l | tr -d ' ')
  [ "$actual" = "$expected" ] || {
    echo "Expected $expected occurrences of $pattern in $file, found $actual" >&2
    exit 1
  }
}

# Work from a disposable copy so failure tests never mutate the source tree.
mkdir -p "$TMP_ROOT/pkg/scripts" "$TMP_ROOT/pkg/src" "$TMP_ROOT/web"
cp "$ROOT_DIR/scripts/install.sh" "$TMP_ROOT/pkg/scripts/install.sh"
cp "$ROOT_DIR/scripts/uninstall.sh" "$TMP_ROOT/pkg/scripts/uninstall.sh"
cp "$ROOT_DIR/VERSION" "$TMP_ROOT/pkg/VERSION"
cp "$ROOT_DIR/src/jellyfin-lyric-motion.js" "$TMP_ROOT/pkg/src/jellyfin-lyric-motion.js"
cp "$ROOT_DIR/src/jellyfin-lyric-motion.css" "$TMP_ROOT/pkg/src/jellyfin-lyric-motion.css"
cp "$ROOT_DIR/src/jellyfin-lyric-romanizer.js" "$TMP_ROOT/pkg/src/jellyfin-lyric-romanizer.js"
chmod +x "$TMP_ROOT/pkg/scripts/install.sh" "$TMP_ROOT/pkg/scripts/uninstall.sh"

cat > "$TMP_ROOT/web/index.html" <<'HTML'
<html><head></head><body><script defer src="./runtime.bundle.js?hash=abc123"></script><main id="keep">keep</main></body></html>
HTML

"$TMP_ROOT/pkg/scripts/install.sh" --webdir "$TMP_ROOT/web" >/dev/null
assert_count 1 'jellyfin-lyric-motion\.js' "$TMP_ROOT/web/index.html"
assert_count 1 'jellyfin-lyric-motion\.css' "$TMP_ROOT/web/index.html"
grep -q './runtime.bundle.js?hash=abc123' "$TMP_ROOT/web/index.html"
grep -q 'id="keep"' "$TMP_ROOT/web/index.html"
pkg_version=$(tr -d '\r\n' < "$TMP_ROOT/pkg/VERSION")
grep -q "jellyfin-lyric-motion.js?v=$pkg_version" "$TMP_ROOT/web/index.html"
grep -q "jellyfin-lyric-motion.css?v=$pkg_version" "$TMP_ROOT/web/index.html"
cmp "$TMP_ROOT/pkg/src/jellyfin-lyric-motion.js" "$TMP_ROOT/web/jellyfin-lyric-motion.js"
cmp "$TMP_ROOT/pkg/src/jellyfin-lyric-motion.css" "$TMP_ROOT/web/jellyfin-lyric-motion.css"
cmp "$TMP_ROOT/pkg/src/jellyfin-lyric-romanizer.js" "$TMP_ROOT/web/jellyfin-lyric-romanizer.js"
[ "$(find "$TMP_ROOT/web" -maxdepth 1 -name 'index.html.before-jellyfin-lyric-motion-*' | wc -l | tr -d ' ')" = 1 ]

[ ! -e "$ROOT_DIR/src/jellyfin-lyric-romanization-sources.js" ]
! grep -q 'ROMANIZATION_SOURCES_SOURCE\|RomanizationSourcesSource' "$ROOT_DIR/scripts/install.sh" "$ROOT_DIR/scripts/install.ps1"
! grep -q 'jellyfin-lyric-romanization-sources.js' "$ROOT_DIR/docker/Dockerfile"

# Reinstall is idempotent: exactly one tag of each type remains.
"$TMP_ROOT/pkg/scripts/install.sh" --webdir "$TMP_ROOT/web" >/dev/null
assert_count 1 'jellyfin-lyric-motion\.js' "$TMP_ROOT/web/index.html"
assert_count 1 'jellyfin-lyric-motion\.css' "$TMP_ROOT/web/index.html"
grep -q './runtime.bundle.js?hash=abc123' "$TMP_ROOT/web/index.html"

"$TMP_ROOT/pkg/scripts/uninstall.sh" --webdir "$TMP_ROOT/web" >/dev/null
! grep -q 'jellyfin-lyric-motion\.js' "$TMP_ROOT/web/index.html"
! grep -q 'jellyfin-lyric-motion\.css' "$TMP_ROOT/web/index.html"
[ ! -e "$TMP_ROOT/web/jellyfin-lyric-motion.js" ]
[ ! -e "$TMP_ROOT/web/jellyfin-lyric-motion.css" ]
[ ! -e "$TMP_ROOT/web/jellyfin-lyric-romanizer.js" ]
[ ! -e "$TMP_ROOT/web/jellyfin-lyric-romanization-sources.js" ]
grep -q './runtime.bundle.js?hash=abc123' "$TMP_ROOT/web/index.html"
grep -q 'id="keep"' "$TMP_ROOT/web/index.html"
[ "$(find "$TMP_ROOT/web" -maxdepth 1 -name 'index.html.before-jellyfin-lyric-motion-*' | wc -l | tr -d ' ')" = 0 ]
[ "$(find "$TMP_ROOT/web" -maxdepth 1 -name '.index.html.*.tmp' | wc -l | tr -d ' ')" = 0 ]

# --keep-backups preserves the installer-owned safety copy when explicitly requested.
"$TMP_ROOT/pkg/scripts/install.sh" --webdir "$TMP_ROOT/web" >/dev/null
"$TMP_ROOT/pkg/scripts/uninstall.sh" --webdir "$TMP_ROOT/web" --keep-backups >/dev/null
[ "$(find "$TMP_ROOT/web" -maxdepth 1 -name 'index.html.before-jellyfin-lyric-motion-*' | wc -l | tr -d ' ')" -ge 1 ]
rm -f "$TMP_ROOT/web"/index.html.before-jellyfin-lyric-motion-*

# Missing packaged assets must fail before index.html is touched.
mkdir -p "$TMP_ROOT/broken/scripts" "$TMP_ROOT/broken/src" "$TMP_ROOT/web-broken"
cp "$ROOT_DIR/scripts/install.sh" "$TMP_ROOT/broken/scripts/install.sh"
cp "$ROOT_DIR/VERSION" "$TMP_ROOT/broken/VERSION"
cp "$ROOT_DIR/src/jellyfin-lyric-motion.css" "$TMP_ROOT/broken/src/jellyfin-lyric-motion.css"
cp "$ROOT_DIR/src/jellyfin-lyric-romanizer.js" "$TMP_ROOT/broken/src/jellyfin-lyric-romanizer.js"
chmod +x "$TMP_ROOT/broken/scripts/install.sh"
printf '%s\n' '<html><script src="runtime.bundle.js"></script><p>original</p></html>' > "$TMP_ROOT/web-broken/index.html"
cp "$TMP_ROOT/web-broken/index.html" "$TMP_ROOT/web-broken/original.html"
if "$TMP_ROOT/broken/scripts/install.sh" --webdir "$TMP_ROOT/web-broken" >/dev/null 2>&1; then
  echo 'Installer unexpectedly succeeded without its JS source.' >&2
  exit 1
fi
cmp "$TMP_ROOT/web-broken/original.html" "$TMP_ROOT/web-broken/index.html"

# A changed Jellyfin runtime tag path/query must still be detected.
grep -q 'runtime\\\.bundle\\\.js' "$ROOT_DIR/scripts/install.sh"
grep -q 'runtime\\.bundle\\.js' "$ROOT_DIR/scripts/install.ps1"

# PowerShell commits HTML only after asset copies, via the atomic helper.
ps_copy_line=$(grep -n '^Copy-AtomicFile \$JsSource' "$ROOT_DIR/scripts/install.ps1" | head -1 | cut -d: -f1)
ps_commit_line=$(grep -n '^Write-AtomicUtf8 \$IndexPath \$content' "$ROOT_DIR/scripts/install.ps1" | tail -1 | cut -d: -f1)
[ "$ps_copy_line" -lt "$ps_commit_line" ]
grep -q 'os.replace(temporary, path)' "$ROOT_DIR/scripts/install.sh"
grep -q 'os.replace(temporary, path)' "$ROOT_DIR/scripts/uninstall.sh"
grep -q '\[IO.File\]::Replace' "$ROOT_DIR/scripts/install.ps1"
grep -q '\[IO.File\]::Replace' "$ROOT_DIR/scripts/uninstall.ps1"
! grep -Fq '[IO.File]::Replace($temporary, $Destination, $null' "$ROOT_DIR/scripts/install.ps1"
! grep -Fq '[IO.File]::Replace($temporary, $Path, $null' "$ROOT_DIR/scripts/install.ps1" "$ROOT_DIR/scripts/uninstall.ps1"
grep -q 'replaceBackup' "$ROOT_DIR/scripts/install.ps1"
grep -q 'replaceBackup' "$ROOT_DIR/scripts/uninstall.ps1"
grep -q '^atomic_copy()' "$ROOT_DIR/scripts/install.sh"
grep -q '^Copy-AtomicFile' "$ROOT_DIR/scripts/install.ps1"
[ "$(find "$TMP_ROOT/web" -maxdepth 1 -name '.jellyfin-lyric-*.tmp' | wc -l | tr -d ' ')" = 0 ]

# Docker reinjection must remove tags, never delete a whole minified HTML line.
! grep -q "apple-karaoke).*\/d" "$ROOT_DIR/docker/Dockerfile"
DOCKER_HTML="$TMP_ROOT/docker-index.html"
printf '%s' "<html><link rel='stylesheet' href='jellyfin-lyric-motion.css?v=old'><script src='apple-karaoke.js?v=old'></script><script src='./runtime.bundle.js?x=1'></script><main>keep-docker</main></html>" > "$DOCKER_HTML"
sed -i -E "s#<link[^>]*href=[\"'][^\"']*(jellyfin-lyric-motion|apple-karaoke)\.css(\?[^\"']*)?[\"'][^>]*>##Ig; s#<script[^>]*src=[\"'][^\"']*(jellyfin-lyric-motion|apple-karaoke)\.js(\?[^\"']*)?[\"'][^>]*>[[:space:]]*</script>##Ig" "$DOCKER_HTML"
sed -i -E "0,/<script[^>]*src=[\"'][^\"']*runtime\.bundle\.js[^\"']*[\"'][^>]*>/s##<link rel=\"stylesheet\" href=\"jellyfin-lyric-motion.css?v=test\"><script src=\"jellyfin-lyric-motion.js?v=test\"></script>&#" "$DOCKER_HTML"
grep -q 'keep-docker' "$DOCKER_HTML"
grep -q './runtime.bundle.js?x=1' "$DOCKER_HTML"
assert_count 1 'jellyfin-lyric-motion\.js' "$DOCKER_HTML"
assert_count 1 'jellyfin-lyric-motion\.css' "$DOCKER_HTML"

sh -n "$ROOT_DIR/scripts/install.sh"
sh -n "$ROOT_DIR/scripts/uninstall.sh"

echo 'Installer/uninstaller contract: 47 checks passed.'
