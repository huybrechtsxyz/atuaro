# Call
param(
  [Parameter(Mandatory=$true)][string] $Id
)

# Import script
. ./src/Functions.ps1
. ./src/Optimize-Source.ps1

$ExecPath = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

# Build distribution and create binaries
$Path = Get-WorldsPath -RootPath $ExecPath -SourceId $Id
if ( Test-Path -LiteralPath $Path -PathType Container ) { 
  Optimize-Source -RootPath $ExecPath -SourceId $Id -IsWorld $true -DoAction "build"
  return
}

$Path = Get-ModsPath -RootPath $ExecPath -SourceId $Id
if ( Test-Path -LiteralPath $Path -PathType Container ) { 
  Optimize-Source -RootPath $ExecPath -SourceId $Id -IsModule $true -DoAction "build"
  return
}
