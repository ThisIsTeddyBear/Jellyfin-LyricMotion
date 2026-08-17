# Jellyfin LyricMotion

> **3.2.5 Dynamic Background God Mode build:** single atmosphere engine, same-album visual deduplication, latest-media-only artwork commits, and rapid-skip transition hardening.


[![Validate](https://github.com/ThisIsTeddyBear/Jellyfin-LyricMotion/actions/workflows/validate.yml/badge.svg)](https://github.com/ThisIsTeddyBear/Jellyfin-LyricMotion/actions/workflows/validate.yml)
[![Release](https://img.shields.io/github/v/release/ThisIsTeddyBear/Jellyfin-LyricMotion?display_name=tag)](https://github.com/ThisIsTeddyBear/Jellyfin-LyricMotion/releases)
[![License: MPL-2.0](https://img.shields.io/badge/License-MPL--2.0-blue.svg)](LICENSE)

An unofficial Jellyfin Web enhancement for fluid enhanced lyrics on desktop and mobile: ELRC karaoke motion, overlapping/background vocals, **time-synced instrumental-break progress**, fully offline on-device Romanization, per-song lyric timing correction, multilingual Classic Bloom, and adaptive album atmosphere.

> [!IMPORTANT]
> LyricMotion is a community project. It is not affiliated with or endorsed by the Jellyfin Project or Apple Inc. It patches only the Jellyfin Web client installed on your own server.

> [!NOTE]
> **TV policy:** LyricMotion intentionally hard-bypasses TV-class clients. Detected TVs use Jellyfin's stock lyrics experience with no LyricMotion fetch/XHR interception, observers, media hooks, lyric DOM decoration, Romanizer loading, or timing controls. Desktop and mobile remain enhanced. See [TV Stock Bypass](docs/TV-STOCK-BYPASS.md).

## What's new in 3.2.5 / LyricG2P 6.5.1

Jellyfin LyricMotion **3.2.5 Dynamic Background God Mode** is a single-atmosphere build centered on the requested album-art shader. LyricG2P remains **6.5.1**. This hotfix also hardens the lyric visual loop so ELRC sweep/Classic Bloom and instrumental liquid progress cannot be permanently starved by a background/lifecycle exception.

- **Dynamic is the only atmosphere engine.** Legacy atmosphere preferences are ignored; removed modes have no runtime branches or persistent setting path to reactivate them.
- **Album artwork is the color source.** The Dynamic mode does not synthesize a palette. Artwork is uploaded directly to WebGL, tinted only in dark regions, blurred through eight 128 x 128 Kawase passes when the image changes, then animated with simplex-noise domain warping.
- **Reference shader character preserved.** Warp intensity 1.0, eight blur passes, animation speed 1.8, saturation 1.7, opacity 0.75, dithering 0, and audio responsiveness off follow the theme's shader configuration.
- **Fast, real song transitions.** Different artwork uses a 260 ms texture crossfade. If another song arrives mid-transition, the currently visible blend is captured first and becomes the next transition's true starting point.
- **Race-safe artwork.** Artwork commits are tied to the latest live media item. Explicitly mismatched item artwork is rejected, the pre-switch DOM cover is snapshotted as stale, and unbound DOM fallback must remain stable before it can commit.
- **WebGL hardening.** Attribute locations are explicitly bound across programs, framebuffer completeness is checked, partial initialization is cleaned up, failed initialization uses exponential retry backoff, render resolution is capped for large displays, hidden tabs pause rendering, and WebGL context loss activates a dual-layer CSS artwork fallback.
- **No audio coupling.** The background uses album artwork and elapsed animation time only. No analyser, FFT, beat response, phrase response, or instrumental response is involved.
- **Self-healing lyric DOM.** Reused `.lyricsLine` shells are validated against LyricMotion-owned child nodes and lyric identity. If Jellyfin replaces line contents, ELRC sweep, Classic Bloom, and instrumental SVG rows are redecorated instead of continuing on detached nodes.
- **Perceptually balanced shuffle.** The compact Classic Bloom set now shuffles five high-contrast accents equally. Per-palette gain is normalized so yellow/green choices do not dominate the red/blue/violet choices, and the fallback remains neutral.

### Validation snapshot

The release gate covers JavaScript/Python syntax, **32 LyricG2P regressions + 500 Unicode fuzz cases**, the 6.5.1 hybrid/provenance suite with **3,000 fuzz cases**, **5,000 randomized instrumental timelines**, runtime smoke/core tests, timing/request/accent/atmosphere tests, TTML conversion, research-pipeline hygiene, installer rollback simulation, static JS/CSS contracts, deterministic packaging and synthetic Jellyfin install/uninstall.

Read: [Dynamic Background Design](docs/DYNAMIC-BACKGROUND-3.2.5.md), [LyricG2P 6.5.1](docs/LYRICG2P-6.5.1.md), and the canonical [CHANGELOG](CHANGELOG.md).

## Feature gallery

### Classic Bloom and adaptive atmosphere

![Classic Bloom glow with a blue and violet adaptive atmosphere](docs/screenshots/classic-bloom-atmosphere.png)

Classic Bloom uses a crisp letter-bound core followed by primary/secondary bloom and a restrained tertiary outer halo. The runtime exposes five punchier palettes and shuffles them per song without immediate repetition. Dynamic Background uses the album artwork itself as a preblurred WebGL texture and continuously deforms it with domain warping. Lyric rendering remains independent of the atmosphere and keeps its neutral sweep plus Classic Bloom foreground treatment.

### Instrumental-break progress

For a trustworthy vocal gap of at least two seconds, the completed lyric becomes past, the planned `♪` row is already present as a subdued future item, and the note smoothly becomes active. A subtle liquid surface rises bottom-to-top, oscillates while the break is in progress, then flattens as the next vocal approaches. Long instrumental sections still use one continuous symbol rather than repeating notes or dots.

The fill and wave phase are derived from media time rather than a standalone CSS timer, so pause, seek and playback-rate changes stay locked to the song. Standard LRC without a real line-end timestamp remains conservative and does not synthesize breaks. Reduced-motion keeps the timing fill with decorative wave motion disabled.

### Concurrent lines and background vocals

![Two lead lines and a compact background-vocal lane active simultaneously](docs/screenshots/overlap-background-vocals.png)

LyricMotion tracks an active set instead of a single current line. Overlapping lead/response lines keep independent timing, wipe, glow, and completion. TTML `ttm:role="x-bg"` content can be converted into separately timed ELRC background lanes.

## Supported lyric inputs

| Input | Support | Result |
|---|---|---|
| Enhanced LRC / ELRC | Native | Word/syllable-aware wipe, motion, glow, overlaps, background lanes, exact line endings and trustworthy instrumental-gap progress |
| Standard LRC | Native | Polished line-synced presentation; instrumental gaps only when the source exposes a trustworthy explicit end |
| Timed TTML | Converter | Recursive main + `x-bg` extraction into Jellyfin-compatible ELRC |
| Plain unsynced lyrics | Jellyfin fallback | Displayed by Jellyfin without LyricMotion timing effects |

LyricMotion does not download lyrics. It enhances lyric data already available to Jellyfin.

## Install

Download `jellyfin-lyric-motion-v3.2.5.zip` from GitHub Releases, extract it, then run the installer from the extracted folder.

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

## Smart lyric timing assistant

The normal toolbar is one compact glass capsule: a speech-bubble Romanization toggle plus a timing chip showing the current offset. The timing chip opens a compact popover only when needed.

- **Fine correction**: `-0.1` / `+0.1`
- **Sync lyric to now**: tap a word/line exactly when it begins and LyricMotion calculates the constant offset automatically
- **Reset**: return to source timing
- **Auto-dismiss**: clicking outside the popover closes it
- **Timeline fingerprinting**: stored correction only restores when the exact lyric timeline matches, including cue boundaries and timing

Positive offset delays the lyrics; negative offset makes them appear earlier. Changing the timing correction itself never changes playback. An explicit lyric click still seeks, and in 3.2.4 that seek now includes the saved correction so the selected line is the line that actually becomes current. Three-point calibration and drift correction remain intentionally absent to keep the timing model simple and predictable. See [Smart Timing Assistant](docs/TIMING-ASSISTANT.md).

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
JellyfinLyricMotion.romanization()
JellyfinLyricMotion.timing()
JellyfinLyricMotion.instrumentalBreaks()
JellyfinLyricMotion.explainRomanization('ഇടി')
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
```

Atmosphere:

```javascript
JellyfinLyricMotion.setAtmosphere('dynamic')
JellyfinLyricMotion.refreshAtmosphere()
```

Dynamic Background is deliberately audio-independent. There is no audio-reactive atmosphere API in this build.

`AppleKaraoke` remains as a compatibility alias for older local-test users.

## Performance model

| Profile | Target | Motion path | Glow path |
|---|---:|---|---|
| Desktop | 60 fps | Multiscript grapheme/whole-shaped eligibility | Prepainted core + halo, 64 opacity buckets |
| Android/mobile | 60 fps | Multiscript grapheme/whole-shaped eligibility | Prepainted core + halo, 64 opacity buckets |
| TV-class client | Stock Jellyfin | Stock Jellyfin | Stock Jellyfin |
| Normal LRC | 20 fps normally; active instrumental progress uses the selected performance profile | Line-synced | No ELRC per-word work |

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

The 3.2.5 release targets Jellyfin Web 10.11.x and modern desktop/mobile browsers. TV-class clients are validated as a hard stock-Jellyfin bypass.

The bundled regression suite covers Romanization, Indic language quality, source-to-Roman cue mapping, timing controls, instrumental-break planning/progress, request races/interception, overlapping/background vocals, script safety, multilingual glow, TTML parsing, and installer/uninstaller behavior.

Real behavior can still vary by Jellyfin build, browser/WebView, available fonts and source lyric quality.

## Repository layout

```text
src/                 browser runtime, offline Romanizer, CSS
scripts/             installers, converter, dataset/evaluation tools, release packager
tests/               G2P, runtime, TTML, research-pipeline and static safety gates
research/            regression seeds, benchmark outputs and model experiments
docs/                current architecture and feature documentation
examples/            ELRC examples
docker/              derived Jellyfin image
.github/workflows/   validation and tag-driven release automation
```

## Development

Run the complete local suite:

Linux/macOS/Git Bash:

```bash
sh scripts/test-all.sh
```

Windows PowerShell:

```powershell
.\scripts\test-all.ps1
```

The PowerShell entry point locates Git Bash and runs the same canonical release gate used by CI.

Or run individual contracts; see [Contributing](CONTRIBUTING.md).

Build the deterministic release package:

```bash
mkdir -p dist
python3 scripts/package_release.py \
  --version "$(cat VERSION)" \
  --output "dist/jellyfin-lyric-motion-v$(cat VERSION).zip"
```

The complete tagging/GitHub Release procedure lives in the repository-only `docs/RELEASING.md`; it is intentionally excluded from public release ZIPs.

## Privacy

Romanization is fully local/on-device. LyricMotion has no Romanization cloud service and does not intentionally transmit native lyric text to third-party Romanization providers.

## Credits and license

The duration-aware motion approach was inspired by and adapted after reviewing [`binimum/am-lyrics`](https://github.com/binimum/am-lyrics). Instrumental-row interaction research also consulted the publicly documented behavior of [`better-lyrics/better-lyrics`](https://github.com/better-lyrics/better-lyrics); LyricMotion independently implements its SVG/wave behavior and does not import Better Lyrics GPLv3 source. The bundled broad transliteration fallback is generated from Unicode ICU transliteration data; see [Third-Party Notices](THIRD_PARTY_NOTICES.md).

Jellyfin LyricMotion is distributed under the [Mozilla Public License 2.0](LICENSE).

Jellyfin and Jellyfin Web are separate projects. This repository deliberately does not redistribute a patched Jellyfin Web build or generated `index.html`.
