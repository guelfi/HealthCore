@echo off
echo Iniciando MobileMed Frontend...
echo.

REM Verificar se o diretorio existe
if not exist "src\Web" (
    echo ERRO: Diretorio src\Web nao encontrado!
    pause
    exit /b 1
)

REM Navegar para o diretorio do frontend
cd /d "src\Web"

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo ERRO: Falha na instalacao das dependencias
        pause
        exit /b 1
    )
)

echo.
echo ===============================================================================
echo Frontend sera iniciado em: http://localhost:5005
echo ===============================================================================
echo.
echo Para parar o servidor, pressione Ctrl+C na janela que abrir
echo.

REM Iniciar o servidor
npm run dev

pause