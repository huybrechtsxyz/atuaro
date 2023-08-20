function Export-Foundry-Module
{
    param (
        [string]$SourcePath
    )

    Write-Output "Upgrading Module..."
    $ModuleJson = Get-Content .\module.json -Raw | ConvertFrom-Json 
    $ModuleName = $ModuleJson.id;
    Write-Output "Upgrading Module... $ModuleName" 
    if ( ($SourcePath) -AND (Test-Path -LiteralPath $SourcePath -PathType Container) ) { 
        # HANDOUTS
        $LocalPath = $SourcePath + "\assets\handouts"
        $ModulePath = ".\handouts"
        Export-Foundry-Module-Items -LocalSourcePath $LocalPath -ModuleTargetPath $ModulePath
        # IMAGES
        $LocalPath = $SourcePath + "\assets\images"
        $ModulePath = ".\images"
        Export-Foundry-Module-Items -LocalSourcePath $LocalPath -ModuleTargetPath $ModulePath
        # MAPS
        $LocalPath = $SourcePath + "\assets\maps"
        $ModulePath = ".\maps"
        Export-Foundry-Module-Items -LocalSourcePath $LocalPath -ModuleTargetPath $ModulePath
        # TOKENS
        $LocalPath = $SourcePath + "\assets\tokens"
        $ModulePath = ".\tokens"
        Export-Foundry-Module-Items -LocalSourcePath $LocalPath -ModuleTargetPath $ModulePath
    }
    Write-Output "Upgrading Module... Compressing..."
    Compress-Archive -Path ./* -Force -DestinationPath "$ModuleName.zip" -CompressionLevel Optimal
    Write-Output "Upgrading Module... Local data..."
    $LocalPath = "C:\Users\" + $Env:UserName.ToLower() + "\AppData\Local\FoundryVTT\Data\modules\" + $ModuleName
    if ( Test-Path -LiteralPath $LocalPath -PathType Container ) { 
        Remove-Item -LiteralPath $LocalPath -Force -Recurse
    }
    Copy-Item -Path . -Destination $LocalPath -Exclude "$ModuleName.zip" , "*.ps1" -Recurse
    Write-Output "Upgrading Module... Done"    
}

function Export-Foundry-Module-Items {
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
