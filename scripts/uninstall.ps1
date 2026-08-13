#Requires -Version 5.1
[CmdletBinding()]
param(
    [string]$WebDir,
    [switch]$EnsureAdministrator
)

$ErrorActionPreference = "Stop"

trap {
    Write-Host ""
    Write-Host ("LyricMotion uninstall failed: " + $_.Exception.Message) -ForegroundColor Red
    if ($EnsureAdministrator) {
        [void](Read-Host "Press Enter to close")
    }
    exit 1
}

function Test-IsAdministrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole(
        [Security.Principal.WindowsBuiltInRole]::Administrator
    )
}

if ($EnsureAdministrator -and -not (Test-IsAdministrator)) {
    Write-Host "Requesting Administrator access for Jellyfin Web..." -ForegroundColor Yellow

    $arguments = @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", ('"' + $PSCommandPath + '"'),
        "-EnsureAdministrator"
    )

    if (-not [string]::IsNullOrWhiteSpace($WebDir)) {
        $arguments += @("-WebDir", ('"' + $WebDir + '"'))
    }

    $process = Start-Process `
        -FilePath "powershell.exe" `
        -ArgumentList ($arguments -join " ") `
        -Verb RunAs `
        -Wait `
        -PassThru

    exit $process.ExitCode
}

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

    throw "Could not locate Jellyfin Web. Pass -WebDir explicitly."
}

$WebDir = Find-JellyfinWebDir $WebDir
$IndexPath = Join-Path $WebDir "index.html"
$content = [IO.File]::ReadAllText($IndexPath)

foreach ($pattern in @(
    '(?is)<link\b[^>]*href=["''][^"'']*(?:jellyfin-lyric-motion|apple-karaoke)\.css(?:\?[^"'']*)?["''][^>]*>',
    '(?is)<script\b[^>]*src=["''][^"'']*(?:jellyfin-lyric-motion|apple-karaoke)\.js(?:\?[^"'']*)?["''][^>]*>\s*</script>'
)) {
    $content = [regex]::Replace($content, $pattern, "")
}

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText($IndexPath, $content, $Utf8NoBom)

Remove-Item (Join-Path $WebDir "jellyfin-lyric-motion.js") -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $WebDir "jellyfin-lyric-motion.css") -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $WebDir "apple-karaoke.js") -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $WebDir "apple-karaoke.css") -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Jellyfin LyricMotion removed." -ForegroundColor Green
Write-Host "Hard-refresh Jellyfin Web."
Write-Host ""

if ($EnsureAdministrator) {
    [void](Read-Host "Press Enter to close")
}
