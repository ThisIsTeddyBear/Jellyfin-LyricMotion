#!/usr/bin/env python3
"""Unified TTML/QRC-to-LRC/ELRC converter.

Unlike a shallow ``p/span`` converter, this converter walks nested spans and
extracts ``ttm:role="x-bg"`` content as its own timed lyric line.  This keeps
background vocals such as ``(Brazil)`` visible without appending them to the
end of the main line.

Line-synchronised sources become standard ``.lrc`` files. Only sources with
meaningful intra-line timing become ``.elrc``, preventing a whole line from
being rendered as one glowing karaoke word. TTML/QRC should still be kept as
the lossless master file.
"""

from __future__ import annotations

import argparse
import html
import re
import os
import sys
import tempfile
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
AUXILIARY_ROLES = {"x-roman", "roman", "romanization", "x-translation", "translation"}
MAX_TTML_BYTES = 64 * 1024 * 1024
SUPPORTED_INPUT_SUFFIXES = {".ttml", ".dfxp", ".qrc"}

# ELRC has no standard per-line role field. Jellyfin strips Unicode format
# controls on some server/web combinations, so use a deliberately visible,
# ASCII-only transport token. LyricMotion removes it before painting and shifts
# Jellyfin's cue positions back by exactly its length. This token sits before
# the first enhanced cue, leaving every word timestamp untouched.
BACKGROUND_SENTINEL = "[ak:bg]"

