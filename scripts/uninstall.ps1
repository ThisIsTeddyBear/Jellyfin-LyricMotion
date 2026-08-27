#Requires -Version 5.1
[CmdletBinding()]
param(
    [string]$WebDir,
    [switch]$EnsureAdministrator,
    [switch]$KeepBackups
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
    if ($KeepBackups) {
        $arguments += "-KeepBackups"
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
    return Test-Path -LiteralPath (Join-Path $Path "index.html") -PathType Leaf
}

function Find-JellyfinWebDir([string]$Requested) {
    if (-not [string]::IsNullOrWhiteSpace($Requested)) {
        if (Test-WebDir $Requested) { return (Resolve-Path -LiteralPath $Requested).Path }
        throw "The supplied -WebDir is not a Jellyfin Web directory: $Requested"
    }
    if (Test-WebDir $env:JELLYFIN_WEB_DIR) { return (Resolve-Path -LiteralPath $env:JELLYFIN_WEB_DIR).Path }

    foreach ($registryPath in @(
        "HKLM:\SOFTWARE\WOW6432Node\Jellyfin\Server",
        "HKLM:\SOFTWARE\Jellyfin\Server"
    )) {
        try {
            $props = Get-ItemProperty -Path $registryPath -ErrorAction Stop
            if ($props.InstallFolder) {
                $candidate = Join-Path $props.InstallFolder "jellyfin-web"
                if (Test-WebDir $candidate) { return (Resolve-Path -LiteralPath $candidate).Path }
            }
        } catch {}
    }

    foreach ($candidate in @(
        "$env:ProgramFiles\Jellyfin\Server\jellyfin-web",
        "${env:ProgramFiles(x86)}\Jellyfin\Server\jellyfin-web"
    )) {
        if (Test-WebDir $candidate) { return (Resolve-Path -LiteralPath $candidate).Path }
    }

    throw "Could not locate Jellyfin Web. Pass -WebDir explicitly."
}


function Commit-AtomicReplacement([string]$Temporary, [string]$Destination) {
    if (-not (Test-Path -LiteralPath $Destination)) {
        Move-Item -LiteralPath $Temporary -Destination $Destination
        return
    }

    $directory = Split-Path -Parent $Destination
    $leaf = Split-Path -Leaf $Destination
    $replaceBackup = Join-Path $directory ('.' + $leaf + '.' + [Guid]::NewGuid().ToString('N') + '.replace.bak')

    try {
        # Do not fall back to a direct copy over index.html: an interrupted
        # non-atomic write can leave Jellyfin without a usable web entrypoint.
        [IO.File]::Replace($Temporary, $Destination, $replaceBackup, $true)
    } finally {
        Remove-Item -LiteralPath $replaceBackup -Force -ErrorAction SilentlyContinue
    }
}

function Write-AtomicUtf8([string]$Path, [string]$Content) {
    $directory = Split-Path -Parent $Path
    $leaf = Split-Path -Leaf $Path
    $temporary = Join-Path $directory ('.' + $leaf + '.' + [Guid]::NewGuid().ToString('N') + '.tmp')
    $Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    try {
        [IO.File]::WriteAllText($temporary, $Content, $Utf8NoBom)
        Commit-AtomicReplacement $temporary $Path
    } finally {
        if (Test-Path -LiteralPath $temporary) {
            Remove-Item -LiteralPath $temporary -Force -ErrorAction SilentlyContinue
        }
    }
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

Write-AtomicUtf8 $IndexPath $content

Remove-Item -LiteralPath (Join-Path $WebDir "jellyfin-lyric-motion.js") -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $WebDir "jellyfin-lyric-motion.css") -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $WebDir "jellyfin-lyric-romanizer.js") -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $WebDir "jellyfin-lyric-romanization-sources.js") -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $WebDir "apple-karaoke.js") -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $WebDir "apple-karaoke.css") -Force -ErrorAction SilentlyContinue

if (-not $KeepBackups) {
    Remove-Item -LiteralPath (Join-Path $WebDir "index.html.before-jellyfin-lyric-motion") -Force -ErrorAction SilentlyContinue
    Get-ChildItem -LiteralPath $WebDir -Filter "index.html.before-jellyfin-lyric-motion-*" -File -ErrorAction SilentlyContinue |
        Remove-Item -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Jellyfin LyricMotion removed." -ForegroundColor Green
Write-Host "Hard-refresh Jellyfin Web."
Write-Host ""

if ($EnsureAdministrator) {
    [void](Read-Host "Press Enter to close")
}
