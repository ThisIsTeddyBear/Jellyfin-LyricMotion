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
import stat
import sys
import tempfile
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from decimal import Decimal, DecimalException, ROUND_HALF_UP
from pathlib import Path
from typing import Iterable, Iterator, Sequence
from urllib.parse import quote


TTML_NS = "http://www.w3.org/ns/ttml"
TTM_NS = "http://www.w3.org/ns/ttml#metadata"
XML_NS = "http://www.w3.org/XML/1998/namespace"
NS = {"tt": TTML_NS}

ROLE_ATTRIBUTE = f"{{{TTM_NS}}}role"
SPACE_ATTRIBUTE = f"{{{XML_NS}}}space"
BACKGROUND_ROLES = {"x-bg", "background", "bg"}
AUXILIARY_ROLES = {"x-roman", "roman", "romanization", "x-translation", "translation"}
MAX_TTML_BYTES = 64 * 1024 * 1024
# Jellyfin timestamps use signed 64-bit ticks (10,000 ticks per millisecond).
# Keeping parsed times inside that range avoids Decimal overflows and impractical
# LRC clocks while still allowing tracks far longer than any real recording.
MAX_TIMESTAMP_MS = 922_337_203_685_477
SUPPORTED_INPUT_SUFFIXES = {".ttml", ".dfxp", ".qrc"}

# ELRC has no standard per-line role field. Jellyfin strips Unicode format
# controls on some server/web combinations, so use a deliberately visible,
# ASCII-only transport token. LyricMotion removes it before painting and shifts
# Jellyfin's cue positions back by exactly its length. This token sits before
# the first enhanced cue, leaving every word timestamp untouched.
BACKGROUND_SENTINEL = "[ak:bg]"
AGENT_TOKEN_PREFIX = "[ak:agent="
GROUP_TOKEN_PREFIX = "[ak:group="
SECTION_TOKEN_PREFIX = "[ak:section="

WHITESPACE_RE = re.compile(r"\s+")
OFFSET_TIME_RE = re.compile(
    r"^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(h|m|s|ms|f|t)$",
    re.IGNORECASE,
)
QRC_LINE_RE = re.compile(r"^\s*\[\s*(-?\d+)\s*,\s*(\d+)\s*\](.*)$")
QRC_WORD_RE = re.compile(r"\(\s*(-?\d+)\s*,\s*(\d+)\s*\)")
QRC_META_RE = re.compile(r"^\s*\[([A-Za-z][\w-]*):(.*)\]\s*$")
QRC_CONTENT_RE = re.compile(
    r"LyricContent\s*=\s*(?:\"(?P<double>.*?)\"|'(?P<single>.*?)')",
    re.IGNORECASE | re.DOTALL,
)
QRC_CDATA_RE = re.compile(r"^\s*<!\[CDATA\[(.*)\]\]>\s*$", re.DOTALL)


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
    agent: str | None = None
    section: str | None = None

    @property
    def text(self) -> str:
        return normalize_line_text("".join(token.text for token in self.tokens))


@dataclass(frozen=True)
class LyricAgent:
    """A TTML vocal agent, retained in ELRC's custom metadata headers."""

    identifier: str
    kind: str | None = None
    name: str | None = None


@dataclass(frozen=True)
class LyricSection:
    """A timed TTML container such as an Apple ``Verse`` or ``Chorus``."""

    start_ms: int | None
    end_ms: int | None
    part: str
    agent: str | None = None


@dataclass(frozen=True)
class LyricMetadata:
    """Source metadata which ELRC can retain without changing lyric timings."""

    source_format: str
    language: str | None = None
    timing: str | None = None
    duration_ms: int | None = None
    leading_silence_ms: int | None = None
    title: str | None = None
    artists: tuple[str, ...] = ()
    album: str | None = None
    lyricists: tuple[str, ...] = ()
    songwriters: tuple[str, ...] = ()
    agents: tuple[LyricAgent, ...] = ()
    sections: tuple[LyricSection, ...] = ()


@dataclass(frozen=True)
class LrcMetadataTag:
    """One safe, document-level ``[name:value]`` ELRC/LRC header."""

    name: str
    value: str


@dataclass(frozen=True)
class SourceContext:
    """Inherited TTML singer and song-part information for a source node."""

    agent: str | None = None
    section: str | None = None


@dataclass(frozen=True)
class ConversionResult:
    lines: tuple[LyricLine, ...]
    paragraph_count: int
    background_line_count: int
    source_format: str = "ttml"
    timing_mode: str = "elrc"
    word_synced_line_count: int = 0
    qrc_timing_mode: str | None = None
    metadata: LyricMetadata = field(
        default_factory=lambda: LyricMetadata(source_format="ttml")
    )


def local_name(tag: str) -> str:
    """Return the local part of an ElementTree expanded name."""

    return tag.rsplit("}", 1)[-1]


