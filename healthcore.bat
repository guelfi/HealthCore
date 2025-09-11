@echo off
setlocal enabledelayedexpansion

REM 🏥 HealthCore - Gerenciador de Serviços (Windows)
REM Script wrapper para o healthcore.js

chcp 65001 > nul

REM --- Verificações Iniciais ---
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js.
    exit /b 1
)

REM --- Verificar se healthcore.js existe ---
if not exist "healthcore.js" (
    echo ❌ Arquivo healthcore.js não encontrado.
    exit /b 1
)

REM --- Executar healthcore.js ---
node healthcore.js %*
