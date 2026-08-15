# LyricG2P 6.5 Architecture

Release: `3.2.0`  
Romanizer: `6.5.0`

LyricG2P 6.5 advances the in-house offline Romanizer from the 6.0 architecture foundation into a production phonology pipeline. It keeps the deterministic, zero-network runtime and whole-line karaoke boundary model, while moving language evidence, morphology, phonological features, provenance, n-best variants and candidate ranking closer to the decisions that produce displayed lyrics.

## Product Romanization standard

The default display contract is `lyricmotion-song-ascii-1`:

- familiar song-style ASCII rather than academic transliteration;
- `aa`, `ee`, `oo` for useful long-vowel distinctions;
- aspirates written with familiar digraphs such as `kh`, `gh`, `th`, `dh`, `ph`, `bh`;
- Malayalam/Tamil `ഴ/ழ` represented with `zh` unless a curated conventional word spelling overrides it;
- source Latin text preserved verbatim;
- generated Roman text lower-case by default;
- correctness target: readable and singable lyric spelling, not reversible scholarly transliteration.

The style is exported as `JellyfinLyricRomanizer.romanizationStyle` so evaluation and future learned candidates can target a named contract rather than an undocumented convention.

## Production pipeline

```text
source line
  -> NFC-aware script/span segmentation
  -> shared-script language evidence
  -> exact lyric lexicon
  -> language-specific grapheme/token parser
  -> phonological IR + contextual rewrites
  -> known-stem morphology, when safely supported
  -> song-style Roman spelling
  -> transform-carried source/output provenance
  -> complete-line Roman result
  -> source-boundary mapping for ELRC karaoke cues
```

The Romanizer still converts the complete line before timed cue boundaries are mapped. Cue timestamps are not changed.

## Shared-script language evidence

Script alone cannot decide which language a Devanagari word belongs to. 6.5 therefore separates `scriptLanguage` from contextual `language` evidence.

The initial profiles cover:

- Devanagari: Hindi, Marathi, Bhojpuri and Nepali evidence;
- Perso-Arabic: Urdu and Punjabi/Shahmukhi evidence.

A token is only assigned a narrower language when lexical/pattern evidence is decisive or when a strong same-script neighboring span provides conservative context. Ambiguous isolated words remain ambiguous. For example, an isolated shared word such as `प्रेम` is not forcibly declared Hindi or Marathi.

This evidence is exposed through:

```js
JellyfinLyricRomanizer.detectLanguages(text)
JellyfinLyricMotion.detectRomanizationLanguages(text)
```

## Canonical phonological IR

6.5 adds an explicit internal representation for dedicated Indic parsers. Each token can expose:

- consonant place/manner;
- voicing and aspiration;
- gemination/cluster state;
- vowel quality and length;
- nasal realization;
- schwa keep/delete evidence;
- Punjabi tone evidence;
- contextual rewrite rules;
- source and Roman output ranges.

Example development API:

```js
JellyfinLyricMotion.romanizationIR('करता ਪੰਜਾਬੀ')
```

The representation is intentionally more structural than the final Latin text. Punjabi tone evidence, for example, can exist internally without adding tone marks to the user-facing Roman lyric.

## Morphology in production

6.0 exposed suffix hints mainly for diagnostics. 6.5 can use a known lexical stem to produce a full inflected word while retaining the phonological suffix from the complete parsed form.

This avoids the unsafe pattern of independently Romanizing a stem and suffix and concatenating strings. Current regression examples include:

```text
ಪ್ರೀತಿಗಳು -> preetigalu
காதல்கள் -> kaadhalkal
ప్రేమలు -> premalu
प्यारों -> pyaaron
ਪਿਆਰਾਂ -> pyaaran
ਦਿਲਾਂ -> dilan
ਕੁੜੀਆਂ -> kudiyan
```

The path is reported as `morphology+phonology` when this production decision is used.

## Malayalam Unicode/chillu correction

Legacy Malayalam text can encode chillu behavior using a consonant plus chandrakkala plus ZWJ/ZWNJ rather than a modern atomic chillu code point. Earlier logic could discard the joiner and later append the native final short-u heuristic, producing outputs such as `ന്‍ -> nu`.

6.5 carries the joiner through tokenization and treats the legacy chillu sequence as a dead final consonant:

```text
ന്‍ -> n
ന്‌ -> n
ണ്‍ -> n
ൻ  -> n
ൺ  -> n
```

Segmentation was fixed at the same time so diagnostics no longer create a bogus extra language span for the joiner.

## Schwa decisions are explicit

Hindi/Devanagari and Punjabi/Gurmukhi keep deterministic production rules in 6.5, but implicit-vowel decisions are now represented as named keep/delete evidence in the phonological IR. This makes the difficult schwa subsystem testable and replaceable by a compact trained classifier without rewriting the rest of the engine.

No statistical schwa model is shipped in 3.2.0.

## Punjabi tone evidence

Gurmukhi historical voiced aspirates and relevant `ਹ` contexts now generate internal tone evidence. The evidence is diagnostic/phonological, not a request to write tone marks into ordinary song Romanization. This prevents display style from being confused with pronunciation structure.

## Transform-level provenance

Dedicated word transforms carry per-token source and output ranges through parsing and contextual rewrites. `romanizeDetailed()` marks these units as `transform-carried`. Generic paths can still fall back to boundary reconstruction.

This is important for karaoke because a visually expanded Roman chunk must remain tied to the native grapheme that produced it. The public `mapBoundary()` API remains the timing-safe interface used by LyricMotion.

