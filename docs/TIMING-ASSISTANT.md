# Smart lyric timing assistant

Release: `3.1.1`

v3.1.1 keeps lyric timing correction powerful without turning the lyrics page into a control panel. The normal toolbar contains only the Romanization button and one timing chip:

```text
[ A  Romanize ]   [ ⏱ +0.0s ]
```

Opening the timing chip reveals the adjustment tools only when needed.

## Manual adjustment

The popover offers both fine and coarse correction:

```text
-0.1   +0.1   -0.5   +0.5
```

The supported offset range is `-15.0s` to `+15.0s`.

- positive offset makes lyrics appear later;
- negative offset makes lyrics appear earlier;
- audio playback is never sought, stretched, slowed or otherwise retimed.

The displayed and persisted offset is rounded to the nearest tenth of a second with symmetric positive/negative rounding.

## Sync lyric to now

`Sync lyric to now` is the fast automatic correction path.

1. Open the timing chip.
2. Choose `Sync lyric to now`.
3. Wait for a clearly audible lyric or timed word to begin.
4. Tap/click that lyric exactly at its onset.

For word/syllable-synced ELRC or Enhanced LRC, LyricMotion prefers the clicked word's exact cue start. For line-synced lyrics, it uses the line start.

The correction is:

```text
offset = observed media time - source lyric time
```

The result is applied immediately and can be undone.

## Undo and reset

`Undo` swaps back to the previous timing offset for the current session. This protects against an accidental nudge or a badly captured sync point.

`Reset` returns the lyric timeline to the source timing:

```text
offset = 0.0s
```

## Timeline-specific persistence

Timing correction is stored against a fingerprint of the exact lyric timeline. The fingerprint includes line text/timing plus cue character boundaries and cue timing.

If the same song later receives a replacement lyric file, a correction from the old timeline is not blindly carried across. Old preview timing entries without a timeline fingerprint are deliberately ignored for timing safety, while their Romanization preference can still be restored.

## Accessibility and UI state

The timing chip exposes dialog semantics with `aria-haspopup`, `aria-controls`, and `aria-expanded`. A non-zero correction also receives a visible active state. Closing the popover clears its expanded state and cancelling/closing the popover exits lyric-pick mode.

## Diagnostics

```javascript
JellyfinLyricMotion.timing()
JellyfinLyricMotion.setTimingOffset(-0.4)
JellyfinLyricMotion.adjustTimingOffset(0.1)
JellyfinLyricMotion.startTimingSync()
JellyfinLyricMotion.undoTiming()
JellyfinLyricMotion.resetTimingOffset()
```

`timing()` reports the current offset, available fine/coarse steps, limits, whether sync-pick mode is active, the lyric-timeline fingerprint, and the current song preference key.

## What was intentionally removed

The development version of 3.1.1 briefly included three-point calibration and linear timing-drift correction. They were removed before the final 3.1.1 release to keep the interaction understandable and the timing model predictable.

The assistant now solves the common problem well: a source timeline that is consistently early or late. Files whose timing progressively drifts should be corrected at the lyric-source level rather than hidden behind a complex client-side transform.
