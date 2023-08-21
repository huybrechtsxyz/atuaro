function Update-Foundry-Module {
    Write-Output "Updating Module..."
    $ModuleJson = Get-Content .\module.json -Raw | ConvertFrom-Json 
    $ModuleName = $ModuleJson.id;
    Write-Output "Updating module... $ModuleName" 
    Write-Output "Updating module... Compressing..." 
    Compress-Archive -Path ./* -Force -DestinationPath "$ModuleName.zip" -Exclude "$ModuleName.zip" , "*.ps1" -CompressionLevel Optimal
    Write-Output "Updating module... Done"
}
