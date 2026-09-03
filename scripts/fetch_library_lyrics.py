#!/usr/bin/env python3
"""Fetch missing, synchronized lyric masters for a local music library.

This is a conservative wrapper around ``am_lyrics_fetch.py``. Existing lyric
sidecars are never overwritten. Every synchronized result is saved in the
original master format returned by its provider, without conversion.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from types import ModuleType
from typing import Any


AUDIO_SUFFIXES = {".flac", ".m4a", ".mp3", ".aac", ".ogg", ".opus", ".wav"}
LYRIC_SUFFIXES = (".elrc", ".lrc", ".ttml", ".qrc", ".txt")
INSTRUMENTAL_RE = re.compile(r"\b(instrumental|karaoke|backing track|theme)\b", re.I)


def load_module(path: Path, name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not import {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def ffprobe_metadata(path: Path) -> dict[str, Any]:
    completed = subprocess.run(
        [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration:format_tags=title,artist,album,album_artist,isrc,tsrc",
            "-of", "json",
            os.fspath(path),
        ],
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    data = json.loads(completed.stdout).get("format", {})
    tags = {str(key).casefold(): str(value).strip() for key, value in data.get("tags", {}).items()}
    artist = tags.get("artist") or tags.get("album_artist") or ""
    return {
        "title": tags.get("title") or path.stem,
        "artist": artist,
        "album": tags.get("album") or None,
        "duration_s": float(data["duration"]) if data.get("duration") else None,
        "isrc": tags.get("isrc") or tags.get("tsrc") or None,
    }


def existing_sidecars(audio: Path) -> list[Path]:
    return [audio.with_suffix(suffix) for suffix in LYRIC_SUFFIXES if audio.with_suffix(suffix).exists()]


def atomic_write_text(path: Path, payload: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    temporary = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        if path.exists():
            raise FileExistsError(f"Refusing to overwrite {path}")
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def write_report(path: Path | None, records: list[dict[str, Any]]) -> None:
    if path is None:
        return
    summary: dict[str, int] = {}
    for record in records:
        status = str(record["status"])
        summary[status] = summary.get(status, 0) + 1
    payload = json.dumps({"summary": summary, "tracks": records}, ensure_ascii=False, indent=2) + "\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_text(payload, encoding="utf-8", newline="\n")
    temporary.replace(path)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("library", type=Path)
    parser.add_argument("--fetcher", type=Path, required=True)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--limit", type=int, help="process at most this many missing tracks")
    parser.add_argument("--pause", type=float, default=0.2, help="delay between provider searches")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    library = args.library.resolve()
    if not library.is_dir():
        raise SystemExit(f"Library directory does not exist: {library}")

    fetcher = load_module(args.fetcher.resolve(), "library_lyrics_fetcher")
    audio_files = sorted(
        (path for path in library.rglob("*") if path.is_file() and path.suffix.casefold() in AUDIO_SUFFIXES),
        key=lambda path: str(path).casefold(),
    )

    records: list[dict[str, Any]] = []
    missing_processed = 0
    print(f"Found {len(audio_files)} audio tracks under {library}", flush=True)

    for index, audio in enumerate(audio_files, start=1):
        relative = str(audio.relative_to(library))
        sidecars = existing_sidecars(audio)
        if sidecars:
            records.append({
                "track": relative,
                "status": "existing",
                "sidecars": [path.name for path in sidecars],
            })
            continue
        if args.limit is not None and missing_processed >= args.limit:
            continue
        missing_processed += 1

        try:
            metadata = ffprobe_metadata(audio)
        except Exception as exc:
            records.append({"track": relative, "status": "metadata-error", "error": str(exc)})
            print(f"[{index}/{len(audio_files)}] METADATA ERROR  {relative}: {exc}", flush=True)
            write_report(args.report, records)
            continue

        title = metadata["title"]
        artist = metadata["artist"]
        if INSTRUMENTAL_RE.search(title):
            records.append({"track": relative, "status": "instrumental", **metadata})
            print(f"[{index}/{len(audio_files)}] INSTRUMENTAL   {relative}", flush=True)
            write_report(args.report, records)
            continue
        if not artist:
            records.append({"track": relative, "status": "missing-artist", **metadata})
            print(f"[{index}/{len(audio_files)}] MISSING ARTIST {relative}", flush=True)
            write_report(args.report, records)
            continue

        print(f"[{index}/{len(audio_files)}] SEARCH         {artist} - {title}", flush=True)
        track = fetcher.TrackCandidate(
            title=title,
            artist=artist,
            album=metadata["album"],
            duration_s=metadata["duration_s"],
            isrc=metadata["isrc"],
            user_title_hint=title,
            user_artist_hint=artist,
        )

        try:
            results = fetcher.search_all_providers(
                track,
                lyricsplus_server=fetcher.CURRENT_LYRICSPLUS_SERVER,
                better_lyrics_key=None,
                better_jwt=None,
                prompt_for_jwt=False,
                force_reload=False,
                refresh_providers=False,
                deep=False,
                skip_lyricsplus=False,
                skip_better_lyrics=True,
                skip_unified=True,
                skip_binilyrics_direct=False,
                skip_unison=True,
                skip_youtube_captions=True,
                allow_auto_captions=False,
                skip_lrclib=False,
                include_unsynced=False,
                verbose=False,
            )
            result = next(
                (
                    candidate
                    for candidate in results
                    if candidate.sync_type in {fetcher.SYNC_WORD, fetcher.SYNC_LINE}
                    and len(candidate.lines) >= 2
                ),
                None,
            )
            if result is None:
                records.append({"track": relative, "status": "not-found", **metadata})
                print(f"[{index}/{len(audio_files)}] NOT FOUND      {relative}", flush=True)
                write_report(args.report, records)
                time.sleep(args.pause)
                continue

            extension, payload = fetcher.save_payload(result)
            # Keep the provider's original master payload and extension. Do
            # not convert TTML/QRC to ELRC/LRC or synthesize a replacement.
            output_path = audio.with_suffix(extension)
            atomic_write_text(output_path, payload)
            created = [output_path.name]
            timing = extension.removeprefix(".")

            record = {
                "track": relative,
                "status": "fetched",
                **metadata,
                "provider": result.provider,
                "source": result.source,
                "sync_type": result.sync_type,
                "lines": len(result.lines),
                "timed_units": result.timed_units,
                "timing_mode": timing,
                "created": created,
            }
            records.append(record)
            print(
                f"[{index}/{len(audio_files)}] SAVED          {', '.join(created)} "
                f"({result.source}, {result.sync_type}, {len(result.lines)} lines)",
                flush=True,
            )
        except Exception as exc:
            records.append({"track": relative, "status": "error", **metadata, "error": repr(exc)})
            print(f"[{index}/{len(audio_files)}] ERROR          {relative}: {exc}", flush=True)

        write_report(args.report, records)
        time.sleep(args.pause)

    write_report(args.report, records)
    summary: dict[str, int] = {}
    for record in records:
        summary[record["status"]] = summary.get(record["status"], 0) + 1
    print("Summary: " + ", ".join(f"{key}={value}" for key, value in sorted(summary.items())), flush=True)
    return 0 if not any(record["status"] == "error" for record in records) else 1


if __name__ == "__main__":
    raise SystemExit(main())
