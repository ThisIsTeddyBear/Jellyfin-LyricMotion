# Dynamic Background

Dynamic Background uses the current album artwork as a persistent, blurred animated surface. It is independent of lyric timing and audio analysis.

Artwork changes crossfade smoothly. The renderer verifies that artwork belongs to the current media item before committing it, which prevents stale covers during rapid track changes. If WebGL is unavailable, LyricMotion uses a CSS artwork fallback.

Dynamic is the only atmosphere mode in this release.
