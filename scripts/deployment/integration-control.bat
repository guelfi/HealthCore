@echo off
echo.
echo =====================================================
echo 🚀 MOBILEMED - CONTROLE DE INTEGRAÇÃO SEM ADMIN
echo =====================================================
echo.

:menu
echo.
echo Escolha uma opção:
echo.
echo 1. 📊 Verificar status das integrações
echo 2. 🔬 Popular banco com dados de teste
echo 3. 🌐 Testar conectividade com API
echo 4. 🚀 Iniciar frontend
echo 5. 📋 Ver próximas tarefas
echo 0. ❌ Sair
echo.
set /p choice="Digite sua escolha (0-5): "

if "%choice%"=="1" goto status
if "%choice%"=="2" goto populate
if "%choice%"=="3" goto connectivity
if "%choice%"=="4" goto frontend
if "%choice%"=="5" goto tasks
if "%choice%"=="0" goto exit
goto menu

:status
echo.
echo 📊 Verificando status das integrações...
node scripts/check-integration-status.js
pause
goto menu

:populate
echo.
echo 🔬 Populando banco com dados de teste...
node scripts/populate-database.js
pause
goto menu

:connectivity
echo.
echo 🌐 Testando conectividade com API...
echo Testando ping para 192.168.15.119...
ping -n 4 192.168.15.119
echo.
echo Testando endpoint da API...
curl -s http://192.168.15.119:5000/health
echo.
pause
goto menu

:frontend
echo.
echo 🚀 Iniciando frontend...
echo Navegando para pasta Web...
cd src\Web
echo Iniciando servidor de desenvolvimento...
npm run dev
pause
goto menu

:tasks
echo.
echo 📋 Próximas tarefas da Etapa 1 (Pacientes):
echo.
echo 1. Validar endpoints de pacientes na API
echo 2. Criar PacienteService.ts real
echo 3. Criar hook usePacientes.ts
echo 4. Atualizar componentes para usar API
echo 5. Remover dados mockados
echo.
echo Para começar, execute:
echo   node scripts/populate-database.js
echo   cd src\Web && npm run dev
echo.
pause
goto menu

:exit
echo.
echo 👋 Até logo! Bom desenvolvimento!
echo.
exit /b 0