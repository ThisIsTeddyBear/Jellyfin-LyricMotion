# Jellyfin LyricMotion

[![Validate](https://github.com/ThisIsTeddyBear/Jellyfin-LyricMotion/actions/workflows/validate.yml/badge.svg)](https://github.com/ThisIsTeddyBear/Jellyfin-LyricMotion/actions/workflows/validate.yml)
[![Release](https://img.shields.io/github/v/release/ThisIsTeddyBear/Jellyfin-LyricMotion?display_name=tag)](https://github.com/ThisIsTeddyBear/Jellyfin-LyricMotion/releases)
[![License: MPL-2.0](https://img.shields.io/badge/License-MPL--2.0-blue.svg)](LICENSE)

An unofficial Jellyfin Web enhancement for fluid enhanced lyrics on desktop and mobile: ELRC karaoke motion, overlapping/background vocals, **fully offline on-device Romanization**, per-song lyric timing correction, multilingual Classic Bloom, and adaptive album atmosphere.

> [!IMPORTANT]
> LyricMotion is a community project. It is not affiliated with or endorsed by the Jellyfin Project or Apple Inc. It patches only the Jellyfin Web client installed on your own server.

> [!NOTE]
> **TV policy:** LyricMotion intentionally hard-bypasses TV-class clients. Detected TVs use Jellyfin's stock lyrics experience with no LyricMotion fetch/XHR interception, observers, media hooks, lyric DOM decoration, Romanizer loading, or timing controls. Desktop and mobile remain enhanced. See [TV Stock Bypass](docs/TV-STOCK-BYPASS.md).

## What's new in 3.1.0

- **LyricG2P 5.1 offline Romanizer** — whole-line/whole-word conversion with dedicated lyric-aware handling for Malayalam, Tamil, Telugu, Kannada, Punjabi/Gurmukhi, Hindi/Devanagari-family languages, Bengali/Assamese, Gujarati and Odia, plus a conservative Urdu/Shahmukhi path and broad Unicode fallback.
- **No cloud Romanization** — no Google, BiniLyrics, LyricsPlus, provider service, model download, or other third-party Romanization request. Native lyric text stays inside Jellyfin Web.
- **Clean lyric UI** — only the **Romanize / Romanized** control and the **lyrics offset** control are exposed.
- **Per-song timing correction** — adjust lyrics in 0.5-second steps without changing audio playback or source lyric files.
- **Multilingual Classic Bloom parity** — shaping-safe Indic grapheme/akshara clusters receive the same bloom energy model as Latin when segmentation is safe; joining scripts keep a whole-shaped-run path to preserve glyph formation.
- **Major Malayalam/Tamil/Telugu/Kannada/Punjabi quality pass** — contextual Malayalam stop voicing and short-u handling, Tamil contextual pronunciation/geminate cleanup, Telugu/Kannada nasal handling, and expanded Punjabi/Gurmukhi schwa/glide/nukta behavior.
- **Full-repository robustness audit** — stricter Jellyfin lyric endpoint detection, GET-only capture, ABA/same-song race protection, active-line ordering fixes, lower hot-loop allocation, deferred geometry reads, stronger TTML validation, safer install/uninstall, and Docker reinjection hardening.
- **Romanizer performance work** — the 60,513-entry ICU-derived fallback is packed/lazy, and source-to-Roman cue-boundary maps use a bounded cache so repeated karaoke remapping does not reromanize the same prefixes.
- **Windows installer compatibility fix** — final 3.1.0 avoids the PowerShell 5.1 `File.Replace(..., $null, ...)` path error while retaining a same-directory atomic replacement strategy.

See [Release Notes 3.1.0](docs/RELEASE-NOTES-3.1.0.md), [Romanization](docs/ROMANIZATION.md), and the [3.1.0 full audit](docs/FULL-AUDIT-3.1.0.md).

## Feature gallery

### Classic Bloom and adaptive atmosphere

![Classic Bloom glow with a blue and violet adaptive atmosphere](docs/screenshots/classic-bloom-atmosphere.png)

Classic Bloom uses a crisp letter-bound core followed by a softer dual-color halo and afterglow. Album artwork is sampled once per track into a small prebaked atmosphere bitmap; playback does not run a live full-screen blur.

### Concurrent lines and background vocals

![Two lead lines and a compact background-vocal lane active simultaneously](docs/screenshots/overlap-background-vocals.png)

LyricMotion tracks an active set instead of a single current line. Overlapping lead/response lines keep independent timing, wipe, glow, and completion. TTML `ttm:role="x-bg"` content can be converted into separately timed ELRC background lanes.

## Supported lyric inputs

| Input | Support | Result |
|---|---|---|
| Enhanced LRC / ELRC | Native | Word/syllable-aware wipe, motion, glow, overlaps, background lanes and exact line endings |
| Standard LRC | Native | Polished line-synced presentation |
| Timed TTML | Converter | Recursive main + `x-bg` extraction into Jellyfin-compatible ELRC |
| Plain unsynced lyrics | Jellyfin fallback | Displayed by Jellyfin without LyricMotion timing effects |

LyricMotion does not download lyrics. It enhances lyric data already available to Jellyfin.

## Install

Download `jellyfin-lyric-motion-v3.1.0.zip` from GitHub Releases, extract it, then run the installer from the extracted folder.

### Windows

Double-click:

```text
INSTALL-WINDOWS.cmd
```

or run PowerShell directly:

```powershell
.\scripts\install.ps1
```

For a custom or portable Jellyfin Web directory:

```powershell
.\scripts\install.ps1 -WebDir "D:\Apps\Jellyfin\Server\jellyfin-web"
```

The Windows launcher requests Administrator access through UAC when needed for a standard `Program Files` Jellyfin installation.

### Linux / macOS

```bash
chmod +x scripts/install.sh scripts/uninstall.sh
sudo ./scripts/install.sh
```

Custom location:

```bash
sudo ./scripts/install.sh --webdir /path/to/jellyfin-web
```

The installers also respect `JELLYFIN_WEB_DIR`. `python3` is required by the POSIX installer for safe HTML patching.

### Docker

Build a derived image rather than editing a running container:

```bash
docker build \
  --build-arg JELLYFIN_TAG=10.11.11 \
  -f docker/Dockerfile \
  -t jellyfin-lyric-motion:10.11.11 \
  .
```

Use the derived image with your existing `/config`, media, cache, networking, and hardware-acceleration configuration.

### After installation

Hard-refresh Jellyfin Web, clear site data, or use a private window. Fully close/reopen mobile clients. Jellyfin upgrades may replace the webroot, so rerun LyricMotion after an upgrade if its injected assets disappear.

## Romanization

For native-script lyrics on desktop/mobile, **Romanize** switches the primary lyric text to local Romanization. The engine is lazy-loaded only when needed.

The Romanizer converts the **complete lyric line first**, then remaps Jellyfin's existing ELRC source-character cue boundaries into the Romanized text. Cue timestamps are not modified.

First-class lyric-aware paths cover:

- Malayalam
- Tamil
- Telugu
- Kannada
- Punjabi / Gurmukhi
- Hindi and other Devanagari-family lyric cases
- Bengali / Assamese
- Gujarati
- Odia
- lexicon-assisted Urdu / Shahmukhi

The broad ICU-derived fallback remains coverage for unsupported scripts; it is not used as the primary Indian-language pronunciation engine. See [Romanization architecture](docs/ROMANIZATION.md).

## Per-song lyrics offset

The lyrics page exposes `−`, the current offset, `+`, and reset. Each step is 0.5 seconds.

- positive offset = lyrics appear later
- negative offset = lyrics appear earlier
- audio playback and seek time are unchanged
- the value is stored per song
- line selection and ELRC word progress use the same adjusted clock

See [Timing Offset](docs/TIMING-OFFSET.md).

## Multilingual rendering

LyricMotion no longer treats non-Latin text as a second-class visual path. Malayalam, Tamil, Telugu, Kannada, Gurmukhi, Devanagari and other shaping-safe Indic scripts can use the detailed grapheme/akshara Classic Bloom path when segmentation is safe. Viramas, combining marks and join controls are protected.

Arabic-family joining and unknown complex runs use a whole-shaped-run bloom so contextual glyph connections remain correct. RTL direction and original ELRC timing are preserved. See [Multilingual Rendering](docs/MULTILINGUAL-RENDERING.md).

## Convert TTML to ELRC

```bash
python scripts/ttml_to_elrc.py "/music/Artist/Album/01 - Song.ttml"
```

It writes `01 - Song.elrc` beside the TTML. Keep TTML as the lossless master and make the ELRC basename match the audio basename.

Options:

```text
--no-background     omit background-vocal content
--plain-background  keep background lines without LyricMotion's role token
-o PATH             choose the output path
```

The converter has finite/non-negative timing checks, DTD/entity rejection, a 64 MiB input limit, inherited-end clamping, and atomic output replacement. See [TTML Conversion](docs/TTML-CONVERSION.md).

## Runtime controls

Open the Jellyfin Web developer console:

```javascript
JellyfinLyricMotion.version
JellyfinLyricMotion.diagnostics()
JellyfinLyricMotion.performance()
JellyfinLyricMotion.atmosphere()
```

Glow themes:

```javascript
JellyfinLyricMotion.accents()
JellyfinLyricMotion.setAccent('shuffle')
JellyfinLyricMotion.nextAccent()
JellyfinLyricMotion.setAccent('sapphire')
JellyfinLyricMotion.setAccent('off')
```

Performance:

```javascript
JellyfinLyricMotion.setPerformance('auto')
JellyfinLyricMotion.setPerformance('desktop')
JellyfinLyricMotion.setPerformance('mobile')
JellyfinLyricMotion.setPerformance('eco')
```

Atmosphere:

```javascript
JellyfinLyricMotion.setAtmosphere('subtle')
JellyfinLyricMotion.setAtmosphere('balanced')
JellyfinLyricMotion.setAtmosphere('cinematic')
JellyfinLyricMotion.setAtmosphere('off')
JellyfinLyricMotion.refreshAtmosphere()
```

`AppleKaraoke` remains as a compatibility alias for older local-test users.

## Performance model

| Profile | Target | Motion path | Glow path |
|---|---:|---|---|
| Desktop | 60 fps | Multiscript grapheme/whole-shaped eligibility | Prepainted core + halo, 64 opacity buckets |
| Android/mobile | 60 fps | Multiscript grapheme/whole-shaped eligibility | Prepainted core + halo, 64 opacity buckets |
| TV-class client | Stock Jellyfin | Stock Jellyfin | Stock Jellyfin |
| Eco | 20 fps | Whole-word minimal motion | Prepainted layers, 32 buckets |
| Normal LRC | 20 fps | Line-synced | No ELRC per-word work |

Only currently active overlapping lines receive per-frame word updates. Static line classes change at boundaries instead of walking the entire lyric document each frame.

## What installation changes

The installer:

1. locates the installed Jellyfin Web directory;
2. validates the package version and required overlay assets;
3. creates a unique backup of the current `index.html`;
4. removes older LyricMotion/AppleKaraoke loader tags from the working HTML copy;
5. updates `jellyfin-lyric-motion.js`, `jellyfin-lyric-motion.css`, and `jellyfin-lyric-romanizer.js`;
6. commits the edited `index.html` last;
7. leaves Jellyfin's generated JavaScript bundles untouched.

It does **not** modify Jellyfin's database, media, metadata, users, FFmpeg, playback engine, or generated application bundles.

## Uninstall

Windows:

```powershell
.\scripts\uninstall.ps1
```

Linux/macOS:

```bash
sudo ./scripts/uninstall.sh
```

The uninstaller surgically removes LyricMotion loader tags/assets and normally deletes LyricMotion-owned timestamped `index.html` safety backups. Use `-KeepBackups` on PowerShell or `--keep-backups` on POSIX if you intentionally want to retain them.

## Compatibility and validation

The 3.1.0 release targets Jellyfin Web 10.11.x and modern desktop/mobile browsers. TV-class clients are validated as a hard stock-Jellyfin bypass.

The bundled regression suite covers Romanization, Indic language quality, source-to-Roman cue mapping, timing controls, request races/interception, overlapping/background vocals, script safety, multilingual glow, TTML parsing, and installer/uninstaller behavior.

Real behavior can still vary by Jellyfin build, browser/WebView, available fonts and source lyric quality.

## Repository layout

```text
src/                 browser runtime, offline Romanizer, CSS
scripts/             installers, converter, release packager, regression tests
docs/                architecture, release notes, audit and feature docs
examples/            ELRC examples
docker/              derived Jellyfin image
.github/workflows/   validation and tag-driven release automation
```

## Development

Run the complete local suite:

```bash
sh scripts/test-all.sh
```

Or run individual contracts; see [Contributing](CONTRIBUTING.md).

Build the deterministic release package:

```bash
python scripts/package_release.py --version 3.1.0
```

## Privacy

Romanization is fully local/on-device. LyricMotion has no Romanization cloud service and does not intentionally transmit native lyric text to third-party Romanization providers.

## Credits and license

The duration-aware motion approach was inspired by and adapted after reviewing [`binimum/am-lyrics`](https://github.com/binimum/am-lyrics). The bundled broad transliteration fallback is generated from Unicode ICU transliteration data; see [Third-Party Notices](THIRD_PARTY_NOTICES.md).

Jellyfin LyricMotion is distributed under the [Mozilla Public License 2.0](LICENSE).

Jellyfin and Jellyfin Web are separate projects. This repository deliberately does not redistribute a patched Jellyfin Web build or generated `index.html`.