def attribute_by_local_name(element: ET.Element, name: str) -> str | None:
    """Return an XML attribute without coupling metadata support to a prefix."""

    for attribute, value in element.attrib.items():
        if local_name(attribute) == name:
            return value
    return None


def element_text(element: ET.Element) -> str:
    """Return compact metadata text without inheriting lyric timing semantics."""

    return normalize_line_text("".join(element.itertext()))


def distinct_nonempty(values: Iterable[str | None]) -> tuple[str, ...]:
    """Keep metadata in source order while removing blank/duplicate values."""

    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        normalized = normalize_line_text(value or "")
        key = normalized.casefold()
        if normalized and key not in seen:
            seen.add(key)
            result.append(normalized)
    return tuple(result)


def safe_lrc_metadata_value(value: str) -> str:
    """Keep arbitrary XML text inside one non-timed LRC metadata header."""

    # A closing bracket or newline could manufacture a second LRC row. The
    # source TTML remains the lossless master, so replacement is safer than
    # emitting ambiguous/broken ELRC syntax.
    return WHITESPACE_RE.sub(" ", value).replace("[", "(").replace("]", ")").strip()


def metadata_time(milliseconds: int) -> str:
    """Use the exact ELRC clock in custom metadata without altering cues."""

    return elrc_time(milliseconds)


def display_input(value: str, *, limit: int = 160) -> str:
    """Quote malformed input without copying an entire hostile field to stderr."""

    if len(value) <= limit:
        return repr(value)
    return f"{value[:limit]!r}... ({len(value)} characters)"


def parse_rate(value: str | None, default: Decimal) -> Decimal:
    if not value:
        return default
    try:
        rate = Decimal(value)
    except DecimalException as exc:
        raise ConversionError(
            f"Invalid TTML timing rate: {display_input(value)}"
        ) from exc
    if not rate.is_finite() or rate <= 0:
        raise ConversionError(
            f"TTML timing rate must be finite and positive: {display_input(value)}"
        )
    return rate


def checked_timestamp_ms(
    value: int,
    *,
    label: str,
    allow_negative: bool = False,
) -> int:
    """Return a timestamp that can safely be represented in an LRC clock.

    QRC offsets can temporarily make an otherwise valid timestamp negative;
    callers opt into that explicitly and clamp only at the output boundary.
    All other timestamps must be non-negative.
    """

    lower_limit = -MAX_TIMESTAMP_MS if allow_negative else 0
    if value < lower_limit or value > MAX_TIMESTAMP_MS:
        raise ConversionError(f"{label} is outside the supported timestamp range")
    return value


def parse_qrc_integer(
    value: str,
    *,
    label: str,
    allow_negative: bool = False,
) -> int:
    """Parse a QRC millisecond field without leaking ``int`` errors."""

    try:
        parsed = int(value)
    except ValueError as exc:
        raise ConversionError(
            f"Invalid QRC {label}: {display_input(value)}"
        ) from exc
    return checked_timestamp_ms(
        parsed,
        label=f"QRC {label}",
        allow_negative=allow_negative,
    )


def add_qrc_timestamps(label: str, *values: int) -> int:
    """Add QRC millisecond values while preserving the supported range."""

    for value in values:
        checked_timestamp_ms(value, label=label, allow_negative=True)
    return checked_timestamp_ms(
        sum(values),
        label=label,
        allow_negative=True,
    )


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
            f"Invalid TTML frameRateMultiplier: {display_input(value)}"
        )

    try:
        numerator = Decimal(parts[0])
        denominator = Decimal(parts[1])
    except DecimalException as exc:
        raise ConversionError(
            f"Invalid TTML frameRateMultiplier: {display_input(value)}"
        ) from exc

    if (
        not numerator.is_finite()
        or not denominator.is_finite()
        or numerator <= 0
        or denominator <= 0
    ):
        raise ConversionError(
            "TTML frameRateMultiplier must be finite and positive: "
            f"{display_input(value)}"
        )

    try:
        effective_rate = frame_rate * numerator / denominator
    except DecimalException as exc:
        raise ConversionError(
            "TTML frameRateMultiplier is outside the supported range: "
            f"{display_input(value)}"
        ) from exc
    if not effective_rate.is_finite() or effective_rate <= 0:
        raise ConversionError(
            "TTML frameRateMultiplier must produce a finite positive rate: "
            f"{display_input(value)}"
        )
    return effective_rate


