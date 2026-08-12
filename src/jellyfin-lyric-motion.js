/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Jellyfin LyricMotion — unofficial Jellyfin Web lyrics enhancement.
 */
(function () {
    'use strict';

    const VERSION = '2.0.0';
    const TICKS_PER_SECOND = 10000000;

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
    const ZERO_PROGRESS_EPSILON = 0.0025;

    /*
     * User-requested premium glow palette.
     *
     * IMPORTANT:
     * These colors are used ONLY by the glyph-shaped shadow produced by the
     * am-lyrics-style grow animation. The lyric text and lyric wipe stay white.
     */
    const ACCENT_STORAGE_KEY = 'appleKaraokePremiumAccent';

    const PREMIUM_ACCENTS = Object.freeze([
        { id: 'champagne-gold', name: 'Champagne Gold', rgb: '255, 195, 92', gain: 1.00 },
        { id: 'royal-purple', name: 'Royal Purple', rgb: '184, 116, 255', gain: 0.94 },
        { id: 'sapphire', name: 'Sapphire Blue', rgb: '92, 166, 255', gain: 0.90 },
        { id: 'arctic-cyan', name: 'Arctic Cyan', rgb: '82, 224, 242', gain: 0.82 },
        { id: 'neon-rose', name: 'Neon Rose', rgb: '255, 112, 158', gain: 0.91 },
        { id: 'emerald', name: 'Emerald', rgb: '88, 224, 164', gain: 0.84 },
        { id: 'amber', name: 'Amber', rgb: '255, 154, 72', gain: 0.94 },
        { id: 'electric-violet', name: 'Electric Violet', rgb: '143, 119, 255', gain: 0.94 },
        { id: 'ice-blue', name: 'Ice Blue', rgb: '142, 214, 255', gain: 0.86 },
        { id: 'ruby', name: 'Ruby', rgb: '255, 86, 112', gain: 0.93 },
        { id: 'magenta', name: 'Magenta', rgb: '246, 101, 226', gain: 0.90 },
        { id: 'aqua', name: 'Aqua', rgb: '72, 232, 211', gain: 0.82 }
    ]);
    const ROUTE_RE = /(?:^|[#/])lyrics(?:[/?#]|$)/i;

    const state = {
        lyrics: null,
        generation: 0,
        decoratedGeneration: -1,
        lineData: [],
        rafId: 0,
        lastMediaWarning: 0,
        geometryTimer: 0,
        accentMode: 'song',
        accent: PREMIUM_ACCENTS[0]
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


    function getGraphemeBoundaries(text) {
        const boundaries = [0];

        if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
            try {
                const segmenter = new Intl.Segmenter(undefined, {
                    granularity: 'grapheme'
                });

                for (const segment of segmenter.segment(text)) {
                    const end = segment.index + segment.segment.length;
                    if (end > boundaries[boundaries.length - 1]) {
                        boundaries.push(end);
                    }
                }

                if (boundaries[boundaries.length - 1] !== text.length) {
                    boundaries.push(text.length);
                }

                return boundaries;
            } catch {
                // Fall through to code-point boundaries.
            }
        }

        let index = 0;
        for (const char of text) {
            index += char.length;
            boundaries.push(index);
        }

        return boundaries;
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

                const start = cueRecordStart(record);
                const end = cueEndTicks(
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

            return {
                wordIndex,
                text: range.text,
                startPos: range.start,
                endPos: range.end,
                length: wordLength,
                segments,
                start,
                end,
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

        if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
            try {
                const segmenter = new Intl.Segmenter(undefined, {
                    granularity: 'grapheme'
                });

                return Array.from(segmenter.segment(word.text))
                    .filter(segment => /\S/u.test(segment.segment))
                    .length;
            } catch {
                // Fall through.
            }
        }

        return Array.from(word.text.replace(/\s+/gu, '')).length;
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

        if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
            try {
                const segmenter = new Intl.Segmenter(undefined, {
                    granularity: 'grapheme'
                });

                for (const segment of segmenter.segment(text)) {
                    ranges.push({
                        start: segment.index,
                        end: segment.index + segment.segment.length,
                        text: segment.segment
                    });
                }

                return ranges;
            } catch {
                // Fall through.
            }
        }

        let offset = 0;
        for (const char of text) {
            ranges.push({
                start: offset,
                end: offset + char.length,
                text: char
            });
            offset += char.length;
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
            range.detach?.();
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

        word.motionGlyphs = [];
        word.wholeMotion = null;
    }

    function prepareWordGeometry(word) {
        if (!word || !word.element || !word.segments.length) return;

        clearMotionLayer(word);

        const textNode = Array.from(word.element.childNodes)
            .find(node => node.nodeType === Node.TEXT_NODE);

        if (!textNode) return;

        const fullWidth =
            getPrefixWidth(textNode, textNode.length)
            || word.element.getBoundingClientRect().width;

        if (fullWidth > 0) {
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
        if (!canUseLatinGlyphOverlay(word.text)) {
            word.element.classList.add('ak-motion-whole');
            word.wholeMotion =
                computeGlyphMotionMetrics(
                    word,
                    Math.floor(glyphCount / 2),
                    glyphCount
                );
            return;
        }

        const wordRect =
            word.element.getBoundingClientRect();

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
                glyph.textContent = rangeInfo.text;

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
                range.detach?.();
            }
        });

        if (glyphs.length) {
            word.element.appendChild(layer);
            word.motionGlyphs = glyphs;
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
            return localStorage.getItem(ACCENT_STORAGE_KEY) || 'song';
        } catch {
            return 'song';
        }
    }

    function findAccent(id) {
        return PREMIUM_ACCENTS.find(
            accent => accent.id === id
        ) || null;
    }

    function selectSongAccent(lyrics) {
        const mode = readAccentMode();

        if (mode === 'off') {
            state.accentMode = 'off';
            state.accent = {
                id: 'off',
                name: 'Off',
                rgb: '255, 255, 255',
                gain: 0
            };
            return;
        }

        if (mode !== 'song') {
            const forced = findAccent(mode);

            if (forced) {
                state.accentMode = mode;
                state.accent = forced;
                return;
            }
        }

        const signature = lyricSignature(lyrics);
        const index =
            stableHash(signature)
            % PREMIUM_ACCENTS.length;

        state.accentMode = 'song';
        state.accent = PREMIUM_ACCENTS[index];
    }

    function setAccentMode(mode) {
        const normalized =
            String(mode || '')
                .trim()
                .toLowerCase();

        if (
            normalized !== 'song'
            && normalized !== 'off'
            && !findAccent(normalized)
        ) {
            throw new Error(
                `Unknown accent "${mode}". Use "song", "off", or: `
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

        if (state.lyrics) {
            selectSongAccent(state.lyrics);
        } else {
            state.accentMode = normalized;

            if (normalized === 'off') {
                state.accent = {
                    id: 'off',
                    name: 'Off',
                    rgb: '255, 255, 255',
                    gain: 0
                };
            } else if (normalized !== 'song') {
                state.accent =
                    findAccent(normalized)
                    || PREMIUM_ACCENTS[0];
            }
        }

        return {
            mode: state.accentMode,
            accent: state.accent.id,
            name: state.accent.name
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

        const cueCount = lyrics.reduce((total, lyric) => {
            const cues = lyricValue(lyric, 'Cues', 'cues');
            return total + (Array.isArray(cues) ? cues.length : 0);
        }, 0);

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
        span.className = 'ak-untimed';
        return setText(span, text);
    }

    function decorateLine(lineElement, lyric, lineIndex) {
        const text = String(lyricValue(lyric, 'Text', 'text') || '');
        const rawCues = lyricValue(lyric, 'Cues', 'cues');
        const cues = Array.isArray(rawCues)
            ? rawCues.slice().sort((a, b) =>
                (cueValue(a, 'Position', 'position') || 0) -
                (cueValue(b, 'Position', 'position') || 0))
            : [];

        lineElement.classList.add('ak-enhanced-line');
        lineElement.classList.toggle('ak-word-synced', cues.length > 0);
        lineElement.classList.toggle('ak-line-synced', cues.length === 0);
        lineElement.dataset.akLineIndex = String(lineIndex);
        lineElement.setAttribute('aria-label', text);
        lineElement.replaceChildren();

        if (!cues.length) {
            lineElement.appendChild(createUntimedSpan(text));
            return {
                element: lineElement,
                lyric,
                cues: [],
                words: []
            };
        }

        const graphemeBoundaries = getGraphemeBoundaries(text);
        const cueRecords = [];
        let cursor = 0;

        cues.forEach((cue, cueIndex) => {
            let startPos = Number(cueValue(cue, 'Position', 'position'));
            let endPos = Number(cueValue(cue, 'EndPosition', 'endPosition'));

            if (!Number.isFinite(startPos)) startPos = cursor;
            if (!Number.isFinite(endPos)) endPos = startPos;

            startPos = Math.max(cursor, Math.min(text.length, startPos));
            endPos = Math.max(startPos, Math.min(text.length, endPos));

            startPos = snapBoundary(graphemeBoundaries, startPos, 'backward');
            startPos = Math.max(cursor, startPos);
            endPos = snapBoundary(graphemeBoundaries, endPos, 'forward');
            endPos = Math.max(startPos, Math.min(text.length, endPos));

            if (endPos > startPos) {
                cueRecords.push({
                    cue,
                    cueIndex,
                    startPos,
                    endPos
                });
            }

            cursor = endPos;
        });

        const words = buildWordRecords(text, lineIndex, cueRecords);
        classifyWordMotion(words);

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

        return {
            element: lineElement,
            lyric,
            cues: cueRecords,
            words
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

        for (let i = 0; i < count; i += 1) {
            state.lineData.push(decorateLine(lines[i], state.lyrics[i], i));
        }

        state.decoratedGeneration = state.generation;
        container.classList.add('ak-karaoke-container');
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

    function getLocalMediaElement() {
        return document.querySelector('.mediaPlayerAudio')
            || document.querySelector('.mediaPlayerVideo')
            || Array.from(document.querySelectorAll('audio,video'))
                .find(el => !el.paused || el.currentTime > 0)
            || null;
    }

    function getStartTimeTicksFromUrl(media) {
        try {
            const src = media.currentSrc || media.src;
            if (!src) return 0;
            const url = new URL(src, location.href);
            const value = url.searchParams.get('StartTimeTicks')
                || url.searchParams.get('startTimeTicks');
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : 0;
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

    function getJellyfinActiveLineIndex() {
        for (let i = 0; i < state.lineData.length; i += 1) {
            const el = state.lineData[i].element;
            if (!el.classList.contains('pastLyric')
                && !el.classList.contains('futureLyric')) {
                return i;
            }
        }
        return -1;
    }

    function chooseTimelineTicks(media) {
        const rawTicks = Math.max(0, media.currentTime || 0) * TICKS_PER_SECOND;
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

        const nextCue = cues[cueIndex + 1] && cues[cueIndex + 1].cue;
        const nextStart = Number(cueValue(nextCue, 'Start', 'start'));
        if (Number.isFinite(nextStart)) return nextStart;

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
            && timelineTicks >= word.end
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

            const accent =
                currentAccent();

            const alpha =
                clamp01(
                    metrics.shadowIntensity
                    * phase.peak
                    * accent.gain
                    * continuityGain
                );

            glyph.style.transform =
                `translate3d(${xEm.toFixed(4)}em, ${yEm.toFixed(4)}em, 0) `
                + `scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, 1)`;

            /*
             * Premium glow:
             * - tight WHITE inner sparkle preserves the Apple-like core
             * - medium + outer SONG COLOR halos add the user's signature
             * - still glyph-shaped; no masks, rectangles, pseudo-elements
             * - stagger is unchanged, so the COLOR GLOW itself travels
             */
            glyph.style.textShadow =
                alpha > 0.002
                    ? [
                        `0 0 0.060em rgba(255,255,255,${(alpha * 0.36).toFixed(3)})`,
                        `0 0 0.135em rgba(${accent.rgb},${(alpha * 0.52).toFixed(3)})`,
                        `0 0 0.300em rgba(${accent.rgb},${(alpha * 0.22).toFixed(3)})`
                    ].join(', ')
                    : 'none';
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

        /*
         * Complex scripts remain one browser-shaped word, but no longer get
         * a deliberately weak motion. This brings Punjabi/Hindi/Malayalam/
         * Arabic/CJK much closer to the perceived energy of the Latin layer
         * without breaking clusters/conjuncts.
         */
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

        const accent =
            currentAccent();

        const alpha =
            clamp01(
                metrics.shadowIntensity
                * phase.peak
                * 0.98
                * accent.gain
                * continuityGain
            );

        word.element.style.transform =
            `translate3d(0, ${yEm.toFixed(4)}em, 0) `
            + `scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, 1)`;

        word.element.style.filter =
            alpha > 0.002
                ? [
                    `drop-shadow(0 0 0.060em rgba(255,255,255,${(alpha * 0.38).toFixed(3)}))`,
                    `drop-shadow(0 0 0.145em rgba(${accent.rgb},${(alpha * 0.62).toFixed(3)}))`,
                    `drop-shadow(0 0 0.320em rgba(${accent.rgb},${(alpha * 0.27).toFixed(3)}))`,
                    `drop-shadow(0 0 0.560em rgba(${accent.rgb},${(alpha * 0.10).toFixed(3)}))`
                ].join(' ')
                : 'none';
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
    }

    function resetWordMotion(word) {
        if (!word || !word.element) return;

        word.element.style.transform = '';
        word.element.style.filter = '';

        (word.motionGlyphs || []).forEach(glyph => {
            glyph.style.transform = '';
            glyph.style.textShadow = 'none';
        });
    }

    function updateWordVisual(word, timelineTicks, frameNow) {
        if (!word.element || !word.segments.length) return;

        const renderTicks =
            timelineTicks + WORD_RENDER_LOOKAHEAD_TICKS;

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

        word.element.style.setProperty(
            '--ak-word-progress',
            `${(painted * 100).toFixed(3)}%`
        );

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

        word.element.classList.remove('ak-word-next');

        if (word.motionMode === 'grow') {
            const continuityGain =
                motionContinuityGain(
                    word,
                    timelineTicks
                );

            if (word.motionGlyphs && word.motionGlyphs.length) {
                word.element.style.transform = '';
                word.element.style.filter = '';

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

    function renderFrame() {
        state.rafId = 0;

        if (!state.lyrics || !state.lineData.length || !isLyricsPage()) {
            ensureAnimationLoop();
            return;
        }

        const media = getLocalMediaElement();

        if (!media) {
            if (performance.now() - state.lastMediaWarning > 5000) {
                state.lastMediaWarning = performance.now();
                warn(
                    'No local Jellyfin audio element found for karaoke timing.'
                );
            }
            ensureAnimationLoop();
            return;
        }

        const ticks = chooseTimelineTicks(media);
        const frameNow = performance.now();
        const activeLine = findLineIndexAtTicks(ticks);

        state.lineData.forEach((lineRecord, lineIndex) => {
            const distance = activeLine >= 0 ? Math.abs(lineIndex - activeLine) : 999;
            const lineElement = lineRecord.element;
            const words = lineRecord.words || [];

            const hasMotionHandoff =
                lineIndex < activeLine
                && words.some(
                    word =>
                        motionHandoffActive(
                            word,
                            ticks
                        )
                );

            // Visual-state classes only. Jellyfin still owns scrolling,
            // click-to-seek, pastLyric/futureLyric, and playback.
            lineElement.classList.toggle('ak-current', lineIndex === activeLine);
            lineElement.classList.toggle('ak-near', distance === 1);
            lineElement.classList.toggle('ak-near2', distance === 2);
            lineElement.classList.toggle('ak-far', distance >= 5);
            lineElement.classList.toggle(
                'ak-motion-handoff',
                hasMotionHandoff
            );

            if (!words.length) return;

            if (lineIndex < activeLine) {
                words.forEach(word => {
                    if (!word.element || !word.segments.length) return;

                    word.visualProgress = 1;
                    word.lastPaintAt = frameNow;
                    word.element.style.setProperty('--ak-word-progress', '100%');
                    word.element.classList.remove(
                        'ak-word-zero',
                        'ak-word-active',
                        'ak-word-next'
                    );
                    word.element.classList.add('ak-word-done');

                    /*
                     * If the previous line changed while a sustained grow/glow
                     * was still naturally decaying, let it finish a short
                     * 320 ms handoff instead of killing it on this frame.
                     */
                    if (motionHandoffActive(word, ticks)) {
                        const continuityGain =
                            motionContinuityGain(
                                word,
                                ticks
                            );

                        if (
                            word.motionGlyphs
                            && word.motionGlyphs.length
                        ) {
                            word.element.style.transform = '';
                            word.element.style.filter = '';

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
                    } else {
                        resetWordMotion(word);
                    }
                });
            } else if (lineIndex > activeLine) {
                words.forEach(word => {
                    if (!word.element || !word.segments.length) return;

                    word.visualProgress = 0;
                    word.lastPaintAt = frameNow;
                    word.element.style.setProperty('--ak-word-progress', '0%');
                    word.element.classList.add('ak-word-zero');
                    resetWordMotion(word);
                    word.element.classList.remove(
                        'ak-word-active',
                        'ak-word-done',
                        'ak-word-next'
                    );
                });
            } else {
                words.forEach(word => {
                    updateWordVisual(
                        word,
                        ticks,
                        frameNow
                    );
                });
            }
        });

        ensureAnimationLoop();
    }

    function ensureAnimationLoop() {
        if (!state.rafId) {
            state.rafId = requestAnimationFrame(renderFrame);
        }
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
                ensureAnimationLoop();
            }
        });

        window.addEventListener(
            'resize',
            queueMotionGeometryRefresh,
            { passive: true }
        );
    }

    /*
     * IMPORTANT: this file is referenced before Jellyfin's runtime.bundle.js
     * in index.html. That lets it observe Jellyfin's lyrics API response before
     * the stock web client flattens each LyricLine to lyric.Text.
     */
    installFetchInterceptor();
    installXhrInterceptor();
    installDomObserver();
    installRouteHooks();
    ensureAnimationLoop();

    window.JellyfinLyricMotion = Object.freeze({
        version: VERSION,
        redecorate: queueDecoration,
        accents() {
            return PREMIUM_ACCENTS.map(accent => ({
                id: accent.id,
                name: accent.name
            }));
        },
        setAccent: setAccentMode,
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
                effectModel: 'am-lyrics-style-duration-motion+premium-glyph-color',
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
                geometryAwareSwipe: true,
                wipeBaseEm: BASE_WIPE_GRADIENT_EM,
                swipeSmoothingMs: WORD_PROGRESS_SMOOTH_TAU_MS,
                currentMotionPlan:
                    current
                        ? (current.words || []).map(word => ({
                            word: word.text,
                            motion: word.motionMode,
                            glow: word.motionGlow,
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

    log(`v${VERSION} loaded`);
})();
