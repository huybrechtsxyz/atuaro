param(
  [Parameter(Mandatory=$true)][string] $TemplateId,
  [Parameter(Mandatory=$true)][string] $Id
)

. ./src/Functions.ps1
. ./src/Optimize-Source.ps1

Write-Host "Create a new source..."
$ExecPath = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$SourceType = Get-NewType -RootPath $ExecPath -TemplateId $TemplateId
$NewPath = Get-NewPath -RootPath $ExecPath -TemplateId $TemplateId -SourceType $SourceType
Write-Host "Create a new source... new $SourceType from $NewPath"

if ( Test-Path -LiteralPath $NewPath -PathType Container ) { 
  Optimize-Source -RootPath $ExecPath -SourceId $Id -SourceType $SourceType -DoAction "create" -TemplateId $TemplateId
}
else {
  Write-Host "Invalid template path selected $NewPath"
  throw 'Invalid Template Path'
}
