# LyricG2P 6.5.1 Corpus, Evaluation and Model Research

Release: `3.2.0`

LyricG2P does not accept a learned component on anecdotal examples. The research path is built around licensed data, leakage-resistant splits, reproducible metrics and a deterministic-engine baseline.

## Target corpus shape

A real gold set should contain Malayalam, Tamil, Telugu, Kannada, Punjabi and Hindi with explicit coverage of ordinary vocabulary, inflections, compounds, proper names, film/song vocabulary, slang, Sanskrit loans, Persian/Arabic loans, English loans, difficult clusters, mixed-script lines and complete lyric lines.

Provider-supplied Romanization can be collected as evidence, but it should be normalized, deduplicated, cross-checked where possible and reviewed before being accepted as gold truth.

## Public research sources

### Dakshina

Dakshina provides native-script text, human-attested Romanization lexicons with alternative spellings/attestation counts, and manually Romanized full strings for 12 South Asian languages.

Source: `https://github.com/google-research-datasets/dakshina`

Import an extracted dataset with:

```bash
python scripts/import-dakshina.py /path/to/dakshina /tmp/dakshina.tsv
```

The importer keeps multiple references plus their counts rather than collapsing a word to one arbitrary spelling.

### Aksharantar / IndicXlit

Aksharantar provides a much larger transliteration research corpus across 21 Indic languages, and IndicXlit is the associated multilingual Transformer baseline.

Paper: `https://aclanthology.org/2023.findings-emnlp.4/`  
Project: `https://github.com/AI4Bharat/IndicXlit`

These datasets/models are research references. They are not bundled by this project.

### Orthographic schwa research

Hindi/Punjabi G2P work shows why orthographic schwa keep/delete decisions deserve a learned experiment rather than ever-growing hand rules.

Paper: `https://aclanthology.org/2020.acl-main.696/`

6.5 exposes schwa decisions in the IR, which creates a stable feature/evaluation boundary for that future experiment.

## Leakage-resistant split

Input TSV columns:

```text
language  native  romanized  [source artist song lemma origin]
```

Run:

```bash
python scripts/prepare-lyricg2p-dataset.py corpus.tsv research/corpus/splits
```

Add `--artist-isolation` for a stricter robustness split. Rows sharing the same language/native token, lemma or song are unioned into the same component before deterministic assignment, so repeated forms cannot leak across train/dev/test through ordinary row-level shuffling.

## Evaluation

The evaluator accepts references separated by `||`:

```text
language<TAB>native<TAB>romanization 1||romanization 2<TAB>source
```

Run:

```bash
node scripts/evaluate-lyricg2p65.js corpus.tsv report.json
```

Metrics include:

- exact accuracy;
- character error rate (CER);
- top-3 accepted accuracy using LyricG2P style variants;
- style-normalized accuracy;
- per-language summaries;
- approximate error categories including vowel length, gemination, aspiration, voicing, nasal realization, schwa/implicit vowel and native-script residue.

The evaluator accepts multiple references because human Romanization is genuinely variable.

## Confidence calibration

Run:

```bash
node scripts/calibrate-lyricg2p65-confidence.js corpus.tsv calibration.json
```

This measures whether evidence-score bands correlate with exact/style-normalized correctness. It does not convert current scores into probabilities by declaration.

## Tiny learned-model experiment

`research/train_tiny_transformer.py` is a research harness for a compact character Transformer. It deliberately has separate source and target vocabularies, so target decoding can be constrained to the Roman alphabet represented by training references.

The harness is not imported by the browser runtime. A checkpoint created by it is not release-worthy until it beats the deterministic 6.5 baseline on independent data.

## Model acceptance gate

A candidate model must satisfy all of the following:

1. train/test leakage protections verified;
2. deterministic 6.5 baseline recorded on the same held-out set;
3. statistically meaningful improvement on exact/CER and difficult categories;
4. no material per-language regressions hidden by aggregate score;
5. Roman-only target decoding and zero native-script residue;
6. karaoke source-boundary behavior remains deterministic and testable;
7. model/runtime license allows redistribution;
8. browser cold load, warm inference and memory fit the product budget;
9. offline operation with deterministic fallback;
10. no requirement to trust attention weights as karaoke alignment.

ONNX Runtime Web is one possible future browser path, with WASM as the compatibility path and WebGPU as an optional accelerator. It is not added until a model earns inclusion.

Reference: `https://onnxruntime.ai/docs/tutorials/web/`

## Checked-in smoke data

`research/lyricg2p65-regression-seed.tsv` exists to keep known cases reproducible. It is intentionally small and overlaps engineering regressions, so its score is not a valid claim about real-world language accuracy.
