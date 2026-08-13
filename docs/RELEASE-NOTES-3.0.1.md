# Jellyfin LyricMotion v3.0.1

This patch fixes the Windows launcher permissions regression in v3.0.0.

## Windows installer and uninstaller fix

`INSTALL-WINDOWS.cmd` and `UNINSTALL-WINDOWS.cmd` now request Administrator access through the normal Windows UAC prompt. This is required because standard Jellyfin installations keep `index.html` under `C:\Program Files`, where a non-elevated process cannot write.

The launchers now wait for the elevated PowerShell process, preserve its exit result, and keep the elevated window open long enough to show success or a readable failure.

Direct PowerShell use still works as before. When launching `scripts/install.ps1` or `scripts/uninstall.ps1` manually against a protected webroot, open the terminal as Administrator or pass `-EnsureAdministrator`.

## Why animations differ by device

- Desktop uses the full 60 fps geometry/per-glyph eligibility path.
- Android/mobile targets 30 fps and limits detailed motion to reduce thermal and paint cost.
- TV/webOS uses a gated 60 fps whole-word compositor path with opacity-only line transitions and Jellyfin-focus synchronization.

These profiles share timing and visual design, but deliberately use different rendering costs.

## Why connected scripts look different

The difference is based on writing system, not language. Latin text uses a spatial wipe and can use per-glyph motion. Devanagari, Gurmukhi, Malayalam, Arabic, and other joining scripts must remain one browser-shaped run: splitting or spatially clipping them can cut conjuncts, vowel marks, and joined letters. They therefore use atomic whole-word luminance, lower-intensity colored glow, and no word transform.

All v3.0.0 renderer, converter, overlap, background-vocal, TV, and script-safety features remain unchanged.
