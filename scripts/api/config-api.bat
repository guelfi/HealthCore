@echo off
setlocal enabledelayedexpansion

:: 🔧 HealthCore - Configurador de API (Windows)
:: Script para atualizar rapidamente a URL da API no arquivo .env

title HealthCore - Configurador de API

echo.
echo ================================================================
echo               HealthCore - Configurador de API
echo ================================================================
echo.

:: Verificar se estamos no diretório correto
if not exist "src\Web\.env" (
    echo ERRO: Arquivo .env nao encontrado!
    echo.
    echo Certifique-se de estar no diretorio raiz do projeto
    echo (onde existe a pasta src\Web\)
    echo.
    echo Estrutura esperada:
    echo   %CD%\src\Web\.env
    echo.
    pause
    exit /b 1
)

:: Mostrar configuração atual
echo Configuracao atual:
echo ================================================================
findstr "VITE_API_BASE_URL" src\Web\.env
echo ================================================================
echo.

:: Solicitar novo IP
if "%~1"=="" (
    echo Opcoes de configuracao:
    echo.
    echo 1. Desenvolvimento LOCAL  (localhost:5000)
    echo 2. Desenvolvimento REDE   (IP da outra maquina)
    echo 3. IP especifico
    echo.
    set /p choice="Escolha uma opcao (1-3): "
    
    if "!choice!"=="1" (
        set "NEW_API_URL=http://localhost:5000"
        echo Configurando para desenvolvimento LOCAL...
    ) else if "!choice!"=="2" (
        set /p API_IP="Digite o IP da maquina que roda a API: "
        set "NEW_API_URL=http://!API_IP!:5000"
    ) else if "!choice!"=="3" (
        set /p NEW_API_URL="Digite a URL completa da API: "
    ) else (
        echo Opcao invalida!
        pause
        exit /b 1
    )
) else (
    set "NEW_API_URL=http://%~1:5000"
)

if "%NEW_API_URL%"=="" (
    echo ERRO: URL da API e obrigatoria!
    pause
    exit /b 1
)

echo.
echo Atualizando configuracao para: %NEW_API_URL%
echo.

:: Backup do arquivo original
copy "src\Web\.env" "src\Web\.env.backup" >nul 2>&1

:: Atualizar arquivo .env usando PowerShell
powershell -Command "(Get-Content 'src\Web\.env') -replace 'VITE_API_BASE_URL=.*', 'VITE_API_BASE_URL=%NEW_API_URL%' | Set-Content 'src\Web\.env'"

if errorlevel 1 (
    echo ERRO: Falha ao atualizar arquivo .env
    echo Restaurando backup...
    copy "src\Web\.env.backup" "src\Web\.env" >nul 2>&1
    pause
    exit /b 1
)

echo ✅ Arquivo .env atualizado com sucesso!
echo.

:: Mostrar nova configuração
echo Nova configuracao:
echo ================================================================
findstr "VITE_API_BASE_URL" src\Web\.env
echo ================================================================
echo.

:: Instruções para próximos passos
echo Proximos passos:
echo.
echo 1. Para iniciar o frontend:
echo    cd src\Web
echo    npm run dev
echo.
echo 2. Frontend estara disponivel em:
echo    http://localhost:5005
echo.
echo 3. Para testar conectividade com a API:
echo    scripts\test-connectivity.bat
echo.

pause