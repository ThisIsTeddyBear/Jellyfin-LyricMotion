import unittest
import xml.etree.ElementTree as ET
from decimal import Decimal
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import mock

import ttml_to_elrc as converter


SAMPLE_TTML = """\
<tt xmlns="http://www.w3.org/ns/ttml"
    xmlns:ttm="http://www.w3.org/ns/ttml#metadata">
  <body>
    <div>
      <p begin="44.196" end="48.019">
        <span begin="44.238" end="44.729">Everybody,</span>
        <span begin="44.729" end="44.970"> put</span>
        <span ttm:role="x-bg">
          <span begin="44.196" end="44.627">(Bra</span><span begin="44.627" end="45.603">zil)</span>
        </span>
      </p>
    </div>
  </body>
</tt>
"""


class TimeParsingTests(unittest.TestCase):
    def test_clock_and_offset_forms(self):
        self.assertEqual(converter.parse_ttml_time("1:02.345"), 62_345)
        self.assertEqual(converter.parse_ttml_time("00:01:02.345"), 62_345)
        self.assertEqual(converter.parse_ttml_time("1500ms"), 1_500)
        self.assertEqual(converter.parse_ttml_time("1.5s"), 1_500)
        self.assertEqual(
            converter.parse_ttml_time("15f", frame_rate=Decimal(30)), 500
        )

    def test_elrc_clock_supports_long_tracks(self):
        self.assertEqual(converter.elrc_time(6_123_004), "102:03.004")

    def test_negative_offset_times_are_rejected(self):
        with self.assertRaises(converter.ConversionError):
            converter.parse_ttml_time("-250ms")

    def test_non_finite_timing_rates_are_rejected(self):
        with self.assertRaises(converter.ConversionError):
            converter.parse_rate("Infinity", Decimal(30))
        with self.assertRaises(converter.ConversionError):
            converter.apply_frame_rate_multiplier(
                Decimal(30), "Infinity 1"
            )

    def test_non_finite_and_malformed_clock_times_are_rejected(self):
        for value in ("NaN", "Infinity", "00:60:00", "00:00:60", "00:00:00:30"):
            with self.subTest(value=value):
                with self.assertRaises(converter.ConversionError):
                    converter.parse_ttml_time(value, frame_rate=Decimal(30))

    def test_explicit_end_and_duration_use_earlier_end(self):
        element = ET.fromstring('<span begin="1s" end="10s" dur="2s"/>')
        self.assertEqual(
            converter.timing_for(
                element, None, None, frame_rate=Decimal(30), tick_rate=Decimal(1)
            ),
            (1000, 3000),
        )

    def test_frame_rate_multiplier_is_applied(self):
        root = ET.fromstring(
            '''
            <tt xmlns="http://www.w3.org/ns/ttml"
                xmlns:ttp="http://www.w3.org/ns/ttml#parameter"
                ttp:frameRate="30"
                ttp:frameRateMultiplier="1000 1001">
              <body><div><p begin="30f" end="60f">Frame timed</p></div></body>
            </tt>
            '''
        )
        line = converter.convert_tree(root).lines[0]
        self.assertEqual(line.start_ms, 1001)
        self.assertEqual(line.end_ms, 2002)


