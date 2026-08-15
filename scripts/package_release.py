#!/usr/bin/env python3
"""Create a deterministic Jellyfin LyricMotion release ZIP."""
from __future__ import annotations
import argparse
import hashlib
import os
from pathlib import Path
import zipfile

EXCLUDED_DIRS = {'.git', '.github', '__pycache__', '.pytest_cache', '.mypy_cache', 'node_modules'}
EXCLUDED_SUFFIXES = {'.pyc', '.pyo', '.tmp'}
FORBIDDEN_RELEASE_SUFFIXES = {'.onnx', '.pt', '.pth', '.bin'}
FIXED_TIME = (2026, 8, 15, 0, 0, 0)
REPO_ONLY_FILES = {'.gitignore', 'GITHUB-RELEASE.md', 'REPO-UPDATE-INSTRUCTIONS.md', 'REPO-BUNDLE-MANIFEST.txt'}
REPO_ONLY_PATHS = {'docs/RELEASING.md'}

def should_include(path: Path, root: Path, output: Path) -> bool:
    if path == output:
        return False
    rel = path.relative_to(root)
    if any(part in EXCLUDED_DIRS for part in rel.parts):
        return False
    if rel.as_posix() in REPO_ONLY_PATHS or path.name in REPO_ONLY_FILES:
        return False
    if path.suffix.lower() in EXCLUDED_SUFFIXES:
        return False
    if path.name in {'.DS_Store'}:
        return False
    return path.is_file() and not path.is_symlink()

def add_file(zf: zipfile.ZipFile, path: Path, arcname: str) -> None:
    data = path.read_bytes()
    info = zipfile.ZipInfo(arcname, FIXED_TIME)
    mode = path.stat().st_mode
    info.external_attr = ((0o755 if mode & 0o111 else 0o644) & 0xFFFF) << 16
    info.compress_type = zipfile.ZIP_DEFLATED
    info.create_system = 3
    zf.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--version', required=True)
    ap.add_argument('--output', default='')
    args = ap.parse_args()
    root = Path(__file__).resolve().parent.parent
    version = (root / 'VERSION').read_text(encoding='utf-8').strip()
    if version != args.version:
        raise SystemExit(f'Version mismatch: VERSION={version!r}, requested={args.version!r}')
    output = Path(args.output).resolve() if args.output else (root.parent / f'jellyfin-lyric-motion-v{version}.zip').resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    forbidden = sorted(
        p.relative_to(root).as_posix()
        for p in root.rglob('*')
        if p.is_file() and p.suffix.lower() in FORBIDDEN_RELEASE_SUFFIXES
    )
    if forbidden:
        raise SystemExit(
            'Refusing to package external model/binary artifacts: ' + ', '.join(forbidden)
        )
    prefix = f'jellyfin-lyric-motion-v{version}'
    paths = sorted(p for p in root.rglob('*') if should_include(p, root, output))
    with zipfile.ZipFile(output, 'w') as zf:
        for path in paths:
            arc = f'{prefix}/{path.relative_to(root).as_posix()}'
            add_file(zf, path, arc)
    digest = hashlib.sha256(output.read_bytes()).hexdigest()
    checksum_path = Path(str(output) + '.sha256')
    checksum_path.write_text(f'{digest}  {output.name}\n', encoding='ascii')
    print(f'Created: {output}')
    print(f'Files: {len(paths)}')
    print(f'SHA256: {digest}')
    print(f'Checksum: {checksum_path}')

if __name__ == '__main__':
    main()
