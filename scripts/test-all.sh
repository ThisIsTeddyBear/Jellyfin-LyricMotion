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

test "$(cat VERSION)" = "3.2.5"
test "$(cat LYRICG2P_VERSION)" = "6.5.1"
grep -q "const VERSION = '3.2.5'" src/jellyfin-lyric-motion.js
grep -q "const LYRICG2P_VERSION = '6.5.1'" src/jellyfin-lyric-motion.js
grep -q "COPY LYRICG2P_VERSION /tmp/jellyfin-lyricg2p-version" docker/Dockerfile
grep -q 'g2p=${LYRICG2P_VERSION}' docker/Dockerfile
grep -q "const VERSION = '6.5.1'" src/jellyfin-lyric-romanizer.js

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

grep -q '"engine": "6.5.1"' /tmp/lyricg2p651-regression-report.json
grep -q '"engine": "6.5.1"' /tmp/lyricg2p651-confidence-report.json
grep -q '"engine": "6.5.1"' /tmp/lyricg2p651-benchmark.json

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
grep -q "const VERSION = '6.5.1'" "$TMP_WEB/jellyfin-lyric-romanizer.js"
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
cat > "$TMP_FAKE_BIN/mv" <<'SH'
#!/usr/bin/env sh
set -eu
count=$(cat "$LYRICMOTION_TEST_MV_COUNT")
count=$((count + 1))
printf '%s\n' "$count" > "$LYRICMOTION_TEST_MV_COUNT"
if [ "$count" -eq 2 ]; then
  exit 74
fi
exec "$LYRICMOTION_REAL_MV" "$@"
SH
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

# Deterministic release packaging and automatic checksum sidecar. Build-output
# directories must never recurse stale release files back into a new archive.
mkdir -p dist
printf 'stale-release-artifact\n' > dist/stale-release.zip.sha256
python3 scripts/package_release.py --version "$(cat VERSION)" --output /tmp/lyricmotion-package-a.zip >/dev/null
python3 scripts/package_release.py --version "$(cat VERSION)" --output /tmp/lyricmotion-package-b.zip >/dev/null
cmp /tmp/lyricmotion-package-a.zip /tmp/lyricmotion-package-b.zip
test -s /tmp/lyricmotion-package-a.zip.sha256
python3 - <<'PY'
import zipfile
for path in ('/tmp/lyricmotion-package-a.zip', '/tmp/lyricmotion-package-b.zip'):
    with zipfile.ZipFile(path) as archive:
        bad = archive.testzip()
        if bad is not None:
            raise SystemExit(f'Corrupt release archive member: {bad}')
        names = archive.namelist()
        forbidden = (
            '/.github/', '/.gitignore', '/GITHUB-RELEASE.md',
            '/REPO-UPDATE-INSTRUCTIONS.md', '/REPO-BUNDLE-MANIFEST.txt',
            '/docs/RELEASING.md',
        )
        leaked = [name for name in names if any(marker in name for marker in forbidden)]
        leaked += [name for name in names if '/dist/' in name or '/build/' in name]
        if leaked:
            raise SystemExit('Repository/build-only metadata leaked into release ZIP: ' + ', '.join(leaked))
PY
rm -rf dist
rm -f /tmp/lyricmotion-package-a.zip /tmp/lyricmotion-package-b.zip \
      /tmp/lyricmotion-package-a.zip.sha256 /tmp/lyricmotion-package-b.zip.sha256

# py_compile is only a syntax gate; remove its cache output before release hygiene checks.
rm -rf scripts/__pycache__ research/__pycache__ tests/__pycache__

# Release tree hygiene. Targeted sparse coefficients are source text, not external checkpoints.
if find . -type f \( -name '*.onnx' -o -name '*.pt' -o -name '*.pth' -o -name '*.bin' -o -name '*.pyc' -o -name '*.pyo' \) | grep -q .; then
  echo 'Unexpected compiled/model artifact in release tree' >&2
  exit 1
fi
echo "Jellyfin LyricMotion $(cat VERSION) / LyricG2P $(cat LYRICG2P_VERSION): validation passed"
