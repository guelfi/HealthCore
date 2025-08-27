@echo off
setlocal enabledelayedexpansion

echo ========================================
echo 🧪 Teste de Scripts Frontend Windows
echo ========================================
echo.

REM Testa se o Node.js está instalado
echo 📦 Verificando Node.js...
node --version >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ Node.js encontrado: 
    node --version
) else (
    echo ❌ Node.js não encontrado! Instale o Node.js primeiro.
    exit /b 1
)

echo.

REM Testa se o NPM está disponível
echo 📦 Verificando NPM...
npm --version >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ NPM encontrado: 
    npm --version
) else (
    echo ❌ NPM não encontrado!
    exit /b 1
)

echo.

REM Verifica se o diretório do projeto existe
if exist "src\Web" (
    echo ✅ Diretório do projeto encontrado: src\Web
) else (
    echo ❌ Diretório do projeto não encontrado: src\Web
    exit /b 1
)

echo.

REM Verifica se package.json existe
if exist "src\Web\package.json" (
    echo ✅ package.json encontrado
) else (
    echo ❌ package.json não encontrado em src\Web
    exit /b 1
)

echo.

REM Testa conectividade de rede (porta 5005)
echo 🌐 Verificando se a porta 5005 está livre...
netstat -an | findstr ":5005" >nul 2>&1
if !errorlevel! equ 0 (
    echo ⚠️  Porta 5005 já está em uso
) else (
    echo ✅ Porta 5005 está livre
)

echo.
echo 🎯 Teste básico concluído!
echo 💡 Para executar o frontend, use:
echo    • front.bat start
echo    • front.ps1 start
echo.
pause