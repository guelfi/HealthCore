@echo off
setlocal enabledelayedexpansion

REM 🚀 HealthCore Full Stack Launcher (Windows Batch)
REM Gerencia API e Frontend com parâmetros: start/status/stop

REM Definir codepage para UTF-8
chcp 65001 > nul 2>&1

REM Configurações
set "API_PORT=5000"
set "FRONTEND_PORT=5005"
set "SCRIPT_DIR=%~dp0"

REM Função para obter IP local
:get_local_ip
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%j in ("%%i") do (
        set "LOCAL_IP=%%j"
        goto :ip_found
    )
)
set "LOCAL_IP=127.0.0.1"
:ip_found
set "LOCAL_IP=%LOCAL_IP: =%"
goto :eof

REM Função START
:start_servers
REM Header principal elegante
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🏥 HealthCore Platform                     ║
echo ║                   Full Stack Deployment                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Informações do sistema
call :get_local_ip
echo 📊 Informações do Sistema:
echo    • Data/Hora: %date% %time%
echo    • IP Local: %LOCAL_IP%
echo    • Sistema: Windows
echo.

echo 🌐 Configuração de Rede:
echo    • API Port: %API_PORT%
echo    • Frontend Port: %FRONTEND_PORT%
echo.

REM Iniciando API
echo 🔥 Iniciando Backend (API)...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
call "%SCRIPT_DIR%api.bat" start
set "API_STATUS=%errorlevel%"

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REM Aguarda um pouco antes de iniciar o frontend
timeout /t 2 /nobreak >nul

REM Iniciando Frontend
echo 🔥 Iniciando Frontend (Web)...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
call "%SCRIPT_DIR%front.bat" start
set "FRONTEND_STATUS=%errorlevel%"

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REM Resumo final
echo.
if %API_STATUS% equ 0 if %FRONTEND_STATUS% equ 0 (
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║                  🎉 DEPLOY COMPLETO! 🎉                     ║
    echo ╚══════════════════════════════════════════════════════════════╝
    echo.
    echo 🌐 URLs de Acesso Completas:
    echo.
    echo 📱 Frontend (Interface do Usuário):
    echo    • Local: http://localhost:%FRONTEND_PORT%
    echo    • Rede: http://%LOCAL_IP%:%FRONTEND_PORT%
    echo.
    echo 🔧 Backend (API):
    echo    • Local: http://localhost:%API_PORT%
    echo    • Rede: http://%LOCAL_IP%:%API_PORT%
    echo    • Swagger: http://localhost:%API_PORT%/swagger
    echo.
    echo 📋 Comandos Úteis:
    echo    • Parar API: %SCRIPT_DIR%api.bat stop
    echo    • Parar Frontend: %SCRIPT_DIR%front.bat stop
    echo    • Parar Ambos: %SCRIPT_DIR%servers.bat stop
    echo    • Ver Logs: type log\*.log
    echo.
    echo ✨ Plataforma HealthCore está pronta para uso!
) else (
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║                    ❌ ERRO NO DEPLOY                        ║
    echo ╚══════════════════════════════════════════════════════════════╝
    echo.
    if %API_STATUS% neq 0 (
        echo ❌ Falha ao iniciar a API
    )
    if %FRONTEND_STATUS% neq 0 (
        echo ❌ Falha ao iniciar o Frontend
    )
    echo Verifique os logs em: log\*.log
    exit /b 1
)
goto :eof

REM Função STATUS
:status_servers
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  🏥 HealthCore Platform                     ║
echo ║                   Status dos Serviços                       ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 📊 Status do Backend (API):
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
call "%SCRIPT_DIR%api.bat" status
echo.

echo 📊 Status do Frontend (Web):
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
call "%SCRIPT_DIR%front.bat" status
echo.
goto :eof

REM Função STOP
:stop_servers
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  🏥 HealthCore Platform                     ║
echo ║                   Parando Serviços                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🛑 Parando Backend (API)...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
call "%SCRIPT_DIR%api.bat" stop
echo.

echo 🛑 Parando Frontend (Web)...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
call "%SCRIPT_DIR%front.bat" stop
echo.

echo ✅ Todos os serviços parados.
goto :eof

REM Verificar parâmetros
if "%1"=="" (
    echo 📋 Comandos disponíveis:
    echo    • Iniciar Ambos: %0 start
    echo    • Status Ambos: %0 status
    echo    • Parar Ambos: %0 stop
    echo.
    echo 💡 Para mais informações: %0 {start^|status^|stop}
    exit /b 1
)

set "ACTION=%1"

REM Tratar comandos
if /i "%ACTION%"=="start" goto start_servers
if /i "%ACTION%"=="status" goto status_servers
if /i "%ACTION%"=="stop" goto stop_servers

echo ❌ Parâmetro inválido!
echo Uso: %0 {start^|status^|stop}
exit /b 1