function Compress-Module {
  param (
      [string]$SourceId,
      [string]$SourcePath,
      [string]$TargetPath
  )
  $Source = $SourcePath + "/*"
  $Destination = $TargetPath + "/$SourceId.zip"
  Compress-Archive -Path $Source -Force -DestinationPath $Destination -CompressionLevel Optimal
}

function Copy-SectionItems {
  param (
    [string]$Section,
    [string]$FromPath,
    [string]$ToPath
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
  param([string] $RootPath, [string] $SourceId)
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json
  return  $RootPath + "/" + $AppSettings.Paths.Binaries + "/" + $AppSettings.Prefix + $SourceId
}

function Get-DistPath {
  param([string] $RootPath, [string] $SourceId)
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json
  return  $RootPath + "/" + $AppSettings.Paths.Distribution + "/" + $SourceId
}

function Get-NewModulePath {
  param([string] $RootPath, [string] $SourceId)
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json
  return  $RootPath + "/" + $AppSettings.Paths.Templates + "/module/" + $SourceId
}

function Get-NewWorldPath {
  param([string] $RootPath, [string] $SourceId)
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json
  return  $RootPath + "/" + $AppSettings.Paths.Templates + "/world/" + $SourceId
}

function Get-ModsPath {
  param([string] $RootPath, [string] $SourceId)
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json
  return  $RootPath + "/" + $AppSettings.Paths.Modules + "/" + $SourceId
}

function Get-WorldsPath {
  param([string] $RootPath, [string] $SourceId)
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json
  return  $RootPath + "/" + $AppSettings.Paths.Worlds + "/" + $SourceId
}

function Get-VttModulePath {
  param (
    [string] $RootPath, [string]$ModuleId
  )
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json
  $Path = "C:/Users/" + $Env:UserName.ToLower() + "/AppData/Local/FoundryVTT/Data/modules/" + $AppSettings.Prefix + $ModuleId
  if ( Test-Path -LiteralPath $Path -PathType Container ) { 
    return $Path
  }
  return $null
}

function Get-VttWorldPath {
  param (
    [string] $RootPath, [string]$WorldId
  )
  $AppSettings = Get-Content -Path ($RootPath + "/appsettings.json") -Raw | ConvertFrom-Json
  $Path = "C:/Users/" + $Env:UserName.ToLower() + "/AppData/Local/FoundryVTT/Data/worlds/" + $AppSettings.Prefix + $WorldId
  if ( Test-Path -LiteralPath $Path -PathType Container ) { 
    return $Path
  }
  return $null
}