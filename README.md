# Jellyfin LyricMotion

> An unofficial Jellyfin Web enhancement for smooth synced lyrics, geometry-aware karaoke swipes, script-safe motion, and adaptive per-song glow effects.

**Jellyfin LyricMotion** upgrades Jellyfin Web's music lyrics view without replacing Jellyfin playback. It consumes Jellyfin's existing lyric and playback data, then adds a polished rendering layer for normal LRC and enhanced word/syllable timing.

> [!IMPORTANT]
> This is an **unofficial community project**. It is not affiliated with or endorsed by the Jellyfin Project or Apple Inc.

## Features

- **Smooth synced lyric swipe** — progressive gray-to-white highlighting driven by Jellyfin playback time.
- **Enhanced LRC / word timing** — uses word/syllable cue data when Jellyfin exposes it.
- **Normal LRC fallback** — ordinary line-synced `.lrc` lyrics continue to work.
- **Geometry-aware timing** — rendered glyph widths are measured in the browser, improving timing across proportional fonts such as `I`, `m` and `W`.
- **Premium motion effects** — duration-aware grow/lift/glow behavior inspired by the motion principles used by `am-lyrics`.
- **Stable per-song accent glow** — lyric text stays neutral white; only the glyph-shaped glow receives the song accent.
- **Complex-script safety** — Hindi, Punjabi, Malayalam, Arabic and other scripts stay correctly browser-shaped.
- **Universal motion eligibility** — sustained words can receive motion regardless of script.
- **Smart line handoff** — sustained glow decays naturally across line changes instead of being cut on one frame.
- **No future-word headlight** — future words remain solid gray until their timing starts.
- **No custom lyric toasts** — no debug/status bubbles in the lyrics page.
- **Jellyfin remains the player** — playback, seeking and library behavior stay owned by Jellyfin.

## Supported lyric formats

| Format | Support | Behavior |
|---|---:|---|
| LRC | ✅ | Polished line-synced lyrics |
| Enhanced LRC / word-cue data | ✅ | Word/syllable-aware swipe and motion |
| Plain unsynced lyrics | Jellyfin fallback | Jellyfin displays them normally |
| TTML | ❌ | Not parsed by LyricMotion |

LyricMotion does **not** download lyrics. It enhances lyrics already available through Jellyfin.

## Compatibility

The current renderer was developed and tested against **Jellyfin Web 10.11.x**.

Jellyfin Web changes over time, so every release should maintain a small compatibility matrix. A Jellyfin upgrade may replace the patched webroot; if that happens, re-run the installer.

## Installation

Download the latest release ZIP and extract it.

This project intentionally does **not** ship a patched Jellyfin `index.html`. The installer patches the web client already installed on the user's server.

### Windows

Normal installation:

```powershell
.\scripts\install.ps1
```

Or double-click:

```text
INSTALL-WINDOWS.cmd
```

The installer searches:

1. `-WebDir` supplied by the user.
2. `JELLYFIN_WEB_DIR`.
3. Jellyfin's Windows registry install path.
4. Common `Program Files` locations.

Custom / portable install:

```powershell
.\scripts\install.ps1 -WebDir "D:\Apps\Jellyfin\Server\jellyfin-web"
```

Run with Administrator rights when the Jellyfin directory is protected.

### Linux

Jellyfin packages commonly use:

```text
/usr/share/jellyfin/web
```

Install:

```bash
chmod +x scripts/install.sh
sudo ./scripts/install.sh
```

Custom path:

```bash
sudo ./scripts/install.sh --webdir /path/to/jellyfin-web
```

The script also respects `JELLYFIN_WEB_DIR`.

`python3` is required by the Linux/macOS installer for safe HTML patching.

### macOS / custom native installs

Jellyfin chooses its web directory from `--webdir`, `JELLYFIN_WEB_DIR`, or a `jellyfin-web` directory next to the Jellyfin binary.

Use:

```bash
sudo ./scripts/install.sh --webdir /path/to/jellyfin-web
```

Treat macOS as community-tested until it is added to the compatibility matrix.

### Docker

Do **not** edit a running container manually; those changes disappear when the container is recreated.

Build a small derived image instead:

```bash
docker build \
  --build-arg JELLYFIN_TAG=10.11.11 \
  -f docker/Dockerfile \
  -t jellyfin-lyric-motion:10.11.11 \
  .
```

Use that image in place of the stock Jellyfin image while keeping your existing `/config`, media, cache, device, network and hardware-acceleration settings.

When Jellyfin updates:

1. change `JELLYFIN_TAG`;
2. rebuild;
3. recreate the container;
4. verify compatibility.

## What installation changes

LyricMotion only touches the Jellyfin **web client**.

It:

1. backs up the current `index.html`;
2. copies `jellyfin-lyric-motion.js`;
3. copies `jellyfin-lyric-motion.css`;
4. injects two loader tags before Jellyfin's `runtime.bundle.js`.

It does **not** modify the Jellyfin database, music files, metadata, users, libraries, FFmpeg or playback engine.

