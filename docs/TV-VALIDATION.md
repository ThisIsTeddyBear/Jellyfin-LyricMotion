# TV and webOS validation

The TV renderer is deliberately different from the desktop renderer. Jellyfin commonly renders TV lyric lines as focusable buttons and advances focus on a coarser media update than LyricMotion's animation clock.

## Expected behavior

- Jellyfin's newly focused/current line commits before its word wipe begins.
- The 90 ms visual arm prevents the wipe from appearing ahead of the focused line.
- Late host timing is repaid gradually with a bounded 1.45x visual catch-up.
- A missing/stale host signal falls back after a bounded wait rather than freezing lyrics.
- Concurrent older lines continue with real media time and leave only at their own end.
- Same-start lead and background lines share the presentation clock.
- TV line movement is opacity-only and native button casing is neutralized.
- Hindi, Punjabi, Malayalam, Arabic, and joining scripts do not receive per-word transforms.

## Test checklist

1. Fully terminate and reopen the Jellyfin TV app after installing.
2. Test normal ELRC line changes for early wipe or delayed focus.
3. Test a song with two overlapping lead lines.
4. Test a converted `x-bg` background vocal that begins with a lead line.
5. Seek backward and forward across those boundaries.
6. Pause and resume during a sustained word.
7. Test Hindi, Punjabi, and Malayalam lines with top/bottom marks and conjuncts.
8. Watch for focus rectangles, trimmed final glyphs, white seams, or line-boundary stutter.

## Diagnostics

```javascript
JellyfinLyricMotion.diagnostics()
```

Useful fields include `activeLines`, `simultaneousActiveLines`, `maxSimultaneousLines`, `tvHostLine`, `tvPresentationLine`, `tvPendingLine`, `tvActivationSource`, `tvActivationFallbacks`, `tvVisualDebtMs`, `performanceProfile`, `measuredFps`, `atomicWordCount`, and `scriptProfileCounts`.

For a report, include the LG/webOS firmware, Jellyfin Server/Web versions, playback position, lyric format, language, and diagnostics output.
