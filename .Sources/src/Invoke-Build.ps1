param(
  [Parameter(Mandatory=$true)][string] $Id
)

. ./src/Functions.ps1
. ./src/Compile.ps1

Write-Host "Building a source..."
$ExecPath = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
$SourceType = Get-SourceType -RootPath $ExecPath -SourceId $Id
$SourcePath = Get-SourcePath -RootPath $ExecPath -SourceId $Id -SourceType $SourceType
Write-Host "Building a source... $SourceType from $SourcePath"

if ( Test-Path -LiteralPath $SourcePath -PathType Container ) { 
  Optimize-Source -RootPath $ExecPath -SourceId $Id -SourceType $SourceType -DoAction "build"
}
else {
  Write-Host "Invalid source path selected $SourcePath"
  throw 'Invalid Source Path'
}
