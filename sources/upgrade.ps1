function Get-Local-Foundry-Path {
    param (
        [string]$ModuleName
    )
    return "C:\Users\" + $Env:UserName.ToLower() + "\AppData\Local\FoundryVTT\Data\modules\" + $ModuleName
}

function Compress-Module {
    param (
        [string]$ModuleName
    )
    Write-Output "Upgrading Module... Compressing..."
    Compress-Archive -Path ./* -Force -DestinationPath "$ModuleName.zip" -CompressionLevel Optimal
}

function Copy-Directory-Items {
    param (
        [string] $LocalSourcePath,
        [string] $ModuleTargetPath
    )
    
    Write-Output "Upgrading Module... From '$LocalSourcePath' to '$ModuleTargetPath'" 

    if ( -NOT ( Test-Path -LiteralPath $LocalSourcePath -PathType Container ) ) { 
        return
    }
    if ( Test-Path -LiteralPath $ModuleTargetPath -PathType Container ) { 
        Write-Output "Upgrading Module... cleaning target $ModuleTargetPath"
        Remove-Item -LiteralPath $ModuleTargetPath -Force -Recurse
    }
    else {
        Write-Output "Upgrading Module... creating target $ModuleTargetPath"
        New-Item $ModuleTargetPath -ItemType "directory"
    }
    Write-Output "Upgrading Module... copying to target $ModuleTargetPath"
    Copy-Item -Path $LocalSourcePath -Destination $ModuleTargetPath -Recurse
}

function Copy-Workspace-To-Source {
    param (
        [string]$WorkspacePath
    )
    if ( ($WorkspacePath) -AND (Test-Path -LiteralPath $WorkspacePath -PathType Container) ) { 
        # HANDOUTS
        $LocalPath = $WorkspacePath + "\assets\handouts"
        $ModulePath = ".\handouts"
        Copy-Directory-Items -LocalSourcePath $LocalPath -ModuleTargetPath $ModulePath
        # IMAGES
        $LocalPath = $WorkspacePath + "\assets\images"
        $ModulePath = ".\images"
        Copy-Directory-Items -LocalSourcePath $LocalPath -ModuleTargetPath $ModulePath
        # MAPS
        $LocalPath = $WorkspacePath + "\assets\maps"
        $ModulePath = ".\maps"
        Copy-Directory-Items -LocalSourcePath $LocalPath -ModuleTargetPath $ModulePath
        # TOKENS
        $LocalPath = $WorkspacePath + "\assets\tokens"
        $ModulePath = ".\tokens"
        Copy-Directory-Items -LocalSourcePath $LocalPath -ModuleTargetPath $ModulePath
    }
}

function Copy-Source-To-Foundry {
    param (
        [string]$ModuleName
    )
    Write-Output "Upgrading Module... Local data..."
    $LocalPath = Get-Local-Foundry-Path -ModuleName $ModuleName
    if ( Test-Path -LiteralPath $LocalPath -PathType Container ) { 
        Remove-Item -LiteralPath $LocalPath -Force -Recurse
    }
    Copy-Item -Path . -Destination $LocalPath -Exclude "$ModuleName.zip" , "*.ps1" -Recurse
}

function Copy-Foundry-Packs-To-Source {
    param (
        [string]$ModuleName
    )

    $LocalPath = Get-Local-Foundry-Path -ModuleName $ModuleName
    $LocalPath = $LocalPath + "\packs"
    Copy-Item -Path "$LocalPath/*" -Destination ./packs
}

function Upgrade-Foundry-Module {
    param (
        [string]$SourcePath,
        [string]$WorkspacePath
    )

    Write-Output "Upgrading Module..."

    if ( ($SourcePath) -AND -NOT (Test-Path -LiteralPath $SourcePath -PathType Container) ) { 
        Write-Output "Upgrading Module...Invalid Source $SourcePath"
        return
    }
    
    if ( ($WorkspacePath) -AND -NOT (Test-Path -LiteralPath $WorkspacePath -PathType Container) ) { 
        Write-Output "Upgrading Module...Invalid Workspace $WorkspacePath"
        return
    }

    $ModuleJson = Get-Content $SourcePath\module.json -Raw | ConvertFrom-Json 
    $ModuleName = $ModuleJson.id;
    Write-Output "Upgrading Module... $ModuleName"
    
    # Copy files from the workspace to the source (new images, tokens, maps, ...)
    #Copy-Workspace-To-Source -WorkspacePath $WorkspacePath

    # Copy files from the source to the local appdata folder of foundry
    #Copy-Source-To-Foundry -ModuleName $ModuleName
    # TODO PROBLEM THAT THE PREV STATEMENT COPIES ALL !

    # Copy foundry packs to source directory
    #Copy-Foundry-Packs-To-Source -ModuleName $ModuleName
    # TODO PROBLEM THAT THE PREV STATEMENT COPIES ALL !

    # Create a new archive file
    #Compress-Module -ModuleName $ModuleName

    Write-Output "Upgrading module... Done"
}
