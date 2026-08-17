# Lyric timing correction

Starting with v3.1.1, LyricMotion exposes one compact timing chip instead of a permanent row of minus/plus/reset buttons:

```text
[ ⏱ +0.0s ]
```

Opening the chip reveals `-0.1`, the current offset, `+0.1`, one-tap `Sync lyric to now`, and `Reset`.

Positive offset means lyrics appear later. Negative offset means lyrics appear earlier. Changing the timing correction itself never seeks or alters playback.

Starting with v3.2.4, an explicit lyric click does account for that correction. If a line starts at source time `60.0s` and the saved correction is `+2.0s`, clicking that line seeks to media time `62.0s`, which is the moment the corrected line is displayed. Negative offsets work in the opposite direction. The seek calculation uses the same source timeline as the renderer, including Jellyfin `StartTimeTicks` remapping when present.

The timing model is intentionally a single constant offset:

```text
source lyric time = media time - offset
```

For word/syllable-synced lyrics, one-tap sync can use the exact selected cue start; for line-synced lyrics it uses the selected line start.

Corrections are persisted against a fingerprint of the exact lyric timeline, including cue positions as well as cue timing. Replacing the lyrics for a song therefore does not automatically inherit a stale timing correction.

For the complete interaction and diagnostics API, see [Smart Timing Assistant](TIMING-ASSISTANT.md).


## Click-to-seek contract

LyricMotion preserves Jellyfin's native lyric-click behavior when the timing correction is exactly `0.0s`. When a nonzero correction is active, it captures the lyric click before Jellyfin's unadjusted handler and resolves the corrected media target from the current rendered source timeline. If no local media element can be resolved, LyricMotion does not suppress the stock lyric click.

The synthetic instrumental `♪` has its own seek target and always jumps to the start of that planned instrumental gap.
