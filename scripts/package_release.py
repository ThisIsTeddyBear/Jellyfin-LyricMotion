#!/usr/bin/env python3
"""Build deterministic, platform-specific Jellyfin LyricMotion release ZIPs."""

from __future__ import annotations

import argparse
import hashlib
from pathlib import Path
import zipfile


ROOT = Path(__file__).resolve().parent.parent
FIXED_TIME = (1980, 1, 1, 0, 0, 0)
WINDOWS_TEXT_SUFFIXES = {".cmd", ".ps1"}

COMMON_SOURCE_FILES = (
    "VERSION",
    "LYRICG2P_VERSION",
    "LICENSE",
    "THIRD_PARTY_NOTICES.md",
    "licenses/DYNAMIC-BACKGROUND-MIT.txt",
    "licenses/KAWARP-MIT.txt",
    "src/jellyfin-lyric-motion.js",
    "src/jellyfin-lyric-motion.css",
    "src/jellyfin-lyric-romanizer.js",
)

PLATFORM_FILES = {
    "windows": (
        "INSTALL-WINDOWS.cmd",
        "UNINSTALL-WINDOWS.cmd",
        "scripts/install.ps1",
        "scripts/uninstall.ps1",
    ),
    "linux": (
        "scripts/install.sh",
        "scripts/uninstall.sh",
    ),
    "macos": (
        "scripts/install.sh",
        "scripts/uninstall.sh",
    ),
    "docker": (
        "docker/Dockerfile",
    ),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--version", required=True, help="application version from VERSION")
    parser.add_argument(
        "--platform",
        default="all",
        choices=("all", *PLATFORM_FILES.keys()),
        help="release target to build; default: all",
    )
    parser.add_argument("--output-dir", default="dist", help="directory for ZIPs and checksums")
    return parser.parse_args()


def validate_version(requested: str) -> None:
    expected = (ROOT / "VERSION").read_text(encoding="utf-8").strip()
    if requested != expected:
        raise SystemExit(
            f"requested version {requested!r} does not match VERSION {expected!r}"
        )


def release_bytes(source: Path) -> bytes:
    data = source.read_bytes()
    try:
        text = data.decode("utf-8-sig")
    except UnicodeDecodeError:
        return data
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    newline = "\r\n" if source.suffix.lower() in WINDOWS_TEXT_SUFFIXES else "\n"
    return text.replace("\n", newline).encode("utf-8")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def expected_files(platform: str) -> tuple[str, ...]:
    return tuple(sorted(("README.md", *COMMON_SOURCE_FILES, *PLATFORM_FILES[platform])))


def platform_readme(platform: str, version: str, lyricg2p_version: str) -> bytes:
    common = (
        f"# Jellyfin LyricMotion v{version}\n\n"
        f"LyricG2P: {lyricg2p_version}\n\n"
        "This is a minimal platform-specific release archive. Repository tests, "
        "research, benchmarks, development documentation, examples, CI files, and "
        "release tooling are intentionally not included.\n\n"
    )
    instructions = {
        "windows": (
            "## Windows\n\n"
            "Double-click `INSTALL-WINDOWS.cmd`, or run `scripts/install.ps1` from "
            "PowerShell. To uninstall, run `UNINSTALL-WINDOWS.cmd` or "
            "`scripts/uninstall.ps1`.\n"
        ),
        "linux": (
            "## Linux\n\n"
            "Run:\n\n```sh\nchmod +x scripts/install.sh scripts/uninstall.sh\n"
            "sudo ./scripts/install.sh\n```\n\n"
            "To uninstall: `sudo ./scripts/uninstall.sh`.\n"
        ),
        "macos": (
            "## macOS\n\n"
            "Run:\n\n```sh\nchmod +x scripts/install.sh scripts/uninstall.sh\n"
            "sudo ./scripts/install.sh\n```\n\n"
            "The installer checks the standard Jellyfin.app web directory. For a "
            "custom location use `--webdir /path/to/jellyfin-web`.\n\n"
            "To uninstall: `sudo ./scripts/uninstall.sh`.\n"
        ),
        "docker": (
            "## Docker\n\n"
            "Build the derived image from this extracted directory:\n\n```sh\n"
            "docker build --build-arg JELLYFIN_TAG=10.11.11 -f docker/Dockerfile "
            "-t jellyfin-lyric-motion:10.11.11 .\n```\n"
        ),
    }
    return (common + instructions[platform]).encode("utf-8")


def add_file(zf: zipfile.ZipFile, source: Path, arcname: str) -> None:
    info = zipfile.ZipInfo(arcname, date_time=FIXED_TIME)
    info.create_system = 3
    info.external_attr = (
        (0o755 if source.suffix.lower() == ".sh" else 0o644) & 0xFFFF
    ) << 16
    info.compress_type = zipfile.ZIP_DEFLATED
    zf.writestr(
        info,
        release_bytes(source),
        compress_type=zipfile.ZIP_DEFLATED,
        compresslevel=9,
    )


def build_platform(platform: str, version: str, output_dir: Path) -> tuple[Path, Path]:
    files = expected_files(platform)
    source_files = tuple(sorted((*COMMON_SOURCE_FILES, *PLATFORM_FILES[platform])))
    missing = [relative for relative in source_files if not (ROOT / relative).is_file()]
    if missing:
        raise SystemExit(
            f"{platform}: missing required release files: " + ", ".join(missing)
        )

    package_name = f"jellyfin-lyric-motion-v{version}-{platform}"
    archive = output_dir / f"{package_name}.zip"
    checksum = output_dir / f"{package_name}.zip.sha256"
    archive.unlink(missing_ok=True)
    checksum.unlink(missing_ok=True)

    lyricg2p_version = (ROOT / "LYRICG2P_VERSION").read_text(encoding="utf-8").strip()

    with zipfile.ZipFile(archive, "w") as zf:
        for relative in files:
            arcname = f"{package_name}/{relative}"
            if relative == "README.md":
                info = zipfile.ZipInfo(arcname, date_time=FIXED_TIME)
                info.create_system = 3
                info.external_attr = (0o644 & 0xFFFF) << 16
                info.compress_type = zipfile.ZIP_DEFLATED
                zf.writestr(
                    info,
                    platform_readme(platform, version, lyricg2p_version),
                    compress_type=zipfile.ZIP_DEFLATED,
                    compresslevel=9,
                )
                continue
            source = ROOT / relative
            add_file(zf, source, arcname)

    digest = sha256(archive)
    checksum.write_text(
        f"{digest}  {archive.name}\n",
        encoding="ascii",
        newline="\n",
    )

    with zipfile.ZipFile(archive) as zf:
        bad = zf.testzip()
        if bad is not None:
            raise SystemExit(f"{platform}: corrupt ZIP member: {bad}")
        actual = tuple(
            name.removeprefix(f"{package_name}/")
            for name in zf.namelist()
        )
        if actual != files:
            raise SystemExit(
                f"{platform}: release manifest mismatch\nexpected={files!r}\nactual={actual!r}"
            )

    print(f"{platform:7} {archive.name} ({len(files)} files) sha256={digest}")
    return archive, checksum


def main() -> int:
    args = parse_args()
    validate_version(args.version)
    output_dir = (ROOT / args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    platforms = PLATFORM_FILES.keys() if args.platform == "all" else (args.platform,)
    for platform in platforms:
        build_platform(platform, args.version, output_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
