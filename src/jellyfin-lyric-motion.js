/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Jellyfin LyricMotion - unofficial Jellyfin Web lyrics enhancement.
 */
(function () {
    'use strict';

    const VERSION = '3.0.0';
    const TICKS_PER_SECOND = 10000000;

    /* Invisible ELRC prefix emitted by the companion TTML converter. */
    const BACKGROUND_VOCAL_SENTINEL = '\u2063\u2060';

    // Display-only lyric wipe smoothing.
    const WORD_PROGRESS_SMOOTH_TAU_MS = 20;
    const WORD_PROGRESS_SNAP_DELTA = 0.42;
    const WORD_RENDER_LOOKAHEAD_TICKS = 140000; // 14 ms
    const WORD_PREWIPE_TICKS = 0; // no pre-sung headlight

    // Behaviour adapted from the current am-lyrics renderer.
    const BASE_WIPE_GRADIENT_EM = 0.75;
    const LONG_WORD_WIPE_EXTRA_EM = 0.45;
    const SHORT_WORD_DRAG_MIN_DURATION_MS = 760;
    const SHORT_WORD_GLOW_MIN_DURATION_MS = 1320;
    const MOTION_FINAL_RISE_EM = -0.035;
    const MOTION_HANDOFF_TICKS = 3200000; // 320 ms previous-line glow decay
    const TV_COMPOSITOR_HANDOFF_MS = 210;
    const LINE_CLASS_NEIGHBORHOOD = 6;
    const ZERO_PROGRESS_EPSILON = 0.0025;

    /*
     * LG's focused lyric button advances on Jellyfin's coarse timeupdate,
     * while our phase-locked singing clock advances every rendered frame.
     * Commit a TV line only after the host focus/class signal, then give the
     * compositor one short arm before smoothly repaying any timing debt.
     */
    const TV_FOCUS_ARM_MS = 90;
    const TV_HOST_MAX_WAIT_MS = 560;
    const TV_HOST_POLL_INTERVAL_MS = 48;
    const TV_VISUAL_CATCHUP_RATE = 1.45;

    /* Joining scripts use a uniform luminance reveal, never a spatial clip. */
    const ATOMIC_FUTURE_ALPHA = 0.40;

    /*
     * Phase-locked lyric clock.
     *
     * Some embedded TV media engines expose currentTime in visible steps even
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

    const PERFORMANCE_TARGET_FPS = Object.freeze({
        desktop: 60,
        mobile: 30,
        tv: 60,
        eco: 20
    });

    /*
     * Normal LRC only changes at line boundaries, so 20 fps is still very
     * cheap with the active-line-only renderer while cutting worst-case visual
     * line-transition latency from ~100 ms to ~50 ms.
     */
    const LRC_TARGET_FPS = 20;
    const PAUSED_TARGET_FPS = 2;

    /*
     * Premium atmosphere is rendered ONCE per song into a small,
     * viewport-shaped blurred bitmap. There is no full-screen live CSS blur.
     */
    const ATMOSPHERE_RASTER_LONG_EDGE = Object.freeze({
        desktop: 360,
        mobile: 240,
        tv: 220,
        eco: 160
    });

    const ATMOSPHERE_RASTER_BLUR_PX = Object.freeze({
        desktop: 26,
        mobile: 20,
        tv: 18,
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
    const ROUTE_RE = /(?:^|[#/])lyrics(?:[/?#]|$)/i;

    const state = {
        lyrics: null,
        generation: 0,
        decoratedGeneration: -1,
        lineData: [],
        rafId: 0,
        frameTimer: 0,
        lastMediaWarning: 0,
        geometryTimer: 0,
        lastActiveLine: -999,
        lastActiveLineSignature: '',
        activeLineIndexes: [],
        lineEndPrefix: [],
        mediaElement: null,
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
        tvHandoffLineIndex: -1,
        tvHandoffUntil: 0,
        tvTimingLine: -1,
        tvPresentationLine: -999,
        tvPendingLine: -1,
        tvPendingSince: 0,
        tvPendingHostFrames: 0,
        tvHostLine: -1,
        tvHostSignalAt: 0,
        tvLastHostPollAt: 0,
        tvFocusedLine: -1,
        tvArmUntil: 0,
        tvVisualTicks: 0,
        tvVisualFrameAt: 0,
        tvVisualDebtMs: 0,
        tvLastActivationWaitMs: 0,
        tvActivationSource: 'initial',
        tvActivationFallbacks: 0,
        tvStockTimingObserved: false,
        tvForceTimingCommit: false,

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

        atomicWordCount: 0,
        scriptProfileCounts: {},

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
        return typeof url === 'string' && /\/lyrics(?:[/?#]|$)/i.test(url);
    }

    function isLyricsPage() {
        return ROUTE_RE.test(location.hash) || !!document.querySelector('.lyricsContainer');
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

    try {
        unicodeMarkExpression =
            new RegExp('\\p{Mark}', 'u');
    } catch {
        // Older webOS engines use the explicit ranges below.
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

    function isFallbackMarkCodePoint(codePoint) {
        return (
            codePoint >= 0x0300 && codePoint <= 0x036f
        ) || (
            codePoint >= 0x0591 && codePoint <= 0x05c7
        ) || (
            codePoint >= 0x0610 && codePoint <= 0x061a
        ) || (
            codePoint >= 0x064b && codePoint <= 0x065f
        ) || (
            codePoint >= 0x06d6 && codePoint <= 0x06ed
        ) || (
            codePoint >= 0x0900 && codePoint <= 0x0903
        ) || (
            codePoint >= 0x093a && codePoint <= 0x094f
        ) || (
            codePoint >= 0x0951 && codePoint <= 0x0957
        ) || (
            codePoint >= 0x0962 && codePoint <= 0x0963
        ) || (
            codePoint >= 0x0a01 && codePoint <= 0x0a03
        ) || codePoint === 0x0a3c || (
            codePoint >= 0x0a3e && codePoint <= 0x0a4d
        ) || codePoint === 0x0a51 || (
            codePoint >= 0x0a70 && codePoint <= 0x0a71
        ) || codePoint === 0x0a75 || (
            codePoint >= 0x0d00 && codePoint <= 0x0d03
        ) || (
            codePoint >= 0x0d3b && codePoint <= 0x0d4d
        ) || codePoint === 0x0d57 || (
            codePoint >= 0x0d62 && codePoint <= 0x0d63
        ) || (
            codePoint >= 0x1ab0 && codePoint <= 0x1aff
        ) || (
            codePoint >= 0x1dc0 && codePoint <= 0x1dff
        ) || (
            codePoint >= 0x20d0 && codePoint <= 0x20ff
        ) || (
            codePoint >= 0xfe20 && codePoint <= 0xfe2f
        );
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
        );
    }

    function isJoinControl(codePoint) {
        return codePoint === 0x200c
            || codePoint === 0x200d;
    }

    function isIndicVirama(codePoint) {
        return [
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
        ].includes(codePoint);
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

    function detectScriptProfile(text) {
        if (/[\u0900-\u097f]/u.test(text)) {
            return 'devanagari';
        }

        if (/[\u0a00-\u0a7f]/u.test(text)) {
            return 'gurmukhi';
        }

        if (/[\u0d00-\u0d7f]/u.test(text)) {
            return 'malayalam';
        }

        if (
            /[\u0590-\u08ff\u0980-\u09ff\u0a80-\u0cff\u0d80-\u0dff\u1000-\u109f\u1780-\u17ff]/u
                .test(text)
            || text.includes('\u200c')
            || text.includes('\u200d')
        ) {
            return 'joining';
        }

        return 'spatial';
    }

    function usesAtomicPaint(profile) {
        return profile !== 'spatial';
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

    function getWordRanges(text) {
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
        const ranges = getWordRanges(text);

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
                    usesAtomicPaint(
                        scriptProfile
                    )
                        ? 'atomic'
                        : 'spatial',
                isRtl:
                    isRtlText(range.text),
                element: null,
                visualProgress: 0,
                lastPaintAt: null,
                motionMode: 'none',
                motionGlow: false,
                motionDurationMs: 0,
                motionGlyphs: [],
                wholeMotion: null,
                geometryReady: false
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

    function isCjkText(text) {
        return /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/u.test(
            text
        );
    }

    function isRtlText(text) {
        return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF]/u.test(
            text
        );
    }

    function canUseLatinGlyphOverlay(text) {
        try {
            return /^[\p{Script=Latin}\p{Number}\p{Punctuation}\p{Symbol}]+$/u
                .test(text.replace(/\s+/gu, ''));
        } catch {
            return /^[A-Za-z0-9'"’.,!?;:()\-]+$/.test(
                text.replace(/\s+/g, '')
            );
        }
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
             * Latin -> staggered grapheme layer
             * complex scripts -> one fully-shaped word
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

            word.motionGlow = growable;
            word.motionDurationMs = durationMs;

            /*
             * Repo-style dynamic intensity/growth, computed once per word.
             * Per-glyph position decay is added later for Latin overlays.
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

        const layer = word.element.querySelector(':scope > .ak-motion-layer');
        if (layer) layer.remove();

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
    }

    function prepareWordGeometry(word) {
        if (!word || !word.element || !word.segments.length) return;

        clearMotionLayer(word);

        const textNode = Array.from(word.element.childNodes)
            .find(node => node.nodeType === Node.TEXT_NODE);

        if (!textNode) return;

        const wordRect =
            word.element.getBoundingClientRect();

        const fullWidth =
            getPrefixWidth(textNode, textNode.length)
            || word.element.getBoundingClientRect().width;

        if (fullWidth > 0) {
            word.renderWidth = fullWidth;

            word.segments.forEach(segment => {
                const startPx =
                    getPrefixWidth(textNode, segment.startPos);

                const endPx =
                    getPrefixWidth(textNode, segment.endPos);

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

        if (word.motionMode !== 'grow') return;

        /*
         * Latin words can safely use a per-grapheme motion overlay that
         * mirrors am-lyrics' staggered character glow. Complex scripts keep
         * their original shaped word and receive a whole-word glyph shadow.
         */
        if (
            word.paintMode === 'atomic'
            || !canUseLatinGlyphOverlay(word.text)
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

                const glyph =
                    document.createElement('span');

                glyph.className = 'ak-motion-glyph';

                glyph.glowLayers = [
                    'ak-glow-core',
                    'ak-glow-halo'
                ].map(className => {
                    const glow =
                        document.createElement(
                            'span'
                        );

                    glow.className =
                        'ak-glow-layer '
                        + 'ak-glyph-glow-layer '
                        + className;

                    glow.textContent =
                        rangeInfo.text;

                    glow.style.opacity = '0';
                    glyph.appendChild(glow);

                    return glow;
                });

                glyph.style.left =
                    `${(rect.left - wordRect.left).toFixed(3)}px`;

                glyph.style.top =
                    `${(rect.top - wordRect.top).toFixed(3)}px`;

                glyph.style.width =
                    `${rect.width.toFixed(3)}px`;

                glyph.style.height =
                    `${rect.height.toFixed(3)}px`;

                glyph._akMotion =
                    computeGlyphMotionMetrics(
                        word,
                        index,
                        graphemes.length
                    );

                layer.appendChild(glyph);
                glyphs.push(glyph);
            } catch {
                // Ignore one failed glyph and preserve the base word.
            } finally {
                if (range.detach) range.detach();
            }
        });

        if (glyphs.length) {
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
        }
    }

    function refreshMotionGeometry() {
        state.lineData.forEach(line => {
            (line.words || []).forEach(prepareWordGeometry);
        });
    }

    function queueMotionGeometryRefresh() {
        clearTimeout(state.geometryTimer);

        state.geometryTimer =
            window.setTimeout(() => {
                requestAnimationFrame(refreshMotionGeometry);
            }, 40);
    }

    function createWordSpan(word) {
        const span = document.createElement('span');

        span.className = 'ak-word ak-word-zero';
        span.dataset.akWord = String(word.wordIndex);
        span.dataset.akMotion = word.motionMode;
        span.dataset.akText = word.text;
        span.dataset.akScript =
            word.scriptProfile;

        span.classList.add(
            `ak-script-${word.scriptProfile}`
        );

        if (word.paintMode === 'atomic') {
            span.classList.add(
                'ak-paint-atomic'
            );
        }

        span.style.setProperty(
            '--ak-word-progress',
            '0%'
        );

        span.style.setProperty(
            '--ak-motion-glow',
            '0'
        );

        span.style.setProperty(
            '--ak-atomic-alpha',
            String(ATOMIC_FUTURE_ALPHA)
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
            // Storage may be disabled in the TV client.
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
        const page =
            document.querySelector(
                '.lyricPage'
            );

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

        const signature =
            stableHash(
                lyricSignature(lyrics)
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

    function acceptLyricsPayload(payload, source) {
        const lyrics = normalizeLyricsPayload(payload);
        if (!lyrics) return;

        state.lyrics = lyrics;
        state.generation += 1;
        state.decoratedGeneration = -1;
        selectSongAccent(lyrics);

        // Force atmosphere rediscovery on the next animation pass/song.
        state.atmosphereMediaKey = '';
        state.atmosphereFailedKey = '';

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

        log(`captured ${lyrics.length} lyric lines / ${cueCount} cues from ${source}`);
        queueDecoration();

        if (cueCount === 0) {
            warn('Lyrics loaded without enhanced ELRC cue data.');
        }
    }

    function tryParseJson(text) {
        if (typeof text !== 'string' || !text) return null;
        try {
            return JSON.parse(text);
        } catch {
            return null;
        }
    }

    function installFetchInterceptor() {
        if (typeof window.fetch !== 'function' || window.fetch.__appleKaraokeWrapped) return;
        const originalFetch = window.fetch;

        async function wrappedFetch(input, init) {
            const response = await originalFetch.call(this, input, init);
            try {
                const url = typeof input === 'string' ? input : input && input.url;
                if (isLyricsUrl(url || response.url)) {
                    response.clone().json()
                        .then(data => acceptLyricsPayload(data, 'fetch'))
                        .catch(() => {});
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
                    if (!isLyricsUrl(url)) return;

                    try {
                        let data = null;
                        if (this.responseType === 'json' && this.response && typeof this.response === 'object') {
                            data = this.response;
                        } else if (!this.responseType || this.responseType === 'text') {
                            data = tryParseJson(this.responseText);
                        }
                        if (data) acceptLyricsPayload(data, 'XMLHttpRequest');
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

        const isBackgroundVocal =
            rawText.indexOf(
                BACKGROUND_VOCAL_SENTINEL
            ) === 0;

        return {
            rawText,
            text: isBackgroundVocal
                ? rawText.slice(
                    BACKGROUND_VOCAL_SENTINEL.length
                )
                : rawText,
            positionOffset: isBackgroundVocal
                ? BACKGROUND_VOCAL_SENTINEL.length
                : 0,
            isBackgroundVocal
        };
    }

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
        const textProfile = lyricTextProfile(lyric);
        const rawText = textProfile.rawText;
        const text = textProfile.text;
        const positionOffset = textProfile.positionOffset;
        const isBackgroundVocal =
            textProfile.isBackgroundVocal;
        const rawCues = lyricValue(lyric, 'Cues', 'cues');
        const cues = Array.isArray(rawCues)
            ? rawCues.slice().sort((a, b) =>
                (cueValue(a, 'Position', 'position') || 0) -
                (cueValue(b, 'Position', 'position') || 0))
            : [];

        lineElement.classList.add('ak-enhanced-line');
        lineElement.classList.toggle('ak-word-synced', cues.length > 0);
        lineElement.classList.toggle('ak-line-synced', cues.length === 0);
        lineElement.classList.toggle(
            'ak-background-vocal',
            isBackgroundVocal
        );
        lineElement.classList.remove(
            'ak-has-atomic-script'
        );
        lineElement.dataset.akLineIndex = String(lineIndex);
        lineElement.dataset.akVocalRole =
            isBackgroundVocal
                ? 'background'
                : 'main';
        lineElement.setAttribute(
            'aria-label',
            isBackgroundVocal
                ? `${text} (background vocal)`
                : text
        );
        lineElement.replaceChildren();

        if (!cues.length) {
            lineElement.appendChild(createUntimedSpan(text));
            const bounds = calculateLineBounds(
                lyric,
                lineIndex,
                [],
                [],
                rawText.length
            );
            return {
                element: lineElement,
                lyric,
                cues: [],
                words: [],
                startTicks: bounds.startTicks,
                endTicks: bounds.endTicks,
                isBackgroundVocal
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

        const hasAtomicScript =
            words.some(
                word =>
                    word.paintMode === 'atomic'
            );

        lineElement.classList.toggle(
            'ak-has-atomic-script',
            hasAtomicScript
        );

        /*
         * Render exactly one shaped span per whitespace-delimited word.
         * Spaces/punctuation between words remain normal text spans.
         *
         * This means Malayalam/Devanagari/Latin shaping happens at WORD scope,
         * while cue timing remains available as invisible progress segments.
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

        words.forEach(prepareWordGeometry);

        const bounds = calculateLineBounds(
            lyric,
            lineIndex,
            words,
            cues,
            rawText.length
        );

        return {
            element: lineElement,
            lyric,
            cues: cueRecords,
            words,
            startTicks: bounds.startTicks,
            endTicks: bounds.endTicks,
            isBackgroundVocal
        };
    }

    function decorateExistingLines() {
        if (!state.lyrics || !isLyricsPage()) return false;
        const container = document.querySelector('.lyricsContainer');
        if (!container) return false;

        const lines = Array.from(container.querySelectorAll('.lyricsLine'));
        if (!lines.length) return false;

        const count = Math.min(lines.length, state.lyrics.length);
        state.lineData = [];
        state.atomicWordCount = 0;
        state.scriptProfileCounts = {};
        state.backgroundVocalCount = 0;

        state.tvStockTimingObserved =
            lines.some(line =>
                line.classList.contains(
                    'pastLyric'
                )
                || line.classList.contains(
                    'futureLyric'
                )
            );

        for (let i = 0; i < count; i += 1) {
            const lineRecord =
                decorateLine(
                    lines[i],
                    state.lyrics[i],
                    i
                );

            state.lineData.push(lineRecord);

            if (lineRecord.isBackgroundVocal) {
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

                    if (word.paintMode === 'atomic') {
                        state.atomicWordCount += 1;
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
        resetTvActivationState(false);

        container.classList.add('ak-karaoke-container');

        applyAccentTheme();
        applyPerformanceProfile(false);
        queueMotionGeometryRefresh();

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(queueMotionGeometryRefresh).catch(() => {});
        }

        ensureAnimationLoop();
        return true;
    }

    let decorateTimer = 0;

    function queueDecoration() {
        clearTimeout(decorateTimer);
        decorateTimer = window.setTimeout(() => {
            if (!decorateExistingLines()) {
                clearTimeout(decorateTimer);
                decorateTimer = window.setTimeout(decorateExistingLines, 120);
            }
        }, 0);
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
                || stored === 'tv'
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

        if (isWebOsEnvironment()) {
            return 'tv';
        }

        if (isMobileEnvironment()) {
            return 'mobile';
        }

        const cores =
            Number(
                navigator.hardwareConcurrency
            );

        const memory =
            Number(
                navigator.deviceMemory
            );

        if (
            (
                Number.isFinite(cores)
                && cores > 0
                && cores <= 2
            )
            || (
                Number.isFinite(memory)
                && memory > 0
                && memory <= 2
            )
        ) {
            return 'eco';
        }

        return 'desktop';
    }

    function applyPerformanceClassToPage(page) {
        if (!page) return;

        for (const name of [
            'desktop',
            'mobile',
            'tv',
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
            finishTvCompositorHandoff();
            resetTvActivationState(true);
            state.lastRenderedFrameAt = 0;
        }

        const page =
            document.querySelector(
                '.lyricPage'
            );

        applyPerformanceClassToPage(page);
        applyAccentTheme();

        if (
            state.atmosphereRoot
            && state.atmosphereRoot.isConnected
        ) {
            state.atmosphereRoot.classList.toggle(
                'ak-atmosphere-tv',
                state.performanceProfile === 'tv'
            );
        }

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
            && normalized !== 'tv'
            && normalized !== 'eco'
        ) {
            throw new Error(
                'Performance mode must be: '
                + '"auto", "desktop", "mobile", "tv", or "eco".'
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
            state.performanceProfile === 'tv'
            || state.performanceProfile === 'eco'
        ) {
            return false;
        }

        if (
            state.performanceProfile === 'mobile'
            && glyphCount > 4
        ) {
            return false;
        }

        return true;
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

    function isWebOsEnvironment() {
        const ua =
            String(
                navigator.userAgent || ''
            ).toLowerCase();

        return ua.includes('web0s')
            || ua.includes('webos')
            || ua.includes('netcast');
    }

    function getAtmospherePage() {
        return document.querySelector('.lyricPage');
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
            page.querySelector(
                ':scope > .ak-atmosphere'
            );

        if (old) old.remove();

        const root =
            document.createElement('div');

        root.className = 'ak-atmosphere';
        root.setAttribute('aria-hidden', 'true');
        root.dataset.akMode =
            state.atmosphereMode;

        if (isWebOsEnvironment()) {
            root.classList.add(
                'ak-atmosphere-tv'
            );
        }

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

        root.classList.toggle(
            'ak-atmosphere-tv',
            state.performanceProfile === 'tv'
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

        state.atmosphereMode =
            normalized;

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

    function preloadAtmosphereImage(url) {
        return new Promise(
            (resolve, reject) => {
                const image =
                    new Image();

                image.decoding =
                    'async';

                image.onload =
                    () => resolve(image);

                image.onerror =
                    () => reject(
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
         * Older embedded browsers may not support CanvasRenderingContext2D
         * filters. Multi-stage downsample/upscale creates a smooth light field
         * ONCE per song without leaving a live CSS blur on the GPU.
         */
        const tiny =
            document.createElement(
                'canvas'
            );

        const tinyLong =
            state.performanceProfile === 'desktop'
                ? 38
                : 28;

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
             * Chrome/webOS versions that implement canvas filters get a true
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

        const sequence =
            ++state.atmosphereLoadSeq;

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
    }

    function maybeRefreshAtmosphere(
        media,
        frameNow
    ) {
        const interval =
            (
                state.performanceProfile === 'mobile'
                || state.performanceProfile === 'tv'
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

            root.classList.toggle(
                'ak-atmosphere-tv',
                state.performanceProfile === 'tv'
            );
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

    function getLocalMediaElement() {
        if (
            state.mediaElement
            && state.mediaElement.isConnected
        ) {
            return state.mediaElement;
        }

        const media =
            document.querySelector(
                '.mediaPlayerAudio'
            )
            || document.querySelector(
                '.mediaPlayerVideo'
            )
            || Array.from(
                document.querySelectorAll(
                    'audio,video'
                )
            ).find(
                element =>
                    element.currentSrc
                    || element.src
            )
            || null;

        state.mediaElement =
            media;

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
        if (!state.lyrics || !state.lyrics.length) return -1;

        let low = 0;
        let high = state.lyrics.length - 1;
        let result = -1;

        while (low <= high) {
            const mid = (low + high) >> 1;
            const start = Number(lyricValue(state.lyrics[mid], 'Start', 'start'));

            if (Number.isFinite(start) && start <= ticks) {
                result = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        return result;
    }

    function findActiveLineIndexesAtTicks(
        ticks,
        presentationLine
    ) {
        if (
            presentationLine < 0
            || !state.lineData.length
        ) {
            return [];
        }

        const upper = Math.min(
            presentationLine,
            state.lineData.length - 1
        );

        const active = [];

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

        if (
            !active.includes(presentationLine)
            && presentationLine >= 0
        ) {
            /*
             * Host-delayed TV activation may hold a line for a few frames.
             * Keep that presentation line alive until the synchronized commit.
             */
            active.push(presentationLine);
        }

        active.sort((left, right) => left - right);
        return active;
    }

    function activeLineWordTicks(
        lineIndex,
        presentationLine,
        presentationWordTicks,
        timelineTicks
    ) {
        if (state.performanceProfile !== 'tv') {
            return timelineTicks;
        }

        const lineRecord =
            state.lineData[lineIndex];

        const presentationRecord =
            state.lineData[presentationLine];

        const sharesPresentationStart =
            lineRecord
            && presentationRecord
            && Number(lineRecord.startTicks)
                === Number(
                    presentationRecord.startTicks
                );

        return (
            lineIndex === presentationLine
            || sharesPresentationStart
        )
            ? presentationWordTicks
            : timelineTicks;
    }

    function getJellyfinLineSnapshot() {
        let neutralIndex = -1;
        let neutralCount = 0;
        let phasedCount = 0;

        for (
            let index = 0;
            index < state.lineData.length;
            index += 1
        ) {
            const element =
                state.lineData[index].element;

            const phased =
                element.classList.contains(
                    'pastLyric'
                )
                || element.classList.contains(
                    'futureLyric'
                );

            if (phased) {
                phasedCount += 1;
            } else {
                neutralIndex = index;
                neutralCount += 1;
            }
        }

        if (phasedCount > 0) {
            state.tvStockTimingObserved = true;
        }

        return {
            index:
                neutralCount === 1
                    ? neutralIndex
                    : -1,
            neutralCount,
            phasedCount
        };
    }

    function getJellyfinActiveLineIndex() {
        for (
            let index = 0;
            index < state.lineData.length;
            index += 1
        ) {
            const element =
                state.lineData[index].element;

            if (
                !element.classList.contains(
                    'pastLyric'
                )
                && !element.classList.contains(
                    'futureLyric'
                )
            ) {
                return index;
            }
        }

        return -1;
    }

    function resetTvActivationState(
        forceTimingCommit = false
    ) {
        state.tvTimingLine = -1;
        state.tvPresentationLine = -999;
        state.tvPendingLine = -1;
        state.tvPendingSince = 0;
        state.tvPendingHostFrames = 0;
        state.tvHostLine = -1;
        state.tvHostSignalAt = 0;
        state.tvLastHostPollAt = 0;
        state.tvFocusedLine = -1;
        state.tvArmUntil = 0;
        state.tvVisualTicks = 0;
        state.tvVisualFrameAt = 0;
        state.tvVisualDebtMs = 0;
        state.tvLastActivationWaitMs = 0;
        state.tvActivationSource =
            forceTimingCommit
                ? 'clock-reset'
                : 'initial';
        state.tvForceTimingCommit =
            !!forceTimingCommit;

        if (!forceTimingCommit) {
            state.tvActivationFallbacks = 0;
        }
    }

    function findEnhancedLyricLine(
        target
    ) {
        let element = target;

        while (
            element
            && element !== document.documentElement
        ) {
            if (
                element.classList
                && element.classList.contains(
                    'lyricsLine'
                )
                && element.classList.contains(
                    'ak-enhanced-line'
                )
            ) {
                return element;
            }

            element = element.parentElement;
        }

        return null;
    }

    function handleTvLyricFocus(
        event
    ) {
        if (
            state.performanceProfile !== 'tv'
        ) {
            return;
        }

        const element =
            findEnhancedLyricLine(
                event && event.target
            );

        if (!element) {
            state.tvFocusedLine = -1;
            return;
        }

        const lineIndex =
            Number(
                element.dataset.akLineIndex
            );

        if (
            !Number.isInteger(lineIndex)
            || lineIndex < 0
            || lineIndex >= state.lineData.length
        ) {
            return;
        }

        state.tvFocusedLine = lineIndex;

        const hostCurrent =
            !element.classList.contains(
                'pastLyric'
            )
            && !element.classList.contains(
                'futureLyric'
            );

        if (!hostCurrent) {
            return;
        }

        state.tvStockTimingObserved = true;
        state.tvHostLine = lineIndex;
        state.tvHostSignalAt =
            performance.now();

        wakeAnimationLoop();
    }

    function firstTimedTickForLine(
        lineIndex
    ) {
        const line =
            state.lineData[lineIndex];

        let first = Infinity;

        if (line) {
            (line.words || [])
                .forEach(word => {
                    if (
                        Number.isFinite(word.start)
                        && word.start < first
                    ) {
                        first = word.start;
                    }
                });
        }

        if (Number.isFinite(first)) {
            return first;
        }

        const lyric =
            state.lyrics
            && state.lyrics[lineIndex];

        const lineStart =
            Number(
                lyricValue(
                    lyric,
                    'Start',
                    'start'
                )
            );

        return Number.isFinite(lineStart)
            ? lineStart
            : 0;
    }

    function commitTvPresentationLine(
        lineIndex,
        timelineTicks,
        frameNow,
        source,
        armWipe
    ) {
        const waited =
            state.tvPendingSince > 0
                ? Math.max(
                    0,
                    frameNow
                        - state.tvPendingSince
                )
                : 0;

        state.tvPresentationLine = lineIndex;
        state.tvPendingLine = -1;
        state.tvPendingSince = 0;
        state.tvPendingHostFrames = 0;
        state.tvLastActivationWaitMs =
            Math.round(waited * 10) / 10;
        state.tvActivationSource = source;
        state.tvForceTimingCommit = false;

        const canArm =
            armWipe
            && lineIndex >= 0
            && state.timedCueCount > 0;

        state.tvArmUntil =
            canArm
                ? frameNow + TV_FOCUS_ARM_MS
                : 0;

        state.tvVisualTicks =
            canArm
                ? Math.min(
                    timelineTicks,
                    firstTimedTickForLine(
                        lineIndex
                    )
                )
                : timelineTicks;

        state.tvVisualFrameAt = frameNow;
        state.tvVisualDebtMs =
            Math.max(
                0,
                (
                    timelineTicks
                    - state.tvVisualTicks
                )
                / 10000
            );
    }

    function advanceTvVisualTicks(
        timelineTicks,
        frameNow,
        media
    ) {
        if (
            !Number.isFinite(
                state.tvVisualTicks
            )
        ) {
            state.tvVisualTicks =
                timelineTicks;
        }

        if (
            timelineTicks
                < state.tvVisualTicks
        ) {
            state.tvVisualTicks =
                timelineTicks;
        }

        if (
            frameNow < state.tvArmUntil
        ) {
            state.tvVisualFrameAt = frameNow;
            state.tvVisualDebtMs =
                Math.max(
                    0,
                    (
                        timelineTicks
                        - state.tvVisualTicks
                    )
                    / 10000
                );

            return state.tvVisualTicks;
        }

        let elapsed =
            frameNow
            - state.tvVisualFrameAt;

        state.tvVisualFrameAt = frameNow;

        if (
            !Number.isFinite(elapsed)
            || elapsed < 0
        ) {
            elapsed = 0;
        }

        elapsed = Math.min(elapsed, 64);

        if (
            !media
            || media.paused
            || media.seeking
            || state.playbackClockSuspended
        ) {
            state.tvVisualDebtMs =
                Math.max(
                    0,
                    (
                        timelineTicks
                        - state.tvVisualTicks
                    )
                    / 10000
                );

            return state.tvVisualTicks;
        }

        const rateValue =
            Number(media.playbackRate);

        const playbackRate =
            Number.isFinite(rateValue)
            && rateValue > 0
                ? rateValue
                : 1;

        const advance =
            elapsed
            / 1000
            * TICKS_PER_SECOND
            * playbackRate
            * TV_VISUAL_CATCHUP_RATE;

        state.tvVisualTicks =
            Math.min(
                timelineTicks,
                state.tvVisualTicks
                    + advance
            );

        state.tvVisualDebtMs =
            Math.max(
                0,
                (
                    timelineTicks
                    - state.tvVisualTicks
                )
                / 10000
            );

        if (state.tvVisualDebtMs < 0.5) {
            state.tvVisualTicks =
                timelineTicks;
            state.tvVisualDebtMs = 0;
        }

        return state.tvVisualTicks;
    }

    function resolveTvLineActivation(
        timingLine,
        timelineTicks,
        frameNow,
        media
    ) {
        state.tvTimingLine = timingLine;

        /*
         * The focus event carries ordinary host changes. Avoid walking every
         * lyric at 60fps; inspect stock classes only during initialization or
         * while the projected and presented lines disagree.
         */
        if (
            state.tvPresentationLine !== -999
            && !state.tvForceTimingCommit
            && timingLine
                === state.tvPresentationLine
        ) {
            state.tvPendingLine = -1;
            state.tvPendingSince = 0;
            state.tvPendingHostFrames = 0;

            return {
                activeLine:
                    state.tvPresentationLine,
                wordTicks:
                    advanceTvVisualTicks(
                        timelineTicks,
                        frameNow,
                        media
                    )
            };
        }

        const focusSignalMatches =
            state.tvHostLine === timingLine
            && state.tvFocusedLine
                === timingLine;

        let snapshot = {
            index:
                focusSignalMatches
                    ? timingLine
                    : state.tvHostLine,
            neutralCount: 0,
            phasedCount: 0
        };

        const pollHostClasses =
            !focusSignalMatches
            && !state.tvForceTimingCommit
            && (
                state.tvPresentationLine === -999
                || state.tvPendingLine
                    !== timingLine
                || frameNow
                    - state.tvLastHostPollAt
                    >= TV_HOST_POLL_INTERVAL_MS
            );

        if (pollHostClasses) {
            snapshot =
                getJellyfinLineSnapshot();

            state.tvLastHostPollAt =
                frameNow;
        }

        if (snapshot.index >= 0) {
            if (
                state.tvHostLine
                    !== snapshot.index
            ) {
                state.tvHostSignalAt =
                    frameNow;
            }

            state.tvHostLine =
                snapshot.index;
        }

        if (
            state.tvPresentationLine === -999
        ) {
            let initialLine = timingLine;
            let source =
                state.tvForceTimingCommit
                    ? 'clock-reset'
                    : 'initial-timing';

            if (
                !state.tvForceTimingCommit
                && timingLine >= 0
                && snapshot.index >= 0
                && Math.abs(
                    snapshot.index
                        - timingLine
                ) <= 1
            ) {
                initialLine = snapshot.index;
                source = 'initial-host';
            }

            commitTvPresentationLine(
                initialLine,
                timelineTicks,
                frameNow,
                source,
                false
            );
        }

        if (state.tvForceTimingCommit) {
            commitTvPresentationLine(
                timingLine,
                timelineTicks,
                frameNow,
                'clock-reset',
                false
            );
        }

        if (
            timingLine
                === state.tvPresentationLine
        ) {
            state.tvPendingLine = -1;
            state.tvPendingSince = 0;
            state.tvPendingHostFrames = 0;

            return {
                activeLine:
                    state.tvPresentationLine,
                wordTicks:
                    advanceTvVisualTicks(
                        timelineTicks,
                        frameNow,
                        media
                    )
            };
        }

        const adjacentForward =
            timingLine
                === state.tvPresentationLine + 1;

        if (!adjacentForward) {
            commitTvPresentationLine(
                timingLine,
                timelineTicks,
                frameNow,
                'timing-jump',
                false
            );

            return {
                activeLine: timingLine,
                wordTicks: timelineTicks
            };
        }

        if (
            state.tvPendingLine
                !== timingLine
        ) {
            state.tvPendingLine = timingLine;
            state.tvPendingSince = frameNow;
            state.tvPendingHostFrames = 0;
        }

        const hostMatches =
            snapshot.index === timingLine;

        const focusMatches =
            state.tvFocusedLine === timingLine;

        if (hostMatches && focusMatches) {
            commitTvPresentationLine(
                timingLine,
                timelineTicks,
                frameNow,
                'host-focus',
                true
            );
        } else if (hostMatches) {
            state.tvPendingHostFrames += 1;

            if (
                state.tvPendingHostFrames >= 2
            ) {
                commitTvPresentationLine(
                    timingLine,
                    timelineTicks,
                    frameNow,
                    'host-class',
                    true
                );
            }
        } else {
            state.tvPendingHostFrames = 0;
        }

        if (
            state.tvPresentationLine
                !== timingLine
            && !state.tvStockTimingObserved
        ) {
            commitTvPresentationLine(
                timingLine,
                timelineTicks,
                frameNow,
                'timing-no-host',
                true
            );
        }

        const playbackHeld =
            !media
            || media.paused
            || media.seeking
            || state.playbackClockSuspended;

        if (
            state.tvPresentationLine
                !== timingLine
            && !playbackHeld
            && frameNow
                - state.tvPendingSince
                >= TV_HOST_MAX_WAIT_MS
        ) {
            state.tvActivationFallbacks += 1;

            commitTvPresentationLine(
                timingLine,
                timelineTicks,
                frameNow,
                'host-timeout',
                true
            );
        } else if (
            state.tvPresentationLine
                !== timingLine
            && playbackHeld
        ) {
            state.tvPendingSince = frameNow;
        }

        if (
            state.tvPresentationLine
                === timingLine
        ) {
            return {
                activeLine: timingLine,
                wordTicks:
                    advanceTvVisualTicks(
                        timelineTicks,
                        frameNow,
                        media
                    )
            };
        }

        return {
            activeLine:
                state.tvPresentationLine,
            wordTicks: timelineTicks
        };
    }

    function resetPlaybackClock(
        media = null,
        frameNow = performance.now()
    ) {
        const mediaChanged =
            state.playbackClockMedia !== media;

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

        if (mediaChanged) {
            resetTvActivationState(true);
        }
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

                if (allowRegression) {
                    resetTvActivationState(true);
                }
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

        if (!startOffset) return rawTicks;

        /*
         * When transcoding starts at a non-zero point, Jellyfin may keep the
         * original timeline offset outside the HTML media element. Compare the
         * raw and offset candidates with Jellyfin's own active line and pick
         * whichever agrees with Jellyfin.
         */
        const jellyIndex = getJellyfinActiveLineIndex();

        if (jellyIndex >= 0) {
            const rawIndex = findLineIndexAtTicks(rawTicks);
            const offsetIndex = findLineIndexAtTicks(rawTicks + startOffset);

            if (offsetIndex === jellyIndex && rawIndex !== jellyIndex) {
                return rawTicks + startOffset;
            }

            if (rawIndex === jellyIndex) return rawTicks;
        }

        return rawTicks + startOffset;
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
            state.performanceProfile === 'tv'
            || state.performanceProfile === 'eco'
        ) {
            return 48;
        }

        return state.performanceProfile === 'mobile'
            ? 56
            : 64;
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

        /* Joined scripts use the same bloom shape at gentler colored energy. */
        if (word && word.paintMode === 'atomic') {
            core *= 0.76;
            halo *= 0.70;
        }

        if (
            state.performanceProfile === 'tv'
            || state.performanceProfile === 'eco'
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

        if (word.paintMode === 'atomic') {
            /* Never transform a joined shaping unit: it can expose seams. */
            if (!word._akAtomicTransformCleared) {
                word.element.style.transform = '';
                word._akAtomicTransformCleared = true;
            }
        } else {
            word._akAtomicTransformCleared = false;
            word.element.style.transform =
                `translate3d(0, ${yEm.toFixed(4)}em, 0) `
                + `scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, 1)`;
        }

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

        if (word.paintMode === 'atomic') {
            if (!word._akAtomicTransformCleared) {
                word.element.style.transform = '';
                word._akAtomicTransformCleared = true;
            }
        } else {
            word._akAtomicTransformCleared = false;
            word.element.style.transform =
                `translate3d(0, ${lift.toFixed(4)}em, 0)`;
        }

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
        word._akAtomicTransformCleared = false;
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
            state.performanceProfile === 'tv'
            || state.performanceProfile === 'eco'
        ) {
            /*
             * One update per visible CSS pixel is smooth at TV distance and
             * avoids repainting a text gradient for sub-pixel changes that the
             * panel cannot show.
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
                state.performanceProfile === 'tv'
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

        if (word.paintMode === 'atomic') {
            const atomicSteps =
                state.performanceProfile === 'tv'
                || state.performanceProfile === 'eco'
                    ? 48
                    : 64;

            const atomicAlpha =
                Math.round(
                    (
                        ATOMIC_FUTURE_ALPHA
                        + (1 - ATOMIC_FUTURE_ALPHA)
                            * easeMotion(painted)
                    )
                    * atomicSteps
                )
                / atomicSteps;

            if (
                word._akAtomicAlphaBucket
                !== atomicAlpha
            ) {
                word._akAtomicAlphaBucket =
                    atomicAlpha;

                word.element.style.setProperty(
                    '--ak-atomic-alpha',
                    atomicAlpha.toFixed(4)
                );
            }
        } else if (
            word._akProgressBucket
            !== progressBucket
        ) {
            word._akProgressBucket =
                progressBucket;

            word.element.style.setProperty(
                '--ak-word-progress',
                `${progressBucket.toFixed(
                    state.performanceProfile === 'tv'
                    || state.performanceProfile === 'eco'
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

            if (word.paintMode === 'atomic') {
                word._akAtomicAlphaBucket = 1;
                word.element.style.setProperty(
                    '--ak-atomic-alpha',
                    '1'
                );
            }

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

            if (word.paintMode === 'atomic') {
                word._akAtomicAlphaBucket =
                    ATOMIC_FUTURE_ALPHA;
                word.element.style.setProperty(
                    '--ak-atomic-alpha',
                    String(ATOMIC_FUTURE_ALPHA)
                );
            }

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

    function finishTvCompositorHandoff() {
        const lineIndex =
            state.tvHandoffLineIndex;

        if (
            lineIndex < 0
            || lineIndex
                >= state.lineData.length
        ) {
            state.tvHandoffLineIndex = -1;
            state.tvHandoffUntil = 0;
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

        state.tvHandoffLineIndex = -1;
        state.tvHandoffUntil = 0;
    }

    function beginTvCompositorHandoff(
        lineIndex,
        ticks,
        frameNow
    ) {
        if (state.tvHandoffLineIndex >= 0) {
            finishTvCompositorHandoff();
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

        state.tvHandoffLineIndex =
            lineIndex;

        state.tvHandoffUntil =
            frameNow
            + TV_COMPOSITOR_HANDOFF_MS;
    }

    function lineDistanceBand(
        lineIndex,
        activeLine
    ) {
        if (activeLine < 0) return 'far';

        const distance =
            Math.abs(
                lineIndex - activeLine
            );

        if (distance === 0) return 'current';
        if (distance === 1) return 'near';
        if (distance === 2) return 'near2';
        if (distance >= 5) return 'far';
        return 'middle';
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
            const tvCarry =
                lineIndex
                    === state.tvHandoffLineIndex
                && frameNow
                    < state.tvHandoffUntil;

            const dynamicCarry =
                state.performanceProfile !== 'tv'
                && state.performanceProfile !== 'eco'
                && activeLines.some(
                    index => lineIndex === index - 1
                );

            words.forEach(word => {
                const keep =
                    (
                        tvCarry
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

        const tvProfile =
            state.performanceProfile === 'tv'
            || state.performanceProfile === 'eco';

        const removedActiveLines =
            state.activeLineIndexes.filter(
                index => !activeLines.includes(index)
            );

        const naturalTransition =
            previous >= 0
            && activeLine >= 0
            && Math.abs(activeLine - previous) <= 1;

        if (
            tvProfile
            && !sequential
            && state.tvHandoffLineIndex >= 0
        ) {
            finishTvCompositorHandoff();
        }

        if (
            tvProfile
            && naturalTransition
            && removedActiveLines.length
        ) {
            beginTvCompositorHandoff(
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

        if (!tvProfile) {
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
            state.performanceProfile === 'tv'
            || state.performanceProfile === 'eco'
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

    function scheduleNextFrame(
        media,
        immediate = false
    ) {
        if (immediate) {
            state.forceNextFrame = true;
        }

        if (
            state.rafId
            || state.frameTimer
        ) {
            return;
        }

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

                state.rafId =
                    requestAnimationFrame(
                        renderFrame
                    );
            }, delay);
    }

    function wakeAnimationLoop() {
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

            const replayFromBeginning =
                (
                    type === 'play'
                    || type === 'playing'
                )
                && (
                    Number(media.currentTime)
                    || 0
                ) < 0.75;

            if (
                type === 'seeking'
                || type === 'seeked'
                || type === 'loadedmetadata'
                || type === 'emptied'
                || replayFromBeginning
            ) {
                resetTvActivationState(true);
                state.lastActiveLine = -999;
                state.lastActiveLineSignature = '';
                state.activeLineIndexes = [];
            }

            if (type !== 'timeupdate') {
                resetPlaybackClock(
                    media,
                    performance.now()
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

        if (
            !state.lyrics
            || !state.lineData.length
            || !isLyricsPage()
        ) {
            scheduleNextFrame(
                state.mediaElement,
                false
            );
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

            scheduleNextFrame(
                null,
                false
            );
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

        if (
            state.tvHandoffLineIndex >= 0
            && frameNow
                >= state.tvHandoffUntil
        ) {
            finishTvCompositorHandoff();
        }

        const timingLine =
            findLineIndexAtTicks(
                ticks
            );

        const tvActivation =
            state.performanceProfile === 'tv'
                ? resolveTvLineActivation(
                    timingLine,
                    ticks,
                    frameNow,
                    media
                )
                : {
                    activeLine: timingLine,
                    wordTicks: ticks
                };

        const activeLine =
            tvActivation.activeLine;

        const wordTicks =
            tvActivation.wordTicks;

        const activeLines =
            findActiveLineIndexesAtTicks(
                ticks,
                activeLine
            );

        const activeLineSignature =
            activeLines.join(',');

        if (
            activeLine
            !== state.lastActiveLine
            || activeLineSignature
                !== state.lastActiveLineSignature
        ) {
            syncStaticLineStates(
                activeLine,
                activeLines,
                ticks,
                frameNow
            );

            state.lastActiveLineSignature =
                activeLineSignature;
        }

        state.activeLineIndexes =
            activeLines.slice();

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
        scheduleNextFrame(
            state.mediaElement,
            true
        );
    }


    function installDomObserver() {
        const observer = new MutationObserver(mutations => {
            let shouldDecorate = false;

            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    shouldDecorate = true;
                    break;
                }
            }

            if (shouldDecorate && state.lyrics && isLyricsPage()) {
                const container = document.querySelector('.lyricsContainer');
                const lines = container
                    ? container.querySelectorAll('.lyricsLine')
                    : [];

                const needsDecoration =
                    state.decoratedGeneration !== state.generation
                    || Array.from(lines)
                        .some(line => !line.classList.contains('ak-enhanced-line'));

                if (needsDecoration) queueDecoration();
            }
        });

        const start = () => observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        if (document.documentElement) start();
        else document.addEventListener('DOMContentLoaded', start, { once: true });
    }

    function installRouteHooks() {
        window.addEventListener('hashchange', () => {
            if (isLyricsPage()) {
                queueDecoration();
                state.atmosphereMediaKey = '';
                state.lastActiveLine = -999;
                state.lastActiveLineSignature = '';
                state.activeLineIndexes = [];
                resetTvActivationState(true);
                wakeAnimationLoop();
            }
        });

        window.addEventListener(
            'resize',
            queueMotionGeometryRefresh,
            { passive: true }
        );

        document.addEventListener(
            'visibilitychange',
            wakeAnimationLoop,
            { passive: true }
        );

        /*
         * Jellyfin TV renders lyric lines as focused buttons. Capture that
         * host focus synchronously without observing layout or polling every
         * lyric on every animation frame.
         */
        document.addEventListener(
            'focus',
            handleTvLyricFocus,
            true
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
    ensureAnimationLoop();

    const publicApi = Object.freeze({
        version: VERSION,
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
                    state.performanceProfile
                        === 'desktop'
                        ? 'full'
                        : (
                            state.performanceProfile
                                === 'mobile'
                                ? 'short-words-only'
                                : 'whole-word'
                        ),
                playbackClock:
                    'phase-locked-monotonic',
                tvLineActivation:
                    'host-focus-synchronized',
                tvGlowRenderer:
                    'classic-bloom-prepainted-core+halo',
                rafTargetGate: true,
                skippedRafFrames:
                    state.skippedRafFrames
            };
        },
        setAtmosphere: setAtmosphereMode,
        atmosphere() {
            return {
                mode: state.atmosphereMode,
                artwork: state.atmosphereArtwork,
                source: state.atmosphereSource,
                colors: state.atmosphereColors
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
                mediaFound: !!media,
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
                    'invisible-elrc-role-sentinel',
                effectModel: 'phase-locked-motion+classic-bloom-v3.1',
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
                tvLineActivation:
                    'host-focus-synchronized-two-stage',
                tvTimingLine:
                    state.tvTimingLine,
                tvHostLine:
                    state.tvHostLine,
                tvFocusedLine:
                    state.tvFocusedLine,
                tvPresentationLine:
                    state.tvPresentationLine === -999
                        ? null
                        : state.tvPresentationLine,
                tvPendingLine:
                    state.tvPendingLine,
                tvActivationSource:
                    state.tvActivationSource,
                tvActivationWaitMs:
                    state.tvLastActivationWaitMs,
                tvPendingWaitMs:
                    state.tvPendingSince > 0
                        ? Number(
                            Math.max(
                                0,
                                performance.now()
                                    - state.tvPendingSince
                            ).toFixed(1)
                        )
                        : 0,
                tvActivationFallbacks:
                    state.tvActivationFallbacks,
                tvFocusArmMs:
                    TV_FOCUS_ARM_MS,
                tvFocusArmRemainingMs:
                    Math.max(
                        0,
                        Math.round(
                            state.tvArmUntil
                                - performance.now()
                        )
                    ),
                tvHostMaxWaitMs:
                    TV_HOST_MAX_WAIT_MS,
                tvHostPollIntervalMs:
                    TV_HOST_POLL_INTERVAL_MS,
                tvHostSignalAgeMs:
                    state.tvHostSignalAt > 0
                        ? Number(
                            Math.max(
                                0,
                                performance.now()
                                    - state.tvHostSignalAt
                            ).toFixed(1)
                        )
                        : null,
                tvVisualCatchupRate:
                    TV_VISUAL_CATCHUP_RATE,
                tvVisualDebtMs:
                    Number(
                        state.tvVisualDebtMs
                            .toFixed(1)
                    ),
                tvStockTimingObserved:
                    state.tvStockTimingObserved,
                tvWordLookaheadMs:
                    state.performanceProfile === 'tv'
                        ? 0
                        : WORD_RENDER_LOOKAHEAD_TICKS
                            / 10000,
                tvGlowRenderer:
                    'classic-bloom-prepainted-core+halo',
                tvPerFrameFilterRebuild: false,
                tvPixelQuantizedWipe: true,
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
                tvCompositorHandoffMs:
                    TV_COMPOSITOR_HANDOFF_MS,
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
                atmosphereTvAware: true,
                geometryAwareSwipe: true,
                connectedScriptPaint:
                    'atomic-uniform-luminance',
                atomicWordCount:
                    state.atomicWordCount,
                scriptProfileCounts:
                    Object.assign(
                        {},
                        state.scriptProfileCounts
                    ),
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
