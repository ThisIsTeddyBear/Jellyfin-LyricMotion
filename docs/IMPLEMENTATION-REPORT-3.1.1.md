# v3.1.1 implementation report

## Baseline

Development started from the audited v3.1.0 source/release tree. The renderer, stock-TV bypass, request-race hardening, lazy ICU fallback, boundary cache, multilingual Classic Bloom and installer fixes remain intact.

## Romanization changes

### LyricG2P 6 architecture surface

LyricG2P moves from 5.1.0 to 6.0.0. Production output remains deterministic, whole-line and offline, while the engine exposes a richer analysis surface:

- mixed-script span segmentation;
- language labels per span;
- neighboring span context;
- code-switch detection;
- phoneme-like token diagnostics;
- morphology suffix evidence;
- path-aware confidence;
- weak-span count;
- deterministic candidate ranking;
- local `explain()` output.

The renderer still uses the stable `romanize()`, `canRomanize()` and `mapBoundary()` contract.

### Learned-model policy

No neural weights are shipped in v3.1.1. The source tree contains a corpus/evaluation workflow so any future learned component must demonstrate held-out quality improvement, acceptable browser performance and license-safe distribution before it is eligible for the runtime.

## Dataset workflow

The maintainer-supplied `am_lyrics_fetch.py` is retained under `research/`. Development scripts can extract native/Roman pairs, reject partial native-script targets, deduplicate examples, prepare deterministic train/dev/test splits and evaluate exact match plus character error rate. Research/provider code is not imported by the Jellyfin runtime.

## Final timing design

The final 3.1.1 timing model is intentionally simple:

```text
source lyric time = media time - offset
```

The visible toolbar has two top-level controls only:

```text
[ A  Romanize ]   [ ⏱ +0.0s ]
```

The timing popover provides:

- ±0.1 second fine nudging;
- ±0.5 second coarse nudging;
- one-tap `Sync lyric to now` using exact word cue starts where available;
- session undo;
- reset.

Three-point calibration and affine drift correction existed in an internal development iteration but were removed before finalizing 3.1.1. Their constants, state, persistence fields, runtime algorithms, public APIs, CSS and production tests were removed as well.

### Timing robustness fixes found during cleanup

- Negative half-step values now round symmetrically rather than inheriting JavaScript `Math.round()`'s toward-positive-infinity tie behavior.
- Stored timing correction is only restored when a non-empty timeline fingerprint exactly matches the current lyric timeline. Unfingerprinted old preview timing is ignored.
- The timeline fingerprint now includes `EndPosition` for each cue, not only cue start position and time.
- The timing chip updates `aria-expanded` after the popover is removed.
- The two top-level lyric tools share matched icon tiles and geometry, with a clear non-zero timing active state.

## Validation

The full existing stock-TV, Romanization, language-quality, Unicode robustness, runtime race, overlap/background, multiscript rendering, TTML and installer suites remain active. The timing contract was rewritten around the constant-offset/one-tap design and includes explicit regression checks that calibration/drift code is absent from the production runtime.

The end-user package remains self-contained and offline. Development-only corpus collection remains under `research/` and is excluded from the release ZIP.

## Final release footprint and validation

Final runtime source sizes after removing calibration/drift code and compacting the two-button UI:

| Runtime asset | Final v3.1.1 |
|---|---:|
| `src/jellyfin-lyric-romanizer.js` | 828,852 B |
| `src/jellyfin-lyric-motion.js` | 298,853 B |
| `src/jellyfin-lyric-motion.css` | 41,072 B |
| combined runtime source | 1,168,777 B |

The complete local suite passes **14,373 JavaScript assertions**, 16 TTML/Python tests, 1 Romanization-corpus tool test, and 47 installer/uninstaller checks. All shipped JavaScript passes `node --check`; Python tooling compiles; POSIX shell scripts pass `sh -n`; and the runtime/scripts contain no active `TODO`, `FIXME`, `HACK`, `eval`, `new Function`, or direct `innerHTML`/`outerHTML` assignment matches.
