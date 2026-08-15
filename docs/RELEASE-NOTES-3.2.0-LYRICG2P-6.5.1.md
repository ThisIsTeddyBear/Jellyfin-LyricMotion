# Jellyfin LyricMotion 3.2.0 / LyricG2P 6.5.1 Release Notes

Date: 2026-08-15

This is an engine patch release on the Jellyfin LyricMotion 3.2.0 application baseline. The application version remains `3.2.0`; the Romanizer advances from `6.5.0` to `6.5.1`.

## Headline changes

- Merged the strongest production pieces of both supplied LyricG2P 6.5 implementations.
- Added compact Hindi/Punjabi learned schwa classifiers as **lazy local advisors**, not universal production overrides.
- Added richer Malayalam display-vs-phonetic IR.
- Improved Devanagari phrase context for Hindi/Marathi/Bhojpuri/Nepali while retaining explicit ambiguity for weak isolated evidence.
- Rebuilt candidate ranking around local decision category, source authority, language context, confidence and song style.
- Fixed the alternate Punjabi coefficient-cache defect and candidate-object `[object Object]` defect.
- Preserved the base's correct Malayalam legacy chillus, production morphology, Punjabi tone and provenance architecture.
- Hardened source→Roman karaoke mapping against cross-script joiners, consecutive joiners, malformed combining marks and normalization-coordinate changes.
- Added G2P-specific cache busting across POSIX, PowerShell and Docker install paths so a browser cannot reuse the older 6.5.0 Romanizer while the app version remains 3.2.0.

## Final optimization/hardening pass

The final 6.5.1 package includes a second engineering pass that preserves the accepted Romanization behavior while separating the normal playback path from diagnostic provenance work. In fresh-process Node measurements this reduced the median mixed `romanize()` workload from about 0.159 ms/op to 0.041 ms/op, with larger relative gains on the Punjabi and Devanagari production workloads used by the same harness. Detailed diagnostics and hybrid ranking also improved.

The pass additionally fixes duplicate-candidate metadata selection, bounds pathological alignment/distance memory, rejects stale in-memory Romanizer versions, stages installer assets before live replacement, validates malformed nested TTML timing, hardens dataset import/splitting, and adds deterministic package/checksum/static-safety gates.

See `docs/OPTIMIZATION-HARDENING-3.2.0-LYRICG2P-6.5.1.md` for the complete before/after benchmark and bug list.

## Validation

- 32 explicit existing regressions: PASS
- 500 existing deterministic Unicode fuzz cases: PASS
- 6.5.1 focused hybrid/model/ranker/provenance suite: PASS
- 3,000 default expanded Unicode fuzz cases: PASS
- separate 10,000-case adversarial fuzz run: PASS
- 28-row reviewed regression seed: 28/28 exact, used only as a smoke regression set
- 1,498-key differential audit: zero normal-output differences from the previous 3.2.0/6.5.0 base

See `docs/IMPLEMENTATION-REPORT-3.2.0-LYRICG2P-6.5.1.md` for the full bug list, model policy, performance measurements and limitations.
