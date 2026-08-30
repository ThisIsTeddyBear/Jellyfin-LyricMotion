# TTML/QRC to LRC/ELRC conversion

Jellyfin LyricMotion includes a recursive TTML/QRC converter because a shallow `p/span` conversion loses nested text and vocal roles. It detects whether a source has actual word/syllable timing: line-synchronised sources are written as standard `.lrc`; word-synchronised sources are written as `.elrc`.

## Basic use

```bash
python scripts/ttml_qrc_to_elrc.py "/music/Artist/Album/01 - Song.ttml"
```

The default output is written beside the input. It uses `.lrc` when every vocal line is line-synchronised, otherwise `.elrc`; mixed sources use `.elrc` but keep their line-only rows as normal LRC rows. Use `-o` to choose a different output path, or `--replace-alternate` to remove an older conflicting default `.lrc`/`.elrc` sidecar after a successful conversion. `.qrc` and `.dfxp` inputs are auto-detected too.

With no input argument, the converter batch-converts every supported source in the current directory. `--recursive` includes subdirectories and `--skip-existing` leaves an existing `.lrc` or `.elrc` untouched. Sources in the same directory with the same basename are deliberately not batch-converted because they would otherwise target the same output name; use `-o` on each one instead.

## Preserved information

- paragraph start, end, and duration;
- nested span text in document order;
- word and syllable start/end timing;
- TTML clock times, offset times, frame times, and tick times;
- whitespace inherited through nested containers;
- `ttm:role="x-bg"`, `background`, and `bg` subtrees as separate lyric lines;
- independent final timestamps for overlapping lines.

## Background-vocal transport

LRC/ELRC has no standard field for a vocal role. The converter prefixes a background line with the ASCII token `[ak:bg]` immediately after its line timestamp. Unlike Unicode format controls, this survives Jellyfin server parsing. LyricMotion removes it before display and corrects cue positions by the token length. Background-role lines retain their own timing and use the same sweep, glow, and layout treatment as every other lyric line, with a smaller type size to identify the role.

The remaining timing text uses the selected LRC or ELRC format. The token may be visible in players that do not run LyricMotion, which is the necessary tradeoff for reliable transport through Jellyfin.

Use `--plain-background` to create separate background lines without the token, or `--no-background` to omit them.

## Sidecar naming

The audio and LRC/ELRC basenames must match:

```text
01 - Song.flac
01 - Song.lrc   # line-synchronised source
# or
01 - Song.elrc  # word/syllable-synchronised source
```

After replacing the LRC/ELRC sidecar, refresh the song or its library in Jellyfin. Fully restart a TV/mobile client if it has cached the previous lyric payload.

## Source of truth

Keep the original TTML, DFXP, or QRC source. LRC/ELRC can preserve timing and LyricMotion's private background token, but it cannot express every source layout, metadata, agent, or role feature in a standard way.

## Safety and timing validation

The converter refuses TTML/QRC inputs larger than 64 MiB and rejects TTML documents containing DTD/entity declarations before XML parsing. Frame/tick rates and parsed clock values must be finite and non-negative; malformed minute/second/frame fields fail conversion rather than creating corrupt timestamps.

When both `end` and `dur` are present, the converter uses the earlier effective end. Child timing is also clamped to an inherited parent end. Apple-style nested lyric span timestamps remain treated as absolute media times, matching the source format this converter targets.

LRC/ELRC output is written to a same-directory temporary file, flushed, then atomically replaces the destination only after the whole conversion succeeds. Existing output therefore survives parse/conversion/write failures instead of being left half-written.
