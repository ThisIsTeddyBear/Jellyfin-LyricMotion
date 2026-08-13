#!/usr/bin/env python3
"""Convert Apple-style timed TTML lyrics to Jellyfin-compatible ELRC.

Unlike a shallow ``p/span`` converter, this converter walks nested spans and
extracts ``ttm:role="x-bg"`` content as its own timed lyric line.  This keeps
background vocals such as ``(Brazil)`` visible without appending them to the
end of the main line.

ELRC has no standard background-vocal role.  Consequently, background vocals
are represented as separate, fully timed ELRC lines.  The TTML should still be
kept as the lossless master file.
"""

from __future__ import annotations

import argparse
import re
import sys
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from pathlib import Path
from typing import Iterable, Iterator, Sequence


TTML_NS = "http://www.w3.org/ns/ttml"
TTM_NS = "http://www.w3.org/ns/ttml#metadata"
XML_NS = "http://www.w3.org/XML/1998/namespace"
NS = {"tt": TTML_NS}

ROLE_ATTRIBUTE = f"{{{TTM_NS}}}role"
SPACE_ATTRIBUTE = f"{{{XML_NS}}}space"
BACKGROUND_ROLES = {"x-bg", "background", "bg"}

# ELRC has no standard per-line role field.  This two-codepoint prefix is
# invisible in ordinary players, survives Jellyfin's LRC parser, and lets the
# LyricMotion renderer distinguish a background-vocal line from a normal one.
# It sits before the first enhanced cue, so cue text/timing remain untouched.
BACKGROUND_SENTINEL = "\u2063\u2060"

WHITESPACE_RE = re.compile(r"\s+")
OFFSET_TIME_RE = re.compile(
    r"^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(h|m|s|ms|f|t)$",
    re.IGNORECASE,
)


class ConversionError(ValueError):
    """Raised when a TTML document cannot be converted safely."""


@dataclass(frozen=True)
class TimedText:
    text: str
    begin_ms: int | None
    end_ms: int | None
    timed: bool = True


@dataclass(frozen=True)
class LyricLine:
    start_ms: int
    end_ms: int | None
    tokens: tuple[TimedText, ...]
    kind: str
    source_order: int
    lane_order: int

    @property
    def text(self) -> str:
        return normalize_line_text("".join(token.text for token in self.tokens))


@dataclass(frozen=True)
class ConversionResult:
    lines: tuple[LyricLine, ...]
    paragraph_count: int
    background_line_count: int


def local_name(tag: str) -> str:
    """Return the local part of an ElementTree expanded name."""

    return tag.rsplit("}", 1)[-1]


def parse_rate(value: str | None, default: Decimal) -> Decimal:
    if not value:
        return default
    try:
        rate = Decimal(value)
    except InvalidOperation as exc:
        raise ConversionError(f"Invalid TTML timing rate: {value!r}") from exc
    if rate <= 0:
        raise ConversionError(f"TTML timing rate must be positive: {value!r}")
    return rate


