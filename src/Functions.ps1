function Update-Source {
  param(
    [Parameter(Mandatory=$true)] [string] $RootPath,
    [Parameter(Mandatory=$true)] [string] $SourcePath
  )
 
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json

  # Get all AsciiDoc files in the current directory
  $SourceFiles = Get-ChildItem -Path $SourcePath -Filter $AppSettings.Links.Filter -File -Recurse

  foreach ($file in $SourceFiles) {
    $Content = Get-Content $file.FullName -Raw

    $Matches = [Regex]::Matches($Content, $AppSettings.Links.Images.Pattern)
    foreach ($match in $Matches) {
      $SearchFile = $match.Groups[1].Value
      $SearchFile = [System.IO.Path]::GetFileName($SearchFile)
      $RepoPath = $RootPath + "/" + $AppSettings.Paths.Repository.Images
      $SearchPath = $SourcePath + "/" + $AppSettings.Links.Images.Path
      Update-Source-File -RepoPath $RepoPath -SearchPath $SearchPath -ResourcePath $AppSettings.Links.Images.Path -SearchFile $SearchFile
    }
  }
}

function Update-Source-File {
  param(
    [Parameter(Mandatory=$true)] [string] $RepoPath,
    [Parameter(Mandatory=$true)] [string] $SearchPath,
    [Parameter(Mandatory=$true)] [string] $ResourcePath,
    [Parameter(Mandatory=$true)] [string] $SearchFile
  )
  
  $SourceFile =  Get-ChildItem -Path ($SearchPath) -Recurse -File | Where-Object { $_.Name -eq $SearchFile } | Select-Object -First 1
  $RepoFile = Get-ChildItem -Path $RepoPath -Recurse -File | Where-Object { $_.Name -eq $SearchFile } | Select-Object -First 1

  if ((-NOT ($SourceFile)) -AND (-NOT ($RepoFile))) {
    return
  }

  if (-NOT ($SourceFile)) {
    $SourceFile = $SourcePath + "/" + $ResourcePath + "/" + $SearchFile
  } else {
    $SourceFile = $SourceFile.FullName
  }

  if (-NOT (Test-Path $SourceFile)) {
    Copy-Item -Path $RepoFile.FullName -Destination $SourceFile -Force
  }
  else {
    $SourceFileLastWriteTime = (Get-Item $SourceFile).LastWriteTime
    $RepoFileLastWriteTime = (Get-Item $RepoFile).LastWriteTime
    if ($RepoFileLastWriteTime -gt $SourceFileLastWriteTime) {
      Copy-Item -Path $RepoFile -Destination $SourceFile -Force
    }
  }
}

function Compress-Module {
  param (
    [Parameter(Mandatory=$true)] [string] $SourceId,
    [Parameter(Mandatory=$true)] [string] $SourcePath,
    [Parameter(Mandatory=$true)] [string] $TargetPath
  )
  $Source = $SourcePath + "/*"
  $Destination = $TargetPath + "/$SourceId.zip"
  Compress-Archive -Path $Source -Force -DestinationPath $Destination -CompressionLevel Optimal
}

function Copy-SectionItems {
  param (
    [Parameter(Mandatory=$true)] [string] $Section,
    [Parameter(Mandatory=$true)] [string] $FromPath,
    [Parameter(Mandatory=$true)] [string] $ToPath
  )
  $FromPath = $FromPath + "/" + $Section
  $ToPath = $ToPath + "/" + $Section
  if ( -NOT ( Test-Path -LiteralPath $FromPath -PathType Container ) ) { 
    return
  }
  if ( Test-Path -LiteralPath $ToPath -PathType Container ) { 
    Remove-Item -LiteralPath $ToPath -Force -Recurse
  }
  else {
    New-Item $ModuleTargetPath -ItemType "directory"
  }
  Copy-Item -Path $FromPath -Destination $ToPath -Recurse
}

function Get-BinPath {
  param(
    [Parameter(Mandatory=$true)] [string] $RootPath,
    [Parameter(Mandatory=$true)] [string] $SourceId
  )
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json
  return  $RootPath + "/" + $AppSettings.Paths.Binaries + "/" + $AppSettings.Prefix + $SourceId
}

