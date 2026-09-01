# TTML/QRC to LRC/ELRC

`scripts/ttml_qrc_to_elrc.py` converts timed `.ttml`, `.dfxp`, and `.qrc` lyrics for Jellyfin LyricMotion.

```bash
python scripts/ttml_qrc_to_elrc.py "/music/Artist/Album/01 - Song.ttml"
```

The output is created next to the source and should use the same basename as the audio file.

## Why the output format matters

The converter writes:

- `.elrc` when the source has genuine word or syllable timing;
- `.lrc` when it only has line timing.

This distinction matters. ELRC enables LyricMotion's word sweep, per-word glow, overlapping vocal timing, and dependable instrumental-break progress. A line-timed source saved with an `.elrc` extension still has no word timing and would display poorly, so the converter does not fabricate it.

TTML `ttm:role="x-bg"` vocals are preserved as separate LyricMotion background-vocal lines. Use `--no-background` to omit them or `--plain-background` to retain them without the LyricMotion role token.

## Batch conversion and options

Run without an input to convert supported files in the current directory. Add `--recursive` for subfolders and `--skip-existing` to retain existing sidecars.

```text
-o OUTPUT              choose an output file
--format auto|ttml|qrc force the input format
--replace-alternate    remove an older conflicting .lrc/.elrc after success
--no-background        omit x-bg vocals
--plain-background     keep background lines without the role token
```

Keep the original TTML/QRC file as your lossless master. The converter rejects unsafe XML constructs and invalid timing; check its error output instead of forcing a malformed lyric file.
