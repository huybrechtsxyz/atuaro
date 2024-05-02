param(
  [Parameter(Mandatory=$true)][string] $TemplateId,
  [Parameter(Mandatory=$true)][string] $Id
)

. ./src/Functions.ps1
. ./src/Optimize-Source.ps1

$ExecPath = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$SourceType = Get-NewType -RootPath $ExecPath -TemplateId $TemplateId
$NewPath = Get-NewPath -RootPath $ExecPath -TemplateId $TemplateId -SourceType $SourceType

if ( Test-Path -LiteralPath $NewPath -PathType Container ) { 
  Optimize-Source -RootPath $ExecPath -SourceId $Id -SourceType $SourceType -DoAction "create" -TemplateId $TemplateId
}
else {
  throw 'Invalid Template Path'
}