WHITESPACE_RE = re.compile(r"\s+")
OFFSET_TIME_RE = re.compile(
    r"^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(h|m|s|ms|f|t)$",
    re.IGNORECASE,
)
QRC_LINE_RE = re.compile(r"^\s*\[\s*(-?\d+)\s*,\s*(\d+)\s*\](.*)$")
QRC_WORD_RE = re.compile(r"\(\s*(-?\d+)\s*,\s*(\d+)\s*\)")
QRC_META_RE = re.compile(r"^\s*\[([A-Za-z][\w-]*):(.*)\]\s*$")
QRC_CONTENT_RE = re.compile(
    r"LyricContent\s*=\s*\"(.*?)\"\s*/\s*>", re.IGNORECASE | re.DOTALL
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
    source_format: str = "ttml"
    timing_mode: str = "elrc"
    word_synced_line_count: int = 0
    qrc_timing_mode: str | None = None


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
    if not rate.is_finite() or rate <= 0:
        raise ConversionError(
            f"TTML timing rate must be finite and positive: {value!r}"
        )
    return rate


def apply_frame_rate_multiplier(
    frame_rate: Decimal,
    value: str | None,
) -> Decimal:
    """Apply TTML's optional ``frameRateMultiplier="num den"`` safely."""

    if not value:
        return frame_rate

    parts = value.split()
    if len(parts) != 2:
        raise ConversionError(
            f"Invalid TTML frameRateMultiplier: {value!r}"
        )

    try:
        numerator = Decimal(parts[0])
        denominator = Decimal(parts[1])
    except InvalidOperation as exc:
        raise ConversionError(
            f"Invalid TTML frameRateMultiplier: {value!r}"
        ) from exc

    if (
        not numerator.is_finite()
        or not denominator.is_finite()
        or numerator <= 0
        or denominator <= 0
    ):
        raise ConversionError(
            f"TTML frameRateMultiplier must be finite and positive: {value!r}"
        )

    return frame_rate * numerator / denominator


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

    if (
        not frame_rate.is_finite()
        or not tick_rate.is_finite()
        or frame_rate <= 0
        or tick_rate <= 0
    ):
        raise ConversionError("TTML frame/tick rates must be finite and positive")

    offset_match = OFFSET_TIME_RE.fullmatch(value)
    if offset_match:
        try:
            amount = Decimal(offset_match.group(1))
        except InvalidOperation as exc:
            raise ConversionError(
                f"Unsupported TTML time expression: {value!r}"
            ) from exc
        if not amount.is_finite() or amount < 0:
            raise ConversionError(
                f"TTML time must be finite and non-negative: {value!r}"
            )
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
        numbers = [Decimal(field) for field in fields]
    except (InvalidOperation, ValueError) as exc:
        raise ConversionError(f"Unsupported TTML time expression: {value!r}") from exc

    if not numbers or any(not number.is_finite() for number in numbers):
        raise ConversionError(f"TTML time must be finite: {value!r}")
    if any(number < 0 for number in numbers):
        raise ConversionError(f"Negative TTML time is not supported: {value!r}")

    if len(numbers) == 4:
        hours, minutes, seconds, frames = numbers
        if minutes >= 60 or seconds >= 60 or frames >= frame_rate:
            raise ConversionError(f"Malformed TTML clock time: {value!r}")
        total = hours * 3600 + minutes * 60 + seconds + frames / frame_rate
    elif len(numbers) == 3:
        hours, minutes, seconds = numbers
        if minutes >= 60 or seconds >= 60:
            raise ConversionError(f"Malformed TTML clock time: {value!r}")
        total = hours * 3600 + minutes * 60 + seconds
    elif len(numbers) == 2:
        minutes, seconds = numbers
        if seconds >= 60:
            raise ConversionError(f"Malformed TTML clock time: {value!r}")
        total = minutes * 60 + seconds
    elif len(numbers) == 1:
        total = numbers[0]
    else:
        raise ConversionError(f"Unsupported TTML time expression: {value!r}")

    if not total.is_finite():
        raise ConversionError(f"TTML time must be finite: {value!r}")
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


def is_auxiliary_text(element: ET.Element) -> bool:
    """Return True for non-sung annotation tracks embedded in lyric TTML."""

    roles = set(element_role(element).split())
    return bool(roles & AUXILIARY_ROLES)


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

    if duration is not None and begin is not None:
        duration_end = begin + duration
        if end is None or duration_end < end:
            end = duration_end

    if end is None:
        end = inherited_end
    elif inherited_end is not None:
        end = min(end, inherited_end)

    if begin is not None and end is not None and end < begin:
        raise ConversionError(
            f"TTML element ends before it starts ({elrc_time(begin)} > {elrc_time(end)})"
        )

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
        # Translation/romanization annotations are not sung lyric text. They
        # must never be flattened into the ELRC line. LyricMotion generates
        # its PC/mobile romanized view independently at runtime.
        excluded = is_auxiliary_text(child) or (exclude_background and is_background(child))
        if not excluded:
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


def line_is_word_synced(line: LyricLine) -> bool:
    """Return True only when a line has meaningful intra-line cue movement.

    TTML frequently wraps a complete line in one or many spans that all inherit
    the paragraph's begin time. Serializing those inherited duplicates as ELRC
    makes Jellyfin expose the entire lyric as one animated word. At least two
    distinct timed text starts are required before emitting enhanced cues.
    """

    starts = {
        token.begin_ms
        for token in line.tokens
        if token.timed
        and token.begin_ms is not None
        and token.text.strip()
    }
    return len(starts) >= 2


def timing_mode_for(lines: Sequence[LyricLine]) -> tuple[str, int]:
    vocal_lines = [line for line in lines if line.text]
    word_synced_count = sum(line_is_word_synced(line) for line in vocal_lines)
    if word_synced_count == 0:
        return "lrc", 0
    if word_synced_count == len(vocal_lines):
        return "elrc", word_synced_count
    return "mixed", word_synced_count


def convert_tree(
    root: ET.Element,
    *,
    include_background: bool = True,
) -> ConversionResult:
    frame_rate = parse_rate(
        root.get("frameRate") or root.get(f"{{{TTML_NS}#parameter}}frameRate"),
        Decimal(30),
    )
    frame_rate = apply_frame_rate_multiplier(
        frame_rate,
        root.get("frameRateMultiplier")
        or root.get(f"{{{TTML_NS}#parameter}}frameRateMultiplier"),
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

    # Equal-start backing lines sort before their owning main line, so the
    # renderer can attach them immediately before that lead. Later backing
    # lines retain chronological order and therefore attach after the closest
    # preceding lead. Jellyfin's flat active-line model still leaves the main
    # line as the last/current line for equal-start overlaps.
    lines.sort(
        key=lambda line: (
            line.start_ms,
            line.source_order,
            0 if line.kind == "background" else 1,
            line.lane_order,
        )
    )
    timing_mode, word_synced_count = timing_mode_for(lines)
    return ConversionResult(
        tuple(lines),
        paragraph_count,
        background_count,
        source_format="ttml",
        timing_mode=timing_mode,
        word_synced_line_count=word_synced_count,
    )


def serialize_line(
    line: LyricLine,
    *,
    mark_background: bool = True,
    enhanced: bool | None = None,
) -> str:
    parts = [f"[{elrc_time(line.start_ms)}]"]
    if line.kind == "background" and mark_background:
        parts.append(BACKGROUND_SENTINEL)

    if enhanced is None:
        enhanced = line_is_word_synced(line)

    if not enhanced:
        parts.append(line.text)
        return "".join(parts).strip()

    last_cue: int | None = None

    for token in line.tokens:
        if token.timed and token.begin_ms is not None and token.begin_ms != last_cue:
            parts.append(f"<{elrc_time(token.begin_ms)}>")
            last_cue = token.begin_ms
        parts.append(token.text)

    if line.end_ms is not None:
        parts.append(f"<{elrc_time(line.end_ms)}>")
    return "".join(parts).strip()


# ---------------------------------------------------------------------------
# QRC
# ---------------------------------------------------------------------------

def extract_qrc_content(raw: str) -> str:
    """Read XML-wrapped or raw QRC without rejecting common malformed XML."""

    match = QRC_CONTENT_RE.search(raw)
    if match:
        return html.unescape(match.group(1)).replace("&#10;", "\n")

    element_match = re.search(
        r"<LyricContent[^>]*>(.*?)</LyricContent>", raw, re.IGNORECASE | re.DOTALL
    )
    if element_match:
        return html.unescape(element_match.group(1))

    if any(QRC_LINE_RE.match(line) for line in raw.splitlines()):
        return raw

    raise ConversionError("No readable QRC LyricContent or timed [start,duration] lines were found")


def parse_qrc_metadata(content: str) -> dict[str, str]:
    metadata: dict[str, str] = {}
    for line in content.splitlines():
        match = QRC_META_RE.match(line)
        if match:
            metadata[match.group(1).casefold()] = match.group(2).strip()
    return metadata


def qrc_word_timing_mode(line_start: int, starts: Sequence[int]) -> str:
    """Distinguish absolute QRC word times from line-relative exports."""

    if not starts or line_start <= 0:
        return "absolute"

    absolute_distance = min(abs(start - line_start) for start in starts)
    relative_distance = min(abs(start) for start in starts)
    if (
        relative_distance + 250 < absolute_distance
        and max(starts) <= max(20_000, line_start // 2)
    ):
        return "relative"
    return "absolute"


def parse_qrc_timed_line(
    raw_line: str,
    *,
    source_order: int,
    offset_ms: int,
) -> tuple[LyricLine | None, str | None]:
    header = QRC_LINE_RE.match(raw_line)
    if not header:
        return None, None

    line_start = int(header.group(1))
    line_duration = int(header.group(2))
    payload = header.group(3)
    matches = list(QRC_WORD_RE.finditer(payload))
    header_start = max(0, line_start + offset_ms)
    header_end = max(header_start, line_start + line_duration + offset_ms)

    if not matches:
        text = payload.strip()
        if not text:
            return None, None
        return (
            LyricLine(
                header_start,
                header_end,
                (TimedText(text, header_start, header_end),),
                "main",
                source_order,
                0,
            ),
            None,
        )

    starts = [int(match.group(1)) for match in matches]
    timing_mode = qrc_word_timing_mode(line_start, starts)
    tokens: list[TimedText] = []
    cursor = 0
    for match in matches:
        text = payload[cursor:match.start()]
        raw_start = int(match.group(1))
        duration = int(match.group(2))
        absolute_start = raw_start + (
            line_start if timing_mode == "relative" else 0
        )
        begin = max(0, absolute_start + offset_ms)
        end = max(begin, absolute_start + duration + offset_ms)
        if text:
            tokens.append(TimedText(text, begin, end, timed=True))
        cursor = match.end()

    if payload[cursor:]:
        tokens.append(TimedText(payload[cursor:], None, None, timed=False))

    tokens = list(compact_tokens(tokens))
    if not tokens or not "".join(token.text for token in tokens).strip():
        return None, timing_mode

    token_starts = [token.begin_ms for token in tokens if token.begin_ms is not None]
    token_ends = [token.end_ms for token in tokens if token.end_ms is not None]
    return (
        LyricLine(
            min([header_start, *token_starts]) if token_starts else header_start,
            max([header_end, *token_ends]) if token_ends else header_end,
            tuple(tokens),
            "main",
            source_order,
            0,
        ),
        timing_mode,
    )


def parse_qrc_file(path: Path) -> ConversionResult:
    try:
        if path.stat().st_size > MAX_TTML_BYTES:
            raise ConversionError(
                f"QRC input is too large ({path.stat().st_size} bytes; limit {MAX_TTML_BYTES})"
            )
        raw = path.read_text(encoding="utf-8-sig", errors="replace")
    except ConversionError:
        raise
    except OSError as exc:
        raise ConversionError(f"Could not read QRC file {path}: {exc}") from exc

    content = extract_qrc_content(raw)
    metadata = parse_qrc_metadata(content)
    try:
        offset_ms = int(metadata.get("offset", "0") or "0")
    except ValueError:
        offset_ms = 0

    lines: list[LyricLine] = []
    timing_modes: list[str] = []
    source_line_count = 0
    for raw_line in content.splitlines():
        if not QRC_LINE_RE.match(raw_line):
            continue
        source_line_count += 1
        line, timing_mode = parse_qrc_timed_line(
            raw_line,
            source_order=source_line_count - 1,
            offset_ms=offset_ms,
        )
        if line:
            lines.append(line)
        if timing_mode:
            timing_modes.append(timing_mode)

    if not lines:
        raise ConversionError("No timed QRC lyric lines were found")

    lines.sort(key=lambda line: (line.start_ms, line.source_order))
    mode, word_synced_count = timing_mode_for(lines)
    absolute_count = timing_modes.count("absolute")
    relative_count = timing_modes.count("relative")
    qrc_timing_mode = (
        "line-only"
        if not timing_modes
        else "absolute"
        if relative_count == 0
        else "relative"
        if absolute_count == 0
        else f"mixed ({absolute_count} absolute, {relative_count} relative)"
    )
    return ConversionResult(
        tuple(lines),
        source_line_count,
        0,
        source_format="qrc",
        timing_mode=mode,
        word_synced_line_count=word_synced_count,
        qrc_timing_mode=qrc_timing_mode,
    )


def detect_format(path: Path) -> str:
    suffix = path.suffix.casefold()
    if suffix == ".qrc":
        return "qrc"
    if suffix in {".ttml", ".dfxp"}:
        return "ttml"

    try:
        sample = path.read_text(encoding="utf-8-sig", errors="replace")[:16_384]
    except OSError as exc:
        raise ConversionError(f"Could not read {path}: {exc}") from exc
    if "LyricContent" in sample or any(QRC_LINE_RE.match(line) for line in sample.splitlines()):
        return "qrc"
    if re.search(r"<\s*(?:\w+:)?tt\b", sample, re.IGNORECASE):
        return "ttml"
    raise ConversionError(f"Could not detect lyric format for {path}")


def convert_file(
    input_path: Path,
    output_path: Path | None = None,
    *,
    source_format: str = "auto",
    include_background: bool = True,
    mark_background: bool = True,
) -> tuple[Path, ConversionResult]:
    if not input_path.exists():
        raise ConversionError(f"Input file does not exist: {input_path}")

    source_format = (
        detect_format(input_path)
        if source_format == "auto"
        else source_format
    )

    if source_format == "ttml":
        try:
            size = input_path.stat().st_size
            if size > MAX_TTML_BYTES:
                raise ConversionError(
                    f"TTML input is too large ({size} bytes; limit {MAX_TTML_BYTES})"
                )
            payload = input_path.read_bytes()
            if len(payload) > MAX_TTML_BYTES:
                raise ConversionError(
                    f"TTML input is too large ({len(payload)} bytes; limit {MAX_TTML_BYTES})"
                )
            upper_payload = payload.upper()
            if b"<!DOCTYPE" in upper_payload or b"<!ENTITY" in upper_payload:
                raise ConversionError(
                    "TTML documents containing DTD/entity declarations are not supported"
                )
            root = ET.fromstring(payload)
        except ConversionError:
            raise
        except (ET.ParseError, OSError) as exc:
            raise ConversionError(f"Could not read TTML file {input_path}: {exc}") from exc

        result = convert_tree(root, include_background=include_background)
    elif source_format == "qrc":
        result = parse_qrc_file(input_path)
    else:
        raise ConversionError(f"Unsupported source format: {source_format}")

    if not result.lines:
        raise ConversionError("No timed lyric lines were found")

    if output_path is None:
        output_path = input_path.with_suffix(
            ".lrc" if result.timing_mode == "lrc" else ".elrc"
        )

    try:
        same_path = input_path.resolve() == output_path.resolve()
    except OSError:
        same_path = input_path.absolute() == output_path.absolute()

    if same_path:
        raise ConversionError(
            "Input and output paths must be different; refusing to overwrite the lyric source"
        )

    rendered = (
        "\n".join(
            serialize_line(
                line,
                mark_background=mark_background,
                enhanced=line_is_word_synced(line),
            )
            for line in result.lines
        )
        + "\n"
    )
    # Write beside the target and atomically replace it only after the whole
    # document is flushed. A full disk, interrupted write, or encoding error
    # therefore cannot leave an existing ELRC half-written.
    temporary_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            newline="\n",
            dir=output_path.parent,
            prefix=f".{output_path.name}.",
            suffix=".tmp",
            delete=False,
        ) as handle:
            temporary_path = Path(handle.name)
            handle.write(rendered)
            handle.flush()
            os.fsync(handle.fileno())

        temporary_path.replace(output_path)
        temporary_path = None
    except OSError as exc:
        if temporary_path is not None:
            try:
                temporary_path.unlink(missing_ok=True)
            except OSError:
                pass
        raise ConversionError(
            f"Could not write ELRC file {output_path}: {exc}"
        ) from exc

    return output_path, result


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Convert timed TTML or QRC to LRC/ELRC. Line-synced sources become "
            ".lrc; word-synced sources become .elrc."
        )
    )
    parser.add_argument(
        "input",
        type=Path,
        nargs="?",
        default=Path("."),
        help=(
            "input .ttml, .dfxp, or .qrc file; omit it to batch-convert "
            "the current folder"
        ),
    )
    parser.add_argument(
        "-o", "--output", type=Path,
        help="output path (default: .lrc for line timing, .elrc for word timing)",
    )
    parser.add_argument(
        "--format",
        choices=("auto", "ttml", "qrc"),
        default="auto",
        help="force a source format instead of auto-detecting it",
    )
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="directory mode: also convert supported files in subdirectories",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="directory mode: skip a source when its .lrc or .elrc output exists",
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
            "ASCII role token"
        ),
    )
    return parser


