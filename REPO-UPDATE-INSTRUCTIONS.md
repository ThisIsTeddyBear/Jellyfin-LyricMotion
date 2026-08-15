# Repository Replacement Bundle

This bundle is intended to be copied over the root of a local clone of:

```text
https://github.com/ThisIsTeddyBear/Jellyfin-LyricMotion
```

It contains the optimized Jellyfin LyricMotion `3.2.0` / LyricG2P `6.5.1` source tree plus repository-only CI/release metadata and refreshed documentation.

## Safe application method

From the parent directory of your local Git clone, extract this bundle somewhere temporary. Then from the repository root use `rsync` so Git metadata is never touched:

```bash
rsync -a --delete \
  --exclude='.git/' \
  /path/to/extracted/Jellyfin-LyricMotion-repo-v3.2.0/ \
  ./
```

If you have repository-only files that are intentionally not present in this replacement bundle, omit `--delete` on the first pass and inspect the diff before removing anything.

Then inspect:

```bash
git status --short
git diff --stat
git diff
```

Run validation before committing:

```bash
sh scripts/test-all.sh
```

See `docs/RELEASING.md` for commit/tag/release steps.
