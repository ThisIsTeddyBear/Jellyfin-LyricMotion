#!/usr/bin/env python3
"""Build deterministic, platform-specific Jellyfin LyricMotion release ZIPs."""

from __future__ import annotations

import argparse
import hashlib
import os
from pathlib import Path
import re
import shutil
import stat
import sys
import tempfile
import zipfile


ROOT = Path(__file__).resolve().parent.parent
FIXED_TIME = (1980, 1, 1, 0, 0, 0)
WINDOWS_TEXT_SUFFIXES = {".cmd", ".ps1"}
SAFE_VERSION_RE = re.compile(r"^[A-Za-z0-9._+-]+$")
RUNTIME_VERSION_RE = re.compile(
    r"\bconst\s+VERSION\s*=\s*['\"]([^'\"]+)['\"]\s*;"
)

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
    expected = read_safe_identifier("VERSION")
    validate_safe_identifier("--version", requested)
    if requested != expected:
        raise SystemExit(
            f"requested version {requested!r} does not match VERSION {expected!r}"
        )
    validate_runtime_asset_versions(expected)


def validate_safe_identifier(label: str, value: str) -> str:
    """Reject values that could alter a release path or injected URL."""

    if not SAFE_VERSION_RE.fullmatch(value):
        raise SystemExit(f"{label} contains unsafe characters")
    return value


def read_safe_identifier(relative: str) -> str:
    path = ROOT / relative
    try:
        value = path.read_text(encoding="utf-8").strip()
    except OSError as exc:
        raise SystemExit(f"could not read {relative}: {exc}") from exc
    return validate_safe_identifier(relative, value)


def validate_runtime_asset_versions(version: str) -> None:
    """Keep cache-busting metadata aligned with the shipped source assets."""

    for relative, expected in (
        ("src/jellyfin-lyric-motion.js", version),
        ("src/jellyfin-lyric-romanizer.js", read_safe_identifier("LYRICG2P_VERSION")),
    ):
        try:
            source = (ROOT / relative).read_text(encoding="utf-8")
        except OSError as exc:
            raise SystemExit(f"could not read {relative}: {exc}") from exc

        match = RUNTIME_VERSION_RE.search(source)
        actual = match.group(1) if match else ""
        if actual != expected:
            raise SystemExit(
                f"{relative} VERSION {actual!r} does not match expected {expected!r}"
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


def stage_path(directory: Path, *, prefix: str, suffix: str) -> Path:
    """Reserve a same-directory temporary path for an atomic replacement."""

    descriptor, raw_path = tempfile.mkstemp(
        prefix=prefix,
        suffix=suffix,
        dir=directory,
    )
    os.close(descriptor)
    return Path(raw_path)


def fsync_file(path: Path) -> None:
    # Windows requires a writable descriptor for FlushFileBuffers/fsync even
    # when the file has already been closed after writing.
    with path.open("r+b") as stream:
        os.fsync(stream.fileno())


def write_checksum(path: Path, digest: str, archive_name: str) -> None:
    with path.open("w", encoding="ascii", newline="\n") as handle:
        handle.write(f"{digest}  {archive_name}\n")
        handle.flush()
        os.fsync(handle.fileno())


def verify_archive(
    archive: Path,
    *,
    platform: str,
    package_name: str,
    files: tuple[str, ...],
) -> None:
    with zipfile.ZipFile(archive) as zf:
        bad = zf.testzip()
        if bad is not None:
            raise SystemExit(f"{platform}: corrupt ZIP member: {bad}")
        prefix = f"{package_name}/"
        actual = tuple(
            name[len(prefix):] if name.startswith(prefix) else name
            for name in zf.namelist()
        )
        if actual != files:
            raise SystemExit(
                f"{platform}: release manifest mismatch\nexpected={files!r}\nactual={actual!r}"
            )


def stage_existing_copy(path: Path) -> Path | None:
    """Snapshot an existing artifact so a failed paired publish can roll back."""

    if not path.exists():
        return None

    backup = stage_path(
        path.parent,
        prefix=f".{path.name}.",
        suffix=".rollback",
    )
    try:
        shutil.copyfile(path, backup)
        # ``mkstemp`` creates the snapshot as 0600.  If checksum publication
        # later fails, this file is atomically put back in place; retain the
        # original artifact's mode instead of accidentally making a public
        # release readable only by the build account.
        os.chmod(backup, replacement_mode(path))
        fsync_file(backup)
    except OSError:
        backup.unlink(missing_ok=True)
        raise
    return backup


def cleanup_file(path: Path | None) -> None:
    if path is None:
        return
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass


def replacement_mode(path: Path) -> int:
    """Preserve an existing artifact's access bits; new releases are 0644."""

    try:
        return stat.S_IMODE(path.stat().st_mode)
    except FileNotFoundError:
        return 0o644


def build_platform(platform: str, version: str, output_dir: Path) -> tuple[Path, Path]:
    if platform not in PLATFORM_FILES:
        raise SystemExit(f"unsupported platform: {platform}")
    validate_safe_identifier("version", version)
    lyricg2p_version = read_safe_identifier("LYRICG2P_VERSION")

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

    staged_archive: Path | None = None
    staged_checksum: Path | None = None
    archive_rollback: Path | None = None

    try:
        staged_archive = stage_path(
            output_dir,
            prefix=f".{package_name}.",
            suffix=".zip.tmp",
        )
        staged_checksum = stage_path(
            output_dir,
            prefix=f".{package_name}.",
            suffix=".sha256.tmp",
        )
        with zipfile.ZipFile(staged_archive, "w") as zf:
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
                add_file(zf, ROOT / relative, arcname)

        fsync_file(staged_archive)
        os.chmod(staged_archive, replacement_mode(archive))
        verify_archive(
            staged_archive,
            platform=platform,
            package_name=package_name,
            files=files,
        )
        digest = sha256(staged_archive)
        write_checksum(staged_checksum, digest, archive.name)
        os.chmod(staged_checksum, replacement_mode(checksum))

        # Publish only fully built and verified artifacts. The rollback copy
        # keeps the old ZIP available if the checksum rename fails afterwards.
        archive_rollback = stage_existing_copy(archive)
        os.replace(staged_archive, archive)
        staged_archive = None
        try:
            os.replace(staged_checksum, checksum)
            staged_checksum = None
        except OSError as publish_error:
            try:
                if archive_rollback is None:
                    archive.unlink(missing_ok=True)
                else:
                    os.replace(archive_rollback, archive)
                    archive_rollback = None
            except OSError as rollback_error:
                raise SystemExit(
                    f"{platform}: checksum publish failed ({publish_error}); "
                    f"archive rollback also failed ({rollback_error})"
                ) from publish_error
            raise SystemExit(
                f"{platform}: could not publish checksum: {publish_error}"
            ) from publish_error
    except OSError as exc:
        raise SystemExit(f"{platform}: could not build release: {exc}") from exc
    finally:
        cleanup_file(staged_archive)
        cleanup_file(staged_checksum)
        cleanup_file(archive_rollback)

    print(f"{platform:7} {archive.name} ({len(files)} files) sha256={digest}")
    return archive, checksum


def main() -> int:
    if sys.version_info < (3, 8):
        raise SystemExit("Python 3.8 or newer is required")
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
