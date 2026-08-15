# Jellyfin LyricMotion 3.2.0 · LyricG2P 6.5.1

This release brings the optimized LyricG2P 6.5.1 engine to the Jellyfin LyricMotion 3.2.0 application baseline.

## Highlights

- **Best-of-both LyricG2P 6.5.1 hybrid** combining deterministic lyric-specific phonology, curated lexicons, production morphology, shared-script context, compact learned Hindi/Punjabi schwa advice, richer Malayalam phonetic IR, and category-aware candidate selection.
- **Much faster normal Romanization path** by separating playback Romanization from detailed provenance construction. In the controlled five-process Node benchmark, mixed normal `romanize()` improved from 0.1587 ms/op to 0.0408 ms/op, Punjabi from 0.0688 to 0.0137, and Devanagari from 0.1045 to 0.0151.
- **Karaoke-safe source mapping hardening** for NFC/NFD coordinate changes, ZWJ/ZWNJ chains, malformed combining marks, provenance clamping, and monotonic source-to-Roman boundaries.
- **Smarter hybrid candidate authority**: curated lexicon and protected morphology remain authoritative, while strong same-language learned/provider candidates can replace genuinely weak or shared-script-ambiguous local results.
- **Malayalam correctness improvements** including legacy chillu handling plus separate display and phonetic interpretations.
- **Stronger Devanagari-family phrase context** for Hindi, Marathi, Bhojpuri, and Nepali without forcing isolated ambiguous words into Hindi.
- **Targeted learned schwa advisors** for Hindi and Punjabi remain fully local and lazy. No full neural transliteration checkpoint is bundled.
- **Runtime, TTML, installer, research-pipeline, and release hardening**, including strict Romanizer-version compatibility, staged asset replacement, invalid nested-TTML timing rejection, leakage-safe dataset validation, deterministic packaging, and checksum generation.

## Validation

The final package passed:

- 32 reviewed LyricG2P regressions
- 500 base Unicode fuzz cases
- 3,000 focused hybrid/model/provenance fuzz cases
- 10,000 extended Unicode/provenance fuzz cases
- 5,000 frozen-vs-optimized mixed-script differential strings with identical normal output, detailed text, and tested source boundaries
- 2,500 held-out Dakshina Tamil words with zero output differences from the frozen 6.5.1 baseline
- browser-runtime smoke tests
- TTML converter tests
- research-pipeline tests
- synthetic Jellyfin Web install/uninstall
- deterministic double-package comparison and archive hygiene checks

## Version identity

- Jellyfin LyricMotion: `3.2.0`
- LyricG2P: `6.5.1`
- Romanization runtime: fully local/offline
- Full native-to-Roman neural model: **not bundled**

## Documentation

- `README.md`
- `docs/RELEASE-NOTES-3.2.0-LYRICG2P-6.5.1.md`
- `docs/OPTIMIZATION-HARDENING-3.2.0-LYRICG2P-6.5.1.md`
- `docs/LYRICG2P-6.5.1.md`
- `docs/LYRICG2P-6.5.1-STYLE.md`
- `docs/LYRICG2P-6.5.1-THREE-WAY-BENCHMARK.md`
