# LyricG2P 6.5.1 Three-Way Benchmark

Compared builds:

- Base: Jellyfin LyricMotion 3.2.0 / LyricG2P 6.5.0
- Alternate: Jellyfin LyricMotion 3.1.1 / LyricG2P 6.5.0
- Latest: Jellyfin LyricMotion 3.2.0 / LyricG2P 6.5.1

## Deployment conclusion

LyricG2P 6.5.1 is the best production candidate of the three. It does not show a universal transliteration-accuracy gain over the base on the independent Tamil test, but it preserves that accuracy while materially improving shared-script context, hybrid candidate selection, Unicode boundary safety, transform provenance, release integration and Hindi/Punjabi hot-path efficiency versus the alternate build.

## Benchmark layers

1. 32 reviewed project regression cases.
2. Independent Dakshina Tamil held-out lexicon: 2,500 native word types, multiple human-attested Romanizations.
3. Shared-Devanagari phrase-language tests.
4. Structured hybrid-candidate tests.
5. Neutral 1,000-case adversarial Unicode/boundary suite using identical inputs for all engines.
6. 1,498-key source-derived differential sweep for regressions/coverage, not accuracy.
7. Isolated Node 22 hot-path performance tests.
8. Fresh packaged-release test gate for 6.5.1, including a separate 10,000-case focused Unicode fuzz run.

## Results

| Metric | Base 6.5.0 | Alternate 6.5.0 | 6.5.1 |
|---|---:|---:|---:|
| Reviewed exact | 32/32 | 28/32 | 32/32 |
| Dakshina Tamil, any attested exact | 1400/2500 (56.00%) | 1400/2500 (56.00%) | 1400/2500 (56.00%) |
| Dakshina Tamil, highest-attestation exact | 1056/2500 (42.24%) | 1055/2500 (42.20%) | 1056/2500 (42.24%) |
| Dakshina Tamil mean min CER | 8.404% | 8.404% | 8.404% |
| Shared-Devanagari phrases | 3/5 | 5/5 | 5/5 |
| Isolated `प्रेम` remains ambiguous | Yes | No, defaults Hindi | Yes |
| Neutral 1,000-case boundary failures | 9 | 9 | 0 |
| Neutral 1,000-case span-range failures | 0 | 7 | 0 |
| Neutral unit-provenance failures | 24 cases | Not globally exposed | 0 |
| Structured candidate objects | Correct | Pollutes rank list with `[object Object]` | Correct |
| 300 trusted-local ranker guard cases | 300/300 | 300/300, but all 300 lists polluted | 300/300 |
| Weak correct-language candidate can beat ambiguous local fallback | No | No | Yes |
| Wrong-language high-confidence candidate rejected | Yes | Yes | Yes |
| Normal output vs base on 1,498-key differential sweep | Reference | 4 differences | 0 differences |
| Throws/native residue on 1,498-key sweep | 0/0 | 0/0 | 0/0 |

### Alternate 6.5.0 reviewed regressions

- `ന്‍` -> `nu`, expected `n`
- `ന്‌` -> `nu`, expected `n`
- `ണ്‍` -> `nu`, expected `n`
- `ਪਿਆਰਾਂ` -> `piaaran`, expected project-style `pyaaran`

### Tamil external disagreement

Only one of the 2,500 Tamil word types produced a different output between the base/latest and alternate engines:

- `சொல்லுக்கு`
  - Base/latest: `sollukku`, attested 3 times
  - Alternate: `chollukku`, attested 2 times

Both are human-attested, but the base/latest output is the more-attested form in the test lexicon.

## Isolated performance, Node 22, median ms/op

| Path | Base 6.5.0 | Alternate 6.5.0 | 6.5.1 |
|---|---:|---:|---:|
| Mixed normal | 0.1329 | 0.1582 | 0.1366 |
| Malayalam normal | 0.0739 | 0.0664 | 0.0805 |
| Tamil normal | 0.0709 | 0.0570 | 0.0755 |
| Telugu normal | 0.0756 | 0.0720 | 0.0796 |
| Kannada normal | 0.1021 | 0.0991 | 0.0987 |
| Punjabi normal | 0.0686 | 0.1115 | 0.0711 |
| Hindi normal | 0.0543 | 0.1067 | 0.0589 |
| Mixed detailed | 0.4398 | 0.3599 | 0.5367 |

6.5.1 is about 2.7% slower than the base on the mixed normal hot path, but about 13.7% faster than the alternate build. It is about 36.2% faster than the alternate build on Punjabi normal processing and 44.8% faster on Hindi normal processing because learned schwa inference is lazy rather than paid on every production call. Detailed diagnostics are heavier: about 22.0% slower than the base and 49.1% slower than the alternate in this harness.

These are development-container Node figures, not browser/TV guarantees.

## Fresh release validation

The extracted 6.5.1 final package passed:

- 32 regression cases + 500 base Unicode fuzz cases
- 6.5.1 focused hybrid/model/ranker suite + 3,000 fuzz cases
- the same focused suite with 10,000 fuzz cases
- complete `scripts/test-all.sh` release gate

The 10,000-case focused run completed with zero failures.

## Interpretation

6.5.1 is not better because its version number is larger. On the independent Tamil benchmark it is essentially identical to the base 6.5.0. Its production advantage comes from retaining that output quality while closing failures that matter specifically to synchronized lyrics: monotonic source-to-Roman boundary mapping, stronger provenance, Malayalam legacy chillu handling, shared-script contextual language identification, safe structured candidate ranking and reduced learned-model hot-path overhead.

The alternate build remains useful as the source of several linguistic ideas, but unchanged it is not the best deployment candidate because it has four reviewed output regressions, monotonic-boundary failures, span-range failures, structured-candidate corruption, stale product versioning and slower Hindi/Punjabi hot paths.
