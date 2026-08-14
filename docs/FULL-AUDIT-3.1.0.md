# LyricMotion tv.14 Full Repository Audit Report

Release: `3.1.0`  
Romanizer: `5.1.0`  
Behavioral baseline: final LyricG2P 5 Indic-polish preview

## Scope and baseline contract

This pass used the packaged tv.13 source as the behavioral baseline and audited the browser runtime, Jellyfin lyric interception, asynchronous track/request lifecycle, active-line/timing renderer, Romanization and ELRC boundary mapping, Unicode normalization, DOM geometry/per-frame hot paths, TTML conversion, Linux/Windows installers and uninstallers, Docker injection, static safety surfaces and the existing regression suites.

The pass deliberately does **not** change the product decisions already locked in tv.13: Romanization stays completely offline/on-device; the visible lyric tools remain only Romanize and lyrics offset; Malayalam/Tamil/Telugu/Kannada/Punjabi quality rules remain; safe Indic grapheme/akshara Classic Bloom remains; and detected TV-class clients still exit before LyricMotion runtime initialization.

## Confirmed correctness bugs fixed

### 1. Over-broad lyric URL interception

The old interceptor treated any URL whose path contained `/lyrics` as a Jellyfin lyric response. That could capture unrelated plugin/service traffic. tv.14 accepts known Jellyfin lyric-read endpoint shapes instead.

The audit also found a second issue on the real Jellyfin path: `/Audio/{itemId}/Lyrics` is shared by lyric GET, upload POST and delete DELETE operations in Jellyfin's generated API. The interceptor previously ignored HTTP method, so a write response could be mistaken for the currently playing lyric payload. Fetch and XMLHttpRequest interception now capture **GET only**.

### 2. Same-song and ABA request races

A late response for an older request could overwrite a newer same-song refresh. The request system now gives every lyric request a sequence token and accepts an older same-song result only while no newer response has already won.

During the audit, a subtler A -> B -> A race was found: an extremely late response from the first visit to A could match the current normalized A URL after returning from B. Request identity history is now cleared at true track switches, so the old A session cannot re-enter the second A session.

### 3. Active-line model could use non-rendered indexes

Timeline binary search previously used the raw captured lyric list while painting uses decorated `lineData`. If a payload line was skipped/not represented in DOM, the active index could point outside the rendered model. Search now uses `lineData`; out-of-range presentation indexes are rejected.

An optimization to reverse the descending overlap scan initially exposed another edge case: injecting a non-time-active presentation line after the scan could produce a non-sorted active set. The final code reverses first and then appends the presentation upper bound, preserving ascending deterministic indexes.

### 4. NFC normalization vs. Jellyfin UTF-16 cue indexes

The Romanizer correctly normalizes text to NFC for language processing, but `mapBoundary()` could previously apply a normalized word map to offsets measured in the original decomposed string. When canonical composition changes UTF-16 length, karaoke cue positions can drift. tv.14 detects this case and falls back to original-coordinate prefix/suffix mapping.

Permanent decomposed/NFC regressions cover Malayalam, Tamil, Bengali, Odia and Kannada, checking identical Romanization plus in-range monotonic boundary maps at every original source index.

### 5. Partial Romanization could be reported as successful

`canRomanize()` formerly accepted output if it contained Latin and differed from the input. A mixed result could therefore still contain native script and be advertised as Romanized. The quality gate now requires recognized native script to be absent from the result.

### 6. TTML malformed/non-finite timing acceptance

The TTML parser now rejects non-finite/negative timing values, invalid rates and malformed minute/second/frame fields. If both `end` and `dur` exist, the earlier effective end wins; a child's end is clamped to its inherited end. Existing Apple-style absolute nested-span semantics are intentionally retained.

### 7. TTML parser resource/security surface

The converter now has a 64 MiB input ceiling, verifies the post-read byte count and rejects DTD/entity declarations before ElementTree parsing. This avoids accepting XML constructs the lyric converter does not need and bounds input memory.

### 8. Non-atomic webroot mutation

The shell/PowerShell installers previously copied overlay assets directly over live filenames and wrote/updated `index.html` through non-transactional operations. tv.14 uses same-directory temporary files plus replacement/rename. Overlay assets are completed first and `index.html` is committed last. A normal in-place update therefore cannot expose a half-copied JS/CSS file or half-written HTML document.

### 9. Uninstaller cleanliness

The old uninstaller left timestamped `index.html.before-jellyfin-lyric-motion-*` safety copies indefinitely. A normal tv.14 uninstall removes LyricMotion-owned exact/timestamped backups after removing loader tags/assets. Shell `--keep-backups` and PowerShell `-KeepBackups` opt out. The current `index.html` is edited surgically rather than replaced wholesale, preserving unrelated changes.

### 10. Docker quote assumption

