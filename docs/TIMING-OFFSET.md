# Lyric timing correction

Starting with v3.1.1, LyricMotion exposes one compact timing chip instead of a permanent row of minus/plus/reset buttons:

```text
[ ⏱ +0.0s ]
```

Opening the chip reveals `-0.1`, `+0.1`, `-0.5`, `+0.5`, one-tap `Sync lyric to now`, `Undo`, and `Reset`.

Positive offset means lyrics appear later. Negative offset means lyrics appear earlier. Audio playback is never sought or altered.

The timing model is intentionally a single constant offset:

```text
source lyric time = media time - offset
```

For word/syllable-synced lyrics, one-tap sync can use the exact selected cue start; for line-synced lyrics it uses the selected line start.

Corrections are persisted against a fingerprint of the exact lyric timeline, including cue positions as well as cue timing. Replacing the lyrics for a song therefore does not automatically inherit a stale timing correction.

For the complete interaction and diagnostics API, see [Smart Timing Assistant](TIMING-ASSISTANT.md).
