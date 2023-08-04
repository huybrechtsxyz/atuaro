Write-Output "Upgrading Module..."
$ModuleJson = Get-Content .\module.json -Raw | ConvertFrom-Json 
$ModuleName = $ModuleJson.id;
Write-Output "Upgrading Module... $ModuleName" 
Write-Output "Upgrading Module... Compressing..."
Compress-Archive -Path ./* -Force -DestinationPath "$ModuleName.zip" -CompressionLevel Optimal
Write-Output "Upgrading Module... Local data..."
$LocalPath = "C:\Users\" + $Env:UserName.ToLower() + "\AppData\Local\FoundryVTT\Data\modules\" + $ModuleName
if ( Test-Path -LiteralPath $LocalPath -PathType Container ) { 
    Remove-Item -LiteralPath $LocalPath -Force -Recurse
}
Copy-Item -Path . -Destination $LocalPath -Exclude "$ModuleName.zip" , "*.ps1" -Recurse
Write-Output "Upgrading Module... Done"