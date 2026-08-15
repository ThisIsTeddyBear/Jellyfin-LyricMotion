#Requires -Version 5.1
[CmdletBinding()]
param(
    [string]$WebDir,
    [switch]$EnsureAdministrator
)

$ErrorActionPreference = "Stop"

trap {
    Write-Host ""
    Write-Host ("LyricMotion installation failed: " + $_.Exception.Message) -ForegroundColor Red
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
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $Here
$VersionPath = Join-Path $Root "VERSION"
if (-not (Test-Path $VersionPath)) { throw "Missing $VersionPath" }
$Version = ([IO.File]::ReadAllText($VersionPath)).Trim()
$LyricG2PVersionPath = Join-Path $Root "LYRICG2P_VERSION"
if (-not (Test-Path $LyricG2PVersionPath)) { throw "Missing $LyricG2PVersionPath" }
$LyricG2PVersion = ([IO.File]::ReadAllText($LyricG2PVersionPath)).Trim()
if ([string]::IsNullOrWhiteSpace($Version)) { throw "VERSION is empty" }
if ($Version -notmatch '^[A-Za-z0-9._+\-]+$') { throw "VERSION contains unsafe characters" }
if ([string]::IsNullOrWhiteSpace($LyricG2PVersion)) { throw "LYRICG2P_VERSION is empty" }
if ($LyricG2PVersion -notmatch '^[A-Za-z0-9._+\-]+$') { throw "LYRICG2P_VERSION contains unsafe characters" }
$JsSource = Join-Path $Root "src\jellyfin-lyric-motion.js"
$CssSource = Join-Path $Root "src\jellyfin-lyric-motion.css"
$RomanizerSource = Join-Path $Root "src\jellyfin-lyric-romanizer.js"

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


function Commit-AtomicReplacement([string]$Temporary, [string]$Destination) {
    if (-not (Test-Path -LiteralPath $Destination)) {
        Move-Item -LiteralPath $Temporary -Destination $Destination
        return
    }

    $directory = Split-Path -Parent $Destination
    $leaf = Split-Path -Leaf $Destination
    $replaceBackup = Join-Path $directory ('.' + $leaf + '.' + [Guid]::NewGuid().ToString('N') + '.replace.bak')

    try {
        try {
            # Windows PowerShell 5.1/.NET Framework can reject $null here with
            # "The path is not of a legal form." Use a real transient backup.
            [IO.File]::Replace($Temporary, $Destination, $replaceBackup, $true)
        } catch [System.ArgumentException] {
            Copy-Item -LiteralPath $Temporary -Destination $Destination -Force
            Remove-Item -LiteralPath $Temporary -Force
        } catch [System.IO.IOException] {
            Copy-Item -LiteralPath $Temporary -Destination $Destination -Force
            Remove-Item -LiteralPath $Temporary -Force
        } catch [System.NotSupportedException] {
            Copy-Item -LiteralPath $Temporary -Destination $Destination -Force
            Remove-Item -LiteralPath $Temporary -Force
        }
    } finally {
        Remove-Item -LiteralPath $replaceBackup -Force -ErrorAction SilentlyContinue
    }
}

function Stage-AtomicFile([string]$Source, [string]$Destination) {
    $directory = Split-Path -Parent $Destination
    $leaf = Split-Path -Leaf $Destination
    $temporary = Join-Path $directory ('.' + $leaf + '.' + [Guid]::NewGuid().ToString('N') + '.tmp')
    try {
        Copy-Item -LiteralPath $Source -Destination $temporary -Force
        return $temporary
    } catch {
        Remove-Item -LiteralPath $temporary -Force -ErrorAction SilentlyContinue
        throw
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
if (-not (Test-Path $RomanizerSource)) { throw "Missing $RomanizerSource" }

Write-Host ""
Write-Host "Jellyfin LyricMotion v$Version / LyricG2P $LyricG2PVersion" -ForegroundColor Cyan
Write-Host "Web directory: $WebDir"

$content = Remove-LyricMotionTags ([IO.File]::ReadAllText($IndexPath))
$runtime = [regex]::Match(
    $content,
    '(?is)<script\b[^>]*src=["''][^"'']*runtime\.bundle\.js(?:\?[^"'']*)?["''][^>]*>'
)

if (-not $runtime.Success) {
    throw "runtime.bundle.js was not found. Jellyfin Web was not modified."
}

$inject = '<link rel="stylesheet" href="jellyfin-lyric-motion.css?v=' + $Version + '"><script defer="defer" src="jellyfin-lyric-motion.js?v=' + $Version + '&g2p=' + $LyricG2PVersion + '"></script>'
$content = $content.Insert($runtime.Index, $inject)

$BackupName = "index.html.before-jellyfin-lyric-motion-" + (Get-Date -Format "yyyyMMdd-HHmmss-fff")
$BackupPath = Join-Path $WebDir $BackupName
$BackupSuffix = 1
while (Test-Path -LiteralPath $BackupPath) {
    $BackupPath = Join-Path $WebDir ($BackupName + "-" + $BackupSuffix)
    $BackupSuffix++
}
Copy-Item $IndexPath $BackupPath -Force

# Stage all three assets before replacing any live file. A copy/disk failure
# therefore leaves an existing installation untouched. Each final commit is a
# same-directory atomic replacement.
$JsDestination = Join-Path $WebDir "jellyfin-lyric-motion.js"
$CssDestination = Join-Path $WebDir "jellyfin-lyric-motion.css"
$RomanizerDestination = Join-Path $WebDir "jellyfin-lyric-romanizer.js"
$JsTemporary = $null
$CssTemporary = $null
$RomanizerTemporary = $null
try {
    $JsTemporary = Stage-AtomicFile $JsSource $JsDestination
    $CssTemporary = Stage-AtomicFile $CssSource $CssDestination
    $RomanizerTemporary = Stage-AtomicFile $RomanizerSource $RomanizerDestination

    Commit-AtomicReplacement $JsTemporary $JsDestination
    $JsTemporary = $null
    Commit-AtomicReplacement $CssTemporary $CssDestination
    $CssTemporary = $null
    Commit-AtomicReplacement $RomanizerTemporary $RomanizerDestination
    $RomanizerTemporary = $null
} finally {
    foreach ($temporary in @($JsTemporary, $CssTemporary, $RomanizerTemporary)) {
        if ($temporary -and (Test-Path -LiteralPath $temporary)) {
            Remove-Item -LiteralPath $temporary -Force -ErrorAction SilentlyContinue
        }
    }
}

# Commit the HTML injection last using a same-directory atomic replacement so
# an interrupted write cannot leave Jellyfin's index.html half-written.
Write-AtomicUtf8 $IndexPath $content
Remove-Item (Join-Path $WebDir "apple-karaoke.js") -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $WebDir "apple-karaoke.css") -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Installed successfully." -ForegroundColor Green
Write-Host "Backup: $BackupPath"
Write-Host "Hard-refresh Jellyfin Web or use a private browser window."
Write-Host "After a Jellyfin upgrade, re-run this installer if the patch was replaced."
Write-Host ""

if ($EnsureAdministrator) {
    [void](Read-Host "Press Enter to close")
}
