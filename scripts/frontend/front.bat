@echo off
setlocal enabledelayedexpansion

REM MobileMed Frontend Launcher (Windows Batch)
REM Uso: front.bat [start|status|stop]

REM Configuracoes
set "FRONTEND_DIR=src\Web"
set "FRONTEND_PORT=5005"
set "LOG_DIR=log"
set "PID_FILE=%~dp0front.pid"

REM Criar diretorio de log se nao existir
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Mostrar header
echo ===============================================================================
echo                        MobileMed Frontend Manager
echo ===============================================================================
echo.

REM Verificar parametro
if "%1"=="" goto show_help
if /i "%1"=="start" goto start_frontend
if /i "%1"=="status" goto status_frontend  
if /i "%1"=="stop" goto stop_frontend
goto show_help

:show_help
echo Comandos disponiveis:
echo   start  - Iniciar o frontend
echo   status - Verificar status do frontend
echo   stop   - Parar o frontend
echo.
echo Uso: %0 [start^|status^|stop]
goto end

:start_frontend
echo Iniciando Frontend...
echo.

REM Verificar se o diretorio existe
if not exist "%FRONTEND_DIR%" (
    echo ERRO: Diretorio do projeto nao encontrado: %FRONTEND_DIR%
    goto end
)

REM Verificar se ja esta rodando
call :check_port
if !port_in_use! equ 1 (
    echo AVISO: Porta %FRONTEND_PORT% ja esta em uso!
    echo Parando processo existente...
    call :kill_port_process
)

REM Navegar para o diretorio do frontend
pushd "%FRONTEND_DIR%"

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo ERRO: Falha na instalacao das dependencias
        popd
        goto end
    )
)

REM Iniciar o frontend
echo Iniciando servidor de desenvolvimento...
echo Porta: %FRONTEND_PORT%
echo.
echo Aguarde alguns segundos para o Vite compilar...
echo.
echo URLs de acesso:
echo   Local: http://localhost:%FRONTEND_PORT%
echo.

REM Iniciar em nova janela
start "MobileMed Frontend" cmd /k "npm run dev"

REM Aguardar um pouco para o servidor iniciar
echo Aguardando servidor iniciar...
timeout /t 8 /nobreak > nul

REM Voltar ao diretorio original
popd

echo Frontend iniciado! Verifique a janela que abriu.
echo Use '%0 status' para verificar o status.
goto end

:status_frontend
echo Verificando status do frontend...
echo.

call :check_port
if !port_in_use! equ 1 (
    echo STATUS: Frontend esta RODANDO
    echo Porta: %FRONTEND_PORT%
    echo URL: http://localhost:%FRONTEND_PORT%
    
    REM Tentar obter o PID do processo
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":%FRONTEND_PORT%" ^| findstr "LISTENING"') do (
        echo PID: %%i
        goto status_end
    )
) else (
    echo STATUS: Frontend NAO esta rodando
    echo Porta %FRONTEND_PORT% esta livre
)

:status_end
goto end

:stop_frontend
echo Parando Frontend...
echo.

call :check_port
if !port_in_use! equ 1 (
    call :kill_port_process
    echo Frontend parado com sucesso!
) else (
    echo Frontend nao estava rodando.
)
goto end

REM Funcao para verificar se a porta esta em uso
:check_port
set port_in_use=0
netstat -ano | findstr ":%FRONTEND_PORT%" | findstr "LISTENING" > nul
if !errorlevel! equ 0 set port_in_use=1
goto :eof

REM Funcao para matar processo na porta
:kill_port_process
for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":%FRONTEND_PORT%" ^| findstr "LISTENING"') do (
    echo Matando processo %%i...
    taskkill /pid %%i /f > nul 2>&1
)
goto :eof

:end
echo.