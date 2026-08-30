# Platform architecture

## Desktop and mobile

LyricMotion runs the enhanced ELRC/LRC renderer: timing, overlap/background
vocals, multilingual shaping-safe paint, Classic Bloom, adaptive atmosphere and
lifecycle/race guards.

The renderer is language-agnostic at the timing/effect layer. Script-specific
handling exists only where text shaping or direction requires it; it does not
remove swipe/glow/motion features. See `MULTILINGUAL-RENDERING.md`.

## Romanization on desktop/mobile

Romanization is an optional Google-backed display layer over the same captured Jellyfin lyric payload. Requests begin only after a native-script song is detected and the user enables the view. Switching modes rebuilds cue character positions but never changes media/cue time. See `GOOGLE-ROMANIZATION.md`.

## TV-class clients

LyricMotion does not initialize on identifiable TV platforms. Known TV and
living-room client signatures are detected at bootstrap, before runtime hooks or
DOM changes are installed. Pointer/touch capability alone is deliberately not a
TV signal, avoiding kiosk and accessibility-browser false positives. Jellyfin's built-in lyrics UI remains completely authoritative.

This split is intentional: PC/mobile get the enhanced renderer, while every TV
that LyricMotion can identify gets predictable stock Jellyfin behavior with zero
LyricMotion rendering overhead.
