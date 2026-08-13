import unittest
import xml.etree.ElementTree as ET
from decimal import Decimal

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


if __name__ == "__main__":
    unittest.main()