def decimal_milliseconds(seconds: Decimal) -> int:
    return int((seconds * 1000).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def parse_ttml_time(
    value: str | None,
    *,
    frame_rate: Decimal = Decimal(30),
    tick_rate: Decimal = Decimal(1),
) -> int | None:
    """Parse common TTML clock and offset time expressions into milliseconds."""

    if value is None:
        return None

    value = value.strip()
    if not value:
        return None

    offset_match = OFFSET_TIME_RE.fullmatch(value)
    if offset_match:
        amount = Decimal(offset_match.group(1))
        unit = offset_match.group(2).lower()
        if unit == "h":
            seconds = amount * 3600
        elif unit == "m":
            seconds = amount * 60
        elif unit == "s":
            seconds = amount
        elif unit == "ms":
            seconds = amount / 1000
        elif unit == "f":
            seconds = amount / frame_rate
        else:
            seconds = amount / tick_rate
        return decimal_milliseconds(seconds)

    fields = value.split(":")
    try:
        if len(fields) == 4:
            hours = Decimal(fields[0])
            minutes = Decimal(fields[1])
            seconds = Decimal(fields[2])
            frames = Decimal(fields[3])
            total = hours * 3600 + minutes * 60 + seconds + frames / frame_rate
        elif len(fields) == 3:
            hours = Decimal(fields[0])
            minutes = Decimal(fields[1])
            seconds = Decimal(fields[2])
            total = hours * 3600 + minutes * 60 + seconds
        elif len(fields) == 2:
            minutes = Decimal(fields[0])
            seconds = Decimal(fields[1])
            total = minutes * 60 + seconds
        elif len(fields) == 1:
            total = Decimal(fields[0])
        else:
            raise InvalidOperation
    except InvalidOperation as exc:
        raise ConversionError(f"Unsupported TTML time expression: {value!r}") from exc

    if total < 0:
        raise ConversionError(f"Negative TTML time is not supported: {value!r}")
    return decimal_milliseconds(total)


def elrc_time(milliseconds: int) -> str:
    """Format milliseconds as the enhanced-LRC ``MM:SS.mmm`` clock."""

    if milliseconds < 0:
        raise ConversionError("ELRC timestamps cannot be negative")
    minutes, remainder = divmod(milliseconds, 60_000)
    seconds, millis = divmod(remainder, 1000)
    return f"{minutes:02d}:{seconds:02d}.{millis:03d}"


def element_role(element: ET.Element) -> str:
    role = element.get(ROLE_ATTRIBUTE) or element.get("role") or ""
    return role.strip().lower()


def is_background(element: ET.Element) -> bool:
    roles = set(element_role(element).split())
    return bool(roles & BACKGROUND_ROLES)


def inherited_space_mode(element: ET.Element, parent_mode: str) -> str:
    return element.get(SPACE_ATTRIBUTE, parent_mode).lower()


def normalize_fragment(text: str | None, space_mode: str) -> str:
    if not text:
        return ""
    if space_mode == "preserve":
        return text.replace("\r\n", "\n").replace("\r", "\n")
    return WHITESPACE_RE.sub(" ", text)


def normalize_line_text(text: str) -> str:
    return text.strip()


def timing_for(
    element: ET.Element,
    inherited_begin: int | None,
    inherited_end: int | None,
    *,
    frame_rate: Decimal,
    tick_rate: Decimal,
) -> tuple[int | None, int | None]:
    begin = parse_ttml_time(
        element.get("begin"), frame_rate=frame_rate, tick_rate=tick_rate
    )
    end = parse_ttml_time(
        element.get("end"), frame_rate=frame_rate, tick_rate=tick_rate
    )
    duration = parse_ttml_time(
        element.get("dur"), frame_rate=frame_rate, tick_rate=tick_rate
    )

    if begin is None:
        begin = inherited_begin
    if end is None and duration is not None and begin is not None:
        end = begin + duration
    if end is None:
        end = inherited_end
    return begin, end


def walk_text(
    element: ET.Element,
    *,
    inherited_begin: int | None,
    inherited_end: int | None,
    space_mode: str,
    frame_rate: Decimal,
    tick_rate: Decimal,
    exclude_background: bool,
) -> Iterator[TimedText]:
    """Yield text fragments in document order without flattening nested timing."""

    begin, end = timing_for(
        element,
        inherited_begin,
        inherited_end,
        frame_rate=frame_rate,
        tick_rate=tick_rate,
    )
    current_space_mode = inherited_space_mode(element, space_mode)

    own_text = normalize_fragment(element.text, current_space_mode)
    if own_text:
        yield TimedText(own_text, begin, end, timed=True)

    for child in element:
        if not (exclude_background and is_background(child)):
            yield from walk_text(
                child,
                inherited_begin=begin,
                inherited_end=end,
                space_mode=current_space_mode,
                frame_rate=frame_rate,
                tick_rate=tick_rate,
                exclude_background=exclude_background,
            )

        tail = normalize_fragment(child.tail, current_space_mode)
        if tail:
            # Tails are separators belonging to the containing element.  They
            # must not create a fake cue at the paragraph's start time.
            yield TimedText(tail, None, None, timed=False)


def top_level_backgrounds(paragraph: ET.Element) -> Iterator[ET.Element]:
    """Yield background-role roots once, even if they contain nested roles."""

    def visit(element: ET.Element, inside_background: bool) -> Iterator[ET.Element]:
        for child in element:
            child_is_background = is_background(child)
            if child_is_background and not inside_background:
                yield child
            else:
                yield from visit(child, inside_background or child_is_background)

    if is_background(paragraph):
        yield paragraph
    else:
        yield from visit(paragraph, False)


def compact_tokens(tokens: Iterable[TimedText]) -> tuple[TimedText, ...]:
    """Remove empty fragments and merge adjacent fragments with equal timing."""

    compacted: list[TimedText] = []
    for token in tokens:
        if not token.text:
            continue
        if (
            compacted
            and token.timed == compacted[-1].timed
            and token.begin_ms == compacted[-1].begin_ms
            and token.end_ms == compacted[-1].end_ms
        ):
            previous = compacted[-1]
            compacted[-1] = TimedText(
                previous.text + token.text,
                previous.begin_ms,
                previous.end_ms,
                previous.timed,
            )
        else:
            compacted.append(token)

    if not compacted:
        return ()

    # Pretty-printed TTML can contribute separator whitespace both as a
    # child's tail and at the beginning of the following span.  Preserve a
    # single separator without moving or deleting the following cue.
    deduplicated: list[TimedText] = []
    for token in compacted:
        text = token.text
        if deduplicated and deduplicated[-1].text[-1:].isspace() and text[:1].isspace():
            text = text.lstrip()
        if text:
            deduplicated.append(
                TimedText(text, token.begin_ms, token.end_ms, token.timed)
            )
    compacted = deduplicated

    if not compacted:
        return ()

    # Trimming here removes formatting indentation and the separator that was
    # immediately before an excluded x-bg subtree, while retaining all real
    # inter-word spacing.
    first = compacted[0]
    last = compacted[-1]
    compacted[0] = TimedText(
        first.text.lstrip(), first.begin_ms, first.end_ms, first.timed
    )
    compacted[-1] = TimedText(
        last.text.rstrip(), last.begin_ms, last.end_ms, last.timed
    )
    return tuple(token for token in compacted if token.text)


def time_bounds(
    tokens: Sequence[TimedText],
    fallback_start: int | None,
    fallback_end: int | None,
    *,
    prefer_token_bounds: bool,
) -> tuple[int | None, int | None]:
    starts = [token.begin_ms for token in tokens if token.begin_ms is not None]
    ends = [token.end_ms for token in tokens if token.end_ms is not None]

    if prefer_token_bounds:
        start = min(starts) if starts else fallback_start
        end = max(ends) if ends else fallback_end
    else:
        start = fallback_start if fallback_start is not None else (min(starts) if starts else None)
        end = fallback_end if fallback_end is not None else (max(ends) if ends else None)
    return start, end


def make_line(
    tokens: Iterable[TimedText],
    *,
    fallback_start: int | None,
    fallback_end: int | None,
    kind: str,
    source_order: int,
    lane_order: int,
) -> LyricLine | None:
    compacted = compact_tokens(tokens)
    if not compacted or not normalize_line_text("".join(t.text for t in compacted)):
        return None

    start, end = time_bounds(
        compacted,
        fallback_start,
        fallback_end,
        prefer_token_bounds=kind == "background",
    )
    if start is None:
        return None
    if end is not None and end < start:
        raise ConversionError(
            f"{kind.title()} line ends before it starts at {elrc_time(start)}"
        )
    return LyricLine(start, end, compacted, kind, source_order, lane_order)


def convert_tree(
    root: ET.Element,
    *,
    include_background: bool = True,
) -> ConversionResult:
    frame_rate = parse_rate(
        root.get("frameRate") or root.get(f"{{{TTML_NS}#parameter}}frameRate"),
        Decimal(30),
    )
    tick_rate = parse_rate(
        root.get("tickRate") or root.get(f"{{{TTML_NS}#parameter}}tickRate"),
        Decimal(1),
    )
    root_space_mode = inherited_space_mode(root, "default")

    lines: list[LyricLine] = []
    paragraph_count = 0
    background_count = 0

    paragraphs = root.findall(".//tt:p", NS)
    if not paragraphs:
        paragraphs = [element for element in root.iter() if local_name(element.tag) == "p"]

    for source_order, paragraph in enumerate(paragraphs):
        paragraph_count += 1
        paragraph_begin, paragraph_end = timing_for(
            paragraph,
            None,
            None,
            frame_rate=frame_rate,
            tick_rate=tick_rate,
        )
        paragraph_space_mode = inherited_space_mode(paragraph, root_space_mode)

        backgrounds = list(top_level_backgrounds(paragraph))
        if include_background:
            for lane_order, background in enumerate(backgrounds):
                background_begin, background_end = timing_for(
                    background,
                    paragraph_begin,
                    paragraph_end,
                    frame_rate=frame_rate,
                    tick_rate=tick_rate,
                )
                line = make_line(
                    walk_text(
                        background,
                        inherited_begin=paragraph_begin,
                        inherited_end=paragraph_end,
                        space_mode=paragraph_space_mode,
                        frame_rate=frame_rate,
                        tick_rate=tick_rate,
                        exclude_background=False,
                    ),
                    fallback_start=background_begin,
                    fallback_end=background_end,
                    kind="background",
                    source_order=source_order,
                    lane_order=lane_order,
                )
                if line is not None:
                    lines.append(line)
                    background_count += 1

        main_line = make_line(
            walk_text(
                paragraph,
                inherited_begin=paragraph_begin,
                inherited_end=paragraph_end,
                space_mode=paragraph_space_mode,
                frame_rate=frame_rate,
                tick_rate=tick_rate,
                exclude_background=True,
            ),
            fallback_start=paragraph_begin,
            fallback_end=paragraph_end,
            kind="main",
            source_order=source_order,
            lane_order=len(backgrounds),
        )
        if main_line is not None and not is_background(paragraph):
            lines.append(main_line)

    # Background lines sort before their owning main line at an identical
    # timestamp. Jellyfin's flat active-line model then leaves the main line as
    # the last/current line while the short backing vocal remains visible above.
    lines.sort(
        key=lambda line: (
            line.start_ms,
            line.source_order,
            0 if line.kind == "background" else 1,
            line.lane_order,
        )
    )
    return ConversionResult(tuple(lines), paragraph_count, background_count)


def serialize_line(line: LyricLine, *, mark_background: bool = True) -> str:
    parts = [f"[{elrc_time(line.start_ms)}]"]
    if line.kind == "background" and mark_background:
        parts.append(BACKGROUND_SENTINEL)
    last_cue: int | None = None

    for token in line.tokens:
        if token.timed and token.begin_ms is not None and token.begin_ms != last_cue:
            parts.append(f"<{elrc_time(token.begin_ms)}>")
            last_cue = token.begin_ms
        parts.append(token.text)

    if line.end_ms is not None:
        parts.append(f"<{elrc_time(line.end_ms)}>")
    return "".join(parts).strip()


def convert_file(
    input_path: Path,
    output_path: Path | None = None,
    *,
    include_background: bool = True,
    mark_background: bool = True,
) -> tuple[Path, ConversionResult]:
    if output_path is None:
        output_path = input_path.with_suffix(".elrc")

    try:
        root = ET.parse(input_path).getroot()
    except (ET.ParseError, OSError) as exc:
        raise ConversionError(f"Could not read TTML file {input_path}: {exc}") from exc

    result = convert_tree(root, include_background=include_background)
    if not result.lines:
        raise ConversionError("No timed TTML lyric lines were found")

    rendered = (
        "\n".join(
            serialize_line(line, mark_background=mark_background)
            for line in result.lines
        )
        + "\n"
    )
    output_path.write_text(rendered, encoding="utf-8", newline="\n")
    return output_path, result


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Convert timed TTML to enhanced LRC while preserving nested "
            "word/syllable timings and x-bg vocals as separate lines."
        )
    )
    parser.add_argument("input", type=Path, help="input .ttml file")
    parser.add_argument(
        "-o", "--output", type=Path, help="output .elrc path (default: beside input)"
    )
    parser.add_argument(
        "--no-background",
        action="store_true",
        help="omit ttm:role=x-bg vocals instead of creating separate ELRC lines",
    )
    parser.add_argument(
        "--plain-background",
        action="store_true",
        help=(
            "keep background vocals as separate lines but omit LyricMotion's "
            "invisible role marker"
        ),
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_argument_parser().parse_args(argv)
    try:
        output_path, result = convert_file(
            args.input,
            args.output,
            include_background=not args.no_background,
            mark_background=not args.plain_background,
        )
    except ConversionError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    print(f"Created: {output_path}")
    print(
        f"Converted {result.paragraph_count} TTML paragraphs into "
        f"{len(result.lines)} ELRC lines; preserved "
        f"{result.background_line_count} background-vocal line(s)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
