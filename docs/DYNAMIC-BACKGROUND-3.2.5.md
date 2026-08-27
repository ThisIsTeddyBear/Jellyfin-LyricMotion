# Dynamic Background 3.2.5 God Mode Design

## Design rule

The background is a persistent media-owned visual surface. Lyrics are consumers of the same playback session, but they do not own, reset, hide, or animate the background.

## State ownership

Dynamic Background follows three strict rules:

1. Lyric changes never tear down the background.
2. Only a confirmed change in decoded visual artwork may start an artwork transition.
3. Only artwork belonging to the latest live media identity may commit to the screen.

## Identity hierarchy

Media identity determines whether an asynchronous request is still allowed to commit.

Decoded visual fingerprint determines whether the background visually needs to change.

Artwork URL is metadata and a recovery source. It is not sufficient to determine visual equality.

## Transition hierarchy

- Same visual art: no texture upload, no transition, shader clock continues.
- Different visual art: 260 ms WebGL blend.
- Interrupted blend: capture current visible blend, then transition from that snapshot.
- WebGL fallback: 220 ms dual-layer CSS opacity blend.

## Source hierarchy

1. Current-item DOM artwork can commit immediately after identity validation. Album-inherited Primary artwork already visible in Jellyfin's now-playing UI is eligible on the same path when it is tied to the active playback context.
2. Generic unbound DOM artwork remains conservative: it must be new relative to the switch snapshot, the media must be stable for 900 ms, and that exact URL must remain stable for 1.5 s.
3. If the now-playing UI has not supplied usable artwork, LyricMotion waits a 700 ms grace period, then probes the current media item's Primary endpoint with a 900 ms load timeout.
4. Confirmed no-art state is allowed only after repeated failures and a 2.5 s stability window.

Artwork URLs that explicitly identify a different Jellyfin item are rejected. DOM stability is tracked independently per URL because Jellyfin may expose several image/background candidates at once. Confirmed no-art is retried after 10 s, so a transient image failure cannot permanently blank the background. A stale-looking DOM image is never preferred over a valid current background during navigation.

## Atmosphere mode policy

Dynamic is the only atmosphere engine. There is no runtime setting matrix for alternate visual systems.

Performance controls remain Auto, Desktop, and Mobile because they select renderer resolution/profile rather than a different background design.
## Artwork acquisition order

The current now-playing artwork shown by Jellyfin is the first source of truth. This matters for music tracks that inherit Primary artwork from their album or folder `cover.jpg`/`cover.png` rather than owning a track-level image. A newly visible now-playing album image that was not present at the media-key switch is eligible immediately, and an already-loaded `<img>` element is reused directly instead of being fetched again. Late artwork delivered through either `src`/`srcset` or a CSS `background-image` remains under continuous identity-gated discovery, including when plain lyrics have stopped the animation loop.

Rapid-skip protection is preserved by snapshotting artwork URLs visible at the media-key switch. A stale URL from the outgoing song cannot become a new commit merely because it remains in the DOM. If Jellyfin has not painted a usable current cover yet, LyricMotion keeps probing on media lifecycle and artwork DOM mutations. Only after a short 700 ms grace period does it try the synthetic track-level `/Items/<track>/Images/Primary` URL as a fallback.
