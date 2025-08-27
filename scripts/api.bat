@echo off
setlocal enabledelayedexpansion

REM 🚀 MobileMed API Manager (Windows Batch)
REM Gerencia a API com parâmetros: start/status/stop

REM Definir codepage para UTF-8
chcp 65001 > nul 2>&1

REM Variáveis de configuração
set "API_PROJECT_PATH=src\Api"
set "API_PORT=5000"
set "LOG_FILE=..\log\api.log"
set "PID_FILE=%~dp0api.pid"

REM Função para mostrar header
:show_header
cls
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                             MobileMed API Manager                           ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
goto :eof

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

REM Função para criar diretório de log
:create_log_dir
if not exist "..\log" mkdir "..\log"
goto :eof

REM Função para verificar se API está rodando
:is_running
if exist "%PID_FILE%" (
    set /p PID=<"%PID_FILE%"
    tasklist /fi "pid eq !PID!" 2>nul | find "!PID!" >nul
    if !errorlevel! equ 0 (
        set "RUNNING_PID=!PID!"
        goto :eof
    ) else (
        del "%PID_FILE%" 2>nul
    )
)
set "RUNNING_PID="
goto :eof

REM Função para parar processo existente
:stop_process
echo ⚠️  Parando serviço...

if exist "%PID_FILE%" (
    set /p OLD_PID=<"%PID_FILE%"
    taskkill /pid !OLD_PID! /f >nul 2>&1
    echo ✅ Processo !OLD_PID! encerrado.
    timeout /t 2 /nobreak >nul
    del "%PID_FILE%" 2>nul
)

REM Mata qualquer processo dotnet na porta
for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":5000"') do (
    tasklist /fi "pid eq %%i" | findstr /i "dotnet" >nul 2>&1
    if !errorlevel! equ 0 (
        taskkill /pid %%i /f >nul 2>&1
    )
)

echo ✅ Serviço parado.
goto :eof

REM Função START
:start_api
call :create_log_dir
call :show_header

REM Verifica se já está rodando
call :is_running
if defined RUNNING_PID (
    echo ⚠️  API já está em execução!
    exit /b 0
)

REM Libera a porta se estiver em uso
for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":5000"') do (
    tasklist /fi "pid eq %%i" | findstr /i "dotnet" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ⚠️  Porta 5000 em uso por processo .NET %%i. Matando...
        taskkill /pid %%i /f >nul 2>&1
    )
)
timeout /t 2 /nobreak >nul

REM Informações do sistema
call :get_local_ip
echo 📡 Informações de Rede:
echo    • IP Local: %LOCAL_IP%
echo    • Porta: %API_PORT%
echo.

echo 🌐 URLs de Acesso:
echo    • Local: http://localhost:%API_PORT%
echo    • Rede: http://%LOCAL_IP%:%API_PORT%
echo    • Swagger: http://%LOCAL_IP%:%API_PORT%/swagger
echo.

REM Navega para o diretório do projeto
if not exist "%API_PROJECT_PATH%" (
    echo ❌ Diretório do projeto não encontrado: %API_PROJECT_PATH%
    exit /b 1
)

pushd "%API_PROJECT_PATH%"

REM Prepara o ambiente
echo ⚙️  Preparando ambiente...

REM Verifica se é um projeto .NET e compila
for %%f in (*.csproj) do (
    echo 🔨 Compilando projeto .NET...
    dotnet build -c Release > "%LOG_FILE%" 2>&1
    if !errorlevel! neq 0 (
        echo ❌ Erro na compilação! Verifique o log em %LOG_FILE%
        popd
        exit /b 1
    )
    goto :build_done
)
:build_done

REM Inicia a API em segundo plano
echo 🚀 Iniciando API...
start /b dotnet run > "%LOG_FILE%" 2>&1

REM Aguarda inicialização e obtém o PID
echo ⏳ Aguardando inicialização...
timeout /t 5 /nobreak >nul

REM Procura pelo processo da API
set "API_PID="
for /f "tokens=2" %%i in ('tasklist ^| findstr "dotnet.exe"') do (
    netstat -ano | findstr ":5000" | findstr "%%i" >nul 2>&1
    if !errorlevel! equ 0 (
        set "API_PID=%%i"
        goto :api_pid_found
    )
)

:api_pid_found
if defined API_PID (
    echo %API_PID% > "%PID_FILE%"
    echo ✅ API iniciada com sucesso!
    echo ✅ PID: %API_PID%
) else (
    echo ❌ Falha ao obter PID da API! Verifique o log em %LOG_FILE%
    popd
    exit /b 1
)

REM Testa conectividade
echo 🔍 Testando conectividade...
timeout /t 3 /nobreak >nul

curl -s --head http://localhost:%API_PORT%/swagger >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ API respondendo corretamente
) else (
    echo ❌ API não está respondendo
)

popd
echo.
goto :eof

REM Função STATUS
:status_api
call :show_header

call :is_running
if defined RUNNING_PID (
    echo ✅ Status: API em execução
    echo    • PID: %RUNNING_PID%
    
    call :get_local_ip
    echo    • IP Local: %LOCAL_IP%
    echo    • Porta: %API_PORT%
    echo.
    
    echo 🌐 URLs Ativas:
    echo    • Local: http://localhost:%API_PORT%
    echo    • Rede: http://%LOCAL_IP%:%API_PORT%
    echo    • Swagger: http://%LOCAL_IP%:%API_PORT%/swagger
) else (
    echo ❌ Status: API não está em execução
    
    REM Verifica se há processo na porta
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":5000"') do (
        for /f "tokens=1" %%j in ('tasklist /fi "pid eq %%i" /fo csv /nh') do (
            echo ⚠️  Porta 5000 está em uso por processo %%i - %%j
        )
    )
)

echo.
echo 📋 Log: %LOG_FILE%
echo.
goto :eof

REM Função STOP
:stop_api
call :show_header
call :stop_process
goto :eof

REM Verificar parâmetros
if "%1"=="" (
    echo 📋 Comandos disponíveis:
    echo    • Iniciar: %0 start
    echo    • Status: %0 status
    echo    • Parar: %0 stop
    echo.
    echo 💡 Para mais informações: %0 {start^|status^|stop}
    exit /b 1
)

set "ACTION=%1"

REM Tratar comandos
if /i "%ACTION%"=="start" goto start_api
if /i "%ACTION%"=="status" goto status_api
if /i "%ACTION%"=="stop" goto stop_api

echo ❌ Parâmetro inválido!
echo Uso: %0 {start^|status^|stop}
exit /b 1