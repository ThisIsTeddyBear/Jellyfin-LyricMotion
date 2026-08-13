# TTML to ELRC conversion

Jellyfin LyricMotion includes a recursive TTML converter because a shallow `p/span` conversion loses nested text and vocal roles.

## Basic use

```bash
python scripts/ttml_to_elrc.py "/music/Artist/Album/01 - Song.ttml"
```

The default output is written beside the input with an `.elrc` extension. Use `-o` to choose a different output path.

## Preserved information

- paragraph start, end, and duration;
- nested span text in document order;
- word and syllable start/end timing;
- TTML clock times, offset times, frame times, and tick times;
- whitespace inherited through nested containers;
- `ttm:role="x-bg"`, `background`, and `bg` subtrees as separate lyric lines;
- independent final timestamps for overlapping lines.

## Background-vocal transport

ELRC has no standard field for a vocal role. The converter therefore prefixes a background line with two invisible Unicode format characters before the first enhanced cue. Jellyfin's LRC parser preserves that prefix, and LyricMotion removes it before display while assigning the compact background-vocal lane.

The timing text is otherwise ordinary ELRC. Players that do not understand the marker normally render no visible extra character.

Use `--plain-background` to create separate background lines without the marker, or `--no-background` to omit them.

## Sidecar naming

The audio and ELRC basenames must match:

```text
01 - Song.flac
01 - Song.elrc
```

After replacing the ELRC, refresh the song or its library in Jellyfin. Fully restart a TV/mobile client if it has cached the previous lyric payload.

## Source of truth

Keep the TTML. ELRC can preserve timing and LyricMotion's private background marker, but it cannot express every TTML layout, metadata, agent, or role feature in a standard way.