## Confidence semantics

The values exported by 6.5 are deliberately named evidence scores, not probabilities:

```text
confidenceKind: evidence-score-not-probability
```

New tooling can measure how those scores behave on a held-out corpus:

```bash
node scripts/calibrate-lyricg2p65-confidence.js corpus.tsv report.json
```

The report groups examples by evidence-score bucket and calculates calibration error against exact and style-normalized correctness. The constants should only be recalibrated once an independent corpus is large enough.

## N-best style variants

`romanizationVariants(text, limit)` provides a preferred LyricMotion spelling plus conservative compact-vowel/gemination style alternatives. These alternatives are useful for evaluation and future candidate ranking.

They are **style-generated alternatives**, not claims that a human corpus attested every returned form.

## Candidate ranker v2

`rankCandidates()` can combine:

- the deterministic LyricG2P result;
- curated lexical candidates;
- future learned candidates;
- candidate evidence scores;
- song-style ASCII compliance;
- source Latin preservation;
- punctuation and length sanity;
- phonological closeness to the local deterministic result.

Academic-diacritic candidates are intentionally penalized for the default UI style. Candidate metadata can include a language hint, which is checked against the line-level language evidence. A future learned model can therefore be context-aware without becoming the sole authority.

## Origin/name risk evidence

Detailed spans now expose conservative token classes and origin hints for cases such as:

- Devanagari/Gurmukhi nukta and likely Persian/Arabic/foreign orthography;
- Tamil Grantha/foreign letters;
- Sanskrit-like clusters in Malayalam, Telugu and Kannada;
- unvowelled Perso-Arabic text.

Proper names are not guessed from orthography alone. The engine reports that metadata is needed rather than inventing a name classification.

## Research and corpus tooling

3.2.0 contains development-only tools, not third-party datasets:

- `scripts/import-dakshina.py`: imports Dakshina lexicons and keeps multiple Romanizations plus attestation counts;
- `scripts/prepare-lyricg2p-dataset.py`: leakage-resistant train/dev/test splitting with native-token, lemma and song grouping, plus optional artist isolation;
- `scripts/evaluate-lyricg2p65.js`: exact, CER, top-3, style-normalized and error-taxonomy evaluation;
- `scripts/calibrate-lyricg2p65-confidence.js`: evidence-score calibration report;
- `scripts/benchmark-lyricg2p65.js`: deterministic local runtime benchmark;
- `research/train_tiny_transformer.py`: research-only character Transformer experiment with separate source and Roman target vocabularies.

The separate decoder vocabulary is a hard safety property of the experiment: a learned candidate cannot emit source-script symbols merely because those symbols existed in the encoder vocabulary.

## Learned-model gate

`learnedModelBundled` remains `false`.

That is deliberate. A model is eligible only after it:

1. beats the deterministic 6.5 engine on an independent, leakage-resistant held-out song corpus;
2. improves difficult categories such as names, loans, schwa and context rather than only memorizing common tokens;
3. does not regress per-language quality or source-boundary behavior;
4. emits only valid Roman target text;
5. fits the browser startup, memory and inference budget;
6. remains completely local at runtime;
7. has redistributable model/data licensing.

The intended architecture is hybrid:

```text
lexicon candidate ---------+
deterministic G2P ---------+-> ranker -> displayed result
learned n-best candidates -+
morphology/context --------+
```

A large generic transliterator is not accepted simply because one exists.

## Public development API

```js
JellyfinLyricMotion.romanization()
JellyfinLyricMotion.explainRomanization(text)
JellyfinLyricMotion.detectRomanizationLanguages(text)
JellyfinLyricMotion.romanizationIR(text)
JellyfinLyricMotion.romanizationVariants(text, 3)
JellyfinLyricMotion.exportRomanizationCase(text, expected)
JellyfinLyricMotion.rankRomanizationCandidates(text, candidates)
JellyfinLyricMotion.selectRomanizationCandidate(text, candidates)
```

`exportRomanizationCase()` intentionally exports a small reproduction fixture, not Jellyfin server details, song files or private account data.

## Validation in this release

The checked-in 6.5 regression suite covers 32 explicit cases plus 500 deterministic Unicode fuzz cases. It checks representative Indic output, mixed Latin/native lines, Malayalam legacy chillu sequences, shared-script language evidence, production morphology, schwa/tone IR, n-best output, candidate ranking, transform provenance and monotonic cue-boundary mapping.

`research/lyricg2p65-regression-seed.tsv` is a smoke/regression corpus. Its score must not be presented as independent language accuracy.

## External research references

The implementation was informed by, but does not bundle, these projects/datasets:

- Dakshina: https://github.com/google-research-datasets/dakshina
- Aksharantar: https://aclanthology.org/2023.findings-emnlp.4/
- IndicXlit: https://github.com/AI4Bharat/IndicXlit
- Hindi/Punjabi orthographic schwa G2P: https://aclanthology.org/2020.acl-main.696/
- ONNX Runtime Web deployment reference for future browser inference: https://onnxruntime.ai/docs/tutorials/web/

## What is still benchmark-gated

6.5 completes the architecture and tooling needed for learned experiments, but it does not fabricate results that require data that is not bundled in the release. The remaining empirical work is to import licensed public corpora and a curated song-domain gold set, train candidate models, compare them against 6.5 on genuinely held-out data, calibrate evidence scores from those results, and only then decide whether a browser model earns inclusion.
