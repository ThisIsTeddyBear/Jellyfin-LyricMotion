# Third-Party Notices

Jellyfin LyricMotion is an **unofficial** community project and is not affiliated with or endorsed by the Jellyfin Project, Apple Inc., or the authors of the projects listed below.

## am-lyrics

The lyric motion design and duration-based animation approach were inspired by and adapted after reviewing:

- Project: `binimum/am-lyrics`
- License: Mozilla Public License 2.0 (MPL-2.0)
- Repository: https://github.com/binimum/am-lyrics

Where source-level portions qualify as MPL-covered modifications or derivative work, the relevant LyricMotion source files are distributed under MPL-2.0 and carry the MPL notice.

## Jellyfin / Jellyfin Web

LyricMotion patches an **already installed** Jellyfin Web client.

- Jellyfin Web is licensed under GPL-2.0.
- This repository intentionally does **not** redistribute Jellyfin Web's generated `index.html`, JavaScript bundles, or other compiled web assets.
- The installer modifies the user's own local Jellyfin Web `index.html` to load LyricMotion's separate JavaScript and CSS assets.

Jellyfin:
https://github.com/jellyfin/jellyfin

Jellyfin Web:
https://github.com/jellyfin/jellyfin-web

## Trademarks

"Jellyfin" is used descriptively to identify compatibility. This project is unofficial.

Apple, Apple Music, and related marks belong to Apple Inc. LyricMotion does not ship Apple code, fonts, artwork, lyrics, or services.

## Unicode ICU transliteration data

The lazy local romanization fallback table in `src/jellyfin-lyric-romanizer.js` was generated from Unicode ICU transliteration data (`Any-Latin` / `Latin-ASCII`). LyricMotion does not require ICU at runtime.

- Project: ICU (International Components for Unicode)
- Source: https://github.com/unicode-org/icu
- Copyright: Copyright © 1991-2022 Unicode, Inc.
- License: MIT

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Hindi/Punjabi schwa pronunciation-model research

LyricG2P 6.5.1 contains two compact sparse logistic schwa keep/delete coefficient tables derived from the alternate 6.5 implementation and attributed there to pronunciation-lexicon research associated with Aryaman Arora's Hindi/Punjabi schwa-deletion work. The release does not bundle the source pronunciation datasets.

- Project: `aryamanarora/schwa-deletion`
- Repository: https://github.com/aryamanarora/schwa-deletion
- License: MIT
- Copyright: Copyright (c) 2019 Aryaman Arora
- Related paper: https://aclanthology.org/2020.acl-main.696/

The coefficient tables are used as **lazy advisory evidence** in `romanizeDetailed()` and hybrid candidate research. Normal playback Romanization remains deterministic; there is no network inference and no general-purpose neural transliteration checkpoint. Recorded held-out metrics attached to the coefficient tables are retained as provenance metadata and are explicitly marked as not independently reproduced by this release.

## Transliteration research references (not bundled dependencies)

LyricG2P 6/6.5/6.5.1 was designed after reviewing public transliteration/G2P literature and project documentation including AI4Bharat Aksharantar/IndicXlit and Google Research's Dakshina dataset documentation. No model weights, dataset records, training code, service code, or runtime dependency from those projects is bundled in LyricMotion. They are research references only.

The repository contains development-only corpus collection/evaluation helpers. Public datasets and third-party/provider Romanizations referenced by those tools are **not bundled** in the runtime or release ZIP. Their own licenses, terms and redistribution restrictions apply independently.

- IndicXlit: https://github.com/AI4Bharat/IndicXlit
- Aksharantar paper: https://aclanthology.org/2023.findings-emnlp.4/
- Dakshina dataset: https://github.com/google-research-datasets/dakshina
- Hindi/Punjabi G2P schwa work: https://aclanthology.org/2020.acl-main.696/

Romanization in release 3.2.0 / LyricG2P 6.5.1 is fully local/on-device and does not call these projects or any third-party Romanization service at runtime.
