function Update-Foundry-Module {
    Write-Output "Updating Module..."
    $ModuleJson = Get-Content .\module.json -Raw | ConvertFrom-Json 
    $ModuleName = $ModuleJson.id;
    Write-Output "Updating module... $ModuleName" 
    Write-Output "Updating module... Compressing..." 
    Compress-Archive -Path ./* -Force -DestinationPath "$ModuleName.zip" -CompressionLevel Optimal
    Write-Output "Updating module... Done"
}
