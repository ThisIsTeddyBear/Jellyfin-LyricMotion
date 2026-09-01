# Instrumental-break progress

For a verified vocal gap of at least two seconds, LyricMotion shows one animated note before the next lyric. Its fill follows media time, so pause, seek, and playback-rate changes stay synchronized. Select the note to seek to the start of the break.

The feature requires a trustworthy previous vocal end: an ELRC end timestamp or an explicit line/cue end. Standard LRC usually only gives line starts, so LyricMotion does not guess and will not create false instrumental breaks.

Background and overlapping vocals are included when detecting gaps; a break begins only after all relevant vocals have ended.
