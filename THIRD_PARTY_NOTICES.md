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

## Transliteration research references (not bundled dependencies)

LyricG2P 5 was designed after reviewing public transliteration/G2P literature and project documentation including AI4Bharat Aksharantar/IndicXlit and Google Research's Dakshina dataset documentation. No model weights, dataset records, training code, service code, or runtime dependency from those projects is bundled in LyricMotion. They are research references only.

- IndicXlit: https://github.com/AI4Bharat/IndicXlit
- Aksharantar paper: https://aclanthology.org/2023.findings-emnlp.4/
- Dakshina dataset: https://github.com/google-research-datasets/dakshina
- Hindi/Punjabi G2P schwa work: https://aclanthology.org/2020.acl-main.696/

Romanization in release 3.1.0 is fully local/on-device and does not call these projects or any third-party Romanization service at runtime.
