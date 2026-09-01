"""Regression coverage for TTML/QRC metadata preservation."""

from __future__ import annotations

import importlib.util
import sys
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "ttml_qrc_to_elrc.py"
SPEC = importlib.util.spec_from_file_location("ttml_qrc_to_elrc", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
CONVERTER = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = CONVERTER
SPEC.loader.exec_module(CONVERTER)


class TtmlMetadataConversionTests(unittest.TestCase):
    def test_apple_ttml_metadata_becomes_safe_elrc_headers(self) -> None:
        root = ET.fromstring(
            """
            <tt xmlns="http://www.w3.org/ns/ttml"
                xmlns:itunes="http://music.apple.com/lyric-ttml-internal"
                xmlns:ttm="http://www.w3.org/ns/ttml#metadata"
                itunes:timing="Word" xml:lang="en">
              <head><metadata>
                <ttm:title>Example Title</ttm:title>
                <ttm:agent type="person" xml:id="lead"><ttm:name>Lead Singer</ttm:name></ttm:agent>
                <ttm:agent type="group" xml:id="choir"/>
                <iTunesMetadata leadingSilence="0.120">
                  <songwriters><songwriter>Writer One</songwriter><songwriter>Writer Two</songwriter></songwriters>
                </iTunesMetadata>
              </metadata></head>
              <body dur="0:10.000">
                <div begin="1s" end="4s" itunes:songPart="Verse" ttm:agent="lead">
                  <p begin="1s" end="2s" ttm:agent="lead"><span begin="1s" end="1.4s">Hello</span> <span begin="1.4s" end="2s">world</span></p>
                </div>
                <div begin="5s" end="8s" itunes:songPart="Chorus" ttm:agent="choir">
                  <p begin="5s" end="6s"><span begin="5s" end="5.5s">Sing</span> <span begin="5.5s" end="6s">now</span></p>
                </div>
              </body>
            </tt>
            """
        )

        result = CONVERTER.convert_tree(root)
        rendered = CONVERTER.serialize_document(result)

        self.assertIn("[ti:Example Title]", rendered)
        self.assertIn("[au:Writer One / Writer Two]", rendered)
        self.assertIn("[la:en]", rendered)
        self.assertIn("[length:00:10.000]", rendered)
        self.assertIn("[ak-leading-silence:120]", rendered)
        self.assertIn("[ak-agent-lead:person|Lead Singer]", rendered)
        self.assertIn("[ak-agent-choir:group]", rendered)
        self.assertIn("[ak-section:00:01.000-00:04.000|Verse|lead]", rendered)
        self.assertIn("[ak-section:00:05.000-00:08.000|Chorus|choir]", rendered)
        self.assertIn(
            "[00:01.000][ak:agent=lead][ak:section=Verse]"
            "<00:01.000>Hello <00:01.400>world<00:02.000>",
            rendered,
        )
        self.assertIn(
            "[00:05.000][ak:group=choir][ak:section=Chorus]"
            "<00:05.000>Sing <00:05.500>now<00:06.000>",
            rendered,
        )

    def test_metadata_never_double_applies_qrc_offset(self) -> None:
        content = """[ti:Offset Song]
[ar:Artist]
[offset:500]
[1000,1000](1000,500)One(1500,500) two
"""
        # Exercise the same metadata conversion helper without creating a
        # sidecar: the QRC parser applies offset to cues, so it must not write
        # a second [offset:] field.
        line, _ = CONVERTER.parse_qrc_timed_line(
            "[1000,1000](1000,500)One(1500,500) two",
            source_order=0,
            offset_ms=500,
        )
        self.assertIsNotNone(line)
        metadata = CONVERTER.qrc_metadata_result(
            CONVERTER.parse_qrc_metadata(content), [line]
        )
        rendered = "\n".join(
            f"[{tag.name}:{tag.value}]" for tag in CONVERTER.metadata_tags(metadata)
        )
        self.assertIn("[ti:Offset Song]", rendered)
        self.assertIn("[ar:Artist]", rendered)
        self.assertNotIn("[offset:", rendered)


class SingleWordTimingTests(unittest.TestCase):
    def test_explicitly_timed_single_ttml_word_keeps_its_sweep(self) -> None:
        line = CONVERTER.LyricLine(
            53_951,
            58_628,
            (CONVERTER.TimedText("Mitwa", 53_951, 58_628),),
            "main",
            0,
            0,
        )

        self.assertTrue(CONVERTER.line_is_word_synced(line))
        self.assertEqual(
            CONVERTER.serialize_line(line),
            "[00:53.951]<00:53.951>Mitwa<00:58.628>",
        )

    def test_single_timed_sentence_remains_line_synced(self) -> None:
        line = CONVERTER.LyricLine(
            1_000,
            3_000,
            (CONVERTER.TimedText("This is one complete line", 1_000, 3_000),),
            "main",
            0,
            0,
        )

        self.assertFalse(CONVERTER.line_is_word_synced(line))

    def test_explicitly_timed_single_qrc_word_keeps_its_sweep(self) -> None:
        line, timing_mode = CONVERTER.parse_qrc_timed_line(
            "[53951,4677](53951,4677)Mitwa",
            source_order=0,
            offset_ms=0,
        )

        self.assertEqual(timing_mode, "absolute")
        self.assertIsNotNone(line)
        assert line is not None
        self.assertTrue(CONVERTER.line_is_word_synced(line))
        self.assertEqual(
            CONVERTER.serialize_line(line),
            "[00:53.951]<00:53.951>Mitwa<00:58.628>",
        )


if __name__ == "__main__":
    unittest.main()
