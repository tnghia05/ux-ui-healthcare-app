$projectRoot = Split-Path $PSScriptRoot -Parent
$env:TEMP = Join-Path $projectRoot '.local/tmp'
$env:TMP = $env:TEMP
$env:EXPO_HOME = Join-Path $projectRoot '.local/expo'
$env:npm_config_cache = Join-Path $projectRoot '.local/npm-cache'
$env:XDG_CACHE_HOME = Join-Path $projectRoot '.local/cache'
New-Item -ItemType Directory -Force -Path $env:TEMP,$env:EXPO_HOME,$env:npm_config_cache,$env:XDG_CACHE_HOME | Out-Null
Set-Location $projectRoot
