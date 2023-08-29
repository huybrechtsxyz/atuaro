function Get-LocalFoundryPath {
    param (
        [string]$ModuleName
    )
    return "C:/Users/" + $Env:UserName.ToLower() + "/AppData/Local/FoundryVTT/Data/modules/" + $ModuleName
}

function Copy-DirectoryItems {
    param (
        [string]$Section,
        [string]$FromPath,
        [string]$ToPath
    )
    
    $FromPath = $FromPath + "/" + $Section
    $ToPath = $ToPath + "/" + $Section
    Write-Output "Upgrading Module... -> Copying from '$FromPath' to '$ToPath'"

    if ( -NOT ( Test-Path -LiteralPath $FromPath -PathType Container ) ) { 
        Write-Output "Upgrading Module...    -> no target for $ToPath"
        return
    }
    if ( Test-Path -LiteralPath $ToPath -PathType Container ) { 
        Write-Output "Upgrading Module...    -> cleaning target $ToPath"
        Remove-Item -LiteralPath $ToPath -Force -Recurse
    }
    else {
        Write-Output "Upgrading Module...    -> creating target $ModuleTargetPath"
        New-Item $ModuleTargetPath -ItemType "directory"
    }
    Write-Output "Upgrading Module...    -> copying to target $ToPath"
    Copy-Item -Path $FromPath -Destination $ToPath -Recurse
}

function Copy-WorkspaceToSource {
    param (
        [string]$WorkspacePath,
        [string]$SourcePath
    )
    $WorkspacePath = $WorkspacePath + "/assets"
    Copy-DirectoryItems -Section "artwork" -FromPath $WorkspacePath -ToPath $SourcePath
    Copy-DirectoryItems -Section "audio" -FromPath $WorkspacePath -ToPath $SourcePath
    Copy-DirectoryItems -Section "handouts" -FromPath $WorkspacePath -ToPath $SourcePath
    Copy-DirectoryItems -Section "images" -FromPath $WorkspacePath -ToPath $SourcePath
    Copy-DirectoryItems -Section "maps" -FromPath $WorkspacePath -ToPath $SourcePath
    Copy-DirectoryItems -Section "tiles" -FromPath $WorkspacePath -ToPath $SourcePath
    Copy-DirectoryItems -Section "tokens" -FromPath $WorkspacePath -ToPath $SourcePath
}

function Copy-DataToSource {
    param (
        [string]$ModuleName,
        [string]$SourcePath
    )
    
    $DataPath = Get-LocalFoundryPath -ModuleName $ModuleName

    Copy-DirectoryItems -Section "packs" -FromPath $DataPath -ToPath $SourcePath
}

function Compress-Module {
    param (
        [string]$ModuleName,
        [string]$SourcePath
    )
    Write-Output "Upgrading Module... -> Compressing..."
    $Source = $SourcePath + "/*"
    $Destination = $SourcePath + "/$ModuleName.zip"
    Compress-Archive -Path $Source -Force -DestinationPath $Destination -CompressionLevel Optimal
}

function Copy-SourceToData {
    param (
        [string]$ModuleName,
        [string]$SourcePath
    )

    $DataPath = Get-LocalFoundryPath -ModuleName $ModuleName

    Write-Output "Upgrading Module... -> Copying from '$SourcePath' to '$DataPath'"  
    Write-Output "Upgrading Module...    -> copying to target $DataPath"
    Copy-Item -Path $SourcePath -Destination $LocalPath -Exclude "$ModuleName.zip" , "*.ps1" -Recurse
}

function Update-FoundryModule 
{
    param (
        [string]$WorkspacePath,
        [string]$SourcePath,
        [string, ValidateSet("Major","Minor","Build")]$Increment="Build"
    )

    Write-Output "Upgrading Module..."

    if ( ($WorkspacePath) -AND -NOT (Test-Path -LiteralPath $WorkspacePath -PathType Container) ) { 
        Write-Output "Upgrading Module...Invalid Workspace $WorkspacePath"
        return
    }

    if ( -NOT (Test-Path -LiteralPath $SourcePath -PathType Container) ) { 
        Write-Output "Upgrading Module...Invalid Source $SourcePath"
        return
    }
    
    # Get the module name from the 
    $ModuleJson = Get-Content $SourcePath\module.json -Raw | ConvertFrom-Json 
    $ModuleName = $ModuleJson.id;
    $ModuleVersion = $ModuleJson.version;
    Write-Output "Upgrading Module... $ModuleName ($ModuleVersion)"

    # Auto increment build version
    $Major,$Minor,$Build = $ModuleVersion.Split('.')
    if($Increment -eq "Build")
    {
        $Build = 1 + $Build
    }
    if($Increment -eq "Minor")
    {
        $Minor = 1 + $Minor
        $Build = 1
    }
    if($Increment -eq "Major")
    {
        $Major = 1 + $Major
        $Minor = 1
        $Build = 1
    }
    $NewVersion = $Major,$Minor,$Build -join '.'
    $ModuleJson.version = $NewVersion
    Write-Output "Upgrading Module... Incrementing version to '$NewVersion'"

    # Copy all information from the Workpath to the Sourcepath
    if ( ($WorkspacePath) {
        Write-Output "Upgrading Module... COPY WORKSPACE TO SOURCE"
        Copy-WorkspaceToSource -WorkspacePath $WorkspacePath -SourcePath $SourcePath
    }

    # Copy pack informatin from dataPath to sourcePath
    Write-Output "Upgrading Module... COPY MODULEDATA TO SOURCE"
    Copy-DataToSource -ModuleName $ModuleName -SourcePath $SourcePath

    # Compress the new module file
    Write-Output "Upgrading Module... COMPRESSING NEW MODULE ZIP"
    Compress-Module -ModuleName $ModuleName -SourcePath $SourcePath

    # Update all module information
    Write-Output "Upgrading Module... COPY SOURCE TO MODULEDATA"
    Copy-SourceToData -ModuleName $ModuleName -SourcePath $SourcePath
}
