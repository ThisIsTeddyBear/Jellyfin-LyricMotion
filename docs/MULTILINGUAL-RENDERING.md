# Multilingual rendering

LyricMotion preserves browser text shaping for every script. Latin and safely segmented scripts, including major Indic scripts, can use detailed grapheme/akshara motion. Combining marks, viramas, join controls, Hangul clusters, and emoji sequences remain intact.

Arabic-family, RTL, and other joining or unsafe complex runs use a whole-shaped animation path to preserve contextual glyph forms. This keeps the source timing and readable text without breaking script shaping.
