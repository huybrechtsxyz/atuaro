param(
  [Parameter(Mandatory=$true)][string] $Id
)

. ./Functions.ps1
. ./Optimize-Source.ps1

Write-Host "Building a source..."
$ExecPath = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
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
