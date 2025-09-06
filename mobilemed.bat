@echo off
setlocal enabledelayedexpansion

REM 🏥 MobileMed - Gerenciador de Serviços (Windows)
REM Script wrapper para o mobilemed.js

chcp 65001 > nul

REM --- Verificações Iniciais ---
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js.
    exit /b 1
)

REM --- Verificar se mobilemed.js existe ---
if not exist "mobilemed.js" (
    echo ❌ Arquivo mobilemed.js não encontrado.
    exit /b 1
)

REM --- Executar mobilemed.js ---
node mobilemed.js %*