## Uninstall

Windows:

```powershell
.\scripts\uninstall.ps1
```

Linux/macOS:

```bash
sudo ./scripts/uninstall.sh
```

Both accept an explicit custom web directory.

## Browser cache

After installation or an update:

- hard-refresh Jellyfin Web;
- clear site data; or
- use a private/incognito window.

If an older effect still appears, browser caching is the first thing to check.

## Lyrics setup

For local sidecar lyrics:

```text
01 - Song.flac
01 - Song.lrc
```

Example enhanced timing:

```text
[00:23.932]<00:23.932>Sajde <00:24.511>mein <00:25.145>yun <00:25.498>hi
```

Exact word-cue behavior depends on how the installed Jellyfin version parses and exposes the lyric data.

## Accent controls

Open the browser developer console.

List accents:

```javascript
JellyfinLyricMotion.accents()
```

Automatic stable color per song:

```javascript
JellyfinLyricMotion.setAccent('song')
```

Force a color:

```javascript
JellyfinLyricMotion.setAccent('champagne-gold')
JellyfinLyricMotion.setAccent('royal-purple')
JellyfinLyricMotion.setAccent('sapphire')
```

Keep motion but disable colored outer glow:

```javascript
JellyfinLyricMotion.setAccent('off')
```

Diagnostics:

```javascript
JellyfinLyricMotion.diagnostics()
```

## How it works

```text
Jellyfin lyric API / cue data
           │
           ▼
LyricMotion captures timing
           │
           ▼
Browser measures rendered word geometry
           │
           ▼
Neutral gray → white progress
           │
           ├── normal word: swipe only
           │
           └── sustained word:
                 grow / lift
                 glyph-shaped glow
                 script-safe motion
```

The audio timeline is always Jellyfin's timeline.

## Why an overlay instead of a Jellyfin Web fork?

A full Jellyfin Web fork would require continuously rebasing thousands of upstream frontend changes.

LyricMotion uses two isolated assets and a small loader patch, which makes upgrades, debugging and uninstalling much simpler.

A native Jellyfin extension/plugin mechanism would be the ideal long-term direction if the frontend exposes one suitable for this use case.

## Known limitations

- It is a web-client patch, not an official Jellyfin plugin.
- Jellyfin Web updates can require reinstalling or updating the patch.
- Motion quality depends on lyric timing quality.
- TTML is not currently parsed.
- Native clients that do not use the patched web frontend do not automatically get the effect.
- Font/browser rendering varies slightly by platform.
- Complex scripts prioritize correct shaping over raw character animation.

## Repository layout

```text
jellyfin-lyric-motion/
├─ src/
│  ├─ jellyfin-lyric-motion.js
│  └─ jellyfin-lyric-motion.css
├─ scripts/
│  ├─ install.ps1
│  ├─ uninstall.ps1
│  ├─ install.sh
│  └─ uninstall.sh
├─ docker/
│  └─ Dockerfile
├─ examples/
│  └─ ELRC-EXAMPLE.txt
├─ docs/
├─ LICENSE
├─ THIRD_PARTY_NOTICES.md
└─ README.md
```

## Development checklist

Before releasing a change:

1. Test normal LRC.
2. Test enhanced word timing.
3. Test pause/resume and seeking.
4. Test line handoff.
5. Test a Latin-language song.
6. Test at least one complex script.
7. Run:

```bash
node --check src/jellyfin-lyric-motion.js
```

## Versioning

Use semantic versioning:

```text
MAJOR.MINOR.PATCH
```

- **MAJOR** — integration/compatibility break.
- **MINOR** — new rendering features.
- **PATCH** — bug fixes, styling and compatibility improvements.

## Security and privacy

LyricMotion does not require a cloud account and does not intentionally send lyric or playback data to a LyricMotion service.

It runs inside Jellyfin Web and consumes data already available to that page.

## Credits

### am-lyrics

The motion design and duration-based animation approach were inspired by and adapted after reviewing [`binimum/am-lyrics`](https://github.com/binimum/am-lyrics), distributed under the **Mozilla Public License 2.0**.

### Jellyfin

LyricMotion is designed for [Jellyfin](https://jellyfin.org/) and Jellyfin Web.

This project is unofficial and is not endorsed by the Jellyfin Project.

## License

**Mozilla Public License 2.0 (MPL-2.0).**

See [`LICENSE`](LICENSE) and [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

This repository deliberately does not redistribute a modified Jellyfin Web build. If you later distribute Jellyfin Web code/assets directly, you must also comply with Jellyfin Web's GPL-2.0 terms.

## Contributing

Issues and pull requests are welcome, especially for:

- Jellyfin version compatibility
- Linux distributions
- Docker deployments
- browser compatibility
- complex-script rendering
- installer hardening
- accessibility / reduced motion
- timing diagnostics
- TTML research

For bug reports, include Jellyfin Server/Web versions, OS/container, browser, lyric type, script/language, reproduction steps and `JellyfinLyricMotion.diagnostics()` output where useful.
