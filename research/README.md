# LyricG2P 6.5.1 Research Assets

These files support offline evaluation and model decisions. They are not loaded during Jellyfin playback.

## Current 6.5.1 reports

- `lyricg2p651-regression-report.json` — 28-row reviewed regression seed evaluation.
- `lyricg2p651-confidence-smoke.json` — evidence-score calibration smoke report.
- `lyricg2p651-benchmark-node.json` — median local Node 22 benchmark for normal/detailed/ranker paths.
- `lyricg2p651-optimization-benchmark.json` — five-fresh-process frozen-vs-optimized 6.5.1 performance comparison.
- `lyricg2p651-cross-build-benchmark.json` — local benchmark comparing base 6.5.0, alternate 6.5 and merged 6.5.1.
- `lyricg2p651-differential-audit.json` — output comparison across 1,498 extracted non-ASCII source keys.

The regression seed is intentionally small and reviewable. It is not a claim of overall language accuracy.

## Corpus/evaluation tooling

- `../scripts/import-dakshina.py` imports Dakshina-style lexicons while retaining multiple references/attestation evidence.
- `../scripts/prepare-lyricg2p-dataset.py` creates leakage-aware train/dev/test partitions using token/lemma/song and optional artist grouping.
- `../scripts/evaluate-lyricg2p65.js` reports exact, CER, top-k/style-normalized and error-taxonomy metrics.
- `../scripts/calibrate-lyricg2p65-confidence.js` analyzes evidence-score calibration without pretending those scores are probabilities.

Public datasets are not redistributed here. Obtain them from their official projects and comply with their licenses/terms.

## Runtime research

- `../scripts/benchmark-lyricg2p651.js` benchmarks the current 6.5.1 hot path, detailed diagnostics and hybrid ranker.
- `train_tiny_transformer.py` remains a research-only native→Roman experiment harness with separate source and Roman target vocabularies.

No full learned transliteration checkpoint is bundled in the player.

## Targeted learned components

6.5.1 includes two compact sparse logistic schwa coefficient tables in the Romanizer for Hindi/Punjabi diagnostics/candidate research. The normal `romanize()` playback path remains deterministic. The embedded model metrics are retained as source-provenance metadata and are not independently reproduced by the 6.5.1 release package.
