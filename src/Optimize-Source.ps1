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
  switch ($DoAction) {
    "create" { $Prefix = "Creating $SourceType $SourceId from $TemplateId..." }
    "update" { $Prefix = "Updating $SourceType $SourceId..." }
    "build" { $Prefix = "Building $SourceType $SourceId..." }
    Default { Write-Host "Invalid $DoAction action"}
  }

  # Determine paths
  Write-Host "$Prefix determining paths"
  $BinPath = Get-BinPath -RootPath $RootPath -SourceId $SourceId
  $DistPath = Get-DistPath -RootPath $RootPath -SourceId $SourceId
  $SourcePath = Get-SourcePath -RootPath $RootPath -SourceId $SourceId -SourceType $SourceType
  $VttPath = Get-VttSourcePath -RootPath $RootPath -SourceId $SourceId -SourceType $SourceType
  Write-Host "$Prefix determining paths for binaries: $BinPath"
  Write-Host "$Prefix determining paths for distribution: $DistPath"
  Write-Host "$Prefix determining paths for source: $SourcePath"
  Write-Host "$Prefix determining paths for VTT: $VttPath"

  # Create new module or world if needed
  # Copy all sections from the template to source folder
  if ($DoAction -eq "create") {
    $NewPath = Get-NewPath -RootPath $RootPath -TemplateId $TemplateId -SourceType $SourceType
    Write-Host "$Prefix determining paths for template $NewPath"

    #Remove-Item -LiteralPath $SourcePath -Force -Recurse -ErrorAction Ignore
    if (Test-Path -LiteralPath $SourcePath) {
      Write-Host "$Prefix source already exists for $SourcePath"
      throw "Source $SourceId already exists for $SourcePath"
    }
    Write-Host "$Prefix create a new directory"
    New-Item $SourcePath -ItemType "directory"

    Write-Host "$Prefix creating sections"
    $NewSections = Get-ChildItem -Path $NewPath -Directory
    Foreach($section in $NewSections) {
      Write-Host "$Prefix creating sections $section"
      Copy-SectionItems -Section $section.Name -FromPath $NewPath -ToPath $SourcePath
    }
    
    Write-Host "$Prefix creating files"
    $NewFiles = Get-ChildItem -Path $NewPath -File
    Foreach($file in $NewFiles) {
      Write-Host "$Prefix creating files $file"
      Copy-Item -LiteralPath $file.FullName -Destination ($SourcePath + "/" + $file.Name)
    }
    Write-Host "$Prefix completed"
    Return
  }

  # Copy DATA and PACKS from the local vtt folder to mods/world
  if (Test-Path -LiteralPath $VttPath -PathType Container) {
    Write-Host "$Prefix copying VTT data"
    Copy-SectionItems -Section "data" -FromPath $VttPath -ToPath $SourcePath
    Copy-SectionItems -Section "packs" -FromPath $VttPath -ToPath $SourcePath
  }

  # Get the basic settings
  Write-Host "$Prefix read application settings"
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json

  if ($DoAction -eq "update") {
    Write-Host "$Prefix compiling stories"
    $SourceFiles = Get-ChildItem -Path $SourcePath -Filter $AppSettings.Links.Filter -File -Recurse
    foreach ($file in $SourceFiles) {
      Write-Host "$Prefix compiling stories $file"
      $Content = Get-Content $file.FullName -Raw
      foreach ($match in ([Regex]::Matches($Content, $AppSettings.Links.Images.Pattern))) {
        $SearchFile = $match.Groups[1].Value
        $SearchFile = [System.IO.Path]::GetFileName($SearchFile)
        $RepoPath = $RootPath + "/" + $AppSettings.Paths.Repository.Images
        $SearchPath = $SourcePath + "/" + $AppSettings.Links.Images.Path
        Write-Host "$Prefix compiling images $SearchFile"
        Update-Source-File -RepoPath $RepoPath -SearchPath $SearchPath -ResourcePath $AppSettings.Links.Images.Path -SearchFile $SearchFile
      }
    }
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