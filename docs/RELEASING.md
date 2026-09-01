# Releasing Jellyfin LyricMotion

Set `VERSION` first, then build the four platform archives and their checksums:

```bash
python3 scripts/package_release.py --version "$(cat VERSION)" --platform all --output-dir dist
```

Verify every ZIP and checksum before publishing:

```bash
for zip in dist/*.zip; do unzip -t "$zip"; done
for sum in dist/*.zip.sha256; do (cd dist && sha256sum -c "$(basename "$sum")"); done
```

Create and push an annotated `v<VERSION>` tag only if it does not already exist. Never move a published tag. Create a GitHub Release for that tag and upload exactly these files:

- Windows, Linux, macOS, and Docker ZIPs;
- the matching four `.sha256` files.

Release ZIPs are strict allowlists: do not add repository docs, examples, CI metadata, or release tooling.
