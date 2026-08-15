# Contributing

Thanks for helping improve Jellyfin LyricMotion.

## Bug reports

Include:

- Jellyfin Server version
- Jellyfin Web version
- OS / container image
- browser/WebView and version
- lyric type (plain LRC, ELRC, converted TTML)
- language/script when the issue involves Romanization or shaping
- private-window reproduction result
- `JellyfinLyricMotion.diagnostics()` where useful

For Romanization defects, a short native-text excerpt plus the actual and expected Romanization is ideal. Do not attach copyrighted commercial audio or full lyric files unless you have permission to redistribute them.

## Pull requests

LyricMotion should remain a Jellyfin Web rendering enhancement. Keep playback ownership inside Jellyfin and keep Romanization fully local/on-device.

Run the complete suite before submitting:

```bash
sh scripts/test-all.sh
```

Important individual contracts include:

```bash
node --check src/jellyfin-lyric-motion.js
node --check src/jellyfin-lyric-romanizer.js
node scripts/test_romanization.js
node scripts/test_lyricg2p6_context.js
node scripts/test_indic_polish.js
node scripts/test_offline_romanization.js
node scripts/test_romanization_robustness.js
node scripts/test_timing_controls.js
node scripts/test_stock_tv_bypass.js
node scripts/test_runtime_races.js
node scripts/test_full_experience_audit.js
node scripts/test_overlap_background.js
node scripts/test_script_safety.js
node scripts/test_audit_optimizations.js
python3 scripts/test_ttml_to_elrc.py
python3 scripts/test_romanization_corpus_tools.py
sh scripts/test_installers.sh
```

Test normal LRC, enhanced timing, seeking, pause/resume, overlapping lines, background vocals, RTL text, at least one Indic/contextual script, and a space-less timed script such as CJK. The stock-TV bypass contract must pass so detected TV-class clients never initialize LyricMotion.

## Romanization research

The browser runtime must remain fully offline. Networked lyric/provider tooling belongs only under `research/` and must never be imported by `src/`.

For LyricG2P quality work, prefer corpus-backed changes over adding whole-song or whole-line exceptions. The development workflow is:

```bash
python research/fetch_corpus_batch.py research/corpus-manifest.example.csv --output-dir research/corpus/raw --deep
python scripts/extract_romanization_pairs.py research/corpus/raw --output research/corpus/provider-pairs.tsv
python scripts/prepare_lyricg2p_dataset.py research/corpus/provider-pairs.tsv --out-dir research/corpus/splits --languages ml,ta,te,kn,pa,hi
node scripts/evaluate_romanization_corpus.js research/corpus/splits/lyricg2p.test.tsv
```

Do not commit fetched commercial lyrics or third-party datasets unless redistribution is explicitly permitted by their licenses. Keep training/evaluation data out of release packages.

## Release/version changes

Public releases use Semantic Versioning and a matching Git tag:

```text
VERSION = 3.2.0
tag     = v3.2.0
notes   = docs/RELEASE-NOTES-3.2.0.md
```

The release workflow rejects a tag whose version does not exactly match `VERSION`.

## Release process

Maintainers should run the complete gate before tagging:

```bash
sh scripts/test-all.sh
```

The current manual/tag-driven release procedure is documented in [`docs/RELEASING.md`](docs/RELEASING.md). Do not force-move a published release tag to replace an existing artifact.
