#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$ROOT_DIR"

node --check src/jellyfin-lyric-motion.js
node --check src/jellyfin-lyric-romanizer.js
node scripts/test_stock_tv_bypass.js
node scripts/test_romanization.js
node scripts/test_indic_polish.js
node scripts/test_offline_romanization.js
node scripts/test_romanization_robustness.js
node scripts/test_timing_controls.js
node scripts/test_runtime_races.js
node scripts/test_full_experience_audit.js
node scripts/test_overlap_background.js
node scripts/test_script_safety.js
node scripts/test_audit_optimizations.js
python3 scripts/test_ttml_to_elrc.py
sh scripts/test_installers.sh

echo "All LyricMotion local validation passed."
