/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Jellyfin LyricMotion - unofficial Jellyfin Web lyrics enhancement.
 */
(function () {
    'use strict';

    const VERSION = '3.2.0';
    const LYRICG2P_VERSION = '6.5.1';

    /*
     * A duplicated script tag used to create a second DOM observer, route-hook
     * set and animation scheduler even though fetch/XHR wrapping was guarded.
     * Fail closed if LyricMotion is already alive in this page.
     */
    const existingRuntime =
        window.JellyfinLyricMotion
        || window.AppleKaraoke;

    if (
        existingRuntime
        && existingRuntime.version
    ) {
        console.warn(
            '[JellyfinLyricMotion]',
            `duplicate runtime ignored; active version ${existingRuntime.version}`
        );
        return;
    }

    /*
     * TV POLICY: stock Jellyfin only.
     *
     * LyricMotion is intentionally a desktop/mobile enhancement. Every TV or
     * ten-foot client we can identify exits before network interception, DOM
     * observation, media hooks, styling, atmosphere or animation is installed.
     * Jellyfin therefore owns the complete TV lyrics experience.
     *
     * Keep this detector dependency-free and old-engine friendly: it must be
     * able to run on embedded browsers that are much older than the clients
     * LyricMotion enhances on desktop/mobile.
     */
    function detectStockJellyfinTvEnvironment() {
        const navigatorObject =
            (window && window.navigator)
            || (typeof navigator !== 'undefined' ? navigator : null);

        const ua = String(
            (navigatorObject && navigatorObject.userAgent)
            || ''
        ).toLowerCase();

        const platform = String(
            (navigatorObject && navigatorObject.platform)
            || ''
        ).toLowerCase();

        const haystack = `${ua} ${platform}`;
        const markers = [
            ['lg-webos', ['web0s', 'webos', 'netcast']],
            ['samsung-tizen', ['tizen', 'samsung smart-tv', 'samsung smarttv']],
            ['hbbtv', ['hbbtv', 'ce-html']],
            ['hisense-vidaa', ['vidaa', 'hisense tv', 'hisense-tv']],
            ['vizio', ['vizio', 'viziotv']],
            ['panasonic-viera', ['viera', 'panasonic tv', 'panasonic-tv']],
            ['sony-bravia', ['bravia', 'sony_tv', 'sony tv']],
            ['philips-tv', ['philips tv', 'philips-tv']],
            ['roku', ['roku', 'rokutv']],
            ['fire-tv', ['fire tv', 'firetv']],
            ['android-tv', ['android tv', 'androidtv', 'google tv', 'googletv', 'jellyfin android tv']],
            ['apple-tv', ['appletv', 'apple tv', 'tvos']],
            ['chromecast', ['crkey', 'chromecast']],
            ['opera-tv', ['opera tv', 'opera-tv', 'inettvbrowser']],
            ['generic-smart-tv', ['smart tv', 'tv browser', 'tvbrowser', 'dlnadoc']],
            ['game-console-tv', ['playstation', 'xbox']]
        ];

        for (let index = 0; index < markers.length; index += 1) {
            const family = markers[index][0];
            const tokens = markers[index][1];

            for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 1) {
                if (haystack.indexOf(tokens[tokenIndex]) >= 0) {
                    return { detected: true, family };
                }
            }
        }

        /* Amazon Fire TV model identifiers are commonly AFT*. */
        if (/(^|[;\s(])aft[a-z0-9]+(?:[;\s)]|$)/i.test(haystack)) {
            return { detected: true, family: 'fire-tv' };
        }

        /*
         * Some Android-TV WebViews omit the literal "Android TV" token but
         * identify a television device in the model section. Avoid broad
         * "Android + TV" heuristics that could accidentally disable phones.
         */
        if (/\b(shield android tv|mibox|mi box|nexus player)\b/i.test(haystack)) {
            return { detected: true, family: 'android-tv' };
        }

        /*
         * Catch TV-labelled embedded browsers without stealing normal phones
         * or tablets. This intentionally runs after the named families so the
         * diagnostics retain the most useful platform label.
         */
        if (
            /\b(?:smart[- ]?tv|television|tv)\b/i.test(haystack)
            && !/\b(?:iphone|ipad|ipod|mobile)\b/i.test(haystack)
        ) {
            return { detected: true, family: 'generic-tv' };
        }

        /*
         * Final high-confidence ten-foot fallback: remote-only embedded
         * clients generally expose no touch points and no hovering/fine
         * pointer. Phones/tablets have touch points and desktop browsers have
         * a fine/hovering primary pointer, so both stay on LyricMotion.
         */
        try {
            const maxTouchPoints = Number(
                navigatorObject && navigatorObject.maxTouchPoints
            ) || 0;
            const remoteOnlyPointer =
                typeof window.matchMedia === 'function'
                && window.matchMedia(
                    '(hover: none) and (pointer: coarse), (hover: none) and (pointer: none)'
                ).matches;

            if (maxTouchPoints === 0 && remoteOnlyPointer) {
                return { detected: true, family: 'remote-only-tv' };
            }
        } catch {
            // UA/platform markers above remain authoritative on older engines.
        }

        return { detected: false, family: '' };
    }

    const stockTvEnvironment =
        detectStockJellyfinTvEnvironment();

    if (stockTvEnvironment.detected) {
        const stockTvApi = Object.freeze({
            version: VERSION,
            enabled: false,
            platform: 'tv',
            renderer: 'stock-jellyfin',
            reason: 'tv-stock-bypass',
            tvFamily: stockTvEnvironment.family
        });

        window.JellyfinLyricMotion = stockTvApi;

        console.info(
            '[JellyfinLyricMotion]',
            `v${VERSION}: ${stockTvEnvironment.family} detected; using stock Jellyfin lyrics`
        );
        return;
    }

    const TICKS_PER_SECOND = 10000000;

    /*
     * Jellyfin's lyric parser can discard Unicode format controls.  The ASCII
     * transport token survives the complete TTML -> ELRC -> Jellyfin path and
     * is removed before the lyric is painted.  The old invisible marker is
     * still accepted so existing local files do not break.
     */
    const BACKGROUND_VOCAL_TOKEN = '[ak:bg]';
    const LEGACY_BACKGROUND_VOCAL_SENTINEL = '\u2063\u2060';
    const UNIFIED_RENDERER_SIGNATURE =
        'unified-pc-mobile-v3:60fps:multiscript-shaped-wipe:classic-bloom64:atmo360x26';

    // Display-only lyric wipe smoothing.
    const WORD_PROGRESS_SMOOTH_TAU_MS = 20;
    const WORD_PROGRESS_SNAP_DELTA = 0.42;
    const WORD_RENDER_LOOKAHEAD_TICKS = 140000; // 14 ms

    // Behaviour adapted from the current am-lyrics renderer.
    const BASE_WIPE_GRADIENT_EM = 0.75;
    const LONG_WORD_WIPE_EXTRA_EM = 0.45;
    const SHORT_WORD_DRAG_MIN_DURATION_MS = 760;
    const SHORT_WORD_GLOW_MIN_DURATION_MS = 1320;
    const MOTION_FINAL_RISE_EM = -0.035;
    const MOTION_HANDOFF_TICKS = 3200000; // 320 ms previous-line glow decay
    const ECO_COMPOSITOR_HANDOFF_MS = 210; // eco-only handoff decay
    const LINE_CLASS_NEIGHBORHOOD = 6;
    const ZERO_PROGRESS_EPSILON = 0.0025;


    /*
     * Phase-locked lyric clock.
     *
     * Some embedded media engines expose currentTime in visible steps even
     * while requestAnimationFrame is healthy. Between trustworthy media-clock
     * samples we advance a monotonic projection, then gently phase-correct it
     * when currentTime moves again. Large jumps still snap immediately.
     */
    const CLOCK_HARD_SNAP_SECONDS = 0.42;
    const CLOCK_MAX_DRIFT_SECONDS = 0.65;
    const CLOCK_CORRECTION_GAIN = 0.22;
    const CLOCK_MAX_CORRECTION_SECONDS = 0.012;

    // Adaptive Album Atmosphere (presentation-only; never changes lyric timing).
    const ATMOSPHERE_STORAGE_KEY = 'appleKaraokeAtmosphereMode';
    const ATMOSPHERE_CHECK_INTERVAL_MS = 1200;
    const ATMOSPHERE_ART_MAX_WIDTH = 720;
    const ATMOSPHERE_COLOR_SAMPLE_SIZE = 30;

    const PERFORMANCE_STORAGE_KEY = 'appleKaraokePerformanceMode';

    // PC/mobile-only romanization. The heavy local romanizer is lazy-loaded
    // only for songs that actually contain non-Latin/native-script lyrics.
    const LEGACY_ROMANIZATION_STORAGE_KEY = 'appleKaraokeRomanizationMode';
    const SONG_PREFERENCES_STORAGE_KEY = 'appleKaraokeSongPreferencesV2';
    const ROMANIZER_ASSET = 'jellyfin-lyric-romanizer.js';
    const ROMANIZER_ASSET_VERSION = LYRICG2P_VERSION;
    const ROMANIZER_LOAD_TIMEOUT_MS = 8000;
    const ROMANIZATION_CACHE_MAX_ENTRIES = 1800;

    // Per-timeline display synchronization. Positive values delay the lyrics;
    // negative values make lyrics appear earlier. The permanent UI is one
    // compact timing chip; its popover keeps fine/coarse nudging, one-tap
    // word/line synchronization, undo and reset out of the main lyric view.
    const TIMING_OFFSET_FINE_STEP_SECONDS = 0.1;
    const TIMING_OFFSET_STEP_SECONDS = 0.5;
    const TIMING_OFFSET_MIN_SECONDS = -15;
    const TIMING_OFFSET_MAX_SECONDS = 15;
    const SONG_PREFERENCES_MAX_ENTRIES = 300;

    const PERFORMANCE_TARGET_FPS = Object.freeze({
        desktop: 60,
        mobile: 60,
        eco: 20
    });

    /*
     * Background responses follow a stable visual rhythm across the library.
     * Logical start/end lanes are mirrored by CSS for RTL interfaces.
     */
    const BACKGROUND_VOCAL_LANE_PATTERN = Object.freeze([
        'center',
        'inset-end',
        'center',
        'inset-start'
    ]);

    /*
     * Normal LRC only changes at line boundaries, so 20 fps is still very
     * cheap with the active-line-only renderer while cutting worst-case visual
     * line-transition latency from ~100 ms to ~50 ms.
     */
    const LRC_TARGET_FPS = 20;
    const PAUSED_TARGET_FPS = 2;

    /*
     * Lifecycle guards. Decoration retries are deliberately bounded and only
     * exist while a live lyrics route + captured payload are waiting for
     * Jellyfin's DOM. Outside the lyrics page the animation loop is fully
     * dormant instead of polling the whole SPA forever.
     */
    const DECORATION_RETRY_MS = 120;
    const DECORATION_RETRY_WINDOW_MS = 6000;
    const MEDIA_DISCOVERY_RETRY_MS = 250;
    const ATMOSPHERE_IMAGE_TIMEOUT_MS = 6500;

    /*
     * Premium atmosphere is rendered ONCE per song into a small,
     * viewport-shaped blurred bitmap. There is no full-screen live CSS blur.
     */
    const ATMOSPHERE_RASTER_LONG_EDGE = Object.freeze({
        desktop: 360,
        mobile: 360,
        eco: 160
    });

    const ATMOSPHERE_RASTER_BLUR_PX = Object.freeze({
        desktop: 26,
        mobile: 26,
        eco: 15
    });

    const ATMOSPHERE_CROSSFADE_MS = 1800;

    /*
     * User-requested premium glow palette.
     *
     * IMPORTANT:
     * These colors are used ONLY by the glyph-shaped shadow produced by the
     * am-lyrics-style grow animation. The lyric text and lyric wipe stay white.
     */
    const ACCENT_STORAGE_KEY = 'appleKaraokePremiumAccent';

    const ACCENT_HISTORY_STORAGE_KEY =
        'appleKaraokeRecentAccents';

    /*
     * Dual-tone OLED palette. Each selection keeps a clean primary edge and a
     * complementary outer bloom instead of making every shadow the same hue.
     * The original IDs remain valid for users who previously forced a color.
     */
    const PREMIUM_ACCENTS = Object.freeze([
        { id: 'champagne-gold', name: 'Champagne Gold', rgb: '255, 195, 92', secondaryRgb: '255, 126, 76', tertiaryRgb: '255, 231, 178', gain: 1.00 },
        { id: 'royal-purple', name: 'Royal Purple', rgb: '184, 116, 255', secondaryRgb: '255, 102, 211', tertiaryRgb: '102, 224, 255', gain: 0.94 },
        { id: 'sapphire', name: 'Sapphire Blue', rgb: '92, 166, 255', secondaryRgb: '104, 229, 255', tertiaryRgb: '244, 114, 182', gain: 0.90 },
        { id: 'arctic-cyan', name: 'Arctic Cyan', rgb: '82, 224, 242', secondaryRgb: '107, 146, 255', tertiaryRgb: '125, 255, 196', gain: 0.84 },
        { id: 'neon-rose', name: 'Neon Rose', rgb: '255, 112, 158', secondaryRgb: '201, 110, 255', tertiaryRgb: '255, 177, 94', gain: 0.91 },
        { id: 'emerald', name: 'Emerald', rgb: '88, 224, 164', secondaryRgb: '96, 255, 211', tertiaryRgb: '166, 132, 255', gain: 0.86 },
        { id: 'amber', name: 'Amber', rgb: '255, 154, 72', secondaryRgb: '255, 221, 94', tertiaryRgb: '255, 100, 146', gain: 0.96 },
        { id: 'electric-violet', name: 'Electric Violet', rgb: '143, 119, 255', secondaryRgb: '91, 186, 255', tertiaryRgb: '92, 241, 222', gain: 0.94 },
        { id: 'ice-blue', name: 'Ice Blue', rgb: '142, 214, 255', secondaryRgb: '196, 171, 255', tertiaryRgb: '255, 164, 206', gain: 0.88 },
        { id: 'ruby', name: 'Ruby', rgb: '255, 86, 112', secondaryRgb: '255, 149, 82', tertiaryRgb: '197, 110, 255', gain: 0.93 },
        { id: 'magenta', name: 'Magenta', rgb: '246, 101, 226', secondaryRgb: '153, 116, 255', tertiaryRgb: '78, 226, 255', gain: 0.90 },
        { id: 'aqua', name: 'Aqua', rgb: '72, 232, 211', secondaryRgb: '112, 176, 255', tertiaryRgb: '190, 242, 100', gain: 0.84 },
        { id: 'aurora-lime', name: 'Aurora Lime', rgb: '174, 244, 96', secondaryRgb: '73, 229, 191', tertiaryRgb: '104, 148, 255', gain: 0.85 },
        { id: 'sunset-coral', name: 'Sunset Coral', rgb: '255, 119, 103', secondaryRgb: '255, 187, 97', tertiaryRgb: '245, 104, 211', gain: 0.94 },
        { id: 'plasma-blue', name: 'Plasma Blue', rgb: '72, 127, 255', secondaryRgb: '78, 226, 255', tertiaryRgb: '186, 106, 255', gain: 0.92 },
        { id: 'orchid', name: 'Electric Orchid', rgb: '218, 124, 255', secondaryRgb: '255, 142, 201', tertiaryRgb: '92, 185, 255', gain: 0.90 },
        { id: 'mint', name: 'Polar Mint', rgb: '126, 245, 197', secondaryRgb: '94, 207, 255', tertiaryRgb: '187, 156, 255', gain: 0.82 },
        { id: 'solar-yellow', name: 'Solar Yellow', rgb: '255, 224, 104', secondaryRgb: '255, 142, 74', tertiaryRgb: '75, 224, 210', gain: 0.94 },
        { id: 'fuchsia-flare', name: 'Fuchsia Flare', rgb: '255, 84, 199', secondaryRgb: '255, 114, 119', tertiaryRgb: '114, 127, 255', gain: 0.92 },
        { id: 'glacier', name: 'Glacier', rgb: '111, 238, 255', secondaryRgb: '119, 150, 255', tertiaryRgb: '236, 130, 214', gain: 0.84 },
        { id: 'cosmic-indigo', name: 'Cosmic Indigo', rgb: '109, 102, 255', secondaryRgb: '204, 104, 255', tertiaryRgb: '79, 220, 231', gain: 0.94 },
        { id: 'peach-flare', name: 'Peach Flare', rgb: '255, 169, 126', secondaryRgb: '255, 111, 177', tertiaryRgb: '255, 218, 112', gain: 0.90 },
        { id: 'laser-green', name: 'Laser Green', rgb: '96, 242, 133', secondaryRgb: '79, 224, 232', tertiaryRgb: '242, 222, 96', gain: 0.84 },
        { id: 'moon-lavender', name: 'Moon Lavender', rgb: '196, 172, 255', secondaryRgb: '124, 197, 255', tertiaryRgb: '239, 145, 215', gain: 0.88 }
    ]);
    const ROUTE_RE = /^#?!?\/?lyrics(?:[/?#]|$)/i;

    const state = {
        lyrics: null,
        generation: 0,
        decoratedGeneration: -1,
        lyricsRequestSeq: 0,
        lyricsRequestKey: '',
        lyricsRequestKeys: new Map(),
        lyricsAcceptedKey: '',
        lyricsAcceptedSeq: 0,
        lyricsStaleResponseDrops: 0,
        lineData: [],
        rafId: 0,
        frameTimer: 0,
        animationLoopRunning: false,
        animationLoopStarts: 0,
        animationLoopStops: 0,
        lastMediaWarning: 0,
        geometryTimer: 0,
        decorationRetryStartedAt: 0,
        decorationRetryCount: 0,
        decorationRetryExpiredCount: 0,
        lastActiveLine: -999,
        lastActiveLineSignature: '',
        activeLineIndexes: [],
        activeLineScratch: [],
        lineEndPrefix: [],
        mediaElement: null,
        mediaProbeAt: 0,
        mediaSwitchCount: 0,
        staleMediaEventDrops: 0,
        timedCueCount: 0,
        backgroundVocalCount: 0,
        overlapFrameCount: 0,
        maxSimultaneousLines: 1,

        performanceMode: 'auto',
        performanceProfile: 'desktop',
        performanceFrameCount: 0,
        performanceWindowStart: 0,
        measuredFps: 0,
        lastRenderedFrameAt: 0,
        forceNextFrame: false,
        skippedRafFrames: 0,
        lineTransitionCount: 0,
        lastLineSyncCount: 0,
        maxLineSyncCount: 0,
        ecoHandoffLineIndex: -1,
        ecoHandoffUntil: 0,
        playbackClockMedia: null,
        playbackClockSeconds: 0,
        playbackClockRawSeconds: 0,
        playbackClockFrameNow: 0,
        playbackClockCorrectionMs: 0,
        playbackClockHardSnaps: 0,
        playbackClockSuspended: false,
        mediaStartOffsetSource: '',
        mediaStartOffsetTicks: 0,

        accentMode: 'shuffle',
        accent: PREMIUM_ACCENTS[0],
        accentSignature: '',
        accentHistory: [],
        accentBag: [],
        accentRandomSource: 'math-random',
        accentSelectionReason: 'initial',
        accentReplayArmed: false,

        shapedWordCount: 0,
        scriptProfileCounts: {},
        fontGeometryRefreshCount: 0,

        romanizationMode: 'native',
        romanizationAvailable: false,
        romanizationCandidate: false,
        romanizationLoadState: 'idle',
        romanizationLoadError: '',
        romanizationSource: 'none',
        romanizationToggle: null,
        romanizationCache: new Map(),
        romanizationLineCount: 0,
        romanizationToggleCount: 0,
        lyricsItemId: '',
        lyricsRequestUrl: '',

        songPreferenceKey: '',
        songPreferences: Object.create(null),
        lyricToolsHost: null,
        timingControls: null,
        timingPopover: null,
        timingOffsetSeconds: 0,
        timingOffsetChangeCount: 0,
        timingPickActive: false,
        timingUndo: null,
        timingPickListenerInstalled: false,

        // Adaptive Album Atmosphere state.
        atmosphereMode: 'balanced',
        atmosphereRoot: null,
        atmosphereSceneIndex: 0,
        atmosphereMediaKey: '',
        atmosphereArtwork: '',
        atmosphereSource: 'none',
        atmosphereColors: null,
        atmosphereLastCheck: 0,
        atmosphereLoadSeq: 0,
        atmospherePendingKey: '',
        atmospherePendingSince: 0,
        atmosphereTimeoutCount: 0,
        atmosphereFailedKey: '',
        atmosphereFailedAt: 0,
        atmosphereRasterMethod: 'none',
        atmosphereRasterWidth: 0,
        atmosphereRasterHeight: 0,
        atmosphereRasterBlurPx: 0
    };

    function log(...args) {
        console.log('[JellyfinLyricMotion]', ...args);
    }

    function warn(...args) {
        console.warn('[JellyfinLyricMotion]', ...args);
    }

    function isLyricsUrl(url) {
        if (typeof url !== 'string' || !url) return false;

        try {
            const parsed = new URL(url, location.href);
            const path = parsed.pathname || '';

            if (/\/(?:Audio|Items)\/[^/]+\/Lyrics(?:\/|$)/i.test(path)) {
                return true;
            }

            if (/\/Lyrics\/[^/]+(?:\/|$)/i.test(path)) {
                return true;
            }

            if (/\/Lyrics\/?$/i.test(path)) {
                return !!(
                    parsed.searchParams.get('itemId')
                    || parsed.searchParams.get('item_id')
                );
            }
        } catch {
            return /\/(?:Audio|Items)\/[^/?#]+\/Lyrics(?:[/?#]|$)/i.test(url)
                || /\/Lyrics\/[^/?#]+(?:[/?#]|$)/i.test(url)
                || /\/Lyrics(?:\/?\?(?:[^#]*&)?(?:itemId|item_id)=)/i.test(url);
        }

        return false;
    }

    function elementHasLiveLayout(element) {
        if (!element || element.isConnected === false || element.hidden) {
            return false;
        }

        try {
            if (typeof element.getClientRects === 'function') {
                return element.getClientRects().length > 0;
            }
        } catch {
            // Detached/transitioning WebView nodes can throw during layout reads.
        }

        return true;
    }

    function getCurrentLyricsContainer(
        enhancedOnly = false
    ) {
        const selector = enhancedOnly
            ? '.lyricsContainer.ak-karaoke-container'
            : '.lyricsContainer';

        let candidates = [];

        try {
            if (typeof document.querySelectorAll === 'function') {
                candidates = Array.from(
                    document.querySelectorAll(selector)
                );
            }
        } catch {
            candidates = [];
        }

        if (!candidates.length) {
            try {
                const fallback = document.querySelector(selector);
                if (fallback) candidates.push(fallback);
            } catch {
                // No matching lyric DOM yet.
            }
        }

        const live = candidates.filter(
            element => elementHasLiveLayout(element)
        );

        if (live.length) {
            /* Jellyfin appends the entering SPA page after the outgoing one. */
            return live[live.length - 1];
        }

        const connected = candidates.filter(
            element => element && element.isConnected !== false
        );

        return connected.length
            ? connected[connected.length - 1]
            : null;
    }

    function getCurrentLyricPage() {
        const container =
            getCurrentLyricsContainer(false);

        if (container) {
            if (typeof container.closest === 'function') {
                try {
                    const page = container.closest('.lyricPage');
                    if (page) return page;
                } catch {
                    // Fall through to a parent walk for older WebKit.
                }
            }

            let parent = container.parentElement;
            while (parent) {
                if (
                    parent.classList
                    && parent.classList.contains('lyricPage')
                ) {
                    return parent;
                }
                parent = parent.parentElement;
            }
        }

        let pages = [];
        try {
            pages = Array.from(
                document.querySelectorAll('.lyricPage')
            );
        } catch {
            // Older embedded DOM implementations may expose only querySelector.
        }

        const live = pages.filter(
            page => elementHasLiveLayout(page)
        );
        if (live.length) return live[live.length - 1];

        return pages.length
            ? pages[pages.length - 1]
            : document.querySelector('.lyricPage');
    }

    function isLyricsPage() {
        const hash = String(
            location.hash || ''
        );

        if (hash) {
            return ROUTE_RE.test(hash);
        }

        const container =
            getCurrentLyricsContainer(false);

        return !!(
            container
            && elementHasLiveLayout(container)
        );
    }

    function normalizeLyricsPayload(payload) {
        if (!payload || typeof payload !== 'object') return null;
        const lyrics = payload.Lyrics || payload.lyrics;
        if (!Array.isArray(lyrics) || lyrics.length === 0) return null;
        return lyrics;
    }

    function cueValue(cue, pascal, camel) {
        if (!cue) return undefined;
        return cue[pascal] !== undefined ? cue[pascal] : cue[camel];
    }

    function lyricValue(lyric, pascal, camel) {
        if (!lyric) return undefined;
        return lyric[pascal] !== undefined ? lyric[pascal] : lyric[camel];
    }


    let unicodeMarkExpression = null;
    let latinGlyphExpression = null;

    try {
        unicodeMarkExpression =
            new RegExp('\\p{Mark}', 'u');
    } catch {
        // Older browsers use the explicit ranges below.
    }

    /*
     * Keep Unicode property escapes out of regex literals. Engines that do not
     * understand \p{} fail at parse time, before a surrounding try/catch can
     * run. Construct the optional expression dynamically instead.
     */
    try {
        latinGlyphExpression =
            new RegExp(
                '^[\\p{Script=Latin}\\p{Mark}\\p{Number}\\p{Punctuation}\\p{Symbol}]+$',
                'u'
            );
    } catch {
        latinGlyphExpression = null;
    }

    function codePointTokens(text) {
        const tokens = [];
        let offset = 0;

        for (const char of text) {
            tokens.push({
                text: char,
                start: offset,
                end: offset + char.length,
                codePoint: char.codePointAt(0)
            });

            offset += char.length;
        }

        return tokens;
    }

    const FALLBACK_MARK_RANGES = Object.freeze([
            [0x0300, 0x036f],
            [0x0591, 0x05c7],
            [0x0610, 0x061a],
            [0x064b, 0x065f],
            [0x0670, 0x0670],
            [0x06d6, 0x06ed],
            [0x0900, 0x0903], [0x093a, 0x094f], [0x0951, 0x0957], [0x0962, 0x0963],
            [0x0981, 0x0983], [0x09bc, 0x09bc], [0x09be, 0x09c4], [0x09c7, 0x09c8], [0x09cb, 0x09cd], [0x09d7, 0x09d7], [0x09e2, 0x09e3], [0x09fe, 0x09fe],
            [0x0a01, 0x0a03], [0x0a3c, 0x0a3c], [0x0a3e, 0x0a4d], [0x0a51, 0x0a51], [0x0a70, 0x0a71], [0x0a75, 0x0a75],
            [0x0a81, 0x0a83], [0x0abc, 0x0abc], [0x0abe, 0x0ac5], [0x0ac7, 0x0ac9], [0x0acb, 0x0acd], [0x0ae2, 0x0ae3],
            [0x0b01, 0x0b03], [0x0b3c, 0x0b3c], [0x0b3e, 0x0b44], [0x0b47, 0x0b48], [0x0b4b, 0x0b4d], [0x0b55, 0x0b57], [0x0b62, 0x0b63],
            [0x0b82, 0x0b82], [0x0bbe, 0x0bc2], [0x0bc6, 0x0bc8], [0x0bca, 0x0bcd], [0x0bd7, 0x0bd7],
            [0x0c00, 0x0c04], [0x0c3c, 0x0c3c], [0x0c3e, 0x0c44], [0x0c46, 0x0c48], [0x0c4a, 0x0c4d], [0x0c55, 0x0c56], [0x0c62, 0x0c63],
            [0x0c81, 0x0c83], [0x0cbc, 0x0cbc], [0x0cbe, 0x0cc4], [0x0cc6, 0x0cc8], [0x0cca, 0x0ccd], [0x0cd5, 0x0cd6], [0x0ce2, 0x0ce3],
            [0x0d00, 0x0d03], [0x0d3b, 0x0d4d], [0x0d57, 0x0d57], [0x0d62, 0x0d63],
            [0x0d81, 0x0d83], [0x0dca, 0x0dca], [0x0dcf, 0x0dd4], [0x0dd6, 0x0dd6], [0x0dd8, 0x0ddf], [0x0df2, 0x0df3],
            [0x0e31, 0x0e31], [0x0e34, 0x0e3a], [0x0e47, 0x0e4e],
            [0x0eb1, 0x0eb1], [0x0eb4, 0x0ebc], [0x0ec8, 0x0ecd],
            [0x0f18, 0x0f19], [0x0f35, 0x0f35], [0x0f37, 0x0f37], [0x0f39, 0x0f39], [0x0f71, 0x0f84], [0x0f86, 0x0f87], [0x0f8d, 0x0fbc],
            [0x102b, 0x103e], [0x1056, 0x1059], [0x105e, 0x1060], [0x1062, 0x1064], [0x1067, 0x106d], [0x1071, 0x1074], [0x1082, 0x108d], [0x108f, 0x108f], [0x109a, 0x109d],
            [0x17b4, 0x17d3], [0x17dd, 0x17dd],
            [0x1ab0, 0x1aff], [0x1dc0, 0x1dff], [0x20d0, 0x20ff], [0xfe20, 0xfe2f]
        ]);

    function isFallbackMarkCodePoint(codePoint) {
        return codePointInRanges(codePoint, FALLBACK_MARK_RANGES);
    }

    function isMarkToken(token) {
        if (!token) return false;

        if (
            unicodeMarkExpression
            && unicodeMarkExpression.test(
                token.text
            )
        ) {
            return true;
        }

        return isFallbackMarkCodePoint(
            token.codePoint
        );
    }

    function isVariationOrModifier(codePoint) {
        return (
            codePoint >= 0xfe00
            && codePoint <= 0xfe0f
        ) || (
            codePoint >= 0xe0100
            && codePoint <= 0xe01ef
        ) || (
            codePoint >= 0x1f3fb
            && codePoint <= 0x1f3ff
        ) || (
            codePoint >= 0xe0020
            && codePoint <= 0xe007f
        );
    }

    function isJoinControl(codePoint) {
        return codePoint === 0x200c
            || codePoint === 0x200d;
    }

    function isRegionalIndicator(codePoint) {
        return codePoint >= 0x1f1e6
            && codePoint <= 0x1f1ff;
    }

    function hangulGraphemeType(codePoint) {
        if (
            (codePoint >= 0x1100 && codePoint <= 0x115f)
            || (codePoint >= 0xa960 && codePoint <= 0xa97c)
        ) return 'L';

        if (
            (codePoint >= 0x1160 && codePoint <= 0x11a7)
            || (codePoint >= 0xd7b0 && codePoint <= 0xd7c6)
        ) return 'V';

        if (
            (codePoint >= 0x11a8 && codePoint <= 0x11ff)
            || (codePoint >= 0xd7cb && codePoint <= 0xd7fb)
        ) return 'T';

        if (codePoint >= 0xac00 && codePoint <= 0xd7a3) {
            return ((codePoint - 0xac00) % 28) === 0
                ? 'LV'
                : 'LVT';
        }

        return '';
    }

    function hangulBoundaryJoins(leftCodePoint, rightCodePoint) {
        const left = hangulGraphemeType(leftCodePoint);
        const right = hangulGraphemeType(rightCodePoint);

        return (left === 'L' && (right === 'L' || right === 'V' || right === 'LV' || right === 'LVT'))
            || ((left === 'LV' || left === 'V') && (right === 'V' || right === 'T'))
            || ((left === 'LVT' || left === 'T') && right === 'T');
    }

    function regionalIndicatorBoundaryJoins(tokens, rightIndex) {
        if (
            rightIndex <= 0
            || !isRegionalIndicator(tokens[rightIndex - 1].codePoint)
            || !isRegionalIndicator(tokens[rightIndex].codePoint)
        ) {
            return false;
        }

        let precedingRunLength = 0;
        for (let index = rightIndex - 1; index >= 0; index -= 1) {
            if (!isRegionalIndicator(tokens[index].codePoint)) break;
            precedingRunLength += 1;
        }

        /* Unicode GB12/GB13: group regional indicators into pairs. */
        return precedingRunLength % 2 === 1;
    }

    const INDIC_VIRAMA_CODEPOINTS = new Set([
            0x094d,
            0x09cd,
            0x0a4d,
            0x0acd,
            0x0b4d,
            0x0bcd,
            0x0c4d,
            0x0ccd,
            0x0d4d,
            0x0dca,
            0x1039,
            0x103a,
            0x17d2,
            0x1a60,
            0x1b44,
            0x1baa,
            0x1bab,
            0xa806,
            0xa8c4,
            0xa953,
            0xa9c0,
            0xaaf6,
            0xabed,
            0x11046,
            0x11133,
            0x111c0,
            0x11235,
            0x1134d,
            0x11442,
            0x11446,
            0x114c2,
            0x115bf,
            0x1163f,
            0x116b6,
            0x1172b,
            0x11839,
            0x1193d,
            0x1193e,
            0x119e0,
            0x11a34,
            0x11a47,
            0x11a99,
            0x11c3f,
            0x11d44,
            0x11d45,
            0x11d97,
            0x11f42
        ]);

    function isIndicVirama(codePoint) {
        return INDIC_VIRAMA_CODEPOINTS.has(codePoint);
    }

    function boundarySplitsShaping(tokens, boundary) {
        let rightIndex = -1;

        for (let index = 0; index < tokens.length; index += 1) {
            if (tokens[index].start === boundary) {
                rightIndex = index;
                break;
            }
        }

        if (rightIndex <= 0) return false;

        const left = tokens[rightIndex - 1];
        const right = tokens[rightIndex];

        return isMarkToken(right)
            || isVariationOrModifier(
                right.codePoint
            )
            || isJoinControl(
                right.codePoint
            )
            || isIndicVirama(
                left.codePoint
            )
            || isJoinControl(
                left.codePoint
            )
            || regionalIndicatorBoundaryJoins(
                tokens,
                rightIndex
            )
            || hangulBoundaryJoins(
                left.codePoint,
                right.codePoint
            );
    }

    function getGraphemeBoundaries(text) {
        const tokens = codePointTokens(text);
        let candidates = [0];

        if (
            typeof Intl !== 'undefined'
            && typeof Intl.Segmenter
                === 'function'
        ) {
            try {
                const segmenter =
                    new Intl.Segmenter(
                        undefined,
                        {
                            granularity:
                                'grapheme'
                        }
                    );

                for (
                    const segment
                    of segmenter.segment(text)
                ) {
                    candidates.push(
                        segment.index
                        + segment.segment.length
                    );
                }
            } catch {
                candidates = [0];
            }
        }

        if (candidates.length === 1) {
            candidates = [0].concat(
                tokens.map(token => token.end)
            );
        }

        const boundaries = [0];

        candidates.forEach(boundary => {
            if (
                boundary <= 0
                || boundary > text.length
                || boundarySplitsShaping(
                    tokens,
                    boundary
                )
            ) {
                return;
            }

            if (
                boundaries[
                    boundaries.length - 1
                ] !== boundary
            ) {
                boundaries.push(boundary);
            }
        });

        if (
            boundaries[boundaries.length - 1]
            !== text.length
        ) {
            boundaries.push(text.length);
        }

        return boundaries;
    }

    function codePointInRanges(codePoint, ranges) {
        for (let index = 0; index < ranges.length; index += 1) {
            const range = ranges[index];
            if (codePoint >= range[0] && codePoint <= range[1]) {
                return true;
            }
        }
        return false;
    }

    function textHasCodePointInRanges(text, ranges) {
        for (const character of String(text || '')) {
            if (codePointInRanges(character.codePointAt(0), ranges)) {
                return true;
            }
        }
        return false;
    }

    const RTL_STRONG_RANGES = Object.freeze([
        [0x05d0, 0x05ea],   // Hebrew letters
        [0x05ef, 0x05f2],
        [0x0620, 0x063f],   // Arabic letters
        [0x0641, 0x064a],
        [0x066e, 0x066f],
        [0x0671, 0x06d3],
        [0x06d5, 0x06d5],
        [0x06e5, 0x06e6],
        [0x06ee, 0x06ef],
        [0x06fa, 0x06fc],
        [0x06ff, 0x06ff],
        [0x0710, 0x072f],   // Syriac
        [0x074d, 0x077f],   // Syriac supplement + Arabic supplement
        [0x0780, 0x07a5],   // Thaana
        [0x07b1, 0x07b1],
        [0x07ca, 0x07ea],   // NKo
        [0x0840, 0x0858],   // Mandaic
        [0x0860, 0x086a],   // Syriac supplement
        [0x0870, 0x0887],   // Arabic Extended-B letters
        [0x08a0, 0x08c9],   // Arabic Extended-A letters
        [0xfb1d, 0xfb4f],   // Hebrew presentation forms
        [0xfb50, 0xfdff],   // Arabic presentation forms A
        [0xfe70, 0xfefc],   // Arabic presentation forms B
        [0x1e900, 0x1e943]  // Adlam letters
    ]);

    const COMPLEX_SHAPING_RANGES = Object.freeze([
        [0x0600, 0x08ff],   // Arabic-family joining scripts
        [0x0900, 0x0dff],   // Indic + Sinhala
        [0x0e00, 0x0fff],   // Thai, Lao, Tibetan
        [0x1000, 0x109f],   // Myanmar
        [0x1780, 0x17ff],   // Khmer
        [0x1800, 0x18af],   // Mongolian
        [0xa980, 0xa9df],   // Javanese + Myanmar Extended-B
        [0xaa60, 0xaa7f],   // Myanmar Extended-A
        [0x11000, 0x11fff], // Brahmic supplementary blocks
        [0xfb1d, 0xfdff],
        [0xfe70, 0xfeff]
    ]);

    const CJK_CODEPOINT_RANGES = Object.freeze([
        [0x3040, 0x30ff],   // Hiragana + Katakana
        [0x3100, 0x312f],   // Bopomofo
        [0x31a0, 0x31bf],
        [0x3400, 0x4dbf],   // CJK Extension A
        [0x4e00, 0x9fff],   // Unified ideographs
        [0xac00, 0xd7af],   // Hangul syllables
        [0xf900, 0xfaff],   // Compatibility ideographs
        [0x20000, 0x323af]  // Supplementary CJK extensions
    ]);

    const CUE_TOKEN_SCRIPT_PROFILES = Object.freeze({
        cjk: true,
        thai: true,
        lao: true,
        khmer: true,
        myanmar: true
    });

    function firstStrongDirection(text) {
        for (const character of String(text || '')) {
            const codePoint = character.codePointAt(0);

            if (codePointInRanges(codePoint, RTL_STRONG_RANGES)) {
                return 'rtl';
            }

            /*
             * Treat known letter/ideograph ranges as LTR base-direction
             * candidates. Digits and punctuation are deliberately neutral so
             * a leading timestamp/number does not flip an Arabic/Hebrew line.
             */
            if (
                (codePoint >= 0x0041 && codePoint <= 0x005a)
                || (codePoint >= 0x0061 && codePoint <= 0x007a)
                || (codePoint >= 0x00c0 && codePoint <= 0x02af)
                || (codePoint >= 0x0370 && codePoint <= 0x058f)
                || (codePoint >= 0x0900 && codePoint <= 0x1fff)
                || codePointInRanges(codePoint, CJK_CODEPOINT_RANGES)
            ) {
                return 'ltr';
            }
        }

        return 'ltr';
    }

    function detectScriptProfile(text) {
        const value = String(text || '');

        if (textHasCodePointInRanges(value, [[0x0600, 0x06ff], [0x0750, 0x077f], [0x08a0, 0x08ff], [0xfb50, 0xfdff], [0xfe70, 0xfeff]])) return 'arabic';
        if (textHasCodePointInRanges(value, [[0x0590, 0x05ff], [0xfb1d, 0xfb4f]])) return 'hebrew';
        if (textHasCodePointInRanges(value, [[0x0900, 0x097f], [0xa8e0, 0xa8ff]])) return 'devanagari';
        if (textHasCodePointInRanges(value, [[0x0980, 0x09ff]])) return 'bengali';
        if (textHasCodePointInRanges(value, [[0x0a00, 0x0a7f]])) return 'gurmukhi';
        if (textHasCodePointInRanges(value, [[0x0a80, 0x0aff]])) return 'gujarati';
        if (textHasCodePointInRanges(value, [[0x0b00, 0x0b7f]])) return 'odia';
        if (textHasCodePointInRanges(value, [[0x0b80, 0x0bff]])) return 'tamil';
        if (textHasCodePointInRanges(value, [[0x0c00, 0x0c7f]])) return 'telugu';
        if (textHasCodePointInRanges(value, [[0x0c80, 0x0cff]])) return 'kannada';
        if (textHasCodePointInRanges(value, [[0x0d00, 0x0d7f]])) return 'malayalam';
        if (textHasCodePointInRanges(value, [[0x0d80, 0x0dff]])) return 'sinhala';
        if (textHasCodePointInRanges(value, [[0x0e00, 0x0e7f]])) return 'thai';
        if (textHasCodePointInRanges(value, [[0x0e80, 0x0eff]])) return 'lao';
        if (textHasCodePointInRanges(value, [[0x1000, 0x109f], [0xa9e0, 0xa9ff], [0xaa60, 0xaa7f]])) return 'myanmar';
        if (textHasCodePointInRanges(value, [[0x1780, 0x17ff]])) return 'khmer';
        if (textHasCodePointInRanges(value, [[0x0f00, 0x0fff]])) return 'tibetan';
        if (textHasCodePointInRanges(value, CJK_CODEPOINT_RANGES)) return 'cjk';
        if (textHasCodePointInRanges(value, [[0x0400, 0x052f]])) return 'cyrillic';
        if (textHasCodePointInRanges(value, [[0x0370, 0x03ff], [0x1f00, 0x1fff]])) return 'greek';
        if (textHasCodePointInRanges(value, [[0x0530, 0x058f]])) return 'armenian';
        if (textHasCodePointInRanges(value, [[0x10a0, 0x10ff], [0x2d00, 0x2d2f]])) return 'georgian';

        if (
            value.indexOf('\u200c') >= 0
            || value.indexOf('\u200d') >= 0
            || textHasCodePointInRanges(value, COMPLEX_SHAPING_RANGES)
        ) {
            return 'complex';
        }

        if (latinGlyphExpression) {
            try {
                if (latinGlyphExpression.test(value.replace(/\s+/g, ''))) {
                    return 'latin';
                }
            } catch {
                // Conservative generic fallback below.
            }
        }

        if (
            /^[\x00-\x7f]*$/.test(value)
            || looksLikeLatinFallback(value.replace(/\s+/g, ''))
        ) {
            return 'latin';
        }

        /* Unknown scripts stay whole-shaped, but still receive full effects. */
        return 'universal';
    }

    function usesWholeShapedMotion(profile) {
        return [
            'arabic',
            'hebrew',
            'devanagari',
            'bengali',
            'gurmukhi',
            'gujarati',
            'odia',
            'tamil',
            'telugu',
            'kannada',
            'malayalam',
            'sinhala',
            'thai',
            'lao',
            'myanmar',
            'khmer',
            'tibetan',
            'complex',
            'universal'
        ].indexOf(profile) >= 0;
    }

    function usesCueTokenization(profile) {
        return !!CUE_TOKEN_SCRIPT_PROFILES[profile];
    }

    const LATIN_LETTER_FALLBACK_RANGES = Object.freeze([
        [0x0041, 0x005a], [0x0061, 0x007a],
        [0x00c0, 0x024f], [0x1d00, 0x1d7f], [0x1d80, 0x1dbf],
        [0x1e00, 0x1eff], [0x2c60, 0x2c7f], [0xa720, 0xa7ff],
        [0xab30, 0xab6f], [0x10780, 0x107bf]
    ]);

    function looksLikeLatinFallback(text) {
        let hasLatinLetter = false;

        for (const character of String(text || '')) {
            const codePoint = character.codePointAt(0);

            if (codePointInRanges(codePoint, LATIN_LETTER_FALLBACK_RANGES)) {
                hasLatinLetter = true;
                continue;
            }

            if (
                isFallbackMarkCodePoint(codePoint)
                || isVariationOrModifier(codePoint)
                || (codePoint >= 0x0030 && codePoint <= 0x0039)
                || (codePoint >= 0x0020 && codePoint <= 0x0040)
                || (codePoint >= 0x005b && codePoint <= 0x0060)
                || (codePoint >= 0x007b && codePoint <= 0x00bf)
                || (codePoint >= 0x2000 && codePoint <= 0x2bff)
                || (codePoint >= 0x1f000 && codePoint <= 0x1faff)
            ) {
                continue;
            }

            return false;
        }

        return hasLatinLetter;
    }

    function snapBoundary(boundaries, position, direction) {
        if (boundaries.includes(position)) return position;

        if (direction === 'backward') {
            for (let i = boundaries.length - 1; i >= 0; i -= 1) {
                if (boundaries[i] < position) return boundaries[i];
            }
            return 0;
        }

        for (const boundary of boundaries) {
            if (boundary > position) return boundary;
        }

        return boundaries[boundaries.length - 1];
    }

    function cueDerivedTokenRanges(text, cueRecords) {
        const ranges = [];

        (cueRecords || []).forEach(record => {
            let start = Math.max(0, Math.min(text.length, Number(record.startPos) || 0));
            let end = Math.max(start, Math.min(text.length, Number(record.endPos) || 0));

            while (start < end && /\s/u.test(text.charAt(start))) start += 1;
            while (end > start && /\s/u.test(text.charAt(end - 1))) end -= 1;

            if (end <= start) return;

            const previous = ranges[ranges.length - 1];
            if (previous && start < previous.end) {
                previous.end = Math.max(previous.end, end);
                previous.text = text.slice(previous.start, previous.end);
                return;
            }

            ranges.push({
                start,
                end,
                text: text.slice(start, end)
            });
        });

        return ranges;
    }

    function getWordRanges(text, cueRecords) {
        const profile = detectScriptProfile(text);

        /*
         * CJK and several naturally space-less scripts must not have word
         * boundaries invented by LyricMotion. If ELRC/Jellyfin supplies
         * multiple timing tokens, preserve those exact token spans.
         */
        if (
            usesCueTokenization(profile)
            && Array.isArray(cueRecords)
            && cueRecords.length > 1
        ) {
            const cueRanges = cueDerivedTokenRanges(text, cueRecords);
            if (cueRanges.length > 1) return cueRanges;
        }

        const ranges = [];
        const regex = /\S+/gu;
        let match;

        while ((match = regex.exec(text)) !== null) {
            ranges.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0]
            });
        }

        return ranges;
    }

    function cueRecordStart(record) {
        return Number(cueValue(record.cue, 'Start', 'start')) || 0;
    }

    function buildWordRecords(text, lineIndex, cueRecords) {
        const ranges = getWordRanges(text, cueRecords);

        return ranges.map((range, wordIndex) => {
            const wordLength = Math.max(1, range.end - range.start);
            const segments = [];

            cueRecords.forEach((record, cueIndex) => {
                const overlapStart = Math.max(range.start, record.startPos);
                const overlapEnd = Math.min(range.end, record.endPos);

                if (overlapEnd <= overlapStart) return;

                const start = Number.isFinite(
                    record.start
                )
                    ? record.start
                    : cueRecordStart(record);

                const end = Number.isFinite(
                    record.end
                )
                    ? record.end
                    : cueEndTicks(
                        lineIndex,
                        cueIndex,
                        record.cue,
                        cueRecords
                    );

                segments.push({
                    cueIndex,
                    startPos: overlapStart - range.start,
                    endPos: overlapEnd - range.start,
                    start,
                    end
                });
            });

            segments.sort((a, b) => {
                if (a.startPos !== b.startPos) return a.startPos - b.startPos;
                return a.start - b.start;
            });

            /*
             * The word itself is one shaped DOM span. Cue boundaries only
             * control the progress math. Extend the outermost segment to the
             * word edges so punctuation/combining ink never pops in at the
             * final frame.
             */
            if (segments.length) {
                segments[0].startPos = 0;
                segments[segments.length - 1].endPos = wordLength;

                for (let i = 0; i < segments.length - 1; i += 1) {
                    const left = segments[i];
                    const right = segments[i + 1];
                    const boundary = Math.max(
                        left.startPos,
                        Math.min(
                            wordLength,
                            (left.endPos + right.startPos) / 2
                        )
                    );

                    left.endPos = boundary;
                    right.startPos = boundary;
                }
            }

            const start = segments.length ? segments[0].start : null;
            const end = segments.length
                ? Math.max(...segments.map(segment => segment.end))
                : null;

            const scriptProfile =
                detectScriptProfile(
                    range.text
                );

            return {
                lineIndex,
                wordIndex,
                text: range.text,
                startPos: range.start,
                endPos: range.end,
                length: wordLength,
                segments,
                start,
                end,
                scriptProfile,
                paintMode:
                    usesWholeShapedMotion(scriptProfile)
                        ? 'shaped'
                        : 'spatial',
                isRtl:
                    firstStrongDirection(range.text) === 'rtl',
                element: null,
                visualProgress: 0,
                lastPaintAt: null,
                motionMode: 'none',
                motionGlow: false,
                motionDurationMs: 0,
                motionGlyphs: [],
                wholeMotion: null,
                geometryReady: false,
                geometrySource: 'unprepared'
            };
        });
    }

    function visibleWordLength(word) {
        if (!word || !word.text) return 0;

        return getGraphemeRanges(word.text)
            .filter(range => /\S/u.test(range.text))
            .length;
    }

    function clamp01(value) {
        return Math.max(0, Math.min(1, value));
    }

    function easeMotion(value) {
        const x = clamp01(value);
        return 0.5 - Math.cos(Math.PI * x) / 2;
    }

    function canUseGraphemeMotionOverlay(word) {
        if (!word) return false;

        const compact =
            String(word.text || '').replace(/\s+/g, '');

        if (!compact) return false;

        /* Explicit join controls mean that visual shaping can cross the
         * Unicode grapheme boundary. Keep those words intact. */
        if (
            compact.indexOf('\u200c') >= 0
            || compact.indexOf('\u200d') >= 0
        ) {
            return false;
        }

        /* Arabic-family joining and unknown complex scripts must remain one
         * shaped run. Indic/Dravidian/Bengali/Thai/etc. are safe here because
         * getGraphemeRanges() refuses boundaries after viramas, before marks,
         * inside Hangul clusters or across join controls. That lets an entire
         * akshara/grapheme receive the exact same staggered Classic Bloom used
         * by Latin without splitting conjuncts or vowel marks. */
        return [
            'arabic',
            'complex',
            'universal'
        ].indexOf(word.scriptProfile) < 0;
    }

    function classifyWordMotion(words) {
        words.forEach(word => {
            if (
                !word.segments.length
                || !Number.isFinite(word.start)
                || !Number.isFinite(word.end)
                || word.end <= word.start
            ) {
                word.motionMode = 'none';
                return;
            }

            const durationMs = (word.end - word.start) / 10000;
            const wordLen = Math.max(1, visibleWordLength(word));
            const text = word.text || '';

            word.glyphCount = wordLen;

            /*
             * Motion eligibility is language-agnostic.
             *
             * Rendering remains script-aware later:
             * segment-safe scripts -> staggered grapheme layer
             * contextual/complex scripts -> one fully-shaped word
             */
            const canAnimate =
                !text.includes('-')
                && wordLen > 0;

            let growable =
                canAnimate
                && wordLen <= 7;

            if (growable) {
                if (wordLen <= 1) {
                    growable =
                        durationMs >= 1050
                        && durationMs >= wordLen * 525;
                } else if (wordLen <= 3) {
                    growable =
                        durationMs
                        >= SHORT_WORD_GLOW_MIN_DURATION_MS
                            + (wordLen - 2) * 140;
                } else {
                    growable =
                        durationMs >= 850
                        && durationMs >= wordLen * 190;
                }
            }

            const hasCharRiseDuration =
                durationMs >= Math.max(700, wordLen * 85);

            const hasTinyWordDragDuration =
                wordLen >= 2
                && wordLen <= 3
                && durationMs >= Math.max(
                    SHORT_WORD_DRAG_MIN_DURATION_MS,
                    wordLen * 150
                );

            const hasLongShortWordDuration =
                wordLen >= 4
                && durationMs >= Math.max(
                    1300,
                    wordLen * 260
                );

            const charRise =
                canAnimate
                && !growable
                && (
                    (wordLen >= 8 && hasCharRiseDuration)
                    || (wordLen < 8 && hasLongShortWordDuration)
                );

            const charDrag =
                canAnimate
                && !growable
                && hasTinyWordDragDuration;

            word.motionMode = growable
                ? 'grow'
                : (charRise ? 'rise' : (charDrag ? 'drag' : 'none'));

            word.motionGlow =
                growable;
            word.motionDurationMs = durationMs;

            /*
             * Repo-style dynamic intensity/growth, computed once per word.
             * Per-grapheme position decay is added later for segment-safe overlays.
             */
            const minDuration = 400;
            const maxDuration = 3000;
            const rawDurationProgress = clamp01(
                (durationMs - minDuration)
                / (maxDuration - minDuration)
            );

            word._motionDurationProgress =
                rawDurationProgress ** 3;
        });
    }

    function getGraphemeRanges(text) {
        const ranges = [];

        const boundaries =
            getGraphemeBoundaries(text);

        for (
            let index = 0;
            index < boundaries.length - 1;
            index += 1
        ) {
            const start = boundaries[index];
            const end = boundaries[index + 1];

            ranges.push({
                start,
                end,
                text: text.slice(start, end)
            });
        }

        return ranges;
    }

    function getPrefixWidth(textNode, offset) {
        if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return 0;

        const range = document.createRange();

        try {
            range.setStart(textNode, 0);
            range.setEnd(textNode, Math.max(0, Math.min(offset, textNode.length)));
            return range.getBoundingClientRect().width;
        } catch {
            return 0;
        } finally {
            if (range.detach) range.detach();
        }
    }

    function computeGlyphMotionMetrics(word, glyphIndex, glyphCount) {
        const durationMs = word.motionDurationMs;
        const durationProgress = word._motionDurationProgress || 0;

        const isLongWord = glyphCount > 5;
        const isShortDuration = durationMs < 1200;

        let maxDecayRate = 0;

        if (isLongWord || isShortDuration) {
            let decayStrength = 0;

            if (isLongWord) {
                decayStrength +=
                    Math.min((glyphCount - 5) / 5, 1) * 0.4;
            }

            if (isShortDuration && glyphCount > 3) {
                decayStrength +=
                    Math.max(0, 1 - (durationMs - 800) / 400) * 0.3;
            } else if (isShortDuration && glyphCount <= 3) {
                decayStrength +=
                    Math.max(0, 1 - (durationMs - 800) / 400) * 0.1;
            }

            maxDecayRate = Math.min(decayStrength, 0.7);
        }

        const positionInWord =
            glyphCount > 1
                ? glyphIndex / (glyphCount - 1)
                : 0;

        const decayFactor =
            1 - positionInWord * maxDecayRate;

        const charProgress =
            durationProgress * decayFactor;

        const baseGrowth =
            glyphCount <= 3 ? 0.05 : 0.04;

        const maxScale =
            1 + baseGrowth + charProgress * 0.08;

        const glowDurFactor =
            Math.min(1.1, durationMs / 1500);

        let glowLenFactor = 1;

        if (glyphCount <= 3) {
            glowLenFactor = 0.85;
        } else if (glyphCount >= 6) {
            glowLenFactor = 1.1;
        }

        const shadowIntensity =
            (0.35 + charProgress * 0.45)
            * glowDurFactor
            * glowLenFactor;

        const normalizedGrowth =
            (maxScale - 1) / 0.1;

        const peakMultiplier =
            Math.min(
                1,
                Math.max(0.3, durationMs / 2000)
            );

        const peakYEm =
            -0.0625
            * normalizedGrowth
            * peakMultiplier;

        const position =
            (glyphIndex + 0.5) / glyphCount;

        const offsetXEm =
            (position - 0.5)
            * 2
            * ((maxScale - 1) * 0.36);

        return {
            maxScale: maxScale * 0.98,
            shadowIntensity,
            peakYEm,
            offsetXEm: offsetXEm * 0.98
        };
    }

    function clearMotionLayer(word) {
        if (!word || !word.element) return;

        const layer = directChildByClass(
            word.element,
            'ak-motion-layer'
        );
        removeNodeCompat(layer);

        word.element.classList.remove(
            'ak-motion-per-glyph',
            'ak-motion-whole'
        );

        /* Geometry/profile changes may switch whole-word and glyph paths. */
        word.element.style.transform = '';
        word.element.style.filter = '';
        word._akWholeFilterCleared = false;

        word.motionGlyphs = [];
        word.wholeMotion = null;
        word.geometryReady = false;
        word.renderWidth = 0;
        (word.segments || []).forEach(segment => {
            delete segment.visualStart;
            delete segment.visualEnd;
        });
        word.geometrySource = 'unprepared';
    }

    function createMotionGlyph(
        word,
        rangeInfo,
        index,
        glyphCount,
        box
    ) {
        const glyph = document.createElement('span');
        glyph.className = 'ak-motion-glyph';

        glyph.glowLayers = [
            'ak-glow-core',
            'ak-glow-halo'
        ].map(className => {
            const glow = document.createElement('span');
            glow.className =
                'ak-glow-layer '
                + 'ak-glyph-glow-layer '
                + className;
            glow.textContent = rangeInfo.text;
            glow.style.opacity = '0';
            glyph.appendChild(glow);
            return glow;
        });

        glyph.style.left = `${box.left.toFixed(3)}px`;
        glyph.style.top = `${box.top.toFixed(3)}px`;
        glyph.style.width = `${box.width.toFixed(3)}px`;
        glyph.style.height = `${box.height.toFixed(3)}px`;
        glyph._akMotion = computeGlyphMotionMetrics(
            word,
            index,
            glyphCount
        );

        return glyph;
    }

    function measuredFallbackGlyphBoxes(
        word,
        graphemes,
        wordRect
    ) {
        const widths = [];
        let measuredTotal = 0;

        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const style = window.getComputedStyle(word.element);

            if (context) {
                context.font = style.font || [
                    style.fontStyle,
                    style.fontWeight,
                    style.fontSize,
                    style.fontFamily
                ].join(' ');

                graphemes.forEach(rangeInfo => {
                    const width = Math.max(
                        0.001,
                        context.measureText(rangeInfo.text).width
                    );
                    widths.push(width);
                    measuredTotal += width;
                });
            }
        } catch {
            // Equal-width fallback below is deterministic and compositor-safe.
        }

        if (widths.length !== graphemes.length || measuredTotal <= 0) {
            widths.length = 0;
            graphemes.forEach(() => widths.push(1));
            measuredTotal = graphemes.length;
        }

        const scale = wordRect.width / measuredTotal;
        let cursor = 0;

        return widths.map(width => {
            const scaledWidth = width * scale;
            const logicalLeft = cursor;
            cursor += scaledWidth;

            return {
                left: word.isRtl
                    ? wordRect.width - logicalLeft - scaledWidth
                    : logicalLeft,
                top: 0,
                width: scaledWidth,
                height: wordRect.height
            };
        });
    }

    function prepareWordGeometry(word) {
        if (!word || !word.element || !word.segments.length) return;

        clearMotionLayer(word);

        let textNode = null;
        const childNodes = word.element.childNodes || [];
        for (let index = 0; index < childNodes.length; index += 1) {
            if (childNodes[index].nodeType === Node.TEXT_NODE) {
                textNode = childNodes[index];
                break;
            }
        }

        if (!textNode) return;

        const wordRect =
            word.element.getBoundingClientRect();

        /* Adjacent cue segments share boundaries. Cache prefix Range reads so
         * a boundary used as one cue's end and the next cue's start is measured
         * once rather than forcing duplicate layout work. */
        const prefixWidths = new Map();
        const prefixWidth = position => {
            const safePosition = Math.max(
                0,
                Math.min(textNode.length, Number(position) || 0)
            );
            if (prefixWidths.has(safePosition)) {
                return prefixWidths.get(safePosition);
            }
            const measured =
                getPrefixWidth(textNode, safePosition);
            prefixWidths.set(safePosition, measured);
            return measured;
        };

        const fullWidth =
            prefixWidth(textNode.length)
            || wordRect.width;

        if (fullWidth > 0) {
            word.renderWidth = fullWidth;

            word.segments.forEach(segment => {
                const startPx =
                    prefixWidth(segment.startPos);

                const endPx =
                    prefixWidth(segment.endPos);

                segment.visualStart =
                    clamp01(startPx / fullWidth);

                segment.visualEnd =
                    clamp01(endPx / fullWidth);
            });

            word.geometryReady = true;
        }

        const glyphCount =
            Math.max(1, visibleWordLength(word));

        const extra =
            clamp01((glyphCount - 6) / 10)
            * LONG_WORD_WIPE_EXTRA_EM;

        const wipeWidth =
            BASE_WIPE_GRADIENT_EM + extra;

        word.element.style.setProperty(
            '--ak-wipe-width',
            `${wipeWidth.toFixed(3)}em`
        );

        word.element.style.setProperty(
            '--ak-wipe-half',
            `${(wipeWidth / 2).toFixed(3)}em`
        );

        if (word.motionMode !== 'grow') {
            return;
        }

        /*
         * Segment-safe scripts can use a per-grapheme motion overlay that
         * mirrors the staggered character glow. Contextual scripts keep their
         * original shaped word and receive the same whole-word bloom/motion.
         */
        if (
            !canUseGraphemeMotionOverlay(word)
            || !shouldUsePerGlyphMotion(
                glyphCount
            )
        ) {
            word.element.classList.add('ak-motion-whole');
            word.wholeMotion =
                computeGlyphMotionMetrics(
                    word,
                    Math.floor(glyphCount / 2),
                    glyphCount
                );
            word.geometrySource = 'whole-joining-or-profile';
            return;
        }

        if (!wordRect.width || !wordRect.height) {
            word.element.classList.add('ak-motion-whole');
            word.wholeMotion =
                computeGlyphMotionMetrics(
                    word,
                    Math.floor(glyphCount / 2),
                    glyphCount
                );
            word.geometrySource = 'whole-no-box';
            return;
        }

        const graphemes =
            getGraphemeRanges(word.text)
                .filter(range => /\S/u.test(range.text));

        if (!graphemes.length) return;

        const layer =
            document.createElement('span');

        layer.className = 'ak-motion-layer';
        layer.setAttribute('aria-hidden', 'true');

        const glyphs = [];

        graphemes.forEach((rangeInfo, index) => {
            const range = document.createRange();

            try {
                range.setStart(textNode, rangeInfo.start);
                range.setEnd(textNode, rangeInfo.end);

                const rect =
                    range.getBoundingClientRect();

                if (!rect.width && !rect.height) return;

                const glyph = createMotionGlyph(
                    word,
                    rangeInfo,
                    index,
                    graphemes.length,
                    {
                        left: rect.left - wordRect.left,
                        top: rect.top - wordRect.top,
                        width: rect.width,
                        height: rect.height
                    }
                );

                layer.appendChild(glyph);
                glyphs.push(glyph);
            } catch {
                // Ignore one failed glyph and preserve the base word.
            } finally {
                if (range.detach) range.detach();
            }
        });

        if (glyphs.length !== graphemes.length) {
            replaceChildrenCompat(layer);
            glyphs.length = 0;

            measuredFallbackGlyphBoxes(
                word,
                graphemes,
                wordRect
            ).forEach((box, index) => {
                const glyph = createMotionGlyph(
                    word,
                    graphemes[index],
                    index,
                    graphemes.length,
                    box
                );
                layer.appendChild(glyph);
                glyphs.push(glyph);
            });

            word.geometrySource = 'canvas-fallback';
        } else {
            word.geometrySource = 'range';
        }

        if (glyphs.length === graphemes.length) {
            word.element.appendChild(layer);
            word.motionGlyphs = glyphs;
            word.element.classList.add(
                'ak-motion-per-glyph'
            );
        } else {
            word.element.classList.add('ak-motion-whole');
            word.wholeMotion =
                computeGlyphMotionMetrics(
                    word,
                    Math.floor(glyphCount / 2),
                    glyphCount
                );
            word.geometrySource = 'whole-geometry-failure';
        }
    }

    function refreshMotionGeometry() {
        state.lineData.forEach(line => {
            (line.words || []).forEach(prepareWordGeometry);
        });
    }

    function queueMotionGeometryRefresh() {
        if (!state.lyrics || !isLyricsPage()) {
            if (state.geometryTimer) {
                clearTimeout(state.geometryTimer);
                state.geometryTimer = 0;
            }
            return false;
        }

        clearTimeout(state.geometryTimer);

        state.geometryTimer =
            window.setTimeout(() => {
                state.geometryTimer = 0;

                if (!state.lyrics || !isLyricsPage()) {
                    return;
                }

                requestAnimationFrame(() => {
                    if (!state.lyrics || !isLyricsPage()) {
                        return;
                    }

                    refreshMotionGeometry();
                });
            }, 40);

        return true;
    }

    function createWordSpan(word) {
        const span = document.createElement('span');

        span.className = 'ak-word ak-word-zero';
        span.dataset.akTimingLineIndex = String(word.lineIndex);
        span.dataset.akTimingWordIndex = String(word.wordIndex);

        span.classList.add(
            `ak-script-${word.scriptProfile}`
        );

        if (word.paintMode === 'shaped') {
            span.classList.add('ak-paint-shaped');
        }

        if (word.isRtl) {
            span.classList.add('ak-word-rtl');
            span.setAttribute('dir', 'rtl');
        }

        span.style.setProperty(
            '--ak-word-progress',
            '0%'
        );

        span.style.setProperty(
            '--ak-motion-glow',
            '0'
        );


        if (word.segments.length) {
            span.classList.add('ak-word-timed');
        } else {
            span.classList.add('ak-word-untimed');
        }

        if (word.motionMode === 'grow') {
            span.classList.add('ak-motion-grow');
        } else if (word.motionMode === 'rise') {
            span.classList.add('ak-motion-rise');
        } else if (word.motionMode === 'drag') {
            span.classList.add('ak-motion-drag');
        }

        span.textContent = word.text;

        if (word.motionMode === 'grow') {
            word.glowLayers = [
                'ak-glow-core',
                'ak-glow-halo'
            ].map(className => {
                const layer =
                    document.createElement(
                        'span'
                    );

                layer.className =
                    'ak-glow-layer '
                    + 'ak-word-glow-layer '
                    + className;

                layer.setAttribute(
                    'aria-hidden',
                    'true'
                );

                layer.textContent = word.text;
                layer.style.opacity = '0';
                span.appendChild(layer);

                return layer;
            });
        }

        word.element = span;

        return span;
    }


    function stableHash(input) {
        let hash = 2166136261;

        for (let i = 0; i < input.length; i += 1) {
            hash ^= input.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }

        return hash >>> 0;
    }

    function lyricSignature(lyrics) {
        return lyrics.map(lyric => {
            const text =
                String(
                    lyricValue(lyric, 'Text', 'text')
                    || ''
                );

            const start =
                Number(
                    lyricValue(lyric, 'Start', 'start')
                )
                || 0;

            return `${start}:${text}`;
        }).join('|');
    }

    function readAccentMode() {
        try {
            const stored =
                localStorage.getItem(
                    ACCENT_STORAGE_KEY
                );

            /* v2.4's deterministic "song" mode migrates to shuffle. */
            return !stored || stored === 'song'
                ? 'shuffle'
                : stored;
        } catch {
            return 'shuffle';
        }
    }

    function findAccent(id) {
        return PREMIUM_ACCENTS.find(
            accent => accent.id === id
        ) || null;
    }

    function randomAccentIndex(length) {
        if (length <= 1) return 0;

        try {
            if (
                window.crypto
                && typeof window.crypto.getRandomValues
                    === 'function'
            ) {
                const value =
                    new Uint32Array(1);

                window.crypto.getRandomValues(
                    value
                );

                state.accentRandomSource =
                    'crypto';

                return value[0] % length;
            }
        } catch {
            // Fall back to Math.random on older embedded engines.
        }

        state.accentRandomSource =
            'math-random';

        return Math.floor(
            Math.random() * length
        );
    }

    function readAccentHistory() {
        try {
            const parsed =
                JSON.parse(
                    localStorage.getItem(
                        ACCENT_HISTORY_STORAGE_KEY
                    )
                    || '[]'
                );

            if (Array.isArray(parsed)) {
                return parsed
                    .filter(id => !!findAccent(id))
                    .slice(-4);
            }
        } catch {
            // Storage may be disabled by the client/browser.
        }

        return [];
    }

    function writeAccentHistory(history) {
        state.accentHistory =
            history.slice(-4);

        try {
            localStorage.setItem(
                ACCENT_HISTORY_STORAGE_KEY,
                JSON.stringify(
                    state.accentHistory
                )
            );
        } catch {
            // In-memory history still prevents immediate repeats.
        }
    }

    function writeAccentBag() {
        try {
            if (
                typeof sessionStorage
                !== 'undefined'
            ) {
                sessionStorage.setItem(
                    'appleKaraokeAccentBag',
                    JSON.stringify(
                        state.accentBag
                    )
                );
            }
        } catch {
            // In-memory bag remains valid for this page lifetime.
        }
    }

    function loadAccentBag() {
        if (state.accentBag.length) return;

        try {
            if (
                typeof sessionStorage
                !== 'undefined'
            ) {
                const parsed =
                    JSON.parse(
                        sessionStorage.getItem(
                            'appleKaraokeAccentBag'
                        )
                        || '[]'
                    );

                if (Array.isArray(parsed)) {
                    const seen = {};

                    state.accentBag =
                        parsed.filter(id => {
                            if (
                                seen[id]
                                || !findAccent(id)
                            ) {
                                return false;
                            }

                            seen[id] = true;
                            return true;
                        });
                }
            }
        } catch {
            state.accentBag = [];
        }
    }

    function refillAccentBag() {
        const bag =
            PREMIUM_ACCENTS.map(
                accent => accent.id
            );

        for (
            let index = bag.length - 1;
            index > 0;
            index -= 1
        ) {
            const swapIndex =
                randomAccentIndex(
                    index + 1
                );

            const value = bag[index];
            bag[index] = bag[swapIndex];
            bag[swapIndex] = value;
        }

        state.accentBag = bag;
        writeAccentBag();
    }

    function drawShuffledAccent() {
        loadAccentBag();

        if (!state.accentBag.length) {
            refillAccentBag();
        }

        const recent =
            state.accentHistory.length
                ? state.accentHistory.slice(-4)
                : readAccentHistory();

        let bagIndex =
            state.accentBag.findIndex(
                id => !recent.includes(id)
            );

        if (bagIndex < 0) bagIndex = 0;

        const id =
            state.accentBag.splice(
                bagIndex,
                1
            )[0];

        writeAccentBag();
        writeAccentHistory(
            recent.concat(id)
        );

        return findAccent(id)
            || PREMIUM_ACCENTS[0];
    }

    function applyAccentTheme() {
        if (!isLyricsPage()) return;

        const page =
            getCurrentLyricPage();

        if (!page) return;

        const accent =
            currentAccent();

        page.style.setProperty(
            '--ak-glow-primary-rgb',
            accent.rgb
        );

        page.style.setProperty(
            '--ak-glow-secondary-rgb',
            accent.secondaryRgb
                || accent.rgb
        );

        page.dataset.akGlowTheme =
            accent.id;
    }

    function selectSongAccent(
        lyrics,
        force = false,
        reason = 'song-load'
    ) {
        const mode = readAccentMode();

        const songIdentity =
            state.lyricsAcceptedKey
            || state.lyricsRequestKey
            || '';

        const signature =
            stableHash(
                `${songIdentity}|${lyricSignature(lyrics)}`
            ).toString(16);

        if (
            state.accentSignature
            !== signature
        ) {
            state.accentReplayArmed = false;
        }

        if (mode === 'off') {
            state.accentMode = 'off';
            state.accent = {
                id: 'off',
                name: 'Off',
                rgb: '255, 255, 255',
                secondaryRgb: '255, 255, 255',
                tertiaryRgb: '255, 255, 255',
                gain: 0
            };
            state.accentSignature = signature;
            state.accentSelectionReason = reason;
            applyAccentTheme();
            return;
        }

        if (mode !== 'shuffle') {
            const forced = findAccent(mode);

            if (forced) {
                state.accentMode = mode;
                state.accent = forced;
                state.accentSignature = signature;
                state.accentSelectionReason =
                    'forced';
                applyAccentTheme();
                return;
            }
        }

        if (
            !force
            && state.accentMode === 'shuffle'
            && state.accentSignature
                === signature
        ) {
            applyAccentTheme();
            return;
        }

        state.accentMode = 'shuffle';
        state.accent = drawShuffledAccent();
        state.accentSignature = signature;
        state.accentSelectionReason = reason;
        applyAccentTheme();
    }

    function setAccentMode(mode) {
        let normalized =
            String(mode || '')
                .trim()
                .toLowerCase();

        if (normalized === 'song') {
            normalized = 'shuffle';
        }

        if (
            normalized !== 'shuffle'
            && normalized !== 'off'
            && !findAccent(normalized)
        ) {
            throw new Error(
                `Unknown accent "${mode}". Use "shuffle", "off", or: `
                + PREMIUM_ACCENTS
                    .map(accent => accent.id)
                    .join(', ')
            );
        }

        try {
            localStorage.setItem(
                ACCENT_STORAGE_KEY,
                normalized
            );
        } catch {
            // Ignore storage failures.
        }

        state.accentReplayArmed = false;

        if (state.lyrics) {
            selectSongAccent(
                state.lyrics,
                true,
                'mode-change'
            );
        } else {
            state.accentMode = normalized;

            if (normalized === 'off') {
                state.accent = {
                    id: 'off',
                    name: 'Off',
                    rgb: '255, 255, 255',
                    secondaryRgb: '255, 255, 255',
                    tertiaryRgb: '255, 255, 255',
                    gain: 0
                };
            } else if (
                normalized !== 'shuffle'
            ) {
                state.accent =
                    findAccent(normalized)
                    || PREMIUM_ACCENTS[0];
            } else {
                state.accent =
                    drawShuffledAccent();
            }

            state.accentSelectionReason =
                'mode-change';

            applyAccentTheme();
        }

        return {
            mode: state.accentMode,
            accent: state.accent.id,
            name: state.accent.name,
            primaryRgb: state.accent.rgb,
            secondaryRgb:
                state.accent.secondaryRgb
        };
    }

    function rerollAccent() {
        try {
            localStorage.setItem(
                ACCENT_STORAGE_KEY,
                'shuffle'
            );
        } catch {
            // Ignore storage failures.
        }

        state.accentMode = 'shuffle';
        state.accentReplayArmed = false;

        if (state.lyrics) {
            selectSongAccent(
                state.lyrics,
                true,
                'manual-reroll'
            );
        } else {
            state.accent =
                drawShuffledAccent();

            state.accentSelectionReason =
                'manual-reroll';

            applyAccentTheme();
        }

        state.atmosphereMediaKey = '';
        wakeAnimationLoop();

        return {
            mode: state.accentMode,
            accent: state.accent.id,
            name: state.accent.name,
            primaryRgb: state.accent.rgb,
            secondaryRgb:
                state.accent.secondaryRgb
        };
    }

    function currentAccent() {
        return state.accent || PREMIUM_ACCENTS[0];
    }

    function retireDecoratedLines() {
        state.lineData.forEach(lineRecord => {
            const element =
                lineRecord && lineRecord.element;

            if (!element || !element.isConnected) return;

            try {
                Array.from(element.classList || [])
                    .filter(name => name.indexOf('ak-') === 0)
                    .forEach(name => element.classList.remove(name));

                delete element.dataset.akGeneration;
                delete element.dataset.akVocalRole;
                delete element.dataset.akVocalRoleSource;
                delete element.dataset.akBackgroundLane;
                delete element.dataset.akBackgroundEntry;

                /*
                 * Jellyfin may replace/reuse this node on the next SPA task.
                 * Hide the retired lyric immediately so the previous song can
                 * never flash while the new/no-lyrics view is being committed.
                 * decorateLine() clears both properties on valid reuse.
                 */
                element.style.visibility = 'hidden';
                element.setAttribute('aria-hidden', 'true');
            } catch {
                // A framework-owned node can detach in the middle of cleanup.
            }
        });

        const container =
            getCurrentLyricsContainer(true);

        if (container) {
            container.classList.remove(
                'ak-karaoke-container'
            );
        }
    }

    function clearCapturedLyrics(
        source = 'clear'
    ) {
        const hadLyrics = !!state.lyrics || state.lineData.length > 0;

        cancelDecorationRetry(true);
        if (state.geometryTimer) {
            clearTimeout(state.geometryTimer);
            state.geometryTimer = 0;
        }
        invalidateAtmosphereLoads(source);
        stopAnimationLoop(source);
        retireDecoratedLines();

        if (
            state.atmosphereRoot
            && state.atmosphereRoot.isConnected
        ) {
            state.atmosphereRoot.classList.remove(
                'ak-atmosphere-ready'
            );
        }

        state.atmosphereArtwork = '';
        state.atmosphereSource = 'none';
        state.atmosphereColors = null;

        state.lyrics = null;
        state.lyricsAcceptedKey = '';
        if (hadLyrics) state.generation += 1;
        state.decoratedGeneration = -1;
        state.lineData = [];
        state.timedCueCount = 0;
        state.backgroundVocalCount = 0;
        state.romanizationAvailable = false;
        state.romanizationCandidate = false;
        if (state.romanizationCache && typeof state.romanizationCache.clear === 'function') {
            state.romanizationCache.clear();
        }
        state.romanizationLineCount = 0;
        state.songPreferenceKey = '';
        state.timingOffsetSeconds = 0;
        state.timingPickActive = false;
        state.timingUndo = null;
        if (typeof removeRomanizationToggle === 'function') {
            removeRomanizationToggle();
        }
        if (typeof removeTimingControls === 'function') {
            removeTimingControls();
        }
        if (state.lyricToolsHost && state.lyricToolsHost.parentNode) {
            state.lyricToolsHost.parentNode.removeChild(state.lyricToolsHost);
        }
        state.lyricToolsHost = null;
        state.lastActiveLine = -999;
        state.lastActiveLineSignature = '';
        state.activeLineIndexes = [];
        state.lineEndPrefix = [];
        state.overlapFrameCount = 0;
        state.maxSimultaneousLines = 1;
        resetPlaybackClock();

        if (hadLyrics) {
            log(`cleared captured lyrics from ${source}`);
        }

        return hadLyrics;
    }

    function lyricsRequestIdentity(url) {
        if (!isLyricsUrl(url)) return '';

        const raw = String(url || '');
        const withoutHash = raw.split('#', 1)[0];
        const queryIndex = withoutHash.indexOf('?');
        const rawPath = queryIndex >= 0
            ? withoutHash.slice(0, queryIndex)
            : withoutHash;
        const query = queryIndex >= 0
            ? withoutHash.slice(queryIndex + 1)
            : '';
        const path = rawPath
            .replace(/^https?:\/\/[^/]+/i, '')
            .replace(/\/{2,}/g, '/')
            .toLowerCase();

        /*
         * Jellyfin normally carries the item id in the path. Keep an item-id
         * query parameter too for compatibility with alternate client routes,
         * while deliberately ignoring auth/cache query parameters so duplicate
         * requests for the same song share one generation.
         */
        const itemMatch = query.match(
            /(?:^|&)(?:itemid|item_id)=([^&]+)/i
        );

        return itemMatch
            ? `${path}?itemid=${itemMatch[1].toLowerCase()}`
            : path;
    }

    function lyricItemIdFromUrl(url) {
        const raw = String(url || '');
        try {
            const parsed = new URL(raw, location.href);
            const path = parsed.pathname || '';
            const patterns = [
                /\/Audio\/([^/]+)\/Lyrics(?:\/|$)/i,
                /\/Items\/([^/]+)\/Lyrics(?:\/|$)/i,
                /\/Lyrics\/([^/?#]+)/i
            ];
            for (let i = 0; i < patterns.length; i += 1) {
                const match = path.match(patterns[i]);
                if (match && match[1]) return decodeURIComponent(match[1]);
            }
            return parsed.searchParams.get('itemId')
                || parsed.searchParams.get('item_id')
                || '';
        } catch {
            const match = raw.match(/\/(?:Audio|Items)\/([^/?#]+)\/Lyrics/i);
            return match && match[1] ? match[1] : '';
        }
    }

    function beginLyricsRequest(
        url
    ) {
        const key = lyricsRequestIdentity(url);
        if (!key) return 0;

        state.lyricsRequestUrl = String(url || '');
        const itemId = lyricItemIdFromUrl(url);
        if (itemId) state.lyricsItemId = itemId;

        const switchedSong =
            !!state.lyricsRequestKey
            && key !== state.lyricsRequestKey;

        /*
         * Every network request receives its own generation token, even when
         * Jellyfin refreshes the same song twice. An earlier response can still
         * populate the UI while a newer refresh is pending, but it can never
         * overwrite a newer response once that newer payload has been accepted.
         */
        state.lyricsRequestSeq += 1;
        state.lyricsRequestKey = key;
        if (switchedSong) {
            /* Drop request identities from the previous track session. This is
             * also an ABA guard: if the user goes A -> B -> A, a very late
             * response from the first A must not match the second A merely
             * because the normalized item URL is identical. */
            state.lyricsRequestKeys.clear();
        }
        state.lyricsRequestKeys.set(
            state.lyricsRequestSeq,
            key
        );
        while (state.lyricsRequestKeys.size > 128) {
            const oldest = state.lyricsRequestKeys.keys().next();
            if (oldest.done) break;
            state.lyricsRequestKeys.delete(oldest.value);
        }

        /*
         * A true track switch clears the previous model immediately. A same-song
         * refresh keeps the current lyrics visible until one of its responses
         * arrives. Sequence ordering still prevents an older response from
         * overwriting a newer response that has already been accepted.
         */
        if (switchedSong) {
            clearCapturedLyrics('request-switch');
        }

        return state.lyricsRequestSeq;
    }

    function acceptLyricsPayload(
        payload,
        source,
        requestSeq = 0
    ) {
        if (requestSeq > 0) {
            const requestKey =
                state.lyricsRequestKeys.get(requestSeq)
                || '';

            const wrongSong =
                requestKey
                    ? requestKey !== state.lyricsRequestKey
                    : requestSeq !== state.lyricsRequestSeq;

            const olderThanAccepted =
                requestSeq < state.lyricsAcceptedSeq;

            if (wrongSong || olderThanAccepted) {
                state.lyricsStaleResponseDrops += 1;
                return false;
            }

            state.lyricsAcceptedSeq = requestSeq;
            state.lyricsAcceptedKey = state.lyricsRequestKey;
        }

        const lyrics = normalizeLyricsPayload(payload);

        if (!lyrics) {
            clearCapturedLyrics(source);
            return true;
        }

        state.lyrics = lyrics;
        state.generation += 1;
        state.decoratedGeneration = -1;
        selectSongAccent(lyrics);

        // Force atmosphere rediscovery and invalidate any old-song async load.
        invalidateAtmosphereLoads('lyrics-accepted');
        state.atmosphereMediaKey = '';
        state.atmosphereFailedKey = '';
        state.atmosphereArtwork = '';
        state.atmosphereSource = 'pending';
        state.atmosphereColors = null;

        if (
            state.atmosphereRoot
            && state.atmosphereRoot.isConnected
        ) {
            state.atmosphereRoot.classList.remove(
                'ak-atmosphere-ready'
            );
        }

        const cueCount = lyrics.reduce((total, lyric) => {
            const cues = lyricValue(lyric, 'Cues', 'cues');
            return total + (Array.isArray(cues) ? cues.length : 0);
        }, 0);

        state.timedCueCount = cueCount;
        state.lastActiveLine = -999;
        state.lastActiveLineSignature = '';
        state.activeLineIndexes = [];
        state.lineEndPrefix = [];
        state.overlapFrameCount = 0;
        state.maxSimultaneousLines = 1;
        resetPlaybackClock();
        applySongPreferences(lyrics);

        log(`captured ${lyrics.length} lyric lines / ${cueCount} cues from ${source}`);
        if (typeof prepareRomanizationForLyrics === 'function') {
            prepareRomanizationForLyrics();
        }
        queueDecoration();

        if (cueCount === 0) {
            warn('Lyrics loaded without enhanced ELRC cue data.');
        }

        return true;
    }

    function tryParseJson(text) {
        if (typeof text !== 'string' || !text) return null;
        try {
            return JSON.parse(text);
        } catch {
            return null;
        }
    }

    function fetchInputUrl(input) {
        if (typeof input === 'string') {
            return input;
        }

        if (input && typeof input.url === 'string') {
            return input.url;
        }

        try {
            if (
                typeof URL !== 'undefined'
                && input instanceof URL
            ) {
                return input.href;
            }
        } catch {
            // Cross-realm URL objects can throw instanceof in old WebViews.
        }

        return '';
    }

    function fetchInputMethod(input, init) {
        const initMethod =
            init && typeof init.method === 'string'
                ? init.method
                : '';
        const inputMethod =
            input && typeof input.method === 'string'
                ? input.method
                : '';
        return String(initMethod || inputMethod || 'GET').toUpperCase();
    }

    function isLyricsReadMethod(method) {
        return String(method || 'GET').toUpperCase() === 'GET';
    }

    function installFetchInterceptor() {
        if (typeof window.fetch !== 'function' || window.fetch.__appleKaraokeWrapped) return;
        const originalFetch = window.fetch;

        async function wrappedFetch(input, init) {
            const requestUrl =
                fetchInputUrl(input);
            const requestMethod =
                fetchInputMethod(input, init);
            const captureRequest =
                isLyricsReadMethod(requestMethod)
                && isLyricsUrl(requestUrl);
            const requestSeq =
                captureRequest
                    ? beginLyricsRequest(requestUrl)
                    : 0;
            const response = await originalFetch.call(this, input, init);
            try {
                const finalUrl = requestUrl || response.url;
                if (
                    isLyricsReadMethod(requestMethod)
                    && isLyricsUrl(finalUrl)
                ) {
                    const effectiveSeq =
                        requestSeq
                        || beginLyricsRequest(finalUrl);

                    /*
                     * Jellyfin can answer a removed/missing lyric resource as
                     * 204/404 instead of a JSON object with Lyrics: []. Treat
                     * those as an authoritative empty model for the current
                     * request so a same-song refresh cannot keep stale lyrics.
                     */
                    if (
                        response.status === 204
                        || response.status === 404
                    ) {
                        acceptLyricsPayload(
                            { Lyrics: [] },
                            'fetch-empty',
                            effectiveSeq
                        );
                    } else {
                        response.clone().json()
                            .then(data => acceptLyricsPayload(
                                data,
                                'fetch',
                                effectiveSeq
                            ))
                            .catch(() => {});
                    }
                }
            } catch (error) {
                warn('fetch capture failed', error);
            }
            return response;
        }

        wrappedFetch.__appleKaraokeWrapped = true;
        wrappedFetch.__appleKaraokeOriginal = originalFetch;
        window.fetch = wrappedFetch;
    }

    function installXhrInterceptor() {
        const proto = window.XMLHttpRequest && window.XMLHttpRequest.prototype;
        if (!proto || proto.open.__appleKaraokeWrapped) return;

        const originalOpen = proto.open;
        const originalSend = proto.send;

        function wrappedOpen(method, url) {
            this.__appleKaraokeUrl = typeof url === 'string' ? url : String(url || '');
            this.__appleKaraokeMethod = String(method || 'GET').toUpperCase();
            this.__appleKaraokeLyricsSeq =
                isLyricsReadMethod(this.__appleKaraokeMethod)
                    && isLyricsUrl(this.__appleKaraokeUrl)
                    ? beginLyricsRequest(
                        this.__appleKaraokeUrl
                    )
                    : 0;
            return originalOpen.apply(this, arguments);
        }
        wrappedOpen.__appleKaraokeWrapped = true;
        wrappedOpen.__appleKaraokeOriginal = originalOpen;
        proto.open = wrappedOpen;

        proto.send = function () {
            if (!this.__appleKaraokeListenerAdded) {
                this.__appleKaraokeListenerAdded = true;
                this.addEventListener('load', () => {
                    const url = this.responseURL || this.__appleKaraokeUrl || '';
                    if (
                        !isLyricsReadMethod(this.__appleKaraokeMethod)
                        || !isLyricsUrl(url)
                    ) return;

                    try {
                        const effectiveSeq =
                            this.__appleKaraokeLyricsSeq
                            || beginLyricsRequest(url);

                        if (
                            this.status === 204
                            || this.status === 404
                        ) {
                            acceptLyricsPayload(
                                { Lyrics: [] },
                                'XMLHttpRequest-empty',
                                effectiveSeq
                            );
                            return;
                        }

                        let data = null;
                        if (this.responseType === 'json' && this.response && typeof this.response === 'object') {
                            data = this.response;
                        } else if (!this.responseType || this.responseType === 'text') {
                            data = tryParseJson(this.responseText);
                        }
                        if (data) {
                            acceptLyricsPayload(
                                data,
                                'XMLHttpRequest',
                                effectiveSeq
                            );
                        }
                    } catch (error) {
                        warn('XHR capture failed', error);
                    }
                });
            }
            return originalSend.apply(this, arguments);
        };
    }

    function setText(element, text) {
        element.textContent = text;
        return element;
    }

    function replaceChildrenCompat(element, ...nodes) {
        if (!element) return;

        if (typeof element.replaceChildren === 'function') {
            element.replaceChildren(...nodes);
            return;
        }

        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }

        nodes.forEach(node => {
            if (node) element.appendChild(node);
        });
    }

    function directChildByClass(element, className) {
        if (!element || !className) return null;

        const children = element.children || [];
        for (let index = 0; index < children.length; index += 1) {
            const child = children[index];
            if (
                child.classList
                && child.classList.contains(className)
            ) {
                return child;
            }
        }

        return null;
    }

    function removeNodeCompat(element) {
        if (!element) return;

        if (typeof element.remove === 'function') {
            element.remove();
            return;
        }

        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    function createUntimedSpan(text) {
        const span = document.createElement('span');

        const scriptProfile =
            detectScriptProfile(text);

        span.className =
            'ak-untimed '
            + `ak-script-${scriptProfile}`;

        return setText(span, text);
    }

    function lyricTextProfile(lyric) {
        const rawText = String(
            lyricValue(lyric, 'Text', 'text')
            || ''
        );

        let markerLength = 0;
        let roleSource = null;

        if (rawText.indexOf(BACKGROUND_VOCAL_TOKEN) === 0) {
            markerLength = BACKGROUND_VOCAL_TOKEN.length;
            roleSource = 'ascii-marker';
        } else if (
            rawText.indexOf(
                LEGACY_BACKGROUND_VOCAL_SENTINEL
            ) === 0
        ) {
            markerLength =
                LEGACY_BACKGROUND_VOCAL_SENTINEL.length;
            roleSource = 'legacy-marker';
        } else {
            const trimmed = rawText.trim();

            /*
             * Recovery path for libraries already imported with the stripped
             * legacy marker. It is intentionally narrow: only a complete,
             * short parenthetical response is inferred as a backing vocal.
             */
            const firstCharacter = trimmed.charAt(0);
            const lastCharacter = trimmed.charAt(trimmed.length - 1);
            const completeParenthetical =
                (firstCharacter === '(' && lastCharacter === ')')
                || (firstCharacter === '（' && lastCharacter === '）');

            if (
                trimmed.length >= 3
                && trimmed.length <= 64
                && completeParenthetical
            ) {
                roleSource = 'parenthetical-fallback';
            }
        }

        const isBackgroundVocal = !!roleSource;

        return {
            rawText,
            text: isBackgroundVocal
                ? rawText.slice(markerLength)
                : rawText,
            positionOffset: markerLength,
            isBackgroundVocal,
            backgroundVocalRoleSource: roleSource
        };
    }


    let romanizerLoadPromise = null;

    function finiteNumber(value, fallback = 0) {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : fallback;
    }

    function clampTimingOffsetSeconds(value) {
        const numeric = finiteNumber(value, 0);
        const magnitude =
            Math.round((Math.abs(numeric) + Number.EPSILON) * 10) / 10;
        const rounded = numeric < 0 ? -magnitude : magnitude;
        return Math.max(
            TIMING_OFFSET_MIN_SECONDS,
            Math.min(TIMING_OFFSET_MAX_SECONDS, rounded)
        );
    }

    function loadSongPreferences() {
        state.songPreferences = Object.create(null);
        try {
            const parsed = JSON.parse(
                localStorage.getItem(SONG_PREFERENCES_STORAGE_KEY) || '{}'
            );
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                Object.keys(parsed).forEach(key => {
                    const entry = parsed[key];
                    if (!entry || typeof entry !== 'object') return;
                    state.songPreferences[key] = {
                        romanization:
                            entry.romanization === 'romanized'
                                ? 'romanized'
                                : 'native',
                        timingOffsetSeconds:
                            clampTimingOffsetSeconds(entry.timingOffsetSeconds),
                        timingFingerprint:
                            String(entry.timingFingerprint || ''),
                        updatedAt: finiteNumber(entry.updatedAt, 0)
                    };
                });
            }
        } catch {
            state.songPreferences = Object.create(null);
        }

        /*
         * v7 stored Romanization as a global switch. Do not carry that global
         * behavior forward: v8 makes the choice song-specific. Keep the key
         * readable only for migration diagnostics and leave every unseen song
         * in its native-script default until the user explicitly opts in.
         */
        try {
            const legacy = localStorage.getItem(LEGACY_ROMANIZATION_STORAGE_KEY);
            if (legacy === 'romanized' || legacy === 'native') {
                localStorage.removeItem(LEGACY_ROMANIZATION_STORAGE_KEY);
            }
        } catch {
            // Restricted/private storage should never block playback.
        }
    }

    function songPreferenceKeyForLyrics(lyrics = state.lyrics) {
        const requestKey = String(
            state.lyricsAcceptedKey || state.lyricsRequestKey || ''
        );
        if (requestKey) return requestKey;
        if (!lyrics || !lyrics.length) return '';
        const signature = lyricSignature(lyrics);
        const firstStart = finiteNumber(
            lyricValue(lyrics[0], 'Start', 'start'),
            0
        );
        const lastStart = finiteNumber(
            lyricValue(lyrics[lyrics.length - 1], 'Start', 'start'),
            0
        );
        return `lyrics:${stableHash(signature).toString(16)}:${lyrics.length}:${firstStart}:${lastStart}`;
    }


    function timingTimelineFingerprint(lyrics = state.lyrics) {
        if (!lyrics || !lyrics.length) return '';
        const parts = [];

        lyrics.forEach((lyric, lineIndex) => {
            const profile = lyricTextProfile(lyric);
            const start = finiteNumber(
                lyricValue(lyric, 'Start', 'start'),
                0
            );
            const end = finiteNumber(
                lyricValue(lyric, 'End', 'end'),
                0
            );
            const rawCues = lyricValue(lyric, 'Cues', 'cues');
            const cues = Array.isArray(rawCues) ? rawCues : [];
            const cueSignature = cues.map(cue => [
                finiteNumber(cueValue(cue, 'Position', 'position'), -1),
                finiteNumber(cueValue(cue, 'EndPosition', 'endPosition'), -1),
                finiteNumber(cueValue(cue, 'Start', 'start'), -1),
                finiteNumber(cueValue(cue, 'End', 'end'), -1)
            ].join(':')).join(',');

            parts.push(
                `${lineIndex}:${start}:${end}:${profile.rawText}:${cueSignature}`
            );
        });

        return `timeline:${stableHash(parts.join('|')).toString(16)}:${lyrics.length}`;
    }

    function pruneSongPreferences() {
        const keys = Object.keys(state.songPreferences || {});
        if (keys.length <= SONG_PREFERENCES_MAX_ENTRIES) return;
        keys.sort((left, right) =>
            finiteNumber(state.songPreferences[left] && state.songPreferences[left].updatedAt, 0)
            - finiteNumber(state.songPreferences[right] && state.songPreferences[right].updatedAt, 0)
        );
        keys.slice(0, keys.length - SONG_PREFERENCES_MAX_ENTRIES)
            .forEach(key => delete state.songPreferences[key]);
    }

    function persistSongPreferences() {
        try {
            pruneSongPreferences();
            localStorage.setItem(
                SONG_PREFERENCES_STORAGE_KEY,
                JSON.stringify(state.songPreferences)
            );
        } catch {
            // Quota/private-mode failures should not affect live playback.
        }
    }

    function applySongPreferences(lyrics = state.lyrics) {
        const key = songPreferenceKeyForLyrics(lyrics);
        state.songPreferenceKey = key;
        const entry = key && state.songPreferences[key]
            ? state.songPreferences[key]
            : null;
        state.romanizationMode =
            entry && entry.romanization === 'romanized'
                ? 'romanized'
                : 'native';
        const currentTimingFingerprint =
            timingTimelineFingerprint(lyrics);
        const storedOffset =
            entry
                ? clampTimingOffsetSeconds(entry.timingOffsetSeconds)
                : 0;
        const timingMatches =
            !!entry
            && !!entry.timingFingerprint
            && entry.timingFingerprint === currentTimingFingerprint;

        /*
         * Never carry an unfingerprinted legacy timing correction onto a
         * replacement lyric timeline. Romanization preference remains safe to
         * restore independently, while timing defaults to the source file.
         */
        state.timingOffsetSeconds =
            timingMatches ? storedOffset : 0;
        state.timingPickActive = false;
        state.timingUndo = null;
        updateRomanizationToggleUi();
        updateTimingControlsUi();
    }

    function persistCurrentSongPreference() {
        const key = state.songPreferenceKey || songPreferenceKeyForLyrics();
        if (!key) return false;
        state.songPreferenceKey = key;

        const isDefault =
            state.romanizationMode !== 'romanized'
            && Math.abs(state.timingOffsetSeconds) < 0.0001;

        if (isDefault) {
            delete state.songPreferences[key];
        } else {
            state.songPreferences[key] = {
                romanization:
                    state.romanizationMode === 'romanized'
                        ? 'romanized'
                        : 'native',
                timingOffsetSeconds:
                    clampTimingOffsetSeconds(state.timingOffsetSeconds),
                timingFingerprint:
                    timingTimelineFingerprint(),
                updatedAt: Date.now()
            };
        }

        persistSongPreferences();
        return true;
    }

    function hasNativeScriptCandidate(text) {
        const value = String(text || '').trim();
        if (!value) return false;
        const profile = detectScriptProfile(value);
        return profile !== 'latin';
    }

    function lyricsHaveNativeScript(lyrics) {
        return (lyrics || []).some(lyric => {
            const profile = lyricTextProfile(lyric);
            return hasNativeScriptCandidate(profile.text);
        });
    }

    function romanizerAssetUrl() {
        let source = '';
        try {
            const scripts = document.getElementsByTagName('script');
            for (let index = scripts.length - 1; index >= 0; index -= 1) {
                const candidate = String(scripts[index].src || '');
                if (candidate.indexOf('jellyfin-lyric-motion.js') >= 0) {
                    source = candidate;
                    break;
                }
            }
        } catch {
            source = '';
        }

        if (source) {
            const clean = source.split('#', 1)[0].split('?', 1)[0];
            return clean.replace(/jellyfin-lyric-motion\.js$/i, ROMANIZER_ASSET)
                + `?v=${encodeURIComponent(ROMANIZER_ASSET_VERSION)}`;
        }

        return `${ROMANIZER_ASSET}?v=${encodeURIComponent(ROMANIZER_ASSET_VERSION)}`;
    }

    function getRomanizer() {
        const candidate = window.JellyfinLyricRomanizer;
        return candidate
            && String(candidate.version || '') === LYRICG2P_VERSION
            && typeof candidate.romanize === 'function'
            && typeof candidate.canRomanize === 'function'
            ? candidate
            : null;
    }

    function ensureRomanizerLoaded() {
        const existing = getRomanizer();
        if (existing) {
            state.romanizationLoadState = 'ready';
            state.romanizationSource = existing.strategy || 'local';
            return Promise.resolve(existing);
        }

        if (romanizerLoadPromise) return romanizerLoadPromise;

        state.romanizationLoadState = 'loading';
        state.romanizationLoadError = '';

        romanizerLoadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.async = true;
            script.src = romanizerAssetUrl();
            script.dataset.akRomanizerLoader = '1';

            let settled = false;
            const cleanup = () => {
                if (script.parentNode) script.parentNode.removeChild(script);
            };
            const finish = (error, loaded = null) => {
                if (settled) return;
                settled = true;
                clearTimeout(timeoutId);
                cleanup();
                if (error) reject(error);
                else resolve(loaded);
            };
            const timeoutId = setTimeout(() => {
                finish(new Error('Romanizer asset load timed out'));
            }, ROMANIZER_LOAD_TIMEOUT_MS);

            script.onload = () => {
                const loaded = getRomanizer();
                if (!loaded) {
                    finish(new Error('Romanizer asset loaded without API'));
                    return;
                }
                finish(null, loaded);
            };
            script.onerror = () => finish(new Error('Romanizer asset failed to load'));

            (document.head || document.documentElement).appendChild(script);
        }).then(romanizer => {
            state.romanizationLoadState = 'ready';
            state.romanizationLoadError = '';
            state.romanizationSource = romanizer.strategy || 'local';
            return romanizer;
        }).catch(error => {
            state.romanizationLoadState = 'error';
            state.romanizationLoadError = String(error && error.message || error);
            romanizerLoadPromise = null;
            throw error;
        });

        return romanizerLoadPromise;
    }

    function romanizeCached(text) {
        const value = String(text == null ? '' : text);
        if (!value) return value;

        if (state.romanizationCache.has(value)) {
            const cached = state.romanizationCache.get(value);
            /* Refresh recency on hits so the bounded cache behaves as LRU
             * instead of evicting frequently reused chorus lines by age. */
            state.romanizationCache.delete(value);
            state.romanizationCache.set(value, cached);
            return cached;
        }

        const romanizer = getRomanizer();
        if (!romanizer) return value;

        let result = value;
        try {
            const converted = romanizer.romanize(value);
            if (typeof converted === 'string' && converted.length) {
                result = converted;
            }
        } catch {
            result = value;
        }

        if (state.romanizationCache.has(value)) {
            state.romanizationCache.delete(value);
        }
        state.romanizationCache.set(value, result);
        while (state.romanizationCache.size > ROMANIZATION_CACHE_MAX_ENTRIES) {
            const oldest = state.romanizationCache.keys().next();
            if (oldest.done) break;
            state.romanizationCache.delete(oldest.value);
        }
        return result;
    }

    function cloneCueWithPositions(cue, position, endPosition) {
        const clone = Object.assign({}, cue || {});
        clone.Position = position;
        clone.position = position;
        clone.EndPosition = endPosition;
        clone.endPosition = endPosition;
        return clone;
    }

    function cloneLyricWithDisplay(lyric, text, cues) {
        const clone = Object.assign({}, lyric || {});
        clone.Text = text;
        clone.text = text;
        if (Array.isArray(cues)) {
            clone.Cues = cues;
            clone.cues = cues;
        }
        return clone;
    }

    function romanizedBoundaryStart(sourceText, sourceIndex, convertedLine) {
        const index = Math.max(0, Math.min(sourceText.length, Number(sourceIndex) || 0));
        if (index <= 0) return 0;
        if (index >= sourceText.length) return convertedLine.length;

        /*
         * Bias inserted transliteration separators toward the cue that begins
         * after the source boundary. For example 你好 -> "ni hao": the second
         * cue starts at 3 (after the generated space), while the first ends at
         * 2. Romanizing the complete line first also preserves word context for
         * Indic schwa/nasal/conjunct rules instead of transliterating each cue
         * as an isolated fragment.
         */
        const romanizer = getRomanizer();
        if (romanizer && typeof romanizer.mapBoundary === 'function') {
            try {
                const mapped = Number(romanizer.mapBoundary(sourceText, index, 'start'));
                if (Number.isFinite(mapped)) {
                    return Math.max(0, Math.min(convertedLine.length, mapped));
                }
            } catch {
                // Fall through to the generic prefix/suffix boundary strategy.
            }
        }

        const suffix = romanizeCached(sourceText.slice(index));
        return Math.max(0, Math.min(
            convertedLine.length,
            convertedLine.length - suffix.length
        ));
    }

    function romanizedBoundaryEnd(sourceText, sourceIndex, convertedLine) {
        const index = Math.max(0, Math.min(sourceText.length, Number(sourceIndex) || 0));
        if (index <= 0) return 0;
        if (index >= sourceText.length) return convertedLine.length;

        /* Keep generated separators after the cue that just ended. */
        const romanizer = getRomanizer();
        if (romanizer && typeof romanizer.mapBoundary === 'function') {
            try {
                const mapped = Number(romanizer.mapBoundary(sourceText, index, 'end'));
                if (Number.isFinite(mapped)) {
                    return Math.max(0, Math.min(convertedLine.length, mapped));
                }
            } catch {
                // Fall through to the generic prefix boundary strategy.
            }
        }

        const prefix = romanizeCached(sourceText.slice(0, index));
        return Math.max(0, Math.min(convertedLine.length, prefix.length));
    }

    function romanizedLyricView(lyric) {
        if (!lyric) return lyric;

        const romanizer = getRomanizer();
        const profile = lyricTextProfile(lyric);
        const marker = profile.positionOffset > 0
            ? profile.rawText.slice(0, profile.positionOffset)
            : '';
        const sourceText = profile.text;
        if (!romanizer || !romanizer.canRomanize(sourceText)) return lyric;

        /*
         * Romanize the complete lyric line exactly once.  ELRC cues are source
         * character ranges, so re-map their boundaries into the completed
         * Latin line instead of transliterating cue fragments independently.
         * That preserves conjunct, nasal, schwa and neighbouring-word context
         * while leaving every cue timestamp untouched.
         */
        const convertedLine = romanizeCached(sourceText);
        if (!convertedLine || convertedLine === sourceText) return lyric;

        const rawCues = lyricValue(lyric, 'Cues', 'cues');
        if (!Array.isArray(rawCues) || !rawCues.length) {
            state.romanizationLineCount += 1;
            return cloneLyricWithDisplay(lyric, marker + convertedLine, rawCues);
        }

        const sorted = rawCues.slice().sort((a, b) =>
            (Number(cueValue(a, 'Position', 'position')) || 0)
            - (Number(cueValue(b, 'Position', 'position')) || 0)
        );

        const convertedCues = sorted.map(cue => {
            let start = Number(cueValue(cue, 'Position', 'position'));
            let end = Number(cueValue(cue, 'EndPosition', 'endPosition'));
            if (!Number.isFinite(start)) start = profile.positionOffset;
            if (!Number.isFinite(end)) end = start;
            start = Math.max(0, Math.min(sourceText.length, start - profile.positionOffset));
            end = Math.max(start, Math.min(sourceText.length, end - profile.positionOffset));

            return cloneCueWithPositions(
                cue,
                profile.positionOffset + romanizedBoundaryStart(sourceText, start, convertedLine),
                profile.positionOffset + romanizedBoundaryEnd(sourceText, end, convertedLine)
            );
        });

        state.romanizationLineCount += 1;
        return cloneLyricWithDisplay(lyric, marker + convertedLine, convertedCues);
    }

    function displayLyricForCurrentMode(lyric) {
        if (
            state.romanizationMode === 'romanized'
            && state.romanizationAvailable
        ) {
            return romanizedLyricView(lyric);
        }
        return lyric;
    }

    function removeLyricsToolsHostIfEmpty() {
        const host = state.lyricToolsHost;
        if (!host || !host.isConnected) {
            state.lyricToolsHost = null;
            return;
        }
        if (!host.children.length && host.parentNode) {
            host.parentNode.removeChild(host);
            state.lyricToolsHost = null;
        }
    }

    function ensureLyricsToolsHost() {
        if (!state.lyrics || !isLyricsPage()) return null;
        const page = getCurrentLyricPage();
        if (!page) return null;

        let host = state.lyricToolsHost;
        if (!host || !host.isConnected) {
            host = document.createElement('div');
            host.className = 'ak-lyrics-tools';
            host.dataset.akLyricsTools = '1';
            host.setAttribute('role', 'group');
            host.setAttribute('aria-label', 'Lyric display controls');
            page.appendChild(host);
            state.lyricToolsHost = host;
        } else if (host.parentNode !== page) {
            page.appendChild(host);
        }
        return host;
    }

    function formatTimingOffset(seconds = state.timingOffsetSeconds) {
        const value = Math.abs(seconds) < 0.0001 ? 0 : seconds;
        const sign = value >= 0 ? '+' : '-';
        return `${sign}${Math.abs(value).toFixed(1)}s`;
    }

    function rememberTimingUndo() {
        state.timingUndo = state.timingOffsetSeconds;
    }

    function updateTimingControlsUi() {
        const controls = state.timingControls;
        if (controls) {
            const valueNode =
                controls.querySelector('.ak-timing-chip-value');
            const value =
                clampTimingOffsetSeconds(state.timingOffsetSeconds);
            if (valueNode) {
                valueNode.textContent = formatTimingOffset(value);
            }
            controls.dataset.akTimingOffset = value.toFixed(1);
            controls.dataset.akTimingActive =
                Math.abs(value) >= 0.0001 ? 'true' : 'false';
            controls.setAttribute(
                'aria-label',
                `Lyrics timing ${formatTimingOffset(value)}`
            );
            controls.setAttribute(
                'aria-expanded',
                state.timingPopover && state.timingPopover.isConnected
                    ? 'true'
                    : 'false'
            );
            controls.title =
                `Lyrics timing ${formatTimingOffset(value)}`;
        }

        const popover = state.timingPopover;
        if (!popover) return;

        const current =
            popover.querySelector('.ak-timing-current-value');
        const status =
            popover.querySelector('.ak-timing-sync-status');
        const undo =
            popover.querySelector('[data-ak-timing-action="undo"]');
        const reset =
            popover.querySelector('[data-ak-timing-action="reset"]');

        if (current) current.textContent = formatTimingOffset();

        if (status) {
            status.textContent = state.timingPickActive
                ? 'Tap the lyric or timed word exactly when it starts.'
                : 'Use Sync for an exact word/line anchor, or nudge by 0.1s / 0.5s.';
        }

        if (undo) undo.disabled = state.timingUndo === null;
        if (reset) {
            reset.disabled =
                Math.abs(state.timingOffsetSeconds) < 0.0001;
        }
    }

    function invalidateTimingPaintState() {
        state.lastActiveLine = -999;
        state.lastActiveLineSignature = '';
        state.activeLineIndexes = [];
        state.forceNextFrame = true;
        (state.lineData || []).forEach(line => {
            (line.words || []).forEach(word => {
                word.visualProgress = NaN;
                word.lastPaintAt = 0;
                word._akStaticState = '';
                word._akProgressBucket = -1;
                resetWordMotion(word);
            });
        });
        wakeAnimationLoop();
    }

    function setTimingOffsetSeconds(
        value,
        persist = true,
        rememberUndo = true
    ) {
        const normalized = clampTimingOffsetSeconds(value);
        const changed =
            Math.abs(normalized - state.timingOffsetSeconds) >= 0.0001;

        if (!changed) {
            updateTimingControlsUi();
            return {
                seconds: state.timingOffsetSeconds,
                display: formatTimingOffset(),
                songKey: state.songPreferenceKey
            };
        }

        if (rememberUndo) rememberTimingUndo();

        state.timingOffsetSeconds = normalized;
        state.timingOffsetChangeCount += 1;

        if (persist) persistCurrentSongPreference();

        invalidateTimingPaintState();
        updateTimingControlsUi();

        return {
            seconds: state.timingOffsetSeconds,
            display: formatTimingOffset(),
            songKey: state.songPreferenceKey
        };
    }

    function adjustTimingOffsetSeconds(delta) {
        return setTimingOffsetSeconds(
            state.timingOffsetSeconds + finiteNumber(delta, 0),
            true,
            true
        );
    }

    function resetTimingOffsetValue() {
        return setTimingOffsetSeconds(0, true, true);
    }

    function undoTimingOffset() {
        if (state.timingUndo === null) return null;
        const previous = clampTimingOffsetSeconds(state.timingUndo);
        const current = state.timingOffsetSeconds;
        state.timingUndo = null;
        const result = setTimingOffsetSeconds(
            previous,
            true,
            false
        );
        state.timingUndo = current;
        updateTimingControlsUi();
        return result;
    }

    function timingSourceTicksForTarget(target) {
        if (!target || !target.closest) return null;

        const wordElement = target.closest('.ak-word');
        const lineElement = target.closest('.ak-enhanced-line');

        const lineIndex = Number(
            (
                wordElement
                && wordElement.dataset.akTimingLineIndex
            )
            || (
                lineElement
                && lineElement.dataset.akTimingLineIndex
            )
        );

        if (
            !Number.isInteger(lineIndex)
            || lineIndex < 0
            || lineIndex >= state.lineData.length
        ) {
            return null;
        }

        const line = state.lineData[lineIndex];

        if (wordElement) {
            const wordIndex =
                Number(wordElement.dataset.akTimingWordIndex);
            const word =
                Number.isInteger(wordIndex)
                    && line.words
                    ? line.words[wordIndex]
                    : null;

            if (word && Number.isFinite(word.start)) {
                return {
                    ticks: word.start,
                    lineIndex,
                    wordIndex,
                    granularity: 'word',
                    text: word.text
                };
            }
        }

        if (Number.isFinite(line.startTicks)) {
            return {
                ticks: line.startTicks,
                lineIndex,
                wordIndex: -1,
                granularity: 'line',
                text: line.text
            };
        }

        return null;
    }

    function currentUnadjustedTimelineTicks() {
        const media = getLocalMediaElement(true);
        if (!media) return null;

        const adjustedTicks =
            chooseTimelineTicks(
                media,
                performance.now()
            );

        return removeUserTimingOffsetTicks(adjustedTicks);
    }

    function stopTimingSyncMode() {
        state.timingPickActive = false;

        if (
            state.timingPickListenerInstalled
            && typeof document !== 'undefined'
        ) {
            document.removeEventListener(
                'click',
                handleTimingPickClick,
                true
            );
            state.timingPickListenerInstalled = false;
        }

        const page = getCurrentLyricPage();
        if (page) page.classList.remove('ak-timing-pick-mode');

        updateTimingControlsUi();
    }

    function captureTimingSync(target) {
        const source = timingSourceTicksForTarget(target);
        const actualTicks = currentUnadjustedTimelineTicks();

        if (!source || !Number.isFinite(actualTicks)) {
            return null;
        }

        const sourceSeconds = source.ticks / TICKS_PER_SECOND;
        const actualSeconds = actualTicks / TICKS_PER_SECOND;
        const offsetSeconds = actualSeconds - sourceSeconds;

        const result = setTimingOffsetSeconds(
            offsetSeconds,
            true,
            true
        );

        stopTimingSyncMode();

        return {
            sourceSeconds,
            actualSeconds,
            offsetSeconds: result.seconds,
            lineIndex: source.lineIndex,
            wordIndex: source.wordIndex,
            granularity: source.granularity,
            text: source.text
        };
    }

    function handleTimingPickClick(event) {
        if (!state.timingPickActive) return;

        const target = event && event.target;
        if (!target || !target.closest) return;

        const lyricTarget =
            target.closest(
                '.ak-word, .ak-enhanced-line'
            );

        if (!lyricTarget) return;

        event.preventDefault();
        event.stopPropagation();

        captureTimingSync(lyricTarget);
    }

    function beginTimingSyncMode() {
        state.timingPickActive = true;

        if (
            !state.timingPickListenerInstalled
            && typeof document !== 'undefined'
        ) {
            document.addEventListener(
                'click',
                handleTimingPickClick,
                true
            );
            state.timingPickListenerInstalled = true;
        }

        const page = getCurrentLyricPage();
        if (page) page.classList.add('ak-timing-pick-mode');

        updateTimingControlsUi();

        return { active: true };
    }

    function removeTimingPopover() {
        stopTimingSyncMode();

        const popover = state.timingPopover;
        if (popover && popover.parentNode) {
            popover.parentNode.removeChild(popover);
        }
        state.timingPopover = null;
        updateTimingControlsUi();
    }

    function createTimingActionButton(
        label,
        action,
        className = ''
    ) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className =
            `ak-timing-action ${className}`.trim();
        button.dataset.akTimingAction = action;
        button.textContent = label;
        return button;
    }

    function ensureTimingPopover() {
        if (state.timingPopover && state.timingPopover.isConnected) {
            return state.timingPopover;
        }

        const host = ensureLyricsToolsHost();
        if (!host) return null;

        const popover = document.createElement('div');
        popover.id = 'ak-lyrics-timing-popover';
        popover.className = 'ak-timing-popover';
        popover.dataset.akOwned = '1';
        popover.setAttribute('role', 'dialog');
        popover.setAttribute('aria-label', 'Lyrics timing assistant');

        const heading = document.createElement('div');
        heading.className = 'ak-timing-popover-heading';
        heading.textContent = 'Lyrics timing';

        const summary = document.createElement('div');
        summary.className = 'ak-timing-summary';

        const current = document.createElement('strong');
        current.className = 'ak-timing-current-value';
        summary.appendChild(current);

        const fineRow = document.createElement('div');
        fineRow.className = 'ak-timing-action-row';
        fineRow.appendChild(
            createTimingActionButton('−0.1', 'minus-fine')
        );
        fineRow.appendChild(
            createTimingActionButton('+0.1', 'plus-fine')
        );
        fineRow.appendChild(
            createTimingActionButton('−0.5', 'minus-coarse')
        );
        fineRow.appendChild(
            createTimingActionButton('+0.5', 'plus-coarse')
        );

        const sync = createTimingActionButton(
            'Sync lyric to now',
            'sync-one',
            'ak-timing-action-wide ak-timing-action-primary'
        );

        const status = document.createElement('div');
        status.className = 'ak-timing-sync-status';
        status.setAttribute('aria-live', 'polite');

        const footer = document.createElement('div');
        footer.className = 'ak-timing-action-row';
        footer.appendChild(createTimingActionButton('Undo', 'undo'));
        footer.appendChild(createTimingActionButton('Reset', 'reset'));
        footer.appendChild(createTimingActionButton('Close', 'close'));

        popover.appendChild(heading);
        popover.appendChild(summary);
        popover.appendChild(fineRow);
        popover.appendChild(sync);
        popover.appendChild(status);
        popover.appendChild(footer);

        popover.addEventListener('click', event => {
            const button =
                event.target
                && event.target.closest
                    ? event.target.closest(
                        '[data-ak-timing-action]'
                    )
                    : null;

            if (!button) return;

            event.preventDefault();
            event.stopPropagation();

            const action = button.dataset.akTimingAction;

            if (action === 'minus-fine') {
                adjustTimingOffsetSeconds(
                    -TIMING_OFFSET_FINE_STEP_SECONDS
                );
            } else if (action === 'plus-fine') {
                adjustTimingOffsetSeconds(
                    TIMING_OFFSET_FINE_STEP_SECONDS
                );
            } else if (action === 'minus-coarse') {
                adjustTimingOffsetSeconds(
                    -TIMING_OFFSET_STEP_SECONDS
                );
            } else if (action === 'plus-coarse') {
                adjustTimingOffsetSeconds(
                    TIMING_OFFSET_STEP_SECONDS
                );
            } else if (action === 'sync-one') {
                beginTimingSyncMode();
            } else if (action === 'undo') {
                undoTimingOffset();
            } else if (action === 'reset') {
                resetTimingOffsetValue();
            } else if (action === 'close') {
                removeTimingPopover();
            }

            updateTimingControlsUi();
        });

        host.appendChild(popover);
        state.timingPopover = popover;
        updateTimingControlsUi();

        return popover;
    }

    function toggleTimingPopover() {
        if (
            state.timingPopover
            && state.timingPopover.isConnected
        ) {
            removeTimingPopover();
            return null;
        }

        return ensureTimingPopover();
    }

    function removeTimingControls() {
        removeTimingPopover();

        const controls = state.timingControls;
        if (controls && controls.parentNode) {
            controls.parentNode.removeChild(controls);
        }
        state.timingControls = null;
        removeLyricsToolsHostIfEmpty();
    }

    function ensureTimingControls() {
        if (!state.lyrics || !isLyricsPage()) {
            removeTimingControls();
            return null;
        }

        const host = ensureLyricsToolsHost();
        if (!host) return null;

        let controls = state.timingControls;

        if (!controls || !controls.isConnected) {
            controls = document.createElement('button');
            controls.type = 'button';
            controls.id = 'lyrics-timing-display';
            controls.className =
                'ak-lyrics-timing-chip';
            controls.dataset.akOwned = '1';
            controls.setAttribute('aria-haspopup', 'dialog');
            controls.setAttribute('aria-controls', 'ak-lyrics-timing-popover');
            controls.setAttribute('aria-expanded', 'false');

            const icon = document.createElement('span');
            icon.className = 'ak-timing-chip-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = '⏱';

            const value = document.createElement('span');
            value.className = 'ak-timing-chip-value';
            value.setAttribute('aria-live', 'polite');

            controls.appendChild(icon);
            controls.appendChild(value);

            controls.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                toggleTimingPopover();
            });

            host.appendChild(controls);
            state.timingControls = controls;
        } else if (controls.parentNode !== host) {
            host.appendChild(controls);
        }

        updateTimingControlsUi();
        return controls;
    }

    function removeRomanizationToggle() {
        const button = state.romanizationToggle;
        if (button && button.parentNode) {
            button.parentNode.removeChild(button);
        }
        state.romanizationToggle = null;
        removeLyricsToolsHostIfEmpty();
    }

    function updateRomanizationToggleUi() {
        const button = state.romanizationToggle;
        if (!button) return;
        const active = state.romanizationMode === 'romanized';
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.setAttribute(
            'aria-label',
            active ? 'Show native lyrics' : 'Show romanized lyrics'
        );
        button.dataset.akRomanizationMode = active ? 'romanized' : 'native';
        button.title = active
            ? 'Show native lyrics'
            : 'Show romanized lyrics';

        const label = button.querySelector('.ak-romanization-label');
        if (label) label.textContent = active ? 'Romanized' : 'Romanize';
    }

    function ensureRomanizationToggle() {
        if (!state.romanizationAvailable || !isLyricsPage()) {
            removeRomanizationToggle();
            return null;
        }

        const host = ensureLyricsToolsHost();
        if (!host) return null;

        let button = state.romanizationToggle;
        if (!button || !button.isConnected) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = 'ak-romanization-toggle';
            button.setAttribute('aria-label', 'Toggle lyric romanization');

            const icon = document.createElement('span');
            icon.className = 'ak-romanization-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = 'A';

            const label = document.createElement('span');
            label.className = 'ak-romanization-label';

            button.appendChild(icon);
            button.appendChild(label);
            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                setRomanizationMode(
                    state.romanizationMode === 'romanized'
                        ? 'native'
                        : 'romanized'
                );
            });

            /* Romanize is always the first tool. The only other visible
             * LyricMotion control group is the existing timing offset. */
            host.insertBefore(button, host.firstChild || null);
            state.romanizationToggle = button;
        } else if (button.parentNode !== host) {
            host.insertBefore(button, host.firstChild || null);
        }

        updateRomanizationToggleUi();
        return button;
    }

    function redecorateForRomanization() {
        state.romanizationLineCount = 0;
        state.lastActiveLine = -999;
        state.lastActiveLineSignature = '';
        state.forceNextFrame = true;

        if (state.lyrics && isLyricsPage()) {
            if (!decorateExistingLines()) queueDecoration();
        }
        ensureRomanizationToggle();
        wakeAnimationLoop();
    }

    function setRomanizationMode(mode) {
        const normalized = mode === 'romanized' ? 'romanized' : 'native';
        if (normalized === 'romanized' && !state.romanizationAvailable) {
            return {
                mode: state.romanizationMode,
                available: false
            };
        }

        if (state.romanizationMode !== normalized) {
            state.romanizationMode = normalized;
            state.romanizationToggleCount += 1;
            persistCurrentSongPreference();
            redecorateForRomanization();
        } else {
            updateRomanizationToggleUi();
        }

        return {
            mode: state.romanizationMode,
            available: state.romanizationAvailable
        };
    }

    function prepareRomanizationForLyrics() {
        const lyrics = state.lyrics;
        const generation = state.generation;
        const nativeCandidate = lyricsHaveNativeScript(lyrics);

        state.romanizationCache.clear();
        state.romanizationCandidate = nativeCandidate;
        state.romanizationAvailable = false;
        state.romanizationLineCount = 0;
        removeRomanizationToggle();

        if (!nativeCandidate) {
            if (state.romanizationMode === 'romanized') {
                state.romanizationMode = 'native';
                persistCurrentSongPreference();
            }
            state.romanizationLoadState = getRomanizer() ? 'ready' : 'idle';
            state.romanizationSource = 'none';
            return;
        }

        ensureRomanizerLoaded().then(romanizer => {
            if (generation !== state.generation || lyrics !== state.lyrics) return;

            const localAvailable = (lyrics || []).some(lyric => {
                const profile = lyricTextProfile(lyric);
                return romanizer.canRomanize(profile.text);
            });
            state.romanizationAvailable = localAvailable;
            state.romanizationSource = localAvailable
                ? (romanizer.strategy || 'local-offline')
                : 'unsupported-script';

            if (!localAvailable) {
                if (state.romanizationMode === 'romanized') {
                    state.romanizationMode = 'native';
                    persistCurrentSongPreference();
                }
                removeRomanizationToggle();
                return;
            }

            ensureRomanizationToggle();
            if (state.romanizationMode === 'romanized') {
                redecorateForRomanization();
            }
        }).catch(error => {
            if (generation !== state.generation || lyrics !== state.lyrics) return;
            state.romanizationLoadError = String(error && error.message || error);
            state.romanizationAvailable = false;
            state.romanizationSource = 'local-asset-unavailable';
            if (state.romanizationMode === 'romanized') {
                state.romanizationMode = 'native';
                persistCurrentSongPreference();
            }
            warn('Romanization unavailable:', error && error.message || error);
            removeRomanizationToggle();
        });
    }

    loadSongPreferences();

    function finiteTick(value) {
        const numeric = Number(value);
        return Number.isFinite(numeric)
            ? numeric
            : null;
    }

    function nextLyricStartTicks(lineIndex) {
        const next =
            state.lyrics
            && state.lyrics[lineIndex + 1];

        return next
            ? finiteTick(
                lyricValue(next, 'Start', 'start')
            )
            : null;
    }

    function calculateLineBounds(
        lyric,
        lineIndex,
        words,
        cues,
        rawTextLength
    ) {
        const lyricStart = finiteTick(
            lyricValue(lyric, 'Start', 'start')
        );

        const wordStarts = (words || [])
            .map(word => finiteTick(word.start))
            .filter(value => value !== null);

        const startTicks = lyricStart !== null
            ? lyricStart
            : (
                wordStarts.length
                    ? Math.min(...wordStarts)
                    : 0
            );

        const endCandidates = [];
        const lyricEnd = finiteTick(
            lyricValue(lyric, 'End', 'end')
        );

        if (lyricEnd !== null && lyricEnd > startTicks) {
            endCandidates.push(lyricEnd);
        }

        (words || []).forEach(word => {
            const end = finiteTick(word.end);
            if (end !== null && end > startTicks) {
                endCandidates.push(end);
            }
        });

        (cues || []).forEach(cue => {
            const explicitEnd = finiteTick(
                cueValue(cue, 'End', 'end')
            );

            if (
                explicitEnd !== null
                && explicitEnd > startTicks
            ) {
                endCandidates.push(explicitEnd);
            }

            const position = finiteTick(
                cueValue(cue, 'Position', 'position')
            );

            const cueStart = finiteTick(
                cueValue(cue, 'Start', 'start')
            );

            /*
             * The converter emits a final empty enhanced timestamp. Jellyfin
             * exposes it as a cue at text.length; retain it as the true line
             * end even when the following line has already started.
             */
            if (
                position !== null
                && position >= rawTextLength
                && cueStart !== null
                && cueStart > startTicks
            ) {
                endCandidates.push(cueStart);
            }
        });

        let endTicks = endCandidates.length
            ? Math.max(...endCandidates)
            : nextLyricStartTicks(lineIndex);

        if (
            endTicks === null
            || endTicks <= startTicks
        ) {
            endTicks = startTicks + 7500000;
        }

        return {
            startTicks,
            endTicks
        };
    }

    function decorateLine(lineElement, lyric, lineIndex) {
        const displayLyric = displayLyricForCurrentMode(lyric);
        const textProfile = lyricTextProfile(displayLyric);
        const rawText = textProfile.rawText;
        const text = textProfile.text;
        const positionOffset = textProfile.positionOffset;
        const isBackgroundVocal =
            textProfile.isBackgroundVocal;
        const backgroundVocalRoleSource =
            textProfile.backgroundVocalRoleSource;
        const rawCues = lyricValue(displayLyric, 'Cues', 'cues');
        const cues = Array.isArray(rawCues)
            ? rawCues.slice().sort((a, b) =>
                (cueValue(a, 'Position', 'position') || 0) -
                (cueValue(b, 'Position', 'position') || 0))
            : [];

        lineElement.style.removeProperty('visibility');
        lineElement.removeAttribute('aria-hidden');
        lineElement.classList.add('ak-enhanced-line');
        lineElement.dataset.akTimingLineIndex = String(lineIndex);
        lineElement.classList.toggle('ak-word-synced', cues.length > 0);
        lineElement.classList.toggle('ak-line-synced', cues.length === 0);
        lineElement.classList.toggle(
            'ak-background-vocal',
            isBackgroundVocal
        );
        lineElement.classList.remove(
            'ak-bg-lane-center',
            'ak-bg-lane-inset-start',
            'ak-bg-lane-inset-end',
            'ak-bg-enter-from-start',
            'ak-bg-enter-from-end'
        );
        delete lineElement.dataset.akBackgroundLane;
        delete lineElement.dataset.akBackgroundEntry;
        lineElement.classList.remove(
            'ak-has-shaped-script'
        );
        lineElement.dataset.akGeneration = String(state.generation);
        lineElement.dataset.akVocalRole =
            isBackgroundVocal
                ? 'background'
                : 'main';
        if (backgroundVocalRoleSource) {
            lineElement.dataset.akVocalRoleSource =
                backgroundVocalRoleSource;
        } else {
            delete lineElement.dataset.akVocalRoleSource;
        }
        const lineDirection = firstStrongDirection(text);
        lineElement.setAttribute('dir', lineDirection);

        /* Keep screen-reader output in the song's language; vocal role stays data. */
        lineElement.setAttribute('aria-label', text);
        replaceChildrenCompat(lineElement);

        if (!cues.length) {
            lineElement.appendChild(createUntimedSpan(text));
            const bounds = calculateLineBounds(
                displayLyric,
                lineIndex,
                [],
                [],
                rawText.length
            );
            return {
                element: lineElement,
                displayLyric,
                lineIndex,
                text,
                cues: [],
                words: [],
                startTicks: bounds.startTicks,
                endTicks: bounds.endTicks,
                isBackgroundVocal,
                backgroundVocalRoleSource
            };
        }

        const graphemeBoundaries =
            getGraphemeBoundaries(text);

        const cueRecords = [];
        let rawCursor = 0;

        cues.forEach((cue, cueIndex) => {
            let startPos = Number(cueValue(cue, 'Position', 'position'));
            let endPos = Number(cueValue(cue, 'EndPosition', 'endPosition'));

            if (!Number.isFinite(startPos)) startPos = rawCursor;
            if (!Number.isFinite(endPos)) endPos = startPos;

            startPos = Math.max(rawCursor, Math.min(rawText.length, startPos));
            endPos = Math.max(startPos, Math.min(rawText.length, endPos));

            rawCursor = endPos;

            startPos = Math.max(
                0,
                startPos - positionOffset
            );

            endPos = Math.max(
                startPos,
                endPos - positionOffset
            );

            const start =
                Number(
                    cueValue(
                        cue,
                        'Start',
                        'start'
                    )
                )
                || 0;

            const end = cueEndTicks(
                lineIndex,
                cueIndex,
                cue,
                cues
            );

            startPos = snapBoundary(graphemeBoundaries, startPos, 'backward');
            endPos = snapBoundary(graphemeBoundaries, endPos, 'forward');
            endPos = Math.max(startPos, Math.min(text.length, endPos));

            if (endPos > startPos) {
                const record = {
                    cue,
                    cueIndex,
                    startPos,
                    endPos,
                    start,
                    end,
                    sourceCueIndexes: [cueIndex]
                };

                const previous =
                    cueRecords[
                        cueRecords.length - 1
                    ];

                if (
                    previous
                    && record.startPos
                        < previous.endPos
                ) {
                    previous.endPos =
                        Math.max(
                            previous.endPos,
                            record.endPos
                        );

                    previous.start =
                        Math.min(
                            previous.start,
                            record.start
                        );

                    previous.end =
                        Math.max(
                            previous.end,
                            record.end
                        );

                    previous.sourceCueIndexes.push(
                        cueIndex
                    );
                } else {
                    cueRecords.push(record);
                }
            }
        });

        const words = buildWordRecords(text, lineIndex, cueRecords);
        classifyWordMotion(words);

        const hasShapedScript =
            words.some(
                word =>
                    word.paintMode === 'shaped'
            );

        lineElement.classList.toggle(
            'ak-has-shaped-script',
            hasShapedScript
        );

        /*
         * Render exactly one shaped span per source word/token. Space-delimited
         * scripts keep word scope; CJK/Thai/Lao/Khmer/Myanmar can preserve the
         * exact ELRC cue token boundaries when the source provides them.
         * Cue timing remains available as progress segments inside each span.
         */
        let textCursor = 0;

        words.forEach(word => {
            if (word.startPos > textCursor) {
                lineElement.appendChild(
                    createUntimedSpan(text.slice(textCursor, word.startPos))
                );
            }

            lineElement.appendChild(createWordSpan(word));
            textCursor = word.endPos;
        });

        if (textCursor < text.length) {
            lineElement.appendChild(
                createUntimedSpan(text.slice(textCursor))
            );
        }

        const bounds = calculateLineBounds(
            displayLyric,
            lineIndex,
            words,
            cues,
            rawText.length
        );

        return {
            element: lineElement,
            displayLyric,
            lineIndex,
            text,
            cues: cueRecords,
            words,
            startTicks: bounds.startTicks,
            endTicks: bounds.endTicks,
            isBackgroundVocal,
            backgroundVocalRoleSource
        };
    }

    function backgroundVocalLaneForOrdinal(ordinal) {
        const safeOrdinal = Math.max(
            0,
            Math.floor(Number(ordinal) || 0)
        );

        return BACKGROUND_VOCAL_LANE_PATTERN[
            safeOrdinal
                % BACKGROUND_VOCAL_LANE_PATTERN.length
        ];
    }

    function applyBackgroundVocalLane(
        lineRecord,
        ordinal
    ) {
        if (
            !lineRecord
            || !lineRecord.isBackgroundVocal
            || !lineRecord.element
        ) {
            return null;
        }

        const lane =
            backgroundVocalLaneForOrdinal(
                ordinal
            );

        lineRecord.backgroundVocalLane = lane;
        const entryDirection =
            safeBackgroundVocalEntryDirection(
                ordinal
            );
        lineRecord.backgroundVocalEntryDirection =
            entryDirection;
        lineRecord.element.dataset.akBackgroundLane = lane;
        lineRecord.element.dataset.akBackgroundEntry =
            entryDirection;
        lineRecord.element.classList.add(
            `ak-bg-lane-${lane}`,
            `ak-bg-enter-from-${entryDirection}`
        );

        return lane;
    }

    function safeBackgroundVocalEntryDirection(
        ordinal
    ) {
        const safeOrdinal = Math.max(
            0,
            Math.floor(Number(ordinal) || 0)
        );

        return safeOrdinal % 4 < 2
            ? 'start'
            : 'end';
    }

    function inspectBackgroundVocals() {
        const lines = state.lineData
            .filter(line => line.isBackgroundVocal)
            .map(line => ({
                lineIndex: line.lineIndex,
                text: line.text,
                lane: line.backgroundVocalLane,
                entryFrom:
                    line.backgroundVocalEntryDirection,
                roleSource:
                    line.backgroundVocalRoleSource,
                startSeconds:
                    Number(
                        (
                            line.startTicks
                            / TICKS_PER_SECOND
                        ).toFixed(3)
                    ),
                endSeconds:
                    Number(
                        (
                            line.endTicks
                            / TICKS_PER_SECOND
                        ).toFixed(3)
                    )
            }));

        return {
            detected: lines.length,
            marker:
                '[ak:bg] (legacy U+2063 U+2060 accepted)',
            sequence:
                BACKGROUND_VOCAL_LANE_PATTERN
                    .slice(),
            lines,
            cacheHint:
                lines.length
                    ? null
                    : 'No x-bg role reached the renderer. Reconvert with preview.4; complete parenthetical responses are also recovered when Jellyfin stripped the old marker.'
        };
    }

    function decorateExistingLines() {
        if (!state.lyrics || !isLyricsPage()) return false;
        const container = getCurrentLyricsContainer(false);
        if (!container) return false;

        const lines = Array.from(container.querySelectorAll('.lyricsLine'));
        if (!lines.length) return false;

        const count = Math.min(lines.length, state.lyrics.length);
        state.lineData = [];
        state.shapedWordCount = 0;
        state.scriptProfileCounts = {};
        state.backgroundVocalCount = 0;
        state.romanizationLineCount = 0;

        for (let i = 0; i < count; i += 1) {
            const lineRecord =
                decorateLine(
                    lines[i],
                    state.lyrics[i],
                    i
                );

            state.lineData.push(lineRecord);

            if (lineRecord.isBackgroundVocal) {
                applyBackgroundVocalLane(
                    lineRecord,
                    state.backgroundVocalCount
                );
                state.backgroundVocalCount += 1;
            }

            (lineRecord.words || [])
                .forEach(word => {
                    const profile =
                        word.scriptProfile
                        || 'spatial';

                    state.scriptProfileCounts[profile] =
                        (
                            state.scriptProfileCounts[
                                profile
                            ]
                            || 0
                        )
                        + 1;

                    if (word.paintMode === 'shaped') {
                        state.shapedWordCount += 1;
                    }
                });
        }

        let prefixEnd = -Infinity;
        state.lineEndPrefix = state.lineData.map(
            lineRecord => {
                prefixEnd = Math.max(
                    prefixEnd,
                    Number(lineRecord.endTicks)
                        || -Infinity
                );
                return prefixEnd;
            }
        );

        state.decoratedGeneration = state.generation;
        state.lastActiveLine = -999;
        state.lastActiveLineSignature = '';
        state.activeLineIndexes = [];

        container.classList.add('ak-karaoke-container');
        container.classList.toggle(
            'ak-romanized-mode',
            state.romanizationMode === 'romanized'
                && state.romanizationAvailable
        );
        ensureRomanizationToggle();
        ensureTimingControls();

        applyAccentTheme();
        applyPerformanceProfile(false);
        /* Geometry is measured once after all lyric DOM has been decorated.
         * FontFaceSet hooks below schedule another pass only if fonts actually
         * finish loading later. Avoid synchronous per-line layout reads here. */
        queueMotionGeometryRefresh();

        ensureAnimationLoop();
        return true;
    }

    let decorateTimer = 0;

    function cancelDecorationRetry(
        resetWindow = true
    ) {
        if (decorateTimer) {
            clearTimeout(decorateTimer);
            decorateTimer = 0;
        }

        if (resetWindow) {
            state.decorationRetryStartedAt = 0;
            state.decorationRetryCount = 0;
        }
    }

    function runDecorationAttempt() {
        decorateTimer = 0;

        if (
            document.hidden
            || !state.lyrics
            || !isLyricsPage()
        ) {
            cancelDecorationRetry(true);
            return;
        }

        if (decorateExistingLines()) {
            cancelDecorationRetry(true);
            return;
        }

        const now = performance.now();

        if (!state.decorationRetryStartedAt) {
            state.decorationRetryStartedAt = now;
        }

        if (
            now - state.decorationRetryStartedAt
                >= DECORATION_RETRY_WINDOW_MS
        ) {
            state.decorationRetryExpiredCount += 1;
            cancelDecorationRetry(true);
            warn(
                'Lyrics DOM did not become ready before the decoration retry window expired.'
            );
            return;
        }

        state.decorationRetryCount += 1;
        decorateTimer = window.setTimeout(
            runDecorationAttempt,
            DECORATION_RETRY_MS
        );
    }

    function queueDecoration() {
        if (
            document.hidden
            || !state.lyrics
            || !isLyricsPage()
        ) {
            cancelDecorationRetry(true);
            return false;
        }

        if (!state.decorationRetryStartedAt) {
            state.decorationRetryStartedAt =
                performance.now();
        }

        if (decorateTimer) {
            clearTimeout(decorateTimer);
        }

        decorateTimer = window.setTimeout(
            runDecorationAttempt,
            0
        );

        return true;
    }

    function isMobileEnvironment() {
        const ua =
            String(
                navigator.userAgent || ''
            ).toLowerCase();

        return ua.includes('android')
            || ua.includes('iphone')
            || ua.includes('ipad')
            || ua.includes('ipod')
            || ua.includes('mobile');
    }

    function readPerformanceMode() {
        try {
            const stored =
                localStorage.getItem(
                    PERFORMANCE_STORAGE_KEY
                );

            if (
                stored === 'auto'
                || stored === 'desktop'
                || stored === 'mobile'
                || stored === 'eco'
            ) {
                return stored;
            }
        } catch {
            // Ignore storage failure.
        }

        return 'auto';
    }

    function detectPerformanceProfile() {
        if (
            state.performanceMode
            && state.performanceMode !== 'auto'
        ) {
            return state.performanceMode;
        }

        if (isMobileEnvironment()) {
            return 'mobile';
        }

        /* Eco is now explicit only; auto never weakens the visual renderer. */
        return 'desktop';
    }

    function applyPerformanceClassToPage(page) {
        if (!page) return;

        for (const name of [
            'desktop',
            'mobile',
            'eco'
        ]) {
            page.classList.remove(
                `ak-perf-${name}`
            );
        }

        page.classList.add(
            `ak-perf-${state.performanceProfile}`
        );
    }

    function applyPerformanceProfile(
        refreshGeometry = true
    ) {
        const previous =
            state.performanceProfile;

        state.performanceProfile =
            detectPerformanceProfile();

        if (
            previous !== state.performanceProfile
        ) {
            state.lastRenderedFrameAt = 0;

            /* Profile-sized atmosphere rasters must be rebuilt after a real
             * desktop/mobile/eco profile change. */
            invalidateAtmosphereLoads(
                'performance-profile-change'
            );
            state.atmosphereMediaKey = '';
            state.atmosphereLastCheck = 0;
        }

        const page =
            isLyricsPage()
                ? getCurrentLyricPage()
                : null;

        applyPerformanceClassToPage(page);
        applyAccentTheme();

        if (
            refreshGeometry
            && previous !== state.performanceProfile
            && state.lineData.length
        ) {
            queueMotionGeometryRefresh();
        }
    }

    function setPerformanceMode(mode) {
        const normalized =
            String(mode || '')
                .trim()
                .toLowerCase();

        if (
            normalized !== 'auto'
            && normalized !== 'desktop'
            && normalized !== 'mobile'
            && normalized !== 'eco'
        ) {
            throw new Error(
                'Performance mode must be: '
                + '"auto", "desktop", "mobile", or "eco".'
            );
        }

        state.performanceMode =
            normalized;

        try {
            localStorage.setItem(
                PERFORMANCE_STORAGE_KEY,
                normalized
            );
        } catch {
            // Ignore storage failure.
        }

        applyPerformanceProfile(true);
        wakeAnimationLoop();

        return {
            mode: state.performanceMode,
            profile: state.performanceProfile,
            targetFps:
                PERFORMANCE_TARGET_FPS[
                    state.performanceProfile
                ]
        };
    }

    function shouldUsePerGlyphMotion(
        glyphCount
    ) {
        if (
            state.performanceProfile === 'eco'
        ) {
            return false;
        }

        return Number(glyphCount) > 0;
    }

    function getTargetFrameInterval(media) {
        if (document.hidden) {
            return 500;
        }

        if (
            media
            && media.paused
        ) {
            return 1000 / PAUSED_TARGET_FPS;
        }

        if (
            state.timedCueCount === 0
        ) {
            return 1000 / LRC_TARGET_FPS;
        }

        const fps =
            PERFORMANCE_TARGET_FPS[
                state.performanceProfile
            ]
            || 30;

        return 1000 / fps;
    }

    function updateMeasuredFps(frameNow) {
        if (!state.performanceWindowStart) {
            state.performanceWindowStart =
                frameNow;
            state.performanceFrameCount = 0;
        }

        state.performanceFrameCount += 1;

        const elapsed =
            frameNow
            - state.performanceWindowStart;

        if (elapsed >= 2000) {
            state.measuredFps =
                state.performanceFrameCount
                * 1000
                / elapsed;

            state.performanceFrameCount = 0;
            state.performanceWindowStart =
                frameNow;
        }
    }

    function readAtmosphereMode() {
        try {
            const stored =
                localStorage.getItem(
                    ATMOSPHERE_STORAGE_KEY
                );

            if (
                stored === 'off'
                || stored === 'subtle'
                || stored === 'balanced'
                || stored === 'cinematic'
            ) {
                return stored;
            }
        } catch {
            // Storage unavailable; use default.
        }

        return 'balanced';
    }


    function getAtmospherePage() {
        if (!isLyricsPage()) return null;
        return getCurrentLyricPage();
    }

    function ensureAtmosphereRoot() {
        const page =
            getAtmospherePage();

        if (!page) {
            state.atmosphereRoot = null;
            return null;
        }

        if (
            state.atmosphereRoot
            && state.atmosphereRoot.isConnected
            && state.atmosphereRoot.parentNode === page
        ) {
            return state.atmosphereRoot;
        }

        const old =
            directChildByClass(
                page,
                'ak-atmosphere'
            );

        removeNodeCompat(old);

        const root =
            document.createElement('div');

        root.className = 'ak-atmosphere';
        root.setAttribute('aria-hidden', 'true');
        root.dataset.akMode =
            state.atmosphereMode;

        for (let i = 0; i < 2; i += 1) {
            const scene =
                document.createElement('div');

            scene.className =
                'ak-atmosphere-scene';

            scene.dataset.akScene =
                String(i);

            const art =
                document.createElement('div');

            art.className =
                'ak-atmosphere-art';

            const wash =
                document.createElement('div');

            wash.className =
                'ak-atmosphere-wash';

            scene.appendChild(art);
            scene.appendChild(wash);
            root.appendChild(scene);
        }

        const vignette =
            document.createElement('div');

        vignette.className =
            'ak-atmosphere-vignette';

        root.appendChild(vignette);

        page.insertBefore(
            root,
            page.firstChild
        );

        page.classList.add(
            'ak-atmosphere-host'
        );

        applyPerformanceClassToPage(
            page
        );


        state.atmosphereRoot = root;

        return root;
    }

    function setAtmosphereMode(mode) {
        const normalized =
            String(mode || '')
                .trim()
                .toLowerCase();

        if (
            normalized !== 'off'
            && normalized !== 'subtle'
            && normalized !== 'balanced'
            && normalized !== 'cinematic'
        ) {
            throw new Error(
                'Atmosphere mode must be: '
                + '"off", "subtle", "balanced", or "cinematic".'
            );
        }

        const previousMode =
            state.atmosphereMode;

        state.atmosphereMode =
            normalized;

        if (normalized === 'off') {
            invalidateAtmosphereLoads(
                'atmosphere-off'
            );
        } else if (previousMode === 'off') {
            state.atmosphereMediaKey = '';
            state.atmosphereLastCheck = 0;
        }

        try {
            localStorage.setItem(
                ATMOSPHERE_STORAGE_KEY,
                normalized
            );
        } catch {
            // Ignore storage failure.
        }

        const root =
            ensureAtmosphereRoot();

        if (root) {
            root.dataset.akMode =
                normalized;
        }

        /* Apply a mode change promptly even while playback is paused. */
        wakeAnimationLoop();

        return {
            mode: normalized,
            artwork: state.atmosphereArtwork,
            source: state.atmosphereSource
        };
    }

    function parseRgbString(value) {
        const parts =
            String(value || '')
                .split(',')
                .map(part => Number(part.trim()))
                .filter(Number.isFinite);

        if (parts.length < 3) {
            return [120, 120, 150];
        }

        return parts
            .slice(0, 3)
            .map(value =>
                Math.max(
                    0,
                    Math.min(
                        255,
                        Math.round(value)
                    )
                )
            );
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max =
            Math.max(r, g, b);

        const min =
            Math.min(r, g, b);

        const lightness =
            (max + min) / 2;

        if (max === min) {
            return {
                h: 0,
                s: 0,
                l: lightness
            };
        }

        const delta =
            max - min;

        const saturation =
            lightness > 0.5
                ? delta / (2 - max - min)
                : delta / (max + min);

        let hue;

        if (max === r) {
            hue =
                (g - b) / delta
                + (g < b ? 6 : 0);
        } else if (max === g) {
            hue =
                (b - r) / delta + 2;
        } else {
            hue =
                (r - g) / delta + 4;
        }

        hue *= 60;

        return {
            h: hue,
            s: saturation,
            l: lightness
        };
    }

    function normalizeAtmosphereColor(rgb) {
        let [r, g, b] = rgb;

        const max =
            Math.max(r, g, b);

        const min =
            Math.min(r, g, b);

        const brightness =
            0.2126 * r
            + 0.7152 * g
            + 0.0722 * b;

        if (brightness < 78) {
            const scale =
                Math.min(
                    2.05,
                    98 / Math.max(
                        brightness,
                        1
                    )
                );

            r *= scale;
            g *= scale;
            b *= scale;
        }

        if (max - min < 18) {
            /*
             * Near-gray covers still receive a faint cool separation so the
             * atmosphere is visible without fabricating a loud color.
             */
            b *= 1.08;
            r *= 0.98;
        }

        return [r, g, b].map(
            value =>
                Math.max(
                    0,
                    Math.min(
                        255,
                        Math.round(value)
                    )
                )
        );
    }

    function fallbackAtmosphereColors() {
        const accent =
            currentAccent();

        const primary =
            normalizeAtmosphereColor(
                parseRgbString(
                    accent.rgb
                )
            );

        const secondary =
            normalizeAtmosphereColor(
                parseRgbString(
                    accent.secondaryRgb
                    || accent.rgb
                )
            );

        return [
            primary,
            secondary
        ];
    }

    function extractAtmosphereColors(image) {
        try {
            const canvas =
                document.createElement('canvas');

            canvas.width =
                ATMOSPHERE_COLOR_SAMPLE_SIZE;

            canvas.height =
                ATMOSPHERE_COLOR_SAMPLE_SIZE;

            const context =
                canvas.getContext(
                    '2d',
                    {
                        willReadFrequently: true
                    }
                );

            if (!context) {
                return null;
            }

            context.drawImage(
                image,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const data =
                context.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                ).data;

            const bins =
                Array.from(
                    { length: 12 },
                    () => ({
                        weight: 0,
                        r: 0,
                        g: 0,
                        b: 0
                    })
                );

            let fallbackWeight = 0;
            let fallbackR = 0;
            let fallbackG = 0;
            let fallbackB = 0;

            for (
                let i = 0;
                i < data.length;
                i += 4
            ) {
                const alpha =
                    data[i + 3] / 255;

                if (alpha < 0.82) continue;

                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                const hsl =
                    rgbToHsl(r, g, b);

                /*
                 * Ignore near-black, near-white, and very weak gray pixels for
                 * dominant color selection. They still contribute to fallback.
                 */
                const luminance =
                    0.2126 * r
                    + 0.7152 * g
                    + 0.0722 * b;

                const fallbackPixelWeight =
                    0.18 + hsl.s * 0.82;

                fallbackWeight +=
                    fallbackPixelWeight;

                fallbackR +=
                    r * fallbackPixelWeight;

                fallbackG +=
                    g * fallbackPixelWeight;

                fallbackB +=
                    b * fallbackPixelWeight;

                if (
                    luminance < 28
                    || luminance > 238
                    || hsl.s < 0.12
                ) {
                    continue;
                }

                const hueIndex =
                    Math.floor(
                        (
                            (hsl.h % 360 + 360)
                            % 360
                        )
                        / 30
                    ) % 12;

                const lightnessPreference =
                    1
                    - Math.min(
                        0.72,
                        Math.abs(
                            hsl.l - 0.48
                        )
                    );

                const weight =
                    (
                        0.28
                        + hsl.s * 1.55
                    )
                    * lightnessPreference;

                const bin =
                    bins[hueIndex];

                bin.weight +=
                    weight;

                bin.r +=
                    r * weight;

                bin.g +=
                    g * weight;

                bin.b +=
                    b * weight;
            }

            const ranked =
                bins
                    .map((bin, index) => ({
                        ...bin,
                        index
                    }))
                    .filter(
                        bin =>
                            bin.weight > 0
                    )
                    .sort(
                        (a, b) =>
                            b.weight - a.weight
                    );

            const colorFromBin =
                bin =>
                    normalizeAtmosphereColor([
                        bin.r / bin.weight,
                        bin.g / bin.weight,
                        bin.b / bin.weight
                    ]);

            if (ranked.length) {
                const first =
                    ranked[0];

                let second =
                    ranked.find(bin => {
                        const distance =
                            Math.min(
                                Math.abs(
                                    bin.index
                                    - first.index
                                ),
                                12
                                - Math.abs(
                                    bin.index
                                    - first.index
                                )
                            );

                        return distance >= 2;
                    });

                if (!second) {
                    second =
                        ranked[1]
                        || first;
                }

                return [
                    colorFromBin(first),
                    colorFromBin(second)
                ];
            }

            if (fallbackWeight > 0) {
                const average =
                    normalizeAtmosphereColor([
                        fallbackR / fallbackWeight,
                        fallbackG / fallbackWeight,
                        fallbackB / fallbackWeight
                    ]);

                return [
                    average,
                    normalizeAtmosphereColor([
                        average[2] * 0.72
                            + average[0] * 0.28,
                        average[0] * 0.55
                            + average[1] * 0.45,
                        average[1] * 0.70
                            + average[2] * 0.30
                    ])
                ];
            }
        } catch {
            /*
             * Canvas can be blocked by cross-origin image rules.
             * Artwork can still be displayed; color falls back safely.
             */
        }

        return null;
    }

    function mediaItemArtworkCandidate(media) {
        try {
            const src =
                media.currentSrc
                || media.src;

            if (!src) return null;

            const mediaUrl =
                new URL(
                    src,
                    location.href
                );

            const match =
                mediaUrl.pathname.match(
                    /\/(?:Audio|Videos)\/([^/?]+)/i
                );

            if (!match) return null;

            const itemId =
                decodeURIComponent(
                    match[1]
                );

            const prefix =
                mediaUrl.pathname.slice(
                    0,
                    match.index
                );

            const imageUrl =
                new URL(
                    `${prefix}/Items/${encodeURIComponent(itemId)}/Images/Primary`,
                    mediaUrl.origin
                );

            imageUrl.searchParams.set(
                'maxWidth',
                String(
                    ATMOSPHERE_ART_MAX_WIDTH
                )
            );

            imageUrl.searchParams.set(
                'quality',
                '86'
            );

            for (const key of [
                'api_key',
                'apiKey',
                'access_token',
                'token'
            ]) {
                const value =
                    mediaUrl.searchParams.get(
                        key
                    );

                if (value) {
                    imageUrl.searchParams.set(
                        key,
                        value
                    );
                }
            }

            return imageUrl.href;
        } catch {
            return null;
        }
    }

    function getBackgroundImageUrl(element) {
        try {
            const value =
                getComputedStyle(
                    element
                ).backgroundImage;

            if (
                !value
                || value === 'none'
            ) {
                return null;
            }

            const match =
                value.match(
                    /url\(["']?(.*?)["']?\)/i
                );

            return match
                ? match[1]
                : null;
        } catch {
            return null;
        }
    }

    function domArtworkCandidates() {
        const candidates = [];
        const seen = new Set();

        const add =
            (url, score) => {
                if (
                    !url
                    || seen.has(url)
                ) {
                    return;
                }

                if (
                    !/\/Items\/|\/Images\//i.test(
                        url
                    )
                ) {
                    return;
                }

                seen.add(url);
                candidates.push({
                    url,
                    score
                });
            };

        const images =
            document.querySelectorAll(
                [
                    '.nowPlayingBar img',
                    '.nowPlayingPage img',
                    '.nowPlayingInfoContainer img',
                    '.detailImageContainer img',
                    'img[src*="/Items/"]',
                    'img[src*="/Images/"]'
                ].join(',')
            );

        images.forEach(image => {
            const rect =
                image.getBoundingClientRect();

            const area =
                Math.max(
                    1,
                    rect.width * rect.height
                );

            const classText =
                String(
                    image.className || ''
                ).toLowerCase();

            let score =
                Math.min(
                    500000,
                    area
                );

            if (
                classText.includes('nowplaying')
                || classText.includes('now-playing')
            ) {
                score += 1000000;
            }

            if (
                /\/Images\/Primary/i.test(
                    image.currentSrc
                    || image.src
                    || ''
                )
            ) {
                score += 300000;
            }

            add(
                image.currentSrc
                || image.src,
                score
            );
        });

        const backgroundNodes =
            document.querySelectorAll(
                [
                    '.nowPlayingBar [style]',
                    '.nowPlayingPage [style]',
                    '.nowPlayingInfoContainer [style]',
                    '.detailImageContainer [style]'
                ].join(',')
            );

        backgroundNodes.forEach(node => {
            const url =
                getBackgroundImageUrl(
                    node
                );

            const rect =
                node.getBoundingClientRect();

            add(
                url,
                500000
                    + Math.min(
                        500000,
                        Math.max(
                            1,
                            rect.width
                                * rect.height
                        )
                    )
            );
        });

        return candidates
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .map(
                candidate =>
                    candidate.url
            );
    }

    function atmosphereMediaKey(media) {
        const src =
            media
                ? (
                    media.currentSrc
                    || media.src
                    || ''
                )
                : '';

        let lyricKey = '';

        if (state.lyrics && state.lyrics.length) {
            const first =
                state.lyrics[0];

            const last =
                state.lyrics[
                    state.lyrics.length - 1
                ];

            lyricKey =
                `${lyricValue(first, 'Start', 'start') || 0}:`
                + `${lyricValue(first, 'Text', 'text') || ''}:`
                + `${lyricValue(last, 'Start', 'start') || 0}`;
        }

        return `${src}|${lyricKey}`;
    }

    function invalidateAtmosphereLoads(
        source = 'invalidate'
    ) {
        state.atmosphereLoadSeq += 1;
        state.atmospherePendingKey = '';
        state.atmospherePendingSince = 0;
        return source;
    }

    function preloadAtmosphereImage(url) {
        return new Promise(
            (resolve, reject) => {
                const image =
                    new Image();

                let settled = false;

                const finish = (
                    callback,
                    value
                ) => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timeoutId);
                    image.onload = null;
                    image.onerror = null;
                    callback(value);
                };

                const timeoutId =
                    window.setTimeout(() => {
                        state.atmosphereTimeoutCount += 1;
                        finish(
                            reject,
                            new Error(
                                'Artwork image load timed out.'
                            )
                        );
                    }, ATMOSPHERE_IMAGE_TIMEOUT_MS);

                image.decoding =
                    'async';

                image.onload =
                    () => finish(resolve, image);

                image.onerror =
                    () => finish(
                        reject,
                        new Error(
                            'Artwork image failed to load.'
                        )
                    );

                image.src = url;
            }
        );
    }

    function atmosphereRasterDimensions() {
        const profile =
            state.performanceProfile;

        const longEdge =
            ATMOSPHERE_RASTER_LONG_EDGE[
                profile
            ]
            || 220;

        const viewportWidth =
            Math.max(
                1,
                window.innerWidth
                || document.documentElement.clientWidth
                || 16
            );

        const viewportHeight =
            Math.max(
                1,
                window.innerHeight
                || document.documentElement.clientHeight
                || 9
            );

        const aspect =
            Math.max(
                0.58,
                Math.min(
                    2.40,
                    viewportWidth
                    / viewportHeight
                )
            );

        let width;
        let height;

        if (aspect >= 1) {
            width =
                longEdge;

            height =
                Math.max(
                    84,
                    Math.round(
                        longEdge
                        / aspect
                    )
                );
        } else {
            height =
                longEdge;

            width =
                Math.max(
                    84,
                    Math.round(
                        longEdge
                        * aspect
                    )
                );
        }

        return {
            width,
            height
        };
    }

    function drawImageCover(
        context,
        image,
        width,
        height
    ) {
        const sourceWidth =
            image.naturalWidth
            || image.width
            || width;

        const sourceHeight =
            image.naturalHeight
            || image.height
            || height;

        if (
            !sourceWidth
            || !sourceHeight
        ) {
            return false;
        }

        const sourceAspect =
            sourceWidth
            / sourceHeight;

        const targetAspect =
            width
            / height;

        let sx = 0;
        let sy = 0;
        let sw = sourceWidth;
        let sh = sourceHeight;

        if (sourceAspect > targetAspect) {
            sw =
                sourceHeight
                * targetAspect;

            sx =
                (sourceWidth - sw)
                / 2;
        } else if (
            sourceAspect < targetAspect
        ) {
            sh =
                sourceWidth
                / targetAspect;

            sy =
                (sourceHeight - sh)
                / 2;
        }

        context.drawImage(
            image,
            sx,
            sy,
            sw,
            sh,
            0,
            0,
            width,
            height
        );

        return true;
    }

    function makeFallbackSoftRaster(
        sourceCanvas,
        width,
        height
    ) {
        /*
         * Older browsers may not support CanvasRenderingContext2D
         * filters. Multi-stage downsample/upscale creates a smooth light field
         * ONCE per song without leaving a live CSS blur on the GPU.
         */
        const tiny =
            document.createElement(
                'canvas'
            );

        const tinyLong =
            state.performanceProfile === 'eco'
                ? 28
                : 38;

        if (width >= height) {
            tiny.width =
                tinyLong;

            tiny.height =
                Math.max(
                    12,
                    Math.round(
                        tinyLong
                        * height
                        / width
                    )
                );
        } else {
            tiny.height =
                tinyLong;

            tiny.width =
                Math.max(
                    12,
                    Math.round(
                        tinyLong
                        * width
                        / height
                    )
                );
        }

        const tinyContext =
            tiny.getContext('2d');

        if (!tinyContext) {
            return null;
        }

        tinyContext.imageSmoothingEnabled =
            true;

        tinyContext.drawImage(
            sourceCanvas,
            0,
            0,
            tiny.width,
            tiny.height
        );

        const middle =
            document.createElement(
                'canvas'
            );

        middle.width =
            Math.max(
                tiny.width * 3,
                Math.round(
                    width * 0.42
                )
            );

        middle.height =
            Math.max(
                tiny.height * 3,
                Math.round(
                    height * 0.42
                )
            );

        const middleContext =
            middle.getContext('2d');

        if (!middleContext) {
            return null;
        }

        middleContext.imageSmoothingEnabled =
            true;

        if (
            'imageSmoothingQuality'
            in middleContext
        ) {
            middleContext.imageSmoothingQuality =
                'high';
        }

        middleContext.drawImage(
            tiny,
            0,
            0,
            middle.width,
            middle.height
        );

        return middle;
    }

    function createAtmosphereRaster(image) {
        try {
            const dimensions =
                atmosphereRasterDimensions();

            const width =
                dimensions.width;

            const height =
                dimensions.height;

            const sourceCanvas =
                document.createElement(
                    'canvas'
                );

            sourceCanvas.width =
                width;

            sourceCanvas.height =
                height;

            const sourceContext =
                sourceCanvas.getContext(
                    '2d'
                );

            if (!sourceContext) {
                return null;
            }

            sourceContext.imageSmoothingEnabled =
                true;

            if (
                'imageSmoothingQuality'
                in sourceContext
            ) {
                sourceContext.imageSmoothingQuality =
                    'high';
            }

            if (
                !drawImageCover(
                    sourceContext,
                    image,
                    width,
                    height
                )
            ) {
                return null;
            }

            const canvas =
                document.createElement(
                    'canvas'
                );

            canvas.width =
                width;

            canvas.height =
                height;

            const context =
                canvas.getContext(
                    '2d'
                );

            if (!context) {
                return null;
            }

            context.imageSmoothingEnabled =
                true;

            if (
                'imageSmoothingQuality'
                in context
            ) {
                context.imageSmoothingQuality =
                    'high';
            }

            const blurPx =
                ATMOSPHERE_RASTER_BLUR_PX[
                    state.performanceProfile
                ]
                || 18;

            let method =
                'multistage-soften';

            /*
             * Browsers that implement canvas filters get a true
             * one-time prebaked blur. The draw is oversized so blur kernels do
             * not expose transparent/dark edges.
             */
            if ('filter' in context) {
                try {
                    context.save();

                    context.filter =
                        `blur(${blurPx}px) `
                        + 'saturate(1.24) '
                        + 'brightness(0.62)';

                    const overscan =
                        Math.ceil(
                            blurPx * 1.45
                        );

                    context.drawImage(
                        sourceCanvas,
                        -overscan,
                        -overscan,
                        width
                            + overscan * 2,
                        height
                            + overscan * 2
                    );

                    context.restore();

                    method =
                        'canvas-prebaked-blur';
                } catch {
                    context.clearRect(
                        0,
                        0,
                        width,
                        height
                    );
                }
            }

            if (
                method
                !== 'canvas-prebaked-blur'
            ) {
                context.clearRect(
                    0,
                    0,
                    width,
                    height
                );

                const softened =
                    makeFallbackSoftRaster(
                        sourceCanvas,
                        width,
                        height
                    );

                if (!softened) {
                    return null;
                }

                context.globalAlpha =
                    0.80;

                context.drawImage(
                    softened,
                    0,
                    0,
                    width,
                    height
                );

                context.globalAlpha =
                    1;
            }

            /*
             * Very light baked darkening prevents a bright cover from flashing
             * before the CSS vignette/crossfade fully settles.
             */
            context.fillStyle =
                'rgba(3, 3, 7, 0.12)';

            context.fillRect(
                0,
                0,
                width,
                height
            );

            const url =
                canvas.toDataURL(
                    'image/jpeg',
                    state.performanceProfile
                        === 'desktop'
                        ? 0.82
                        : 0.76
                );

            state.atmosphereRasterMethod =
                method;

            state.atmosphereRasterWidth =
                width;

            state.atmosphereRasterHeight =
                height;

            state.atmosphereRasterBlurPx =
                blurPx;

            return url;
        } catch {
            state.atmosphereRasterMethod =
                'failed';

            state.atmosphereRasterWidth =
                0;

            state.atmosphereRasterHeight =
                0;

            state.atmosphereRasterBlurPx =
                0;

            return null;
        }
    }

    function cssRgb(rgb) {
        return rgb
            .map(
                value =>
                    Math.round(value)
            )
            .join(', ');
    }

    function mixAtmosphereRgb(
        first,
        second,
        amount
    ) {
        return first.map(
            (value, index) =>
                Math.round(
                    value
                    + (
                        second[index]
                        - value
                    )
                    * amount
                )
        );
    }

    function atmosphereWashBackground(colors) {
        const first =
            colors[0];

        const second =
            colors[1];

        const middle =
            normalizeAtmosphereColor(
                mixAtmosphereRgb(
                    first,
                    second,
                    0.52
                )
            );

        const primary =
            cssRgb(first);

        const secondary =
            cssRgb(second);

        const tertiary =
            cssRgb(middle);

        /*
         * Large overlapping fields, not small "website gradient blobs".
         * The cover texture supplies structure; these fields only reinforce
         * its palette and depth.
         */
        return [
            `radial-gradient(ellipse 78% 72% at 16% 24%, rgba(${primary}, 0.44) 0%, rgba(${primary}, 0.18) 38%, transparent 76%)`,
            `radial-gradient(ellipse 82% 76% at 86% 74%, rgba(${secondary}, 0.40) 0%, rgba(${secondary}, 0.15) 40%, transparent 78%)`,
            `radial-gradient(ellipse 58% 44% at 54% 6%, rgba(${tertiary}, 0.19) 0%, transparent 74%)`,
            `linear-gradient(154deg, rgba(${primary}, 0.08) 0%, transparent 42%, rgba(${secondary}, 0.07) 100%)`
        ].join(', ');
    }

    function activateAtmosphereScene(
        artworkUrl,
        colors,
        source,
        originalArtworkUrl = artworkUrl
    ) {
        const root =
            ensureAtmosphereRoot();

        if (!root) return;

        root.dataset.akMode =
            state.atmosphereMode;

        const nextIndex =
            state.atmosphereSceneIndex === 0
                ? 1
                : 0;

        const nextScene =
            root.querySelector(
                `[data-ak-scene="${nextIndex}"]`
            );

        const oldScene =
            root.querySelector(
                `[data-ak-scene="${state.atmosphereSceneIndex}"]`
            );

        if (!nextScene) return;

        const art =
            nextScene.querySelector(
                '.ak-atmosphere-art'
            );

        const wash =
            nextScene.querySelector(
                '.ak-atmosphere-wash'
            );

        if (art) {
            art.style.backgroundImage =
                artworkUrl
                    ? `url(${JSON.stringify(artworkUrl)})`
                    : 'none';
        }

        if (wash) {
            wash.style.backgroundImage =
                atmosphereWashBackground(
                    colors
                );
        }

        /*
         * Let the browser commit the new image/gradient before starting the
         * crossfade. This avoids the "new song background pops in" problem.
         */
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (
                    !isLyricsPage()
                    || !root.isConnected
                    || state.atmosphereRoot !== root
                ) {
                    return;
                }

                nextScene.classList.add(
                    'ak-atmosphere-active'
                );

                if (oldScene) {
                    oldScene.classList.remove(
                        'ak-atmosphere-active'
                    );

                    window.setTimeout(() => {
                        if (
                            oldScene
                            && !oldScene.classList.contains(
                                'ak-atmosphere-active'
                            )
                        ) {
                            const oldArt =
                                oldScene.querySelector(
                                    '.ak-atmosphere-art'
                                );

                            const oldWash =
                                oldScene.querySelector(
                                    '.ak-atmosphere-wash'
                                );

                            if (oldArt) {
                                oldArt.style.backgroundImage =
                                    'none';
                            }

                            if (oldWash) {
                                oldWash.style.backgroundImage =
                                    'none';
                            }
                        }
                    }, ATMOSPHERE_CROSSFADE_MS + 250);
                }
            });
        });

        state.atmosphereSceneIndex =
            nextIndex;

        state.atmosphereArtwork =
            originalArtworkUrl || '';

        state.atmosphereSource =
            source || 'unknown';

        state.atmosphereColors =
            colors;

        root.classList.add(
            'ak-atmosphere-ready'
        );
    }

    async function refreshAtmosphere(
        media,
        force = false
    ) {
        if (
            state.atmosphereMode === 'off'
        ) {
            const root =
                ensureAtmosphereRoot();

            if (root) {
                root.dataset.akMode = 'off';
            }

            return;
        }

        if (
            !media
            || !isLyricsPage()
        ) {
            return;
        }

        const key =
            atmosphereMediaKey(media);

        if (
            !force
            && key
            && key === state.atmosphereMediaKey
            && state.atmosphereArtwork
        ) {
            return;
        }

        if (
            !force
            && key
            && key === state.atmospherePendingKey
        ) {
            return;
        }

        /*
         * Do not hammer a missing art endpoint every animation frame.
         */
        if (
            !force
            && key === state.atmosphereFailedKey
            && performance.now()
                - state.atmosphereFailedAt
                < 8000
        ) {
            return;
        }

        state.atmosphereMediaKey =
            key;
        state.atmospherePendingKey =
            key;
        state.atmospherePendingSince =
            performance.now();

        const sequence =
            ++state.atmosphereLoadSeq;

        const finishPending = () => {
            if (
                sequence === state.atmosphereLoadSeq
                && state.atmospherePendingKey === key
            ) {
                state.atmospherePendingKey = '';
                state.atmospherePendingSince = 0;
            }
        };

        try {
            const candidates = [];

            const direct =
                mediaItemArtworkCandidate(
                    media
                );

            if (direct) {
                candidates.push({
                    url: direct,
                    source: 'media-item-primary'
                });
            }

            for (
                const url
                of domArtworkCandidates()
            ) {
                if (
                    !candidates.some(
                        candidate =>
                            candidate.url === url
                    )
                ) {
                    candidates.push({
                        url,
                        source: 'jellyfin-dom-artwork'
                    });
                }
            }

            for (const candidate of candidates) {
                try {
                    const image =
                        await preloadAtmosphereImage(
                            candidate.url
                        );

                    if (
                        sequence
                        !== state.atmosphereLoadSeq
                        || !isLyricsPage()
                        || key !== atmosphereMediaKey(media)
                    ) {
                        return;
                    }

                    const extracted =
                        extractAtmosphereColors(
                            image
                        );

                    const colors =
                        extracted
                        || fallbackAtmosphereColors();

                    const raster =
                        createAtmosphereRaster(
                            image
                        );

                    activateAtmosphereScene(
                        raster || null,
                        colors,
                        (
                            extracted
                                ? `${candidate.source}+canvas-colors`
                                : `${candidate.source}+accent-colors`
                        )
                        + (
                            raster
                                ? `+${state.atmosphereRasterMethod}`
                                : '+premium-color-field'
                        ),
                        candidate.url
                    );

                    state.atmosphereFailedKey = '';
                    return;
                } catch {
                    // Try the next candidate.
                }
            }

            if (
                sequence
                !== state.atmosphereLoadSeq
                || !isLyricsPage()
                || key !== atmosphereMediaKey(media)
            ) {
                return;
            }

            /*
             * Even without readable artwork, retain a tasteful colored atmosphere
             * based on the song's existing stable accent. Lyrics never depend on it.
             */
            activateAtmosphereScene(
                null,
                fallbackAtmosphereColors(),
                'accent-fallback'
            );

            state.atmosphereFailedKey =
                key;

            state.atmosphereFailedAt =
                performance.now();
        } finally {
            finishPending();
        }
    }

    function maybeRefreshAtmosphere(
        media,
        frameNow
    ) {
        const interval =
            (
                state.performanceProfile === 'mobile'
                || state.performanceProfile === 'eco'
            )
                ? 2000
                : ATMOSPHERE_CHECK_INTERVAL_MS;

        if (
            frameNow
            - state.atmosphereLastCheck
            < interval
        ) {
            return;
        }

        state.atmosphereLastCheck =
            frameNow;

        const root =
            ensureAtmosphereRoot();

        if (root) {
            root.dataset.akMode =
                state.atmosphereMode;

        }

        refreshAtmosphere(
            media,
            false
        ).catch(error => {
            warn(
                'Atmosphere refresh failed:',
                error
            );
        });
    }

    function mediaElementScore(element) {
        if (!element || !element.isConnected) {
            return -Infinity;
        }

        let score = 0;
        const classList = element.classList;

        if (
            classList
            && (
                classList.contains('mediaPlayerAudio')
                || classList.contains('mediaPlayerVideo')
            )
        ) {
            score += 40;
        }

        if (element.currentSrc || element.src) {
            score += 22;
        }

        if (!element.paused && !element.ended) {
            score += 18;
        }

        if (Number(element.readyState) >= 2) {
            score += 8;
        }

        if ((Number(element.currentTime) || 0) > 0) {
            score += 2;
        }

        if (element === state.mediaElement) {
            score += 1;
        }

        return score;
    }

    function getLocalMediaElement(
        forceProbe = false
    ) {
        const cached =
            state.mediaElement;

        const now =
            performance.now();

        if (
            !forceProbe
            && cached
            && cached.isConnected
            && now < state.mediaProbeAt
        ) {
            return cached;
        }

        state.mediaProbeAt =
            now + 1000;

        const candidates = [];
        const addCandidate = element => {
            if (
                element
                && !candidates.includes(element)
            ) {
                candidates.push(element);
            }
        };

        addCandidate(
            document.querySelector(
                '.mediaPlayerAudio'
            )
        );
        addCandidate(
            document.querySelector(
                '.mediaPlayerVideo'
            )
        );

        Array.from(
            document.querySelectorAll(
                'audio,video'
            )
        ).forEach(addCandidate);

        if (cached && cached.isConnected) {
            addCandidate(cached);
        }

        let media = null;
        let bestScore = -Infinity;

        candidates.forEach(candidate => {
            const score =
                mediaElementScore(candidate);

            if (score > bestScore) {
                bestScore = score;
                media = candidate;
            }
        });

        if (media !== cached) {
            state.mediaElement = media;
            state.mediaProbeAt = now + 1000;
            state.mediaStartOffsetSource = '';
            state.mediaStartOffsetTicks = 0;
            state.mediaSwitchCount += 1;
            resetPlaybackClock(
                media,
                now
            );
        }

        if (media) {
            ensureMediaWakeHooks(media);
        }

        return media;
    }

    function getStartTimeTicksFromUrl(media) {
        try {
            const src = media.currentSrc || media.src;
            if (!src) return 0;

            if (
                src === state.mediaStartOffsetSource
            ) {
                return state.mediaStartOffsetTicks;
            }

            const url = new URL(src, location.href);
            const value = url.searchParams.get('StartTimeTicks')
                || url.searchParams.get('startTimeTicks');
            const parsed = Number(value);

            state.mediaStartOffsetSource = src;
            state.mediaStartOffsetTicks =
                Number.isFinite(parsed)
                    ? parsed
                    : 0;

            return state.mediaStartOffsetTicks;
        } catch {
            return 0;
        }
    }

    function findLineIndexAtTicks(ticks) {
        if (!state.lineData || !state.lineData.length) return -1;

        let low = 0;
        let high = state.lineData.length - 1;
        let result = -1;

        while (low <= high) {
            const mid = (low + high) >> 1;
            const start = Number(state.lineData[mid].startTicks);

            if (Number.isFinite(start) && start <= ticks) {
                result = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        return result;
    }

    function sameIndexList(left, right) {
        if (left === right) return true;
        if (!left || !right || left.length !== right.length) return false;

        for (let index = 0; index < left.length; index += 1) {
            if (left[index] !== right[index]) return false;
        }

        return true;
    }

    function findActiveLineIndexesAtTicks(
        ticks,
        presentationLine
    ) {
        const active =
            state.activeLineScratch
            || (state.activeLineScratch = []);
        active.length = 0;

        if (
            presentationLine < 0
            || !state.lineData.length
        ) {
            return active;
        }

        const upper = Math.min(
            presentationLine,
            state.lineData.length - 1
        );

        for (
            let index = upper;
            index >= 0;
            index -= 1
        ) {
            if (
                index < upper
                && state.lineEndPrefix[index]
                    <= ticks
            ) {
                break;
            }

            const line = state.lineData[index];
            const start = Number(line.startTicks);
            const end = Number(line.endTicks);

            if (
                Number.isFinite(start)
                && Number.isFinite(end)
                && start <= ticks
                && ticks < end
            ) {
                active.push(index);
            }
        }

        active.reverse();

        if (
            !active.includes(presentationLine)
            && presentationLine >= 0
            && presentationLine < state.lineData.length
        ) {
            /* The presentation line is the upper bound, so after reversing the
             * descending scan it belongs at the end of this ascending list. */
            active.push(presentationLine);
        }

        return active;
    }

    function activeLineWordTicks(
        lineIndex,
        presentationLine,
        presentationWordTicks,
        timelineTicks
    ) {
        void lineIndex;
        void presentationLine;
        void presentationWordTicks;
        return timelineTicks;
    }

    function resetPlaybackClock(
        media = null,
        frameNow = performance.now()
    ) {
        const raw =
            media
                ? Math.max(
                    0,
                    Number(media.currentTime) || 0
                )
                : 0;

        state.playbackClockMedia = media;
        state.playbackClockSeconds = raw;
        state.playbackClockRawSeconds = raw;
        state.playbackClockFrameNow = frameNow;
        state.playbackClockCorrectionMs = 0;

    }

    function projectedMediaSeconds(
        media,
        frameNow
    ) {
        const raw =
            Math.max(
                0,
                Number(media.currentTime) || 0
            );

        const rateValue =
            Number(media.playbackRate);

        const playbackRate =
            Number.isFinite(rateValue)
            && rateValue > 0
                ? rateValue
                : 1;

        const mustAnchor =
            state.playbackClockMedia !== media
            || !Number.isFinite(
                state.playbackClockSeconds
            )
            || !Number.isFinite(
                state.playbackClockFrameNow
            )
            || frameNow
                < state.playbackClockFrameNow
            || media.paused
            || media.seeking
            || media.ended
            || state.playbackClockSuspended
            || media.readyState < 2;

        if (mustAnchor) {
            resetPlaybackClock(
                media,
                frameNow
            );

            return raw;
        }

        const elapsed =
            Math.max(
                0,
                Math.min(
                    0.25,
                    (
                        frameNow
                        - state.playbackClockFrameNow
                    )
                    / 1000
                )
            );

        let projected =
            state.playbackClockSeconds
            + elapsed * playbackRate;

        let allowRegression = false;

        const rawDelta =
            raw
            - state.playbackClockRawSeconds;

        if (Math.abs(rawDelta) > 0.0005) {
            const error =
                raw
                - projected;

            if (
                rawDelta < -0.05
                || error
                    >= CLOCK_HARD_SNAP_SECONDS
            ) {
                projected = raw;
                allowRegression =
                    rawDelta < -0.05;
                state.playbackClockHardSnaps += 1;
                state.playbackClockCorrectionMs = 0;

            } else {
                const correction =
                    Math.max(
                        -CLOCK_MAX_CORRECTION_SECONDS,
                        Math.min(
                            CLOCK_MAX_CORRECTION_SECONDS,
                            error
                            * CLOCK_CORRECTION_GAIN
                        )
                    );

                projected += correction;
                state.playbackClockCorrectionMs =
                    correction * 1000;
            }

            state.playbackClockRawSeconds = raw;
        } else {
            state.playbackClockCorrectionMs *= 0.88;
        }

        projected =
            Math.max(
                raw - CLOCK_MAX_DRIFT_SECONDS,
                Math.min(
                    raw + CLOCK_MAX_DRIFT_SECONDS,
                    projected
                )
            );

        if (!allowRegression) {
            projected =
                Math.max(
                    state.playbackClockSeconds,
                    projected
                );
        }

        state.playbackClockSeconds =
            Math.max(0, projected);

        state.playbackClockFrameNow =
            frameNow;

        return state.playbackClockSeconds;
    }

    function applyUserTimingOffsetTicks(ticks) {
        const mediaSeconds =
            finiteNumber(ticks, 0) / TICKS_PER_SECOND;
        const sourceSeconds =
            mediaSeconds
            - clampTimingOffsetSeconds(state.timingOffsetSeconds);
        return sourceSeconds * TICKS_PER_SECOND;
    }

    function removeUserTimingOffsetTicks(ticks) {
        const sourceSeconds =
            finiteNumber(ticks, 0) / TICKS_PER_SECOND;
        const mediaSeconds =
            sourceSeconds
            + clampTimingOffsetSeconds(state.timingOffsetSeconds);
        return mediaSeconds * TICKS_PER_SECOND;
    }

    function chooseTimelineTicks(
        media,
        frameNow
    ) {
        const rawTicks =
            projectedMediaSeconds(
                media,
                frameNow
            )
            * TICKS_PER_SECOND;
        const startOffset = getStartTimeTicksFromUrl(media);
        let timelineTicks = rawTicks;

        if (startOffset) {
            /*
             * When transcoding starts at a non-zero point, Jellyfin may keep
             * the original timeline offset outside the HTML media element.
             * Choose the source timeline first; the user's display offset is
             * applied only afterwards so it cannot confuse this detection.
             */
            const jellyIndex = getJellyfinActiveLineIndex();

            if (jellyIndex >= 0) {
                const rawIndex = findLineIndexAtTicks(rawTicks);
                const offsetIndex = findLineIndexAtTicks(rawTicks + startOffset);

                if (offsetIndex === jellyIndex && rawIndex !== jellyIndex) {
                    timelineTicks = rawTicks + startOffset;
                } else if (rawIndex === jellyIndex) {
                    timelineTicks = rawTicks;
                } else {
                    timelineTicks = rawTicks + startOffset;
                }
            } else {
                timelineTicks = rawTicks + startOffset;
            }
        }

        return applyUserTimingOffsetTicks(timelineTicks);
    }

    function cueEndTicks(lineIndex, cueIndex, cue, cues) {
        const explicitEnd = Number(cueValue(cue, 'End', 'end'));
        if (Number.isFinite(explicitEnd) && explicitEnd > 0) return explicitEnd;

        const nextEntry =
            cues[cueIndex + 1];

        const nextCue =
            nextEntry
            && (
                nextEntry.cue
                || nextEntry
            );
        const nextStart = Number(cueValue(nextCue, 'Start', 'start'));
        if (Number.isFinite(nextStart)) return nextStart;

        const currentLyric =
            state.lyrics
            && state.lyrics[lineIndex];

        const explicitLineEnd = Number(
            lyricValue(
                currentLyric,
                'End',
                'end'
            )
        );

        if (
            Number.isFinite(explicitLineEnd)
            && explicitLineEnd > 0
        ) {
            return explicitLineEnd;
        }

        const nextLine = state.lyrics && state.lyrics[lineIndex + 1];
        const nextLineStart = Number(lyricValue(nextLine, 'Start', 'start'));
        if (Number.isFinite(nextLineStart)) return nextLineStart;

        const start = Number(cueValue(cue, 'Start', 'start')) || 0;
        return start + 7500000;
    }


    function smoothWordProgress(word, target, frameNow) {
        target = Math.max(0, Math.min(1, target));

        if (!Number.isFinite(word.visualProgress)) {
            word.visualProgress = target;
        }

        if (!Number.isFinite(word.lastPaintAt)) {
            word.lastPaintAt = frameNow;
        }

        let dt = frameNow - word.lastPaintAt;
        word.lastPaintAt = frameNow;

        if (!Number.isFinite(dt) || dt < 0) dt = 0;
        dt = Math.min(dt, 64);

        const difference = target - word.visualProgress;

        // Seeking/song jumps snap. Normal playback receives a tiny low-pass.
        if (Math.abs(difference) >= WORD_PROGRESS_SNAP_DELTA) {
            word.visualProgress = target;
        } else {
            const alpha = 1 - Math.exp(
                -dt / WORD_PROGRESS_SMOOTH_TAU_MS
            );
            word.visualProgress += difference * alpha;
        }

        if (target === 0 && word.visualProgress < 0.0008) {
            word.visualProgress = 0;
        }

        if (target === 1 && word.visualProgress > 0.9992) {
            word.visualProgress = 1;
        }

        return word.visualProgress;
    }

    function wordTargetProgress(word, timelineTicks) {
        if (!word.segments.length || !Number.isFinite(word.start)) {
            return 0;
        }

        if (timelineTicks >= word.end) return 1;

        if (timelineTicks <= word.start) {
            return 0;
        }

        let completed =
            0;

        for (const segment of word.segments) {
            const visualStart =
                Number.isFinite(segment.visualStart)
                    ? segment.visualStart
                    : segment.startPos / word.length;

            const visualEnd =
                Number.isFinite(segment.visualEnd)
                    ? segment.visualEnd
                    : segment.endPos / word.length;

            if (timelineTicks < segment.start) {
                return completed;
            }

            if (
                timelineTicks <= segment.end
                && segment.end > segment.start
            ) {
                const local =
                    clamp01(
                        (
                            timelineTicks - segment.start
                        )
                        / (
                            segment.end - segment.start
                        )
                    );

                return Math.max(
                    completed,
                    visualStart
                        + local * (visualEnd - visualStart)
                );
            }

            completed =
                Math.max(
                    completed,
                    visualEnd
                );
        }

        return completed;
    }

    function growPhase(t) {
        if (t <= 0) {
            return {
                peak: 0,
                scaleMix: 0,
                xMix: 0,
                yPeakMix: 0,
                settleMix: 0
            };
        }

        if (t < 0.25) {
            const e = easeMotion(t / 0.25);

            return {
                peak: e,
                scaleMix: e,
                xMix: e,
                yPeakMix: e,
                settleMix: 0
            };
        }

        if (t <= 0.30) {
            return {
                peak: 1,
                scaleMix: 1,
                xMix: 1,
                yPeakMix: 1,
                settleMix: 0
            };
        }

        if (t < 0.75) {
            const e =
                easeMotion((t - 0.30) / 0.45);

            return {
                peak: 1 - e,
                scaleMix: 1 - e,
                xMix: 1 - e,
                yPeakMix: 1 - e,
                settleMix: e
            };
        }

        return {
            peak: 0,
            scaleMix: 0,
            xMix: 0,
            yPeakMix: 0,
            settleMix: 1
        };
    }

    function smoothstepBetween(
        start,
        end,
        value
    ) {
        const x =
            clamp01(
                (value - start)
                / Math.max(
                    0.0001,
                    end - start
                )
            );

        return x * x * (3 - 2 * x);
    }

    /*
     * Classic Bloom v3.1
     *
     * This deliberately returns to the earlier letter-bound core + halo look.
     * The core rises quickly and stays crisp; the halo follows with a soft,
     * longer release. Everything is analytic in media time and opacity-only.
     */
    function glowPulse(
        t,
        attackStart,
        peak,
        releaseStart,
        releaseEnd
    ) {
        return smoothstepBetween(
            attackStart,
            peak,
            t
        )
        * (
            1
            - smoothstepBetween(
                releaseStart,
                releaseEnd,
                t
            )
        );
    }

    function glowBucketSteps() {
        if (
            state.performanceProfile === 'eco'
        ) {
            return 48;
        }

        return 64;
    }

    function classicGlowEnergies(
        metrics,
        t,
        continuityGain,
        word
    ) {
        const accent = currentAccent();
        const durationMs = Math.max(
            1,
            Number(word && word.motionDurationMs) || 1
        );
        const sustain = smoothstepBetween(
            700,
            2200,
            durationMs
        );
        const rawEnergy = Math.max(
            0,
            metrics.shadowIntensity
            * accent.gain
            * (0.94 + 0.06 * sustain)
            * clamp01(continuityGain)
        );

        /* Soft knee keeps the highlight luminous without an OLED-white shelf. */
        const energy = 1 - Math.exp(-1.50 * rawEnergy);
        const spark = glowPulse(t, 0, 0.10, 0.28, 0.56);
        const bloom = glowPulse(t, 0.025, 0.19, 0.44, 0.80);
        const afterglow = glowPulse(t, 0.11, 0.32, 0.60, 0.98);

        let core = energy * (0.88 * spark + 0.12 * bloom);
        let halo = energy
            * (0.74 * bloom + 0.26 * afterglow)
            * (0.82 + 0.10 * sustain);

        if (
            state.performanceProfile === 'eco'
        ) {
            halo *= 0.92;
        }

        const load = core + 0.62 * halo;
        const limiter = Math.min(
            1,
            1.08 / Math.max(0.0001, load)
        );

        return {
            core: Math.min(0.90, core * limiter),
            halo: Math.min(0.76, halo * limiter)
        };
    }

    function setGlowLayers(
        owner,
        layers,
        core,
        halo
    ) {
        const steps = glowBucketSteps();
        const coreBucket =
            Math.round(clamp01(core) * steps) / steps;
        const haloBucket =
            Math.round(clamp01(halo) * steps) / steps;

        if (owner._akGlowCoreBucket !== coreBucket) {
            owner._akGlowCoreBucket = coreBucket;
            if (layers && layers[0]) {
                layers[0].style.opacity = coreBucket.toFixed(3);
            }
        }

        if (owner._akGlowHaloBucket !== haloBucket) {
            owner._akGlowHaloBucket = haloBucket;
            if (layers && layers[1]) {
                layers[1].style.opacity = haloBucket.toFixed(3);
            }
        }
    }

    function motionContinuityGain(word, timelineTicks) {
        if (
            !word
            || word.motionMode !== 'grow'
            || !Number.isFinite(word.end)
        ) {
            return 1;
        }

        if (timelineTicks <= word.end) {
            return 1;
        }

        const after =
            timelineTicks - word.end;

        if (after >= MOTION_HANDOFF_TICKS) {
            return 0;
        }

        return 1 - easeMotion(
            after / MOTION_HANDOFF_TICKS
        );
    }

    function motionHandoffActive(word, timelineTicks) {
        return !!(
            word
            && word.motionMode === 'grow'
            && Number.isFinite(word.end)
            && Number.isFinite(word.start)
            && timelineTicks >= word.start
            && timelineTicks < word.end + MOTION_HANDOFF_TICKS
        );
    }

    function updateMotionGlyphs(word, timelineTicks, continuityGain = 1) {
        if (!word.motionGlyphs || !word.motionGlyphs.length) return;

        const durationTicks =
            Math.max(
                1,
                word.end - word.start
            );

        const animationTicks =
            durationTicks * 1.5;

        const delayPerGlyph =
            durationTicks * 0.09;

        word.motionGlyphs.forEach((glyph, index) => {
            const metrics =
                glyph._akMotion;

            if (!metrics) return;

            const t =
                (
                    timelineTicks
                    - word.start
                    - delayPerGlyph * index
                )
                / animationTicks;

            const phase =
                growPhase(t);

            const glow =
                classicGlowEnergies(
                    metrics,
                    t,
                    continuityGain,
                    word
                );

            const scale =
                1
                + (
                    metrics.maxScale - 1
                )
                * phase.scaleMix
                * continuityGain;

            const xEm =
                metrics.offsetXEm
                * phase.xMix
                * continuityGain;

            const yEm =
                (
                    metrics.peakYEm
                        * phase.yPeakMix
                    + MOTION_FINAL_RISE_EM
                        * phase.settleMix
                )
                * continuityGain;

            glyph.style.transform =
                `translate3d(${xEm.toFixed(4)}em, ${yEm.toFixed(4)}em, 0) `
                + `scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, 1)`;

            setGlowLayers(
                glyph,
                glyph.glowLayers,
                glow.core,
                glow.halo
            );

            word._akMotionIsReset = false;
        });

    }

    function updateWholeMotion(word, timelineTicks, continuityGain = 1) {
        if (!word.wholeMotion || !word.element) return;

        const durationTicks =
            Math.max(
                1,
                word.end - word.start
            );

        const animationTicks =
            durationTicks * 1.5;

        const t =
            (
                timelineTicks
                - word.start
            )
            / animationTicks;

        const phase =
            growPhase(t);

        const metrics =
            word.wholeMotion;

        const glow =
            classicGlowEnergies(
                metrics,
                t,
                continuityGain,
                word
            );

        const scale =
            1
            + (
                metrics.maxScale - 1
            )
            * phase.scaleMix
            * 0.78
            * continuityGain;

        const yEm =
            (
                metrics.peakYEm
                    * phase.yPeakMix * 0.82
                + MOTION_FINAL_RISE_EM
                    * phase.settleMix
            )
            * continuityGain;

        word.element.style.transform =
            `translate3d(0, ${yEm.toFixed(4)}em, 0) `
            + `scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, 1)`;

        if (!word._akWholeFilterCleared) {
            word.element.style.filter = 'none';
            word._akWholeFilterCleared = true;
        }

        setGlowLayers(
            word,
            word.glowLayers,
            glow.core,
            glow.halo
        );

        word._akMotionIsReset = false;
    }

    function updateSimpleLift(word, timelineTicks) {
        if (!word.element || word.motionMode === 'none') return;

        const durationTicks =
            Math.max(1, word.end - word.start);

        const progress =
            clamp01(
                (
                    timelineTicks - word.start
                )
                / durationTicks
            );

        let lift = 0;

        if (word.motionMode === 'rise') {
            lift =
                MOTION_FINAL_RISE_EM
                * easeMotion(
                    Math.min(1, progress / 0.65)
                );
        } else if (word.motionMode === 'drag') {
            lift =
                MOTION_FINAL_RISE_EM
                * easeMotion(progress);
        }

        word.element.style.transform =
            `translate3d(0, ${lift.toFixed(4)}em, 0)`;

        word._akMotionIsReset = false;
    }

    function resetWordMotion(word) {
        if (
            !word
            || !word.element
            || word._akMotionIsReset
        ) {
            return;
        }

        word.element.style.transform = '';
        word.element.style.filter = '';
        word.element.style.setProperty(
            '--ak-motion-glow',
            '0'
        );

        (word.glowLayers || [])
            .forEach(layer => {
                layer.style.opacity = '0';
            });

        word._akGlowCoreBucket = 0;
        word._akGlowHaloBucket = 0;
        word._akWholeFilterCleared = false;

        (word.motionGlyphs || []).forEach(glyph => {
            glyph.style.transform = '';

            (glyph.glowLayers || [])
                .forEach(layer => {
                    layer.style.opacity = '0';
                });

            glyph._akGlowCoreBucket = 0;
            glyph._akGlowHaloBucket = 0;
        });

        word._akMotionIsReset = true;
    }

    function quantizedProgressPercent(
        word,
        painted
    ) {
        if (
            state.performanceProfile === 'eco'
        ) {
            /*
             * Eco mode updates at visible-pixel granularity to avoid repainting
             * a text gradient for sub-pixel changes that cannot be perceived.
             */
            const width =
                Math.max(
                    72,
                    Math.min(
                        900,
                        Number(word.renderWidth)
                        || 180
                    )
                );

            const percent =
                Math.round(
                    painted * width
                )
                / width
                * 100;

            return Math.round(
                percent * 100
            ) / 100;
        }

        return Math.round(
            painted * 1000
        ) / 10;
    }

    function updateWordVisual(word, timelineTicks, frameNow) {
        if (!word.element || !word.segments.length) return;

        const renderTicks =
            timelineTicks
            + (
                state.performanceProfile === 'eco'
                    ? 0
                    : WORD_RENDER_LOOKAHEAD_TICKS
            );

        const motionEnd =
            word.motionMode === 'grow'
                ? word.end
                    + MOTION_HANDOFF_TICKS
                : word.end;

        if (renderTicks <= word.start) {
            setStaticWordState(
                word,
                'future',
                frameNow,
                false
            );
            return;
        }

        if (timelineTicks >= motionEnd) {
            setStaticWordState(
                word,
                'past',
                frameNow,
                false
            );
            return;
        }

        word._akStaticState = 'active';

        const rawTarget =
            wordTargetProgress(
                word,
                renderTicks
            );

        const painted =
            smoothWordProgress(
                word,
                rawTarget,
                frameNow
            );

        const progressBucket =
            quantizedProgressPercent(
                word,
                painted
            );

        if (
            word._akProgressBucket
            !== progressBucket
        ) {
            word._akProgressBucket =
                progressBucket;

            word.element.style.setProperty(
                '--ak-word-progress',
                `${progressBucket.toFixed(
                    state.performanceProfile === 'eco'
                        ? 2
                        : 1
                )}%`
            );
        }

        /*
         * At exactly 0% a feathered gradient would make the first few pixels
         * of EVERY upcoming word look pre-lit. Keep an unsung word solid gray
         * until real timing movement begins.
         */
        word.element.classList.toggle(
            'ak-word-zero',
            painted <= ZERO_PROGRESS_EPSILON
        );

        const active =
            timelineTicks >= word.start
            && timelineTicks < word.end;

        const done =
            timelineTicks >= word.end;

        word.element.classList.toggle(
            'ak-word-active',
            active
        );

        word.element.classList.toggle(
            'ak-word-done',
            done
        );

        word.element.classList.toggle(
            'ak-word-painted',
            done && painted >= 0.995
        );

        word.element.classList.remove('ak-word-next');

        if (word.motionMode === 'grow') {
            const continuityGain =
                motionContinuityGain(
                    word,
                    timelineTicks
                );

            if (word.motionGlyphs && word.motionGlyphs.length) {
                updateMotionGlyphs(
                    word,
                    timelineTicks,
                    continuityGain
                );
            } else {
                updateWholeMotion(
                    word,
                    timelineTicks,
                    continuityGain
                );
            }
        } else if (
            word.motionMode === 'rise'
            || word.motionMode === 'drag'
        ) {
            updateSimpleLift(word, timelineTicks);
        }
    }

    function setStaticWordState(
        word,
        stateName,
        frameNow,
        preserveMotion = false
    ) {
        if (
            !word.element
            || !word.segments.length
        ) {
            return;
        }

        if (
            word._akStaticState
            === stateName
        ) {
            if (!preserveMotion) {
                resetWordMotion(word);
            }
            return;
        }

        word._akStaticState =
            stateName;

        if (stateName === 'past') {
            word.visualProgress = 1;
            word.lastPaintAt = frameNow;
            word._akProgressBucket = 100;

            word.element.style.setProperty(
                '--ak-word-progress',
                '100%'
            );

            word.element.classList.remove(
                'ak-word-zero',
                'ak-word-active',
                'ak-word-next'
            );

            word.element.classList.add(
                'ak-word-done',
                'ak-word-painted'
            );
        } else if (
            stateName === 'future'
        ) {
            word.visualProgress = 0;
            word.lastPaintAt = frameNow;
            word._akProgressBucket = 0;

            word.element.style.setProperty(
                '--ak-word-progress',
                '0%'
            );

            word.element.classList.add(
                'ak-word-zero'
            );

            word.element.classList.remove(
                'ak-word-active',
                'ak-word-done',
                'ak-word-painted',
                'ak-word-next'
            );
        } else {
            word._akStaticState =
                'active';
        }

        if (!preserveMotion) {
            resetWordMotion(word);
        }
    }

    function finishEcoCompositorHandoff() {
        const lineIndex =
            state.ecoHandoffLineIndex;

        if (
            lineIndex < 0
            || lineIndex
                >= state.lineData.length
        ) {
            state.ecoHandoffLineIndex = -1;
            state.ecoHandoffUntil = 0;
            return;
        }

        const line =
            state.lineData[lineIndex];

        line.element.classList.remove(
            'ak-motion-handoff'
        );

        (line.words || []).forEach(word => {
            if (word.element) {
                word.element.classList.remove(
                    'ak-word-handoff'
                );
            }

            resetWordMotion(word);
        });

        state.ecoHandoffLineIndex = -1;
        state.ecoHandoffUntil = 0;
    }

    function beginEcoCompositorHandoff(
        lineIndex,
        ticks,
        frameNow
    ) {
        if (state.ecoHandoffLineIndex >= 0) {
            finishEcoCompositorHandoff();
        }

        if (
            lineIndex < 0
            || lineIndex
                >= state.lineData.length
        ) {
            return;
        }

        const line =
            state.lineData[lineIndex];

        let retained = false;

        (line.words || []).forEach(word => {
            const keep =
                motionHandoffActive(
                    word,
                    ticks
                )
                && !word._akMotionIsReset;

            setStaticWordState(
                word,
                'past',
                frameNow,
                keep
            );

            if (!keep || !word.element) {
                return;
            }

            retained = true;

            word.element.classList.add(
                'ak-word-handoff'
            );

            word.element.style.transform = '';
            word.element.style.filter = 'none';

            (word.glowLayers || [])
                .forEach(layer => {
                    layer.style.opacity = '0';
                });

            (word.motionGlyphs || [])
                .forEach(glyph => {
                    glyph.style.transform = '';

                    (glyph.glowLayers || [])
                        .forEach(layer => {
                            layer.style.opacity = '0';
                        });
                });
        });

        if (!retained) return;

        line.element.classList.add(
            'ak-motion-handoff'
        );

        state.ecoHandoffLineIndex =
            lineIndex;

        state.ecoHandoffUntil =
            frameNow
            + ECO_COMPOSITOR_HANDOFF_MS;
    }

    function distanceToActiveLines(
        lineIndex,
        activeLines
    ) {
        if (!activeLines || !activeLines.length) {
            return 999;
        }

        let minimum = 999;

        for (const activeIndex of activeLines) {
            minimum = Math.min(
                minimum,
                Math.abs(lineIndex - activeIndex)
            );
        }

        return minimum;
    }

    function overlapLineDistanceBand(
        lineIndex,
        activeLines
    ) {
        const distance = distanceToActiveLines(
            lineIndex,
            activeLines
        );

        if (distance === 0) return 'current';
        if (distance === 1) return 'near';
        if (distance === 2) return 'near2';
        if (distance >= 5) return 'far';
        return 'middle';
    }

    function updateLineState(
        lineRecord,
        lineIndex,
        activeLine,
        activeLines,
        ticks,
        frameNow,
        force
    ) {
        const isActive =
            activeLines.includes(lineIndex);

        const overlapCurrent =
            isActive
            && activeLines.length > 1;

        const phase =
            isActive
                ? 'current'
                : lineIndex < activeLine
                ? 'past'
                : (
                    lineIndex > activeLine
                        ? 'future'
                        : 'current'
                );

        const band =
            overlapLineDistanceBand(
                lineIndex,
                activeLines
            );

        const phaseChanged =
            force
            || lineRecord._akPhase !== phase;

        const overlapChanged =
            force
            || lineRecord._akOverlapCurrent
                !== overlapCurrent;

        const bandChanged =
            force
            || lineRecord._akBand !== band;

        if (
            !phaseChanged
            && !bandChanged
            && !overlapChanged
        ) {
            return false;
        }

        lineRecord._akPhase = phase;
        lineRecord._akBand = band;
        lineRecord._akOverlapCurrent =
            overlapCurrent;

        const lineElement =
            lineRecord.element;

        if (phaseChanged) {
            lineElement.classList.toggle(
                'ak-current',
                phase === 'current'
            );

            lineElement.classList.toggle(
                'ak-past',
                phase === 'past'
            );

            lineElement.classList.toggle(
                'ak-future',
                phase === 'future'
            );
        }

        if (overlapChanged) {
            lineElement.classList.toggle(
                'ak-overlap-current',
                overlapCurrent
            );
        }

        if (bandChanged) {
            lineElement.classList.toggle(
                'ak-near',
                band === 'near'
            );

            lineElement.classList.toggle(
                'ak-near2',
                band === 'near2'
            );

            lineElement.classList.toggle(
                'ak-far',
                band === 'far'
            );
        }

        const words =
            lineRecord.words || [];

        if (!words.length || !phaseChanged) {
            return true;
        }

        if (phase === 'past') {
            const ecoCarry =
                lineIndex
                    === state.ecoHandoffLineIndex
                && frameNow
                    < state.ecoHandoffUntil;

            const dynamicCarry =
                state.performanceProfile !== 'eco'
                && activeLines.some(
                    index => lineIndex === index - 1
                );

            words.forEach(word => {
                const keep =
                    (
                        ecoCarry
                        && word.element
                        && word.element.classList.contains(
                            'ak-word-handoff'
                        )
                    )
                    || (
                        dynamicCarry
                        && motionHandoffActive(
                            word,
                            ticks
                        )
                    );

                setStaticWordState(
                    word,
                    'past',
                    frameNow,
                    keep
                );
            });
        } else if (phase === 'future') {
            words.forEach(word => {
                setStaticWordState(
                    word,
                    'future',
                    frameNow,
                    false
                );
            });
        }

        return true;
    }

    function syncStaticLineStates(
        activeLine,
        activeLines,
        ticks,
        frameNow
    ) {
        const previous =
            state.lastActiveLine;

        const sequential =
            previous >= 0
            && activeLine === previous + 1;

        const ecoProfile =
            state.performanceProfile === 'eco';

        const removedActiveLines =
            state.activeLineIndexes.filter(
                index => !activeLines.includes(index)
            );

        const naturalTransition =
            previous >= 0
            && activeLine >= 0
            && Math.abs(activeLine - previous) <= 1;

        if (
            ecoProfile
            && !sequential
            && state.ecoHandoffLineIndex >= 0
        ) {
            finishEcoCompositorHandoff();
        }

        if (
            ecoProfile
            && naturalTransition
            && removedActiveLines.length
        ) {
            beginEcoCompositorHandoff(
                removedActiveLines[
                    removedActiveLines.length - 1
                ],
                ticks,
                frameNow
            );
        }

        const forceFull =
            previous < -1
            || activeLine < 0
            || Math.abs(
                activeLine - previous
            ) > 1;

        const indexes = [];
        const included = {};

        const include = index => {
            if (
                index < 0
                || index >= state.lineData.length
                || included[index]
            ) {
                return;
            }

            included[index] = true;
            indexes.push(index);
        };

        if (forceFull) {
            for (
                let index = 0;
                index < state.lineData.length;
                index += 1
            ) {
                include(index);
            }
        } else {
            for (
                let offset = -LINE_CLASS_NEIGHBORHOOD;
                offset <= LINE_CLASS_NEIGHBORHOOD;
                offset += 1
            ) {
                include(previous + offset);
                include(activeLine + offset);
            }

            /* Long call-and-response overlaps can span many intervening lines. */
            state.activeLineIndexes.forEach(include);
            activeLines.forEach(include);
        }

        let mutationCount = 0;

        indexes.forEach(lineIndex => {
            if (
                updateLineState(
                    state.lineData[lineIndex],
                    lineIndex,
                    activeLine,
                    activeLines,
                    ticks,
                    frameNow,
                    forceFull
                )
            ) {
                mutationCount += 1;
            }
        });

        if (!ecoProfile) {
            const previousLine =
                state.lineData[
                    activeLine - 1
                ];

            if (previousLine) {
                const stillSinging =
                    activeLines.includes(
                        activeLine - 1
                    );

                const preserve =
                    !stillSinging
                    &&
                    (previousLine.words || [])
                        .some(word =>
                            motionHandoffActive(
                                word,
                                ticks
                            )
                        );

                previousLine.element.classList.toggle(
                    'ak-motion-handoff',
                    preserve
                );
            }
        }

        state.lineTransitionCount += 1;
        state.lastLineSyncCount = mutationCount;
        state.maxLineSyncCount =
            Math.max(
                state.maxLineSyncCount,
                mutationCount
            );

        state.lastActiveLine = activeLine;
    }

    function updatePreviousLineHandoff(
        activeLine,
        ticks
    ) {
        if (
            state.performanceProfile === 'eco'
        ) {
            return;
        }

        const previousIndex =
            activeLine - 1;

        if (
            previousIndex < 0
            || previousIndex
                >= state.lineData.length
        ) {
            return;
        }

        const line =
            state.lineData[
                previousIndex
            ];

        if (
            state.activeLineIndexes.includes(
                previousIndex
            )
        ) {
            line.element.classList.remove(
                'ak-motion-handoff'
            );
            return;
        }

        const words =
            line.words || [];

        let anyHandoff = false;

        words.forEach(word => {
            if (
                !motionHandoffActive(
                    word,
                    ticks
                )
            ) {
                resetWordMotion(word);
                return;
            }

            anyHandoff = true;

            const continuityGain =
                motionContinuityGain(
                    word,
                    ticks
                );

            if (
                word.motionGlyphs
                && word.motionGlyphs.length
            ) {
                updateMotionGlyphs(
                    word,
                    ticks,
                    continuityGain
                );
            } else if (word.wholeMotion) {
                updateWholeMotion(
                    word,
                    ticks,
                    continuityGain
                );
            }
        });

        line.element.classList.toggle(
            'ak-motion-handoff',
            anyHandoff
        );
    }

    function shouldRunAnimationLoop() {
        return !document.hidden
            && !!state.lyrics
            && state.lineData.length > 0
            && isLyricsPage();
    }

    function stopAnimationLoop(
        reason = 'idle'
    ) {
        const wasRunning =
            state.animationLoopRunning
            || !!state.rafId
            || !!state.frameTimer;

        if (state.rafId) {
            try {
                cancelAnimationFrame(
                    state.rafId
                );
            } catch {
                // Ignore incomplete embedded-browser cancellation APIs.
            }
            state.rafId = 0;
        }

        if (state.frameTimer) {
            clearTimeout(
                state.frameTimer
            );
            state.frameTimer = 0;
        }

        state.forceNextFrame = false;
        state.animationLoopRunning = false;
        state.lastRenderedFrameAt = 0;
        state.performanceWindowStart = 0;
        state.performanceFrameCount = 0;
        state.measuredFps = 0;

        if (wasRunning) {
            state.animationLoopStops += 1;
        }

        return reason;
    }

    function markAnimationLoopRunning() {
        if (!state.animationLoopRunning) {
            state.animationLoopRunning = true;
            state.animationLoopStarts += 1;
        }
    }

    function scheduleNextFrame(
        media,
        immediate = false
    ) {
        if (!shouldRunAnimationLoop()) {
            stopAnimationLoop('inactive');
            return;
        }

        if (immediate) {
            state.forceNextFrame = true;
        }

        if (
            state.rafId
            || state.frameTimer
        ) {
            return;
        }

        markAnimationLoopRunning();

        const interval =
            immediate
                ? 0
                : getTargetFrameInterval(
                    media
                );

        if (interval <= 19) {
            state.rafId =
                requestAnimationFrame(
                    renderFrame
                );
            return;
        }

        const delay =
            Math.max(
                0,
                interval - 8
            );

        state.frameTimer =
            window.setTimeout(() => {
                state.frameTimer = 0;

                if (!shouldRunAnimationLoop()) {
                    stopAnimationLoop('timer-inactive');
                    return;
                }

                state.rafId =
                    requestAnimationFrame(
                        renderFrame
                    );
            }, delay);
    }

    function scheduleMediaDiscoveryFrame() {
        if (!shouldRunAnimationLoop()) {
            stopAnimationLoop('media-discovery-inactive');
            return;
        }

        if (state.rafId || state.frameTimer) {
            return;
        }

        markAnimationLoopRunning();

        state.frameTimer = window.setTimeout(() => {
            state.frameTimer = 0;

            if (!shouldRunAnimationLoop()) {
                stopAnimationLoop('media-discovery-inactive');
                return;
            }

            state.rafId =
                requestAnimationFrame(
                    renderFrame
                );
        }, MEDIA_DISCOVERY_RETRY_MS);
    }

    function wakeAnimationLoop() {
        if (!shouldRunAnimationLoop()) {
            stopAnimationLoop('wake-inactive');
            return;
        }

        if (state.frameTimer) {
            clearTimeout(
                state.frameTimer
            );
            state.frameTimer = 0;
        }

        scheduleNextFrame(
            state.mediaElement,
            true
        );
    }

    function ensureMediaWakeHooks(media) {
        if (
            !media
            || media.__appleKaraokePerfHooks
        ) {
            return;
        }

        media.__appleKaraokePerfHooks = true;

        const handleMediaWake = event => {
            const type =
                event && event.type;

            if (
                state.mediaElement
                && state.mediaElement !== media
                && state.mediaElement.isConnected
            ) {
                state.staleMediaEventDrops += 1;
                return;
            }

            if (
                !media.isConnected
                && state.mediaElement !== media
            ) {
                state.staleMediaEventDrops += 1;
                return;
            }

            if (type === 'ended') {
                state.accentReplayArmed = true;
            } else if (type === 'emptied') {
                state.accentReplayArmed = false;
            } else if (
                (
                    type === 'play'
                    || type === 'playing'
                )
                && state.accentReplayArmed
            ) {
                const replayedFromStart =
                    (
                        Number(media.currentTime)
                        || 0
                    ) < 2;

                state.accentReplayArmed = false;

                if (
                    replayedFromStart
                    && state.lyrics
                    && readAccentMode()
                        === 'shuffle'
                ) {
                    selectSongAccent(
                        state.lyrics,
                        true,
                        'replay'
                    );

                    state.atmosphereMediaKey = '';
                }
            }

            if (
                type === 'waiting'
                || type === 'stalled'
                || type === 'seeking'
                || type === 'emptied'
            ) {
                state.playbackClockSuspended = true;
            } else if (
                type === 'play'
                || type === 'playing'
                || type === 'canplay'
                || type === 'seeked'
                || type === 'loadedmetadata'
            ) {
                state.playbackClockSuspended = false;
            }

            if (
                type === 'loadedmetadata'
                || type === 'emptied'
                || type === 'durationchange'
            ) {
                state.mediaProbeAt = 0;
            }

            const replayFromBeginning =
                (
                    type === 'play'
                    || type === 'playing'
                )
                && (
                    Number(media.currentTime)
                    || 0
                ) < 0.75;

            const frameNow = performance.now();

            if (
                type === 'seeking'
                || type === 'seeked'
                || type === 'loadedmetadata'
                || type === 'emptied'
                || replayFromBeginning
            ) {
                state.lastActiveLine = -999;
                state.lastActiveLineSignature = '';
                state.activeLineIndexes = [];
            }

            if (type !== 'timeupdate') {
                resetPlaybackClock(
                    media,
                    frameNow
                );
            }

            wakeAnimationLoop();
        };

        for (const eventName of [
            'play',
            'playing',
            'pause',
            'waiting',
            'stalled',
            'canplay',
            'seeking',
            'seeked',
            'timeupdate',
            'loadedmetadata',
            'durationchange',
            'ratechange',
            'ended',
            'emptied'
        ]) {
            media.addEventListener(
                eventName,
                handleMediaWake,
                {
                    passive: true
                }
            );
        }
    }

    function renderFrame() {
        state.rafId = 0;

        if (!shouldRunAnimationLoop()) {
            stopAnimationLoop('render-inactive');
            return;
        }

        const firstDecoratedLine =
            state.lineData[0]
            && state.lineData[0].element;

        if (
            !firstDecoratedLine
            || !firstDecoratedLine.isConnected
        ) {
            state.decoratedGeneration = -1;
            queueDecoration();
            stopAnimationLoop('stale-lyric-dom');
            return;
        }

        const media =
            getLocalMediaElement();

        if (!media) {
            const now =
                performance.now();

            if (
                now
                - state.lastMediaWarning
                > 5000
            ) {
                state.lastMediaWarning = now;

                warn(
                    'No local Jellyfin audio element found for karaoke timing.'
                );
            }

            scheduleMediaDiscoveryFrame();
            return;
        }

        ensureMediaWakeHooks(media);

        const frameNow =
            performance.now();

        const targetInterval =
            getTargetFrameInterval(
                media
            );

        if (
            !state.forceNextFrame
            && targetInterval <= 19
            && state.lastRenderedFrameAt
            && frameNow
                - state.lastRenderedFrameAt
                < targetInterval - 1.25
        ) {
            state.skippedRafFrames += 1;

            scheduleNextFrame(
                media,
                false
            );
            return;
        }

        state.forceNextFrame = false;
        state.lastRenderedFrameAt = frameNow;

        const ticks =
            chooseTimelineTicks(
                media,
                frameNow
            );

        updateMeasuredFps(
            frameNow
        );

        maybeRefreshAtmosphere(
            media,
            frameNow
        );

        const activeLine =
            findLineIndexAtTicks(
                ticks
            );

        const wordTicks = ticks;

        const activeLines =
            findActiveLineIndexesAtTicks(
                ticks,
                activeLine
            );

        const activeSetChanged =
            activeLine !== state.lastActiveLine
            || !sameIndexList(
                activeLines,
                state.activeLineIndexes
            );

        if (activeSetChanged) {
            syncStaticLineStates(
                activeLine,
                activeLines,
                ticks,
                frameNow
            );

            /* Diagnostics keep a human-readable signature, but build it only
             * when the active set changes instead of allocating every frame. */
            state.lastActiveLineSignature =
                activeLines.join(',');
            state.activeLineIndexes =
                activeLines.slice();
        }

        if (activeLines.length > 1) {
            state.overlapFrameCount += 1;
        }

        state.maxSimultaneousLines =
            Math.max(
                state.maxSimultaneousLines,
                activeLines.length
            );

        activeLines.forEach(lineIndex => {
            const current =
                state.lineData[lineIndex];

            if (!current) return;

            const lineWordTicks =
                activeLineWordTicks(
                    lineIndex,
                    activeLine,
                    wordTicks,
                    ticks
                );

            (current.words || [])
                .forEach(word => {
                    updateWordVisual(
                        word,
                        lineWordTicks,
                        frameNow
                    );
                });
        });

        if (activeLine >= 0) {
            updatePreviousLineHandoff(
                activeLine,
                ticks
            );
        }

        scheduleNextFrame(
            media,
            false
        );
    }

    function ensureAnimationLoop() {
        if (!shouldRunAnimationLoop()) {
            stopAnimationLoop('ensure-inactive');
            return false;
        }

        scheduleNextFrame(
            state.mediaElement,
            true
        );
        return true;
    }


    function installDomObserver() {
        const lyricSelector =
            '.lyricPage, .lyricsContainer, .lyricsLine';

        const observer = new MutationObserver(mutations => {
            if (document.hidden || !isLyricsPage() || !state.lyrics) return;

            let shouldDecorate = false;

            for (const mutation of mutations) {
                if (
                    mutation.type !== 'childList'
                    || !mutation.addedNodes.length
                ) {
                    continue;
                }

                for (const node of mutation.addedNodes) {
                    if (!node || node.nodeType !== 1) continue;

                    const matches =
                        typeof node.matches === 'function';
                    const canQuery =
                        typeof node.querySelector === 'function';

                    if (
                        (matches && node.matches(lyricSelector))
                        || (canQuery && node.querySelector(lyricSelector))
                    ) {
                        shouldDecorate = true;
                        break;
                    }
                }

                if (shouldDecorate) break;
            }

            if (!shouldDecorate) return;

            const container = getCurrentLyricsContainer(false);
            const lines = container
                ? container.querySelectorAll('.lyricsLine')
                : [];

            const needsDecoration =
                state.decoratedGeneration !== state.generation
                || Array.from(lines).some(line =>
                    !line.classList.contains('ak-enhanced-line')
                    || Number(line.dataset.akGeneration) !== state.generation
                );

            if (needsDecoration) queueDecoration();
        });

        const startObserver = () => observer.observe(
            document.documentElement,
            { childList: true, subtree: true }
        );

        if (document.documentElement) startObserver();
        else document.addEventListener(
            'DOMContentLoaded',
            startObserver,
            { once: true }
        );
    }

    function installFontGeometryHooks() {
        const fonts = document.fonts;
        if (!fonts) return;

        const refreshForFonts = () => {
            state.fontGeometryRefreshCount += 1;
            queueMotionGeometryRefresh();
            wakeAnimationLoop();
        };

        try {
            if (fonts.ready && typeof fonts.ready.then === 'function') {
                fonts.ready.then(refreshForFonts).catch(() => {});
            }
        } catch {
            // FontFaceSet readiness is optional on older mobile WebViews.
        }

        try {
            if (typeof fonts.addEventListener === 'function') {
                fonts.addEventListener('loadingdone', refreshForFonts);
            }
        } catch {
            // Geometry still refreshes on resize/orientation if unsupported.
        }
    }

    function installRouteHooks() {
        window.addEventListener('hashchange', () => {
            if (ROUTE_RE.test(location.hash)) {
                queueDecoration();
                ensureRomanizationToggle();
                ensureTimingControls();
                state.atmosphereMediaKey = '';
                state.lastActiveLine = -999;
                state.lastActiveLineSignature = '';
                state.activeLineIndexes = [];
                wakeAnimationLoop();
            } else {
                removeRomanizationToggle();
                removeTimingControls();
                if (state.lyricToolsHost && state.lyricToolsHost.parentNode) {
                    state.lyricToolsHost.parentNode.removeChild(state.lyricToolsHost);
                }
                state.lyricToolsHost = null;
                cancelDecorationRetry(true);

                if (state.geometryTimer) {
                    clearTimeout(state.geometryTimer);
                    state.geometryTimer = 0;
                }

                invalidateAtmosphereLoads(
                    'route-leave'
                );
                stopAnimationLoop(
                    'route-leave'
                );
            }
        });

        window.addEventListener(
            'resize',
            () => {
                queueMotionGeometryRefresh();
                wakeAnimationLoop();
            },
            { passive: true }
        );

        window.addEventListener(
            'orientationchange',
            () => {
                queueMotionGeometryRefresh();
                wakeAnimationLoop();
            },
            { passive: true }
        );

        if (window.visualViewport) {
            window.visualViewport.addEventListener(
                'resize',
                () => {
                    queueMotionGeometryRefresh();
                    wakeAnimationLoop();
                },
                { passive: true }
            );
        }

        document.addEventListener(
            'visibilitychange',
            () => {
                if (document.hidden) {
                    stopAnimationLoop(
                        'document-hidden'
                    );
                    return;
                }

                const firstLine =
                    state.lineData[0]
                    && state.lineData[0].element;

                if (
                    state.lyrics
                    && isLyricsPage()
                    && (
                        state.decoratedGeneration !== state.generation
                        || !firstLine
                        || !firstLine.isConnected
                    )
                ) {
                    queueDecoration();
                }

                resetPlaybackClock(
                    getLocalMediaElement(true),
                    performance.now()
                );
                wakeAnimationLoop();
            },
            { passive: true }
        );

        window.addEventListener(
            'pagehide',
            () => {
                cancelDecorationRetry(true);
                invalidateAtmosphereLoads('pagehide');
                stopAnimationLoop('pagehide');
            },
            { passive: true }
        );

        window.addEventListener(
            'pageshow',
            () => {
                if (state.lyrics && isLyricsPage()) {
                    queueDecoration();
                    wakeAnimationLoop();
                }
            },
            { passive: true }
        );

    }

    /*
     * IMPORTANT: this file is referenced before Jellyfin's runtime.bundle.js
     * in index.html. That lets it observe Jellyfin's lyrics API response before
     * the stock web client flattens each LyricLine to lyric.Text.
     */
    state.atmosphereMode =
        readAtmosphereMode();

    state.performanceMode =
        readPerformanceMode();

    state.performanceProfile =
        detectPerformanceProfile();

    installFetchInterceptor();
    installXhrInterceptor();
    installDomObserver();
    installRouteHooks();
    installFontGeometryHooks();

    function rendererFingerprint() {
        const words = [];

        state.lineData.forEach(line => {
            (line.words || []).forEach(word => words.push(word));
        });

        const geometry = {
            words: words.length,
            perGlyphWords: 0,
            rangeWords: 0,
            canvasFallbackWords: 0,
            wholeScriptWords: 0,
            wholeFallbackWords: 0
        };

        words.forEach(word => {
            const source = word.geometrySource || 'unprepared';

            if (word.motionGlyphs && word.motionGlyphs.length) {
                geometry.perGlyphWords += 1;
            }

            if (source === 'range') geometry.rangeWords += 1;
            else if (source === 'canvas-fallback') {
                geometry.canvasFallbackWords += 1;
            } else if (source === 'whole-script') {
                geometry.wholeScriptWords += 1;
            } else if (source.indexOf('whole-') === 0) {
                geometry.wholeFallbackWords += 1;
            }
        });

        let reducedMotionRequested = false;

        try {
            reducedMotionRequested = !!(
                window.matchMedia
                && window.matchMedia(
                    '(prefers-reduced-motion: reduce)'
                ).matches
            );
        } catch {
            // Old embedded browsers may not implement matchMedia fully.
        }

        const currentWords = [];

        state.lineData.forEach(line => {
            if (
                !line.element.classList.contains('ak-current')
                && !line.element.classList.contains('ak-overlap-current')
            ) {
                return;
            }

            (line.words || []).forEach(word => {
                currentWords.push({
                    text: word.text,
                    motionMode: word.motionMode,
                    paintMode: word.paintMode,
                    geometrySource: word.geometrySource,
                    motionGlyphCount:
                        (word.motionGlyphs || []).length,
                    glowLayersPerGlyph:
                        word.motionGlyphs
                        && word.motionGlyphs[0]
                            ? (
                                word.motionGlyphs[0]
                                    .glowLayers || []
                            ).length
                            : 0
                });
            });
        });

        return {
            version: VERSION,
            visualSignature:
                UNIFIED_RENDERER_SIGNATURE,
            requestedMode: state.performanceMode,
            detectedProfile: state.performanceProfile,
            fullQuality:
                state.performanceProfile === 'desktop'
                || state.performanceProfile === 'mobile',
            targetFps:
                PERFORMANCE_TARGET_FPS[
                    state.performanceProfile
                ],
            glowBuckets: glowBucketSteps(),
            glowRenderer:
                'classic-bloom-prepainted-core+halo',
            segmentSafeMotion:
                state.performanceProfile === 'eco'
                    ? 'whole-word'
                    : 'per-grapheme-with-measured-fallback',
            contextualScriptMotion:
                'grapheme-safe-akshara-bloom+whole-joining-fallback',
            rtlSwipeDirection:
                'per-word-natural-reading-direction',
            cueTokenization:
                'source-preserved-for-cjk-thai-lao-khmer-myanmar',
            atmosphere:
                `${ATMOSPHERE_RASTER_LONG_EDGE[
                    state.performanceProfile
                ]}px/${ATMOSPHERE_RASTER_BLUR_PX[
                    state.performanceProfile
                ]}px`,
            reducedMotionRequested,
            reducedMotionApplied:
                state.performanceProfile === 'eco',
            geometry,
            currentWords
        };
    }

    const publicApi = Object.freeze({
        version: VERSION,
        lyricG2PVersion: LYRICG2P_VERSION,
        redecorate: queueDecoration,
        accents() {
            return PREMIUM_ACCENTS.map(accent => ({
                id: accent.id,
                name: accent.name,
                primaryRgb: accent.rgb,
                secondaryRgb:
                    accent.secondaryRgb
            }));
        },
        setAccent: setAccentMode,
        nextAccent: rerollAccent,
        setPerformance: setPerformanceMode,
        setRomanization: setRomanizationMode,
        romanization() {
            const romanizer = getRomanizer();
            return {
                requiredRomanizerVersion: LYRICG2P_VERSION,
                mode: state.romanizationMode,
                available: state.romanizationAvailable,
                candidate: state.romanizationCandidate,
                loadState: state.romanizationLoadState,
                loadError: state.romanizationLoadError,
                source: state.romanizationSource,
                romanizerVersion: romanizer ? romanizer.version : null,
                strategy: romanizer ? romanizer.strategy : null,
                transformedLines: state.romanizationLineCount,
                toggleCount: state.romanizationToggleCount,
                offlineOnly: true,
                networkSources: false,
                supportedLanguageFamilies: romanizer && romanizer.supportedLanguageFamilies
                    ? romanizer.supportedLanguageFamilies.slice()
                    : [],
                detailedDiagnostics:
                    !!(romanizer && typeof romanizer.romanizeDetailed === 'function'),
                contextSegmentation:
                    !!(romanizer && typeof romanizer.segmentText === 'function'),
                candidateRanker:
                    romanizer && romanizer.candidateRanker
                        ? romanizer.candidateRanker
                        : null,
                romanizationStyle:
                    romanizer && romanizer.romanizationStyle
                        ? Object.assign({}, romanizer.romanizationStyle)
                        : null,
                confidenceSemantics:
                    romanizer && romanizer.confidenceSemantics
                        ? romanizer.confidenceSemantics
                        : null,
                phonologicalIR:
                    !!(romanizer && typeof romanizer.phonologicalIR === 'function'),
                nBestVariants:
                    !!(romanizer && typeof romanizer.romanizationVariants === 'function'),
                learnedModelBundled:
                    !!(romanizer && romanizer.learnedModelBundled),
                targetedLearnedAdvisorsBundled:
                    !!(romanizer && romanizer.targetedLearnedAdvisorsBundled),
                learnedComponentsBundled:
                    !!(romanizer && romanizer.learnedComponentsBundled),
                learnedComponents:
                    romanizer && Array.isArray(romanizer.learnedComponents)
                        ? romanizer.learnedComponents.map(item => Object.assign({}, item))
                        : [],
                songKey: state.songPreferenceKey
            };
        },
        explainRomanization(text) {
            const romanizer = getRomanizer();
            if (!romanizer || typeof romanizer.explain !== 'function') return null;
            return romanizer.explain(String(text == null ? '' : text));
        },
        segmentRomanization(text) {
            const romanizer = getRomanizer();
            if (!romanizer || typeof romanizer.segmentText !== 'function') return [];
            return romanizer.segmentText(String(text == null ? '' : text));
        },
        detectRomanizationLanguages(text) {
            const romanizer = getRomanizer();
            if (!romanizer || typeof romanizer.detectLanguages !== 'function') return [];
            return romanizer.detectLanguages(String(text == null ? '' : text));
        },
        romanizationIR(text) {
            const romanizer = getRomanizer();
            if (!romanizer || typeof romanizer.phonologicalIR !== 'function') return null;
            return romanizer.phonologicalIR(String(text == null ? '' : text));
        },
        romanizationVariants(text, limit) {
            const romanizer = getRomanizer();
            if (!romanizer || typeof romanizer.romanizationVariants !== 'function') return [];
            return romanizer.romanizationVariants(String(text == null ? '' : text), limit);
        },
        exportRomanizationCase(text, expected) {
            const romanizer = getRomanizer();
            if (!romanizer || typeof romanizer.exportRomanizationCase !== 'function') return null;
            return romanizer.exportRomanizationCase(
                String(text == null ? '' : text),
                String(expected == null ? '' : expected)
            );
        },
        rankRomanizationCandidates(text, candidates) {
            const romanizer = getRomanizer();
            if (!romanizer || typeof romanizer.rankCandidates !== 'function') return [];
            return romanizer.rankCandidates(
                String(text == null ? '' : text),
                Array.isArray(candidates) ? candidates : []
            );
        },
        selectRomanizationCandidate(text, candidates) {
            const romanizer = getRomanizer();
            if (!romanizer || typeof romanizer.selectCandidate !== 'function') return null;
            return romanizer.selectCandidate(
                String(text == null ? '' : text),
                Array.isArray(candidates) ? candidates : []
            );
        },
        setTimingOffset: setTimingOffsetSeconds,
        adjustTimingOffset: adjustTimingOffsetSeconds,
        resetTimingOffset() {
            return resetTimingOffsetValue();
        },
        startTimingSync() {
            return beginTimingSyncMode();
        },
        undoTiming() {
            return undoTimingOffset();
        },
        timing() {
            return {
                seconds: state.timingOffsetSeconds,
                display: formatTimingOffset(),
                fineStepSeconds: TIMING_OFFSET_FINE_STEP_SECONDS,
                stepSeconds: TIMING_OFFSET_STEP_SECONDS,
                minSeconds: TIMING_OFFSET_MIN_SECONDS,
                maxSeconds: TIMING_OFFSET_MAX_SECONDS,
                changeCount: state.timingOffsetChangeCount,
                syncPickActive: state.timingPickActive,
                timelineFingerprint: timingTimelineFingerprint(),
                songKey: state.songPreferenceKey
            };
        },
        backgroundVocals: inspectBackgroundVocals,
        rendererFingerprint,
        performance() {
            return {
                mode: state.performanceMode,
                profile: state.performanceProfile,
                targetFps:
                    state.timedCueCount > 0
                        ? PERFORMANCE_TARGET_FPS[
                            state.performanceProfile
                        ]
                        : LRC_TARGET_FPS,
                measuredFps:
                    Number(
                        state.measuredFps.toFixed(1)
                    ),
                timedCueCount:
                    state.timedCueCount,
                perGlyphMotion:
                    state.performanceProfile === 'eco'
                        ? 'whole-word'
                        : 'multiscript-grapheme+whole-shaped',
                playbackClock:
                    'phase-locked-monotonic',
                rafTargetGate: true,
                skippedRafFrames:
                    state.skippedRafFrames,
                animationLoopRunning:
                    state.animationLoopRunning,
                animationLoopStarts:
                    state.animationLoopStarts,
                animationLoopStops:
                    state.animationLoopStops,
                mediaSwitchCount:
                    state.mediaSwitchCount,
                staleMediaEventDrops:
                    state.staleMediaEventDrops
            };
        },
        setAtmosphere: setAtmosphereMode,
        atmosphere() {
            return {
                mode: state.atmosphereMode,
                artwork: state.atmosphereArtwork,
                source: state.atmosphereSource,
                colors: state.atmosphereColors,
                pendingKey: state.atmospherePendingKey,
                pendingMs:
                    state.atmospherePendingSince > 0
                        ? Number(
                            Math.max(
                                0,
                                performance.now()
                                    - state.atmospherePendingSince
                            ).toFixed(1)
                        )
                        : 0,
                timeoutCount:
                    state.atmosphereTimeoutCount
            };
        },
        refreshAtmosphere() {
            const media =
                getLocalMediaElement();

            state.atmosphereMediaKey = '';

            if (media) {
                refreshAtmosphere(
                    media,
                    true
                );
            }

            return {
                requested: !!media
            };
        },
        diagnostics() {
            const media =
                getLocalMediaElement();

            const current =
                state.lineData.find(
                    line =>
                        line.element.classList.contains('ak-current')
                );

            return {
                version: VERSION,
                route: location.hash,
                lyricLines:
                    state.lyrics
                        ? state.lyrics.length
                        : 0,
                cueCount:
                    state.lyrics
                        ? state.lyrics.reduce(
                            (n, lyric) =>
                                n
                                + (
                                    (
                                        lyricValue(
                                            lyric,
                                            'Cues',
                                            'cues'
                                        )
                                        || []
                                    ).length
                                ),
                            0
                        )
                        : 0,
                decoratedLines: state.lineData.length,
                lyricsRequestSeq:
                    state.lyricsRequestSeq,
                lyricsRequestKey:
                    state.lyricsRequestKey,
                lyricsAcceptedKey:
                    state.lyricsAcceptedKey,
                lyricsAcceptedSeq:
                    state.lyricsAcceptedSeq,
                lyricsStaleResponseDrops:
                    state.lyricsStaleResponseDrops,
                decorationRetryActive:
                    !!decorateTimer,
                decorationRetryCount:
                    state.decorationRetryCount,
                decorationRetryExpiredCount:
                    state.decorationRetryExpiredCount,
                animationLoopRunning:
                    state.animationLoopRunning,
                animationLoopStarts:
                    state.animationLoopStarts,
                animationLoopStops:
                    state.animationLoopStops,
                mediaFound: !!media,
                mediaSwitchCount:
                    state.mediaSwitchCount,
                staleMediaEventDrops:
                    state.staleMediaEventDrops,
                romanizationMode: state.romanizationMode,
                romanizationAvailable: state.romanizationAvailable,
                romanizationCandidate: state.romanizationCandidate,
                romanizationLoadState: state.romanizationLoadState,
                romanizationLoadError: state.romanizationLoadError,
                romanizationSource: state.romanizationSource,
                romanizationTransformedLines: state.romanizationLineCount,
                romanizationToggleCount: state.romanizationToggleCount,
                songPreferenceKey: state.songPreferenceKey,
                timingOffsetSeconds: state.timingOffsetSeconds,
                timingOffsetDisplay: formatTimingOffset(),
                timingOffsetChangeCount: state.timingOffsetChangeCount,
                mediaCurrentTime:
                    media ? media.currentTime : null,
                mode:
                    state.lineData.some(
                        line => line.cues.length > 0
                    )
                        ? 'ELRC enhanced'
                        : (
                            state.lineData.length
                                ? 'normal LRC / line-synced'
                                : 'not active'
                        ),
                currentLine:
                    state.lineData.findIndex(
                        line =>
                            line.element.classList.contains('ak-current')
                    ),
                activeLines:
                    state.activeLineIndexes.slice(),
                simultaneousActiveLines:
                    state.activeLineIndexes.length,
                maxSimultaneousLines:
                    state.maxSimultaneousLines,
                overlapFrameCount:
                    state.overlapFrameCount,
                overlapRendering:
                    'independent-line-end-active-set',
                backgroundVocalCount:
                    state.backgroundVocalCount,
                backgroundVocalTransport:
                    'ascii-elrc-role-token+legacy+parenthetical-recovery',
                backgroundVocalLayout:
                    'center+inset-end+center+inset-start',
                backgroundVocalInspection:
                    inspectBackgroundVocals(),
                crossPlatformQuality:
                    'pc-mobile-multilingual-preview4-renderer',
                platformVisualOverrides:
                    state.performanceProfile === 'eco'
                        ? 'eco-opt-in'
                        : 'none',
                tvPolicy:
                    'stock-jellyfin-bootstrap-bypass',
                rendererFingerprint:
                    rendererFingerprint(),
                effectModel: 'phase-locked-motion+classic-bloom-v3.1-multiscript-unified',
                coloredGlow: true,
                coloredGlowOnlyOnMotionGlyphs: false,
                complexScriptShapedGlow: true,
                universalScriptMotionEligibility: true,
                coloredWipe: false,
                maskedGlowLayers: false,
                futureWordHeadlightFix: true,
                anticipatoryPreWipe: false,
                motionHandoffMs: MOTION_HANDOFF_TICKS / 10000,
                accentMode: state.accentMode,
                accent: state.accent && state.accent.id,
                accentName: state.accent && state.accent.name,
                accentPrimaryRgb:
                    state.accent
                    && state.accent.rgb,
                accentSecondaryRgb:
                    state.accent
                    && state.accent.secondaryRgb,
                accentSelectionReason:
                    state.accentSelectionReason,
                accentPaletteSize:
                    PREMIUM_ACCENTS.length,
                accentBagRemaining:
                    state.accentBag.length,
                accentRandomSource:
                    state.accentRandomSource,
                accentReplayArmed:
                    state.accentReplayArmed,
                performanceOptimization: true,
                performanceMode: state.performanceMode,
                performanceProfile: state.performanceProfile,
                performanceTargetFps:
                    state.timedCueCount > 0
                        ? PERFORMANCE_TARGET_FPS[
                            state.performanceProfile
                        ]
                        : LRC_TARGET_FPS,
                measuredFps:
                    Number(
                        state.measuredFps.toFixed(1)
                    ),
                playbackClock:
                    'phase-locked-monotonic',
                playbackClockLeadMs:
                    media
                        ? Number(
                            (
                                (
                                    state.playbackClockSeconds
                                    - (
                                        Number(media.currentTime)
                                        || 0
                                    )
                                )
                                * 1000
                            ).toFixed(1)
                        )
                        : null,
                playbackClockCorrectionMs:
                    Number(
                        state.playbackClockCorrectionMs
                            .toFixed(2)
                    ),
                playbackClockHardSnaps:
                    state.playbackClockHardSnaps,
                glowEnvelope:
                    'soft-knee-crisp-core+chroma-halo+afterglow',
                glowLuminanceLimiter: true,
                glowOpacityBuckets:
                    glowBucketSteps(),
                glyphInkOverscanEm: 0.075,
                rafTargetGate: true,
                skippedRafFrames:
                    state.skippedRafFrames,
                lineTransitionCount:
                    state.lineTransitionCount,
                lastLineSyncCount:
                    state.lastLineSyncCount,
                maxLineSyncCount:
                    state.maxLineSyncCount,
                ecoCompositorHandoffMs:
                    ECO_COMPOSITOR_HANDOFF_MS,
                activeLineOnlyRendering: false,
                activeSetOnlyRendering: true,
                staticLinesUpdateOnlyOnLineChange: true,
                normalLrcTargetFps: LRC_TARGET_FPS,
                pausedTargetFps: PAUSED_TARGET_FPS,
                adaptiveAlbumAtmosphere: true,
                atmosphereMode: state.atmosphereMode,
                atmosphereArtwork: state.atmosphereArtwork,
                atmosphereSource: state.atmosphereSource,
                atmosphereColors: state.atmosphereColors,
                atmospherePendingKey:
                    state.atmospherePendingKey,
                atmospherePendingMs:
                    state.atmospherePendingSince > 0
                        ? Number(
                            Math.max(
                                0,
                                performance.now()
                                    - state.atmospherePendingSince
                            ).toFixed(1)
                        )
                        : 0,
                atmosphereTimeoutCount:
                    state.atmosphereTimeoutCount,
                atmosphereCrossfade: true,
                atmosphereColorExtraction: 'canvas-with-accent-fallback',
                atmosphereRasterized: true,
                atmospherePrebakedBlur: true,
                atmosphereLiveCssBlur: false,
                atmosphereRasterMethod:
                    state.atmosphereRasterMethod,
                atmosphereRasterDimensions:
                    [
                        state.atmosphereRasterWidth,
                        state.atmosphereRasterHeight
                    ],
                atmosphereRasterBlurPx:
                    state.atmosphereRasterBlurPx,
                atmosphereSharpArtFallback: false,
                atmosphereCrossfadeMs:
                    ATMOSPHERE_CROSSFADE_MS,
                geometryAwareSwipe: true,
                connectedScriptPaint:
                    'shaped-spatial-wipe',
                shapedWordCount:
                    state.shapedWordCount,
                scriptProfileCounts:
                    Object.assign(
                        {},
                        state.scriptProfileCounts
                    ),
                fontGeometryRefreshCount:
                    state.fontGeometryRefreshCount,
                wipeBaseEm: BASE_WIPE_GRADIENT_EM,
                swipeSmoothingMs: WORD_PROGRESS_SMOOTH_TAU_MS,
                currentMotionPlan:
                    current
                        ? (current.words || []).map(word => ({
                            word: word.text,
                            motion: word.motionMode,
                            glow: word.motionGlow,
                            scriptProfile:
                                word.scriptProfile,
                            paintMode:
                                word.paintMode,
                            durationMs:
                                Math.round(word.motionDurationMs),
                            geometryReady: word.geometryReady,
                            geometrySource:
                                word.geometrySource,
                            glyphOverlay:
                                !!(
                                    word.motionGlyphs
                                    && word.motionGlyphs.length
                                )
                        }))
                        : [],
                graphemeSafeCueSplitting: true,
                userToasts: false,
                knownGoodV1CapturePath: true
            };
        }
    });

    window.JellyfinLyricMotion = publicApi;
    /* Backward-compatible console API for local v2.x test builds. */
    window.AppleKaraoke = publicApi;

    log(`v${VERSION} loaded`);
})();