function Get-DistPath {
  param(
    [Parameter(Mandatory=$true)] [string] $RootPath,
    [Parameter(Mandatory=$true)] [string] $SourceId
  )
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json
  return  $RootPath + "/" + $AppSettings.Paths.Distribution + "/" + $SourceId
}

function Get-NewPath {
  param(
    [Parameter(Mandatory=$true)] [string] $RootPath, 
    [Parameter(Mandatory=$true)] [string] $TemplateId,
    [Parameter(Mandatory=$true)] [string] [ValidateSet("module","world")] $SourceType
  )
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json
  return $RootPath + "/" + $AppSettings.Paths.Templates + "/" + $SourceType + "/" + $TemplateId
}

function Get-NewType {
  param(
    [Parameter(Mandatory=$true)] [string] $RootPath, 
    [Parameter(Mandatory=$true)] [string] $TemplateId
  )

  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json

  # World
  $Path = $RootPath + "/" + $AppSettings.Paths.Templates + "/world/" + $TemplateId
  if ( Test-Path -LiteralPath $Path -PathType Container ) { 
    return "world"
  }

  # Module
  $Path = $RootPath + "/" + $AppSettings.Paths.Templates + "/module/" + $TemplateId
  if ( Test-Path -LiteralPath $Path -PathType Container ) { 
    return "module"
  }

  # Unknown
  return ""
}

function Get-SourcePath {
  param(
    [Parameter(Mandatory=$true)] [string] $RootPath, 
    [Parameter(Mandatory=$true)] [string] $SourceId,
    [Parameter(Mandatory=$true)] [string] [ValidateSet("module","world")] $SourceType
  )
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json
  if ($SourceType -eq "module") { return $RootPath + "/" + $AppSettings.Paths.Modules + "/" + $SourceId }
  elseif ($SourceType -eq "world") { return $RootPath + "/" + $AppSettings.Paths.Worlds + "/" + $SourceId }
  else { throw "Get-SourcePath - Not a module or a world" }
}

function Get-SourceType {
  param(
    [Parameter(Mandatory=$true)] [string] $RootPath, 
    [Parameter(Mandatory=$true)] [string] $SourceId
  )

  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json

  # World
  $Path = $RootPath + "/" + $AppSettings.Paths.Worlds + "/" + $SourceId
  if ( Test-Path -LiteralPath $Path -PathType Container ) { 
    return "world"
  }

  # Module
  $Path = $RootPath + "/" + $AppSettings.Paths.Modules + "/" + $SourceId
  if ( Test-Path -LiteralPath $Path -PathType Container ) { 
    return "module"
  }

  # Unknown
  return ""
}

function Get-VttPath {
  return "C:/Users/" + $Env:UserName.ToLower() + "/AppData/Local/FoundryVTT/Data"
}

function Get-VttSourcePath {
  param ( 
    [Parameter(Mandatory=$true)] [string] $RootPath, 
    [Parameter(Mandatory=$true)] [string] $SourceId,
    [Parameter(Mandatory=$true)] [string] [ValidateSet("module","world")] $SourceType
  )
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json
  $VttSourcePath = Get-VttPath
  if ($SourceType -eq "module") { $VttSourcePath = ($VttSourcePath + "/modules/" + $AppSettings.Prefix + $SourceId) }
  elseif ($SourceType -eq "world") { $VttSourcePath = ($VttSourcePath + "/worlds/" + $AppSettings.Prefix + $SourceId) }
  else { throw "Get-VttSourcePath - Not a module or a world" }
  return $VttSourcePath
}

function Test-VttPath {
  if ( Test-Path -LiteralPath Get-VttPath -PathType Container )
  { return $true }
  return $false
}

function Test-VttSourcePath {
  param ( 
    [Parameter(Mandatory=$true)] [string] $RootPath, 
    [Parameter(Mandatory=$true)] [string] $SourceId,
    [Parameter(Mandatory=$true)] [string] [ValidateSet("module","world")] $SourceType
  )
  if ( Test-Path -LiteralPath (Get-VttSourcePath -RootPath $RootPath -SourceId $SourceId -SourceType $SourceType) -PathType Container )
  { return $true }
  return $false
}