def decimal_milliseconds(seconds: Decimal) -> int:
    try:
        milliseconds = seconds * 1000
        if (
            not milliseconds.is_finite()
            or milliseconds < 0
            or milliseconds > MAX_TIMESTAMP_MS
        ):
            raise ConversionError("TTML time is outside the supported timestamp range")
        return checked_timestamp_ms(
            int(milliseconds.quantize(Decimal("1"), rounding=ROUND_HALF_UP)),
            label="TTML time",
        )
    except DecimalException as exc:
        raise ConversionError(
            "TTML time is outside the supported timestamp range"
        ) from exc


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
        except DecimalException as exc:
            raise ConversionError(
                f"Unsupported TTML time expression: {display_input(value)}"
            ) from exc
        if not amount.is_finite() or amount < 0:
            raise ConversionError(
                "TTML time must be finite and non-negative: "
                f"{display_input(value)}"
            )
        unit = offset_match.group(2).lower()
        try:
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
        except DecimalException as exc:
            raise ConversionError(
                "TTML time is outside the supported timestamp range"
            ) from exc
        return decimal_milliseconds(seconds)

    fields = value.split(":")
    try:
        numbers = [Decimal(field) for field in fields]
    except (DecimalException, ValueError) as exc:
        raise ConversionError(
            f"Unsupported TTML time expression: {display_input(value)}"
        ) from exc

    if not numbers or any(not number.is_finite() for number in numbers):
        raise ConversionError(f"TTML time must be finite: {display_input(value)}")
    if any(number < 0 for number in numbers):
        raise ConversionError(
            f"Negative TTML time is not supported: {display_input(value)}"
        )

    try:
        if len(numbers) == 4:
            hours, minutes, seconds, frames = numbers
            if minutes >= 60 or seconds >= 60 or frames >= frame_rate:
                raise ConversionError(
                    f"Malformed TTML clock time: {display_input(value)}"
                )
            total = hours * 3600 + minutes * 60 + seconds + frames / frame_rate
        elif len(numbers) == 3:
            hours, minutes, seconds = numbers
            if minutes >= 60 or seconds >= 60:
                raise ConversionError(
                    f"Malformed TTML clock time: {display_input(value)}"
                )
            total = hours * 3600 + minutes * 60 + seconds
        elif len(numbers) == 2:
            minutes, seconds = numbers
            if seconds >= 60:
                raise ConversionError(
                    f"Malformed TTML clock time: {display_input(value)}"
                )
            total = minutes * 60 + seconds
        elif len(numbers) == 1:
            total = numbers[0]
        else:
            raise ConversionError(
                f"Unsupported TTML time expression: {display_input(value)}"
            )
    except DecimalException as exc:
        raise ConversionError(
            "TTML time is outside the supported timestamp range"
        ) from exc

    if not total.is_finite():
        raise ConversionError(f"TTML time must be finite: {display_input(value)}")
    return decimal_milliseconds(total)


def elrc_time(milliseconds: int) -> str:
    """Format milliseconds as the enhanced-LRC ``MM:SS.mmm`` clock."""

    if milliseconds < 0:
        raise ConversionError("ELRC timestamps cannot be negative")
    checked_timestamp_ms(milliseconds, label="ELRC timestamp")
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


def collect_source_contexts(root: ET.Element) -> dict[int, SourceContext]:
    """Resolve inherited TTML agent/song-part ownership for every element."""

    contexts: dict[int, SourceContext] = {}

    def visit(
        element: ET.Element,
        inherited_agent: str | None,
        inherited_section: str | None,
    ) -> None:
        agent = attribute_by_local_name(element, "agent") or inherited_agent
        section = attribute_by_local_name(element, "songPart") or inherited_section
        contexts[id(element)] = SourceContext(agent=agent, section=section)
        for child in element:
            visit(child, agent, section)

    visit(root, None, None)
    return contexts


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
    elif inherited_begin is not None:
        # Apple lyric spans carry absolute media times, but a child can never
        # be active before its parent.  Without this bound an invalid source
        # could serialize a word cue before its enclosing LRC line timestamp.
        begin = max(begin, inherited_begin)

    # TTML permits a timed element to omit ``begin``; its implicit start is
    # zero when there is no timed ancestor to inherit from.  In particular,
    # ``<p end="5s">`` and ``<p dur="5s">`` must not be discarded merely
    # because they have no explicit begin attribute.
    if begin is None and (end is not None or duration is not None):
        begin = 0

    if begin is not None:
        checked_timestamp_ms(begin, label="TTML begin time")
    if end is not None:
        checked_timestamp_ms(end, label="TTML end time")
    if duration is not None:
        checked_timestamp_ms(duration, label="TTML duration")

    if duration is not None and begin is not None:
        duration_end = checked_timestamp_ms(
            begin + duration,
            label="TTML derived end time",
        )
        if end is None or duration_end < end:
            end = duration_end

    if end is None:
        end = inherited_end
    else:
        if inherited_begin is not None:
            end = max(end, inherited_begin)
        if inherited_end is not None:
            end = min(end, inherited_end)

    if begin is not None and inherited_end is not None:
        # Intersect a child interval with its parent's closing boundary.  This
        # keeps completely out-of-range child spans as zero-duration cues
        # instead of emitting reversed ELRC timestamps or rejecting an
        # otherwise readable document.
        begin = min(begin, inherited_end)

    if end is not None:
        checked_timestamp_ms(end, label="TTML end time")

    if begin is not None and end is not None and end < begin:
        raise ConversionError(
            f"TTML element ends before it starts ({elrc_time(begin)} > {elrc_time(end)})"
        )

    return begin, end


