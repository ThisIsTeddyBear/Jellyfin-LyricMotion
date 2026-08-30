ARG JELLYFIN_TAG=10.11.11
FROM jellyfin/jellyfin:${JELLYFIN_TAG}

USER root

COPY src/jellyfin-lyric-motion.js /tmp/jellyfin-lyric-motion.js
COPY src/jellyfin-lyric-motion.css /tmp/jellyfin-lyric-motion.css
COPY src/jellyfin-lyric-romanizer.js /tmp/jellyfin-lyric-romanizer.js
COPY VERSION /tmp/jellyfin-lyric-motion-version
COPY LYRICG2P_VERSION /tmp/jellyfin-lyricg2p-version

RUN set -eux; \
    WEB_DIR=/jellyfin/jellyfin-web; \
    VERSION="$(tr -d '\r\n' < /tmp/jellyfin-lyric-motion-version)"; \
    LYRICG2P_VERSION="$(tr -d '\r\n' < /tmp/jellyfin-lyricg2p-version)"; \
    grep -Fq "const VERSION = '$VERSION';" /tmp/jellyfin-lyric-motion.js; \
    grep -Fq "const VERSION = '$LYRICG2P_VERSION';" /tmp/jellyfin-lyric-romanizer.js; \
    test -n "$VERSION"; \
    test -n "$LYRICG2P_VERSION"; \
    case "$VERSION" in *[!A-Za-z0-9._+-]*) echo 'Unsafe VERSION value' >&2; exit 1;; esac; \
    case "$LYRICG2P_VERSION" in *[!A-Za-z0-9._+-]*) echo 'Unsafe LYRICG2P_VERSION value' >&2; exit 1;; esac; \
    test -f "$WEB_DIR/index.html"; \
    cp "$WEB_DIR/index.html" "$WEB_DIR/index.html.before-jellyfin-lyric-motion"; \
    cp /tmp/jellyfin-lyric-motion.js "$WEB_DIR/jellyfin-lyric-motion.js"; \
    cp /tmp/jellyfin-lyric-motion.css "$WEB_DIR/jellyfin-lyric-motion.css"; \
    cp /tmp/jellyfin-lyric-romanizer.js "$WEB_DIR/jellyfin-lyric-romanizer.js"; \
    sed -i -E "s#<link[^>]*href=[\"'][^\"']*(jellyfin-lyric-motion|apple-karaoke)\.css(\?[^\"']*)?[\"'][^>]*>##Ig; s#<script[^>]*src=[\"'][^\"']*(jellyfin-lyric-motion|apple-karaoke)\.js(\?[^\"']*)?[\"'][^>]*>[[:space:]]*</script>##Ig" "$WEB_DIR/index.html"; \
    grep -q 'runtime.bundle.js' "$WEB_DIR/index.html"; \
    sed -i -E "0,/<script[^>]*src=[\"'][^\"']*runtime\.bundle\.js[^\"']*[\"'][^>]*>/s##<link rel=\"stylesheet\" href=\"jellyfin-lyric-motion.css?v=${VERSION}\"><script defer=\"defer\" src=\"jellyfin-lyric-motion.js?v=${VERSION}\&g2p=${LYRICG2P_VERSION}\"></script>&#" "$WEB_DIR/index.html"; \
    grep -Fq "<link rel=\"stylesheet\" href=\"jellyfin-lyric-motion.css?v=${VERSION}\"><script defer=\"defer\" src=\"jellyfin-lyric-motion.js?v=${VERSION}&g2p=${LYRICG2P_VERSION}\"></script><script" "$WEB_DIR/index.html"; \
    rm -f /tmp/jellyfin-lyric-motion.js /tmp/jellyfin-lyric-motion.css /tmp/jellyfin-lyric-romanizer.js /tmp/jellyfin-lyric-motion-version /tmp/jellyfin-lyricg2p-version
