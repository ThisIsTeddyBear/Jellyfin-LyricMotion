#Requires -Version 5.1
[CmdletBinding()]
param([string]$WebDir)

$ErrorActionPreference = "Stop"
$Version = "2.0.0"
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $Here
$JsSource = Join-Path $Root "src\jellyfin-lyric-motion.js"
$CssSource = Join-Path $Root "src\jellyfin-lyric-motion.css"

function Test-WebDir([string]$Path) {
    if ([string]::IsNullOrWhiteSpace($Path)) { return $false }
    return Test-Path (Join-Path $Path "index.html")
}

function Find-JellyfinWebDir([string]$Requested) {
    if (Test-WebDir $Requested) { return (Resolve-Path $Requested).Path }
    if (Test-WebDir $env:JELLYFIN_WEB_DIR) { return (Resolve-Path $env:JELLYFIN_WEB_DIR).Path }

    foreach ($registryPath in @(
        "HKLM:\SOFTWARE\WOW6432Node\Jellyfin\Server",
        "HKLM:\SOFTWARE\Jellyfin\Server"
    )) {
        try {
            $props = Get-ItemProperty -Path $registryPath -ErrorAction Stop
            if ($props.InstallFolder) {
                $candidate = Join-Path $props.InstallFolder "jellyfin-web"
                if (Test-WebDir $candidate) { return (Resolve-Path $candidate).Path }
            }
        } catch {}
    }

    foreach ($candidate in @(
        "$env:ProgramFiles\Jellyfin\Server\jellyfin-web",
        "${env:ProgramFiles(x86)}\Jellyfin\Server\jellyfin-web"
    )) {
        if (Test-WebDir $candidate) { return (Resolve-Path $candidate).Path }
    }

    throw @"
Could not locate Jellyfin Web.

Run:
  .\scripts\install.ps1 -WebDir "C:\path\to\jellyfin-web"

Jellyfin also supports the JELLYFIN_WEB_DIR environment variable.
"@
}

function Remove-LyricMotionTags([string]$Content) {
    foreach ($pattern in @(
        '(?is)<link\b[^>]*href=["''][^"'']*(?:jellyfin-lyric-motion|apple-karaoke)\.css(?:\?[^"'']*)?["''][^>]*>',
        '(?is)<script\b[^>]*src=["''][^"'']*(?:jellyfin-lyric-motion|apple-karaoke)\.js(?:\?[^"'']*)?["''][^>]*>\s*</script>'
    )) {
        $Content = [regex]::Replace($Content, $pattern, "")
    }
    return $Content
}

$WebDir = Find-JellyfinWebDir $WebDir
$IndexPath = Join-Path $WebDir "index.html"

if (-not (Test-Path $JsSource)) { throw "Missing $JsSource" }
if (-not (Test-Path $CssSource)) { throw "Missing $CssSource" }

Write-Host ""
Write-Host "Jellyfin LyricMotion v$Version" -ForegroundColor Cyan
Write-Host "Web directory: $WebDir"

$BackupPath = Join-Path $WebDir ("index.html.before-jellyfin-lyric-motion-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
Copy-Item $IndexPath $BackupPath -Force

$content = Remove-LyricMotionTags ([IO.File]::ReadAllText($IndexPath))
$runtime = [regex]::Match($content, '(?is)<script\b[^>]*src=["'']runtime\.bundle\.js[^"'']*["''][^>]*>')

if (-not $runtime.Success) {
    throw "runtime.bundle.js was not found. Backup: $BackupPath"
}

$inject = '<link rel="stylesheet" href="jellyfin-lyric-motion.css?v=2.0.0"><script defer="defer" src="jellyfin-lyric-motion.js?v=2.0.0"></script>'
$content = $content.Insert($runtime.Index, $inject)

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText($IndexPath, $content, $Utf8NoBom)

Copy-Item $JsSource (Join-Path $WebDir "jellyfin-lyric-motion.js") -Force
Copy-Item $CssSource (Join-Path $WebDir "jellyfin-lyric-motion.css") -Force
Remove-Item (Join-Path $WebDir "apple-karaoke.js") -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $WebDir "apple-karaoke.css") -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Installed successfully." -ForegroundColor Green
Write-Host "Backup: $BackupPath"
Write-Host "Hard-refresh Jellyfin Web or use a private browser window."
Write-Host "After a Jellyfin upgrade, re-run this installer if the patch was replaced."
Write-Host ""