def collect_timing_contexts(
    root: ET.Element,
    *,
    frame_rate: Decimal,
    tick_rate: Decimal,
    include_background: bool,
) -> dict[int, tuple[int | None, int | None, str]]:
    """Calculate effective timing/space context for every TTML element.

    ``ElementTree`` does not expose parent pointers.  Recording the inherited
    values while walking from the document root lets a paragraph (and a
    background subtree nested below a timed ``body``/``div``) retain its
    container timing when it is later converted independently.
    """

    contexts: dict[int, tuple[int | None, int | None, str]] = {}

    def visit(
        element: ET.Element,
        inherited_begin: int | None,
        inherited_end: int | None,
        space_mode: str,
    ) -> None:
        begin, end = timing_for(
            element,
            inherited_begin,
            inherited_end,
            frame_rate=frame_rate,
            tick_rate=tick_rate,
        )
        current_space_mode = inherited_space_mode(element, space_mode)
        contexts[id(element)] = (begin, end, current_space_mode)
        for child in element:
            # These tracks are omitted from conversion, so do not let a
            # malformed timestamp in an ignored annotation reject the song.
            if is_auxiliary_text(child):
                continue
            if not include_background and is_background(child):
                continue
            visit(child, begin, end, current_space_mode)

    visit(root, None, None, "default")
    return contexts


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
        if local_name(child.tag).casefold() == "br":
            # LRC has no inline line-break representation. Retain a separator
            # rather than concatenating adjacent words (``hello<br/>world``).
            # Any tail whitespace is compacted to this same single separator.
            yield TimedText(" ", None, None, timed=False)
        elif not excluded:
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
            # Keep the backing-vocal lane consistent with ``walk_text``:
            # annotations are not sung even if they happen to contain an
            # x-bg-marked fragment.
            if is_auxiliary_text(child):
                continue
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
    agent: str | None = None,
    section: str | None = None,
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
    return LyricLine(
        start,
        end,
        compacted,
        kind,
        source_order,
        lane_order,
        agent=agent,
        section=section,
    )


def line_is_word_synced(line: LyricLine) -> bool:
    """Return True only when a line has meaningful intra-line cue movement.

    TTML frequently wraps a complete line in one or many spans that all inherit
    the paragraph's begin time. Serializing those inherited duplicates as ELRC
    makes Jellyfin expose the entire lyric as one animated word. At least two
    distinct timed text starts are normally required before emitting enhanced
    cues. The exception is one explicitly timed display word: its own end time
    gives LyricMotion a real sweep duration even though it has only one start.
    """

    timed_tokens = [
        token
        for token in line.tokens
        if token.timed and token.begin_ms is not None and token.text.strip()
    ]
    starts = {token.begin_ms for token in timed_tokens}
    if len(starts) >= 2:
        return True

    if len(timed_tokens) != 1:
        return False

    token = timed_tokens[0]
    # A whole sentence in one timed TTML span is still line-synchronised and
    # must not become one large glowing ELRC "word". A single lexical display
    # word (for example, a sustained "Mitwa") is different: its explicit end
    # is the intended karaoke duration. Punctuation is allowed; whitespace is
    # not.
    return (
        token.end_ms is not None
        and token.end_ms > token.begin_ms
        and not any(character.isspace() for character in token.text.strip())
    )


def timing_mode_for(lines: Sequence[LyricLine]) -> tuple[str, int]:
    vocal_lines = [line for line in lines if line.text]
    word_synced_count = sum(line_is_word_synced(line) for line in vocal_lines)
    if word_synced_count == 0:
        return "lrc", 0
    if word_synced_count == len(vocal_lines):
        return "elrc", word_synced_count
    return "mixed", word_synced_count


def parse_optional_seconds(value: str | None) -> int | None:
    """Parse an Apple metadata seconds value without making it a lyric offset."""

    if value is None or not value.strip():
        return None
    try:
        seconds = Decimal(value.strip())
    except DecimalException:
        return None
    if not seconds.is_finite() or seconds < 0:
        return None
    return decimal_milliseconds(seconds)


def first_metadata_value(root: ET.Element, *names: str) -> str | None:
    wanted = {name.casefold() for name in names}
    for element in root.iter():
        if local_name(element.tag).casefold() in wanted:
            value = element_text(element)
            if value:
                return value
    return None


