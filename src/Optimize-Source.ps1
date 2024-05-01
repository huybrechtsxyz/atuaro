. ./src/Functions.ps1

function Optimize-Source{
  param(
    [string] $RootPath,
    [string] $SourceId,
    [string] $TemplateId,
    [bool] $IsModule,
    [bool] $IsWorld,
    [bool] $DoCreate
  )
  
  # Read configuration file
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json

  # Determine paths
  $BinPath = Get-BinPath -RootPath $RootPath -SourceId $SourceId
  $DistPath = Get-DistPath -RootPath $RootPath -SourceId $SourceId
  $ModsPath = Get-ModsPath -RootPath $RootPath -SourceId $SourceId
  if ($IsModule) {
    $VttPath = Get-VttModulePath -RootPath $RootPath -ModuleId $SourceId
    if ($DoCreate) {
      $NewPath = Get-NewModulePath -RootPath $RootPath -SourceId $TemplateId
    }
  } elseif ($IsWorld) {
    $VttPath = Get-VttWorldPath -RootPath $RootPath
    if ($DoCreate) {
      $NewPath = Get-NewWorldPath -RootPath $RootPath -SourceId $TemplateId
    }
  }

  # Create new module or world if needed
  if ($DoCreate) {
    if ([string]::IsNullOrEmpty($NewPath)) {
      Throw "No template directory found"
    }
    
    # Copy all sections from the template to source folder
    $NewSections = Get-ChildItem -Path $NewPath -Directory
    Foreach($section in $NewSections) {
      Copy-SectionItems -Section $section.Name -SourcePath  $ModsPath -ToPath $DistPath
    }
  }

  # Read source configuration
  if ($IsModule) {
    $Settings = Get-Content -Path ((Get-ModsPath -RootPath $RootPath -SourceId $SourceId) + "/settings.json") -Raw | ConvertFrom-Json
  } elseif ($IsWorld) {
    $Settings = Get-Content-Path ((Get-WorldsPath -RootPath $RootPath -SourceId $SourceId) + "/settings.json") -Raw | ConvertFrom-Json
  } else {
    Throw "Unable to retrieve settings from module or world"
  }

  # Start with a clean sheet
  Remove-Item -LiteralPath $DistPath -Force -Recurse -ErrorAction Ignore
  New-Item $DistPath -ItemType "directory"

  # Copy DATA and PACKS from the local vtt folder to mods/world
  if (-NOT [string]::IsNullOrEmpty($VttPath)) {
    Copy-SectionItems -Section "data" -SourcePath $VttPath -ToPath $ModsPath
    Copy-SectionItems -Section "packs" -SourcePath $VttPath -ToPath $ModsPath
  }

  # Copy all sections from the module to distribution and local vtt folder
  $SourceSections = Get-ChildItem -Path $ModsPath -Directory
  Foreach($section in $SourceSections) {
    if ($section.Name -ne "data" -AND $section.Name -ne "packs") {
      Copy-SectionItems -Section $section.Name -SourcePath  $ModsPath -ToPath $DistPath
      if (-NOT [string]::IsNullOrEmpty($VttPath)) {
        Copy-SectionItems -Section $section.Name -SourcePath  $ModsPath -ToPath $VttPath
      }
    }
  }

  # Copy all files from the module to distribution and local vtt folder
  $SourceFiles = Get-ChildItem -Path $ModsPath -File
  Foreach($file in $SourceFiles) {
    Copy-Item -LiteralPath $file.FullName -Destination ($DistPath + "/" + $file.Name)
    if (-NOT [string]::IsNullOrEmpty($VttPath)) {
      Copy-Item -LiteralPath $file.FullName -Destination ($VttPath + "/" + $file.Name)
    }
  }

  # Create a compressed zip file from DIST to BIN
  Remove-Item -LiteralPath $BinPath -Force -Recurse -ErrorAction Ignore
  New-Item $BinPath -ItemType "directory"
  Compress-Module -SourceId $SourceId -SourcePath $DistPath -TargetPath $BinPath
  if ($IsModule) {
    Copy-Item -LiteralPath ($DistPath + "/module.json") -Destination ($BinPath + "/module.json") -Force -ErrorAction Ignore
  } elseif ($IsWorld) {
    Copy-Item -LiteralPath ($DistPath + "/world.json") -Destination ($BinPath + "/world.json") -Force -ErrorAction Ignore
  }
}