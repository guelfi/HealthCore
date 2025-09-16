@echo off
setlocal enabledelayedexpansion

:: 🌐 HealthCore - Teste de Conectividade Distribuída (Windows Batch)
:: Script simples para testar conectividade com a API

title HealthCore - Teste de Conectividade

echo.
echo ================================================================
echo               HealthCore - Teste de Conectividade
echo                   Desenvolvimento Distribuido
echo ================================================================
echo.

:: Obter IP local
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set "ip=%%i"
    set "ip=!ip: =!"
    if not "!ip!"=="127.0.0.1" (
        set "LOCAL_IP=!ip!"
        goto :ip_found
    )
)
:ip_found

echo Informacoes da Maquina Local:
echo   • IP Local: %LOCAL_IP%
echo   • Computador: %COMPUTERNAME%
echo   • Data/Hora: %DATE% %TIME%
echo.

:: Solicitar IP da API
if "%~1"=="" (
    set /p API_IP="Digite o IP da maquina que roda a API (ex: 192.168.1.100): "
) else (
    set "API_IP=%~1"
)

if "%API_IP%"=="" (
    echo ERRO: IP da API e obrigatorio!
    pause
    exit /b 1
)

echo.
echo Testando conectividade com API em: %API_IP%
echo.

:: Teste de conectividade usando ping
echo Testando conectividade basica...
ping -n 1 -w 1000 %API_IP% >nul 2>&1
if errorlevel 1 (
    echo   ❌ Host %API_IP% nao esta acessivel
    echo   ❌ Verifique se o IP esta correto
) else (
    echo   ✅ Host %API_IP% esta acessivel
)
echo.

:: Teste de porta usando telnet (se disponível)
echo Testando porta 5000...
echo exit | telnet %API_IP% 5000 >nul 2>&1
if errorlevel 1 (
    echo   ❌ Porta 5000 nao esta acessivel em %API_IP%
    echo   ❌ Verifique se:
    echo      • A API esta rodando
    echo      • O firewall permite conexoes na porta 5000
    echo      • O IP esta correto
) else (
    echo   ✅ Porta 5000 esta aberta em %API_IP%
)
echo.

:: URLs importantes
echo URLs para acessar:
echo   • API: http://%API_IP%:5000
echo   • Swagger: http://%API_IP%:5000/swagger
echo   • Frontend (sua maquina): http://%LOCAL_IP%:5005
echo.

:: Configuração do .env
echo Configuracao do Frontend:
echo   Arquivo: src\Web\.env
echo   Configurar: VITE_API_BASE_URL=http://%API_IP%:5000
echo.

:: Comando para atualizar .env
echo Para atualizar automaticamente o arquivo .env, execute:
echo   cd src\Web
echo   powershell -Command "(Get-Content .env) -replace 'VITE_API_BASE_URL=.*', 'VITE_API_BASE_URL=http://%API_IP%:5000' | Set-Content .env"
echo.

:: Teste manual usando curl (se disponível)
where curl >nul 2>&1
if not errorlevel 1 (
    echo Testando endpoints da API...
    
    echo   Testando API base...
    curl -s --head --connect-timeout 5 http://%API_IP%:5000 >nul 2>&1
    if errorlevel 1 (
        echo     ❌ API base nao responde
    ) else (
        echo     ✅ API base OK
    )
    
    echo   Testando Swagger...
    curl -s --head --connect-timeout 5 http://%API_IP%:5000/swagger >nul 2>&1
    if errorlevel 1 (
        echo     ❌ Swagger nao responde
    ) else (
        echo     ✅ Swagger OK
    )
    
    echo   Testando endpoint pacientes...
    curl -s --head --connect-timeout 5 "http://%API_IP%:5000/pacientes?page=1&pageSize=10" >nul 2>&1
    if errorlevel 1 (
        echo     ❌ Endpoint pacientes nao responde
    ) else (
        echo     ✅ Endpoint pacientes OK
    )
    echo.
) else (
    echo NOTA: curl nao encontrado. Para testes mais detalhados,
    echo instale o curl ou use o PowerShell script: test-connectivity.ps1
    echo.
)

echo ================================================================
echo Teste concluido!
echo ================================================================
echo.
pause