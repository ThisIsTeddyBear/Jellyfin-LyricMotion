# Google Romanization

LyricMotion has one Romanization path: Google Translate's `dt=rm` response.

When a desktop or mobile user selects Romanized view for a native-script lyric, the runtime sends the complete line to `translate.googleapis.com` with `sl=auto`, `tl=en`, and `dt=rm`. The line stays native until a valid Latin response arrives. The returned scholarly Latin is normalized to plain ASCII: combining marks are removed, curly apostrophes/dashes are made ordinary punctuation, and ISO-style Indic `c` is shown as everyday `ch` (including Gurmukhi `’ਚ` contractions). Latin-only lyrics do not expose the control.

The client uses a 1,500-character line limit, a six-second abort timeout, at most three retry attempts with exponential backoff, three concurrent requests, and a current-song in-memory LRU cache. Invalid, blocked, or failed responses leave the native text unchanged. The Romanization button does not depend on provider availability.

Google does not provide source-character cue boundaries. For enhanced LRC, LyricMotion proportionally reprojects the existing cue character positions into the returned Latin line; source timestamps remain untouched.

Selecting Romanized view transmits lyric text to Google. Do not enable it for private or unpublished lyrics that must stay on-device.
