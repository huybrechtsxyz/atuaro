. ./src/Functions.ps1

function Optimize-Source{
  param(
    [Parameter(Mandatory=$true)] [string] $RootPath, 
    [Parameter(Mandatory=$true)] [string] $SourceId,
    [Parameter(Mandatory=$true)] [string] [ValidateSet("module","world")] $SourceType,
    [Parameter(Mandatory=$true)][string][ValidateSet("create","build","update")]$DoAction,
    [string] $TemplateId = ""
  )
  
  # Read configuration file
  # $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json

  # Determine paths
  $BinPath = Get-BinPath -RootPath $RootPath -SourceId $SourceId
  $DistPath = Get-DistPath -RootPath $RootPath -SourceId $SourceId
  $SourcePath = Get-SourcePath -RootPath $RootPath -SourceId $SourceId -SourceType $SourceType
  $VttPath = Get-VttSourcePath -RootPath $RootPath -SourceId $SourceId -SourceType $SourceType

  # Create new module or world if needed
  # Copy all sections from the template to source folder
  if ($DoAction -eq "create") {
    $NewPath = Get-NewPath -RootPath $RootPath -TemplateId $TemplateId -SourceType $SourceType

    Remove-Item -LiteralPath $SourcePath -Force -Recurse -ErrorAction Ignore
    New-Item $SourcePath -ItemType "directory"

    $NewSections = Get-ChildItem -Path $NewPath -Directory
    Foreach($section in $NewSections) {
      Copy-SectionItems -Section $section.Name -SourcePath  $NewPath -ToPath $SourcePath
    }
    
    $NewFiles = Get-ChildItem -Path $NewPath -File
    Foreach($file in $NewFiles) {
      Copy-Item -LiteralPath $file.FullName -Destination ($SourcePath + "/" + $file.Name)
    }
    Return
  }

  # Copy DATA and PACKS from the local vtt folder to mods/world
  if (Test-Path -LiteralPath $VttPath -PathType Container) {
    Copy-SectionItems -Section "data" -FromPath $VttPath -ToPath $SourcePath
    Copy-SectionItems -Section "packs" -FromPath $VttPath -ToPath $SourcePath
  }

  if ($DoAction -eq "update") {

    Update-Source -RootPath $RootPath -SourcePath $SourcePath

    return
  }
  
  # Start with a clean sheet
  Remove-Item -LiteralPath $DistPath -Force -Recurse -ErrorAction Ignore
  New-Item $DistPath -ItemType "directory"

  # Copy all sections from the module to distribution
  $Sections = Get-ChildItem -Path $SourcePath -Directory
  Foreach($Section in $Sections) {
    Copy-SectionItems -Section $Section.Name -FromPath  $SourcePath -ToPath $DistPath
    if (Test-Path -LiteralPath $VttPath -PathType Container) {
      Copy-SectionItems -Section $Section.Name -FromPath  $SourcePath -ToPath $VttPath
    }
  }

  # Copy all files from the module to distribution and local vtt folder
  $Files = Get-ChildItem -Path $SourcePath -File
  Foreach($File in $Files) {
    Copy-Item -LiteralPath $File.FullName -Destination ($DistPath + "/" + $File.Name)
    if (Test-Path -LiteralPath $VttPath -PathType Container) {
      Copy-Item -LiteralPath $File.FullName -Destination ($VttPath + "/" + $file.Name)
    }
  }

  # Create a compressed zip file from DIST to BIN
  Remove-Item -LiteralPath $BinPath -Force -Recurse -ErrorAction Ignore
  New-Item $BinPath -ItemType "directory"
  Compress-Module -SourceId $SourceId -SourcePath $DistPath -TargetPath $BinPath
  if ($SourceType -eq "module") {
    Copy-Item -LiteralPath ($DistPath + "/module.json") -Destination ($BinPath + "/module.json") -Force -ErrorAction Ignore
  } elseif ($SourceType -eq "world") {
    Copy-Item -LiteralPath ($DistPath + "/world.json") -Destination ($BinPath + "/world.json") -Force -ErrorAction Ignore
  }
}