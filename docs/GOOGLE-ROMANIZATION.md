# Google Romanization

LyricMotion has two Romanization routes. Indian Brahmic scripts use the local,
offline LyricG2P 6.5.1 engine restored from the Aug 28, 2026 baseline. Every
other native script uses Google Translate's `dt=rm` response.

When a desktop or mobile user selects Romanized view for a non-Indic lyric, the
runtime sends its complete line to `translate.googleapis.com` with `sl=auto`,
`tl=en`, and `dt=rm`. The line remains native until a valid Latin response
arrives. Google output is normalized to readable plain ASCII.

The client uses a 1,500-character line limit, a six-second abort timeout, at
most three retry attempts with exponential backoff, three concurrent requests,
and a current-song in-memory LRU cache. Invalid, blocked, or failed responses
leave that line native. The Romanization button remains available.

Google does not provide source-character cue boundaries. For enhanced LRC,
LyricMotion reprojects existing cue positions into the returned Latin line;
source timestamps remain untouched. LyricG2P performs its own local boundary
mapping for Indian scripts.

Selecting Romanized view for a non-Indic lyric transmits its text to Google. Do
not enable it for private or unpublished lyrics that must stay on-device.
