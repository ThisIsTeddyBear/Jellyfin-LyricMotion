#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

# Syntax / loadability.
for file in \
  src/jellyfin-lyric-motion.js \
  src/jellyfin-lyric-romanizer.js \
  scripts/benchmark-lyricg2p65.js \
  scripts/benchmark-lyricg2p651.js \
  scripts/evaluate-lyricg2p65.js \
  scripts/calibrate-lyricg2p65-confidence.js \
  tests/lyricg2p65.test.js \
  tests/lyricg2p651-hybrid.test.js \
  tests/runtime-smoke.test.js \
  tests/runtime-core.test.js \
  tests/instrumental-breaks.test.js
do
  node --check "$file"
done

python3 -m py_compile \
  scripts/import-dakshina.py \
  scripts/prepare-lyricg2p-dataset.py \
  scripts/package_release.py \
  scripts/ttml_to_elrc.py \
  research/train_tiny_transformer.py

sh -n scripts/install.sh
sh -n scripts/uninstall.sh

APP_VERSION=$(tr -d '\r\n' < VERSION)
G2P_VERSION=$(tr -d '\r\n' < LYRICG2P_VERSION)
test -n "$APP_VERSION"
test -n "$G2P_VERSION"
grep -q "const VERSION = '$APP_VERSION'" src/jellyfin-lyric-motion.js
grep -q "const LYRICG2P_VERSION = '$G2P_VERSION'" src/jellyfin-lyric-motion.js
grep -q "COPY LYRICG2P_VERSION /tmp/jellyfin-lyricg2p-version" docker/Dockerfile
grep -q 'g2p=${LYRICG2P_VERSION}' docker/Dockerfile
grep -q "const VERSION = '$G2P_VERSION'" src/jellyfin-lyric-romanizer.js

# Production/regression and hybrid/model/Unicode suites.
node tests/lyricg2p65.test.js
node tests/lyricg2p651-hybrid.test.js
node tests/runtime-smoke.test.js
node tests/runtime-core.test.js
node tests/instrumental-breaks.test.js
python3 tests/ttml_converter_test.py
python3 tests/research_pipeline_test.py
python3 tests/release_static_test.py
node scripts/evaluate-lyricg2p65.js \
  research/lyricg2p65-regression-seed.tsv /tmp/lyricg2p651-regression-report.json >/dev/null
node scripts/calibrate-lyricg2p65-confidence.js \
  research/lyricg2p65-regression-seed.tsv /tmp/lyricg2p651-confidence-report.json >/dev/null
node scripts/benchmark-lyricg2p651.js >/tmp/lyricg2p651-benchmark.json
grep -q "\"engine\": \"$G2P_VERSION\"" /tmp/lyricg2p651-regression-report.json
grep -q "\"engine\": \"$G2P_VERSION\"" /tmp/lyricg2p651-confidence-report.json
grep -q "\"engine\": \"$G2P_VERSION\"" /tmp/lyricg2p651-benchmark.json

# Synthetic Jellyfin Web install/uninstall, including engine-specific cache busting.
TMP_WEB=$(mktemp -d)
cleanup() { rm -rf "$TMP_WEB"; }
trap cleanup EXIT INT TERM
cat > "$TMP_WEB/index.html" <<'HTML'
<!doctype html><html><head></head><body><script src="runtime.bundle.js"></script></body></html>
HTML
sh scripts/install.sh --webdir "$TMP_WEB" >/dev/null
grep -q "jellyfin-lyric-motion.js?v=$(cat VERSION)&g2p=$(cat LYRICG2P_VERSION)" "$TMP_WEB/index.html"
grep -q "jellyfin-lyric-motion.css?v=$(cat VERSION)" "$TMP_WEB/index.html"
test -s "$TMP_WEB/jellyfin-lyric-motion.js"
test -s "$TMP_WEB/jellyfin-lyric-motion.css"
test -s "$TMP_WEB/jellyfin-lyric-romanizer.js"
grep -q "const VERSION = '$G2P_VERSION'" "$TMP_WEB/jellyfin-lyric-romanizer.js"
sh scripts/uninstall.sh --webdir "$TMP_WEB" >/dev/null
! grep -q 'jellyfin-lyric-motion.js' "$TMP_WEB/index.html"

# Forced mid-commit installer failure must roll back every live asset and index.
TMP_ROLLBACK_WEB=$(mktemp -d)
TMP_FAKE_BIN=$(mktemp -d)
ROLLBACK_MV_COUNT=$(mktemp)
printf '0\n' > "$ROLLBACK_MV_COUNT"
cat > "$TMP_ROLLBACK_WEB/index.html" <<'HTML'
<!doctype html><html><head></head><body><script src="runtime.bundle.js"></script></body></html>
HTML
printf 'old-js\n' > "$TMP_ROLLBACK_WEB/jellyfin-lyric-motion.js"
printf 'old-css\n' > "$TMP_ROLLBACK_WEB/jellyfin-lyric-motion.css"
printf 'old-g2p\n' > "$TMP_ROLLBACK_WEB/jellyfin-lyric-romanizer.js"
cp "$TMP_ROLLBACK_WEB/index.html" "$TMP_ROLLBACK_WEB/index.expected.html"
REAL_MV=$(command -v mv)
cat > "$TMP_FAKE_BIN/mv" <<'MVSH'
#!/usr/bin/env sh
set -eu
count=$(cat "$LYRICMOTION_TEST_MV_COUNT")
count=$((count + 1))
printf '%s\n' "$count" > "$LYRICMOTION_TEST_MV_COUNT"
if [ "$count" -eq 2 ]; then
  exit 74
