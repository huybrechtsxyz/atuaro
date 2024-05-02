param(
  [Parameter(Mandatory=$true)][string] $Id
)

. ./src/Functions.ps1
. ./src/Optimize-Source.ps1

$ExecPath = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$SourceType = Get-SourceType -RootPath $ExecPath -SourceId $Id
$SourcePath = Get-SourcePath -RootPath $ExecPath -SourceId $Id -SourceType $SourceType

if ( Test-Path -LiteralPath $SourcePath -PathType Container ) { 
  Optimize-Source -RootPath $ExecPath -SourceId $Id -SourceType $SourceType -DoAction "update"
}
else {
  throw 'Invalid Source Path'
}
