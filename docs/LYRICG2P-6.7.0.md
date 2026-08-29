# LyricG2P 6.7.0 Architecture

Release host: Jellyfin LyricMotion 3.2.5/3.2.6 development line  
Romanizer: `6.7.0`

## Purpose

6.7 makes the in-house Romanizer extensible without turning each new language into another copy of the routing logic. It preserves the existing offline pronunciation engines, contextual English recovery, boundary mapping and curated high-confidence pronunciations.

## Handler pipeline

```text
Unicode input
  -> ordered script handler registry
  -> complete word/run G2P handler
  -> profile normalization rules
  -> shared output normalization
  -> provenance, language and ELRC boundary diagnostics
```

Each handler has a stable identifier and declares:

- how its script is recognized;
- how a complete native run is Romanized;
- the script and language identity used by diagnostics.

The registry is checked when the runtime loads for duplicate or incomplete handlers. The same registry powers display conversion and language diagnostics, eliminating the prior risk of dispatch and reporting drifting apart.

## Data versus algorithm

Unicode character mappings, pronunciation lexicons and profile cleanup rules are language data. The reusable algorithm performs segmentation, full-word parsing, syllable/token construction, context rules, morphology, candidate ranking, output cleanup and source-to-output boundary mapping. Lexicon hits are intentionally explicit and provenance-tagged; unknown words still use the general G2P parser.

Tamil and Malayalam cleanup rules are now declared by their profiles. Adding another profile rule no longer requires adding another language-name branch in the engine.

## Guarantees and limits

Romanization stays fully local and deterministic. ELRC timestamps remain unchanged, and source boundaries are kept monotonic. No deterministic spelling-only Romanizer can infer every pronunciation in inherently ambiguous writing systems; detailed diagnostics continue to expose confidence and fallback paths instead of presenting uncertain output as certain.