fi
exec "$LYRICMOTION_REAL_MV" "$@"
MVSH
chmod +x "$TMP_FAKE_BIN/mv"
if PATH="$TMP_FAKE_BIN:$PATH" \
  LYRICMOTION_TEST_MV_COUNT="$ROLLBACK_MV_COUNT" \
  LYRICMOTION_REAL_MV="$REAL_MV" \
  sh scripts/install.sh --webdir "$TMP_ROLLBACK_WEB" >/dev/null 2>&1; then
  echo 'Installer rollback test expected a forced commit failure' >&2
  exit 1
fi
test "$(cat "$TMP_ROLLBACK_WEB/jellyfin-lyric-motion.js")" = 'old-js'
test "$(cat "$TMP_ROLLBACK_WEB/jellyfin-lyric-motion.css")" = 'old-css'
test "$(cat "$TMP_ROLLBACK_WEB/jellyfin-lyric-romanizer.js")" = 'old-g2p'
cmp "$TMP_ROLLBACK_WEB/index.html" "$TMP_ROLLBACK_WEB/index.expected.html"
rm -rf "$TMP_ROLLBACK_WEB" "$TMP_FAKE_BIN" "$ROLLBACK_MV_COUNT"

# Deterministic platform release packaging. The packager is allowlist-only, so
# repository development material can never leak into a platform archive.
PKG_A=/tmp/lyricmotion-release-a
PKG_B=/tmp/lyricmotion-release-b
rm -rf "$PKG_A" "$PKG_B"
python3 scripts/package_release.py \
  --version "$(cat VERSION)" --platform all --output-dir "$PKG_A" >/dev/null
python3 scripts/package_release.py \
  --version "$(cat VERSION)" --platform all --output-dir "$PKG_B" >/dev/null

for platform in windows linux macos docker; do
  A="$PKG_A/jellyfin-lyric-motion-v$(cat VERSION)-${platform}.zip"
  B="$PKG_B/jellyfin-lyric-motion-v$(cat VERSION)-${platform}.zip"
  cmp "$A" "$B"
  test -s "$A.sha256"
  unzip -t "$A" >/dev/null
done

python3 - "$PKG_A" "$(cat VERSION)" <<'PY'
from pathlib import Path
import sys
import zipfile

root = Path(sys.argv[1])
version = sys.argv[2]
common = {
    'VERSION', 'LYRICG2P_VERSION', 'README.md', 'LICENSE',
    'THIRD_PARTY_NOTICES.md',
    'licenses/DYNAMIC-BACKGROUND-MIT.txt', 'licenses/KAWARP-MIT.txt',
    'src/jellyfin-lyric-motion.js', 'src/jellyfin-lyric-motion.css',
    'src/jellyfin-lyric-romanizer.js',
}
extra = {
    'windows': {'INSTALL-WINDOWS.cmd', 'UNINSTALL-WINDOWS.cmd',
                'scripts/install.ps1', 'scripts/uninstall.ps1'},
    'linux': {'scripts/install.sh', 'scripts/uninstall.sh'},
    'macos': {'scripts/install.sh', 'scripts/uninstall.sh'},
    'docker': {'docker/Dockerfile'},
}
for platform in ('windows', 'linux', 'macos', 'docker'):
    package = f'jellyfin-lyric-motion-v{version}-{platform}'
    archive_path = root / f'{package}.zip'
    with zipfile.ZipFile(archive_path) as archive:
        bad = archive.testzip()
        if bad is not None:
            raise SystemExit(f'{platform}: corrupt release archive member: {bad}')
        actual = {
            name.removeprefix(package + '/')
            for name in archive.namelist()
        }
    expected = common | extra[platform]
    if actual != expected:
        missing = sorted(expected - actual)
        leaked = sorted(actual - expected)
        raise SystemExit(
            f'{platform}: wrong release manifest; missing={missing}, leaked={leaked}'
        )
PY
rm -rf "$PKG_A" "$PKG_B"

# py_compile is only a syntax gate; remove its cache output before repository hygiene checks.
rm -rf scripts/__pycache__ research/__pycache__ tests/__pycache__

# Repository tree hygiene. Targeted sparse coefficients are source text, not external checkpoints.
if find . -type f \( -name '*.onnx' -o -name '*.pt' -o -name '*.pth' -o -name '*.bin' -o -name '*.pyc' -o -name '*.pyo' \) | grep -q .; then
  echo 'Unexpected compiled/model artifact in repository tree' >&2
  exit 1
fi

echo "Jellyfin LyricMotion $(cat VERSION) / LyricG2P $(cat LYRICG2P_VERSION): validation passed"