def collect_ttml_metadata(
    root: ET.Element,
    *,
    timing_contexts: dict[int, tuple[int | None, int | None, str]],
) -> LyricMetadata:
    """Collect Apple/TTML metadata that has a safe representation in ELRC.

    TTML's exact layout/style tree cannot be represented in Enhanced LRC, but
    its document identity, people, language, timing mode and timed sections
    can be retained as non-timed header tags.  We intentionally *do not* emit
    an LRC ``[offset:]`` from ``leadingSilence``: the word timestamps are
    already absolute and applying that offset again would desynchronise them.
    """

    language = root.get(f"{{{XML_NS}}}lang") or root.get("lang")
    timing = attribute_by_local_name(root, "timing")
    title = first_metadata_value(root, "title")
    album = first_metadata_value(root, "album", "albumtitle")
    artists = distinct_nonempty(
        element_text(element)
        for element in root.iter()
        if local_name(element.tag).casefold()
        in {"artist", "artistname", "performer"}
    )
    lyricists = distinct_nonempty(
        element_text(element)
        for element in root.iter()
        if local_name(element.tag).casefold() in {"lyricist", "author"}
    )
    songwriters = distinct_nonempty(
        element_text(element)
        for element in root.iter()
        if local_name(element.tag).casefold() in {"songwriter", "composer"}
    )

    agents: list[LyricAgent] = []
    for element in root.iter():
        if local_name(element.tag).casefold() != "agent":
            continue
        identifier = (
            element.get(f"{{{XML_NS}}}id")
            or element.get("xml:id")
            or element.get("id")
        )
        if not identifier:
            continue
        name = attribute_by_local_name(element, "name")
        if not name:
            name = first_metadata_value(element, "name")
        agents.append(
            LyricAgent(
                identifier=identifier,
                kind=attribute_by_local_name(element, "type"),
                name=name,
            )
        )

    sections: list[LyricSection] = []
    for element in root.iter():
        part = attribute_by_local_name(element, "songPart")
        if not part:
            continue
        begin, end, _ = timing_contexts.get(id(element), (None, None, "default"))
        # Apple commonly assigns the vocalist on each ``p`` rather than on
        # its ``div songPart`` container. Preserve that association at the
        # section level when there is no explicit container agent.
        section_agent = attribute_by_local_name(element, "agent")
        if not section_agent:
            nested_agents = distinct_nonempty(
                attribute_by_local_name(descendant, "agent")
                for descendant in element.iter()
            )
            section_agent = ",".join(nested_agents) or None
        sections.append(
            LyricSection(
                start_ms=begin,
                end_ms=end,
                part=part,
                agent=section_agent,
            )
        )

    body = next(
        (element for element in root.iter() if local_name(element.tag).casefold() == "body"),
        None,
    )
    duration_ms = None
    if body is not None:
        body_begin, body_end, _ = timing_contexts.get(id(body), (None, None, "default"))
        if body_end is not None:
            duration_ms = body_end - (body_begin or 0)

    itunes_metadata = next(
        (
            element
            for element in root.iter()
            if local_name(element.tag).casefold() == "itunesmetadata"
        ),
        None,
    )
    leading_silence_ms = (
        parse_optional_seconds(attribute_by_local_name(itunes_metadata, "leadingSilence"))
        if itunes_metadata is not None
        else None
    )

    return LyricMetadata(
        source_format="ttml",
        language=normalize_line_text(language or "") or None,
        timing=normalize_line_text(timing or "") or None,
        duration_ms=duration_ms,
        leading_silence_ms=leading_silence_ms,
        title=title,
        artists=artists,
        album=album,
        lyricists=lyricists,
        songwriters=songwriters,
        agents=tuple(agents),
        sections=tuple(sections),
    )


