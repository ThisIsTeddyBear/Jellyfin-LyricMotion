ARG JELLYFIN_TAG=latest
FROM jellyfin/jellyfin:${JELLYFIN_TAG}

USER root

COPY src/jellyfin-lyric-motion.js /tmp/jellyfin-lyric-motion.js
COPY src/jellyfin-lyric-motion.css /tmp/jellyfin-lyric-motion.css

RUN set -eux; \
    WEB_DIR=/jellyfin/jellyfin-web; \
    test -f "$WEB_DIR/index.html"; \
    cp "$WEB_DIR/index.html" "$WEB_DIR/index.html.before-jellyfin-lyric-motion"; \
    sed -i -E '/(jellyfin-lyric-motion|apple-karaoke)\.(css|js)/d' "$WEB_DIR/index.html"; \
    grep -q 'runtime.bundle.js' "$WEB_DIR/index.html"; \
    sed -i 's#<script defer="defer" src="runtime.bundle.js#<link rel="stylesheet" href="jellyfin-lyric-motion.css?v=3.0.0"><script defer="defer" src="jellyfin-lyric-motion.js?v=3.0.0"></script><script defer="defer" src="runtime.bundle.js#' "$WEB_DIR/index.html"; \
    cp /tmp/jellyfin-lyric-motion.js "$WEB_DIR/jellyfin-lyric-motion.js"; \
    cp /tmp/jellyfin-lyric-motion.css "$WEB_DIR/jellyfin-lyric-motion.css"; \
    rm -f /tmp/jellyfin-lyric-motion.js /tmp/jellyfin-lyric-motion.css
