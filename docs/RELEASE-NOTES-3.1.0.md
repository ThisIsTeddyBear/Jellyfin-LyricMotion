# Jellyfin LyricMotion v3.1.0

Jellyfin LyricMotion 3.1.0 is the first public release of the new fully offline Romanization/timing branch. It consolidates the development-preview work into a clean Semantic Versioning release and keeps TV-class clients on stock Jellyfin lyrics.

## Highlights

### Fully offline LyricG2P 5.1 Romanization

Romanization is generated on-device inside Jellyfin Web. There is no Google/BiniLyrics/LyricsPlus/provider Romanization fallback and no model or service download.

The engine converts complete lines before remapping ELRC source-character boundaries, so pronunciation/context rules can see the whole word/line while Jellyfin's cue timestamps remain unchanged.

First-class lyric-aware handlers cover Malayalam, Tamil, Telugu, Kannada, Punjabi/Gurmukhi, Hindi/Devanagari-family text, Bengali/Assamese, Gujarati and Odia. Urdu/Shahmukhi uses a conservative lexicon-assisted path because ordinary unvowelled Perso-Arabic spelling does not always encode recoverable short vowels.

### Indian-language quality pass

This release includes a substantial real-song-driven pass over Malayalam, Tamil, Telugu, Kannada and Punjabi. Malayalam now handles contextual singleton retroflex-stop voicing and conservative short-u/chandrakkala behavior, including the reported regressions:

```text
ഇടിമിന്നലാടി നിനക്കെന്താ പേടി
-> idiminnalaadi ninakkenthaa pedi

കതക് അടച്ചോടി അടുത്തു നീ വാടി
-> kathak adachodi aduthu nee vaadi

കാർ - കൂന്തലു കണ്ടപ്പോൾ കണ്ണൊന്ന് ഉടക്കി
-> kaar - koonthalu kandappol kannonnu udakki
```

Tamil keeps context-sensitive pronunciation while avoiding overly mechanical geminate display. Telugu/Kannada receive stronger nasal/continuant handling. Punjabi/Gurmukhi includes `ੜ`, nukta `ਸ਼`, schwa/glide and frequent lyric-form corrections.

### Multilingual Classic Bloom

Shaping-safe Indic grapheme/akshara clusters can use the same detailed Classic Bloom energy model as Latin. Viramas, combining marks and join controls are protected. Joining scripts such as Arabic remain whole shaped runs where splitting would break contextual glyph formation.

### Two lyric tools only

The desktop/mobile lyric UI exposes only:

- **Romanize / Romanized**
- **Lyrics offset**

Timing correction is stored per song in 0.5-second steps and affects lyric presentation only, never audio playback.

### TV uses stock Jellyfin lyrics

TV-class clients hard-exit LyricMotion at bootstrap. They do not install LyricMotion lyric fetch/XHR hooks, observers, media hooks, DOM decoration, Romanizer loading or timing controls.

### Full robustness/performance audit

The release includes GET-only Jellyfin lyric capture, stricter endpoint matching, same-song and ABA request-race protection, active-line ordering fixes, lower hot-loop allocation, deferred geometry measurement, cached cue-prefix geometry, Unicode normalization-safe boundary mapping, stricter TTML parsing, and safer install/uninstall/Docker behavior.

The 60,513-entry ICU-derived broad fallback is packed and only materialized when a dedicated script handler cannot service the text. A bounded boundary-map cache avoids repeated reromanization during karaoke cue mapping.

## Windows installer fix

The final release includes a compatibility correction after the audited preview exposed this Windows PowerShell 5.1 error:

```text
LyricMotion installation failed: The path is not of a legal form.
```

The audited preview called `System.IO.File.Replace` with a null backup filename. 3.1.0 now supplies a real same-directory transient backup path and cleans it after the atomic commit, so the Windows installer retains the intended safe replacement behavior without the illegal-path failure.

## Installation

Windows:

```text
INSTALL-WINDOWS.cmd
```

Linux/macOS:

```bash
sudo ./scripts/install.sh
```

Custom web directory examples are documented in the README.

## Upgrade notes

You can install 3.1.0 directly over an older LyricMotion install. The installer removes older LyricMotion/AppleKaraoke loader tags before reinjection and replaces the overlay assets. The lazy `jellyfin-lyric-romanizer.js` asset is installed alongside the main runtime.

After installation, hard-refresh Jellyfin Web or open a private window. Jellyfin upgrades can replace the webroot; rerun LyricMotion when necessary.

## Uninstall

Uninstall removes LyricMotion loader tags/assets and returns Jellyfin Web to its stock lyric behavior. Normal uninstall also cleans LyricMotion-owned timestamped `index.html` backups; use the explicit keep-backups option if you want to retain them.

## Validation

The final source tree includes deterministic suites covering Romanization, Indian-language quality, Unicode/source-boundary robustness, timing controls, request races/interception, overlapping/background vocals, script safety, multilingual rendering, TTML conversion and installer/uninstaller behavior.

See `docs/FULL-AUDIT-3.1.0.md` for the full repository audit and `docs/ROMANIZATION.md` for the Romanizer architecture.
