[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$Candidates = @()

try {
    $bashCommand = Get-Command bash.exe -ErrorAction Stop
    if ($bashCommand.Source) {
        $Candidates += $bashCommand.Source
    }
} catch {
    # Fall through to common Git for Windows locations.
}

$Candidates += @(
    (Join-Path $env:ProgramFiles 'Git\bin\bash.exe'),
    (Join-Path $env:ProgramFiles 'Git\usr\bin\bash.exe')
)

if (${env:ProgramFiles(x86)}) {
    $Candidates += @(
        (Join-Path ${env:ProgramFiles(x86)} 'Git\bin\bash.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Git\usr\bin\bash.exe')
    )
}

$Bash = $Candidates |
    Where-Object { $_ -and (Test-Path -LiteralPath $_) } |
    Select-Object -First 1

if (-not $Bash) {
    throw @'
Git Bash was not found.
Install Git for Windows, then rerun:
  .\scripts\test-all.ps1

The canonical test suite is scripts/test-all.sh; this PowerShell wrapper runs it through Git Bash so Windows and CI execute the same release gate.
'@
}

Write-Host "Running Jellyfin LyricMotion release gate with: $Bash"
& $Bash './scripts/test-all.sh'
$ExitCode = $LASTEXITCODE

if ($ExitCode -ne 0) {
    throw "Jellyfin LyricMotion test suite failed with exit code $ExitCode."
}

Write-Host 'PowerShell wrapper: validation passed.'
