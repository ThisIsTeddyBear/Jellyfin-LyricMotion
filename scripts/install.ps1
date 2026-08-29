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
if (-not (Test-Path -LiteralPath $VersionPath -PathType Leaf)) { throw "Missing $VersionPath" }
$Version = ([IO.File]::ReadAllText($VersionPath)).Trim()
if ([string]::IsNullOrWhiteSpace($Version)) { throw "VERSION is empty" }
if ($Version -notmatch '^[A-Za-z0-9._+\-]+$') { throw "VERSION contains unsafe characters" }
$JsSource = Join-Path $Root "src\jellyfin-lyric-motion.js"
$CssSource = Join-Path $Root "src\jellyfin-lyric-motion.css"
$JsCacheKey = (Get-FileHash -Algorithm SHA256 -LiteralPath $JsSource).Hash.Substring(0, 12).ToLowerInvariant()
$CssCacheKey = (Get-FileHash -Algorithm SHA256 -LiteralPath $CssSource).Hash.Substring(0, 12).ToLowerInvariant()

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
        # Keep failure atomic. Copying directly over a live index can truncate
        # it on a full disk or interrupted write; callers retain the staged
        # source and rollback data when File.Replace is unavailable.
        [IO.File]::Replace($Temporary, $Destination, $replaceBackup, $true)
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

if (-not (Test-Path -LiteralPath $JsSource -PathType Leaf)) { throw "Missing $JsSource" }
if (-not (Test-Path -LiteralPath $CssSource -PathType Leaf)) { throw "Missing $CssSource" }
if (-not [regex]::IsMatch(
    [IO.File]::ReadAllText($JsSource),
    "const\s+VERSION\s*=\s*'" + [regex]::Escape($Version) + "'\s*;"
)) {
    throw "Runtime JavaScript VERSION does not match VERSION; refusing to install a mismatched release."
}

Write-Host ""
Write-Host "Jellyfin LyricMotion v$Version / Google Romanization" -ForegroundColor Cyan
Write-Host "Web directory: $WebDir"

$content = Remove-LyricMotionTags ([IO.File]::ReadAllText($IndexPath))
$runtime = [regex]::Match(
    $content,
    '(?is)<script\b[^>]*src=["''][^"'']*runtime\.bundle\.js(?:\?[^"'']*)?["''][^>]*>'
)

if (-not $runtime.Success) {
    throw "runtime.bundle.js was not found. Jellyfin Web was not modified."
}

$inject = '<link rel="stylesheet" href="jellyfin-lyric-motion.css?v=' + $Version + '&build=' + $CssCacheKey + '"><script defer="defer" src="jellyfin-lyric-motion.js?v=' + $Version + '&build=' + $JsCacheKey + '"></script>'
$content = $content.Insert($runtime.Index, $inject)

$BackupName = "index.html.before-jellyfin-lyric-motion-" + (Get-Date -Format "yyyyMMdd-HHmmss-fff")
$BackupPath = Join-Path $WebDir $BackupName
$BackupSuffix = 1
while (Test-Path -LiteralPath $BackupPath) {
    $BackupPath = Join-Path $WebDir ($BackupName + "-" + $BackupSuffix)
    $BackupSuffix++
}
Copy-Item -LiteralPath $IndexPath -Destination $BackupPath -Force

# Stage both assets before replacing any live file. The complete previous
# asset set is snapshotted as same-directory rollback files before commit. If
# any asset or index replacement fails, every live file is restored so Jellyfin
# never remains in a mixed-version LyricMotion state.
$JsDestination = Join-Path $WebDir "jellyfin-lyric-motion.js"
$CssDestination = Join-Path $WebDir "jellyfin-lyric-motion.css"
$JsTemporary = $null
$CssTemporary = $null
$RollbackEntries = @()

function New-RollbackEntry([string]$Destination) {
    if (-not (Test-Path -LiteralPath $Destination)) {
        return [pscustomobject]@{
            Destination = $Destination
            Existed = $false
            Backup = $null
        }
    }

    $directory = Split-Path -Parent $Destination
    $leaf = Split-Path -Leaf $Destination
    $backup = Join-Path $directory ('.' + $leaf + '.' + [Guid]::NewGuid().ToString('N') + '.rollback')
    Copy-Item -LiteralPath $Destination -Destination $backup -Force
    return [pscustomobject]@{
        Destination = $Destination
        Existed = $true
        Backup = $backup
    }
}

function Restore-RollbackEntries([object[]]$Entries) {
    for ($index = $Entries.Count - 1; $index -ge 0; $index--) {
        $entry = $Entries[$index]
        try {
            if ($entry.Existed -and $entry.Backup -and (Test-Path -LiteralPath $entry.Backup)) {
                Copy-Item -LiteralPath $entry.Backup -Destination $entry.Destination -Force
            } else {
                Remove-Item -LiteralPath $entry.Destination -Force -ErrorAction SilentlyContinue
            }
        } catch {
            Write-Warning ("Could not restore " + $entry.Destination + ": " + $_.Exception.Message)
        }
    }
}

function Remove-RollbackEntries([object[]]$Entries) {
    foreach ($entry in $Entries) {
        if ($entry.Backup) {
            Remove-Item -LiteralPath $entry.Backup -Force -ErrorAction SilentlyContinue
        }
    }
}

try {
    $JsTemporary = Stage-AtomicFile $JsSource $JsDestination
    $CssTemporary = Stage-AtomicFile $CssSource $CssDestination

    $RollbackEntries = @(
        (New-RollbackEntry $JsDestination),
        (New-RollbackEntry $CssDestination)
    )

    Commit-AtomicReplacement $JsTemporary $JsDestination
    $JsTemporary = $null
    Commit-AtomicReplacement $CssTemporary $CssDestination
    $CssTemporary = $null

    # Commit the HTML injection last. Restoring the persistent index backup is
    # part of the same transaction if this final step fails.
    Write-AtomicUtf8 $IndexPath $content
} catch {
    $failure = $_
    Restore-RollbackEntries $RollbackEntries
    try {
        Copy-Item -LiteralPath $BackupPath -Destination $IndexPath -Force
    } catch {
        Write-Warning ("Could not restore index.html from " + $BackupPath + ": " + $_.Exception.Message)
    }
    throw $failure
} finally {
    foreach ($temporary in @($JsTemporary, $CssTemporary)) {
        if ($temporary -and (Test-Path -LiteralPath $temporary)) {
            Remove-Item -LiteralPath $temporary -Force -ErrorAction SilentlyContinue
        }
    }
    Remove-RollbackEntries $RollbackEntries
}

Remove-Item -LiteralPath (Join-Path $WebDir "apple-karaoke.js") -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $WebDir "apple-karaoke.css") -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $WebDir "jellyfin-lyric-romanizer.js") -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Installed successfully." -ForegroundColor Green
Write-Host "Backup: $BackupPath"
Write-Host "Hard-refresh Jellyfin Web or use a private browser window."
Write-Host "After a Jellyfin upgrade, re-run this installer if the patch was replaced."
Write-Host ""

if ($EnsureAdministrator) {
    [void](Read-Host "Press Enter to close")
}
