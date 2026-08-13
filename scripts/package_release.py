#!/usr/bin/env python3
"""Build a deterministic Jellyfin LyricMotion release folder and ZIP."""

from __future__ import annotations

import argparse
import hashlib
import shutil
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist" / "local-testing"

RELEASE_PATHS = (
    "VERSION",
    "README.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "LICENSE",
    "THIRD_PARTY_NOTICES.md",
    "INSTALL-WINDOWS.cmd",
    "UNINSTALL-WINDOWS.cmd",
    "src/jellyfin-lyric-motion.js",
    "src/jellyfin-lyric-motion.css",
    "scripts/install.ps1",
    "scripts/install.sh",
    "scripts/uninstall.ps1",
    "scripts/uninstall.sh",
    "scripts/ttml_to_elrc.py",
    "docker/Dockerfile",
    "docs/INSTALLATION-ARCHITECTURE.md",
    "docs/TTML-CONVERSION.md",
    "docs/TV-VALIDATION.md",
    "docs/screenshots/classic-bloom-atmosphere.png",
    "docs/screenshots/overlap-background-vocals.png",
    "docs/screenshots/script-safe-tv.png",
    "examples/ELRC-EXAMPLE.txt",
)

WINDOWS_TEXT_SUFFIXES = {".cmd", ".ps1"}
BINARY_SUFFIXES = {".png"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--version", required=True, help="semantic version")
    return parser.parse_args()


def validate_version(version: str) -> None:
    expected = (ROOT / "VERSION").read_text(encoding="utf-8").strip()
    if version != expected:
        raise SystemExit(f"requested version {version!r} does not match VERSION {expected!r}")


def release_bytes(source: Path) -> bytes:
    data = source.read_bytes()
    if source.suffix.lower() in BINARY_SUFFIXES:
        return data

    text = data.decode("utf-8-sig").replace("\r\n", "\n").replace("\r", "\n")
    newline = "\r\n" if source.suffix.lower() in WINDOWS_TEXT_SUFFIXES else "\n"
    return text.replace("\n", newline).encode("utf-8")


def copy_release_tree(target: Path, version: str) -> list[Path]:
    copied: list[Path] = []
    release_paths = RELEASE_PATHS + (f"docs/RELEASE-NOTES-{version}.md",)
    for relative_name in release_paths:
        source = ROOT / relative_name
        if not source.is_file():
            raise SystemExit(f"missing release file: {relative_name}")
        destination = target / relative_name
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(release_bytes(source))
        destination.chmod(source.stat().st_mode)
        copied.append(destination)
    return copied


def write_deterministic_zip(folder: Path, archive: Path, files: list[Path]) -> None:
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as output:
        for source in sorted(
            files,
            key=lambda path: path.relative_to(folder.parent).as_posix(),
        ):
            relative = source.relative_to(folder.parent).as_posix()
            info = zipfile.ZipInfo(relative, date_time=(1980, 1, 1, 0, 0, 0))
            # Pin Unix ZIP metadata so Windows and Linux builds are identical.
            info.create_system = 3
            executable = source.suffix == ".sh"
            info.external_attr = ((0o755 if executable else 0o644) & 0xFFFF) << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            output.writestr(info, source.read_bytes())


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest().upper()


def main() -> int:
    args = parse_args()
    validate_version(args.version)

    folder = DIST / f"jellyfin-lyric-motion-v{args.version}"
    archive = DIST / f"jellyfin-lyric-motion-v{args.version}.zip"
    checksum = DIST / f"jellyfin-lyric-motion-v{args.version}.zip.sha256"

    if folder.exists():
        shutil.rmtree(folder)
    archive.unlink(missing_ok=True)
    checksum.unlink(missing_ok=True)
    folder.mkdir(parents=True, exist_ok=True)

    files = copy_release_tree(folder, args.version)
    write_deterministic_zip(folder, archive, files)
    checksum.write_text(
        f"{sha256(archive)}  {archive.name}\n",
        encoding="ascii",
        newline="\n",
    )

    print(f"Release folder: {folder}")
    print(f"Release ZIP:    {archive}")
    print(f"SHA-256:       {sha256(archive)}")
    print(f"Files:         {len(files)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
