# Multilingual rendering and Classic Bloom

LyricMotion keeps each visible lyric word as a shaped text run so browser font shaping remains authoritative. The renderer never converts Indic letters into separate visual characters merely to animate them.

## Unified glow behavior

The current renderer removes the old practical distinction where Latin text received the richer staggered Classic Bloom while many shaped scripts fell back to a visibly flatter whole-word effect.

For scripts with safe grapheme/akshara boundaries, the motion overlay now uses the same per-grapheme Classic Bloom energy model as Latin. This includes Devanagari, Bengali/Assamese, Gurmukhi, Gujarati, Odia, Tamil, Telugu, Kannada, Malayalam, Sinhala and other non-joining scripts handled safely by the grapheme segmenter.

An Indic **akshara remains intact**. `Intl.Segmenter` is used when available, and the fallback segmenter refuses boundaries:

- before combining marks/vowel signs;
- after Indic viramas;
- around ZWJ/ZWNJ join controls;
- inside Hangul Jamo clusters;
- inside regional-indicator emoji pairs.

That means a Malayalam/Devanagari conjunct can glow as one shaped unit rather than being broken into invalid pieces.

## Joining-script safety

Arabic-family joining, explicit join-control sequences and unknown complex profiles remain a shaped whole run. They still receive the same Classic Bloom layers/energy, but not a DOM split that could break cursive joining or contextual glyph forms.

This is intentional: visual parity does not justify corrupt shaping.

## Directionality

Word direction follows the first strong character. RTL words use isolated bidi handling and the mirrored wipe direction while preserving source cue timing.

## Fallback behavior

If exact glyph geometry cannot be measured or the script/profile is unsafe for per-grapheme overlay, LyricMotion falls back to the whole-word motion path. The source word stays visible and correctly shaped.
