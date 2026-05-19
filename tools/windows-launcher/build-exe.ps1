$ErrorActionPreference = 'Stop'

$ProjectRoot = Resolve-Path "$PSScriptRoot\..\.."
$JdkHome = 'C:\Program Files\Java\jdk-24'
$Java = Join-Path $JdkHome 'bin\java.exe'
$Javac = Join-Path $JdkHome 'bin\javac.exe'
$Jar = Join-Path $JdkHome 'bin\jar.exe'
$JPackage = Join-Path $JdkHome 'bin\jpackage.exe'

foreach ($Tool in @($Java, $Javac, $Jar, $JPackage)) {
    if (-not (Test-Path $Tool)) {
        throw "Ferramenta nao encontrada: $Tool"
    }
}

$LauncherRoot = $PSScriptRoot
$BuildDir = Join-Path $LauncherRoot 'build'
$ClassesDir = Join-Path $BuildDir 'classes'
$JarPath = Join-Path $BuildDir 'aion-company-launcher.jar'
$OutputDir = Join-Path $ProjectRoot 'dist\windows'
$AppImageDir = Join-Path $OutputDir 'AION Company'

Remove-Item $BuildDir -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $OutputDir -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $ClassesDir, $OutputDir | Out-Null

Write-Host 'Building backend jar...'
Push-Location (Join-Path $ProjectRoot 'backend')
try {
    $env:JAVA_HOME = $JdkHome
    $env:Path = "$JdkHome\bin;$env:Path"
    mvn -DskipTests package
}
finally {
    Pop-Location
}

Write-Host 'Building frontend assets...'
Push-Location (Join-Path $ProjectRoot 'frontend')
try {
    npm run build
}
finally {
    Pop-Location
}

Write-Host 'Compiling launcher...'
& $Javac -encoding UTF-8 -d $ClassesDir (Join-Path $LauncherRoot 'src\AionCompanyLauncher.java')
& $Jar --create --file $JarPath --main-class AionCompanyLauncher -C $ClassesDir .

Write-Host 'Creating Windows app image...'
& $JPackage `
    --type app-image `
    --name 'AION Company' `
    --input $BuildDir `
    --main-jar (Split-Path $JarPath -Leaf) `
    --main-class AionCompanyLauncher `
    --dest $OutputDir `
    --win-console

$ExePath = Join-Path $AppImageDir 'AION Company.exe'
if (-not (Test-Path $ExePath)) {
    throw "EXE nao foi gerado: $ExePath"
}

Write-Host ""
Write-Host "EXE gerado com sucesso: $ExePath"
Write-Host "Dica: se mover a pasta, defina AION_TASKMASTER_HOME=$ProjectRoot antes de executar."
