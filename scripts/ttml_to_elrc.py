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
        same_path = input_path.resolve() == output_path.resolve()
    except OSError:
        same_path = input_path.absolute() == output_path.absolute()

    if same_path:
        raise ConversionError(
            "Input and output paths must be different; refusing to overwrite the TTML source"
        )

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
    if not result.lines:
        raise ConversionError("No timed TTML lyric lines were found")

    rendered = (
        "\n".join(
            serialize_line(line, mark_background=mark_background)
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
            "ASCII role token"
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
