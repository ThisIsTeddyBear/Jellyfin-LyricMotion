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

Run the complete suite before submitting.

Linux, macOS, or Git Bash:

```bash
sh scripts/test-all.sh
```

Windows PowerShell:

```powershell
.\scripts\test-all.ps1
```

Important individual contracts include:

```bash
node --check src/jellyfin-lyric-motion.js
node --check src/jellyfin-lyric-romanizer.js
node tests/lyricg2p65.test.js
node tests/lyricg2p651-hybrid.test.js
node tests/runtime-smoke.test.js
node tests/runtime-core.test.js
node tests/instrumental-breaks.test.js
python3 tests/ttml_converter_test.py
python3 tests/research_pipeline_test.py
python3 tests/release_static_test.py
```

Test normal LRC, enhanced timing, seeking, pause/resume, overlapping lines, background vocals, RTL text, at least one Indic/contextual script, and a space-less timed script such as CJK. The stock-TV bypass contract must pass so detected TV-class clients never initialize LyricMotion.

## Romanization research

The browser runtime must remain fully offline. Networked lyric/provider tooling belongs only under `research/` and must never be imported by `src/`.

For LyricG2P quality work, prefer corpus-backed changes over adding whole-song or whole-line exceptions. The release tree ships only reproducible local/offline research helpers. A typical dataset workflow is:

```bash
python3 scripts/import-dakshina.py /path/to/dakshina /tmp/dakshina.tsv
python3 scripts/prepare-lyricg2p-dataset.py /tmp/dakshina.tsv /tmp/lyricg2p-splits
node scripts/evaluate-lyricg2p65.js /tmp/lyricg2p-splits/test.tsv /tmp/evaluation.json
node scripts/calibrate-lyricg2p65-confidence.js /tmp/lyricg2p-splits/test.tsv /tmp/calibration.json
```

Provider/network corpus acquisition is intentionally not part of the release package. Keep any such tooling isolated from `src/` and subject to the source dataset's redistribution terms.

Do not commit fetched commercial lyrics or third-party datasets unless redistribution is explicitly permitted by their licenses. Keep training/evaluation data out of release packages.

## Release/version changes

Public releases use Semantic Versioning and a matching Git tag:

```text
VERSION = 3.2.5
tag     = v3.2.5
notes   = CHANGELOG.md
```

The release workflow rejects a tag whose version does not exactly match `VERSION`.

## Release process

Maintainers should run the complete gate before tagging:

```bash
sh scripts/test-all.sh
```

The repository contains the maintainer-only release procedure in `docs/RELEASING.md`; that file is intentionally excluded from public release ZIPs. Do not force-move a published release tag to replace an existing artifact.
