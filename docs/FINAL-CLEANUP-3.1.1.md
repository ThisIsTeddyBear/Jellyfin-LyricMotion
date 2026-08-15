# v3.1.1 final cleanup and bug-fix report

This pass finalizes the 3.1.1 timing/UI work on top of the LyricG2P 6 baseline. The goal was to remove three-point calibration completely, keep only the useful constant-offset workflow, make the two top-level lyric controls visually clearer, and use the cleanup to audit timing persistence and lifecycle behavior for hidden defects.

## Final user-facing control surface

The lyrics page now exposes exactly two LyricMotion controls on desktop/mobile:

```text
[ A  Romanize ]   [ ⏱ +0.0s ]
```

The controls are laid out as one compact horizontal row. Both use matched icon tiles, button height, glass treatment, hover/pressed behavior and accessible labels. Romanization uses a simple Latin `A` symbol rather than an ambiguous translation icon. Timing uses the recognizable `⏱` symbol and gains an active visual state when its offset is non-zero.

The timing popover contains only:

```text
-0.1   +0.1   -0.5   +0.5
Sync lyric to now
Undo   Reset   Close
```

There is no third permanent control and no three-point calibration UI.

## Removed completely

The development-only multi-anchor/drift feature was removed from the production implementation rather than merely hidden:

- three-point calibration UI;
- anchor arrays and calibration suggestion state;
- Theil-Sen/pairwise slope fitting;
- drift-rate constants and clamping;
- affine timing transform;
- drift persistence fields;
- calibration apply action;
- multi-pick mode;
- calibration CSS classes;
- `startTimingCalibration()` and `applyTimingCalibration()` public APIs;
- production tests for affine drift fitting.

The main runtime changes are net-negative in size. Relative to the earlier 3.1.1 development baseline, `src/jellyfin-lyric-motion.js` drops from 310,944 bytes to 298,853 bytes. The JS diff removes about 501 lines while adding about 123 lines for the simplified timing path, safety fixes and UI state handling.

## Timing model

The final timing model is constant offset only:

```text
source lyric time = media time - offset
```

Positive offset delays lyrics. Negative offset advances them. Playback itself is never sought or retimed.

`Sync lyric to now` uses the exact clicked word cue start when Jellyfin supplies word/syllable cues; otherwise it uses the clicked line start. It measures the unadjusted media timeline, computes an absolute offset, rounds to the nearest tenth of a second, persists it, and exits pick mode.

## Bugs found and fixed during cleanup

### 1. Negative half-step rounding asymmetry

The previous clamp used JavaScript `Math.round(value * 10) / 10`. JavaScript rounds exact negative ties toward positive infinity, so a value such as `-1.55` could become `-1.5` while `+1.55` becomes `+1.6`.

The new implementation rounds the magnitude and then reapplies the sign. Positive and negative offsets now behave symmetrically:

```text
+1.55 -> +1.6
-1.55 -> -1.6
```

This matters directly for one-tap sync because its measured offset can land near a half-tenth boundary.

### 2. Unfingerprinted preview timing could leak to a changed lyric timeline

The previous restore condition accepted a stored timing correction when its `timingFingerprint` was empty. That was convenient for migration, but it could apply an old offset to a newly replaced lyric file for the same song.

The final 3.1.1 behavior is safer:

- Romanization preference can still restore independently;
- timing correction restores only when a non-empty fingerprint exactly matches the current timeline;
- old preview timing without a fingerprint falls back to source timing.

### 3. Timeline fingerprint omitted cue `EndPosition`

The fingerprint contained cue start position and cue start/end time but not the cue's character end position. Two structurally different word/syllable layouts could therefore look more similar than they should.

`EndPosition` is now part of every cue signature.

### 4. Timing chip accessibility state could remain expanded after closing

The close path updated the timing chip while the popover still existed, then removed the popover. That could leave `aria-expanded="true"` after the dialog had actually closed.

The close path now refreshes the chip after the popover reference is cleared.

### 5. Top-level control state was visually inconsistent

Romanization and timing used different icon sizing and standalone geometry. The host also stacked controls vertically. The final CSS uses a compact horizontal two-control strip, matched icon tiles, consistent sizing and a visible non-zero timing state.

## Lifecycle and API cleanup

Timing pick mode is now a single boolean state rather than a string with `single`/`multi` branches. Closing/removing the timing popover always removes the capture listener and pick-mode CSS class.

The public timing API is reduced to the operations that still exist:

```javascript
JellyfinLyricMotion.timing()
JellyfinLyricMotion.setTimingOffset(-0.4)
JellyfinLyricMotion.adjustTimingOffset(0.1)
JellyfinLyricMotion.startTimingSync()
JellyfinLyricMotion.undoTiming()
JellyfinLyricMotion.resetTimingOffset()
```

## Validation

The final source tree passes:

```text
Stock TV bypass                         148
Offline LyricG2P                        342
LyricG2P 6 context/provenance           666
Indic lyric-quality polish            2,951
Offline isolation/stress              2,027
Romanization robustness               7,486
Compact one-tap timing assistant         83
Runtime races/interception               59
Full-experience audit                    79
Overlap/background                       19
Multiscript rendering                   477
Full-audit optimization                  36
-------------------------------------------
JavaScript assertions                14,373

TTML/Python tests                        16
Romanization corpus-tool tests            1
Installer/uninstaller checks             47
```

Additional static validation:

- all shipped JavaScript passes `node --check`;
- Python tooling compiles;
- POSIX shell scripts pass `sh -n`;
- no production calibration/drift identifiers remain under `src/`;
- no active `TODO`, `FIXME`, `HACK`, `eval`, `new Function`, or direct `innerHTML`/`outerHTML` assignment matches were found in `src/` or `scripts/`;
- the release ZIP rebuild is deterministic;
- the extracted release package passes a POSIX install -> uninstall smoke test.

Windows PowerShell 5.1 execution remains covered by the repository's Windows GitHub Actions gate because this local build environment is Linux.
