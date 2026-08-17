# TV policy: stock Jellyfin only

LyricMotion is intentionally a **desktop and mobile enhancement only** in this
branch. TV-class clients use Jellyfin's stock lyrics implementation.

The bootstrap detects known and generic television environments before the
normal runtime is initialized. Coverage includes LG webOS/NetCast, Samsung
Tizen, Android/Google TV, Fire TV, Apple TV/tvOS, Roku, Chromecast, HbbTV,
Hisense/VIDAA, Vizio, Panasonic/Viera, Sony/Bravia, Philips TV, Opera TV,
PlayStation/Xbox and generic Smart-TV identifiers. Input capability alone is
not treated as a TV signal, because kiosk shells, accessibility setups and
unusual desktop browsers can legitimately expose no touch or a coarse pointer.

When a TV is detected, LyricMotion returns before installing fetch/XHR
interceptors, DOM or route observers, media listeners, lyric decoration,
atmosphere, focus/scroll behavior, or an animation loop. Jellyfin therefore owns
rendering, scrolling, seeking, focus, navigation and header behavior end to end.

## Verify on a TV debugging console

```js
window.JellyfinLyricMotion
```

Expected shape:

```js
{
  enabled: false,
  platform: "tv",
  renderer: "stock-jellyfin",
  reason: "tv-stock-bypass",
  tvFamily: "..."
}
```

No `ak-enhanced-line`, `ak-karaoke-container`, `ak-perf-*`, atmosphere DOM, or
LyricMotion network interception should be created on a detected TV client.

The only TV-specific code kept in the browser bundle is this small bootstrap
detector; there is no alternate TV renderer to re-enable.
