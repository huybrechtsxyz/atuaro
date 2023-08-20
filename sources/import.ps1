function Import-Foundry-Module {
    Write-Output "Importing Module..."
    $ModuleJson = Get-Content .\module.json -Raw | ConvertFrom-Json 
    $ModuleName = $ModuleJson.id;
    Write-Output "Importing module... $ModuleName" 
    Write-Output "Importing module... Pack Databases" 
    $LocalPath = "C:\Users\" + $Env:UserName.ToLower() + "\AppData\Local\FoundryVTT\Data\modules\" + $ModuleName + "\packs"
    Copy-Item -Path "$LocalPath/*" -Destination ./packs
    Write-Output "Importing module... Compressing..." 
    Compress-Archive -Path ./* -Force -DestinationPath "$ModuleName.zip" -CompressionLevel Optimal
    Write-Output "Importing module... Done"
}
