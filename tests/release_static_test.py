#!/usr/bin/env python3
from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ReleaseStaticTests(unittest.TestCase):
    def test_versions_are_consistent(self):
        app = (ROOT/'VERSION').read_text(encoding='utf-8').strip()
        g2p = (ROOT/'LYRICG2P_VERSION').read_text(encoding='utf-8').strip()
        runtime = (ROOT/'src'/'jellyfin-lyric-motion.js').read_text(encoding='utf-8')
        romanizer = (ROOT/'src'/'jellyfin-lyric-romanizer.js').read_text(encoding='utf-8')
        self.assertIn(f"const VERSION = '{app}'", runtime)
        self.assertIn(f"const LYRICG2P_VERSION = '{g2p}'", runtime)
        self.assertIn(f"const VERSION = '{g2p}'", romanizer)

    def test_runtime_assets_have_no_nul_or_dynamic_html_execution(self):
        unsafe = re.compile(r'\b(?:eval|Function)\s*\(|\.innerHTML\s*=|insertAdjacentHTML|document\.write')
        for path in (ROOT/'src').glob('*'):
            if not path.is_file():
                continue
            payload = path.read_bytes()
            self.assertNotIn(b'\x00', payload, str(path))
            if path.suffix == '.js':
                self.assertIsNone(unsafe.search(payload.decode('utf-8')), str(path))

    def test_css_structure_balances_blocks_comments_and_strings(self):
        text = (ROOT/'src'/'jellyfin-lyric-motion.css').read_text(encoding='utf-8')
        depth = 0
        index = 0
        quote = None
        comment = False
        while index < len(text):
            if comment:
                if text.startswith('*/', index):
                    comment = False
                    index += 2
                else:
                    index += 1
                continue
            if quote:
                if text[index] == '\\':
                    index += 2
                    continue
                if text[index] == quote:
                    quote = None
                index += 1
                continue
            if text.startswith('/*', index):
                comment = True
                index += 2
                continue
            if text[index] in "'\"":
                quote = text[index]
            elif text[index] == '{':
                depth += 1
            elif text[index] == '}':
                depth -= 1
                self.assertGreaterEqual(depth, 0, 'CSS closes more blocks than it opens')
            index += 1
        self.assertFalse(comment, 'unterminated CSS comment')
        self.assertIsNone(quote, 'unterminated CSS string')
        self.assertEqual(depth, 0, 'unbalanced CSS braces')

    def test_instrumental_break_contract_is_index_safe_and_time_clipped(self):
        runtime = (ROOT/'src'/'jellyfin-lyric-motion.js').read_text(encoding='utf-8')
        css = (ROOT/'src'/'jellyfin-lyric-motion.css').read_text(encoding='utf-8')

        self.assertIn('const INSTRUMENTAL_GAP_MIN_TICKS = 2 * TICKS_PER_SECOND;', runtime)
        self.assertNotIn("row.className = 'lyricsLine", runtime)
        self.assertIn('instrumentalGapProgress(gap, ticks)', runtime)
        self.assertIn('.ak-instrumental-note-svg', css)
        self.assertIn('.ak-instrumental-note-liquid', css)
        self.assertIn('.ak-instrumental-note-surface', css)
        self.assertIn("row.className = 'ak-instrumental-gap-line ak-future';", runtime)
        self.assertIn('fillClipElement', runtime)
        self.assertIn('instrumentalWaveGeometry', runtime)
        self.assertIn('INSTRUMENTAL_WAVE_PERIOD_SECONDS', runtime)
        self.assertIn("const fillWave = createSvgElement('path'", runtime)
        self.assertNotIn("const fillRect = createSvgElement('rect'", runtime)
        self.assertNotIn('clip-path: inset(var(--ak-instrumental-unfilled)', css)
        self.assertIn("note.setAttribute('role', 'button')", runtime)
        self.assertIn("note.setAttribute('tabindex', '0')", runtime)
        self.assertIn('instrumentalSourceTicksForTarget', runtime)
        self.assertIn('mediaSeekSecondsForTimelineTicks', runtime)
        self.assertIn('pointer-events: auto;', css)
        self.assertIn('.ak-instrumental-note:focus-visible', css)


    def test_classic_bloom_palette_is_not_shadowed_by_container_fallback(self):
        runtime = (ROOT/'src'/'jellyfin-lyric-motion.js').read_text(encoding='utf-8')
        css = (ROOT/'src'/'jellyfin-lyric-motion.css').read_text(encoding='utf-8')

        container_block_match = re.search(
            r'\.lyricPage \.lyricsContainer\.ak-karaoke-container\s*\{(?P<body>.*?)\}',
            css,
            re.S,
        )
        self.assertIsNotNone(container_block_match)
        container_block = container_block_match.group('body')
        self.assertNotIn('--ak-glow-primary-rgb:', container_block)
        self.assertNotIn('--ak-glow-secondary-rgb:', container_block)
        self.assertNotIn('--ak-glow-tertiary-rgb:', container_block)

        self.assertIn("'--ak-glow-primary-rgb'", runtime)
        self.assertIn("'--ak-glow-secondary-rgb'", runtime)
        self.assertIn("'--ak-glow-tertiary-rgb'", runtime)
        self.assertIn('const container =\n            getCurrentLyricsContainer(false);', runtime)
        self.assertIn('accent.tertiaryRgb', runtime)
        self.assertIn('rgba(var(--ak-glow-tertiary-rgb)', css)

    def test_benchmark_product_version_comes_from_version_file(self):
        benchmark = (ROOT/'scripts'/'benchmark-lyricg2p651.js').read_text(encoding='utf-8')
        self.assertIn("const productVersion = fs.readFileSync", benchmark)
        self.assertIn("product: `Jellyfin LyricMotion ${productVersion}`", benchmark)
        self.assertNotIn("product: 'Jellyfin LyricMotion 3.2.", benchmark)

    def test_current_public_markdown_links_and_command_paths_resolve(self):
        markdown_files = [
            ROOT/'README.md',
            ROOT/'CONTRIBUTING.md',
            ROOT/'docs'/'TIMING-OFFSET.md',
            ROOT/'docs'/'INSTRUMENTAL-BREAKS.md',
            ROOT/'docs'/'DYNAMIC-BACKGROUND-3.2.5.md',
            ROOT/'docs'/'ROMANIZATION.md',
            ROOT/'docs'/'TV-STOCK-BYPASS.md',
        ]
        link_re = re.compile(r'\[[^\]]+\]\(([^)]+)\)')
        command_path_re = re.compile(r'\b((?:scripts|tests)/[A-Za-z0-9_.\-/]+)')

        for path in markdown_files:
            text = path.read_text(encoding='utf-8')
            for link in link_re.findall(text):
                if link.startswith(('http://', 'https://', '#', 'mailto:')):
                    continue
                target = link.split('#', 1)[0]
                if not target:
                    continue
                resolved = (path.parent / target).resolve()
                self.assertTrue(resolved.exists(), f'{path}: broken local link {link}')

            if path.name in {'README.md', 'CONTRIBUTING.md'}:
                for command_path in command_path_re.findall(text):
                    self.assertTrue(
                        (ROOT / command_path).exists(),
                        f'{path}: references missing shipped command {command_path}'
                    )

    def test_windows_test_wrapper_runs_canonical_release_gate(self):
        wrapper = (ROOT/'scripts'/'test-all.ps1').read_text(encoding='utf-8')
        self.assertIn('Git\\bin\\bash.exe', wrapper)
        self.assertIn("& $Bash './scripts/test-all.sh'", wrapper)
        self.assertIn('$LASTEXITCODE', wrapper)

    def test_runtime_hardening_contracts_are_present(self):
        runtime = (ROOT/'src'/'jellyfin-lyric-motion.js').read_text(encoding='utf-8')

        self.assertEqual(runtime.count('function getJellyfinActiveLineIndex()'), 1)
        self.assertNotIn('lyricsRequestUrl:', runtime)
        self.assertNotIn('state.lyricsRequestUrl', runtime)
        self.assertIn('function lyricsResponseDisposition(status)', runtime)
        self.assertGreaterEqual(runtime.count('lyricsResponseDisposition('), 3)
        self.assertIn("if (disposition !== 'json') return;", runtime)
        self.assertIn("atmosphereMode: 'dynamic'", runtime)
        self.assertIn('Dynamic Background is the only atmosphere engine in God Mode', runtime)

    def test_all_5_classic_bloom_palettes_and_complete_public_color_metadata_ship(self):
        runtime = (ROOT/'src'/'jellyfin-lyric-motion.js').read_text(encoding='utf-8')
        palette_block = runtime.split('const PREMIUM_ACCENTS = Object.freeze([', 1)[1].split(']);', 1)[0]
        palette_ids = re.findall(r"\{\s*id:\s*'([^']+)'", palette_block)
        self.assertEqual(len(palette_ids), 5)
        self.assertEqual(len(set(palette_ids)), 5)
        self.assertEqual(palette_block.count('tertiaryRgb:'), 5)

        reroll_block = runtime.split('function rerollAccent()', 1)[1].split('function currentAccent()', 1)[0]
        self.assertIn('primaryRgb: state.accent.rgb', reroll_block)
        self.assertIn('state.accent.secondaryRgb', reroll_block)
        self.assertIn('state.accent.tertiaryRgb', reroll_block)

    def test_installers_have_cross_asset_rollback_transactions(self):
        posix = (ROOT/'scripts'/'install.sh').read_text(encoding='utf-8')
        powershell = (ROOT/'scripts'/'install.ps1').read_text(encoding='utf-8')

        self.assertIn('stage_existing_backup()', posix)
        self.assertIn('restore_live_asset()', posix)
        self.assertIn('Installation commit failed; restoring the previous LyricMotion assets.', posix)
        self.assertIn('INDEX_TEMP=$(stage_copy "$INDEX" "$INDEX")', posix)
        self.assertIn('COMMITTING=1', posix)

        self.assertIn('function New-RollbackEntry', powershell)
        self.assertIn('function Restore-RollbackEntries', powershell)
        self.assertIn('Restore-RollbackEntries $RollbackEntries', powershell)
        self.assertIn('Copy-Item -LiteralPath $BackupPath -Destination $IndexPath -Force', powershell)

    def test_known_hot_css_selectors_have_single_authoritative_top_level_blocks(self):
        css = (ROOT/'src'/'jellyfin-lyric-motion.css').read_text(encoding='utf-8')
        for selector in (
            '.lyricPage .lyricsContainer.ak-karaoke-container',
        ):
            pattern = re.compile(r'^' + re.escape(selector) + r'\s*\{', re.M)
            self.assertEqual(len(pattern.findall(css)), 1, selector)

    def test_v325_dynamic_godmode_contracts_ship(self):
        runtime = (ROOT/'src'/'jellyfin-lyric-motion.js').read_text(encoding='utf-8')
        css = (ROOT/'src'/'jellyfin-lyric-motion.css').read_text(encoding='utf-8')
        runtime_test = (ROOT/'tests'/'runtime-core.test.js').read_text(encoding='utf-8')

        # One atmosphere engine only. Legacy atmosphere renderers/settings must
        # not survive as dormant branches that can blank or race the Dynamic UI.
        self.assertIn("atmosphereMode: 'dynamic'", runtime)
        self.assertIn('class DynamicBackgroundRenderer', runtime)
        self.assertIn("const DYNAMIC_BACKGROUND_TRANSITION_MS = 260", runtime)
        self.assertNotIn("DYNAMIC_BACKGROUND_BASE_TRANSITION_MS", runtime)
        self.assertIn("const DYNAMIC_BACKGROUND_ENGINE = 'kawarp-domain-warp-hardened'", runtime)
        self.assertIn('dynamicArtworkFingerprintFromPixels', runtime)
        self.assertIn('dynamicArtworkFingerprintsEquivalent', runtime)
        self.assertIn('dynamicRequestStillCurrent', runtime)
        self.assertIn('scheduleDynamicBackgroundProbeBurst', runtime)
        self.assertIn('atmosphereDynamicResolvedKey', runtime)
        self.assertIn('DYNAMIC_BACKGROUND_UNBOUND_DOM_CONFIRM_MS = 1500', runtime)
        self.assertIn('DYNAMIC_BACKGROUND_INHERITED_DOM_STABLE_MS = 0', runtime)
        self.assertIn('DYNAMIC_BACKGROUND_INHERITED_DOM_CONFIRM_MS = 0', runtime)
        self.assertIn('DYNAMIC_BACKGROUND_DIRECT_GRACE_MS = 700', runtime)
        self.assertIn('DYNAMIC_BACKGROUND_DIRECT_LOAD_TIMEOUT_MS = 900', runtime)
        self.assertIn('atmosphereDynamicDomCandidateSinceByUrl: new Map()', runtime)
        self.assertIn('conflictsCurrentItem', runtime)
        self.assertIn('DYNAMIC_BACKGROUND_NO_ART_RETRY_MS = 10000', runtime)
        self.assertIn('function lyricVisualDomHealthy()', runtime)
        self.assertIn('characterData: true', runtime)
        self.assertIn('mutation.removedNodes', runtime)
        self.assertIn("attributeFilter: ['src', 'srcset']", runtime)
        self.assertIn("refreshAtmosphere(media, true).catch(error =>", runtime)
        self.assertIn('loadedDomArtworkImage(candidate)', runtime)
        refresh_block = runtime[runtime.index('async function refreshAtmosphere'):]
        self.assertLess(
            refresh_block.index('const rawDomCandidates = domArtworkCandidates(media)'),
            refresh_block.index('const direct = mediaItemArtworkCandidate(media)'),
            'visible now-playing artwork must be attempted before synthetic track Primary artwork'
        )
        self.assertNotIn('remote-only-tv', runtime)
        self.assertIn("transitionFix: 'visible-dom-first+instant-inherited-art+direct-art-grace+latest-media-guard+per-url-stability+retrying-no-art+captured-interrupted-blend+visual-fingerprint-dedup'", runtime)
        self.assertIn('captureInterruptedTransition()', runtime)
        self.assertIn("gl.bindAttribLocation(program, 0, 'a_position')", runtime)
        self.assertIn("gl.bindAttribLocation(program, 1, 'a_texCoord')", runtime)
        self.assertIn('gl.checkFramebufferStatus(gl.FRAMEBUFFER)', runtime)
        self.assertIn('snoise(vec2 v)', runtime)

        for legacy in (
            'activateReferenceGlassAtmosphere',
            'atmospherePhysicsProfile',
            'fallbackAtmosphereProfile',
            'clusterAtmosphereSamples',
            'setAtmosphereAudioReactive',
            'REFERENCE_GLASS_FILTER',
            'ak-atmosphere-reference',
            'ak-atmosphere-scene',
            'ak-atmosphere-node',
            'ak-atmosphere-grain',
        ):
            self.assertNotIn(legacy, runtime + css)

        self.assertNotIn('captureStream', runtime)
        self.assertNotIn('createAnalyser', runtime)
        self.assertNotIn('getByteFrequencyData', runtime)
        self.assertNotIn('.ak-perf-eco', css)
        self.assertNotIn("state.performanceProfile !== 'eco'", runtime)
        self.assertIn('@media (prefers-reduced-motion: reduce)', css)

        # Dynamic-only DOM: two CSS recovery layers, one WebGL canvas, one
        # readability shade. No hidden old atmosphere stack.
        self.assertIn('ak-atmosphere-dynamic-canvas', css)
        self.assertIn('ak-atmosphere-dynamic-fallback', css)
        self.assertIn('ak-atmosphere-dynamic-shade', css)
        self.assertIn('filter: blur(60px) saturate(1.5) brightness(.52);', css)
        self.assertIn('transition: opacity 220ms cubic-bezier(.16,.84,.20,1);', css)
        self.assertIsNone(re.search(r'calc\([^)]*\*', css), 'CSS must not rely on unsupported calc multiplication')

        # The two reported production regressions are permanent release
        # contracts: lyric payload churn must not hide the running atmosphere,
        # and same visual artwork under track-specific URLs must not re-upload.
        self.assertIn('request-switch must not remove atmosphere-ready', runtime_test)
        self.assertIn('same album art behind a different track-specific URL must not upload/restart the shader', runtime_test)
        self.assertIn('lyric teardown must not clear current Dynamic artwork state', runtime_test)

    def test_elrc_visual_loop_and_sweep_contracts_ship(self):
        runtime = (ROOT/'src'/'jellyfin-lyric-motion.js').read_text(encoding='utf-8')
        css = (ROOT/'src'/'jellyfin-lyric-motion.css').read_text(encoding='utf-8')
        runtime_test = (ROOT/'tests'/'runtime-core.test.js').read_text(encoding='utf-8')

        self.assertIn('const LYRIC_VISUAL_WATCHDOG_MS = 700;', runtime)
        self.assertIn('const LYRIC_FRAME_RECOVERY_MS = 36;', runtime)
        self.assertIn('function installLyricVisualWatchdog()', runtime)
        self.assertIn('state.animationLoopErrors += 1;', runtime)
        self.assertIn("warn('Lyric visual frame failed; scheduling recovery:'", runtime)
        self.assertIn('animationWatchdogRecoveries', runtime)
        self.assertIn('animationLoopRecoveries', runtime)
        self.assertNotIn('ecoProfile', runtime, 'removed Eco profile must not leave runtime references behind')

        # Timed ELRC paint must remain a clipped text gradient with a visible
        # Classic Bloom core+halo driven independently from the atmosphere.
        self.assertIn('--ak-word-progress: 0%;', css)
        self.assertIn('background-clip: text;', css)
        self.assertIn('-webkit-background-clip: text;', css)
        self.assertIn('var(--ak-primary-soft)', css)
        self.assertIn('.ak-glow-core', css)
        self.assertIn('.ak-glow-halo', css)
        self.assertIn('active ELRC word should expose progressing wipe', runtime_test)
        self.assertIn('Classic Bloom core should be visible during active word', runtime_test)
        self.assertIn('Classic Bloom halo should be visible during active word', runtime_test)

    def test_instrumental_svg_hotfix_contracts_ship(self):
        runtime = (ROOT/'src'/'jellyfin-lyric-motion.js').read_text(encoding='utf-8')
        css = (ROOT/'src'/'jellyfin-lyric-motion.css').read_text(encoding='utf-8')
        runtime_test = (ROOT/'tests'/'runtime-core.test.js').read_text(encoding='utf-8')

        self.assertIn('const INSTRUMENTAL_NOTE_PATH =', runtime)
        self.assertIn("const shape = createSvgElement('path'", runtime)
        self.assertNotIn("const head = createSvgElement('ellipse'", runtime)
        self.assertNotIn("const stem = createSvgElement('rect'", runtime)
        self.assertIn('shape-rendering: geometricPrecision;', css)
        self.assertIn('fill: rgba(255, 255, 255, 0.56);', css)
        self.assertIn('instrumental note should be a single closed silhouette path', runtime_test)
        self.assertIn('liquid surface should be visible through the middle of a gap', runtime_test)


if __name__ == '__main__':
    unittest.main()
