# Google Romanization

On desktop and mobile, native-script lyrics can be shown in a Romanized view. After the user enables it, LyricMotion sends each needed lyric line to Google Translate's Romanization endpoint (`dt=rm`) and displays a plain-ASCII result.

Original lyric timing is unchanged. For ELRC, cue positions are proportionally mapped onto the returned Romanized line. If Google is unavailable or a request fails, the original line remains visible and the control stays available.

Romanization sends lyric text to Google. Do not enable it for private or unpublished lyrics that must stay on-device. Latin-only lyrics do not show the control.
