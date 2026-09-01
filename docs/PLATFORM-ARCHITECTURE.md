# Features and platform support

Desktop and mobile run the enhanced LyricMotion renderer: ELRC/LRC timing, karaoke motion, background and overlapping vocals, shaping-safe multilingual text, Dynamic Background, timing correction, and optional Romanization.

Text shaping is preserved for complex and RTL scripts. Safe grapheme/akshara boundaries can animate independently; joining and unsafe complex runs stay whole so rendering remains correct.

TV-class clients intentionally use Jellyfin's stock lyric UI. LyricMotion exits before installing playback, network, or lyric-DOM hooks on a detected TV.
