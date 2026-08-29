ARG JELLYFIN_TAG=10.11.11
FROM jellyfin/jellyfin:${JELLYFIN_TAG}

USER root

COPY src/jellyfin-lyric-motion.js /tmp/jellyfin-lyric-motion.js
COPY src/jellyfin-lyric-motion.css /tmp/jellyfin-lyric-motion.css
COPY VERSION /tmp/jellyfin-lyric-motion-version

RUN set -eux; \
    WEB_DIR=/jellyfin/jellyfin-web; \
    VERSION="$(tr -d '\r\n' < /tmp/jellyfin-lyric-motion-version)"; \
    grep -Fq "const VERSION = '$VERSION';" /tmp/jellyfin-lyric-motion.js; \
    test -n "$VERSION"; \
    case "$VERSION" in *[!A-Za-z0-9._+-]*) echo 'Unsafe VERSION value' >&2; exit 1;; esac; \
    test -f "$WEB_DIR/index.html"; \
    cp "$WEB_DIR/index.html" "$WEB_DIR/index.html.before-jellyfin-lyric-motion"; \
    cp /tmp/jellyfin-lyric-motion.js "$WEB_DIR/jellyfin-lyric-motion.js"; \
    cp /tmp/jellyfin-lyric-motion.css "$WEB_DIR/jellyfin-lyric-motion.css"; \
    rm -f "$WEB_DIR/jellyfin-lyric-romanizer.js"; \
    sed -i -E "s#<link[^>]*href=[\"'][^\"']*(jellyfin-lyric-motion|apple-karaoke)\.css(\?[^\"']*)?[\"'][^>]*>##Ig; s#<script[^>]*src=[\"'][^\"']*(jellyfin-lyric-motion|apple-karaoke)\.js(\?[^\"']*)?[\"'][^>]*>[[:space:]]*</script>##Ig" "$WEB_DIR/index.html"; \
    grep -q 'runtime.bundle.js' "$WEB_DIR/index.html"; \
    sed -i -E "0,/<script[^>]*src=[\"'][^\"']*runtime\.bundle\.js[^\"']*[\"'][^>]*>/s##<link rel=\"stylesheet\" href=\"jellyfin-lyric-motion.css?v=${VERSION}\"><script defer=\"defer\" src=\"jellyfin-lyric-motion.js?v=${VERSION}\"></script>&#" "$WEB_DIR/index.html"; \
    grep -Fq "<link rel=\"stylesheet\" href=\"jellyfin-lyric-motion.css?v=${VERSION}\"><script defer=\"defer\" src=\"jellyfin-lyric-motion.js?v=${VERSION}\"></script><script" "$WEB_DIR/index.html"; \
    rm -f /tmp/jellyfin-lyric-motion.js /tmp/jellyfin-lyric-motion.css /tmp/jellyfin-lyric-motion-version