Docker reinjection now recognizes both single- and double-quoted runtime/overlay attributes. Its test fixture deliberately uses single quotes.

## Performance and allocation work

### Romanizer startup

tv.13 embedded the 60,513-entry broad Unicode fallback as an eager JavaScript object literal. tv.14 stores the same data in a compact packed string and materializes the map only when a non-dedicated script actually needs it. The Romanizer source file decreased from **919,722 bytes to 804,111 bytes** (about **12.6% smaller**) despite adding boundary-cache/normalization safeguards.

Common emoji, dingbat and variation-selector ranges that have no entries in the generated fallback table are recognized before fallback parsing, so text such as `❤️ 🎵` does not build the 60k map. In a representative final same-machine Node VM load measurement, evaluating the tv.13 Romanizer took about **127.2 ms** versus **4.6 ms** for tv.14 (about **27.6x faster**). This isolates JavaScript load/evaluation and is not a browser startup guarantee.

### Cue-boundary mapping

ELRC can request many source->Roman boundaries from the same line. tv.13 repeatedly Romanized prefixes/suffixes and rebuilt detailed word maps. tv.14 uses a bounded **256-line** boundary cache for the full output, prefix lengths, start/end boundaries and detailed words. The existing main display Romanization cache remains separately bounded at 1,800 entries.

In the representative final local Node VM comparison, the Malayalam regression line `കാർ - കൂന്തലു കണ്ടപ്പോൾ കണ്ണൊന്ന് ഉടക്കി` mapped every source boundary in both directions for 100 passes in about **2194 ms on tv.13 vs 7.2 ms on tv.14** (roughly **306x faster** in that microbenchmark). Absolute browser timings will differ; this is a same-machine implementation comparison, not a device-performance promise.

### DOM geometry/startup

Word geometry used to be measured synchronously inside every `decorateLine()`, interleaving DOM writes and layout reads line by line. Geometry is now queued once after the whole lyric DOM has been decorated. Prefix Range widths inside a word are cached so the shared end/start boundary between adjacent cues is measured once.

The render hot path also reuses a scratch active-line array, compares integer lists directly instead of creating a comma-joined signature every frame, and only snapshots/signatures the active set when it actually changes. Unused duplicate word `data-*` writes and dead helpers were removed.

## Romanization regression preservation

The packed/lazy fallback change was checked across **1,112,064 Unicode scalar values** against tv.13: there were **0 `romanize()` output differences**. Dedicated tv.13 language-quality suites for Malayalam, Tamil, Telugu, Kannada, Gurmukhi/Punjabi, Hindi/Devanagari and the other supported paths also remain passing.

The optimization pass does change `mapBoundary()` for canonically decomposed input where tv.13 could use the wrong coordinate system; that difference is intentional and covered by new regression tests.

## Static/safety findings

All shipped JavaScript is syntax-checked; Python converter/tests compile and run; shell scripts pass `sh -n`; active runtime/scripts contain no `eval`/`new Function` code path and no direct `innerHTML`/`outerHTML` assignment. Remote Romanization endpoints/adapters remain absent. Dead single-use helpers identified during the pass were removed rather than retained as misleading surface area.

## Final validation matrix

| Suite | Final result |
|---|---:|
| Stock TV bypass | 148 assertions |
| Offline LyricG2P contract | 326 assertions |
| Indic quality/polish | 2,951 assertions |
| Offline isolation/stress | 2,026 assertions |
| Unicode/normalization robustness | 7,486 assertions |
| Romanization + timing controls | 36 assertions |
| Runtime race/route/interception | 59 assertions |
| Full-experience audit | 79 assertions |
| Overlap/background runtime | 19 assertions |
| Multiscript rendering | 477 assertions |
| Full-audit optimization contract | 36 assertions |
| **JavaScript total** | **13,643 assertions** |
| TTML/Python | 16 tests |
| Installer/uninstaller | 43 checks |

The final release artifact is additionally extracted to a fresh directory and the complete suite is rerun from that extracted package before release.

## Remaining risks / honest limits

No finite local audit can prove the absence of every bug. The largest remaining risks are environment-specific Jellyfin Web DOM/API changes, browser/WebView rendering differences, GPU/driver-specific animation behavior, and linguistic ambiguity in unseen words (especially unvowelled Urdu/Shahmukhi). The architecture now fails more conservatively and has stronger regression coverage around the classes of failure that can be tested deterministically.


## Final Windows compatibility correction

The final 3.1.0 release also corrects the Windows PowerShell atomic-replacement helper used by the audited preview. `System.IO.File.Replace` is now always given a real same-directory backup path on Windows PowerShell 5.1; the temporary replacement backup is removed immediately after a successful commit. This avoids the `The path is not of a legal form.` failure seen when `$null` was passed as the backup filename, while preserving the same-directory atomic commit strategy.
