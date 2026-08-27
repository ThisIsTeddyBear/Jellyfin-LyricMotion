/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Jellyfin LyricMotion - unofficial Jellyfin Web lyrics enhancement.
 */
(function () {
    'use strict';

    const VERSION = '3.2.5';
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

        /* Input-capability heuristics are intentionally not used as a TV
         * signal. Kiosks, desktop browser shells and accessibility setups can
         * legitimately report no touch and a coarse/no pointer. Only explicit
         * living-room platform signatures above may trigger stock-TV bypass. */

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
    const INSTRUMENTAL_GAP_MIN_TICKS = 2 * TICKS_PER_SECOND;
    const INSTRUMENTAL_GAP_SYMBOL = '♪';
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const INSTRUMENTAL_NOTE_VIEWBOX_WIDTH = 64;
    const INSTRUMENTAL_NOTE_VIEWBOX_HEIGHT = 80;
    const INSTRUMENTAL_GAP_PROGRESS_EPSILON = 0.001;
    const INSTRUMENTAL_WAVE_PERIOD_SECONDS = 1.35;
    const INSTRUMENTAL_WAVE_MAX_AMPLITUDE = 2.35;
    const INSTRUMENTAL_WAVE_SEGMENTS = 20;
    const LYRIC_VISUAL_WATCHDOG_MS = 700;
    const LYRIC_FRAME_RECOVERY_MS = 36;
    const LYRIC_AUTO_FOLLOW_MANUAL_GRACE_MS = 3600;
    let reducedMotionMediaQuery = null;

    /*
     * Jellyfin's lyric parser can discard Unicode format controls.  The ASCII
     * transport token survives the complete TTML -> ELRC -> Jellyfin path and
     * is removed before the lyric is painted.  The old invisible marker is
     * still accepted so existing local files do not break.
     */
    const BACKGROUND_VOCAL_TOKEN = '[ak:bg]';
    const LEGACY_BACKGROUND_VOCAL_SENTINEL = '\u2063\u2060';
    const UNIFIED_RENDERER_SIGNATURE =
        'unified-pc-mobile-v3:60fps:multiscript-shaped-wipe:classic-bloom64:atmo-dynamic-kawarp-v325-hotfix';

    // Display-only lyric wipe smoothing.
    const WORD_PROGRESS_SMOOTH_TAU_MS = 20;
    const WORD_PROGRESS_SNAP_DELTA = 0.42;
    // Behaviour adapted from the current am-lyrics renderer.
    const BASE_WIPE_GRADIENT_EM = 0.75;
    const LONG_WORD_WIPE_EXTRA_EM = 0.45;
    const SHORT_WORD_GLOW_MIN_DURATION_MS = 1320;
    const MOTION_FINAL_RISE_EM = -0.035;
    const MOTION_HANDOFF_TICKS = 3200000; // 320 ms previous-line glow decay
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

    // Dynamic Background is the only atmosphere engine in God Mode.
    // It is presentation-only and never changes lyric timing.
    const ATMOSPHERE_ART_MAX_WIDTH = 720;
    const DYNAMIC_BACKGROUND_SOURCE = 'chengggit Dynamic Background 3.2.4 + Better Lyrics Kawarp';
    const DYNAMIC_BACKGROUND_ENGINE = 'kawarp-domain-warp-hardened';
    const DYNAMIC_BACKGROUND_TRANSITION_MS = 260;
    const DYNAMIC_BACKGROUND_DOM_STABLE_MS = 900;
    const DYNAMIC_BACKGROUND_UNBOUND_DOM_CONFIRM_MS = 1500;
    const DYNAMIC_BACKGROUND_INHERITED_DOM_STABLE_MS = 0;
    const DYNAMIC_BACKGROUND_INHERITED_DOM_CONFIRM_MS = 0;
    const DYNAMIC_BACKGROUND_DIRECT_GRACE_MS = 700;
    const DYNAMIC_BACKGROUND_DIRECT_LOAD_TIMEOUT_MS = 900;
    const DYNAMIC_BACKGROUND_WEAK_RECHECK_MS = 12000;
    const DYNAMIC_BACKGROUND_NO_ART_CONFIRM_MS = 2500;
    const DYNAMIC_BACKGROUND_NO_ART_RETRY_MS = 10000;
    const DYNAMIC_BACKGROUND_DIRECT_RETRY_MS = 1500;
    const DYNAMIC_BACKGROUND_WEBGL_RETRY_BASE_MS = 30000;
    const DYNAMIC_BACKGROUND_WEBGL_RETRY_MAX_MS = 300000;
    const DYNAMIC_BACKGROUND_SETTINGS = Object.freeze({
        opacity: 0.75,
        warpIntensity: 1.0,
        blurPasses: 8,
        blurSize: 128,
        animationSpeed: 1.8,
        transitionDuration: DYNAMIC_BACKGROUND_TRANSITION_MS,
        saturation: 1.7,
        dithering: 0,
        tintColor: [0.157, 0.157, 0.235],
        tintIntensity: 0.15,
        scale: 1.0,
        audioResponsive: false,
        pauseOnInactive: true
    });

    /*
     * Dynamic Background WebGL renderer.
     *
     * Visual model adapted from the MIT-licensed Better Lyrics Kawarp core used
     * by chengg's Dynamic Background theme. LyricMotion keeps the same
     * low-resolution Kawase blur + domain-warp architecture, but owns image
     * sequencing and interrupted-transition capture so rapid Jellyfin track
     * changes cannot flash stale artwork or jump through an unfinished blend.
     */
    class DynamicBackgroundRenderer {
        constructor(canvas, options = {}) {
            this.canvas = canvas;
            this.gl = canvas.getContext('webgl', {
                alpha: true,
                antialias: false,
                depth: false,
                stencil: false,
                premultipliedAlpha: false,
                preserveDrawingBuffer: false,
                powerPreference: 'high-performance'
            });
            if (!this.gl) throw new Error('WebGL not supported');

            this.blurSize = Math.max(64, Math.min(256, Math.round(options.blurSize || 128)));
            this.warpIntensity = Number.isFinite(options.warpIntensity) ? Math.max(0, Math.min(1, options.warpIntensity)) : 1;
            this.blurPasses = Number.isFinite(options.blurPasses) ? Math.max(1, Math.min(20, Math.floor(options.blurPasses))) : 8;
            this.animationSpeed = Number.isFinite(options.animationSpeed) ? Math.max(0.1, Math.min(5, options.animationSpeed)) : 1.8;
            this.transitionDuration = Number.isFinite(options.transitionDuration) ? Math.max(0, Math.min(2000, options.transitionDuration)) : 340;
            this.saturation = Number.isFinite(options.saturation) ? Math.max(0, Math.min(3, options.saturation)) : 1.7;
            this.tintColor = Array.isArray(options.tintColor) && options.tintColor.length >= 3
                ? options.tintColor.slice(0, 3).map(value => Math.max(0, Math.min(1, Number(value) || 0)))
                : [0.157, 0.157, 0.235];
            this.tintIntensity = Number.isFinite(options.tintIntensity) ? Math.max(0, Math.min(1, options.tintIntensity)) : 0.15;
            this.dithering = Number.isFinite(options.dithering) ? Math.max(0, Math.min(0.1, options.dithering)) : 0;
            this.scale = Number.isFinite(options.scale) ? Math.max(0.8, Math.min(2, options.scale)) : 1.04;
            this.renderScale = Number.isFinite(options.renderScale) ? Math.max(0.35, Math.min(1.5, options.renderScale)) : 1;
            this.maxRenderLongEdge = Number.isFinite(options.maxRenderLongEdge) ? Math.max(720, Math.min(4096, options.maxRenderLongEdge)) : 2560;
            this.onContextLost = typeof options.onContextLost === 'function' ? options.onContextLost : null;
            this.onContextRestored = typeof options.onContextRestored === 'function' ? options.onContextRestored : null;
            this.onTransitionInterrupted = typeof options.onTransitionInterrupted === 'function' ? options.onTransitionInterrupted : null;
            this.onTransitionComplete = typeof options.onTransitionComplete === 'function' ? options.onTransitionComplete : null;

            this.isPlaying = false;
            this.animationId = 0;
            this.lastFrameTime = 0;
            this.accumulatedTime = 0;
            this.hasCurrent = false;
            this.isTransitioning = false;
            this.transitionStartTime = 0;
            this.contextLost = false;
            this.renderWidth = 0;
            this.renderHeight = 0;
            this.transitionSerial = 0;
            this.completedTransitions = 0;
            this.interruptedTransitions = 0;
            this.renderLoop = this.renderLoop.bind(this);

            this.halfFloatExt = this.gl.getExtension('OES_texture_half_float');
            this.halfFloatLinearExt = this.gl.getExtension('OES_texture_half_float_linear');
            this.colorBufferHalfFloatExt = this.gl.getExtension('EXT_color_buffer_half_float');

            this.vertexShaderSource = `
                attribute vec2 a_position;
                attribute vec2 a_texCoord;
                varying vec2 v_texCoord;
                void main() {
                    gl_Position = vec4(a_position, 0.0, 1.0);
                    v_texCoord = a_texCoord;
                }
            `;
            this.blurShaderSource = `
                precision highp float;
                uniform sampler2D u_texture;
                uniform vec2 u_resolution;
                uniform float u_offset;
                varying vec2 v_texCoord;
                void main() {
                    vec2 texel = 1.0 / u_resolution;
                    vec4 color = vec4(0.0);
                    color += texture2D(u_texture, v_texCoord + vec2(-u_offset, -u_offset) * texel);
                    color += texture2D(u_texture, v_texCoord + vec2( u_offset, -u_offset) * texel);
                    color += texture2D(u_texture, v_texCoord + vec2(-u_offset,  u_offset) * texel);
                    color += texture2D(u_texture, v_texCoord + vec2( u_offset,  u_offset) * texel);
                    gl_FragColor = color * 0.25;
                }
            `;
            this.blendShaderSource = `
                precision highp float;
                uniform sampler2D u_texture1;
                uniform sampler2D u_texture2;
                uniform float u_blend;
                varying vec2 v_texCoord;
                void main() {
                    gl_FragColor = mix(texture2D(u_texture1, v_texCoord), texture2D(u_texture2, v_texCoord), u_blend);
                }
            `;
            this.tintShaderSource = `
                precision highp float;
                uniform sampler2D u_texture;
                uniform vec3 u_tintColor;
                uniform float u_tintIntensity;
                varying vec2 v_texCoord;
                void main() {
                    vec4 color = texture2D(u_texture, v_texCoord);
                    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    float darkMask = 1.0 - smoothstep(0.0, 0.5, luma);
                    color.rgb = mix(color.rgb, u_tintColor, darkMask * u_tintIntensity);
                    gl_FragColor = color;
                }
            `;
            this.warpShaderSource = `
                precision highp float;
                uniform sampler2D u_texture;
                uniform float u_time;
                uniform float u_intensity;
                varying vec2 v_texCoord;
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
                float snoise(vec2 v) {
                    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                    vec2 i = floor(v + dot(v, C.yy));
                    vec2 x0 = v - i + dot(i, C.xx);
                    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                    vec4 x12 = x0.xyxy + C.xxzz;
                    x12.xy -= i1;
                    i = mod289(i);
                    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
                    m = m * m;
                    m = m * m;
                    vec3 x = 2.0 * fract(p * C.www) - 1.0;
                    vec3 h = abs(x) - 0.5;
                    vec3 ox = floor(x + 0.5);
                    vec3 a0 = x - ox;
                    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
                    vec3 g;
                    g.x = a0.x * x0.x + h.x * x0.y;
                    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                    return 130.0 * dot(m, g);
                }
                void main() {
                    vec2 uv = v_texCoord;
                    float t = u_time * 0.05;
                    vec2 center = uv - 0.5;
                    float centerWeight = 1.0 - smoothstep(0.0, 0.7, length(center));
                    float n1 = snoise(uv * 0.35 + vec2(t, t * 0.7));
                    float n2 = snoise(uv * 0.35 + vec2(-t * 0.8, t * 0.5) + vec2(50.0));
                    float n3 = snoise(uv * 0.9 + vec2(t * 1.2, -t) + vec2(100.0, 0.0));
                    float n4 = snoise(uv * 0.9 + vec2(-t, t * 1.1) + vec2(0.0, 100.0));
                    vec2 warp = vec2(n1 * 0.65 + n3 * 0.35, n2 * 0.65 + n4 * 0.35) * centerWeight;
                    vec2 warpedUV = clamp(uv + warp * u_intensity, 0.0, 1.0);
                    gl_FragColor = texture2D(u_texture, warpedUV);
                }
            `;
            this.outputShaderSource = `
                precision highp float;
                uniform sampler2D u_texture;
                uniform float u_saturation;
                uniform float u_dithering;
                uniform float u_time;
                uniform float u_scale;
                uniform vec2 u_resolution;
                varying vec2 v_texCoord;
                float hash(vec3 p) {
                    p = fract(p * 0.1031);
                    p += dot(p, p.zyx + 31.32);
                    return fract((p.x + p.y) * p.z);
                }
                void main() {
                    vec2 uv = (v_texCoord - 0.5) / u_scale + 0.5;
                    uv = clamp(uv, 0.0, 1.0);
                    vec4 color = texture2D(u_texture, uv);
                    vec2 center = v_texCoord - 0.5;
                    float vignette = 1.0 - dot(center, center) * 0.3;
                    color.rgb *= vignette;
                    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    color.rgb = mix(vec3(gray), color.rgb, u_saturation);
                    vec2 pixelPos = floor(v_texCoord * u_resolution);
                    float noise = hash(vec3(pixelPos, floor(u_time * 60.0)));
                    color.rgb += (noise - 0.5) * u_dithering;
                    gl_FragColor = vec4(color.rgb, 1.0);
                }
            `;

            this.blurProgram = null;
            this.blendProgram = null;
            this.tintProgram = null;
            this.warpProgram = null;
            this.outputProgram = null;
            this.positionBuffer = null;
            this.texCoordBuffer = null;
            this.sourceTexture = null;
            this.blurFBO1 = null;
            this.blurFBO2 = null;
            this.currentAlbumFBO = null;
            this.nextAlbumFBO = null;
            this.snapshotAlbumFBO = null;
            this.blendScratchFBO = null;
            this.warpFBO = null;
            this._onLost = null;
            this._onRestored = null;

            try {
                this.blurProgram = this.createProgram(this.vertexShaderSource, this.blurShaderSource);
                this.blendProgram = this.createProgram(this.vertexShaderSource, this.blendShaderSource);
                this.tintProgram = this.createProgram(this.vertexShaderSource, this.tintShaderSource);
                this.warpProgram = this.createProgram(this.vertexShaderSource, this.warpShaderSource);
                this.outputProgram = this.createProgram(this.vertexShaderSource, this.outputShaderSource);

                this.positionBuffer = this.createBuffer(new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]));
                this.texCoordBuffer = this.createBuffer(new Float32Array([0,0, 1,0, 0,1, 0,1, 1,0, 1,1]));
                this.attribPosition = 0;
                this.attribTexCoord = 1;

                this.uniforms = {
                blur: {
                    texture: this.gl.getUniformLocation(this.blurProgram, 'u_texture'),
                    resolution: this.gl.getUniformLocation(this.blurProgram, 'u_resolution'),
                    offset: this.gl.getUniformLocation(this.blurProgram, 'u_offset')
                },
                blend: {
                    texture1: this.gl.getUniformLocation(this.blendProgram, 'u_texture1'),
                    texture2: this.gl.getUniformLocation(this.blendProgram, 'u_texture2'),
                    blend: this.gl.getUniformLocation(this.blendProgram, 'u_blend')
                },
                tint: {
                    texture: this.gl.getUniformLocation(this.tintProgram, 'u_texture'),
                    tintColor: this.gl.getUniformLocation(this.tintProgram, 'u_tintColor'),
                    tintIntensity: this.gl.getUniformLocation(this.tintProgram, 'u_tintIntensity')
                },
                warp: {
                    texture: this.gl.getUniformLocation(this.warpProgram, 'u_texture'),
                    time: this.gl.getUniformLocation(this.warpProgram, 'u_time'),
                    intensity: this.gl.getUniformLocation(this.warpProgram, 'u_intensity')
                },
                output: {
                    texture: this.gl.getUniformLocation(this.outputProgram, 'u_texture'),
                    saturation: this.gl.getUniformLocation(this.outputProgram, 'u_saturation'),
                    dithering: this.gl.getUniformLocation(this.outputProgram, 'u_dithering'),
                    time: this.gl.getUniformLocation(this.outputProgram, 'u_time'),
                    scale: this.gl.getUniformLocation(this.outputProgram, 'u_scale'),
                    resolution: this.gl.getUniformLocation(this.outputProgram, 'u_resolution')
                }
                };

                this.sourceTexture = this.createTexture();
                this.blurFBO1 = this.createFramebuffer(this.blurSize, this.blurSize, true);
                this.blurFBO2 = this.createFramebuffer(this.blurSize, this.blurSize, true);
                this.currentAlbumFBO = this.createFramebuffer(this.blurSize, this.blurSize, true);
                this.nextAlbumFBO = this.createFramebuffer(this.blurSize, this.blurSize, true);
                this.snapshotAlbumFBO = this.createFramebuffer(this.blurSize, this.blurSize, true);
                this.blendScratchFBO = this.createFramebuffer(this.blurSize, this.blurSize, true);
                this.warpFBO = this.createFramebuffer(1, 1, false);

                this._onLost = event => {
                    event.preventDefault();
                    this.contextLost = true;
                    this.stop();
                    if (this.onContextLost) this.onContextLost();
                };
                this._onRestored = () => {
                    this.contextLost = false;
                    if (this.onContextRestored) this.onContextRestored();
                };
                canvas.addEventListener('webglcontextlost', this._onLost, false);
                canvas.addEventListener('webglcontextrestored', this._onRestored, false);
            } catch (error) {
                // Listener registration can itself fail after the first listener
                // has already been installed. Undo both registrations before
                // releasing GPU state so a failed constructor leaves no hooks.
                if (this._onLost) {
                    try { canvas.removeEventListener('webglcontextlost', this._onLost, false); } catch { /* best effort */ }
                }
                if (this._onRestored) {
                    try { canvas.removeEventListener('webglcontextrestored', this._onRestored, false); } catch { /* best effort */ }
                }
                this.releaseGpuResources();
                throw error;
            }
        }

        createShader(type, source) {
            const gl = this.gl;
            const shader = gl.createShader(type);
            if (!shader) throw new Error('Failed to create WebGL shader');
            try {
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    const detail = gl.getShaderInfoLog(shader) || 'unknown shader error';
                    throw new Error(`Dynamic background shader compile error: ${detail}`);
                }
                return shader;
            } catch (error) {
                try { gl.deleteShader(shader); } catch { /* context can fail mid-init */ }
                throw error;
            }
        }

        createProgram(vertexSource, fragmentSource) {
            const gl = this.gl;
            const vertex = this.createShader(gl.VERTEX_SHADER, vertexSource);
            let fragment = null;
            let program = null;
            try {
                fragment = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);
                program = gl.createProgram();
                if (!program) throw new Error('Failed to create WebGL program');

                gl.attachShader(program, vertex);
                gl.attachShader(program, fragment);
                // Same attribute locations across every program. WebGL does not
                // guarantee this merely because the vertex shader source matches.
                gl.bindAttribLocation(program, 0, 'a_position');
                gl.bindAttribLocation(program, 1, 'a_texCoord');
                gl.linkProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    const detail = gl.getProgramInfoLog(program) || 'unknown program link error';
                    throw new Error(`Dynamic background program link error: ${detail}`);
                }
                return program;
            } catch (error) {
                if (program) {
                    try { gl.deleteProgram(program); } catch { /* best effort */ }
                }
                throw error;
            } finally {
                try { gl.deleteShader(vertex); } catch { /* best effort */ }
                if (fragment) {
                    try { gl.deleteShader(fragment); } catch { /* best effort */ }
                }
            }
        }

        createBuffer(data) {
            const gl = this.gl;
            const buffer = gl.createBuffer();
            if (!buffer) throw new Error('Failed to create WebGL buffer');
            try {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
                return buffer;
            } catch (error) {
                gl.deleteBuffer(buffer);
                throw error;
            }
        }

        createTexture() {
            const gl = this.gl;
            const texture = gl.createTexture();
            if (!texture) throw new Error('Failed to create WebGL texture');
            try {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                return texture;
            } catch (error) {
                gl.deleteTexture(texture);
                throw error;
            }
        }

        allocateFramebuffer(width, height, type) {
            const gl = this.gl;
            const texture = this.createTexture();
            let framebuffer = null;
            try {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);
                framebuffer = gl.createFramebuffer();
                if (!framebuffer) throw new Error('Failed to create WebGL framebuffer');

                gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                if (status !== gl.FRAMEBUFFER_COMPLETE) {
                    try { gl.deleteFramebuffer(framebuffer); } catch { /* best effort */ }
                    try { gl.deleteTexture(texture); } catch { /* best effort */ }
                    return null;
                }
                return { framebuffer, texture, width, height, type };
            } catch (error) {
                try { gl.bindFramebuffer(gl.FRAMEBUFFER, null); } catch { /* context can fail mid-init */ }
                if (framebuffer) {
                    try { gl.deleteFramebuffer(framebuffer); } catch { /* best effort */ }
                }
                try { gl.deleteTexture(texture); } catch { /* best effort */ }
                throw error;
            }
        }

        createFramebuffer(width, height, preferHighPrecision) {
            const gl = this.gl;
            if (preferHighPrecision && this.halfFloatExt && this.halfFloatLinearExt && this.colorBufferHalfFloatExt) {
                const high = this.allocateFramebuffer(width, height, this.halfFloatExt.HALF_FLOAT_OES);
                if (high) return high;
            }
            const normal = this.allocateFramebuffer(width, height, gl.UNSIGNED_BYTE);
            if (!normal) throw new Error('WebGL framebuffer is incomplete');
            return normal;
        }

        deleteFramebuffer(fbo) {
            if (!fbo) return;
            this.gl.deleteFramebuffer(fbo.framebuffer);
            this.gl.deleteTexture(fbo.texture);
        }

        setupAttributes() {
            const gl = this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.enableVertexAttribArray(this.attribPosition);
            gl.vertexAttribPointer(this.attribPosition, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
            gl.enableVertexAttribArray(this.attribTexCoord);
            gl.vertexAttribPointer(this.attribTexCoord, 2, gl.FLOAT, false, 0, 0);
        }

        copyTexture(sourceTexture, targetFBO) {
            const gl = this.gl;
            gl.useProgram(this.blurProgram);
            this.setupAttributes();
            gl.bindFramebuffer(gl.FRAMEBUFFER, targetFBO.framebuffer);
            gl.viewport(0, 0, targetFBO.width, targetFBO.height);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
            gl.uniform1i(this.uniforms.blur.texture, 0);
            gl.uniform2f(this.uniforms.blur.resolution, targetFBO.width, targetFBO.height);
            gl.uniform1f(this.uniforms.blur.offset, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        blurSourceInto(targetFBO) {
            const gl = this.gl;
            gl.useProgram(this.tintProgram);
            this.setupAttributes();
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBO1.framebuffer);
            gl.viewport(0, 0, this.blurSize, this.blurSize);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);
            gl.uniform1i(this.uniforms.tint.texture, 0);
            gl.uniform3fv(this.uniforms.tint.tintColor, this.tintColor);
            gl.uniform1f(this.uniforms.tint.tintIntensity, this.tintIntensity);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            gl.useProgram(this.blurProgram);
            this.setupAttributes();
            gl.uniform2f(this.uniforms.blur.resolution, this.blurSize, this.blurSize);
            gl.uniform1i(this.uniforms.blur.texture, 0);
            let readFBO = this.blurFBO1;
            let writeFBO = this.blurFBO2;
            for (let index = 0; index < this.blurPasses; index += 1) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, writeFBO.framebuffer);
                gl.viewport(0, 0, this.blurSize, this.blurSize);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, readFBO.texture);
                gl.uniform1f(this.uniforms.blur.offset, index + 0.5);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                [readFBO, writeFBO] = [writeFBO, readFBO];
            }
            this.copyTexture(readFBO.texture, targetFBO);
        }

        transitionLinearFactor(now = performance.now()) {
            if (!this.isTransitioning || this.transitionDuration <= 0) return 1;
            return Math.max(0, Math.min(1, (now - this.transitionStartTime) / this.transitionDuration));
        }

        transitionFactor(now = performance.now()) {
            const t = this.transitionLinearFactor(now);
            // Fast ease-out. The new song becomes visually dominant early while
            // the final 20% still settles smoothly instead of flashing.
            return 1 - Math.pow(1 - t, 3);
        }

        blendInto(targetFBO, fromTexture, toTexture, factor) {
            const gl = this.gl;
            gl.useProgram(this.blendProgram);
            this.setupAttributes();
            gl.bindFramebuffer(gl.FRAMEBUFFER, targetFBO.framebuffer);
            gl.viewport(0, 0, targetFBO.width, targetFBO.height);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, fromTexture);
            gl.uniform1i(this.uniforms.blend.texture1, 0);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, toTexture);
            gl.uniform1i(this.uniforms.blend.texture2, 1);
            gl.uniform1f(this.uniforms.blend.blend, Math.max(0, Math.min(1, factor)));
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        captureInterruptedTransition() {
            if (!this.isTransitioning) return;
            const factor = this.transitionFactor(performance.now());
            this.blendInto(this.snapshotAlbumFBO, this.currentAlbumFBO.texture, this.nextAlbumFBO.texture, factor);
            const oldCurrent = this.currentAlbumFBO;
            const oldNext = this.nextAlbumFBO;
            const oldSnapshot = this.snapshotAlbumFBO;
            this.currentAlbumFBO = oldSnapshot;
            this.nextAlbumFBO = oldCurrent;
            this.snapshotAlbumFBO = oldNext;
            this.isTransitioning = false;
            this.interruptedTransitions += 1;
            if (this.onTransitionInterrupted) this.onTransitionInterrupted(this.interruptedTransitions);
        }

        commitTransition() {
            if (!this.isTransitioning) return;
            [this.currentAlbumFBO, this.nextAlbumFBO] = [this.nextAlbumFBO, this.currentAlbumFBO];
            this.isTransitioning = false;
            this.completedTransitions += 1;
            if (this.onTransitionComplete) this.onTransitionComplete(this.completedTransitions);
        }

        loadImageElement(source) {
            if (this.contextLost) return false;
            const gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

            if (!this.hasCurrent) {
                this.blurSourceInto(this.currentAlbumFBO);
                this.copyTexture(this.currentAlbumFBO.texture, this.nextAlbumFBO);
                this.hasCurrent = true;
                this.isTransitioning = false;
                this.renderFrame();
                return true;
            }

            if (this.isTransitioning) this.captureInterruptedTransition();
            this.blurSourceInto(this.nextAlbumFBO);
            this.transitionStartTime = performance.now();
            this.isTransitioning = this.transitionDuration > 0;
            this.transitionSerial += 1;
            if (!this.isTransitioning) {
                [this.currentAlbumFBO, this.nextAlbumFBO] = [this.nextAlbumFBO, this.currentAlbumFBO];
                this.completedTransitions += 1;
            }
            this.start();
            return true;
        }

        resizeToDisplaySize() {
            if (this.contextLost) return false;
            const cssWidth = Math.max(1, Math.round(this.canvas.clientWidth || window.innerWidth || 1));
            const cssHeight = Math.max(1, Math.round(this.canvas.clientHeight || window.innerHeight || 1));
            const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
            let width = Math.max(1, Math.round(cssWidth * dpr * this.renderScale));
            let height = Math.max(1, Math.round(cssHeight * dpr * this.renderScale));
            const longEdge = Math.max(width, height);
            if (longEdge > this.maxRenderLongEdge) {
                const factor = this.maxRenderLongEdge / longEdge;
                width = Math.max(1, Math.round(width * factor));
                height = Math.max(1, Math.round(height * factor));
            }
            if (width === this.renderWidth && height === this.renderHeight) return false;
            this.canvas.width = width;
            this.canvas.height = height;
            this.renderWidth = width;
            this.renderHeight = height;
            this.deleteFramebuffer(this.warpFBO);
            this.warpFBO = this.createFramebuffer(width, height, false);
            return true;
        }

        render(time, timestamp) {
            if (this.contextLost || !this.hasCurrent) return;
            this.resizeToDisplaySize();
            const gl = this.gl;
            const width = this.renderWidth || this.canvas.width;
            const height = this.renderHeight || this.canvas.height;
            let sourceTexture = this.currentAlbumFBO.texture;

            if (this.isTransitioning) {
                const linear = this.transitionLinearFactor(timestamp);
                if (linear >= 1) {
                    this.commitTransition();
                    sourceTexture = this.currentAlbumFBO.texture;
                } else {
                    const factor = 1 - Math.pow(1 - linear, 3);
                    this.blendInto(this.blendScratchFBO, this.currentAlbumFBO.texture, this.nextAlbumFBO.texture, factor);
                    sourceTexture = this.blendScratchFBO.texture;
                }
            }

            gl.useProgram(this.warpProgram);
            this.setupAttributes();
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.warpFBO.framebuffer);
            gl.viewport(0, 0, width, height);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
            gl.uniform1i(this.uniforms.warp.texture, 0);
            gl.uniform1f(this.uniforms.warp.time, time);
            gl.uniform1f(this.uniforms.warp.intensity, this.warpIntensity);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            gl.useProgram(this.outputProgram);
            this.setupAttributes();
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, width, height);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.warpFBO.texture);
            gl.uniform1i(this.uniforms.output.texture, 0);
            gl.uniform1f(this.uniforms.output.saturation, this.saturation);
            gl.uniform1f(this.uniforms.output.dithering, this.dithering);
            gl.uniform1f(this.uniforms.output.time, time);
            gl.uniform1f(this.uniforms.output.scale, this.scale);
            gl.uniform2f(this.uniforms.output.resolution, width, height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        renderFrame() {
            if (!this.hasCurrent || this.contextLost) return;
            const now = performance.now();
            if (!this.lastFrameTime) this.lastFrameTime = now;
            const dt = Math.max(0, Math.min(0.1, (now - this.lastFrameTime) / 1000));
            this.lastFrameTime = now;
            this.accumulatedTime += dt * this.animationSpeed;
            this.render(this.accumulatedTime, now);
        }

        renderLoop(timestamp) {
            if (!this.isPlaying || this.contextLost) return;
            const dt = Math.max(0, Math.min(0.1, (timestamp - this.lastFrameTime) / 1000));
            this.lastFrameTime = timestamp;
            this.accumulatedTime += dt * this.animationSpeed;
            this.render(this.accumulatedTime, timestamp);
            this.animationId = requestAnimationFrame(this.renderLoop);
        }

        start() {
            if (this.isPlaying || this.contextLost || !this.hasCurrent) return;
            this.isPlaying = true;
            this.lastFrameTime = performance.now();
            this.animationId = requestAnimationFrame(this.renderLoop);
        }

        stop() {
            this.isPlaying = false;
            if (this.animationId) cancelAnimationFrame(this.animationId);
            this.animationId = 0;
        }

        diagnostics() {
            return {
                engine: 'kawarp-domain-warp-hardened',
                webgl: true,
                blurSize: this.blurSize,
                blurPasses: this.blurPasses,
                warpIntensity: this.warpIntensity,
                animationSpeed: this.animationSpeed,
                transitionDurationMs: this.transitionDuration,
                transitionCurve: 'ease-out-cubic',
                saturation: this.saturation,
                dithering: this.dithering,
                scale: this.scale,
                renderWidth: this.renderWidth,
                renderHeight: this.renderHeight,
                transitioning: this.isTransitioning,
                transitionSerial: this.transitionSerial,
                completedTransitions: this.completedTransitions,
                interruptedTransitions: this.interruptedTransitions,
                accumulatedTime: this.accumulatedTime,
                contextLost: this.contextLost
            };
        }

        releaseGpuResources() {
            const gl = this.gl;
            if (gl && !this.contextLost) {
                [
                    this.blurProgram,
                    this.blendProgram,
                    this.tintProgram,
                    this.warpProgram,
                    this.outputProgram
                ].forEach(program => {
                    if (!program) return;
                    try { gl.deleteProgram(program); } catch { /* best effort */ }
                });

                [this.positionBuffer, this.texCoordBuffer].forEach(buffer => {
                    if (!buffer) return;
                    try { gl.deleteBuffer(buffer); } catch { /* best effort */ }
                });
                if (this.sourceTexture) {
                    try { gl.deleteTexture(this.sourceTexture); } catch { /* best effort */ }
                }

                [
                    this.blurFBO1,
                    this.blurFBO2,
                    this.currentAlbumFBO,
                    this.nextAlbumFBO,
                    this.snapshotAlbumFBO,
                    this.blendScratchFBO,
                    this.warpFBO
                ].forEach(fbo => {
                    if (!fbo) return;
                    try { this.deleteFramebuffer(fbo); } catch { /* best effort */ }
                });
            }

            this.blurProgram = null;
            this.blendProgram = null;
            this.tintProgram = null;
            this.warpProgram = null;
            this.outputProgram = null;
            this.positionBuffer = null;
            this.texCoordBuffer = null;
            this.sourceTexture = null;
            this.blurFBO1 = null;
            this.blurFBO2 = null;
            this.currentAlbumFBO = null;
            this.nextAlbumFBO = null;
            this.snapshotAlbumFBO = null;
            this.blendScratchFBO = null;
            this.warpFBO = null;
        }

        dispose() {
            this.stop();
            if (this._onLost) {
                this.canvas.removeEventListener('webglcontextlost', this._onLost, false);
            }
            if (this._onRestored) {
                this.canvas.removeEventListener('webglcontextrestored', this._onRestored, false);
            }
            this.releaseGpuResources();
        }
    }


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
    // compact timing chip; its popover keeps ±0.1 s nudging, one-tap word/line
    // synchronization and Reset out of the main lyric view.
    const TIMING_OFFSET_FINE_STEP_SECONDS = 0.1;
    const TIMING_OFFSET_STEP_SECONDS = 0.5;
    const TIMING_OFFSET_MIN_SECONDS = -15;
    const TIMING_OFFSET_MAX_SECONDS = 15;
    const SONG_PREFERENCES_MAX_ENTRIES = 300;

    const PERFORMANCE_TARGET_FPS = Object.freeze({
        desktop: 60,
        mobile: 60
    });

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
     * Compact five-color OLED palette. Each selection keeps a clean primary
     * edge and a complementary outer bloom instead of making every shadow the
     * same hue.
     */
    const PREMIUM_ACCENTS = Object.freeze([
        { id: 'ruby', name: 'Ruby', rgb: '255, 62, 102', secondaryRgb: '255, 112, 72', tertiaryRgb: '226, 78, 255', gain: 0.99 },
        { id: 'solar-yellow', name: 'Solar Yellow', rgb: '255, 232, 62', secondaryRgb: '255, 142, 48', tertiaryRgb: '48, 242, 220', gain: 0.49 },
        { id: 'emerald', name: 'Emerald', rgb: '48, 246, 158', secondaryRgb: '52, 255, 214', tertiaryRgb: '148, 94, 255', gain: 0.55 },
        { id: 'sapphire', name: 'Sapphire Blue', rgb: '66, 136, 255', secondaryRgb: '72, 222, 255', tertiaryRgb: '255, 92, 194', gain: 0.82 },
        { id: 'electric-violet', name: 'Electric Violet', rgb: '152, 76, 255', secondaryRgb: '82, 172, 255', tertiaryRgb: '72, 255, 228', gain: 1.00 }
    ]);
    const NEUTRAL_ACCENT = Object.freeze({
        id: 'neutral-fallback',
        name: 'Neutral Fallback',
        rgb: '214, 226, 255',
        secondaryRgb: '196, 180, 255',
        tertiaryRgb: '255, 214, 238',
        gain: 0.72
    });
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
        animationLoopErrors: 0,
        animationLoopRecoveries: 0,
        animationWatchdogRecoveries: 0,
        animationWatchdogTimer: 0,
        lastAnimationLoopError: '',
        lastMediaWarning: 0,
        geometryTimer: 0,
        backgroundAnchorTimer: 0,
        decorationRetryStartedAt: 0,
        decorationRetryCount: 0,
        decorationRetryExpiredCount: 0,
        lastActiveLine: -999,
        lastActiveLineSignature: '',
        activeLineIndexes: [],
        activeLineScratch: [],
        handoffLineIndexes: new Set(),
        retiredLineElements: [],
        lineEndPrefix: [],
        instrumentalGaps: [],
        activeInstrumentalGapIndex: -1,
        instrumentalPhaseActiveIndex: -1,
        instrumentalPastCount: 0,
        instrumentalGapRenderCount: 0,
        instrumentalGapMaxDurationTicks: 0,
        mediaElement: null,
        mediaProbeAt: 0,
        mediaSwitchCount: 0,
        staleMediaEventDrops: 0,
        timedCueCount: 0,
        lyricTimingMode: 'none',
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
        accent: null,
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

        songPreferenceKey: '',
        songPreferences: Object.create(null),
        lyricToolsHost: null,
        lyricToolsBar: null,
        timingControls: null,
        timingPopover: null,
        timingPopoverDismissInstalled: false,
        timingOffsetSeconds: 0,
        timingOffsetChangeCount: 0,
        timingPickActive: false,
        timingUndo: null,
        timingPickListenerInstalled: false,
        lyricSeekInteractionInstalled: false,
        lyricAutoFollowInstalled: false,
        lyricAutoFollowSuspendedUntil: 0,
        lyricAutoFollowLastIndex: -1,
        lyricAutoFollowLastAt: 0,
        lyricAutoFollowScrollCount: 0,
        lyricAutoFollowManualScrollCount: 0,
        lyricAutoFollowForceCount: 0,
        lyricAutoFollowLastReason: '',
        lyricStockAutoFollowSuppressCount: 0,
        lyricStockAutoFollowLastReason: '',
        lyricSeekCount: 0,
        instrumentalSeekCount: 0,
        lastLyricSeekKind: '',
        lastLyricSeekSourceTicks: null,
        lastLyricSeekMediaSeconds: null,

        // Dynamic Background state. This build intentionally has one atmosphere engine.
        atmosphereMode: 'dynamic',
        atmosphereRoot: null,
        atmosphereMediaKey: '',
        atmosphereArtwork: '',
        atmosphereSource: 'none',
        atmosphereLastCheck: 0,
        atmosphereLoadSeq: 0,
        atmospherePendingKey: '',
        atmospherePendingSince: 0,
        atmosphereTimeoutCount: 0,
        atmosphereFailedKey: '',
        atmosphereFailedAt: 0,
        atmosphereAnalysis: null,
        atmosphereDynamicRenderer: null,
        atmosphereDynamicCanvas: null,
        atmosphereDynamicBaseIndex: 0,
        atmosphereDynamicCurrentArtwork: '',
        atmosphereDynamicCurrentFingerprint: null,
        atmosphereDynamicVisualDedupCount: 0,
        atmosphereDynamicFingerprintFailures: 0,
        atmosphereDynamicIdentityMethod: 'none',
        atmosphereDynamicWebglAvailable: null,
        atmosphereDynamicFallbackReason: '',
        atmosphereDynamicContextLossCount: 0,
        atmosphereDynamicTransitionCount: 0,
        atmosphereDynamicInterruptedTransitions: 0,
        atmosphereDynamicResizeCount: 0,
        atmosphereDynamicStaleCommitDrops: 0,
        atmosphereDynamicDirectLoadFailures: 0,
        atmosphereDynamicDomFallbackCommits: 0,
        atmosphereDynamicDirectRetryAt: 0,
        atmosphereDynamicWeakSource: false,
        atmosphereDynamicResolvedKey: '',
        atmosphereDynamicResolvedAt: 0,
        atmosphereDynamicNoArtwork: false,
        atmosphereDynamicNoArtFailures: 0,
        atmosphereDynamicDomBaseline: new Set(),
        atmosphereDynamicDomCandidateSinceByUrl: new Map(),
        atmosphereDynamicFastInheritedCommits: 0,
        atmosphereDynamicMediaStableSince: 0,
        atmosphereDynamicWebglFailureCount: 0,
        atmosphereDynamicWebglRetryAt: 0,
        atmosphereDynamicProbeToken: 0,
        atmosphereDynamicProbeTimers: []
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

    /*
     * Jellyfin can return a lyric array for plain text too. Those entries often
     * have every Start field defaulted to zero, which used to make every row
     * look simultaneously current and caused LyricMotion to replace otherwise
     * healthy native lyrics. Require an observable timeline before taking DOM
     * ownership: a real line timestamp, an explicit duration, or a cue whose
     * timing advances beyond zero.
     */
    function lyricTimingMode(lyrics) {
        if (!Array.isArray(lyrics) || !lyrics.length) return 'plain';

        const lineStarts = new Set();
        let hasExplicitDuration = false;
        let hasAdvancingCueTiming = false;

        lyrics.forEach(lyric => {
            const start = finiteTick(
                lyricValue(lyric, 'Start', 'start')
            );
            const end = finiteTick(
                lyricValue(lyric, 'End', 'end')
            );

            if (start !== null) lineStarts.add(start);
            if (
                end !== null
                && (start === null || end > start)
            ) {
                hasExplicitDuration = true;
            }

            if (hasUsableWordTiming(lyric)) {
                hasAdvancingCueTiming = true;
            }
        });

        if (hasAdvancingCueTiming) return 'enhanced';
        if (
            hasExplicitDuration
            || lineStarts.size > 1
            || Array.from(lineStarts).some(start => start > 0)
        ) {
            return 'line';
        }

        return 'plain';
    }

    function usableEnhancedCueCount(lyrics) {
        if (lyricTimingMode(lyrics) !== 'enhanced') return 0;

        return lyrics.reduce((total, lyric) => {
            return total + usableWordCueRanges(lyric).length;
        }, 0);
    }

    function cueValue(cue, pascal, camel) {
        if (!cue) return undefined;
        return cue[pascal] !== undefined ? cue[pascal] : cue[camel];
    }

    function lyricValue(lyric, pascal, camel) {
        if (!lyric) return undefined;
        return lyric[pascal] !== undefined ? lyric[pascal] : lyric[camel];
    }

    function orderedCuesBySourcePosition(cues) {
        const source = Array.isArray(cues) ? cues : [];
        if (source.length < 2) return source.slice();

        /*
         * Source positions are optional provider data. Sort only when every
         * cue supplies a finite position. Treating null as Number(null) === 0
         * can incorrectly drag an unknown cue to the front of the line and
         * corrupt both word spans and Romanized source-boundary mapping.
         * When positions are incomplete, provider array order is the only
         * stable ordering evidence we actually have.
         */
        const positions = source.map(cue => nullableTick(
            cueValue(cue, 'Position', 'position')
        ));

        if (positions.some(position => position === null)) {
            return source.slice();
        }

        return source
            .map((cue, index) => ({ cue, index, position: positions[index] }))
            .sort((left, right) =>
                left.position - right.position || left.index - right.index
            )
            .map(entry => entry.cue);
    }

    function normalizedCueTextRanges(cues, rawTextLength) {
        const source = Array.isArray(cues) ? cues : [];
        const textLength = Math.max(0, Number(rawTextLength) || 0);
        if (!source.length || !textLength) return [];

        const positions = source.map(cue => nullableTick(
            cueValue(cue, 'Position', 'position')
        ));

        /* Without source positions there is no reliable way to identify the
         * timed text. Rendering it as word karaoke creates transparent or
         * misaligned spans, so leave that row line-synchronised instead. */
        if (positions.some(position => position === null)) return [];

        return source.reduce((ranges, cue, cueIndex) => {
            const rawStart = Math.max(
                0,
                Math.min(textLength, positions[cueIndex])
            );
            const explicitEnd = nullableTick(
                cueValue(cue, 'EndPosition', 'endPosition')
            );
            let rawEnd = explicitEnd === null
                ? rawStart
                : Math.max(0, Math.min(textLength, explicitEnd));

            if (rawEnd <= rawStart) {
                const nextPosition = positions
                    .slice(cueIndex + 1)
                    .find(position => position > rawStart);
                rawEnd = nextPosition === undefined
                    ? textLength
                    : Math.min(textLength, nextPosition);
            }

            if (rawEnd > rawStart) {
                ranges.push({
                    cue,
                    cueIndex,
                    startPosition: rawStart,
                    endPosition: rawEnd
                });
            }
            return ranges;
        }, []);
    }

    function usableWordCueRanges(lyric, orderedCues = null) {
        const profile = lyricTextProfile(lyric);
        const rawCues = orderedCues || orderedCuesBySourcePosition(
            lyricValue(lyric, 'Cues', 'cues')
        );

        const candidates = normalizedCueTextRanges(
            rawCues,
            profile.rawText.length
        ).filter(range => {
            const start = Math.max(
                0,
                range.startPosition - profile.positionOffset
            );
            const end = Math.max(
                start,
                range.endPosition - profile.positionOffset
            );
            const cueStart = finiteTick(
                cueValue(range.cue, 'Start', 'start')
            );
            return cueStart !== null
                && end > start
                && /\S/u.test(profile.text.slice(start, end));
        });

        /*
         * Some providers repeat a whole-line cue for each timestamp. Those
         * records look populated but their nested text spans make every word
         * inherit the line duration. Retain only source ranges that move
         * forward through displayed text; falling back to line timing is safer
         * than a false full-line karaoke sweep.
         */
        const advancing = [];
        let previousEnd = -1;

        candidates.forEach(range => {
            const start = Math.max(
                0,
                range.startPosition - profile.positionOffset
            );
            const end = Math.max(
                start,
                range.endPosition - profile.positionOffset
            );

            if (start < previousEnd) return;

            advancing.push(range);
            previousEnd = end;
        });

        return advancing;
    }

    function hasUsableWordTiming(lyric, orderedCues = null) {
        const ranges = usableWordCueRanges(lyric, orderedCues);
        if (ranges.length < 2) return false;

        const starts = new Set(
            ranges.map(range =>
                finiteTick(cueValue(range.cue, 'Start', 'start'))
            )
        );
        return starts.size >= 2;
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
        return nullableTick(
            cueValue(record.cue, 'Start', 'start')
        ) ?? 0;
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
        const reducedMotion = prefersReducedMotion();

        words.forEach(word => {
            if (
                reducedMotion
                ||
                !word.segments.length
                || !Number.isFinite(word.start)
                || !Number.isFinite(word.end)
                || word.end <= word.start
            ) {
                word.motionMode = 'none';
                word.motionGlow = false;
                word.motionDurationMs = 0;
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

            /* Motion and bloom are one effect. Words that miss the complete
             * grow/glow eligibility test keep only their neutral timed sweep;
             * a lift without its bloom reads as a stray vertical jump. */
            word.motionMode = growable ? 'grow' : 'none';

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

        const fullWidth = prefixWidth(textNode.length);

        /* Do not manufacture Range geometry from the word's box when Range
         * measurement failed. A zero-width prefix combined with a non-zero
         * box maps every segment to 0% and makes the sweep appear only at the
         * final frame. Leaving visual bounds unset intentionally uses the
         * reliable source-character fallback in wordTargetProgress(). */
        if (Number.isFinite(fullWidth) && fullWidth > 0) {
            const measuredSegments = word.segments.map(segment => ({
                segment,
                start: prefixWidth(segment.startPos),
                end: prefixWidth(segment.endPos)
            }));
            const valid = measuredSegments.every(entry =>
                Number.isFinite(entry.start)
                && Number.isFinite(entry.end)
                && entry.end > entry.start
                && entry.start >= 0
                && entry.end <= fullWidth + 0.5
            );

            if (valid) {
                word.renderWidth = fullWidth;
                measuredSegments.forEach(entry => {
                    entry.segment.visualStart = clamp01(
                        entry.start / fullWidth
                    );
                    entry.segment.visualEnd = clamp01(
                        entry.end / fullWidth
                    );
                });
                word.geometryReady = true;
            }
        }

        const glyphCount =
            Math.max(1, visibleWordLength(word));

        const extra =
            clamp01((glyphCount - 6) / 10)
            * LONG_WORD_WIPE_EXTRA_EM;

        const wipeWidth =
            BASE_WIPE_GRADIENT_EM + extra;

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
        const layoutWidth = Number(word.element.offsetWidth);
        const layoutHeight = Number(word.element.offsetHeight);
        const scaleX =
            Number.isFinite(layoutWidth)
            && layoutWidth > 0
                ? wordRect.width / layoutWidth
                : 1;
        const scaleY =
            Number.isFinite(layoutHeight)
            && layoutHeight > 0
                ? wordRect.height / layoutHeight
                : 1;
        const usableScaleX = Number.isFinite(scaleX) && scaleX > 0
            ? scaleX
            : 1;
        const usableScaleY = Number.isFinite(scaleY) && scaleY > 0
            ? scaleY
            : 1;
        const localWordRect = {
            width: wordRect.width / usableScaleX,
            height: wordRect.height / usableScaleY
        };

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
                        /* Range rectangles are viewport-space and include the
                         * line/word scale. Glyph overlays are children of the
                         * already-transformed word, so convert them back to
                         * local coordinates instead of applying that scale a
                         * second time. */
                        left: (rect.left - wordRect.left) / usableScaleX,
                        top: (rect.top - wordRect.top) / usableScaleY,
                        width: rect.width / usableScaleX,
                        height: rect.height / usableScaleY
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
                localWordRect
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

        alignBackgroundVocalAnchors();
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
            if (!stored || stored === 'song') {
                return 'shuffle';
            }

            if (
                stored === 'shuffle'
                || stored === 'off'
                || findAccent(stored)
            ) {
                return stored;
            }

            /* Stale/hand-edited values must not poison every song load. */
            return 'shuffle';
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
            || NEUTRAL_ACCENT;
    }

    function applyAccentTheme() {
        if (!isLyricsPage()) return;

        const page =
            getCurrentLyricPage();
        const container =
            getCurrentLyricsContainer(false);

        if (!page && !container) return;

        const accent =
            currentAccent();
        const primary = accent.rgb;
        const secondary =
            accent.secondaryRgb
            || primary;
        const tertiary =
            accent.tertiaryRgb
            || secondary;

        /*
         * Apply the palette at BOTH scopes. Older releases declared fallback
         * glow variables directly on .ak-karaoke-container, which shadowed the
         * song-level variables set on .lyricPage and made every palette look
         * like Champagne Gold. Inline values on the live container make the
         * selected palette authoritative even when stale/custom CSS defines a
         * descendant fallback. The page copy keeps atmosphere/other descendants
         * on the same theme.
         */
        const targets = [];
        if (page) targets.push(page);
        if (container && container !== page) targets.push(container);

        targets.forEach(target => {
            if (!target || !target.style) return;

            target.style.setProperty(
                '--ak-glow-primary-rgb',
                primary
            );
            target.style.setProperty(
                '--ak-glow-secondary-rgb',
                secondary
            );
            target.style.setProperty(
                '--ak-glow-tertiary-rgb',
                tertiary
            );

            if (target.dataset) {
                target.dataset.akGlowTheme =
                    accent.id;
            }
        });
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
                    || NEUTRAL_ACCENT;
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
                state.accent.secondaryRgb,
            tertiaryRgb:
                state.accent.tertiaryRgb
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

        wakeAnimationLoop();

        return {
            mode: state.accentMode,
            accent: state.accent.id,
            name: state.accent.name,
            primaryRgb: state.accent.rgb,
            secondaryRgb:
                state.accent.secondaryRgb,
            tertiaryRgb:
                state.accent.tertiaryRgb
        };
    }

    function currentAccent() {
        return state.accent || NEUTRAL_ACCENT;
    }

    function retireDecoratedLines(hide = true) {
        removeInstrumentalGapRows();

        state.lineData.forEach(lineRecord => {
            const element =
                lineRecord && lineRecord.element;

            if (!element || !element.isConnected) return;

            try {
                const ownsRenderedChildren =
                    lineHasOwnedLyricNodes(element);

                Array.from(element.classList || [])
                    .filter(name => name.indexOf('ak-') === 0)
                    .forEach(name => element.classList.remove(name));

                delete element.dataset.akGeneration;
                delete element.dataset.akLyricIdentity;
                delete element.dataset.akTimingLineIndex;
                delete element.dataset.akVocalRole;
                delete element.dataset.akVocalRoleSource;
                delete element.dataset.akBackgroundAttachment;
                delete element.dataset.akBackgroundAnchorLine;
                element.style.removeProperty('--ak-bg-anchor-offset');

                if (hide) {
                    /* Jellyfin may replace/reuse this node on the next SPA
                     * task. Hide only while a new song response is pending so
                     * the old track cannot flash during the hand-off. */
                    element.style.visibility = 'hidden';
                    element.setAttribute('aria-hidden', 'true');
                    if (!state.retiredLineElements.includes(element)) {
                        state.retiredLineElements.push(element);
                    }
                } else {
                    /* A completed no-lyrics response must never inherit the
                     * pending-switch hidden state. If the framework has not
                     * replaced our old word spans yet, clear just those owned
                     * children and leave a visible native container for it. */
                    element.style.removeProperty('visibility');
                    element.removeAttribute('aria-hidden');
                    element.removeAttribute('aria-label');
                    element.removeAttribute('dir');
                    if (ownsRenderedChildren) {
                        replaceChildrenCompat(element);
                    }
                }
            } catch {
                // A framework-owned node can detach in the middle of cleanup.
            }
        });

        if (!hide && state.retiredLineElements.length) {
            state.retiredLineElements.forEach(element => {
                if (!element || !element.isConnected) return;

                try {
                    Array.from(element.classList || [])
                        .filter(name => name.indexOf('ak-') === 0)
                        .forEach(name => element.classList.remove(name));
                    element.style.removeProperty('visibility');
                    element.style.removeProperty('--ak-bg-anchor-offset');
                    element.removeAttribute('aria-hidden');
                    element.removeAttribute('aria-label');
                    element.removeAttribute('dir');
                    if (lineHasOwnedLyricNodes(element)) {
                        replaceChildrenCompat(element);
                    }
                } catch {
                    // The framework can detach a pending node during cleanup.
                }
            });
            state.retiredLineElements = [];
        }

        const container =
            getCurrentLyricsContainer(false);

        if (container) {
            container.classList.remove(
                'ak-karaoke-container',
                'ak-plain-lyrics-container'
            );

            Array.from(
                container.querySelectorAll('.ak-plain-line')
            ).forEach(line => {
                Array.from(line.classList || [])
                    .filter(name =>
                        name === 'ak-plain-line'
                        || name.indexOf('ak-script-') === 0
                    )
                    .forEach(name => line.classList.remove(name));
                line.removeAttribute('dir');
            });
        }
    }

    function clearCapturedLyrics(source = 'clear') {
        const hadLyrics = !!state.lyrics || state.lineData.length > 0;
        const keepDynamicVisible = isLyricsPage();

        cancelDecorationRetry(true);
        if (state.geometryTimer) {
            clearTimeout(state.geometryTimer);
            state.geometryTimer = 0;
        }
        if (state.backgroundAnchorTimer) {
            clearTimeout(state.backgroundAnchorTimer);
            state.backgroundAnchorTimer = 0;
        }

        /* Cancel any artwork decode owned by the outgoing track, but never hide
         * or reset the currently rendered field during lyric-payload churn. */
        invalidateAtmosphereLoads(source);
        stopAnimationLoop(source);
        retireDecoratedLines(source === 'request-switch');

        if (keepDynamicVisible) {
            const root = state.atmosphereRoot;
            if (root && root.isConnected && state.atmosphereArtwork) {
                root.classList.add('ak-atmosphere-ready');
            }
            document.documentElement.classList.add('ak-lyricmotion-atmosphere-active');
            document.documentElement.classList.add('ak-atmosphere-dynamic-mode');
        } else {
            removeAtmosphereRoot(source);
        }

        state.lyrics = null;
        state.lyricsAcceptedKey = '';
        if (hadLyrics) state.generation += 1;
        state.decoratedGeneration = -1;
        state.lineData = [];
        state.timedCueCount = 0;
        state.lyricTimingMode = 'none';
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
        if (typeof removeRomanizationToggle === 'function') removeRomanizationToggle();
        if (typeof removeTimingControls === 'function') removeTimingControls();
        if (state.lyricToolsHost && state.lyricToolsHost.parentNode) {
            state.lyricToolsHost.parentNode.removeChild(state.lyricToolsHost);
        }
        state.lyricToolsHost = null;
        state.lastActiveLine = -999;
        state.lastActiveLineSignature = '';
        state.activeLineIndexes = [];
        resetMotionHandoffs();
        state.lyricAutoFollowSuspendedUntil = 0;
        state.lyricAutoFollowLastIndex = -1;
        state.lyricAutoFollowLastAt = 0;
        state.lyricAutoFollowLastReason = 'lyrics-cleared';
        state.lineEndPrefix = [];
        state.instrumentalGaps = [];
        state.activeInstrumentalGapIndex = -1;
        state.instrumentalPhaseActiveIndex = -1;
        state.instrumentalPastCount = 0;
        state.instrumentalGapRenderCount = 0;
        state.instrumentalGapMaxDurationTicks = 0;
        state.overlapFrameCount = 0;
        state.maxSimultaneousLines = 1;
        resetPlaybackClock();

        if (hadLyrics) log(`cleared captured lyrics from ${source}`);
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

    function beginLyricsRequest(
        url
    ) {
        const key = lyricsRequestIdentity(url);
        if (!key) return 0;

        /* Keep request identity only in normalized form. Do not retain the
         * complete request URL because Jellyfin URLs can contain authentication
         * or cache query parameters that LyricMotion does not need after the
         * interceptor has classified the request. */

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

    function scheduleLyricVisualRecoveryBurst(generation, reason = 'lyrics') {
        for (const delay of [48, 160, 420]) {
            window.setTimeout(() => {
                if (
                    generation !== state.generation
                    || !state.lyrics
                    || document.hidden
                    || !isLyricsPage()
                ) {
                    return;
                }

                if (!lyricVisualDomHealthy()) {
                    queueDecoration();
                    return;
                }

                wakeAnimationLoop();
            }, delay);
        }
        return reason;
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
        state.lyricTimingMode = lyricTimingMode(lyrics);
        selectSongAccent(lyrics);

        /* Lyrics and background are independent state machines. Keep the current
         * shader field visible, invalidate only obsolete asynchronous art work,
         * then probe the CURRENT media element several times while Jellyfin swaps
         * its player source. */
        invalidateAtmosphereLoads('lyrics-accepted');
        state.atmosphereFailedKey = '';
        state.atmosphereLastCheck = 0;
        scheduleDynamicBackgroundProbeBurst('lyrics-accepted');

        const cueCount = usableEnhancedCueCount(lyrics);

        state.timedCueCount = cueCount;
        state.lastActiveLine = -999;
        state.lastActiveLineSignature = '';
        state.activeLineIndexes = [];
        resetMotionHandoffs();
        state.lyricAutoFollowSuspendedUntil = 0;
        state.lyricAutoFollowLastIndex = -1;
        state.lyricAutoFollowLastReason = 'lyrics-accepted';
        state.lineEndPrefix = [];
        state.instrumentalGaps = [];
        state.activeInstrumentalGapIndex = -1;
        state.instrumentalPhaseActiveIndex = -1;
        state.instrumentalPastCount = 0;
        state.instrumentalGapRenderCount = 0;
        state.instrumentalGapMaxDurationTicks = 0;
        state.overlapFrameCount = 0;
        state.maxSimultaneousLines = 1;
        resetPlaybackClock();
        applySongPreferences(lyrics);

        log(
            `captured ${lyrics.length} lyric lines / ${cueCount} usable cues `
            + `(${state.lyricTimingMode}) from ${source}`
        );
        if (typeof prepareRomanizationForLyrics === 'function') {
            prepareRomanizationForLyrics();
        }
        queueDecoration();
        scheduleLyricVisualRecoveryBurst(state.generation, 'lyrics-accepted');

        if (state.lyricTimingMode === 'plain') {
            log('Plain unsynced lyrics detected; applying typography-only presentation.');
        } else if (cueCount === 0) {
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

    function lyricsResponseDisposition(status) {
        const numeric = Number(status);

        if (numeric === 204 || numeric === 404) {
            return 'empty';
        }

        if (Number.isFinite(numeric) && numeric >= 200 && numeric < 300) {
            return 'json';
        }

        /* A transient auth/server/network response must not erase lyrics that
         * are already on screen. Only an authoritative empty status or a
         * successful JSON response can replace the captured model. */
        return 'ignore';
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
                    const disposition =
                        lyricsResponseDisposition(
                            response.status
                        );

                    if (disposition === 'empty') {
                        acceptLyricsPayload(
                            { Lyrics: [] },
                            'fetch-empty',
                            effectiveSeq
                        );
                    } else if (disposition === 'json') {
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

                        const disposition =
                            lyricsResponseDisposition(
                                this.status
                            );

                        if (disposition === 'empty') {
                            acceptLyricsPayload(
                                { Lyrics: [] },
                                'XMLHttpRequest-empty',
                                effectiveSeq
                            );
                            return;
                        }

                        if (disposition !== 'json') return;

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

            /* Some lyric import/export paths escape an opening parenthesis as
             * `\(` even though the backslash is transport syntax, not sung
             * text. Treat that one leading escape as part of the role prefix so
             * both display text and Jellyfin cue positions remain aligned. */
            if (
                rawText.slice(markerLength, markerLength + 2) === '\\('
                || rawText.slice(markerLength, markerLength + 2) === '\\（'
            ) {
                markerLength += 1;
            }
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

            /* Recovery path for providers/libraries that preserve the lyric but
             * lose its x-bg role. Keep this deliberately narrow so ordinary
             * parenthetical punctuation inside a lead line is not reclassified:
             * only a complete, short parenthetical response becomes backing
             * vocal content. This restores the behavior used before 3.2.x. */
            const firstCharacter = trimmed.charAt(0);
            const lastCharacter = trimmed.charAt(trimmed.length - 1);
            const completeParenthetical =
                (firstCharacter === '(' && lastCharacter === ')')
                || (firstCharacter === '（' && lastCharacter === '）')
                || (trimmed.indexOf('\\(') === 0 && lastCharacter === ')')
                || (trimmed.indexOf('\\（') === 0 && lastCharacter === '）');

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
            text: markerLength > 0
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
            const start = nullableTick(
                lyricValue(lyric, 'Start', 'start')
            );
            const end = nullableTick(
                lyricValue(lyric, 'End', 'end')
            );
            const rawCues = lyricValue(lyric, 'Cues', 'cues');
            const cues = Array.isArray(rawCues) ? rawCues : [];
            const cueSignature = cues.map(cue => [
                nullableTick(cueValue(cue, 'Position', 'position')),
                nullableTick(cueValue(cue, 'EndPosition', 'endPosition')),
                nullableTick(cueValue(cue, 'Start', 'start')),
                nullableTick(cueValue(cue, 'End', 'end'))
            ].map(value => value === null ? 'null' : value).join(':')).join(',');

            parts.push(
                `${lineIndex}:${start === null ? 'null' : start}:${end === null ? 'null' : end}:${profile.rawText}:${cueSignature}`
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

        const sorted = orderedCuesBySourcePosition(rawCues);
        const ranges = normalizedCueTextRanges(
            sorted,
            profile.rawText.length
        );
        const rangeByCueIndex = new Map(
            ranges.map(range => [range.cueIndex, range])
        );

        const convertedCues = sorted.map((cue, cueIndex) => {
            let start = nullableTick(cueValue(cue, 'Position', 'position'));
            let end = nullableTick(cueValue(cue, 'EndPosition', 'endPosition'));
            if (start === null) return Object.assign({}, cue);
            const range = rangeByCueIndex.get(cueIndex);
            if (range) {
                start = range.startPosition;
                end = range.endPosition;
            } else if (end === null) {
                end = start;
            }
            start = Math.max(profile.positionOffset, Math.min(profile.rawText.length, start));
            end = Math.max(start, Math.min(profile.rawText.length, end));

            const sourceStart = Math.max(0, Math.min(
                sourceText.length,
                start - profile.positionOffset
            ));
            const sourceEnd = Math.max(sourceStart, Math.min(
                sourceText.length,
                end - profile.positionOffset
            ));

            return cloneCueWithPositions(
                cue,
                profile.positionOffset + romanizedBoundaryStart(sourceText, sourceStart, convertedLine),
                profile.positionOffset + romanizedBoundaryEnd(sourceText, sourceEnd, convertedLine)
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
        const bar = state.lyricToolsBar;

        if (bar && (!bar.isConnected || !bar.childElementCount)) {
            if (bar.parentNode) bar.parentNode.removeChild(bar);
            state.lyricToolsBar = null;
        }

        if (!host || !host.isConnected) {
            state.lyricToolsHost = null;
            state.lyricToolsBar = null;
            return;
        }

        const hasPopover = !!(
            state.timingPopover
            && state.timingPopover.isConnected
        );
        const hasBar = !!(
            state.lyricToolsBar
            && state.lyricToolsBar.isConnected
            && state.lyricToolsBar.childElementCount
        );

        if (!hasPopover && !hasBar && host.parentNode) {
            host.parentNode.removeChild(host);
            state.lyricToolsHost = null;
            state.lyricToolsBar = null;
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
            state.lyricToolsBar = null;
        } else if (host.parentNode !== page) {
            page.appendChild(host);
        }
        return host;
    }

    function ensureLyricsToolsBar() {
        const host = ensureLyricsToolsHost();
        if (!host) return null;

        let bar = state.lyricToolsBar;
        if (!bar || !bar.isConnected) {
            bar = document.createElement('div');
            bar.className = 'ak-lyrics-tools-bar';
            bar.dataset.akOwned = '1';
            host.insertBefore(bar, host.firstChild || null);
            state.lyricToolsBar = bar;
        } else if (bar.parentNode !== host) {
            host.insertBefore(bar, host.firstChild || null);
        }

        return bar;
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
        const sync =
            popover.querySelector('[data-ak-timing-action="sync-one"]');
        const reset =
            popover.querySelector('[data-ak-timing-action="reset"]');

        if (current) current.textContent = formatTimingOffset();

        if (sync) {
            sync.textContent = state.timingPickActive
                ? 'Tap lyric to sync…'
                : 'Sync lyric to now';
            sync.dataset.akTimingActive = state.timingPickActive
                ? 'true'
                : 'false';
        }

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

        /* Jellyfin follows the uncorrected source line on every timeupdate.
         * Once an offset is changed, make LyricMotion the sole scroll owner so
         * the source and corrected targets cannot pull the view up and down. */
        suppressJellyfinLyricAutoFollow('timing-offset-change');

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

    function mediaSeekSecondsForTimelineTicks(
        media,
        timelineTicks,
        frameNow = performance.now()
    ) {
        if (!media || !Number.isFinite(timelineTicks)) return null;

        const currentSeconds = Math.max(
            0,
            Number(media.currentTime) || 0
        );
        const now = Number.isFinite(frameNow)
            ? frameNow
            : performance.now();

        /*
         * Resolve the target from the same source timeline that drives lyric
         * painting instead of assuming that media.currentTime is always the
         * original file timeline. This keeps explicit lyric seeking correct
         * with per-song timing correction and Jellyfin StartTimeTicks streams.
         * Resetting the projection first removes interpolation lead from a
         * user-initiated seek, so a click lands on the exact corrected anchor.
         */
        resetPlaybackClock(media, now);

        const currentTimelineTicks =
            chooseTimelineTicks(media, now);

        if (!Number.isFinite(currentTimelineTicks)) return null;

        let targetSeconds =
            currentSeconds
            + (
                timelineTicks
                - currentTimelineTicks
            ) / TICKS_PER_SECOND;

        if (!Number.isFinite(targetSeconds)) return null;

        targetSeconds = Math.max(0, targetSeconds);

        const duration = Number(media.duration);
        if (Number.isFinite(duration) && duration > 0) {
            targetSeconds = Math.min(duration, targetSeconds);
        }

        return targetSeconds;
    }

    function seekMediaToTimelineTicks(
        timelineTicks,
        kind = 'lyric'
    ) {
        if (!Number.isFinite(timelineTicks)) return false;

        const media = getLocalMediaElement(true);
        if (!media) return false;

        const frameNow = performance.now();
        const targetSeconds =
            mediaSeekSecondsForTimelineTicks(
                media,
                timelineTicks,
                frameNow
            );

        if (!Number.isFinite(targetSeconds)) return false;

        try {
            media.currentTime = targetSeconds;
        } catch {
            return false;
        }

        resetPlaybackClock(media, frameNow);
        state.lastActiveLine = -999;
        state.lastActiveLineSignature = '';
        state.activeLineIndexes = [];
        state.forceNextFrame = true;
        state.lyricSeekCount += 1;
        if (kind === 'instrumental') {
            state.instrumentalSeekCount += 1;
        }
        state.lastLyricSeekKind = kind;
        state.lastLyricSeekSourceTicks = timelineTicks;
        state.lastLyricSeekMediaSeconds = targetSeconds;
        wakeAnimationLoop();
        return true;
    }

    function lyricLineIndexForTarget(target) {
        if (!target || !target.closest) return -1;

        const lineElement = target.closest('.ak-enhanced-line');
        if (!lineElement) return -1;

        const lineIndex = Number(
            lineElement.dataset.akTimingLineIndex
        );

        return (
            Number.isInteger(lineIndex)
            && lineIndex >= 0
            && lineIndex < state.lineData.length
        )
            ? lineIndex
            : -1;
    }

    function lyricAutoFollowReducedMotion() {
        try {
            if (!reducedMotionMediaQuery && window.matchMedia) {
                reducedMotionMediaQuery = window.matchMedia(
                    '(prefers-reduced-motion: reduce)'
                );
            }
            return !!(
                reducedMotionMediaQuery
                && reducedMotionMediaQuery.matches
            );
        } catch {
            return false;
        }
    }

    function suppressJellyfinLyricAutoFollow(
        reason = 'lyric-motion-follow'
    ) {
        if (
            typeof document === 'undefined'
            || !isLyricsPage()
        ) {
            return false;
        }

        /* Jellyfin's lyrics controller disables its private autoScroll state
         * on wheel/touchmove. There is no public controller API for this. A
         * zero-delta synthetic wheel uses that controller path while our own
         * capture listener explicitly ignores the internal event. */
        try {
            const event = new Event('wheel', {
                bubbles: true,
                cancelable: false
            });
            event.akLyricMotionInternal = true;
            document.dispatchEvent(event);
        } catch {
            return false;
        }

        state.lyricStockAutoFollowSuppressCount += 1;
        state.lyricStockAutoFollowLastReason = reason;
        return true;
    }

    function resumeLyricAutoFollow(reason = 'resume') {
        state.lyricAutoFollowSuspendedUntil = 0;
        state.lyricAutoFollowLastReason = reason;
    }

    function suspendLyricAutoFollow(
        reason = 'manual-scroll',
        frameNow = performance.now()
    ) {
        state.lyricAutoFollowSuspendedUntil =
            frameNow + LYRIC_AUTO_FOLLOW_MANUAL_GRACE_MS;
        state.lyricAutoFollowManualScrollCount += 1;
        state.lyricAutoFollowLastReason = reason;
    }

    function focusLyricLineIndex(
        lineIndex,
        {
            force = false,
            behavior = 'smooth',
            reason = 'playback'
        } = {}
    ) {
        if (
            !Number.isInteger(lineIndex)
            || lineIndex < 0
            || lineIndex >= state.lineData.length
        ) {
            return false;
        }

        const lineRecord = state.lineData[lineIndex];
        const element = lineRecord && lineRecord.element;
        if (
            !element
            || element.isConnected === false
            || typeof element.scrollIntoView !== 'function'
        ) {
            return false;
        }

        const now = performance.now();

        if (
            !force
            && (
                state.timingPickActive
                || now < state.lyricAutoFollowSuspendedUntil
            )
        ) {
            return false;
        }

        if (
            !force
            && state.lyricAutoFollowLastIndex === lineIndex
        ) {
            return false;
        }

        const resolvedBehavior =
            lyricAutoFollowReducedMotion()
                ? 'auto'
                : behavior;

        try {
            element.scrollIntoView({
                behavior: resolvedBehavior,
                block: 'center',
                inline: 'nearest'
            });
        } catch {
            try {
                element.scrollIntoView();
            } catch {
                return false;
            }
        }

        state.lyricAutoFollowLastIndex = lineIndex;
        state.lyricAutoFollowLastAt = now;
        state.lyricAutoFollowScrollCount += 1;
        state.lyricAutoFollowLastReason = reason;
        if (force) state.lyricAutoFollowForceCount += 1;
        return true;
    }

    function handleLyricManualScroll(event) {
        if (!isLyricsPage()) return;
        if (event && event.akLyricMotionInternal) return;

        const page = getCurrentLyricPage();
        const target = event && event.target;
        if (
            page
            && target
            && typeof page.contains === 'function'
            && !page.contains(target)
        ) {
            return;
        }

        suspendLyricAutoFollow(
            event && event.type
                ? `manual-${event.type}`
                : 'manual-scroll'
        );
    }

    function installLyricAutoFollowHooks() {
        if (
            state.lyricAutoFollowInstalled
            || typeof document === 'undefined'
        ) {
            return;
        }

        document.addEventListener(
            'wheel',
            handleLyricManualScroll,
            { capture: true, passive: true }
        );
        document.addEventListener(
            'touchmove',
            handleLyricManualScroll,
            { capture: true, passive: true }
        );
        state.lyricAutoFollowInstalled = true;
    }

    function lyricLineSourceTicksForTarget(target) {
        if (!target || !target.closest) return null;

        const lineElement = target.closest('.ak-enhanced-line');
        if (!lineElement) return null;

        const lineIndex = Number(
            lineElement.dataset.akTimingLineIndex
        );

        if (
            !Number.isInteger(lineIndex)
            || lineIndex < 0
            || lineIndex >= state.lineData.length
        ) {
            return null;
        }

        const line = state.lineData[lineIndex];
        return line && Number.isFinite(line.startTicks)
            ? line.startTicks
            : null;
    }

    function instrumentalSourceTicksForTarget(target) {
        if (!target || !target.closest) return null;

        const note = target.closest('.ak-instrumental-note');
        if (!note) return null;

        const row = note.closest('.ak-instrumental-gap-line');
        if (!row) return null;

        const gapIndex = Number(row.dataset.akInstrumentalGap);
        const gap = Number.isInteger(gapIndex)
            ? state.instrumentalGaps[gapIndex]
            : null;

        return gap && Number.isFinite(gap.startTicks)
            ? gap.startTicks
            : null;
    }

    function handleLyricSeekClick(event) {
        if (state.timingPickActive) return;

        const target = event && event.target;
        if (!target || !target.closest) return;

        if (
            Number.isFinite(Number(event.button))
            && Number(event.button) !== 0
        ) {
            return;
        }

        const instrumentalTicks =
            instrumentalSourceTicksForTarget(target);

        if (Number.isFinite(instrumentalTicks)) {
            if (
                seekMediaToTimelineTicks(
                    instrumentalTicks,
                    'instrumental'
                )
            ) {
                event.preventDefault();
                if (typeof event.stopImmediatePropagation === 'function') {
                    event.stopImmediatePropagation();
                } else {
                    event.stopPropagation();
                }
            }
            return;
        }

        const lineIndex = lyricLineIndexForTarget(target);
        if (lineIndex < 0) return;

        /*
         * A lyric click is also an explicit request to resume follow mode.
         * Jellyfin normally performs that bookkeeping inside its own click
         * handler. Corrected-timing clicks are intercepted before Jellyfin, so
         * LyricMotion must restore focus itself or a prior manual scroll can
         * leave playback updating off-screen indefinitely.
         */
        resumeLyricAutoFollow('lyric-click');
        focusLyricLineIndex(
            lineIndex,
            {
                force: true,
                behavior: 'smooth',
                reason: 'lyric-click'
            }
        );

        /*
         * Preserve stock Jellyfin click behavior when no timing correction is
         * active. Once a correction exists, stock seeking still targets the
         * uncorrected lyric timestamp, which makes the renderer land on the
         * previous/next line by exactly the configured offset. Intercept only
         * that corrected case and seek on LyricMotion's adjusted timeline.
         */
        if (Math.abs(state.timingOffsetSeconds) < 0.0001) return;

        const lineTicks = lyricLineSourceTicksForTarget(target);
        if (!Number.isFinite(lineTicks)) return;

        if (seekMediaToTimelineTicks(lineTicks, 'lyric')) {
            event.preventDefault();
            if (typeof event.stopImmediatePropagation === 'function') {
                event.stopImmediatePropagation();
            } else {
                event.stopPropagation();
            }
        }
    }

    function handleLyricSeekKeydown(event) {
        if (state.timingPickActive) return;

        const key = String(
            (event && event.key) || ''
        );

        if (key !== 'Enter' && key !== ' ' && key !== 'Spacebar') return;

        const target = event && event.target;
        const instrumentalTicks =
            instrumentalSourceTicksForTarget(target);

        if (!Number.isFinite(instrumentalTicks)) return;

        if (
            seekMediaToTimelineTicks(
                instrumentalTicks,
                'instrumental'
            )
        ) {
            event.preventDefault();
            if (typeof event.stopImmediatePropagation === 'function') {
                event.stopImmediatePropagation();
            } else {
                event.stopPropagation();
            }
        }
    }

    function installLyricSeekInteractionHooks() {
        if (
            state.lyricSeekInteractionInstalled
            || typeof document === 'undefined'
        ) {
            return;
        }

        /*
         * Capture registration happens before Jellyfin's runtime.bundle.js
         * loads. This lets a corrected lyric click suppress the stock
         * unadjusted seek without replacing Jellyfin's normal zero-offset path.
         */
        document.addEventListener(
            'click',
            handleLyricSeekClick,
            true
        );
        document.addEventListener(
            'keydown',
            handleLyricSeekKeydown,
            true
        );
        state.lyricSeekInteractionInstalled = true;
    }

    function currentUnadjustedTimelineTicks() {
        const media = getLocalMediaElement(true);
        if (!media) return null;

        const frameNow = performance.now();

        /* Sync is a human tap against audible media, so it must use the exact
         * HTML media clock at the click instant. The animation clock normally
         * projects between currentTime samples for smoother painting, but that
         * projection can be ~100-250 ms ahead of the audible anchor and made
         * "Sync lyric to now" save a visibly wrong correction. */
        resetPlaybackClock(media, frameNow);
        return sourceTimelineTicks(media, frameNow, false);
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
        if (typeof event.stopImmediatePropagation === 'function') {
            event.stopImmediatePropagation();
        } else {
            event.stopPropagation();
        }

        const captured = captureTimingSync(lyricTarget);
        if (captured) {
            /* The capture-phase listener intentionally suppresses Jellyfin's
             * stock lyric click so it cannot perform an uncorrected seek. That
             * also suppresses Jellyfin's normal resume-auto-scroll side effect,
             * so restore focus explicitly after calibration. */
            resumeLyricAutoFollow('timing-sync');
            focusLyricLineIndex(
                captured.lineIndex,
                {
                    force: true,
                    behavior: 'smooth',
                    reason: 'timing-sync'
                }
            );
            removeTimingPopover();
        }
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
        removeTimingPopoverDismissListeners();

        const popover = state.timingPopover;
        if (popover && popover.parentNode) {
            popover.parentNode.removeChild(popover);
        }
        state.timingPopover = null;
        updateTimingControlsUi();
        removeLyricsToolsHostIfEmpty();
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


    function createSpeechIconSvg() {
        const svg = createSvgElement('svg', {
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'aria-hidden': 'true',
            focusable: 'false'
        });
        svg.classList.add('ak-romanization-speech-icon');

        svg.appendChild(createSvgElement('path', {
            d: 'M8.8 20v-4.1l1.9.2a2.3 2.3 0 0 0 2.164-2.1V8.3A5.37 5.37 0 0 0 2 8.25c0 2.8.656 3.054 1 4.55a5.77 5.77 0 0 1 .029 2.758L2 20'
        }));
        svg.appendChild(createSvgElement('path', {
            d: 'M19.8 17.8a7.5 7.5 0 0 0 .003-10.603'
        }));
        svg.appendChild(createSvgElement('path', {
            d: 'M17 15a3.5 3.5 0 0 0-.025-4.975'
        }));

        return svg;
    }


    function createTimingIconSvg() {
        const svg = createSvgElement('svg', {
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'aria-hidden': 'true',
            focusable: 'false'
        });
        svg.classList.add('ak-timing-clock-icon');
        svg.appendChild(createSvgElement('circle', {
            cx: '12',
            cy: '13',
            r: '8'
        }));
        svg.appendChild(createSvgElement('path', {
            d: 'M12 9v4l2.5 1.5'
        }));
        svg.appendChild(createSvgElement('path', {
            d: 'M9 2h6M12 2v3'
        }));
        return svg;
    }

    function handleTimingPopoverDismissPointerDown(event) {
        if (
            !state.timingPopover
            || !state.timingPopover.isConnected
        ) {
            removeTimingPopoverDismissListeners();
            return;
        }

        const target = event.target;
        const insidePopover = !!(
            target
            && target.closest
            && target.closest('#ak-lyrics-timing-popover')
        );
        const insideChip = !!(
            target
            && target.closest
            && target.closest('#lyrics-timing-display')
        );

        const timingPickTarget = !!(
            state.timingPickActive
            && target
            && target.closest
            && target.closest('.ak-word, .ak-enhanced-line')
        );

        /* pointerdown occurs before click. Closing here used to call
         * stopTimingSyncMode(), remove the click listener, and silently cancel
         * the very lyric tap the user was trying to use as the sync anchor. */
        if (!insidePopover && !insideChip && !timingPickTarget) {
            removeTimingPopover();
        }
    }

    function handleTimingPopoverDismissKeyDown(event) {
        if (event && event.key === 'Escape') {
            removeTimingPopover();
        }
    }

    function installTimingPopoverDismissListeners() {
        if (state.timingPopoverDismissInstalled) return;
        document.addEventListener(
            'pointerdown',
            handleTimingPopoverDismissPointerDown,
            true
        );
        document.addEventListener(
            'keydown',
            handleTimingPopoverDismissKeyDown,
            true
        );
        state.timingPopoverDismissInstalled = true;
    }

    function removeTimingPopoverDismissListeners() {
        if (!state.timingPopoverDismissInstalled) return;
        document.removeEventListener(
            'pointerdown',
            handleTimingPopoverDismissPointerDown,
            true
        );
        document.removeEventListener(
            'keydown',
            handleTimingPopoverDismissKeyDown,
            true
        );
        state.timingPopoverDismissInstalled = false;
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

        const compactRow = document.createElement('div');
        compactRow.className = 'ak-timing-compact-row';
        compactRow.appendChild(
            createTimingActionButton('−0.1', 'minus-fine')
        );

        const current = document.createElement('strong');
        current.className = 'ak-timing-current-value';
        compactRow.appendChild(current);

        compactRow.appendChild(
            createTimingActionButton('+0.1', 'plus-fine')
        );

        const sync = createTimingActionButton(
            'Sync lyric to now',
            'sync-one',
            'ak-timing-action-wide ak-timing-action-primary'
        );
        sync.setAttribute('aria-live', 'polite');

        const reset = createTimingActionButton(
            'Reset',
            'reset',
            'ak-timing-action-wide'
        );

        popover.appendChild(compactRow);
        popover.appendChild(sync);
        popover.appendChild(reset);

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
            } else if (action === 'sync-one') {
                beginTimingSyncMode();
            } else if (action === 'reset') {
                resetTimingOffsetValue();
            }

            updateTimingControlsUi();
        });

        host.appendChild(popover);
        state.timingPopover = popover;
        installTimingPopoverDismissListeners();
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

        const bar = ensureLyricsToolsBar();
        if (!bar) return null;

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
            icon.appendChild(createTimingIconSvg());

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

            bar.appendChild(controls);
            state.timingControls = controls;
        } else if (controls.parentNode !== bar) {
            bar.appendChild(controls);
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

    }

    function ensureRomanizationToggle() {
        if (!state.romanizationAvailable || !isLyricsPage()) {
            removeRomanizationToggle();
            return null;
        }

        const bar = ensureLyricsToolsBar();
        if (!bar) return null;

        let button = state.romanizationToggle;
        if (!button || !button.isConnected) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = 'ak-romanization-toggle';
            button.setAttribute('aria-label', 'Toggle lyric romanization');

            const icon = document.createElement('span');
            icon.className = 'ak-romanization-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.appendChild(createSpeechIconSvg());

            button.appendChild(icon);
            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                setRomanizationMode(
                    state.romanizationMode === 'romanized'
                        ? 'native'
                        : 'romanized'
                );
            });

            /* Romanization remains the leading desktop/mobile tool, but the
             * shared toolbar presents both controls as one compact glass bar. */
            bar.insertBefore(button, bar.firstChild || null);
            state.romanizationToggle = button;
        } else if (button.parentNode !== bar) {
            bar.insertBefore(button, bar.firstChild || null);
        }

        updateRomanizationToggleUi();
        return button;
    }

    function redecorateForRomanization() {
        state.romanizationLineCount = 0;
        state.lastActiveLine = -999;
        state.lastActiveLineSignature = '';
        state.lyricAutoFollowLastIndex = -1;
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
        if (
            value === null
            || value === undefined
            || value === ''
            || typeof value === 'boolean'
        ) {
            return null;
        }

        const numeric = Number(value);
        return Number.isFinite(numeric)
            ? numeric
            : null;
    }

    function nullableTick(value) {
        return finiteTick(value);
    }

    function nextLyricStartTicks(lineIndex, afterTicks = null) {
        const current = state.lyrics && state.lyrics[lineIndex];
        const currentStart = finiteTick(
            lyricValue(current, 'Start', 'start')
        );
        const threshold = finiteTick(afterTicks) ?? currentStart;

        for (
            let index = lineIndex + 1;
            state.lyrics && index < state.lyrics.length;
            index += 1
        ) {
            const start = finiteTick(
                lyricValue(state.lyrics[index], 'Start', 'start')
            );
            if (
                start !== null
                && (threshold === null || start > threshold)
            ) {
                return start;
            }
        }

        return null;
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
        const trustedEndCandidates = [];
        const lyricEnd = finiteTick(
            lyricValue(lyric, 'End', 'end')
        );

        if (lyricEnd !== null && lyricEnd > startTicks) {
            endCandidates.push(lyricEnd);
            trustedEndCandidates.push(lyricEnd);
        }

        (words || []).forEach(word => {
            const end = finiteTick(word.end);
            if (end !== null && end > startTicks) {
                endCandidates.push(end);
            }
        });

        const cueList = Array.isArray(cues) ? cues : [];
        let terminalTextCue = null;

        let latestTextCueStart = startTicks;

        cueList.forEach(cue => {
            const position = finiteTick(
                cueValue(cue, 'Position', 'position')
            );
            const endPosition = finiteTick(
                cueValue(cue, 'EndPosition', 'endPosition')
            );
            const cueStart = finiteTick(
                cueValue(cue, 'Start', 'start')
            );

            if (
                position !== null
                && position < rawTextLength
                && (
                    endPosition === null
                    || endPosition > position
                )
            ) {
                terminalTextCue = cue;
                if (cueStart !== null) {
                    latestTextCueStart = Math.max(
                        latestTextCueStart,
                        cueStart
                    );
                }
            } else if (
                position === null
                && cueList.length
            ) {
                /*
                 * Some Jellyfin/provider payloads omit source positions. In
                 * that case array order is the only available cue order, so
                 * remember the latest non-empty candidate conservatively.
                 */
                terminalTextCue = cue;
                if (cueStart !== null) {
                    latestTextCueStart = Math.max(
                        latestTextCueStart,
                        cueStart
                    );
                }
            }
        });

        cueList.forEach(cue => {
            const cueStart = finiteTick(
                cueValue(cue, 'Start', 'start')
            );
            const explicitEnd = finiteTick(
                cueValue(cue, 'End', 'end')
            );

            if (
                explicitEnd !== null
                && explicitEnd > Math.max(
                    startTicks,
                    cueStart === null
                        ? startTicks
                        : cueStart
                )
            ) {
                endCandidates.push(explicitEnd);
                if (cue === terminalTextCue) {
                    trustedEndCandidates.push(explicitEnd);
                }
            }

            const position = finiteTick(
                cueValue(cue, 'Position', 'position')
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
                trustedEndCandidates.push(cueStart);
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

        const latestWordStart = wordStarts.length
            ? Math.max(...wordStarts)
            : startTicks;
        const latestVocalStart = Math.max(
            latestTextCueStart,
            latestWordStart
        );
        const trustworthyTerminalEnds =
            trustedEndCandidates.filter(
                value => value > latestVocalStart
            );

        return {
            startTicks,
            endTicks,
            /*
             * Instrumental-break detection must never invent a vocal ending.
             * Only explicit lyric/cue endings or the converter's final empty
             * enhanced timestamp count as trustworthy silence boundaries.
             * A normal LRC line without an end therefore stays conservative
             * and will not create a fake music-note row before the next line.
             */
            trustedEndTicks:
                trustworthyTerminalEnds.length
                    ? Math.max(...trustworthyTerminalEnds)
                    : null
        };
    }

    function planInstrumentalGaps(
        lineData,
        minimumTicks = INSTRUMENTAL_GAP_MIN_TICKS
    ) {
        if (!Array.isArray(lineData) || !lineData.length) return [];

        const threshold = Math.max(
            0,
            finiteNumber(minimumTicks, INSTRUMENTAL_GAP_MIN_TICKS)
        );

        const ordered = lineData
            .map((line, lineIndex) => ({
                line,
                lineIndex,
                startTicks: nullableTick(line && line.startTicks),
                endTicks: nullableTick(line && line.endTicks),
                trustedEndTicks: nullableTick(line && line.trustedEndTicks)
            }))
            .filter(item =>
                item.startTicks !== null
                && (
                    item.line == null
                    || item.line.text == null
                    || String(item.line.text).trim().length > 0
                ))
            .sort((left, right) =>
                left.startTicks - right.startTicks
                || left.lineIndex - right.lineIndex);

        if (!ordered.length) return [];

        /*
         * Several lead/background lines can begin on the same tick. They are
         * one vocal start event, so only the first DOM line in that group can
         * own a synthetic instrumental row.
         */
        const startGroups = [];

        ordered.forEach(item => {
            const previous = startGroups[startGroups.length - 1];

            if (previous && previous.startTicks === item.startTicks) {
                previous.items.push(item);
                previous.targetLineIndex = Math.min(
                    previous.targetLineIndex,
                    item.lineIndex
                );
                return;
            }

            startGroups.push({
                startTicks: item.startTicks,
                targetLineIndex: item.lineIndex,
                items: [item]
            });
        });

        const gaps = [];

        startGroups.forEach((group, groupIndex) => {
            const nextStart = group.startTicks;

            if (!Number.isFinite(nextStart) || nextStart <= 0) return;

            let gapStart = 0;

            if (groupIndex > 0) {
                const previousStart = startGroups[groupIndex - 1].startTicks;
                let foundRelevantVocal = false;
                let unresolvedEnd = false;

                for (const item of ordered) {
                    if (item.startTicks >= nextStart) break;

                    /*
                     * Only vocals that can belong to the immediately prior
                     * overlap block matter. Older completed lines must not
                     * suppress a later instrumental section forever.
                     */
                    const reachesPreviousBlock =
                        item.startTicks >= previousStart
                        || (
                            item.endTicks !== null
                            && item.endTicks > previousStart
                        );

                    if (!reachesPreviousBlock) continue;

                    foundRelevantVocal = true;

                    if (item.trustedEndTicks === null) {
                        unresolvedEnd = true;
                        break;
                    }

                    gapStart = Math.max(
                        gapStart,
                        item.trustedEndTicks
                    );
                }

                if (!foundRelevantVocal || unresolvedEnd) return;
            }

            const durationTicks = nextStart - gapStart;

            if (
                !Number.isFinite(durationTicks)
                || durationTicks < threshold
            ) {
                return;
            }

            gaps.push({
                index: gaps.length,
                startTicks: gapStart,
                endTicks: nextStart,
                durationTicks,
                nextLineIndex: group.targetLineIndex,
                isIntro: groupIndex === 0,
                element: null,
                lastProgress: -1
            });
        });

        return gaps;
    }

    function createSvgElement(name, attributes = null) {
        const node = typeof document.createElementNS === 'function'
            ? document.createElementNS(SVG_NS, name)
            : document.createElement(name);

        if (attributes) {
            Object.entries(attributes).forEach(([key, value]) => {
                node.setAttribute(key, String(value));
            });
        }

        return node;
    }

    const INSTRUMENTAL_NOTE_PATH =
        'M18.15 72.25C10.90 72.25 5.75 68.35 5.75 62.85'
        + 'C5.75 56.75 12.10 51.55 20.25 51.55'
        + 'C24.55 51.55 28.15 52.70 30.75 54.60'
        + 'V13.45C30.75 11.65 32.20 10.20 34.00 10.20H37.05'
        + 'C47.90 10.20 56.20 15.10 59.10 23.35'
        + 'C60.55 27.45 60.10 31.60 58.00 35.00'
        + 'C53.35 31.30 47.05 29.10 38.55 28.70V59.10'
        + 'C38.55 66.65 29.80 72.25 18.15 72.25Z';

    function appendInstrumentalNoteShape(parent, className = '') {
        if (!parent) return;

        /* One closed silhouette is used for base paint, liquid paint and clip.
         * The previous ellipse+rect+flag construction could expose seams at
         * fractional scaling and made the moving clip look broken in Chromium. */
        const shape = createSvgElement('path', {
            d: INSTRUMENTAL_NOTE_PATH,
            'fill-rule': 'nonzero',
            'clip-rule': 'nonzero'
        });

        if (className) shape.setAttribute('class', className);
        parent.appendChild(shape);
    }

    function prefersReducedMotion() {
        try {
            if (!reducedMotionMediaQuery && window.matchMedia) {
                reducedMotionMediaQuery = window.matchMedia(
                    '(prefers-reduced-motion: reduce)'
                );
            }

            return !!(
                reducedMotionMediaQuery
                && reducedMotionMediaQuery.matches
            );
        } catch {
            return false;
        }
    }

    function instrumentalWaveMotionAllowed() {
        return !prefersReducedMotion();
    }

    function instrumentalWaveGeometry(
        gap,
        progress,
        ticks = null
    ) {
        const normalized = clamp01(
            finiteNumber(progress, 0)
        );
        const baseY =
            INSTRUMENTAL_NOTE_VIEWBOX_HEIGHT
            * (1 - normalized);

        /*
         * The liquid surface remains alive through most of the break, then
         * intentionally settles before the next vocal arrives. Motion is
         * derived from media time, not a free-running CSS timer, so pause and
         * seek are deterministic. Reduced-motion clients receive the
         * same fill progression with a flat surface.
         */
        const riseIn = smoothstepBetween(
            0.015,
            0.09,
            normalized
        );
        const flattenOut = 1 - smoothstepBetween(
            0.68,
            0.98,
            normalized
        );
        const amplitude = instrumentalWaveMotionAllowed()
            ? INSTRUMENTAL_WAVE_MAX_AMPLITUDE
                * riseIn
                * flattenOut
            : 0;

        const elapsedSeconds = gap
            ? Math.max(
                0,
                (
                    finiteNumber(
                        ticks,
                        gap.startTicks
                    ) - gap.startTicks
                ) / TICKS_PER_SECOND
            )
            : 0;
        const phase =
            elapsedSeconds
            / INSTRUMENTAL_WAVE_PERIOD_SECONDS
            * Math.PI
            * 2;

        const points = [];
        for (
            let index = 0;
            index <= INSTRUMENTAL_WAVE_SEGMENTS;
            index += 1
        ) {
            const ratio =
                index / INSTRUMENTAL_WAVE_SEGMENTS;
            const x =
                INSTRUMENTAL_NOTE_VIEWBOX_WIDTH
                * ratio;
            const y = Math.max(
                0,
                Math.min(
                    INSTRUMENTAL_NOTE_VIEWBOX_HEIGHT,
                    baseY
                    + amplitude
                        * Math.sin(
                            phase
                            + ratio
                                * Math.PI
                                * 2
                        )
                )
            );

            points.push([x, y]);
        }

        const surfacePath = points
            .map((point, index) =>
                `${index ? 'L' : 'M'}${point[0].toFixed(3)} ${point[1].toFixed(3)}`
            )
            .join(' ');
        const fillPath =
            `${surfacePath} `
            + `L${INSTRUMENTAL_NOTE_VIEWBOX_WIDTH} ${INSTRUMENTAL_NOTE_VIEWBOX_HEIGHT} `
            + `L0 ${INSTRUMENTAL_NOTE_VIEWBOX_HEIGHT} Z`;

        return {
            baseY,
            amplitude,
            phase,
            fillPath,
            surfacePath
        };
    }

    function setInstrumentalGapFill(
        gap,
        progress,
        ticks = null
    ) {
        if (!gap || !gap.element) return 0;

        const normalized = clamp01(
            finiteNumber(progress, 0)
        );
        const geometry = instrumentalWaveGeometry(
            gap,
            normalized,
            ticks
        );

        if (gap.fillClipElement) {
            gap.fillClipElement.setAttribute(
                'd',
                geometry.fillPath
            );
        }

        if (gap.surfaceElement) {
            gap.surfaceElement.setAttribute(
                'd',
                geometry.surfacePath
            );
            gap.surfaceElement.style.opacity =
                normalized > 0.02 && normalized < 0.992
                    ? '1'
                    : '0';
        }

        gap.lastProgress = normalized;
        gap.lastWavePhase = geometry.phase;
        gap.lastWaveAmplitude = geometry.amplitude;
        return normalized;
    }

    function setInstrumentalGapPhase(gap, phase) {
        if (!gap || !gap.element || gap.visualPhase === phase) {
            return false;
        }

        gap.visualPhase = phase;
        gap.element.classList.toggle(
            'ak-future',
            phase === 'future'
        );
        gap.element.classList.toggle(
            'ak-active',
            phase === 'active'
        );
        gap.element.classList.toggle(
            'ak-past',
            phase === 'past'
        );

        if (phase === 'future') {
            setInstrumentalGapFill(gap, 0);
        } else if (phase === 'past') {
            setInstrumentalGapFill(gap, 1);
        }

        return true;
    }

    function instrumentalPastCountAtTicks(ticks) {
        const gaps = state.instrumentalGaps;
        if (!gaps.length) return 0;

        const now = finiteNumber(ticks, 0);
        let low = 0;
        let high = gaps.length;

        /* Upper-bound search on endTicks: number of fully completed gaps. */
        while (low < high) {
            const middle = (low + high) >> 1;
            if (gaps[middle].endTicks <= now) {
                low = middle + 1;
            } else {
                high = middle;
            }
        }

        return low;
    }

    function syncInstrumentalGapPhases(ticks, activeGap = null) {
        const gaps = state.instrumentalGaps;
        if (!gaps.length) {
            state.instrumentalPastCount = 0;
            state.instrumentalPhaseActiveIndex = -1;
            return;
        }

        const pastCount = instrumentalPastCountAtTicks(ticks);
        const previousPastCount = Math.max(
            0,
            Math.min(gaps.length, state.instrumentalPastCount || 0)
        );
        const activeIndex = activeGap
            ? finiteNumber(activeGap.index, -1)
            : -1;
        const previousActiveIndex = finiteNumber(
            state.instrumentalPhaseActiveIndex,
            -1
        );

        /*
         * Normal playback crosses at most one boundary at a time. Update only
         * rows whose phase can have changed instead of rescanning every
         * instrumental row on every animation frame. Arbitrary seeks remain
         * correct because the changed past/future range is replayed here.
         */
        if (pastCount > previousPastCount) {
            for (let index = previousPastCount; index < pastCount; index += 1) {
                if (index !== activeIndex) {
                    setInstrumentalGapPhase(gaps[index], 'past');
                }
            }
        } else if (pastCount < previousPastCount) {
            for (let index = pastCount; index < previousPastCount; index += 1) {
                if (index !== activeIndex) {
                    setInstrumentalGapPhase(gaps[index], 'future');
                }
            }
        }

        if (
            previousActiveIndex >= 0
            && previousActiveIndex < gaps.length
            && previousActiveIndex !== activeIndex
        ) {
            setInstrumentalGapPhase(
                gaps[previousActiveIndex],
                previousActiveIndex < pastCount ? 'past' : 'future'
            );
        }

        if (activeIndex >= 0 && activeIndex < gaps.length) {
            setInstrumentalGapPhase(gaps[activeIndex], 'active');
        }

        state.instrumentalPastCount = pastCount;
        state.instrumentalPhaseActiveIndex = activeIndex;
    }

    function createInstrumentalGapRow(gap) {
        if (!gap) return null;

        const row = document.createElement('div');
        row.className = 'ak-instrumental-gap-line ak-future';
        row.dataset.akInstrumentalGap = String(gap.index);
        row.dataset.akInstrumentalNextLine = String(gap.nextLineIndex);

        const note = document.createElement('span');
        note.className = 'ak-instrumental-note';
        note.setAttribute('role', 'button');
        note.setAttribute('tabindex', '0');
        note.setAttribute(
            'aria-label',
            `Seek to start of ${Math.max(0, gap.durationTicks / TICKS_PER_SECOND).toFixed(1)} second instrumental break`
        );
        note.setAttribute(
            'title',
            'Seek to start of instrumental break'
        );

        const svg = createSvgElement('svg', {
            class: 'ak-instrumental-note-svg',
            viewBox: `0 0 ${INSTRUMENTAL_NOTE_VIEWBOX_WIDTH} ${INSTRUMENTAL_NOTE_VIEWBOX_HEIGHT}`,
            'aria-hidden': 'true',
            focusable: 'false',
            role: 'presentation'
        });

        const defs = createSvgElement('defs');
        const idRoot = `ak-instrumental-${state.generation}-${gap.index}`;
        const fillClipId = `${idRoot}-fill`;
        const shapeClipId = `${idRoot}-shape`;

        const fillClip = createSvgElement('clipPath', {
            id: fillClipId,
            clipPathUnits: 'userSpaceOnUse'
        });
        const fillWave = createSvgElement('path', {
            d: `M0 ${INSTRUMENTAL_NOTE_VIEWBOX_HEIGHT} `
                + `L${INSTRUMENTAL_NOTE_VIEWBOX_WIDTH} ${INSTRUMENTAL_NOTE_VIEWBOX_HEIGHT} `
                + `L${INSTRUMENTAL_NOTE_VIEWBOX_WIDTH} ${INSTRUMENTAL_NOTE_VIEWBOX_HEIGHT} `
                + `L0 ${INSTRUMENTAL_NOTE_VIEWBOX_HEIGHT} Z`
        });
        fillClip.appendChild(fillWave);

        const shapeClip = createSvgElement('clipPath', {
            id: shapeClipId,
            clipPathUnits: 'userSpaceOnUse'
        });
        appendInstrumentalNoteShape(shapeClip);

        defs.appendChild(fillClip);
        defs.appendChild(shapeClip);
        svg.appendChild(defs);

        const base = createSvgElement('g', {
            class: 'ak-instrumental-note-base-vector'
        });
        appendInstrumentalNoteShape(base);
        svg.appendChild(base);

        const liquid = createSvgElement('g', {
            class: 'ak-instrumental-note-liquid',
            'clip-path': `url(#${fillClipId})`
        });
        appendInstrumentalNoteShape(liquid);
        svg.appendChild(liquid);

        const surface = createSvgElement('path', {
            class: 'ak-instrumental-note-surface',
            d: `M0 ${INSTRUMENTAL_NOTE_VIEWBOX_HEIGHT} `
                + `L${INSTRUMENTAL_NOTE_VIEWBOX_WIDTH} ${INSTRUMENTAL_NOTE_VIEWBOX_HEIGHT}`,
            'clip-path': `url(#${shapeClipId})`
        });
        svg.appendChild(surface);

        note.appendChild(svg);
        row.appendChild(note);

        gap.element = row;
        gap.fillClipElement = fillWave;
        gap.surfaceElement = surface;
        gap.visualPhase = 'future';
        gap.lastProgress = 0;
        setInstrumentalGapFill(gap, 0);

        return row;
    }

    function removeInstrumentalGapRows(container = null) {
        state.instrumentalGaps.forEach(gap => {
            const element = gap && gap.element;

            if (element && element.parentNode) {
                try {
                    element.parentNode.removeChild(element);
                } catch {
                    // Framework-owned lyric DOM can disappear during cleanup.
                }
            }
        });

        const root = container || getCurrentLyricsContainer(true);

        if (root && typeof root.querySelectorAll === 'function') {
            try {
                Array.from(
                    root.querySelectorAll('.ak-instrumental-gap-line')
                ).forEach(element => {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                });
            } catch {
                // Best-effort stale-row cleanup only.
            }
        }

        state.instrumentalGaps = [];
        state.activeInstrumentalGapIndex = -1;
        state.instrumentalPhaseActiveIndex = -1;
        state.instrumentalPastCount = 0;
    }

    function installInstrumentalGapRows(container) {
        removeInstrumentalGapRows(container);

        const gaps = planInstrumentalGaps(state.lineData);

        gaps.forEach(gap => {
            const nextLine = state.lineData[gap.nextLineIndex];
            const nextElement = nextLine && nextLine.element;
            const parent = nextElement && nextElement.parentNode;

            if (!parent) return;

            const row = createInstrumentalGapRow(gap);

            if (!row) return;

            /*
             * Follow the upcoming lyric's base direction so mixed LTR/RTL
             * songs place the synthetic note on the same reading lane instead
             * of inheriting only the document direction.
             */
            try {
                const direction =
                    String(nextElement.getAttribute('dir') || '')
                        .toLowerCase();
                if (direction === 'rtl' || direction === 'ltr') {
                    row.setAttribute('dir', direction);
                }
            } catch {
                // Direction is visual-only; never block lyric decoration.
            }

            parent.insertBefore(row, nextElement);
        });

        state.instrumentalGaps = gaps.filter(gap => !!gap.element);
        state.instrumentalGaps.forEach((gap, index) => {
            gap.index = index;
            if (gap.element) {
                gap.element.dataset.akInstrumentalGap = String(index);
            }
        });
        state.instrumentalGapMaxDurationTicks =
            state.instrumentalGaps.reduce(
                (maximum, gap) => Math.max(maximum, gap.durationTicks),
                0
            );
        state.activeInstrumentalGapIndex = -1;
        state.instrumentalPhaseActiveIndex = -1;
        state.instrumentalPastCount = 0;

        return state.instrumentalGaps;
    }

    function findInstrumentalGapInList(gaps, ticks) {
        if (!gaps || !gaps.length) return null;

        let low = 0;
        let high = gaps.length - 1;
        let candidate = -1;

        while (low <= high) {
            const middle = (low + high) >> 1;
            const gap = gaps[middle];

            if (gap.startTicks <= ticks) {
                candidate = middle;
                low = middle + 1;
            } else {
                high = middle - 1;
            }
        }

        if (candidate < 0) return null;

        const gap = gaps[candidate];

        return ticks >= gap.startTicks && ticks < gap.endTicks
            ? gap
            : null;
    }

    function findInstrumentalGapAtTicks(ticks) {
        return findInstrumentalGapInList(
            state.instrumentalGaps,
            ticks
        );
    }

    function instrumentalGapProgress(gap, ticks) {
        if (!gap) return 0;

        const duration = Math.max(
            1,
            finiteNumber(gap.durationTicks, 0)
        );

        return Math.max(
            0,
            Math.min(
                1,
                (
                    finiteNumber(ticks, gap.startTicks)
                    - gap.startTicks
                ) / duration
            )
        );
    }

    function instrumentalGapDistanceBand(lineIndex, nextLineIndex) {
        const center = nextLineIndex - 0.5;
        const distance = Math.abs(lineIndex - center);

        /*
         * No lyric line is the visual focus during an instrumental gap.
         * Returning near/near2 here used to keep the lines immediately around
         * the synthetic note too bright, making the completed lyric compete
         * with the progress indicator. Preserve only the far-distance fade;
         * the normal past/future phase opacity handles nearby lyrics.
         */
        if (distance >= 4.5) return 'far';
        return 'middle';
    }

    function updateInstrumentalGapVisual(gap, ticks) {
        const nextIndex = gap ? gap.index : -1;
        const previousIndex = state.activeInstrumentalGapIndex;

        if (previousIndex !== nextIndex) {
            if (gap) {
                state.instrumentalGapRenderCount += 1;
            }
            state.activeInstrumentalGapIndex = nextIndex;
        }

        /*
         * Synthetic note rows remain visible as dim future/past lyric items,
         * just like the surrounding text. This prevents the indicator from
         * popping into existence at the exact gap boundary and also makes
         * seek-back/seek-forward state deterministic.
         */
        syncInstrumentalGapPhases(ticks, gap);

        if (
            !gap
            || !gap.element
            || !gap.element.isConnected
            || !gap.element.parentNode
        ) {
            return 0;
        }

        const progress =
            instrumentalGapProgress(gap, ticks);

        const currentTicks = finiteNumber(
            ticks,
            gap.startTicks
        );
        const playbackAdvanced =
            gap.lastRenderTicks !== currentTicks;
        const animatedSurface =
            instrumentalWaveMotionAllowed();

        if (
            gap.lastProgress < 0
            || Math.abs(progress - gap.lastProgress)
                >= INSTRUMENTAL_GAP_PROGRESS_EPSILON
            || (animatedSurface && playbackAdvanced)
        ) {
            setInstrumentalGapFill(gap, progress, currentTicks);
            gap.lastRenderTicks = currentTicks;
        }

        return progress;
    }

    function inspectInstrumentalBreaks() {
        const active =
            state.instrumentalGaps[
                state.activeInstrumentalGapIndex
            ] || null;

        return {
            symbol: INSTRUMENTAL_GAP_SYMBOL,
            visualRenderer: 'inline-svg-liquid-wave-v3',
            transitionModel: 'future-active-past',
            rectangularTextClipArtifact: false,
            liquidSurface: 'media-time-wave+progressive-flattening',
            reducedMotionSurface: 'flat',
            seekable: true,
            seekTarget: 'gap-start',
            keyboardActivation: 'enter-space',
            seekCount: state.instrumentalSeekCount,
            minimumGapSeconds:
                INSTRUMENTAL_GAP_MIN_TICKS
                / TICKS_PER_SECOND,
            detected: state.instrumentalGaps.length,
            activeIndex:
                state.activeInstrumentalGapIndex,
            active: active
                ? {
                    startSeconds:
                        Number(
                            (
                                active.startTicks
                                / TICKS_PER_SECOND
                            ).toFixed(3)
                        ),
                    endSeconds:
                        Number(
                            (
                                active.endTicks
                                / TICKS_PER_SECOND
                            ).toFixed(3)
                        ),
                    durationSeconds:
                        Number(
                            (
                                active.durationTicks
                                / TICKS_PER_SECOND
                            ).toFixed(3)
                        ),
                    nextLineIndex:
                        active.nextLineIndex,
                    intro: !!active.isIntro,
                    progress:
                        active.lastProgress >= 0
                            ? Number(
                                active.lastProgress.toFixed(4)
                            )
                            : 0
                }
                : null,
            renderCount:
                state.instrumentalGapRenderCount,
            longestSeconds:
                Number(
                    (
                        state.instrumentalGapMaxDurationTicks
                        / TICKS_PER_SECOND
                    ).toFixed(3)
                ),
            gaps: state.instrumentalGaps.map(gap => ({
                startSeconds:
                    Number(
                        (
                            gap.startTicks
                            / TICKS_PER_SECOND
                        ).toFixed(3)
                    ),
                endSeconds:
                    Number(
                        (
                            gap.endTicks
                            / TICKS_PER_SECOND
                        ).toFixed(3)
                    ),
                durationSeconds:
                    Number(
                        (
                            gap.durationTicks
                            / TICKS_PER_SECOND
                        ).toFixed(3)
                    ),
                nextLineIndex: gap.nextLineIndex,
                intro: !!gap.isIntro
            }))
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
        const orderedCues = Array.isArray(rawCues)
            ? orderedCuesBySourcePosition(rawCues)
            : [];
        const wordCueRanges = usableWordCueRanges(
            displayLyric,
            orderedCues
        );
        const hasWordTiming = hasUsableWordTiming(
            displayLyric,
            orderedCues
        );
        const cues = hasWordTiming
            ? wordCueRanges.map(range => range.cue)
            : [];

        Array.from(lineElement.classList || [])
            .filter(name =>
                name === 'ak-plain-line'
                || name.indexOf('ak-script-') === 0
            )
            .forEach(name => lineElement.classList.remove(name));

        lineElement.style.removeProperty('visibility');
        lineElement.style.removeProperty('--ak-bg-anchor-offset');
        lineElement.removeAttribute('aria-hidden');
        state.retiredLineElements = state.retiredLineElements.filter(
            element => element && element !== lineElement && element.isConnected
        );
        lineElement.classList.add('ak-enhanced-line');
        lineElement.classList.remove(
            'ak-current',
            'ak-past',
            'ak-future',
            'ak-near',
            'ak-near2',
            'ak-far',
            'ak-overlap-current',
            'ak-motion-handoff'
        );
        lineElement.dataset.akTimingLineIndex = String(lineIndex);
        lineElement.classList.toggle('ak-line-synced', cues.length === 0);
        lineElement.classList.toggle(
            'ak-background-vocal',
            isBackgroundVocal
        );
        lineElement.classList.remove(
            'ak-bg-attached-before',
            'ak-bg-attached-after',
            'ak-bg-standalone'
        );
        delete lineElement.dataset.akBackgroundAttachment;
        delete lineElement.dataset.akBackgroundAnchorLine;
        lineElement.classList.remove(
            'ak-has-shaped-script'
        );
        lineElement.dataset.akGeneration = String(state.generation);
        lineElement.dataset.akLyricIdentity = lyricDomIdentity(lyric);
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
                orderedCues,
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
                trustedEndTicks: bounds.trustedEndTicks,
                isBackgroundVocal,
                backgroundVocalRoleSource,
                ownedText: text,
                ownedNodes: Array.from(lineElement.children || [])
            };
        }

        const graphemeBoundaries =
            getGraphemeBoundaries(text);

        const cueRecords = [];

        wordCueRanges.forEach(range => {
            const cue = range.cue;
            const sourceCueIndex = range.cueIndex;
            let startPos = range.startPosition;
            let endPos = range.endPosition;

            startPos = Math.max(
                0,
                startPos - positionOffset
            );

            endPos = Math.max(
                startPos,
                endPos - positionOffset
            );

            const start =
                nullableTick(
                    cueValue(
                        cue,
                        'Start',
                        'start'
                    )
                )
                ?? 0;

            /* Keep the complete source-ordered cue list here. In particular,
             * the converter intentionally emits a final empty cue at
             * text.length to mark the real end of an ELRC line. That cue does
             * not create a visible word range, but it must still end the last
             * visible word rather than letting its sweep run to the next line. */
            const end = cueEndTicks(
                lineIndex,
                sourceCueIndex,
                cue,
                orderedCues
            );

            startPos = snapBoundary(graphemeBoundaries, startPos, 'backward');
            endPos = snapBoundary(graphemeBoundaries, endPos, 'forward');
            endPos = Math.max(startPos, Math.min(text.length, endPos));

            if (endPos > startPos) {
                const record = {
                    cue,
                    cueIndex: sourceCueIndex,
                    startPos,
                    endPos,
                    start,
                    end,
                    sourceCueIndexes: [sourceCueIndex]
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
                        sourceCueIndex
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
                orderedCues,
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
            trustedEndTicks: bounds.trustedEndTicks,
            isBackgroundVocal,
            backgroundVocalRoleSource,
            ownedText: text,
            ownedNodes: Array.from(lineElement.children || [])
        };
    }

    function backgroundVocalAttachmentFor(
        lineRecord,
        lineRecords
    ) {
        if (
            !lineRecord
            || !lineRecord.isBackgroundVocal
        ) {
            return {
                placement: 'standalone',
                anchorLineIndex: null
            };
        }

        const records = Array.isArray(lineRecords)
            ? lineRecords
            : [];
        const currentIndex = records.indexOf(lineRecord);

        if (currentIndex < 0) {
            return {
                placement: 'standalone',
                anchorLineIndex: null
            };
        }

        let previousLead = null;
        let nextLead = null;

        for (let index = currentIndex - 1; index >= 0; index -= 1) {
            if (!records[index].isBackgroundVocal) {
                previousLead = records[index];
                break;
            }
        }

        for (
            let index = currentIndex + 1;
            index < records.length;
            index += 1
        ) {
            if (!records[index].isBackgroundVocal) {
                nextLead = records[index];
                break;
            }
        }

        if (!previousLead && !nextLead) {
            return {
                placement: 'standalone',
                anchorLineIndex: null
            };
        }

        const backgroundStart = Number(lineRecord.startTicks);
        const backgroundEnd = Number(lineRecord.endTicks);
        const affinity = lead => {
            const leadStart = Number(lead && lead.startTicks);
            const leadEnd = Number(lead && lead.endTicks);
            const hasIntervals =
                Number.isFinite(backgroundStart)
                && Number.isFinite(backgroundEnd)
                && Number.isFinite(leadStart)
                && Number.isFinite(leadEnd);
            const overlap = hasIntervals
                ? Math.max(
                    0,
                    Math.min(backgroundEnd, leadEnd)
                        - Math.max(backgroundStart, leadStart)
                )
                : 0;
            const gap = hasIntervals
                ? (
                    overlap > 0
                        ? 0
                        : Math.max(
                            0,
                            backgroundStart - leadEnd,
                            leadStart - backgroundEnd
                        )
                )
                : Infinity;

            return {
                sameStart:
                    Number.isFinite(backgroundStart)
                    && Number.isFinite(leadStart)
                    && backgroundStart === leadStart,
                overlap,
                gap
            };
        };

        if (!previousLead) {
            return {
                placement: 'before',
                anchorLineIndex: nextLead.lineIndex
            };
        }

        if (!nextLead) {
            return {
                placement: 'after',
                anchorLineIndex: previousLead.lineIndex
            };
        }

        const previousAffinity = affinity(previousLead);
        const nextAffinity = affinity(nextLead);

        /* Exact same-start call/response belongs before the following lead.
         * Otherwise prefer the lead with the longest real overlap, then the
         * smallest silence. This handles backing lines stored either before
         * their lead or immediately after it without letting a tiny next-line
         * overlap steal a response that belongs to the preceding lyric. */
        const useNext =
            (nextAffinity.sameStart && !previousAffinity.sameStart)
            || (
                nextAffinity.sameStart === previousAffinity.sameStart
                && (
                    nextAffinity.overlap > previousAffinity.overlap
                    || (
                        nextAffinity.overlap === previousAffinity.overlap
                        && nextAffinity.gap < previousAffinity.gap
                    )
                )
            );

        return useNext
            ? {
                placement: 'before',
                anchorLineIndex: nextLead.lineIndex
            }
            : {
                placement: 'after',
                anchorLineIndex: previousLead.lineIndex
            };
    }

    function applyBackgroundVocalAttachment(
        lineRecord,
        lineRecords
    ) {
        if (
            !lineRecord
            || !lineRecord.isBackgroundVocal
            || !lineRecord.element
        ) {
            return null;
        }

        const attachment = backgroundVocalAttachmentFor(
            lineRecord,
            lineRecords
        );

        lineRecord.backgroundVocalAttachment =
            attachment.placement;
        lineRecord.backgroundVocalAnchorLineIndex =
            attachment.anchorLineIndex;
        lineRecord.element.dataset.akBackgroundAttachment =
            attachment.placement;

        if (attachment.anchorLineIndex === null) {
            delete lineRecord.element.dataset.akBackgroundAnchorLine;
        } else {
            lineRecord.element.dataset.akBackgroundAnchorLine =
                String(attachment.anchorLineIndex);
        }

        lineRecord.element.classList.add(
            `ak-bg-attached-${attachment.placement}`
        );

        return attachment;
    }

    function renderedLyricTextLeft(element) {
        if (!element) return null;

        const children = Array.from(element.children || []);
        for (const child of children) {
            if (
                !child
                || !child.classList
                || (
                    !child.classList.contains('ak-word')
                    && !child.classList.contains('ak-untimed')
                )
            ) {
                continue;
            }

            const textNode = Array.from(child.childNodes || []).find(node =>
                node
                && node.nodeType === Node.TEXT_NODE
                && /\S/u.test(String(node.textContent || ''))
            );
            if (!textNode) continue;

            const text = String(textNode.textContent || '');
            const start = Math.max(0, text.search(/\S/u));
            const range = document.createRange();

            try {
                range.setStart(textNode, start);
                range.setEnd(textNode, textNode.length);
                const rects = Array.from(range.getClientRects())
                    .map(rect => Number(rect.left))
                    .filter(Number.isFinite);
                if (rects.length) return Math.min(...rects);
            } catch {
                // Layout/range APIs are optional during a detached DOM update.
            } finally {
                if (range.detach) range.detach();
            }
        }

        try {
            const left = Number(element.getBoundingClientRect().left);
            return Number.isFinite(left) ? left : null;
        } catch {
            return null;
        }
    }

    function backgroundVocalAnchorOffset(
        backgroundElement,
        anchorElement
    ) {
        if (
            !backgroundElement
            || !anchorElement
            || typeof backgroundElement.getBoundingClientRect !== 'function'
            || typeof anchorElement.getBoundingClientRect !== 'function'
        ) {
            return null;
        }

        const backgroundLeft = renderedLyricTextLeft(backgroundElement);
        const anchorLeft = renderedLyricTextLeft(anchorElement);

        if (!Number.isFinite(backgroundLeft) || !Number.isFinite(anchorLeft)) {
            return null;
        }

        const appliedOffset = Number.parseFloat(
            backgroundElement.style
            && typeof backgroundElement.style.getPropertyValue === 'function'
                ? backgroundElement.style.getPropertyValue(
                    '--ak-bg-anchor-offset'
                )
                : ''
        );

        /* Rects already include the current CSS `left` value. Add the delta to
         * that value so repeated font/resize refreshes converge instead of
         * alternating between the original and aligned positions. */
        return Math.round(
            (
                (Number.isFinite(appliedOffset) ? appliedOffset : 0)
                + anchorLeft
                - backgroundLeft
            ) * 100
        ) / 100;
    }

    function alignBackgroundVocalAnchors() {
        const records = state.lineData || [];

        records.forEach(lineRecord => {
            if (!lineRecord || !lineRecord.isBackgroundVocal) return;

            const anchor = records.find(candidate =>
                candidate
                && candidate.lineIndex
                    === lineRecord.backgroundVocalAnchorLineIndex
            );
            const offset = backgroundVocalAnchorOffset(
                lineRecord.element,
                anchor && anchor.element
            );

            if (offset === null) {
                lineRecord.element.style.removeProperty(
                    '--ak-bg-anchor-offset'
                );
                return;
            }

            lineRecord.element.style.setProperty(
                '--ak-bg-anchor-offset',
                `${offset.toFixed(2)}px`
            );
        });
    }

    function queueBackgroundVocalAnchorRefresh() {
        if (state.backgroundAnchorTimer) {
            clearTimeout(state.backgroundAnchorTimer);
        }

        /* Line state uses a CSS scale transition. Re-measure after it settles
         * so the background's rendered glyph—not merely its border box—stays
         * exactly flush with its selected lead on every phase change. */
        state.backgroundAnchorTimer = window.setTimeout(() => {
            state.backgroundAnchorTimer = 0;
            if (state.lyrics && isLyricsPage()) {
                alignBackgroundVocalAnchors();
            }
        }, 460);
    }

    function inspectBackgroundVocals() {
        const lines = state.lineData
            .filter(line => line.isBackgroundVocal)
            .map(line => ({
                lineIndex: line.lineIndex,
                text: line.text,
                attachment: line.backgroundVocalAttachment,
                anchorLineIndex:
                    line.backgroundVocalAnchorLineIndex,
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
            placement:
                'left-aligned + closest-lead-before-or-after',
            lines,
            cacheHint:
                lines.length
                    ? null
                    : 'No x-bg role reached the renderer. Reconvert with the current converter so its [ak:bg] transport token is preserved.'
        };
    }

    function normalizedLyricDomText(value) {
        return String(value || '')
            .replace(/\s+/gu, ' ')
            .trim();
    }

    function lyricDomIdentity(lyric) {
        const text = normalizedLyricDomText(
            lyricTextProfile(lyric).text
        );
        return stableHash(text).toString(16);
    }

    function lineHasOwnedLyricNodes(line) {
        if (!line || !line.children) return false;
        return Array.from(line.children).some(child =>
            child
            && child.classList
            && (
                child.classList.contains('ak-word')
                || child.classList.contains('ak-untimed')
            )
        );
    }

    function ownedLyricText(line) {
        if (!line || !line.children) return '';

        return Array.from(line.children)
            .filter(child =>
                child
                && child.classList
                && (
                    child.classList.contains('ak-word')
                    || child.classList.contains('ak-untimed')
                )
            )
            .map(child => Array.from(child.childNodes || [])
                .filter(node => node && node.nodeType === Node.TEXT_NODE)
                .map(node => String(node.textContent || ''))
                .join('')
            )
            .join('');
    }

    function lyricDomLineReady(line, lyric) {
        if (!line || !lyric) return false;
        const expectedIdentity = lyricDomIdentity(lyric);
        if (
            line.dataset
            && line.dataset.akLyricIdentity === expectedIdentity
        ) {
            return true;
        }

        /* A different LyricMotion identity means Jellyfin is still showing the
         * outgoing song. Wait until the framework actually replaces our owned
         * children instead of painting the new timing model onto stale text. */
        if (lineHasOwnedLyricNodes(line)) return false;

        const expected = normalizedLyricDomText(
            lyricTextProfile(lyric).text
        );
        /* Jellyfin can keep the ASCII transport marker in its native text
         * node. Compare display text on both sides so x-bg lines can be
         * decorated and stripped instead of timing out in the readiness loop. */
        const actual = normalizedLyricDomText(
            lyricTextProfile({ Text: line.textContent }).text
        );
        return actual === expected;
    }

    function lyricsDomReadyForPayload(lines, lyrics) {
        if (
            !Array.isArray(lines)
            || !Array.isArray(lyrics)
            || !lyrics.length
            || lines.length !== lyrics.length
        ) {
            return false;
        }

        for (let index = 0; index < lines.length; index += 1) {
            if (!lyricDomLineReady(lines[index], lyrics[index])) {
                return false;
            }
        }
        return true;
    }

    function restorePlainLyricsDom(lines, lyrics, container) {
        removeInstrumentalGapRows(container);
        let plainBackgroundVocalCount = 0;

        lines.forEach((line, index) => {
            if (!line || !line.classList) return;

            const textProfile = lyrics[index]
                ? lyricTextProfile(lyrics[index])
                : {
                    text: String(line.textContent || ''),
                    isBackgroundVocal: false,
                    backgroundVocalRoleSource: null
                };
            const plainText = textProfile.text;

            const wasEnhanced =
                line.classList.contains('ak-enhanced-line')
                || !!(line.dataset && line.dataset.akGeneration);

            Array.from(line.classList)
                .filter(name => name.indexOf('ak-') === 0)
                .forEach(name => line.classList.remove(name));

            line.classList.add(
                'ak-plain-line',
                `ak-script-${detectScriptProfile(plainText)}`
            );
            line.classList.toggle(
                'ak-background-vocal',
                textProfile.isBackgroundVocal
            );
            line.setAttribute(
                'dir',
                firstStrongDirection(plainText)
            );

            [
                'akGeneration',
                'akLyricIdentity',
                'akTimingLineIndex',
                'akVocalRole',
                'akVocalRoleSource',
                'akBackgroundAttachment',
                'akBackgroundAnchorLine'
            ].forEach(key => {
                if (line.dataset) delete line.dataset[key];
            });

            if (textProfile.isBackgroundVocal) {
                plainBackgroundVocalCount += 1;
                if (line.dataset) {
                    line.dataset.akVocalRole = 'background';
                    if (textProfile.backgroundVocalRoleSource) {
                        line.dataset.akVocalRoleSource =
                            textProfile.backgroundVocalRoleSource;
                    }
                }
            }

            line.style.removeProperty('visibility');
            line.style.removeProperty('--ak-bg-anchor-offset');
            line.removeAttribute('aria-hidden');

            if (!lyrics[index]) return;

            const currentText = String(line.textContent || '');
            if (!wasEnhanced && currentText === plainText) return;

            /* Plain lyrics can arrive with LyricMotion's [ak:bg] transport
             * token still present in Jellyfin's native text node. Always repair
             * the node when its display text differs, not only when this line
             * used to be enhanced. This also clears stale owned word spans after
             * same-text song transitions. */
            line.removeAttribute('aria-label');
            replaceChildrenCompat(line);
            line.appendChild(
                document.createTextNode(plainText)
            );
        });

        state.backgroundVocalCount = plainBackgroundVocalCount;

        container.classList.remove('ak-karaoke-container');
        container.classList.add('ak-plain-lyrics-container');
        state.lineData = [];
        state.lineEndPrefix = [];
        state.instrumentalGaps = [];
        state.activeLineIndexes = [];
        resetMotionHandoffs();
        state.lastActiveLine = -999;
        state.lastActiveLineSignature = '';
        state.activeInstrumentalGapIndex = -1;
        state.decoratedGeneration = state.generation;

        if (typeof removeRomanizationToggle === 'function') {
            removeRomanizationToggle();
        }
        if (typeof removeTimingControls === 'function') {
            removeTimingControls();
        }

        stopAnimationLoop('plain-unsynced-lyrics');
    }

    function lineRecordHealthy(lineRecord) {
        const element = lineRecord && lineRecord.element;
        if (
            !element
            || !element.isConnected
            || !element.classList
            || !element.classList.contains('ak-enhanced-line')
            || Number(element.dataset && element.dataset.akGeneration)
                !== state.generation
        ) {
            return false;
        }

        const ownedNodes = lineRecord.ownedNodes;
        if (!Array.isArray(ownedNodes) || !ownedNodes.length) {
            return false;
        }

        const liveChildren = Array.from(element.children || []);
        if (liveChildren.length !== ownedNodes.length) return false;
        const ownsExpectedNodes = ownedNodes.every(
            (node, index) =>
                node
                && node.parentNode === element
                && liveChildren[index] === node
        );

        return ownsExpectedNodes
            && normalizedLyricDomText(ownedLyricText(element))
                === normalizedLyricDomText(lineRecord.ownedText);
    }

    function instrumentalGapRowsHealthy() {
        return state.instrumentalGaps.every(gap =>
            gap
            && gap.element
            && gap.element.isConnected
            && !!gap.element.parentNode
        );
    }

    function plainLyricTypographyHealthy() {
        const container = getCurrentLyricsContainer(false);
        if (
            !container
            || !container.classList.contains(
                'ak-plain-lyrics-container'
            )
        ) {
            return false;
        }

        const lines = Array.from(
            container.querySelectorAll('.lyricsLine')
        );
        const lyrics = Array.isArray(state.lyrics)
            ? state.lyrics
            : [];

        return lines.length === lyrics.length
            && lines.every((line, index) => {
                const profile = lyricTextProfile(lyrics[index]);
                const text = profile.text;
                return line.classList.contains('ak-plain-line')
                    && line.classList.contains(
                        `ak-script-${detectScriptProfile(text)}`
                    )
                    && line.classList.contains('ak-background-vocal')
                        === profile.isBackgroundVocal
                    && line.getAttribute('dir')
                        === firstStrongDirection(text)
                    && String(line.textContent || '') === text;
            });
    }

    function lyricVisualDomHealthy() {
        if (state.lyricTimingMode === 'plain') {
            return state.decoratedGeneration === state.generation
                && state.lineData.length === 0
                && plainLyricTypographyHealthy();
        }

        return state.decoratedGeneration === state.generation
            && state.lineData.length > 0
            && state.lineData.every(lineRecordHealthy)
            && instrumentalGapRowsHealthy();
    }

    function decorateExistingLines() {
        if (!state.lyrics || !isLyricsPage()) return false;
        const container = getCurrentLyricsContainer(false);
        if (!container) return false;

        const lines = Array.from(container.querySelectorAll('.lyricsLine'));
        if (!lines.length) return false;

        if (!lyricsDomReadyForPayload(lines, state.lyrics)) {
            return false;
        }

        if (state.lyricTimingMode === 'plain') {
            restorePlainLyricsDom(lines, state.lyrics, container);
            return true;
        }

        container.classList.remove('ak-plain-lyrics-container');

        /* Jellyfin's native follower uses raw lyric timestamps. LyricMotion
         * uses the user's corrected timeline, so synchronized lyrics must have
         * exactly one scroll owner or a nonzero offset makes the two targets
         * alternate vertically on every playback update. */
        suppressJellyfinLyricAutoFollow('synchronized-lyrics-decorated');

        removeInstrumentalGapRows(container);

        const count = lines.length;
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

        state.lineData.forEach(lineRecord => {
            if (lineRecord.isBackgroundVocal) {
                applyBackgroundVocalAttachment(
                    lineRecord,
                    state.lineData
                );
            }
        });

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

        installInstrumentalGapRows(container);

        state.decoratedGeneration = state.generation;
        state.lastActiveLine = -999;
        state.lastActiveLineSignature = '';
        state.activeLineIndexes = [];
        resetMotionHandoffs();
        state.lyricAutoFollowLastIndex = -1;

        container.classList.add('ak-karaoke-container');
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
            const stored = localStorage.getItem(PERFORMANCE_STORAGE_KEY);
            if (stored === 'auto' || stored === 'desktop' || stored === 'mobile') {
                return stored;
            }
            /* v3.2.5 God Mode removes the legacy Eco profile. Migrate it to
             * automatic device selection instead of retaining a dead mode. */
            if (stored === 'eco') {
                localStorage.setItem(PERFORMANCE_STORAGE_KEY, 'auto');
            }
        } catch {
            // Ignore storage failure.
        }
        return 'auto';
    }

    function detectPerformanceProfile() {
        if (state.performanceMode && state.performanceMode !== 'auto') {
            return state.performanceMode;
        }
        return isMobileEnvironment() ? 'mobile' : 'desktop';
    }

    function applyPerformanceClassToPage(page) {
        if (!page) return;
        /* Remove the retired class too so upgrading in-place cannot leave an
         * Eco stylesheet branch attached to Jellyfin's current lyric page. */
        for (const name of ['desktop', 'mobile', 'eco']) {
            page.classList.remove(`ak-perf-${name}`);
        }
        page.classList.add(`ak-perf-${state.performanceProfile}`);
    }

    function applyPerformanceProfile(refreshGeometry = true) {
        const previous = state.performanceProfile;
        state.performanceProfile = detectPerformanceProfile();

        if (previous !== state.performanceProfile) {
            state.lastRenderedFrameAt = 0;
            invalidateAtmosphereLoads('performance-profile-change');
            state.atmosphereLastCheck = 0;
            rebuildDynamicBackgroundRenderer('performance-profile-change');
        }

        const page = isLyricsPage() ? getCurrentLyricPage() : null;
        applyPerformanceClassToPage(page);
        applyAccentTheme();

        if (refreshGeometry && previous !== state.performanceProfile && state.lineData.length) {
            queueMotionGeometryRefresh();
        }
    }

    function setPerformanceMode(mode) {
        const normalized = String(mode || '').trim().toLowerCase();
        if (normalized !== 'auto' && normalized !== 'desktop' && normalized !== 'mobile') {
            throw new Error('Performance mode must be: "auto", "desktop", or "mobile".');
        }
        state.performanceMode = normalized;
        try { localStorage.setItem(PERFORMANCE_STORAGE_KEY, normalized); } catch { /* ignore */ }
        applyPerformanceProfile(true);
        wakeAnimationLoop();
        return {
            mode: state.performanceMode,
            profile: state.performanceProfile,
            targetFps: PERFORMANCE_TARGET_FPS[state.performanceProfile]
        };
    }

    function shouldUsePerGlyphMotion(
        glyphCount
    ) {
        return !prefersReducedMotion()
            && Number(glyphCount) > 0;
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
            && state.activeInstrumentalGapIndex < 0
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
        /* God Mode is intentionally single-engine. There is no atmosphere
         * preference state to migrate, persist, or accidentally revive. */
        return 'dynamic';
    }

    function getAtmospherePage() {
        if (!isLyricsPage()) return null;
        return getCurrentLyricPage();
    }

    function removeAtmosphereRoot(source = 'remove-root') {
        const root = state.atmosphereRoot;
        const parent = root && root.parentNode;
        disposeDynamicBackgroundRenderer(source);
        if (root) removeNodeCompat(root);
        if (parent && parent.classList) {
            parent.classList.remove('ak-atmosphere-host');
        }
        state.atmosphereRoot = null;
        document.documentElement.classList.remove('ak-atmosphere-dynamic-mode');
        document.documentElement.classList.remove('ak-lyricmotion-atmosphere-active');
    }

    function ensureAtmosphereRoot() {
        const page = getAtmospherePage();
        if (!page) {
            removeAtmosphereRoot('no-page');
            return null;
        }

        if (state.atmosphereRoot && state.atmosphereRoot.isConnected && state.atmosphereRoot.parentNode === page) {
            document.documentElement.classList.add('ak-lyricmotion-atmosphere-active');
            document.documentElement.classList.add('ak-atmosphere-dynamic-mode');
            startDynamicBackgroundRenderer();
            return state.atmosphereRoot;
        }

        if (
            state.atmosphereRoot
            && state.atmosphereRoot.isConnected
            && state.atmosphereRoot.parentNode !== page
        ) {
            const staleParent = state.atmosphereRoot.parentNode;
            disposeDynamicBackgroundRenderer('stale-page-root');
            removeNodeCompat(state.atmosphereRoot);
            if (staleParent && staleParent.classList) {
                staleParent.classList.remove('ak-atmosphere-host');
            }
            state.atmosphereRoot = null;
        }

        const old = directChildByClass(page, 'ak-atmosphere');
        if (old && state.atmosphereDynamicCanvas && old.contains && old.contains(state.atmosphereDynamicCanvas)) {
            disposeDynamicBackgroundRenderer('root-replaced');
        }
        removeNodeCompat(old);

        const root = document.createElement('div');
        root.className = 'ak-atmosphere';
        root.setAttribute('aria-hidden', 'true');
        root.dataset.akMode = 'dynamic';

        for (let index = 0; index < 2; index += 1) {
            const fallback = document.createElement('div');
            fallback.className = `ak-atmosphere-dynamic-fallback ak-atmosphere-dynamic-fallback-${index === 0 ? 'a' : 'b'}`;
            fallback.dataset.akDynamicFallback = String(index);
            root.appendChild(fallback);
        }

        const canvas = document.createElement('canvas');
        canvas.className = 'ak-atmosphere-dynamic-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        root.appendChild(canvas);

        const shade = document.createElement('div');
        shade.className = 'ak-atmosphere-dynamic-shade';
        root.appendChild(shade);

        page.insertBefore(root, page.firstChild);
        page.classList.add('ak-atmosphere-host');
        document.documentElement.classList.add('ak-lyricmotion-atmosphere-active');
        document.documentElement.classList.add('ak-atmosphere-dynamic-mode');
        applyPerformanceClassToPage(page);
        state.atmosphereRoot = root;
        startDynamicBackgroundRenderer();
        return root;
    }

    function setAtmosphereMode(mode) {
        const normalized = String(mode || 'dynamic').trim().toLowerCase();
        if (normalized !== 'dynamic') {
            throw new Error('This God Mode build contains only the "dynamic" atmosphere.');
        }
        state.atmosphereMode = 'dynamic';
        const root = ensureAtmosphereRoot();
        if (root) root.dataset.akMode = 'dynamic';
        state.atmosphereLastCheck = 0;
        scheduleDynamicBackgroundProbeBurst('mode-confirmed');
        wakeAnimationLoop();
        return { mode: 'dynamic', artwork: state.atmosphereArtwork, source: state.atmosphereSource };
    }

    function normalizedMediaSource(media) {
        const raw = media ? (media.currentSrc || media.src || '') : '';
        if (!raw) return '';
        try {
            const url = new URL(raw, location.href);
            const volatile = new Set([
                'api_key', 'apikey', 'access_token', 'token', 'playsessionid',
                'deviceid', 'starttimeticks', 'transcodingcontainer', 'audiocodec',
                'videocodec', 'maxstreamingbitrate', 'userid'
            ]);
            for (const [key] of Array.from(url.searchParams.entries())) {
                if (volatile.has(String(key).toLowerCase())) {
                    url.searchParams.delete(key);
                }
            }
            /* Track identity is normally encoded in /Audio/<id> or /Videos/<id>.
             * Preserve the path and stable query parameters while removing only
             * transport/session noise. */
            const params = Array.from(url.searchParams.entries()).sort((a, b) => a[0].localeCompare(b[0]));
            url.search = '';
            for (const [key, value] of params) url.searchParams.append(key, value);
            return `${url.origin}${url.pathname}${url.search}`;
        } catch {
            /* Never retain malformed query strings in diagnostics/state because
             * they may contain API keys or session tokens. */
            return String(raw).split(/[?#]/, 1)[0];
        }
    }

    function atmosphereMediaKey(media) {
        return normalizedMediaSource(media);
    }

    function invalidateAtmosphereLoads(source = 'invalidate') {
        state.atmosphereLoadSeq += 1;
        state.atmospherePendingKey = '';
        state.atmospherePendingSince = 0;
        return source;
    }

    function clearDynamicProbeTimers() {
        for (const timer of state.atmosphereDynamicProbeTimers || []) clearTimeout(timer);
        state.atmosphereDynamicProbeTimers = [];
    }

    function scheduleDynamicBackgroundProbeBurst(source = 'probe') {
        const token = ++state.atmosphereDynamicProbeToken;
        clearDynamicProbeTimers();
        const delays = [0, 90, 220, 450, 800, 1250];
        state.atmosphereDynamicProbeTimers = delays.map(delay => window.setTimeout(() => {
            if (token !== state.atmosphereDynamicProbeToken || !isLyricsPage()) return;
            const media = getLocalMediaElement(true);
            if (!media) return;
            refreshAtmosphere(media, false).catch(error => warn('Dynamic Background probe failed:', error));
        }, delay));
        return source;
    }

    function mediaItemArtworkCandidate(media) {
        try {
            const src = media && (media.currentSrc || media.src);
            if (!src) return null;
            const mediaUrl = new URL(src, location.href);
            const match = mediaUrl.pathname.match(/\/(?:Audio|Videos)\/([^/?]+)/i);
            if (!match) return null;
            const itemId = decodeURIComponent(match[1]);
            const prefix = mediaUrl.pathname.slice(0, match.index);
            const imageUrl = new URL(`${prefix}/Items/${encodeURIComponent(itemId)}/Images/Primary`, mediaUrl.origin);
            imageUrl.searchParams.set('maxWidth', String(ATMOSPHERE_ART_MAX_WIDTH));
            imageUrl.searchParams.set('quality', '88');
            const authKeys = new Set(['api_key', 'apikey', 'access_token', 'token']);
            for (const [key, value] of mediaUrl.searchParams.entries()) {
                if (value && authKeys.has(String(key).toLowerCase())) {
                    imageUrl.searchParams.set(key, value);
                }
            }
            return imageUrl.href;
        } catch {
            return null;
        }
    }

    function mediaItemId(media) {
        try {
            const src = media && (media.currentSrc || media.src);
            if (!src) return '';
            const url = new URL(src, location.href);
            const match = url.pathname.match(/\/(?:Audio|Videos)\/([^/?]+)/i);
            return match ? decodeURIComponent(match[1]).toLowerCase() : '';
        } catch {
            return '';
        }
    }

    function currentLyricsItemId() {
        const key = String(
            state.lyricsAcceptedKey
            || state.lyricsRequestKey
            || ''
        );
        const pathMatch = key.match(
            /\/(?:audio|videos|items)\/([^/?]+)\/lyrics(?:[/?]|$)/i
        );
        if (pathMatch) return decodeURIComponent(pathMatch[1]).toLowerCase();
        const queryMatch = key.match(/[?&]itemid=([^&]+)/i);
        return queryMatch ? decodeURIComponent(queryMatch[1]).toLowerCase() : '';
    }

    function artworkItemId(url) {
        try {
            const parsed = new URL(url, location.href);
            const match = parsed.pathname.match(/\/Items\/([^/?]+)\/Images\//i);
            return match ? decodeURIComponent(match[1]).toLowerCase() : '';
        } catch {
            return '';
        }
    }

    function nodeBindsToItem(node, itemId) {
        if (!node || !itemId) return false;
        let current = node;
        for (let depth = 0; current && depth < 10; depth += 1) {
            const dataset = current.dataset || {};
            const candidates = [
                dataset.itemId,
                dataset.itemid,
                dataset.id,
                typeof current.getAttribute === 'function'
                    ? current.getAttribute('data-item-id')
                    : null,
                typeof current.getAttribute === 'function'
                    ? current.getAttribute('data-itemid')
                    : null,
                typeof current.getAttribute === 'function'
                    ? current.getAttribute('data-id')
                    : null
            ];
            if (candidates.some(value =>
                String(value || '').toLowerCase() === String(itemId).toLowerCase()
            )) {
                return true;
            }
            current = current.parentNode;
        }
        return false;
    }

    function getBackgroundImageUrl(element) {
        try {
            const value = getComputedStyle(element).backgroundImage;
            if (!value || value === 'none') return null;
            const match = value.match(/url\(["']?(.*?)["']?\)/i);
            return match ? match[1] : null;
        } catch {
            return null;
        }
    }

    function domArtworkCandidates(media = null) {
        const candidates = [];
        const seen = new Set();
        const itemId = mediaItemId(media);
        const add = (url, score, node = null) => {
            if (!url || seen.has(url) || !/\/Items\/|\/Images\//i.test(url)) return;
            seen.add(url);
            const urlItemId = artworkItemId(url);
            const nodeBound = !!(itemId && nodeBindsToItem(node, itemId));
            const playbackContext = !!(
                node
                && typeof node.closest === 'function'
                && node.closest(
                    '.nowPlayingBar,.nowPlayingPage,.nowPlayingInfoContainer'
                )
            );
            const boundToCurrentItem = !!(
                itemId
                && (urlItemId === itemId || nodeBound)
            );

            /* Music commonly inherits Primary artwork from its Album item.
             * A URL item-id mismatch is therefore not enough to call the cover
             * stale when Jellyfin is presenting it inside the live now-playing
             * UI. Rapid-skip safety is still provided by the key-switch DOM
             * baseline and the unbound-candidate stability confirmation. */
            candidates.push({
                url,
                score,
                node,
                urlItemId,
                nodeBound,
                playbackContext,
                boundToCurrentItem,
                inheritedArtworkCandidate: !!(
                    itemId
                    && urlItemId
                    && urlItemId !== itemId
                    && (nodeBound || playbackContext)
                ),
                conflictsCurrentItem: !!(
                    itemId
                    && urlItemId
                    && urlItemId !== itemId
                    && !nodeBound
                    && !playbackContext
                )
            });
        };
        const selector = [
            '.nowPlayingBar img', '.nowPlayingPage img', '.nowPlayingInfoContainer img',
            '.detailImageContainer img', 'img[src*="/Items/"]', 'img[src*="/Images/"]'
        ].join(',');
        Array.from(document.querySelectorAll(selector)).forEach(image => {
            const rect = image.getBoundingClientRect ? image.getBoundingClientRect() : { width: 1, height: 1 };
            const area = Math.max(1, rect.width * rect.height);
            const classText = String(image.className || '').toLowerCase();
            let score = Math.min(500000, area);
            if (classText.includes('nowplaying') || classText.includes('now-playing')) score += 1000000;
            const url = image.currentSrc || image.src || '';
            if (/\/Images\/Primary/i.test(url)) score += 300000;
            add(url, score, image);
        });
        const bgSelector = [
            '.nowPlayingBar [style]', '.nowPlayingPage [style]',
            '.nowPlayingInfoContainer [style]', '.detailImageContainer [style]'
        ].join(',');
        Array.from(document.querySelectorAll(bgSelector)).forEach(node => {
            const rect = node.getBoundingClientRect ? node.getBoundingClientRect() : { width: 1, height: 1 };
            add(
                getBackgroundImageUrl(node),
                500000 + Math.min(500000, Math.max(1, rect.width * rect.height)),
                node
            );
        });
        return candidates.sort((a, b) => b.score - a.score);
    }

    function dynamicDomArtworkCandidateAllowed(candidate, baseline = null) {
        if (!candidate || !candidate.url || candidate.conflictsCurrentItem) {
            return false;
        }
        if (candidate.boundToCurrentItem) return true;
        return !(baseline && baseline.has(candidate.url));
    }

    function dynamicDomArtworkSignalsPresence(candidate) {
        return !!(
            candidate
            && candidate.url
            && !candidate.conflictsCurrentItem
            && (
                candidate.boundToCurrentItem
                || candidate.playbackContext
                || candidate.inheritedArtworkCandidate
            )
        );
    }

    function dynamicDomArtworkTiming(candidate) {
        if (!candidate || !candidate.url) {
            return {
                mediaStableMs: DYNAMIC_BACKGROUND_DOM_STABLE_MS,
                confirmMs: DYNAMIC_BACKGROUND_UNBOUND_DOM_CONFIRM_MS,
                inheritedFastPath: false
            };
        }
        if (candidate.boundToCurrentItem) {
            return {
                mediaStableMs: 0,
                confirmMs: 0,
                inheritedFastPath: false
            };
        }
        if (
            candidate.inheritedArtworkCandidate
            && candidate.playbackContext
            && !candidate.conflictsCurrentItem
        ) {
            return {
                mediaStableMs: DYNAMIC_BACKGROUND_INHERITED_DOM_STABLE_MS,
                confirmMs: DYNAMIC_BACKGROUND_INHERITED_DOM_CONFIRM_MS,
                inheritedFastPath: true
            };
        }
        return {
            mediaStableMs: DYNAMIC_BACKGROUND_DOM_STABLE_MS,
            confirmMs: DYNAMIC_BACKGROUND_UNBOUND_DOM_CONFIRM_MS,
            inheritedFastPath: false
        };
    }


    function loadedDomArtworkImage(candidate) {
        const node = candidate && candidate.node;
        if (!node || String(node.tagName || '').toUpperCase() !== 'IMG') {
            return null;
        }
        const naturalWidth = Number(node.naturalWidth);
        const naturalHeight = Number(node.naturalHeight);
        if (
            node.complete === true
            && naturalWidth > 0
            && naturalHeight > 0
        ) {
            return node;
        }
        return null;
    }

    function dynamicArtworkFingerprintFromPixels(data, width, height) {
        const w = Math.max(1, Math.floor(Number(width) || 0));
        const h = Math.max(1, Math.floor(Number(height) || 0));
        if (!data || data.length < w * h * 4) return null;
        const rgb = new Uint8Array(w * h * 3);
        const luma = new Float32Array(w * h);
        const edges = [];
        let rgbIndex = 0;
        let meanR = 0, meanG = 0, meanB = 0;
        let hash = 2166136261;
        for (let index = 0; index < w * h; index += 1) {
            const source = index * 4;
            const alpha = Math.max(0, Math.min(255, Number(data[source + 3]) || 0)) / 255;
            const r = Math.round((Number(data[source]) || 0) * alpha);
            const g = Math.round((Number(data[source + 1]) || 0) * alpha);
            const b = Math.round((Number(data[source + 2]) || 0) * alpha);
            rgb[rgbIndex++] = r; rgb[rgbIndex++] = g; rgb[rgbIndex++] = b;
            meanR += r; meanG += g; meanB += b;
            luma[index] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            for (const value of [r >> 3, g >> 3, b >> 3]) {
                hash ^= value; hash = Math.imul(hash, 16777619);
            }
        }
        for (let y = 0; y < h; y += 1) {
            for (let x = 0; x < w; x += 1) {
                const index = y * w + x;
                if (x + 1 < w) edges.push(luma[index + 1] - luma[index]);
                if (y + 1 < h) edges.push(luma[index + w] - luma[index]);
            }
        }
        const count = w * h;
        return {
            width: w,
            height: h,
            hash: (hash >>> 0).toString(16).padStart(8, '0'),
            rgb,
            edges: Float32Array.from(edges),
            mean: [meanR / count, meanG / count, meanB / count]
        };
    }

    function dynamicArtworkFingerprint(image) {
        if (!image) return null;
        try {
            const size = 24;
            const canvas = document.createElement('canvas');
            canvas.width = size; canvas.height = size;
            const context = canvas.getContext && canvas.getContext('2d', { willReadFrequently: true });
            if (!context) return null;
            const iw = Number(image.naturalWidth || image.videoWidth || image.width || size);
            const ih = Number(image.naturalHeight || image.videoHeight || image.height || size);
            const scale = Math.max(size / Math.max(1, iw), size / Math.max(1, ih));
            const dw = iw * scale, dh = ih * scale;
            context.clearRect(0, 0, size, size);
            context.drawImage(image, (size - dw) * 0.5, (size - dh) * 0.5, dw, dh);
            const pixels = context.getImageData(0, 0, size, size);
            return dynamicArtworkFingerprintFromPixels(pixels.data, size, size);
        } catch {
            state.atmosphereDynamicFingerprintFailures += 1;
            return null;
        }
    }

    function dynamicArtworkFingerprintsEquivalent(first, second) {
        if (!first || !second || first.width !== second.width || first.height !== second.height) return false;
        if (first.hash && second.hash && first.hash === second.hash) return true;
        if (!first.rgb || !second.rgb || first.rgb.length !== second.rgb.length) return false;
        if (!first.edges || !second.edges || first.edges.length !== second.edges.length) return false;
        let colorDifference = 0;
        for (let index = 0; index < first.rgb.length; index += 1) colorDifference += Math.abs(first.rgb[index] - second.rgb[index]);
        const colorMad = colorDifference / first.rgb.length;
        let meanDifference = 0;
        for (let index = 0; index < 3; index += 1) meanDifference += Math.abs(first.mean[index] - second.mean[index]);
        meanDifference /= 3;
        let edgeDifference = 0;
        for (let index = 0; index < first.edges.length; index += 1) edgeDifference += Math.abs(first.edges[index] - second.edges[index]);
        const edgeMad = edgeDifference / Math.max(1, first.edges.length);
        return colorMad <= 4.5 && meanDifference <= 4.0 && edgeMad <= 8.0;
    }

    function preloadAtmosphereImage(url, timeoutMs = ATMOSPHERE_IMAGE_TIMEOUT_MS) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            let settled = false;
            const finish = (callback, value) => {
                if (settled) return;
                settled = true;
                clearTimeout(timeoutId);
                image.onload = null;
                image.onerror = null;
                callback(value);
            };
            const timeoutId = window.setTimeout(() => {
                state.atmosphereTimeoutCount += 1;
                finish(reject, new Error('Artwork image load timed out.'));
            }, Math.max(1, Number(timeoutMs) || ATMOSPHERE_IMAGE_TIMEOUT_MS));
            image.decoding = 'async';
            image.onload = () => finish(resolve, image);
            image.onerror = () => finish(reject, new Error('Artwork image load failed.'));
            image.src = url;
            if (image.complete && image.naturalWidth > 0) finish(resolve, image);
        });
    }

    function updateAtmospherePlaybackState(media) {
        const renderer = state.atmosphereDynamicRenderer;
        if (!renderer) return;

        if (
            !media
            || media.paused
            || media.ended
            || document.hidden
            || prefersReducedMotion()
        ) {
            renderer.stop();
            return;
        }

        renderer.start();
    }

    function dynamicBackgroundRendererOptions() {
        const mobile = state.performanceProfile === 'mobile';
        return {
            ...DYNAMIC_BACKGROUND_SETTINGS,
            renderScale: mobile ? 0.80 : 0.96,
            maxRenderLongEdge: mobile ? 1600 : 2560,
            onContextLost: () => {
                state.atmosphereDynamicContextLossCount += 1;
                state.atmosphereDynamicFallbackReason = 'webgl-context-lost';
                const root = state.atmosphereRoot;
                if (root) {
                    /* A lost context cannot paint the canvas. Remove the ready
                     * flag as well as showing fallback; otherwise the later
                     * ready rule can still hide the fallback layers. */
                    root.classList.remove('ak-dynamic-webgl-ready');
                    root.classList.add('ak-dynamic-fallback-active');
                }
            },
            onContextRestored: () => {
                state.atmosphereDynamicFallbackReason = 'webgl-context-restored-rebuild';
                rebuildDynamicBackgroundRenderer('context-restored');
            },
            onTransitionInterrupted: count => { state.atmosphereDynamicInterruptedTransitions = count; },
            onTransitionComplete: count => { state.atmosphereDynamicTransitionCount = count; }
        };
    }

    function dynamicRendererHasCurrentTexture(renderer) {
        return !!(
            renderer
            && renderer.hasCurrent
            && !renderer.contextLost
        );
    }

    function markDynamicBackgroundWebglReady(root, renderer) {
        if (!root || !dynamicRendererHasCurrentTexture(renderer)) {
            return false;
        }

        /* A constructor alone does not prove that the canvas can show the
         * artwork. Only hide the CSS fallback after a texture is current. */
        state.atmosphereDynamicWebglAvailable = true;
        state.atmosphereDynamicWebglFailureCount = 0;
        state.atmosphereDynamicWebglRetryAt = 0;
        state.atmosphereDynamicFallbackReason = '';
        root.classList.add('ak-dynamic-webgl-ready');
        root.classList.remove('ak-dynamic-fallback-active');
        return true;
    }

    function recordDynamicBackgroundWebglFailure(
        root,
        error,
        fallbackReason = 'webgl-init-failed'
    ) {
        const now = performance.now();
        const canvas =
            (root && directChildByClass(
                root,
                'ak-atmosphere-dynamic-canvas'
            ))
            || state.atmosphereDynamicCanvas;

        /* A failed upload can leave a renderer without a usable texture.
         * Dispose it so a due retry creates a clean context, but retain the
         * canvas identity so ensureDynamicBackgroundRenderer() honors backoff. */
        disposeDynamicBackgroundRenderer('webgl-failure');
        if (canvas) state.atmosphereDynamicCanvas = canvas;

        state.atmosphereDynamicWebglAvailable = false;
        state.atmosphereDynamicWebglFailureCount += 1;
        state.atmosphereDynamicWebglRetryAt = now + Math.min(
            DYNAMIC_BACKGROUND_WEBGL_RETRY_MAX_MS,
            DYNAMIC_BACKGROUND_WEBGL_RETRY_BASE_MS
                * Math.pow(
                    2,
                    Math.min(
                        3,
                        state.atmosphereDynamicWebglFailureCount - 1
                    )
                )
        );
        state.atmosphereDynamicFallbackReason = String(
            error && (error.message || error)
            || fallbackReason
        );

        if (root) {
            root.classList.remove('ak-dynamic-webgl-ready');
            root.classList.add('ak-dynamic-fallback-active');
        }

        return null;
    }

    function loadDynamicBackgroundRendererImage(
        root,
        renderer,
        image,
        failureReason = 'webgl-image-upload-failed'
    ) {
        try {
            const loaded = renderer
                && renderer.loadImageElement(image);

            if (!loaded || !markDynamicBackgroundWebglReady(root, renderer)) {
                throw new Error('WebGL artwork texture did not become current.');
            }

            if (prefersReducedMotion() || document.hidden) {
                renderer.renderFrame();
            } else {
                renderer.start();
            }

            return true;
        } catch (error) {
            recordDynamicBackgroundWebglFailure(
                root,
                error,
                failureReason
            );
            return false;
        }
    }

    function ensureDynamicBackgroundRenderer() {
        const root = state.atmosphereRoot && state.atmosphereRoot.isConnected ? state.atmosphereRoot : ensureAtmosphereRoot();
        if (!root) return null;
        const canvas = directChildByClass(root, 'ak-atmosphere-dynamic-canvas');
        if (!canvas) return null;
        if (state.atmosphereDynamicRenderer && state.atmosphereDynamicCanvas === canvas) {
            if (dynamicRendererHasCurrentTexture(state.atmosphereDynamicRenderer)) {
                markDynamicBackgroundWebglReady(
                    root,
                    state.atmosphereDynamicRenderer
                );
            } else {
                root.classList.remove('ak-dynamic-webgl-ready');
                root.classList.add('ak-dynamic-fallback-active');
            }
            return state.atmosphereDynamicRenderer;
        }

        const now = performance.now();
        const previousCanvas = state.atmosphereDynamicCanvas;
        if (previousCanvas && previousCanvas !== canvas) {
            state.atmosphereDynamicWebglFailureCount = 0;
            state.atmosphereDynamicWebglRetryAt = 0;
        } else if (
            previousCanvas === canvas
            && state.atmosphereDynamicWebglAvailable === false
            && now < state.atmosphereDynamicWebglRetryAt
        ) {
            return null;
        }

        disposeDynamicBackgroundRenderer('renderer-recreate');
        state.atmosphereDynamicCanvas = canvas;
        /* The CSS artwork remains the visible field until loadImageElement()
         * has successfully populated a current WebGL texture. */
        root.classList.remove('ak-dynamic-webgl-ready');
        root.classList.add('ak-dynamic-fallback-active');
        try {
            const renderer = new DynamicBackgroundRenderer(canvas, dynamicBackgroundRendererOptions());
            state.atmosphereDynamicRenderer = renderer;
            state.atmosphereDynamicWebglAvailable = true;
            renderer.resizeToDisplaySize();
            state.atmosphereDynamicResizeCount += 1;
            return renderer;
        } catch (error) {
            return recordDynamicBackgroundWebglFailure(
                root,
                error,
                'webgl-init-failed'
            );
        }
    }

    function startDynamicBackgroundRenderer() {
        if (document.hidden || prefersReducedMotion()) return false;
        const renderer = state.atmosphereDynamicRenderer || ensureDynamicBackgroundRenderer();
        if (!renderer) return false;
        renderer.start();
        return true;
    }

    function stopDynamicBackgroundRenderer(source = 'stop') {
        if (state.atmosphereDynamicRenderer) state.atmosphereDynamicRenderer.stop();
        return source;
    }

    function disposeDynamicBackgroundRenderer(source = 'dispose') {
        const renderer = state.atmosphereDynamicRenderer;
        state.atmosphereDynamicRenderer = null;
        if (renderer) {
            try { renderer.dispose(); } catch { /* context can already be lost */ }
        }
        state.atmosphereDynamicCanvas = null;
        return source;
    }

    function rebuildDynamicBackgroundRenderer(source = 'rebuild') {
        const artwork = state.atmosphereDynamicCurrentArtwork;
        const fingerprint = state.atmosphereDynamicCurrentFingerprint;
        disposeDynamicBackgroundRenderer(source);
        if (!isLyricsPage()) return null;
        const renderer = ensureDynamicBackgroundRenderer();
        if (!renderer || !artwork) return renderer;
        const rebuildSeq = state.atmosphereLoadSeq;
        preloadAtmosphereImage(artwork).then(image => {
            if (!isLyricsPage() || rebuildSeq !== state.atmosphereLoadSeq || artwork !== state.atmosphereDynamicCurrentArtwork) return;
            const current = state.atmosphereDynamicRenderer;
            if (!current) return;
            if (
                loadDynamicBackgroundRendererImage(
                    state.atmosphereRoot,
                    current,
                    image,
                    'webgl-rebuild-image-upload-failed'
                )
            ) {
                if (fingerprint) state.atmosphereDynamicCurrentFingerprint = fingerprint;
            }
        }).catch(error => {
            if (
                !isLyricsPage()
                || rebuildSeq !== state.atmosphereLoadSeq
                || artwork !== state.atmosphereDynamicCurrentArtwork
            ) {
                return;
            }

            recordDynamicBackgroundWebglFailure(
                state.atmosphereRoot,
                error,
                'webgl-rebuild-image-load-failed'
            );
        });
        return renderer;
    }

    function resizeDynamicBackgroundRenderer() {
        const renderer = state.atmosphereDynamicRenderer;
        if (!renderer) return false;
        try {
            const changed = renderer.resizeToDisplaySize();
            if (changed) {
                state.atmosphereDynamicResizeCount += 1;
                renderer.renderFrame();
            }
            return changed;
        } catch {
            return false;
        }
    }

    function dynamicFallbackLayer(root, index) {
        if (!root || !root.children) return null;
        return Array.from(root.children).find(child => child && child.dataset && child.dataset.akDynamicFallback === String(index)) || null;
    }

    function updateDynamicFallbackSameVisual(artworkUrl) {
        const root = state.atmosphereRoot;
        const active = dynamicFallbackLayer(root, state.atmosphereDynamicBaseIndex);
        if (active && artworkUrl) active.style.backgroundImage = `url(${JSON.stringify(artworkUrl)})`;
    }

    function setDynamicFallbackArtwork(artworkUrl) {
        const root = state.atmosphereRoot;
        if (!root) return;
        if (!artworkUrl) {
            for (const index of [0, 1]) {
                const layer = dynamicFallbackLayer(root, index);
                if (!layer) continue;
                layer.classList.remove('ak-dynamic-fallback-active-layer');
                layer.style.backgroundImage = 'none';
            }
            return;
        }
        const nextIndex = state.atmosphereDynamicBaseIndex === 0 ? 1 : 0;
        const next = dynamicFallbackLayer(root, nextIndex);
        const old = dynamicFallbackLayer(root, state.atmosphereDynamicBaseIndex);
        if (!next) return;
        next.style.backgroundImage = `url(${JSON.stringify(artworkUrl)})`;
        next.classList.remove('ak-dynamic-fallback-active-layer');
        void next.offsetWidth;
        next.classList.add('ak-dynamic-fallback-active-layer');
        if (old && old !== next) old.classList.remove('ak-dynamic-fallback-active-layer');
        state.atmosphereDynamicBaseIndex = nextIndex;
    }

    function activateDynamicBackgroundAtmosphere(image, artworkUrl, source, artworkFingerprint = null) {
        const root = ensureAtmosphereRoot();
        if (!root) return false;
        root.dataset.akMode = 'dynamic';
        document.documentElement.classList.add('ak-atmosphere-dynamic-mode');

        const sameUrl = !!artworkUrl && artworkUrl === state.atmosphereDynamicCurrentArtwork;
        const comparable = !!artworkFingerprint && !!state.atmosphereDynamicCurrentFingerprint;
        const sameVisual = comparable && dynamicArtworkFingerprintsEquivalent(artworkFingerprint, state.atmosphereDynamicCurrentFingerprint);
        const sameArtwork = comparable ? sameVisual : sameUrl;
        state.atmosphereDynamicIdentityMethod = sameVisual
            ? (sameUrl ? 'url+visual-fingerprint' : 'visual-fingerprint')
            : (comparable ? 'different-visual-fingerprint' : (sameUrl ? 'url-fallback' : 'new-artwork'));

        if (!artworkUrl || !image) {
            setDynamicFallbackArtwork('');
            state.atmosphereDynamicCurrentArtwork = '';
            state.atmosphereDynamicCurrentFingerprint = null;
            state.atmosphereArtwork = '';
            state.atmosphereSource = source || 'no-artwork';
            const renderer = state.atmosphereDynamicRenderer;
            if (renderer) renderer.stop();
            root.classList.remove('ak-dynamic-webgl-ready');
            root.classList.add('ak-dynamic-fallback-active');
            root.classList.add('ak-atmosphere-ready');
            return true;
        }

        if (sameArtwork) {
            if (sameVisual && !sameUrl) state.atmosphereDynamicVisualDedupCount += 1;
            /* Same album, different track-specific URL: update only recovery URL
             * metadata. A healthy current texture is left entirely untouched;
             * an earlier WebGL failure is eligible to recover once its backoff
             * expires. */
            updateDynamicFallbackSameVisual(artworkUrl);
            state.atmosphereDynamicCurrentArtwork = artworkUrl;
            if (artworkFingerprint) state.atmosphereDynamicCurrentFingerprint = artworkFingerprint;
            state.atmosphereArtwork = artworkUrl;
            state.atmosphereSource = `${source || 'unknown'}+same-visual-reuse`;
            root.classList.add('ak-atmosphere-ready');
            const existing = state.atmosphereDynamicRenderer;
            if (dynamicRendererHasCurrentTexture(existing)) {
                markDynamicBackgroundWebglReady(root, existing);
                if (!document.hidden && !prefersReducedMotion()) existing.start();
                return false;
            }

            root.classList.remove('ak-dynamic-webgl-ready');
            root.classList.add('ak-dynamic-fallback-active');

            const retryAt = Number(state.atmosphereDynamicWebglRetryAt) || 0;
            if (retryAt && performance.now() < retryAt) return false;

            const retryRenderer = ensureDynamicBackgroundRenderer();
            if (retryRenderer) {
                loadDynamicBackgroundRendererImage(
                    root,
                    retryRenderer,
                    image,
                    'webgl-same-artwork-retry-failed'
                );
            }

            return false;
        }

        setDynamicFallbackArtwork(artworkUrl);
        state.atmosphereDynamicCurrentArtwork = artworkUrl;
        state.atmosphereDynamicCurrentFingerprint = artworkFingerprint || null;
        const renderer = ensureDynamicBackgroundRenderer();
        if (renderer) {
            loadDynamicBackgroundRendererImage(
                root,
                renderer,
                image,
                'webgl-image-upload-failed'
            );
        } else {
            root.classList.add('ak-dynamic-fallback-active');
        }

        state.atmosphereArtwork = artworkUrl;
        state.atmosphereSource = `${source || 'unknown'}+dynamic-background`;
        state.atmosphereAnalysis = {
            extractionModel: 'none-direct-artwork-webgl',
            paletteSource: 'original-artwork-texture',
            referenceSource: DYNAMIC_BACKGROUND_SOURCE,
            engine: DYNAMIC_BACKGROUND_ENGINE,
            shader: 'kawase-blur+simplex-domain-warp',
            blurSize: DYNAMIC_BACKGROUND_SETTINGS.blurSize,
            blurPasses: DYNAMIC_BACKGROUND_SETTINGS.blurPasses,
            warpIntensity: DYNAMIC_BACKGROUND_SETTINGS.warpIntensity,
            animationSpeed: DYNAMIC_BACKGROUND_SETTINGS.animationSpeed,
            saturation: DYNAMIC_BACKGROUND_SETTINGS.saturation,
            opacity: DYNAMIC_BACKGROUND_SETTINGS.opacity,
            audioResponsive: false,
            transitionDurationMs: DYNAMIC_BACKGROUND_TRANSITION_MS,
            transitionFix: 'visible-dom-first+instant-inherited-art+direct-art-grace+latest-media-guard+per-url-stability+retrying-no-art+captured-interrupted-blend+visual-fingerprint-dedup',
            fallback: 'dual-layer-css-direct-artwork'
        };
        root.classList.add('ak-atmosphere-ready');
        return true;
    }

    function dynamicRequestStillCurrent(sequence, key) {
        if (sequence !== state.atmosphereLoadSeq || !isLyricsPage()) {
            state.atmosphereDynamicStaleCommitDrops += 1;
            return false;
        }
        const live = getLocalMediaElement(true);
        const liveKey = atmosphereMediaKey(live);
        const expectedItemId = currentLyricsItemId();
        const liveItemId = mediaItemId(live).toLowerCase();
        if (
            !live
            || !liveKey
            || liveKey !== key
            || (
                expectedItemId
                && liveItemId
                && liveItemId !== expectedItemId
            )
        ) {
            state.atmosphereDynamicStaleCommitDrops += 1;
            return false;
        }
        return true;
    }

    async function refreshAtmosphere(media, force = false) {
        if (!media || !isLyricsPage()) return;
        const key = atmosphereMediaKey(media);
        if (!key) return;
        const now = performance.now();
        if (key !== state.atmosphereMediaKey) {
            const previousKey = state.atmosphereMediaKey;
            state.atmosphereDynamicDomBaseline = previousKey
                ? new Set(domArtworkCandidates(media).map(candidate => candidate.url))
                : new Set();
            state.atmosphereMediaKey = key;
            state.atmosphereDynamicResolvedKey = '';
            state.atmosphereDynamicResolvedAt = 0;
            state.atmosphereDynamicNoArtwork = false;
            state.atmosphereDynamicNoArtFailures = 0;
            state.atmosphereDynamicDirectRetryAt = 0;
            state.atmosphereDynamicDomCandidateSinceByUrl.clear();
            state.atmosphereDynamicMediaStableSince = now;
            state.atmosphereDynamicWeakSource = false;
            state.atmosphereFailedKey = '';
            state.atmosphereFailedAt = 0;
        }

        if (!force && key === state.atmosphereDynamicResolvedKey) {
            const resolvedAge = now - state.atmosphereDynamicResolvedAt;
            const retryAt = Number(
                state.atmosphereDynamicWebglRetryAt
            ) || 0;
            const webglRecoveryDue = (
                state.atmosphereDynamicWebglAvailable === false
                || !dynamicRendererHasCurrentTexture(
                    state.atmosphereDynamicRenderer
                )
            ) && now >= retryAt;

            /* A stable direct-art result normally needs no more work. An
             * unchanged URL must still be re-entered once WebGL backoff expires
             * so a failed constructor/upload is not permanent for that album. */
            if (
                !state.atmosphereDynamicWeakSource
                && !state.atmosphereDynamicNoArtwork
                && !webglRecoveryDue
            ) {
                return;
            }
            if (
                state.atmosphereDynamicWeakSource
                && resolvedAge < DYNAMIC_BACKGROUND_WEAK_RECHECK_MS
                && !webglRecoveryDue
            ) {
                return;
            }
            if (
                state.atmosphereDynamicNoArtwork
                && resolvedAge < DYNAMIC_BACKGROUND_NO_ART_RETRY_MS
                && !webglRecoveryDue
            ) {
                return;
            }
        }
        if (!force && key === state.atmospherePendingKey) return;
        if (!force && key === state.atmosphereFailedKey && now - state.atmosphereFailedAt < 800) return;

        state.atmospherePendingKey = key;
        state.atmospherePendingSince = now;
        const sequence = ++state.atmosphereLoadSeq;
        const finishPending = () => {
            if (sequence === state.atmosphereLoadSeq && state.atmospherePendingKey === key) {
                state.atmospherePendingKey = '';
                state.atmospherePendingSince = 0;
            }
        };

        try {
            /* The visible now-playing artwork is the primary source. This is
             * essential for music items that inherit Primary art from their
             * album: waiting for a synthetic track-level /Images/Primary
             * request to fail made those covers intrinsically slower. */
            /* DOM fallback must protect rapid skips without penalizing normal
             * album-inherited music art. Jellyfin often exposes several artwork
             * URLs at once, so stability is tracked per URL rather than through
             * one shared candidate timestamp. */
            if (!dynamicRequestStillCurrent(sequence, key)) return;

            const stableFor = performance.now() - state.atmosphereDynamicMediaStableSince;
            const baseline = state.atmosphereDynamicDomBaseline || new Set();
            const rawDomCandidates = domArtworkCandidates(media);
            const domCandidates = rawDomCandidates.filter(candidate =>
                dynamicDomArtworkCandidateAllowed(candidate, baseline)
            );
            const visibleArtworkStillPresent = rawDomCandidates.some(
                dynamicDomArtworkSignalsPresence
            );
            const liveUrls = new Set(domCandidates.map(candidate => candidate.url));
            for (const url of Array.from(state.atmosphereDynamicDomCandidateSinceByUrl.keys())) {
                if (!liveUrls.has(url)) {
                    state.atmosphereDynamicDomCandidateSinceByUrl.delete(url);
                }
            }

            let sawUnboundCandidate = false;
            for (const candidate of domCandidates) {
                const { url, boundToCurrentItem } = candidate;
                const timing = dynamicDomArtworkTiming(candidate);
                const candidateNow = performance.now();

                if (!boundToCurrentItem) {
                    sawUnboundCandidate = true;
                    if (!state.atmosphereDynamicDomCandidateSinceByUrl.has(url)) {
                        state.atmosphereDynamicDomCandidateSinceByUrl.set(url, candidateNow);
                    }
                }

                const candidateSince = boundToCurrentItem
                    ? candidateNow
                    : state.atmosphereDynamicDomCandidateSinceByUrl.get(url);
                const candidateStableFor = Math.max(0, candidateNow - candidateSince);
                if (stableFor < timing.mediaStableMs) continue;
                if (!boundToCurrentItem && candidateStableFor < timing.confirmMs) continue;

                try {
                    const image =
                        loadedDomArtworkImage(candidate)
                        || await preloadAtmosphereImage(url);
                    if (!dynamicRequestStillCurrent(sequence, key)) return;

                    const liveCandidate = domArtworkCandidates(media)
                        .find(item => item.url === url);
                    if (
                        !liveCandidate
                        || liveCandidate.conflictsCurrentItem
                        || !dynamicDomArtworkCandidateAllowed(liveCandidate, baseline)
                    ) {
                        continue;
                    }

                    const liveTiming = dynamicDomArtworkTiming(liveCandidate);
                    const liveNow = performance.now();
                    const liveStableFor = liveNow - state.atmosphereDynamicMediaStableSince;
                    const liveCandidateSince = liveCandidate.boundToCurrentItem
                        ? liveNow
                        : state.atmosphereDynamicDomCandidateSinceByUrl.get(url);
                    if (liveStableFor < liveTiming.mediaStableMs) continue;
                    if (
                        !liveCandidate.boundToCurrentItem
                        && (
                            !Number.isFinite(liveCandidateSince)
                            || liveNow - liveCandidateSince < liveTiming.confirmMs
                        )
                    ) {
                        continue;
                    }

                    const fingerprint = dynamicArtworkFingerprint(image);
                    state.atmosphereDynamicWeakSource = true;
                    state.atmosphereDynamicNoArtwork = false;
                    state.atmosphereDynamicNoArtFailures = 0;
                    state.atmosphereDynamicResolvedKey = key;
                    state.atmosphereDynamicResolvedAt = performance.now();
                    state.atmosphereDynamicDomCandidateSinceByUrl.clear();
                    state.atmosphereDynamicDomFallbackCommits += 1;
                    if (liveTiming.inheritedFastPath) {
                        state.atmosphereDynamicFastInheritedCommits += 1;
                    }
                    activateDynamicBackgroundAtmosphere(
                        image,
                        url,
                        liveTiming.inheritedFastPath
                            ? 'jellyfin-dom-album-inherited-fast-fallback'
                            : 'jellyfin-dom-artwork-identity-gated-fallback',
                        fingerprint
                    );
                    state.atmosphereFailedKey = '';
                    return;
                } catch {
                    // Continue to the next identity-safe DOM candidate.
                }
            }
            if (!sawUnboundCandidate) {
                state.atmosphereDynamicDomCandidateSinceByUrl.clear();
            }

            if (!dynamicRequestStillCurrent(sequence, key)) return;

            /* Give Jellyfin's own now-playing DOM a short window to paint the
             * new cover without holding atmospherePendingKey on a network
             * request. Probe-burst and artwork mutations can therefore commit
             * inherited album art on the first frame it becomes visible. */
            const directAge =
                performance.now() - state.atmosphereDynamicMediaStableSince;
            if (!force && directAge < DYNAMIC_BACKGROUND_DIRECT_GRACE_MS) {
                return;
            }

            const direct = mediaItemArtworkCandidate(media);
            if (
                direct
                && (force || performance.now() >= state.atmosphereDynamicDirectRetryAt)
            ) {
                try {
                    const image = await preloadAtmosphereImage(
                        direct,
                        DYNAMIC_BACKGROUND_DIRECT_LOAD_TIMEOUT_MS
                    );
                    if (!dynamicRequestStillCurrent(sequence, key)) return;
                    const fingerprint = dynamicArtworkFingerprint(image);
                    state.atmosphereDynamicWeakSource = false;
                    state.atmosphereDynamicNoArtwork = false;
                    state.atmosphereDynamicNoArtFailures = 0;
                    state.atmosphereDynamicDirectRetryAt = 0;
                    activateDynamicBackgroundAtmosphere(
                        image,
                        direct,
                        'media-item-primary-fallback',
                        fingerprint
                    );
                    state.atmosphereDynamicResolvedKey = key;
                    state.atmosphereDynamicResolvedAt = performance.now();
                    state.atmosphereFailedKey = '';
                    return;
                } catch {
                    state.atmosphereDynamicDirectLoadFailures += 1;
                    state.atmosphereDynamicDirectRetryAt =
                        performance.now() + DYNAMIC_BACKGROUND_DIRECT_RETRY_MS;
                }
            }

            if (!dynamicRequestStillCurrent(sequence, key)) return;
            const failureNow = performance.now();

            /* Never convert an identity-ambiguous but visibly present cover into
             * a confirmed no-art state. This is crucial for album-inherited
             * music artwork and same-album track changes. Keep the current
             * background in place, throttle the retry, and wait for Jellyfin's
             * DOM identity to settle instead of blanking the atmosphere. */
            if (visibleArtworkStillPresent) {
                state.atmosphereDynamicNoArtFailures = 0;
                state.atmosphereDynamicNoArtwork = false;
                state.atmosphereFailedKey = key;
                state.atmosphereFailedAt = failureNow;
                return;
            }

            state.atmosphereDynamicNoArtFailures += 1;
            state.atmosphereFailedKey = key;
            state.atmosphereFailedAt = failureNow;

            if (
                failureNow - state.atmosphereDynamicMediaStableSince
                    >= DYNAMIC_BACKGROUND_NO_ART_CONFIRM_MS
                && state.atmosphereDynamicNoArtFailures >= 2
            ) {
                activateDynamicBackgroundAtmosphere(null, '', 'confirmed-no-artwork');
                state.atmosphereDynamicResolvedKey = key;
                state.atmosphereDynamicResolvedAt = failureNow;
                state.atmosphereDynamicWeakSource = false;
                state.atmosphereDynamicNoArtwork = true;
            }
        } finally {
            finishPending();
        }
    }

    function maybeRefreshAtmosphere(media, frameNow) {
        if (frameNow - state.atmosphereLastCheck < 250) return;
        state.atmosphereLastCheck = frameNow;
        const root = ensureAtmosphereRoot();
        if (root) root.dataset.akMode = 'dynamic';
        refreshAtmosphere(media, false).catch(error => warn('Dynamic Background refresh failed:', error));
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

        const expectedItemId = currentLyricsItemId();
        const candidateItemId = mediaItemId(element).toLowerCase();
        if (expectedItemId && candidateItemId) {
            score += candidateItemId === expectedItemId ? 90 : -45;
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
                && parsed > 0
                    ? Math.min(
                        parsed,
                        Number.MAX_SAFE_INTEGER
                    )
                    : 0;

            return state.mediaStartOffsetTicks;
        } catch {
            return 0;
        }
    }

    function getJellyfinActiveLineIndex() {
        const container =
            getCurrentLyricsContainer(false);

        if (!container) return -1;

        let lines = [];

        try {
            lines = Array.from(
                container.querySelectorAll('.lyricsLine')
            );
        } catch {
            return -1;
        }

        if (!lines.length) return -1;

        /*
         * Jellyfin's lyric view has changed active-line markers across web
         * releases and custom skins. This probe intentionally recognises only
         * generic stock-style state markers and never our own `ak-current`
         * class. If no trustworthy marker exists, chooseTimelineTicks() falls
         * back to the StartTimeTicks-adjusted source timeline. That fallback is
         * safer than guessing from layout position and, importantly, prevents
         * the historical ReferenceError in this transcode-only branch.
         */
        const selectors = [
            '[aria-current="true"]',
            '[data-current="true"]',
            '[data-active="true"]',
            '.current',
            '.active',
            '.selected'
        ];

        for (let index = lines.length - 1; index >= 0; index -= 1) {
            const line = lines[index];
            if (!line || typeof line.matches !== 'function') continue;

            try {
                if (selectors.some(selector => line.matches(selector))) {
                    return index;
                }
            } catch {
                return -1;
            }
        }

        return -1;
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

        const presentationRecord = state.lineData[presentationLine];
        const presentationTrustedEnd = Number(
            presentationRecord && presentationRecord.trustedEndTicks
        );
        const presentationCanRemainCurrent =
            !Number.isFinite(presentationTrustedEnd)
            || ticks < presentationTrustedEnd;

        if (
            !active.includes(presentationLine)
            && presentationLine >= 0
            && presentationLine < state.lineData.length
            && presentationCanRemainCurrent
        ) {
            /* The presentation line is the upper bound, so after reversing the
             * descending scan it belongs at the end of this ascending list. */
            active.push(presentationLine);
        }

        return active;
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

    function sourceTimelineTicks(
        media,
        frameNow,
        projectClock = true
    ) {
        if (!media) return null;
        const seconds = projectClock
            ? projectedMediaSeconds(media, frameNow)
            : Math.max(0, Number(media.currentTime) || 0);
        const rawTicks = seconds * TICKS_PER_SECOND;
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

        return timelineTicks;
    }

    function chooseTimelineTicks(
        media,
        frameNow
    ) {
        const timelineTicks = sourceTimelineTicks(media, frameNow, true);
        return Number.isFinite(timelineTicks)
            ? applyUserTimingOffsetTicks(timelineTicks)
            : null;
    }

    function cueEndTicks(lineIndex, cueIndex, cue, cues) {
        const start = nullableTick(
            cueValue(cue, 'Start', 'start')
        ) || 0;
        const explicitEnd = nullableTick(
            cueValue(cue, 'End', 'end')
        );
        if (explicitEnd !== null && explicitEnd > start) {
            return explicitEnd;
        }

        const cueList = Array.isArray(cues) ? cues : [];

        /* A cue can be skipped from visual tokenisation because it is empty,
         * duplicated, or otherwise has no paintable text. It can nevertheless
         * be the authoritative timing boundary for the preceding visible cue
         * (most notably the terminal text.length marker emitted by the
         * converter). Scan forward to the first strictly later timestamp
         * instead of only consulting the next paintable cue. */
        for (
            let nextIndex = Math.max(0, Number(cueIndex) + 1);
            nextIndex < cueList.length;
            nextIndex += 1
        ) {
            const nextEntry = cueList[nextIndex];
            const nextCue =
                nextEntry
                && (
                    nextEntry.cue
                    || nextEntry
                );
            const nextStart = nullableTick(
                cueValue(nextCue, 'Start', 'start')
            );

            if (nextStart !== null && nextStart > start) {
                return nextStart;
            }
        }

        const currentLyric =
            state.lyrics
            && state.lyrics[lineIndex];

        const explicitLineEnd = nullableTick(
            lyricValue(
                currentLyric,
                'End',
                'end'
            )
        );

        if (
            explicitLineEnd !== null
            && explicitLineEnd > start
        ) {
            return explicitLineEnd;
        }

        const nextLineStart = nextLyricStartTicks(lineIndex, start);
        if (nextLineStart !== null && nextLineStart > start) {
            return nextLineStart;
        }

        return start + 7500000;
    }


    function smoothWordProgress(word, target, frameNow) {
        target = Number.isFinite(target)
            ? Math.max(0, Math.min(1, target))
            : 0;

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
        if (
            !word
            || !Array.isArray(word.segments)
            || !word.segments.length
            || !Number.isFinite(word.start)
            || !Number.isFinite(word.end)
            || !Number.isFinite(timelineTicks)
        ) {
            return 0;
        }

        if (timelineTicks >= word.end) return 1;

        if (timelineTicks <= word.start) {
            return 0;
        }

        let completed =
            0;
        const wordLength = Math.max(
            1,
            Number(word.length) || 1
        );

        for (const segment of word.segments) {
            if (
                !segment
                || !Number.isFinite(segment.start)
                || !Number.isFinite(segment.end)
            ) {
                continue;
            }

            const visualStart =
                Number.isFinite(segment.visualStart)
                    ? clamp01(segment.visualStart)
                    : clamp01(
                        (Number(segment.startPos) || 0)
                        / wordLength
                    );

            const visualEnd =
                Number.isFinite(segment.visualEnd)
                    ? clamp01(segment.visualEnd)
                    : clamp01(
                        (Number(segment.endPos) || 0)
                        / wordLength
                    );

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
        return 64;
    }

    function classicGlowEnergies(
        metrics,
        t,
        continuityGain,
        word
    ) {
        const accent = currentAccent();
        const motionTime = Number.isFinite(t) ? t : 0;
        const continuity = Number.isFinite(continuityGain)
            ? clamp01(continuityGain)
            : 0;
        const shadowIntensity = Math.max(
            0,
            Number(metrics && metrics.shadowIntensity) || 0
        );
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
            shadowIntensity
            * accent.gain
            * (0.94 + 0.06 * sustain)
            * continuity
        );

        /* Soft knee keeps the highlight luminous without an OLED-white shelf. */
        const energy = 1 - Math.exp(-1.50 * rawEnergy);
        const spark = glowPulse(motionTime, 0, 0.10, 0.28, 0.56);
        const bloom = glowPulse(motionTime, 0.025, 0.19, 0.44, 0.80);
        const afterglow = glowPulse(motionTime, 0.11, 0.32, 0.60, 0.98);

        let core = energy * (0.88 * spark + 0.12 * bloom);
        let halo = energy
            * (0.74 * bloom + 0.26 * afterglow)
            * (0.82 + 0.10 * sustain);

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

    function resetWordMotion(word) {
        if (
            !word
            || !word.element
        ) {
            return;
        }

        word.element.classList.remove('ak-word-handoff');

        if (word._akMotionIsReset) return;

        word.element.style.transform = '';
        word.element.style.filter = '';
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
        return Math.round(
            painted * 1000
        ) / 10;
    }

    function updateWordVisual(word, timelineTicks, frameNow) {
        if (
            !word
            || !word.element
            || !Array.isArray(word.segments)
            || !word.segments.length
            || !Number.isFinite(timelineTicks)
        ) {
            return;
        }

        if (
            !Number.isFinite(word.start)
            || !Number.isFinite(word.end)
        ) {
            setStaticWordState(word, 'future', frameNow, false);
            return;
        }

        const motionEnd =
            word.motionMode === 'grow'
                ? word.end
                    + MOTION_HANDOFF_TICKS
                : word.end;

        if (timelineTicks <= word.start) {
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
                timelineTicks
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
                `${progressBucket.toFixed(1)}%`
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
        }
    }

    function setStaticWordState(
        word,
        stateName,
        frameNow,
        preserveMotion = false
    ) {
        if (
            !word
            || !word.element
            || !Array.isArray(word.segments)
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
        force,
        instrumentalGap = null
    ) {
        const isActive =
            !instrumentalGap
            && activeLines.includes(lineIndex);

        const overlapCurrent =
            isActive
            && activeLines.length > 1;

        const trustedEnd = Number(lineRecord.trustedEndTicks);
        const presentationExpired =
            !instrumentalGap
            && !isActive
            && lineIndex === activeLine
            && Number.isFinite(trustedEnd)
            && Number.isFinite(ticks)
            && ticks >= trustedEnd;

        const phase = instrumentalGap
            ? (
                lineIndex < instrumentalGap.nextLineIndex
                    ? 'past'
                    : 'future'
            )
            : (
                isActive
                    ? 'current'
                    : (
                        presentationExpired
                        || lineIndex < activeLine
                    )
                    ? 'past'
                    : (
                        lineIndex > activeLine
                            ? 'future'
                            : 'current'
                    )
            );

        const band =
            instrumentalGap
                ? instrumentalGapDistanceBand(
                    lineIndex,
                    instrumentalGap.nextLineIndex
                )
                : overlapLineDistanceBand(
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
            const dynamicCarry =
                !!(
                    state.handoffLineIndexes
                    && state.handoffLineIndexes.has(lineIndex)
                );

            words.forEach(word => {
                const keep =
                    (
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

    function clearLineMotionHandoff(lineRecord) {
        if (!lineRecord) return;

        if (lineRecord.element) {
            lineRecord.element.classList.remove('ak-motion-handoff');
        }

        (lineRecord.words || []).forEach(resetWordMotion);
    }

    function resetMotionHandoffs() {
        const indexes = state.handoffLineIndexes;
        if (!indexes || typeof indexes.forEach !== 'function') return;

        indexes.forEach(lineIndex => {
            clearLineMotionHandoff(state.lineData[lineIndex]);
        });
        indexes.clear();
    }

    function syncStaticLineStates(
        activeLine,
        activeLines,
        ticks,
        frameNow,
        instrumentalGap = null
    ) {
        const previous =
            state.lastActiveLine;

        const instrumentalActive = !!instrumentalGap;

        const removedActiveLines =
            state.activeLineIndexes.filter(
                index => !activeLines.includes(index)
            );

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

        if (forceFull || instrumentalActive) {
            resetMotionHandoffs();
        } else {
            removedActiveLines.forEach(lineIndex => {
                const line = state.lineData[lineIndex];
                const preserve = !!(
                    line
                    && (line.words || []).some(word =>
                        motionHandoffActive(word, ticks)
                    )
                );

                if (preserve) {
                    state.handoffLineIndexes.add(lineIndex);
                } else {
                    state.handoffLineIndexes.delete(lineIndex);
                    clearLineMotionHandoff(line);
                }
            });

            activeLines.forEach(lineIndex => {
                if (state.handoffLineIndexes.delete(lineIndex)) {
                    clearLineMotionHandoff(state.lineData[lineIndex]);
                }
            });
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
                    forceFull,
                    instrumentalGap
                )
            ) {
                mutationCount += 1;
            }
        });

        state.lineTransitionCount += 1;
        state.lastLineSyncCount = mutationCount;
        state.maxLineSyncCount =
            Math.max(
                state.maxLineSyncCount,
                mutationCount
            );

        state.lastActiveLine = activeLine;
    }

    function updateLineHandoffs(ticks, activeLines) {
        const indexes = state.handoffLineIndexes;
        if (!indexes || !indexes.size) return;

        const active = Array.isArray(activeLines)
            ? activeLines
            : [];

        Array.from(indexes).forEach(lineIndex => {
            const line = state.lineData[lineIndex];

            if (!line || !line.element || active.includes(lineIndex)) {
                clearLineMotionHandoff(line);
                indexes.delete(lineIndex);
                return;
            }

            let anyHandoff = false;

            (line.words || []).forEach(word => {
                const preserve = motionHandoffActive(word, ticks);

                if (!preserve) {
                    resetWordMotion(word);
                    return;
                }

                anyHandoff = true;
                word.element.classList.add('ak-word-handoff');

                const continuityGain = motionContinuityGain(word, ticks);

                if (word.motionGlyphs && word.motionGlyphs.length) {
                    updateMotionGlyphs(word, ticks, continuityGain);
                } else if (word.wholeMotion) {
                    updateWholeMotion(word, ticks, continuityGain);
                }
            });

            line.element.classList.toggle(
                'ak-motion-handoff',
                anyHandoff
            );

            if (!anyHandoff) indexes.delete(lineIndex);
        });
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

            if (
                type === 'loadedmetadata'
                || type === 'playing'
                || type === 'canplay'
                || type === 'emptied'
            ) {
                state.atmosphereLastCheck = 0;
                scheduleDynamicBackgroundProbeBurst(`media-${type}`);
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
        try {
            state.rafId = 0;
    
            if (!shouldRunAnimationLoop()) {
                stopAnimationLoop('render-inactive');
                return;
            }
    
            const firstDecoratedLine =
                state.lineData[0]
                && state.lineData[0].element;

            /*
             * Full DOM ownership validation is mutation/watchdog driven so the
             * 60 fps path stays O(1). The observer invalidates
             * decoratedGeneration immediately when Jellyfin replaces children.
             */
            if (
                state.decoratedGeneration !== state.generation
                || !firstDecoratedLine
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
    
            const timelineLine =
                findLineIndexAtTicks(
                    ticks
                );
    
            const instrumentalGap =
                findInstrumentalGapAtTicks(ticks);
    
            const instrumentalGapIndex =
                instrumentalGap
                    ? instrumentalGap.index
                    : -1;
    
            /*
             * During a real instrumental break no lyric line is "current". Use
             * the upcoming line only as the neighborhood anchor so the completed
             * lyric becomes past, the next lyric stays future and the synthetic
             * note row owns the visual focus between them.
             */
            const activeLine = instrumentalGap
                ? instrumentalGap.nextLineIndex
                : timelineLine;
    
            let activeLines;
    
            if (instrumentalGap) {
                activeLines =
                    state.activeLineScratch
                    || (state.activeLineScratch = []);
                activeLines.length = 0;
            } else {
                activeLines =
                    findActiveLineIndexesAtTicks(
                        ticks,
                        activeLine
                    );
            }

            const activeLineChanged =
                activeLine !== state.lastActiveLine;

            const activeSetChanged =
                activeLineChanged
                || instrumentalGapIndex
                    !== state.activeInstrumentalGapIndex
                || !sameIndexList(
                    activeLines,
                    state.activeLineIndexes
                );
    
            if (activeSetChanged) {
                syncStaticLineStates(
                    activeLine,
                    activeLines,
                    ticks,
                    frameNow,
                    instrumentalGap
                );
                /* Current/future scaling can change a line's measured edge.
                 * Re-anchor attached backing vocals only at line transitions,
                 * never on the steady-state frame path. */
                alignBackgroundVocalAnchors();
                queueBackgroundVocalAnchorRefresh();

                /* Diagnostics keep a human-readable signature, but build it only
                 * when the active set changes instead of allocating every frame. */
                state.lastActiveLineSignature =
                    activeLines.join(',');
                state.activeLineIndexes =
                    activeLines.slice();

                if (
                    activeLineChanged
                    && !instrumentalGap
                    && activeLine >= 0
                ) {
                    focusLyricLineIndex(
                        activeLine,
                        {
                            force: false,
                            behavior: 'smooth',
                            reason: 'playback-follow'
                        }
                    );
                }
            }

            updateInstrumentalGapVisual(
                instrumentalGap,
                ticks
            );
    
            updateAtmospherePlaybackState(media);
    
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
    
                (current.words || [])
                    .forEach(word => {
                        updateWordVisual(
                            word,
                            ticks,
                            frameNow
                        );
                    });
            });
    
            updateLineHandoffs(
                ticks,
                instrumentalGap ? [] : activeLines
            );
    
            scheduleNextFrame(
                media,
                false
            );
        } catch (error) {
            state.rafId = 0;
            state.animationLoopErrors += 1;
            state.lastAnimationLoopError = String(
                error && (error.stack || error.message || error) || 'unknown render error'
            ).slice(0, 1200);
            warn('Lyric visual frame failed; scheduling recovery:', error);

            /* Background work must never be able to permanently kill ELRC
             * sweep/glow or the instrumental liquid fill. One failed frame is
             * isolated and the lyric loop is restarted on a short timer. */
            if (shouldRunAnimationLoop() && !state.frameTimer) {
                state.animationLoopRecoveries += 1;
                state.frameTimer = window.setTimeout(() => {
                    state.frameTimer = 0;
                    wakeAnimationLoop();
                }, LYRIC_FRAME_RECOVERY_MS);
            } else if (!shouldRunAnimationLoop()) {
                stopAnimationLoop('frame-error-inactive');
            }
        }
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


    function installLyricVisualWatchdog() {
        if (state.animationWatchdogTimer) return;

        state.animationWatchdogTimer = window.setInterval(() => {
            if (document.hidden || !isLyricsPage() || !state.lyrics) return;

            if (!lyricVisualDomHealthy()) {
                state.decoratedGeneration = -1;
                queueDecoration();
                return;
            }

            /* Timed lyrics already probe artwork from their animation loop.
             * Plain/untimed lyrics intentionally stop that loop, so keep a
             * lightweight watchdog probe alive for late album/folder covers,
             * including covers painted through CSS background-image. Resolved
             * strong sources return immediately inside refreshAtmosphere(). */
            const media = getLocalMediaElement(true);
            if (media) {
                maybeRefreshAtmosphere(media, performance.now());
            }

            if (
                shouldRunAnimationLoop()
                && !state.animationLoopRunning
                && !state.rafId
                && !state.frameTimer
            ) {
                state.animationWatchdogRecoveries += 1;
                wakeAnimationLoop();
            }
        }, LYRIC_VISUAL_WATCHDOG_MS);
    }


    function installDomObserver() {
        const lyricSelector =
            '.lyricPage, .lyricsContainer, .lyricsLine';

        const touchesLyricDom = node => {
            if (!node) return false;
            let element = node.nodeType === 1
                ? node
                : (node.parentElement || node.parentNode);
            if (!element) return false;

            if (
                typeof element.matches === 'function'
                && element.matches(lyricSelector)
            ) {
                return true;
            }

            if (typeof element.closest === 'function') {
                if (
                    element.closest('.lyricsLine')
                    || element.closest('.lyricsContainer')
                    || element.closest('.lyricPage')
                ) {
                    return true;
                }
            }

            return typeof element.querySelector === 'function'
                && !!element.querySelector(lyricSelector);
        };

        const artworkSelector = [
            '.nowPlayingBar img',
            '.nowPlayingPage img',
            '.nowPlayingInfoContainer img',
            '.detailImageContainer img',
            '.nowPlayingBar [style*="background-image"]',
            '.nowPlayingPage [style*="background-image"]',
            '.nowPlayingInfoContainer [style*="background-image"]',
            '.detailImageContainer [style*="background-image"]'
        ].join(',');

        const touchesArtworkDom = node => {
            if (!node) return false;
            const element = node.nodeType === 1
                ? node
                : (node.parentElement || node.parentNode);
            if (!element) return false;
            if (
                typeof element.matches === 'function'
                && element.matches(artworkSelector)
            ) {
                return true;
            }
            if (
                String(element.tagName || '').toUpperCase() === 'IMG'
                && typeof element.closest === 'function'
                && element.closest(
                    '.nowPlayingBar,.nowPlayingPage,.nowPlayingInfoContainer,.detailImageContainer'
                )
            ) {
                return true;
            }
            return typeof element.querySelector === 'function'
                && !!element.querySelector(artworkSelector);
        };

        const observer = new MutationObserver(mutations => {
            if (document.hidden || !isLyricsPage() || !state.lyrics) return;

            let shouldCheck = false;
            let artworkChanged = false;

            for (const mutation of mutations) {
                if (mutation.type === 'attributes') {
                    if (touchesArtworkDom(mutation.target)) {
                        artworkChanged = true;
                    }
                    continue;
                }

                if (mutation.type === 'characterData') {
                    if (touchesLyricDom(mutation.target)) {
                        shouldCheck = true;
                    }
                    continue;
                }

                if (mutation.type !== 'childList') continue;
                if (touchesLyricDom(mutation.target)) {
                    shouldCheck = true;
                }
                if (touchesArtworkDom(mutation.target)) {
                    artworkChanged = true;
                }

                const changedNodes = [
                    ...Array.from(mutation.addedNodes || []),
                    ...Array.from(mutation.removedNodes || [])
                ];
                if (changedNodes.some(touchesLyricDom)) {
                    shouldCheck = true;
                }
                if (changedNodes.some(touchesArtworkDom)) {
                    artworkChanged = true;
                }
            }

            if (shouldCheck && !lyricVisualDomHealthy()) {
                state.decoratedGeneration = -1;
                stopAnimationLoop('lyric-dom-mutated');
                queueDecoration();
            }

            if (artworkChanged) {
                state.atmosphereLastCheck = 0;
                const media = getLocalMediaElement(true);
                if (media) {
                    refreshAtmosphere(media, true).catch(error =>
                        warn('Dynamic Background artwork mutation refresh failed:', error)
                    );
                }
            }
        });

        const startObserver = () => observer.observe(
            document.documentElement,
            {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true,
                /* Per-frame lyric transforms also mutate `style`, so do not
                 * observe that attribute globally. The 700 ms visual watchdog
                 * continuously probes CSS background artwork without adding a
                 * mutation record for every animated glyph. */
                attributeFilter: ['src', 'srcset']
            }
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

    function installReducedMotionHook() {
        try {
            if (!window.matchMedia) return;

            reducedMotionMediaQuery = window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            );

            const refreshForPreferenceChange = () => {
                state.lastActiveLine = -999;
                state.lastActiveLineSignature = '';
                state.activeLineIndexes = [];
                resetMotionHandoffs();
                state.forceNextFrame = true;

                if (state.lyrics && isLyricsPage()) {
                    /* Existing grow layers must be rebuilt as plain wipe-only
                     * words (and vice versa) when the OS setting changes. */
                    state.decoratedGeneration = -1;
                    queueDecoration();
                    queueMotionGeometryRefresh();
                }

                wakeAnimationLoop();
            };

            if (typeof reducedMotionMediaQuery.addEventListener === 'function') {
                reducedMotionMediaQuery.addEventListener(
                    'change',
                    refreshForPreferenceChange
                );
            } else if (typeof reducedMotionMediaQuery.addListener === 'function') {
                reducedMotionMediaQuery.addListener(refreshForPreferenceChange);
            }
        } catch {
            // Reduced-motion media queries are optional in older WebViews.
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
                state.lyricAutoFollowSuspendedUntil = 0;
                state.lyricAutoFollowLastIndex = -1;
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
                clearDynamicProbeTimers();
                state.atmosphereDynamicProbeToken += 1;
                removeAtmosphereRoot('route-leave');
            }
        });

        window.addEventListener(
            'resize',
            () => {
                queueMotionGeometryRefresh();
                resizeDynamicBackgroundRenderer();
                wakeAnimationLoop();
            },
            { passive: true }
        );

        window.addEventListener(
            'orientationchange',
            () => {
                queueMotionGeometryRefresh();
                resizeDynamicBackgroundRenderer();
                wakeAnimationLoop();
            },
            { passive: true }
        );

        if (window.visualViewport) {
            window.visualViewport.addEventListener(
                'resize',
                () => {
                    queueMotionGeometryRefresh();
                    resizeDynamicBackgroundRenderer();
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
                    stopDynamicBackgroundRenderer('document-hidden');
                    return;
                }

                if (
                    state.lyrics
                    && isLyricsPage()
                    && !lyricVisualDomHealthy()
                ) {
                    queueDecoration();
                }

                resetPlaybackClock(
                    getLocalMediaElement(true),
                    performance.now()
                );
                wakeAnimationLoop();
                if (state.atmosphereMode === 'dynamic') startDynamicBackgroundRenderer();
            },
            { passive: true }
        );

        window.addEventListener(
            'pagehide',
            () => {
                cancelDecorationRetry(true);
                invalidateAtmosphereLoads('pagehide');
                clearDynamicProbeTimers();
                state.atmosphereDynamicProbeToken += 1;
                stopAnimationLoop('pagehide');
                stopDynamicBackgroundRenderer('pagehide');
            },
            { passive: true }
        );

        window.addEventListener(
            'pageshow',
            () => {
                if (state.lyrics && isLyricsPage()) {
                    queueDecoration();
                    wakeAnimationLoop();
                    if (state.atmosphereMode === 'dynamic') startDynamicBackgroundRenderer();
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
    state.atmosphereMode = readAtmosphereMode();

    state.performanceMode =
        readPerformanceMode();


    state.performanceProfile =
        detectPerformanceProfile();

    installFetchInterceptor();
    installXhrInterceptor();
    installLyricSeekInteractionHooks();
    installLyricAutoFollowHooks();
    installDomObserver();
    installRouteHooks();
    installFontGeometryHooks();
    installReducedMotionHook();
    installLyricVisualWatchdog();

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
            } else if (source === 'whole-joining-or-profile') {
                geometry.wholeScriptWords += 1;
            } else if (source.indexOf('whole-') === 0) {
                geometry.wholeFallbackWords += 1;
            }
        });

        const reducedMotionRequested =
            prefersReducedMotion();

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
                'per-grapheme-with-measured-fallback',
            contextualScriptMotion:
                'grapheme-safe-akshara-bloom+whole-joining-fallback',
            rtlSwipeDirection:
                'per-word-natural-reading-direction',
            cueTokenization:
                'source-preserved-for-cjk-thai-lao-khmer-myanmar',
            atmosphere:
                'kawarp-webgl:128px-preblur:domain-warp:260ms-godmode-transition',
            reducedMotionRequested,
            reducedMotionApplied:
                reducedMotionRequested,
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
                    accent.secondaryRgb,
                tertiaryRgb:
                    accent.tertiaryRgb
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
                correctedClickSeek: true,
                autoFollow: {
                    suspendedUntil: state.lyricAutoFollowSuspendedUntil,
                    lastIndex: state.lyricAutoFollowLastIndex,
                    lastAt: state.lyricAutoFollowLastAt,
                    scrollCount: state.lyricAutoFollowScrollCount,
                    manualScrollCount: state.lyricAutoFollowManualScrollCount,
                    forceCount: state.lyricAutoFollowForceCount,
                    lastReason: state.lyricAutoFollowLastReason,
                    stockFollowerSuppressed:
                        state.lyricStockAutoFollowSuppressCount > 0,
                    stockSuppressCount:
                        state.lyricStockAutoFollowSuppressCount,
                    stockSuppressReason:
                        state.lyricStockAutoFollowLastReason
                },
                seekCount: state.lyricSeekCount,
                lastSeekKind: state.lastLyricSeekKind,
                timelineFingerprint: timingTimelineFingerprint(),
                songKey: state.songPreferenceKey
            };
        },
        backgroundVocals: inspectBackgroundVocals,
        instrumentalBreaks: inspectInstrumentalBreaks,
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
                    'multiscript-grapheme+whole-shaped',
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
                animationLoopErrors:
                    state.animationLoopErrors,
                animationLoopRecoveries:
                    state.animationLoopRecoveries,
                animationWatchdogRecoveries:
                    state.animationWatchdogRecoveries,
                lastAnimationLoopError:
                    state.lastAnimationLoopError,
                mediaSwitchCount:
                    state.mediaSwitchCount,
                staleMediaEventDrops:
                    state.staleMediaEventDrops
            };
        },
        setAtmosphere: setAtmosphereMode,
        atmosphere() {
            return {
                mode: 'dynamic',
                artwork: state.atmosphereArtwork,
                source: state.atmosphereSource,
                pendingKey: state.atmospherePendingKey,
                pendingMs: state.atmospherePendingSince > 0
                    ? Number(Math.max(0, performance.now() - state.atmospherePendingSince).toFixed(1))
                    : 0,
                timeoutCount: state.atmosphereTimeoutCount,
                analysis: state.atmosphereAnalysis,
                dynamicBackground: {
                    reference: DYNAMIC_BACKGROUND_SOURCE,
                    engine: DYNAMIC_BACKGROUND_ENGINE,
                    webglAvailable: state.atmosphereDynamicWebglAvailable,
                    fallbackReason: state.atmosphereDynamicFallbackReason,
                    currentArtwork: state.atmosphereDynamicCurrentArtwork,
                    identityMethod: state.atmosphereDynamicIdentityMethod,
                    fingerprint: state.atmosphereDynamicCurrentFingerprint ? state.atmosphereDynamicCurrentFingerprint.hash : null,
                    visualDedupCount: state.atmosphereDynamicVisualDedupCount,
                    fingerprintFailures: state.atmosphereDynamicFingerprintFailures,
                    staleCommitDrops: state.atmosphereDynamicStaleCommitDrops,
                    directLoadFailures: state.atmosphereDynamicDirectLoadFailures,
                    domFallbackCommits: state.atmosphereDynamicDomFallbackCommits,
                    weakSource: state.atmosphereDynamicWeakSource,
                    noArtwork: state.atmosphereDynamicNoArtwork,
                    resolvedMediaKey: state.atmosphereDynamicResolvedKey,
                    unboundDomConfirmMs: DYNAMIC_BACKGROUND_UNBOUND_DOM_CONFIRM_MS,
                    inheritedDomStableMs: DYNAMIC_BACKGROUND_INHERITED_DOM_STABLE_MS,
                    inheritedDomConfirmMs: DYNAMIC_BACKGROUND_INHERITED_DOM_CONFIRM_MS,
                    directGraceMs: DYNAMIC_BACKGROUND_DIRECT_GRACE_MS,
                    directLoadTimeoutMs: DYNAMIC_BACKGROUND_DIRECT_LOAD_TIMEOUT_MS,
                    fastInheritedCommits: state.atmosphereDynamicFastInheritedCommits,
                    noArtConfirmMs: DYNAMIC_BACKGROUND_NO_ART_CONFIRM_MS,
                    noArtRetryMs: DYNAMIC_BACKGROUND_NO_ART_RETRY_MS,
                    webglFailureCount: state.atmosphereDynamicWebglFailureCount,
                    webglRetryInMs: Math.max(0, state.atmosphereDynamicWebglRetryAt - performance.now()),
                    transitionMs: DYNAMIC_BACKGROUND_TRANSITION_MS,
                    contextLossCount: state.atmosphereDynamicContextLossCount,
                    transitionCount: state.atmosphereDynamicTransitionCount,
                    interruptedTransitions: state.atmosphereDynamicInterruptedTransitions,
                    resizeCount: state.atmosphereDynamicResizeCount,
                    renderer: state.atmosphereDynamicRenderer ? state.atmosphereDynamicRenderer.diagnostics() : null,
                    audioResponsive: false,
                    lyricReactive: false
                }
            };
        },
        refreshAtmosphere() {
            const media = getLocalMediaElement(true);
            if (media) refreshAtmosphere(media, true);
            return { requested: !!media };
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
                animationLoopErrors:
                    state.animationLoopErrors,
                animationLoopRecoveries:
                    state.animationLoopRecoveries,
                animationWatchdogRecoveries:
                    state.animationWatchdogRecoveries,
                lastAnimationLoopError:
                    state.lastAnimationLoopError,
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
                correctedLyricClickSeek: true,
                instrumentalClickSeek: true,
                lyricSeekCount: state.lyricSeekCount,
                instrumentalSeekCount: state.instrumentalSeekCount,
                lastLyricSeekKind: state.lastLyricSeekKind,
                lastLyricSeekSourceSeconds:
                    Number.isFinite(state.lastLyricSeekSourceTicks)
                        ? Number(
                            (
                                state.lastLyricSeekSourceTicks
                                / TICKS_PER_SECOND
                            ).toFixed(3)
                        )
                        : null,
                lastLyricSeekMediaSeconds:
                    Number.isFinite(state.lastLyricSeekMediaSeconds)
                        ? Number(
                            state.lastLyricSeekMediaSeconds.toFixed(3)
                        )
                        : null,
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
                    'ascii-elrc-role-token+legacy-marker',
                backgroundVocalLayout:
                    'left-aligned+closest-lead-before-or-after',
                backgroundVocalInspection:
                    inspectBackgroundVocals(),
                instrumentalBreaks:
                    inspectInstrumentalBreaks(),
                crossPlatformQuality:
                    'pc-mobile-multilingual-preview4-renderer',
                platformVisualOverrides: 'none',
                tvPolicy:
                    'stock-jellyfin-bootstrap-bypass',
                rendererFingerprint:
                    rendererFingerprint(),
                effectModel: 'phase-locked-motion+classic-bloom-v3.2+dynamic-background-godmode-v3.2.5+instrumental-wave',
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
                accentTertiaryRgb:
                    state.accent
                    && state.accent.tertiaryRgb,
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
                animationLoopRunning:
                    state.animationLoopRunning,
                animationLoopErrors:
                    state.animationLoopErrors,
                animationLoopRecoveries:
                    state.animationLoopRecoveries,
                animationWatchdogRecoveries:
                    state.animationWatchdogRecoveries,
                lastAnimationLoopError:
                    state.lastAnimationLoopError,
                lyricVisualWatchdogMs:
                    LYRIC_VISUAL_WATCHDOG_MS,
                lyricFrameRecoveryMs:
                    LYRIC_FRAME_RECOVERY_MS,
                instrumentalSvg:
                    'single-path-liquid-clip-v2',
                lineTransitionCount:
                    state.lineTransitionCount,
                lastLineSyncCount:
                    state.lastLineSyncCount,
                maxLineSyncCount:
                    state.maxLineSyncCount,
                activeLineOnlyRendering: false,
                activeSetOnlyRendering: true,
                staticLinesUpdateOnlyOnLineChange: true,
                normalLrcTargetFps: LRC_TARGET_FPS,
                pausedTargetFps: PAUSED_TARGET_FPS,
                adaptiveAlbumAtmosphere: true,
                atmosphereMode: 'dynamic-only',
                atmosphereArtwork: state.atmosphereArtwork,
                atmosphereSource: state.atmosphereSource,
                atmospherePendingKey: state.atmospherePendingKey,
                atmospherePendingMs: state.atmospherePendingSince > 0
                    ? Number(Math.max(0, performance.now() - state.atmospherePendingSince).toFixed(1))
                    : 0,
                atmosphereTimeoutCount: state.atmosphereTimeoutCount,
                atmosphereDynamicPort: 'chengggit-dynamic-background+kawarp-hardened+godmode-state-machine',
                atmosphereDynamicSource: DYNAMIC_BACKGROUND_SOURCE,
                atmosphereDynamicEngine: DYNAMIC_BACKGROUND_ENGINE,
                atmosphereDynamicTransitionMs: DYNAMIC_BACKGROUND_TRANSITION_MS,
                atmosphereColorExtraction: 'none-direct-artwork-texture',
                atmosphereVisualIdentity: '24x24-rgb+edge-perceptual-fingerprint',
                atmosphereSameAlbumContinuity: true,
                atmosphereLyricLifecycleIndependent: true,
                atmosphereLatestMediaCommitOnly: true,
                atmosphereDomFallbackStabilityDelayMs: DYNAMIC_BACKGROUND_DOM_STABLE_MS,
                atmosphereUnboundDomConfirmMs: DYNAMIC_BACKGROUND_UNBOUND_DOM_CONFIRM_MS,
                atmosphereInheritedDomStableMs: DYNAMIC_BACKGROUND_INHERITED_DOM_STABLE_MS,
                atmosphereInheritedDomConfirmMs: DYNAMIC_BACKGROUND_INHERITED_DOM_CONFIRM_MS,
                atmosphereDirectGraceMs: DYNAMIC_BACKGROUND_DIRECT_GRACE_MS,
                atmosphereDirectLoadTimeoutMs: DYNAMIC_BACKGROUND_DIRECT_LOAD_TIMEOUT_MS,
                atmosphereFastInheritedCommits: state.atmosphereDynamicFastInheritedCommits,
                atmosphereWeakRecheckMs: DYNAMIC_BACKGROUND_WEAK_RECHECK_MS,
                atmosphereNoArtConfirmMs: DYNAMIC_BACKGROUND_NO_ART_CONFIRM_MS,
                atmosphereNoArtRetryMs: DYNAMIC_BACKGROUND_NO_ART_RETRY_MS,
                atmosphereNoArtwork: state.atmosphereDynamicNoArtwork,
                atmosphereWebglFailureCount: state.atmosphereDynamicWebglFailureCount,
                atmosphereWebglRetryInMs: Math.max(0, state.atmosphereDynamicWebglRetryAt - performance.now()),
                atmosphereAudioCoupled: false,
                atmosphereLyricReactive: false,
                atmosphereLiveCssBlur: false,
                atmospherePrebakedBlur: true,
                atmosphereStaleCommitDrops: state.atmosphereDynamicStaleCommitDrops,
                atmosphereVisualDedupCount: state.atmosphereDynamicVisualDedupCount,
                atmosphereFingerprintFailures: state.atmosphereDynamicFingerprintFailures,
                atmosphereDirectLoadFailures: state.atmosphereDynamicDirectLoadFailures,
                atmosphereDomFallbackCommits: state.atmosphereDynamicDomFallbackCommits,
                atmosphereCrossfadeMs: DYNAMIC_BACKGROUND_TRANSITION_MS,
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
