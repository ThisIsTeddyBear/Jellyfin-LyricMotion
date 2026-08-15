#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import tempfile
import unittest
import sys
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts" / "ttml_to_elrc.py"
spec = importlib.util.spec_from_file_location("ttml_to_elrc", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
sys.modules[spec.name] = module
spec.loader.exec_module(module)


class TtmlConverterTests(unittest.TestCase):
    def test_time_parsing_frames_ticks_and_offsets(self):
        self.assertEqual(module.parse_ttml_time("1.25s"), 1250)
        self.assertEqual(module.parse_ttml_time("500ms"), 500)
        self.assertEqual(module.parse_ttml_time("15f", frame_rate=module.Decimal(30)), 500)
        self.assertEqual(module.parse_ttml_time("10t", tick_rate=module.Decimal(20)), 500)
        self.assertEqual(module.parse_ttml_time("00:01:02.500"), 62500)

    def test_nested_absolute_timing_and_auxiliary_roles(self):
        xml = f'''<tt xmlns="{module.TTML_NS}" xmlns:ttm="{module.TTM_NS}">
          <body><div><p begin="10s" end="14s">
            <span begin="10s" end="11s">Hello </span>
            <span begin="11s" end="12s">world</span>
            <span ttm:role="x-roman" begin="10s" end="12s">ignored roman</span>
            <span ttm:role="x-bg" begin="12s" end="13s">(backing)</span>
          </p></div></body>
        </tt>'''
        result = module.convert_tree(ET.fromstring(xml))
        self.assertEqual(result.paragraph_count, 1)
        self.assertEqual(result.background_line_count, 1)
        self.assertEqual(len(result.lines), 2)
        self.assertEqual(result.lines[0].kind, "main")
        self.assertEqual(result.lines[0].text, "Hello world")
        self.assertNotIn("ignored roman", result.lines[0].text)
        self.assertEqual(result.lines[1].kind, "background")
        self.assertEqual(result.lines[1].text, "(backing)")

    def test_invalid_nested_end_before_begin_is_rejected(self):
        xml = f'''<tt xmlns="{module.TTML_NS}"><body><div>
          <p begin="10s" end="20s"><span begin="15s" end="14s">bad</span></p>
        </div></body></tt>'''
        with self.assertRaises(module.ConversionError):
            module.convert_tree(ET.fromstring(xml))

    def test_dtd_entity_input_is_rejected_without_overwriting_output(self):
        payload = b'''<!DOCTYPE tt [<!ENTITY bad "boom">]><tt xmlns="http://www.w3.org/ns/ttml"><body><div><p begin="0s" end="1s">&bad;</p></div></body></tt>'''
        with tempfile.TemporaryDirectory() as temp:
            temp = Path(temp)
            source = temp / "bad.ttml"
            target = temp / "lyrics.elrc"
            source.write_bytes(payload)
            target.write_text("keep-me\n", encoding="utf-8")
            with self.assertRaises(module.ConversionError):
                module.convert_file(source, target)
            self.assertEqual(target.read_text(encoding="utf-8"), "keep-me\n")

    def test_output_is_atomic_and_background_marker_is_serialized(self):
        xml = f'''<tt xmlns="{module.TTML_NS}" xmlns:ttm="{module.TTM_NS}"><body><div>
          <p begin="1s" end="3s"><span begin="1s" end="2s">Lead</span>
          <span ttm:role="x-bg" begin="2s" end="3s">Back</span></p>
        </div></body></tt>'''
        with tempfile.TemporaryDirectory() as temp:
            temp = Path(temp)
            source = temp / "song.ttml"
            target = temp / "song.elrc"
            source.write_text(xml, encoding="utf-8")
            path, result = module.convert_file(source, target)
            self.assertEqual(path, target)
            rendered = target.read_text(encoding="utf-8")
            self.assertIn(module.BACKGROUND_SENTINEL, rendered)
            self.assertEqual(result.background_line_count, 1)
            self.assertTrue(rendered.endswith("\n"))


if __name__ == "__main__":
    unittest.main()
