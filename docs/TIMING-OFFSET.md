# Lyric timing offset

Desktop/mobile LyricMotion adds compact timing controls to the lyrics page:

```text
−   +0.0s   +   ↺
```

- `−` decreases delay by 0.5 s, making lyrics appear earlier.
- `+` increases delay by 0.5 s, making lyrics appear later.
- `↺` resets the current song to `+0.0s`.
- The supported UI range is −15.0 s to +15.0 s.

The offset is **display-only**: it changes LyricMotion's lyric timeline and never seeks or alters the audio element. It applies to line activation and word/syllable progress from the same final timeline, so line state and swipe stay internally synchronized.

The value is stored per song in `appleKaraokeSongPreferencesV2` alongside that song's Romanization preference.

Positive values mean "lyrics later". Internally the lyric timeline is `media timeline - offset`; therefore +0.5 s causes a lyric timestamp at 10.0 s to become active when media reaches 10.5 s.

Console diagnostics:

```javascript
JellyfinLyricMotion.timing()
JellyfinLyricMotion.setTimingOffset(0.5)
JellyfinLyricMotion.adjustTimingOffset(-0.5)
JellyfinLyricMotion.resetTimingOffset()
```