def metadata_tags(metadata: LyricMetadata) -> tuple[LrcMetadataTag, ...]:
    """Serialize all ELRC-representable source metadata as safe header tags."""

    tags: list[LrcMetadataTag] = []

    def add(name: str, value: str | None) -> None:
        safe_value = safe_lrc_metadata_value(value or "")
        if safe_value:
            tags.append(LrcMetadataTag(name, safe_value))

    add("ti", metadata.title)
    add("ar", " / ".join(metadata.artists))
    add("al", metadata.album)
    add("au", " / ".join(distinct_nonempty((*metadata.lyricists, *metadata.songwriters))))
    add("la", metadata.language)
    add("ak-source", metadata.source_format)
    add("ak-timing", metadata.timing)
    if metadata.duration_ms is not None:
        add("length", metadata_time(metadata.duration_ms))
        add("ak-duration", metadata_time(metadata.duration_ms))
    if metadata.leading_silence_ms is not None:
        add("ak-leading-silence", str(metadata.leading_silence_ms))

    for agent in metadata.agents:
        identifier = safe_lrc_metadata_value(agent.identifier)
        if not identifier:
            continue
        value = agent.kind or "person"
        if agent.name:
            value = f"{value}|{agent.name}"
        add(f"ak-agent-{identifier}", value)

    for section in metadata.sections:
        if section.start_ms is None:
            continue
        interval = metadata_time(section.start_ms)
        if section.end_ms is not None:
            interval = f"{interval}-{metadata_time(section.end_ms)}"
        value = f"{interval}|{section.part}"
        if section.agent:
            value = f"{value}|{section.agent}"
        add("ak-section", value)

    return tuple(tags)


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
    timing_contexts = collect_timing_contexts(
        root,
        frame_rate=frame_rate,
        tick_rate=tick_rate,
        include_background=include_background,
    )
    source_contexts = collect_source_contexts(root)

    lines: list[LyricLine] = []
    paragraph_count = 0
    background_count = 0

    paragraphs = root.findall(".//tt:p", NS)
    if not paragraphs:
        paragraphs = [element for element in root.iter() if local_name(element.tag) == "p"]

    for source_order, paragraph in enumerate(paragraphs):
        paragraph_count += 1
        if is_auxiliary_text(paragraph):
            continue
        paragraph_begin, paragraph_end, paragraph_space_mode = timing_contexts[
            id(paragraph)
        ]

        backgrounds = list(top_level_backgrounds(paragraph))
        if include_background:
            for lane_order, background in enumerate(backgrounds):
                (
                    background_begin,
                    background_end,
                    background_space_mode,
                ) = timing_contexts[id(background)]
                background_context = source_contexts[id(background)]
                line = make_line(
                    walk_text(
                        background,
                        inherited_begin=background_begin,
                        inherited_end=background_end,
                        space_mode=background_space_mode,
                        frame_rate=frame_rate,
                        tick_rate=tick_rate,
                        exclude_background=False,
                    ),
                    fallback_start=background_begin,
                    fallback_end=background_end,
                    kind="background",
                    source_order=source_order,
                    lane_order=lane_order,
                    agent=background_context.agent,
                    section=background_context.section,
                )
                if line is not None:
                    lines.append(line)
                    background_count += 1

        paragraph_context = source_contexts[id(paragraph)]
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
            agent=paragraph_context.agent,
            section=paragraph_context.section,
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
    metadata = collect_ttml_metadata(root, timing_contexts=timing_contexts)
    return ConversionResult(
        tuple(lines),
        paragraph_count,
        background_count,
        source_format="ttml",
        timing_mode=timing_mode,
        word_synced_line_count=word_synced_count,
        metadata=metadata,
    )


def serialize_line(
    line: LyricLine,
    *,
    mark_background: bool = True,
    enhanced: bool | None = None,
    agent_kinds: dict[str, str] | None = None,
) -> str:
    parts = [f"[{elrc_time(line.start_ms)}]"]
    if line.kind == "background" and mark_background:
        parts.append(BACKGROUND_SENTINEL)

    # These inline ASCII transport tokens survive Jellyfin's sidecar parser,
    # unlike document-level LRC headers which a server is free to consume.
    # LyricMotion strips them before display and shifts every cue position by
    # their exact character length, just like the existing background token.
    if line.agent:
        encoded_agent = quote(line.agent, safe="-._")
        agent_kind = (agent_kinds or {}).get(line.agent, "").casefold()
        token_prefix = GROUP_TOKEN_PREFIX if agent_kind == "group" else AGENT_TOKEN_PREFIX
        parts.append(f"{token_prefix}{encoded_agent}]")
    if line.section:
        parts.append(f"{SECTION_TOKEN_PREFIX}{quote(line.section, safe='-._')}]")

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


def serialize_document(
    result: ConversionResult,
    *,
    mark_background: bool = True,
) -> str:
    """Render metadata before timed rows without touching their cue positions."""

    headers = [f"[{tag.name}:{tag.value}]" for tag in metadata_tags(result.metadata)]
    agent_kinds = {
        agent.identifier: (agent.kind or "")
        for agent in result.metadata.agents
    }
    rows = [
        serialize_line(
            line,
            mark_background=mark_background,
            enhanced=line_is_word_synced(line),
            agent_kinds=agent_kinds,
        )
        for line in result.lines
    ]
    return "\n".join((*headers, *rows)) + "\n"


# ---------------------------------------------------------------------------
# QRC
# ---------------------------------------------------------------------------

def extract_qrc_content(raw: str) -> str:
    """Read XML-wrapped or raw QRC without rejecting common malformed XML."""

    match = QRC_CONTENT_RE.search(raw)
    if match:
        content = match.group("double")
        if content is None:
            content = match.group("single")
        return html.unescape(content or "")

    element_match = re.search(
        r"<LyricContent[^>]*>(.*?)</LyricContent>", raw, re.IGNORECASE | re.DOTALL
    )
    if element_match:
        content = element_match.group(1)
        cdata_match = QRC_CDATA_RE.fullmatch(content)
        if cdata_match:
            return cdata_match.group(1)
        return html.unescape(content)

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


