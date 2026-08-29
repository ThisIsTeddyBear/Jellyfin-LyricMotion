# LyricG2P 6.8.0 Phrase Decoder

Release host: Jellyfin LyricMotion 3.2.5/3.2.6 development line  
Romanizer: `6.8.0`

## Goal

Lyrics providers often write English by sound in a local script. A word-at-a-time lookup cannot reliably distinguish `to` from `too`, or compensate for script-specific adaptations such as Japanese final vowels and Korean r/l ambiguity. 6.8 performs conservative phrase-level reconstruction locally in the browser.

## Algorithm

```text
native-script spans
  -> existing script G2P baseline
  -> bounded phonetic adapter forms
  -> exact pronunciation-signature lookup
  -> bounded weighted fuzzy lookup when exact lookup misses
  -> English phrase Viterbi decoding (16-state beam)
  -> confidence + native-word safety gates
  -> source-boundary map recomposition
```

The weighted phonetic distance treats predictable vowel and host-script consonant substitutions as lower-cost than unrelated edits. Fuzzy candidates are never sufficient to activate recovery on their own. A phrase needs at least two independent high-confidence English anchors, and a changed long phonetic surface must have positive phrase support.

## Script adapters

The adapters are declarative data, separate from G2P control flow:

- Devanagari: common `vh`/`w` and vowel spelling accommodation.
- Tamil, Malayalam and Bengali: predictable voiced-stop, final-vowel and glide accommodation.
- Kana: long-vowel marker removal, final epenthetic vowel, r/l and b/v accommodation.
- Hangul: `eo`/`eu` syllable accommodation plus r/l and b/v ambiguity.

Examples verified by regression tests:

```text
आई वांट टू बी विथ यू       -> I want to be with you
ஐ வான்ட் டு பீ வித் யூ    -> I want to be with you
ഐ വാണ്ട് ടു ബി വിത്ത് യു  -> I want to be with you
আই ওয়ান্ট টু বি উইথ ইউ   -> I want to be with you
アイ ラブ ユー            -> I love you
アイ ウォント トゥ ビー ウィズ ユー -> I want to be with you
아이 러브 유              -> I love you
```

## Safety policy

Native lexicon hits remain protected. One-word lookalikes and ordinary native lines do not activate the decoder. Sentence boundaries, including Indic danda, terminate a recovery group. Perso-Arabic text remains outside automatic English reconstruction because omitted vowels make a confident deterministic decision impossible.

Repeated lyric vocables must also have explicit phrase-model evidence before recovery is activated. This prevents native rhythm lines such as `ता रा रम पम` and `धिन ता धिन ता` from becoming accidental English, while preserving supported English phrases such as `टू बी ऑर नॉट टू बी -> To be or not to be`.

Devanagari `-ए-` between native-script words is recognized as the Persian izāfat linker and is likewise protected. For example, `जान-ए-मन` and `नूर-ए-नज़र` remain `jaan-e-man` and `noor-e-nazar` even when repetition would otherwise create several apparent English `a` anchors.