class RecursiveConversionTests(unittest.TestCase):
    def setUp(self):
        self.root = ET.fromstring(SAMPLE_TTML)

    def test_background_is_a_separate_fully_timed_line(self):
        result = converter.convert_tree(self.root)
        self.assertEqual(result.paragraph_count, 1)
        self.assertEqual(result.background_line_count, 1)
        self.assertEqual(len(result.lines), 2)

        background, main = result.lines
        self.assertEqual(background.kind, "background")
        self.assertEqual(background.text, "(Brazil)")
        self.assertEqual(
            converter.serialize_line(background),
            "[00:44.196]"
            + converter.BACKGROUND_SENTINEL
            + "<00:44.196>(Bra<00:44.627>zil)<00:45.603>",
        )
        self.assertEqual(
            converter.serialize_line(background, mark_background=False),
            "[00:44.196]<00:44.196>(Bra<00:44.627>zil)<00:45.603>",
        )

        self.assertEqual(main.kind, "main")
        self.assertEqual(main.text, "Everybody, put")
        self.assertNotIn("Brazil", converter.serialize_line(main))
        self.assertEqual(
            converter.serialize_line(main),
            "[00:44.196]<00:44.238>Everybody, <00:44.729>put<00:48.019>",
        )

    def test_background_can_be_omitted_explicitly(self):
        result = converter.convert_tree(self.root, include_background=False)
        self.assertEqual(result.background_line_count, 0)
        self.assertEqual(len(result.lines), 1)
        self.assertEqual(result.lines[0].text, "Everybody, put")


    def test_auxiliary_romanization_and_translation_are_not_flattened(self):
        root = ET.fromstring(
            r'''
            <tt xmlns="http://www.w3.org/ns/ttml"
                xmlns:ttm="http://www.w3.org/ns/ttml#metadata">
              <body><div><p begin="1s" end="3s">
                <span begin="1s" end="2s">नमस्ते</span>
                <span ttm:role="x-roman">namaste</span>
                <span ttm:role="x-translation">hello</span>
              </p></div></body>
            </tt>
            '''
        )
        line = converter.convert_tree(root).lines[0]
        self.assertEqual(line.text, "नमस्ते")
        rendered = converter.serialize_line(line)
        self.assertNotIn("namaste", rendered)
        self.assertNotIn("hello", rendered)

    def test_nested_untimed_text_inherits_container_timing(self):
        root = ET.fromstring(
            """
            <tt xmlns="http://www.w3.org/ns/ttml">
              <body><div><p begin="5s" dur="2s"><span>Hello</span> world</p></div></body>
            </tt>
            """
        )
        line = converter.convert_tree(root).lines[0]
        self.assertEqual(line.text, "Hello world")
        self.assertEqual(
            converter.serialize_line(line),
            "[00:05.000]<00:05.000>Hello world<00:07.000>",
        )


class FileSafetyTests(unittest.TestCase):
    def test_converter_refuses_to_overwrite_source_file(self):
        with TemporaryDirectory() as directory:
            source = Path(directory) / "song.ttml"
            source.write_text(SAMPLE_TTML, encoding="utf-8")

            with self.assertRaises(converter.ConversionError):
                converter.convert_file(source, source)

            self.assertIn("<tt", source.read_text(encoding="utf-8"))

    def test_write_errors_are_reported_as_conversion_errors(self):
        with TemporaryDirectory() as directory:
            source = Path(directory) / "song.ttml"
            source.write_text(SAMPLE_TTML, encoding="utf-8")
            missing_parent = Path(directory) / "missing" / "song.elrc"

            with self.assertRaises(converter.ConversionError):
                converter.convert_file(source, missing_parent)

    def test_dtd_and_entity_declarations_are_rejected(self):
        with TemporaryDirectory() as directory:
            source = Path(directory) / "entity.ttml"
            source.write_text(
                '<?xml version="1.0"?><!DOCTYPE tt [<!ENTITY x "boom">]>'
                '<tt xmlns="http://www.w3.org/ns/ttml"><body><div>'
                '<p begin="1s" end="2s">&x;</p></div></body></tt>',
                encoding="utf-8",
            )
            with self.assertRaises(converter.ConversionError):
                converter.convert_file(source)

    def test_oversized_input_is_rejected_before_xml_parse(self):
        with TemporaryDirectory() as directory:
            source = Path(directory) / "huge.ttml"
            with mock.patch.object(Path, "stat") as stat_mock:
                stat_mock.return_value.st_size = converter.MAX_TTML_BYTES + 1
                with self.assertRaises(converter.ConversionError):
                    converter.convert_file(source)

    def test_failed_atomic_replace_preserves_existing_output(self):
        with TemporaryDirectory() as directory:
            source = Path(directory) / "song.ttml"
            output = Path(directory) / "song.elrc"
            source.write_text(SAMPLE_TTML, encoding="utf-8")
            output.write_text("existing\n", encoding="utf-8")

            with mock.patch.object(
                Path, "replace", side_effect=OSError("simulated replace failure")
            ):
                with self.assertRaises(converter.ConversionError):
                    converter.convert_file(source, output)

            self.assertEqual(output.read_text(encoding="utf-8"), "existing\n")
            self.assertEqual(list(Path(directory).glob(".song.elrc.*.tmp")), [])



if __name__ == "__main__":
    unittest.main()