def qrc_metadata_result(
    metadata: dict[str, str],
    lines: Sequence[LyricLine],
) -> LyricMetadata:
    """Preserve common QRC/LRC headers after normalising its cue offset."""

    # QRC's [offset:] is already applied to every emitted timestamp. Repeating
    # it as an LRC [offset:] would shift the finished ELRC a second time.
    duration_ms = max(
        (line.end_ms if line.end_ms is not None else line.start_ms for line in lines),
        default=None,
    )
    return LyricMetadata(
        source_format="qrc",
        language=metadata.get("la") or metadata.get("lang") or metadata.get("language"),
        title=metadata.get("ti") or metadata.get("title"),
        artists=distinct_nonempty((metadata.get("ar"), metadata.get("artist"))),
        album=metadata.get("al") or metadata.get("album"),
        lyricists=distinct_nonempty((metadata.get("au"), metadata.get("lyricist"))),
        songwriters=distinct_nonempty((metadata.get("composer"), metadata.get("songwriter"))),
        duration_ms=duration_ms,
    )


def qrc_word_timing_mode(
    line_start: int,
    line_duration: int,
    starts: Sequence[int],
) -> str:
    """Distinguish absolute QRC word times from line-relative exports."""

    if not starts or line_start <= 0:
        return "absolute"

    # Header duration gives an unambiguous answer for most QRC exports. For
    # example, a line at 1000 ms with word starts 600/1000 is relative, even
    # though both values happen to be positive absolute timestamps too.
    relative_window = (
        line_duration > 0
        and all(0 <= start <= line_duration for start in starts)
    )
    absolute_window = (
        line_duration > 0
        and all(
            line_start <= start <= line_start + line_duration
            for start in starts
        )
    )
    if relative_window and not absolute_window:
        return "relative"
    if absolute_window and not relative_window:
        return "absolute"

    absolute_distance = min(abs(start - line_start) for start in starts)
    relative_distance = min(abs(start) for start in starts)
    if (
        relative_distance + 250 < absolute_distance
        and max(starts) <= max(20_000, line_start // 2)
    ):
        return "relative"
    return "absolute"


def qrc_word_marker_style(
    payload: str,
    matches: Sequence[re.Match[str]],
) -> str | None:
    """Return QRC marker placement only when its timing syntax is credible.

    A lyric can legitimately contain a number pair such as ``(1999, 2000)``.
    Treating every such pair as timing would remove it from line-synchronised
    lyrics. Real QRC word timing starts with a tuple before the first word. A
    reverse hand-authored form is accepted only with multiple tuples: a single
    trailing number pair is indistinguishable from literal lyric text.
    """

    if not matches:
        return None

    leading_text = payload[:matches[0].start()]
    if not leading_text.strip("\ufeff \t\r\n"):
        return "before"

    if len(matches) >= 2:
        return "after"
    return None


def parse_qrc_timed_line(
    raw_line: str,
    *,
    source_order: int,
    offset_ms: int,
) -> tuple[LyricLine | None, str | None]:
    header = QRC_LINE_RE.match(raw_line)
    if not header:
        return None, None

    line_start = parse_qrc_integer(
        header.group(1),
        label="line start",
        allow_negative=True,
    )
    line_duration = parse_qrc_integer(
        header.group(2),
        label="line duration",
    )
    payload = header.group(3)
    matches = list(QRC_WORD_RE.finditer(payload))
    marker_style = qrc_word_marker_style(payload, matches)
    line_end = add_qrc_timestamps("QRC line end", line_start, line_duration)
    header_start = max(
        0,
        add_qrc_timestamps("QRC line start after offset", line_start, offset_ms),
    )
    header_end = max(
        header_start,
        max(
            0,
            add_qrc_timestamps(
                "QRC line end after offset",
                line_end,
                offset_ms,
            ),
        ),
    )

    def line_synced_result() -> tuple[LyricLine | None, str | None]:
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

    if marker_style is None:
        return line_synced_result()

    starts = [
        parse_qrc_integer(
            match.group(1),
            label="word start",
            allow_negative=True,
        )
        for match in matches
    ]
    timing_mode = qrc_word_timing_mode(line_start, line_duration, starts)
    tokens: list[TimedText] = []

    def timed_token(match: re.Match[str], text: str) -> TimedText | None:
        """Pair a QRC ``(start,duration)`` marker with its lyric fragment."""

        if not text:
            return None
        raw_start = parse_qrc_integer(
            match.group(1),
            label="word start",
            allow_negative=True,
        )
        duration = parse_qrc_integer(match.group(2), label="word duration")
        absolute_start = (
            add_qrc_timestamps("QRC relative word start", raw_start, line_start)
            if timing_mode == "relative"
            else raw_start
        )
        word_end = add_qrc_timestamps(
            "QRC word end",
            absolute_start,
            duration,
        )
        begin = max(
            0,
            add_qrc_timestamps(
                "QRC word start after offset",
                absolute_start,
                offset_ms,
            ),
        )
        end = max(
            begin,
            max(
                0,
                add_qrc_timestamps(
                    "QRC word end after offset",
                    word_end,
                    offset_ms,
                ),
            ),
        )
        return TimedText(text, begin, end, timed=True)

    # Standard QQ Music QRC puts each timing tuple *before* the word it times:
    # ``(1000,300)one(1300,300) two``. The former converter paired each marker
    # with the preceding text instead, dropping the final word and shifting all
    # earlier cues forward. A few hand-authored exports use the reverse form,
    # so retain it when actual lyric text precedes the first marker.
    leading_text = payload[:matches[0].start()]

    if marker_style == "before":
        if leading_text:
            tokens.append(TimedText(leading_text, None, None, timed=False))
        for index, match in enumerate(matches):
            next_start = (
                matches[index + 1].start()
                if index + 1 < len(matches)
                else len(payload)
            )
            token = timed_token(match, payload[match.end():next_start])
            if token is not None:
                tokens.append(token)
    else:
        cursor = 0
        for match in matches:
            token = timed_token(match, payload[cursor:match.start()])
            if token is not None:
                tokens.append(token)
            cursor = match.end()

        if payload[cursor:]:
            tokens.append(TimedText(payload[cursor:], None, None, timed=False))

    tokens = list(compact_tokens(tokens))
    if not tokens or not "".join(token.text for token in tokens).strip():
        # A leading literal such as ``(1999, 2000)`` is indistinguishable from
        # a one-marker QRC line until its following lyric fragment is parsed.
        # Never drop the complete line just because no credible timed fragment
        # remained; retain it as ordinary line-synchronised text instead.
        return line_synced_result()

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
        raw = path.read_text(encoding="utf-8-sig")
    except ConversionError:
        raise
    except UnicodeDecodeError as exc:
        raise ConversionError(
            f"QRC input is not valid UTF-8: {path}"
        ) from exc
    except OSError as exc:
        raise ConversionError(f"Could not read QRC file {path}: {exc}") from exc

    content = extract_qrc_content(raw)
    metadata = parse_qrc_metadata(content)
    raw_offset = metadata.get("offset", "0") or "0"
    offset_ms = parse_qrc_integer(
        raw_offset,
        label="[offset:] value",
        allow_negative=True,
    )

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
        metadata=qrc_metadata_result(metadata, lines),
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
    replace_alternate: bool = False,
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

    output_was_default = output_path is None
    if output_was_default:
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

    rendered = serialize_document(result, mark_background=mark_background)
    # Write beside the target and atomically replace it only after the whole
    # document is flushed. A full disk, interrupted write, or encoding error
    # therefore cannot leave an existing ELRC half-written.
    temporary_path: Path | None = None
    try:
        try:
            existing_mode = stat.S_IMODE(output_path.stat().st_mode)
        except FileNotFoundError:
            existing_mode = 0o644

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

        # NamedTemporaryFile creates mode 0600. Lyric files are normally read
        # by Jellyfin under a different service account, so make the replacement
        # readable while retaining any existing write/execute policy.
        os.chmod(
            temporary_path,
            existing_mode | stat.S_IRUSR | stat.S_IRGRP | stat.S_IROTH,
        )

        temporary_path.replace(output_path)
        temporary_path = None
    except OSError as exc:
        if temporary_path is not None:
            try:
                temporary_path.unlink(missing_ok=True)
            except OSError:
                pass
        raise ConversionError(
            f"Could not write lyric output {output_path}: {exc}"
        ) from exc

    if replace_alternate and output_was_default:
        alternate_suffix = ".elrc" if output_path.suffix.casefold() == ".lrc" else ".lrc"
        alternate_path = input_path.with_suffix(alternate_suffix)
        if alternate_path.exists():
            try:
                alternate_path.unlink()
            except OSError as exc:
                raise ConversionError(
                    f"Created {output_path}, but could not remove conflicting "
                    f"alternate output {alternate_path}: {exc}"
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
        "--replace-alternate",
        action="store_true",
        help=(
            "remove a conflicting default .lrc/.elrc sidecar after a successful "
            "conversion (use when migrating an older converter output)"
        ),
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

    if args.skip_existing and args.replace_alternate:
        print(
            "error: --skip-existing cannot be combined with --replace-alternate",
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
                replace_alternate=args.replace_alternate,
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
    if sys.version_info < (3, 8):
        print("error: Python 3.8 or newer is required", file=sys.stderr)
        return 1
    args = build_argument_parser().parse_args(argv)

    if args.input.is_dir():
        return run_batch(args.input, args)

    if args.recursive or args.skip_existing:
        print(
            "error: --recursive and --skip-existing require a directory input",
            file=sys.stderr,
        )
        return 1

    if args.replace_alternate and args.output is not None:
        print(
            "error: --replace-alternate is only supported with the default output path",
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
            replace_alternate=args.replace_alternate,
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
