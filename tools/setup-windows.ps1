# Sanimo — préparation d'un poste Windows pour le build Android.
# Usage : & .\tools\setup-windows.ps1   (depuis la racine du dépôt)
# Idempotent : peut être relancé sans risque après une coupure réseau.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

Write-Host '== 1/2 Dépendances npm ==' -ForegroundColor Cyan
for ($i = 1; $i -le 3; $i++) {
    npm install --no-audit --no-fund --fetch-retries=6 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=180000 --fetch-timeout=600000
    if ($LASTEXITCODE -eq 0) { break }
    Write-Host "npm install a échoué (essai $i/3), nouvel essai..." -ForegroundColor Yellow
}
if ($LASTEXITCODE -ne 0) { throw 'npm install a échoué 3 fois : vérifier la connexion.' }

Write-Host '== 2/2 Android NDK + CMake ==' -ForegroundColor Cyan
$ndk = Join-Path $env:ANDROID_HOME 'ndk\27.1.12297006'
if (-not (Test-Path (Join-Path $ndk 'source.properties'))) {
    if (Test-Path $ndk) { Remove-Item -Recurse -Force $ndk }
    & (Join-Path $env:ANDROID_HOME 'cmdline-tools\latest\bin\sdkmanager.bat') 'ndk;27.1.12297006' 'cmake;3.22.1'
}
if (-not (Test-Path (Join-Path $ndk 'source.properties'))) { throw 'Installation du NDK incomplète : relancer le script.' }

Write-Host 'OK : poste prêt pour le build Android.' -ForegroundColor Green
