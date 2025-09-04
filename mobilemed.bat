@echo off
setlocal enabledelayedexpansion

REM 🏥 MobileMed - Gerenciador de Serviços (Windows)
REM Script wrapper para o gerenciador Node.js

REM Definir codepage para UTF-8
chcp 65001 > nul 2>&1

REM Verificar se Node.js está instalado
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js primeiro.
    echo 💡 Download: https://nodejs.org/
    pause
    exit /b 1
)

REM Executar o script Node.js principal
node "%~dp0mobilemed.js" %*

REM Pausar apenas se executado diretamente (não via linha de comando)
if "%1"=="" pause