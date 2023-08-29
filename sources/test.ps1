# Get the module name from the 
$ModuleJson = Get-Content ".\sources\atuaro-gauntlet\module.json" -Raw | ConvertFrom-Json 
$ModuleName = $ModuleJson.id;
$ModuleVersion = $ModuleJson.version;

Write-Output "Upgrading Module... $ModuleName ($ModuleVersion)"

$major,$minor,$build = $ModuleVersion.Split('.')
$build = 1 + $build
$bumpedVersion = $major,$minor,$build -join '.'

Write-Output "Upgrading Module... $ModuleName ($bumpedVersion)"