@echo off
setlocal enabledelayedexpansion

REM 🏥 MobileMed - Gerenciador de Serviços (Windows)
REM Script wrapper para o gerenciador pm2

chcp 65001 > nul

REM --- Cores (ANSI escape codes) ---
set "RED=\x1b[31m"
set "GREEN=\x1b[32m"
set "YELLOW=\x1b[33m"
set "BLUE=\x1b[34m"
set "CYAN=\x1b[36m"
set "NC=\x1b[0m"

REM --- Ícones ---
set "ICON_START=🚀"
set "ICON_STOP=🛑"
set "ICON_RESTART=🔄"
set "ICON_STATUS=📊"
set "ICON_LOGS=📄"
set "ICON_ERROR=❌"
set "ICON_INFO=ℹ️"

REM --- Funções Auxiliares ---
:print_header
    echo %CYAN%=========================================%NC%
    echo %CYAN%   🏥 MobileMed Service Manager - %~1 %NC%
    echo %CYAN%=========================================%NC%
    goto :eof

REM --- Verificações Iniciais ---
where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    call :print_header "Erro"
    echo %RED%%ICON_ERROR% pm2 não encontrado. Por favor, instale globalmente:%NC%
    echo %YELLOW%   npm install pm2 -g%NC%
    exit /b 1
)

REM --- Lógica Principal ---
set "COMMAND=%~1"
shift

if /i "%COMMAND%"=="start" (
    call :print_header "Start"
    echo %BLUE%%ICON_INFO% Iniciando serviços com pm2...%NC%
    pm2 start ecosystem.config.js %*
) else if /i "%COMMAND%"=="stop" (
    call :print_header "Stop"
    echo %BLUE%%ICON_INFO% Parando serviços com pm2...%NC%
    pm2 stop ecosystem.config.js %*
) else if /i "%COMMAND%"=="restart" (
    call :print_header "Restart"
    echo %BLUE%%ICON_INFO% Reiniciando serviços com pm2...%NC%
    pm2 restart ecosystem.config.js %*
) else if /i "%COMMAND%"=="status" (
    call :print_header "Status"
    echo %BLUE%%ICON_STATUS% Status dos serviços (pm2):%NC%
    node status.js
) else if /i "%COMMAND%"=="logs" (
    call :print_header "Logs"
    echo %BLUE%%ICON_LOGS% Visualizando logs com pm2...%NC%
    pm2 logs %*
) else (
    call :print_header "Comando Inválido"
    echo %YELLOW%Comando inválido: %COMMAND%%NC%
    echo Uso: %0 {start|stop|restart|status|logs} [options]
    exit /b 1
)
