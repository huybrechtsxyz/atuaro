# Call
param(
  [Parameter(Mandatory=$true)][string] $TemplateId,
  [Parameter(Mandatory=$true)][string] $Id
)

# Import script
. ./src/Functions.ps1
. ./src/Optimize-Source.ps1

$ExecPath = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

# Build distribution and create binaries
$Path = Get-NewWorldPath -RootPath $ExecPath -TemplateId $TemplateId
if ( Test-Path -LiteralPath $Path -PathType Container ) { 
  Optimize-Source -RootPath $ExecPath -SourceId $Id -TemplateId $TemplateId -IsWorld $true -DoAction "create"
  return
}

$Path = Get-NewModulePath -RootPath $ExecPath -TemplateId $TemplateId
if ( Test-Path -LiteralPath $Path -PathType Container ) { 
  Optimize-Source -RootPath $ExecPath -SourceId $Id -TemplateId $TemplateId -IsModule $true -DoAction "create"
  return
}
