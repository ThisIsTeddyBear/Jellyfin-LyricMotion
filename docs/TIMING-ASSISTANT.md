# Smart lyric timing assistant

Release: `3.2.5`

The timing UI is intentionally compact. The normal toolbar contains an icon-only Romanization toggle and a timing chip with a clock icon plus the current offset. Opening the timing chip reveals the adjustment tools only when needed.

## Manual adjustment

The popover keeps only the fast controls:

```text
-0.1   +0.0s   +0.1
Sync lyric to now
Reset
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
4. Tap/click that lyric exactly at its onset. The outside-click auto-dismiss intentionally waits for this sync click instead of cancelling pick mode on pointer-down.

For word/syllable-synced ELRC or Enhanced LRC, LyricMotion prefers the clicked word's exact cue start. For line-synced lyrics, it uses the line start.

The correction is:

```text
offset = observed media time - source lyric time
```

The tap is sampled from the exact HTML media clock, not LyricMotion's projected animation clock, then rounded to the supported tenth-second grid. The result is applied immediately and the compact popover closes.

After the sync click, LyricMotion explicitly centers the selected line and resumes playback auto-follow. This is required because the timing capture suppresses Jellyfin's normal lyric click to prevent an uncorrected seek. Manual wheel/touch scrolling temporarily pauses automatic centering, while any explicit lyric click resumes it immediately.

## Reset

`Reset` returns the lyric timeline to the source timing:

```text
offset = 0.0s
```

## Timeline-specific persistence

Timing correction is stored against a fingerprint of the exact lyric timeline. The fingerprint includes line text/timing plus cue character boundaries and cue timing.

If the same song later receives a replacement lyric file, a correction from the old timeline is not blindly carried across. Old preview timing entries without a timeline fingerprint are deliberately ignored for timing safety, while their Romanization preference can still be restored.

## Accessibility and UI state

The timing chip exposes dialog semantics with `aria-haspopup`, `aria-controls`, and `aria-expanded`. A non-zero correction also receives a visible active state. Clicking outside the popover or pressing Escape closes it and exits lyric-pick mode.

## Diagnostics

```javascript
JellyfinLyricMotion.timing()
JellyfinLyricMotion.setTimingOffset(-0.4)
JellyfinLyricMotion.adjustTimingOffset(0.1)
JellyfinLyricMotion.startTimingSync()
JellyfinLyricMotion.undoTiming()
JellyfinLyricMotion.resetTimingOffset()
```

`timing()` reports the current offset, available step sizes, limits, whether sync-pick mode is active, the lyric-timeline fingerprint, and the current song preference key.

## What was intentionally removed

The development version of 3.1.1 briefly included three-point calibration and linear timing-drift correction. They were removed before the final 3.1.1 release to keep the interaction understandable and the timing model predictable.

The assistant now solves the common problem well: a source timeline that is consistently early or late. Files whose timing progressively drifts should be corrected at the lyric-source level rather than hidden behind a complex client-side transform.
