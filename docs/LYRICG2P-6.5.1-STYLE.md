# LyricG2P 6.5.1 Song Romanization Style

Product baseline: Jellyfin LyricMotion `3.2.0`

Engine: LyricG2P `6.5.1`

Style identifier: `lyricmotion-song-ascii-1`

LyricG2P is optimized for synchronized song lyrics that a listener can read and sing from. The normal display is not intended to be a reversible scholarly transliteration standard.

## Core display contract

1. **ASCII-first Roman output.** Generated player text uses familiar Latin letters and digraphs. Academic diacritics such as `ā`, `ī`, `ū`, `ṭ`, `ḍ`, `ṇ` are not preferred by the normal player.
2. **Pronunciation/readability over mechanical code-point conversion.** Dedicated language phonology and curated lyric spellings may override a literal Unicode transform.
3. **Preserve existing Latin text.** English words, artist names, acronyms and deliberate Latin code switches are retained.
4. **Preserve punctuation and spacing.** Romanization should not rewrite lyric punctuation, separators or meaningful whitespace unless a normalization is required for a safe local transform.
5. **Represent useful vowel length with familiar ASCII forms.** The general house forms are `aa`, `ee`, `oo`. Curated conventional spellings can remain more compact when explicitly known.
6. **Use digraph aspiration.** `kh`, `gh`, `chh`, `jh`, `th`, `dh`, `ph`, `bh` are preferred to scholarly marks.
7. **Use `zh` for the Malayalam/Tamil retroflex approximant/lateral convention where the project lexicon and script path require it.** Existing curated song spellings remain authoritative.
8. **Retain gemination when it materially helps lyric reading.** Do not mechanically double every consonant merely because the orthography permits it.
9. **Do not render Punjabi tone marks.** Tone evidence may exist in the phonological IR, but the player uses familiar Roman lyric spelling.
10. **Generated Roman text defaults to lowercase.** Preserved Latin source text keeps its original casing.
11. **Multiple Roman spellings can be valid.** Evaluation and candidate ranking can accept alternatives while still preferring the LyricMotion house style.

## Display spelling versus phonetic interpretation

LyricG2P 6.5.1 explicitly separates the text shown to the listener from richer phonological diagnostics. For example, Malayalam contextual stop realization can be represented internally without forcing every phonetic alternation into the displayed spelling.

This distinction is deliberate:

```text
source grapheme
    -> phonological interpretation
    -> LyricMotion display spelling
```

The display remains readable and stable, while diagnostics can carry information needed by future learned components or language-specific analysis.

## Language-specific policy

### Malayalam

- Preserve `zh` for `ഴ` in project-style forms.
- Protect geminates from contextual singleton-stop voicing.
- Keep chillu consonants final, including legacy virama/chandrakkala + ZWJ/ZWNJ representations.
- Treat short-u/chandrakkala behavior and conjuncts as word-level phonology, not one-character substitutions.
- Internal phonetic voicing may be richer than the displayed Roman spelling.

### Tamil

- Contextual stop behavior is language-specific.
- Preserve useful distinctions among `ர/ற`, `ல/ள/ழ`, and `ந/ன/ண` through the dedicated path and lexicon policy.
- Grantha/loan letters remain first-class input.
- Normal output stays lyric-readable rather than academic.

### Telugu and Kannada

- Keep language-specific vowel, conjunct, gemination and nasal behavior.
- Do not collapse both languages into one generic South-Indian rule table.
- Preserve useful long-vowel distinctions under the house ASCII style.

### Punjabi/Gurmukhi

- Preserve addak, bindi/tippi, nukta forms and `ੜ` behavior through the dedicated parser.
- Curated common lyric spellings remain stronger evidence than a generic model candidate.
- Tone is internal phonological evidence only.
- Learned schwa probabilities in 6.5.1 are advisory, not an unconditional display rewrite.

### Devanagari family

- Script identity alone does not prove Hindi, Marathi, Bhojpuri or Nepali.
- Strong phrase context may resolve shared-script language identity.
- Isolated ambiguous forms are allowed to remain at the family level.
- House `aa/ee/oo` behavior is retained for deterministic unknown-word output, while curated forms and future accepted candidates may use more conventional spellings.

## Candidate-selection style rules

Candidate ranking is category-aware. A candidate is not selected simply because it has the largest model confidence number.

The authority order is approximately:

```text
curated lyric lexicon
    > protected morphology-assisted result
    > strong deterministic language phonology
    > origin-sensitive deterministic result
    > shared-script ambiguous result
    > weak/generic fallback
```

A learned/provider candidate therefore has more opportunity to replace a weak or ambiguous local result than a curated lexical or morphology-protected result.

Other ranking evidence includes:

- language compatibility with the line;
- candidate confidence metadata;
- ASCII song-style compliance;
- native-script residue;
- punctuation/Latin preservation;
- phonological similarity to the local deterministic result;
- candidate source type.

## Karaoke constraint

Any Romanization improvement is subordinate to synchronized-lyrics safety. Source-to-output cue boundaries must remain bounded and monotonic. Invalid or malformed Unicode is allowed to degrade gracefully, but it must not make cue mapping move backward.

## Learned-component policy in 6.5.1

Two compact sparse logistic schwa classifiers are bundled as fixed local coefficients for Hindi and Punjabi diagnostics/candidate research. They are lazy advisors:

- normal playback `romanize()` does not invoke them;
- `romanizeDetailed()` can expose keep/delete/uncertain advice and probabilities;
- curated lexical and deterministic safety rules remain authoritative;
- no remote service is called;
- no full native-to-Roman neural checkpoint is shipped.

The recorded held-out metrics attached to those coefficient tables are provenance metadata from the source implementation and are not presented as independently reproduced 6.5.1 benchmark results.