def iter_source_files(directory: Path, *, recursive: bool) -> list[Path]:
    iterator = directory.rglob("*") if recursive else directory.iterdir()
    return sorted(
        (
            path
            for path in iterator
            if path.is_file() and path.suffix.casefold() in SUPPORTED_INPUT_SUFFIXES
        ),
        key=lambda path: str(path.relative_to(directory)).casefold(),
    )


def run_batch(directory: Path, args: argparse.Namespace) -> int:
    if args.output is not None:
        print(
            "error: -o/--output is only supported for a single input file",
            file=sys.stderr,
        )
        return 1

    files = iter_source_files(directory, recursive=args.recursive)
    if not files:
        scope = " recursively" if args.recursive else ""
        print(f"No .ttml, .dfxp, or .qrc files found{scope} in {directory.resolve()}")
        return 0

    stem_counts: dict[str, int] = {}
    for source in files:
        key = str(source.relative_to(directory).with_suffix("")).casefold()
        stem_counts[key] = stem_counts.get(key, 0) + 1

    print(f"Batch mode: found {len(files)} source lyric file(s) in {directory.resolve()}")
    converted = 0
    skipped = 0
    failed = 0

    for index, source in enumerate(files, start=1):
        relative = source.relative_to(directory)
        collision_key = str(relative.with_suffix("")).casefold()
        label = f"[{index}/{len(files)}] {relative}"

        if stem_counts[collision_key] > 1:
            print(
                f"{label} -> ERROR: another source has the same basename; "
                "convert these files individually with -o to avoid overwriting",
                file=sys.stderr,
            )
            failed += 1
            continue

        lrc_path = source.with_suffix(".lrc")
        elrc_path = source.with_suffix(".elrc")
        if args.skip_existing and (lrc_path.exists() or elrc_path.exists()):
            print(f"{label} -> skipped (an LRC/ELRC output already exists)")
            skipped += 1
            continue

        try:
            output_path, result = convert_file(
                source,
                source_format=args.format,
                include_background=not args.no_background,
                mark_background=not args.plain_background,
            )
        except ConversionError as exc:
            print(f"{label} -> ERROR: {exc}", file=sys.stderr)
            failed += 1
            continue

        print(
            f"{label} -> {output_path.name} "
            f"({result.source_format.upper()} {result.timing_mode.upper()})"
        )
        converted += 1

    print(f"Done: {converted} converted, {skipped} skipped, {failed} failed.")
    return 1 if failed else 0


def main(argv: Sequence[str] | None = None) -> int:
    args = build_argument_parser().parse_args(argv)

    if args.input.is_dir():
        return run_batch(args.input, args)

    if args.recursive or args.skip_existing:
        print(
            "error: --recursive and --skip-existing require a directory input",
            file=sys.stderr,
        )
        return 1

    try:
        output_path, result = convert_file(
            args.input,
            args.output,
            source_format=args.format,
            include_background=not args.no_background,
            mark_background=not args.plain_background,
        )
    except ConversionError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    print(f"Created: {output_path}")
    print(
        f"Detected {result.source_format.upper()}; converted "
        f"{result.paragraph_count} source line(s) into {len(result.lines)} "
        f"{result.timing_mode.upper()} line(s); preserved "
        f"{result.background_line_count} background-vocal line(s)."
    )
    if result.qrc_timing_mode:
        print(f"QRC word timing mode: {result.qrc_timing_mode}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
