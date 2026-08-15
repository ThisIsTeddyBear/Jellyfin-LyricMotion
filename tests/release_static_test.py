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


if __name__ == '__main__':
    unittest.main()
