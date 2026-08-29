# Instrumental Break Progress

Release: Jellyfin LyricMotion `3.2.7`

Jellyfin LyricMotion 3.2.5 uses a synthetic vector `♪` row for real instrumental gaps between timed lyric lines. The symbol is intentionally sparse: one note per qualifying break, with a bottom-to-top fill that reaches 100% exactly when the next lyric begins.

## User-visible behavior

- Minimum qualifying gap: **2.0 seconds**.
- The row is inserted immediately before the next real lyric line.
- The completed lyric becomes `past` during the break.
- The upcoming lyric remains `future` until its exact start tick.
- The note fills bottom-to-top from the gap start to the next lyric start.
- The fill uses a restrained white/ice-blue glow and does not reuse the configurable Classic Bloom lyric accent.
- A long instrumental section still uses one continuous note.
- A qualifying intro before the first lyric uses the same indicator.
- Clicking/tapping the note seeks to the start of that instrumental section.
- Keyboard activation is supported with Enter or Space while the note is focused.
- No synthetic note is created after the final lyric because there is no upcoming lyric to count toward.

## Timing authority

The feature is deliberately conservative. An internal break is eligible only when LyricMotion has a trustworthy end for the preceding vocal block.

Accepted end evidence:

1. an explicit lyric `End` value;
2. an explicit end on the terminal textual cue; or
3. the final empty enhanced timestamp emitted at `text.length` when the TTML/QRC converter produces ELRC.

An earlier cue's explicit end does **not** prove that the complete line has ended. A malformed end that occurs before the final vocal start is also rejected.

Standard LRC commonly has only line start times. In that case LyricMotion does not guess when the singer stopped, so it does not synthesize an internal instrumental indicator. This is intentional to avoid false positives and repeated note popups during ordinary line spacing.

The intro is different because its start boundary is the media timeline origin. If the first actual lyric starts at least two seconds into the song, the intro can be represented without guessing a previous vocal end.

## Background and overlapping vocals

Instrumental breaks are planned over the complete vocal timeline, not just lead lines.

If a background/response vocal continues after the lead line ends, the break starts only after that background vocal ends. If any relevant vocal overlaps the upcoming lyric, the break is cancelled.

Lines beginning on the same tick are treated as one vocal-start group, preventing duplicate synthetic rows for simultaneous lead/background content.

## Pause, seek, and playback-rate behavior

There is no independent CSS timer for the fill.

For a gap `[start, end)`:

```text
progress = clamp((currentTimelineTick - start) / (end - start), 0, 1)
```

The runtime derives this value from the same lyric timeline used for karaoke synchronization. Therefore:

- pause leaves the value frozen;
- seek snaps to the correct fill immediately;
- playback-rate changes remain synchronized;
- the next lyric owns the exact `end` tick;
- user lyric timing offset shifts the whole timeline without changing the gap duration.

Normal line-synced LRC remains at the low-cost 20 fps path. While a synthetic instrumental indicator is active, the renderer can use the selected performance-profile cadence so the fill remains visually smooth. Paused playback stays on the paused low-frequency path because the fill is static.

## DOM integration

The synthetic row uses:

```text
.ak-instrumental-gap-line
```

It deliberately does **not** use Jellyfin's `.lyricsLine` class. This keeps Jellyfin's original line indexes, click behavior and timing-selection assumptions unchanged.

The row remains in document flow at all times. Before the gap it is a subdued empty future note; during the gap it becomes the active visual focus; afterward it remains a subdued fully filled past note. Reserving the row prevents the upcoming lyric from jumping vertically and removes popup/disappearance behavior.

The synthetic row itself remains pointer-inert so the empty horizontal row does not become a giant hit target. The visible `.ak-instrumental-note` is interactive: it has button semantics, keyboard focus, Enter/Space activation, and seeks to the exact start tick of that instrumental gap.

## Rendering

The note is inline SVG geometry. A wave-shaped liquid boundary rises from the bottom of the vector to the top, so the bright layer is clipped by both the note silhouette and the current liquid surface. The surface oscillates gently while the break is active, then its amplitude progressively decays as the next vocal approaches. A restrained SVG drop shadow provides the outer glow. Future and past note rows remain dimly visible so activation is a smooth lyric-state transition rather than a popup.

Both fill height and wave phase are derived from playback time, so seeking reconstructs the same geometry rather than restarting an animation clock. Reduced-motion keeps the bottom-to-top timing fill but uses a flat liquid surface and suppresses decorative scale motion.

## Diagnostics

From the browser console:

```javascript
JellyfinLyricMotion.instrumentalBreaks()
```

returns the threshold, number of detected gaps, active gap, current progress, longest break and gap boundaries.

The same data is included under:

```javascript
JellyfinLyricMotion.diagnostics().instrumentalBreaks
```

## Behavioural safeguards

The renderer accounts for:

- 2.0-second threshold behavior;
- suppression at 1.99 seconds;
- intro gaps;
- long single-note breaks;
- background-vocal postponement;
- overlap cancellation;
- simultaneous starts;
- unknown LRC endings;
- terminal cue validation;
- malformed end-before-final-vocal cases;
- empty timed rows;
- line-state ownership during a break;
- future/active/past note-state restoration across seeks;
- SVG wave/liquid geometry staying inside the 64 × 80 note viewport;
- deterministic wave phase at identical media time;
- progressive wave flattening near the next vocal;
- flat reduced-motion rendering;
- pause/seek-derived fill state;
- exact gap-end handoff to the upcoming lyric.

These safeguards keep the note row derived from the lyric timeline rather than an independent animation clock.
