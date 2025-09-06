#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

// Configurações
const CONFIG = {
  API_PORT: 5000,
  FRONTEND_PORT: 5005,
  API_PATH: 'src/Api',
  FRONTEND_PATH: 'src/Web',
  HEALTH_ENDPOINT: '/api/health'
};

// Cores ANSI
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Ícones
const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  rocket: '🚀',
  stop: '🛑',
  status: '📊',
  api: '🔧',
  frontend: '🌐',
  health: '💚'
};

// Variáveis globais para processos e PIDs
let apiProcess = null;
let frontendProcess = null;
let apiPid = null;
let frontendPid = null;

// Função para colorir texto
function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Função para exibir cabeçalho
function printHeader(title) {
  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize(`   🏥 MobileMed Service Manager - ${title}`, 'cyan'));
  console.log(colorize('='.repeat(60), 'cyan') + '\n');
}

// Função para obter IPs da máquina
function getNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        ips.push(interface.address);
      }
    }
  }
  
  return ips;
}

// Função para verificar se uma porta está em uso
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    
    server.listen(port, (err) => {
      if (err) {
        resolve(true);
      } else {
        server.once('close', () => resolve(false));
        server.close();
      }
    });
    
    server.on('error', () => resolve(true));
  });
}

// Função para matar processo em uma porta específica
async function killPort(port) {
  try {
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // Windows: usar netstat e taskkill
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
          try {
            await execAsync(`taskkill /F /PID ${pid}`);
            console.log(colorize(`${icons.success} Processo PID ${pid} terminado na porta ${port}`, 'green'));
          } catch (error) {
            console.log(colorize(`${icons.warning} Erro ao terminar PID ${pid}: ${error.message}`, 'yellow'));
          }
        }
      }
    } else {
      // Linux/macOS: usar lsof e kill
      const { stdout } = await execAsync(`lsof -ti:${port}`);
      const pids = stdout.trim().split('\n').filter(pid => pid);
      
      for (const pid of pids) {
        try {
          await execAsync(`kill -9 ${pid}`);
          console.log(colorize(`${icons.success} Processo PID ${pid} terminado na porta ${port}`, 'green'));
        } catch (error) {
          console.log(colorize(`${icons.warning} Erro ao terminar PID ${pid}: ${error.message}`, 'yellow'));
        }
      }
    }
    
    return true;
  } catch (error) {
    console.log(colorize(`${icons.info} Nenhum processo encontrado na porta ${port}`, 'blue'));
    return false;
  }
}

async function checkPidPortStatus(pid, port) {
  if (!pid) return false;

  try {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const currentPid = parts[parts.length - 1];
        if (currentPid === pid.toString()) {
          return true;
        }
      }
      return false;
    } else {
      const command = `lsof -i :${port} -P -n | grep ${pid} | grep LISTEN`;
      const { stdout } = await execAsync(command);
      return stdout.includes(pid.toString());
    }
  } catch (error) {
    return false;
  }
}

// Função para verificar saúde da API via curl
async function checkAPIHealth() {
  try {
    const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${CONFIG.API_PORT}${CONFIG.HEALTH_ENDPOINT}`);
    return stdout.trim() === '200';
  } catch (error) {
    return false;
  }
}

// Função para verificar saúde do Frontend via curl
async function checkFrontendHealth() {
  try {
    const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${CONFIG.FRONTEND_PORT}`);
    return stdout.trim() === '200';
  } catch (error) {
    return false;
  }
}

// Função para exibir URLs de acesso
function displayAccessURLs() {
  const networkIPs = getNetworkIPs();
  
  console.log(colorize('🌐 URLs de Acesso:', 'bold'));
  console.log('');
  
  // API URLs
  console.log(colorize('🔧 API (.NET):', 'blue'));
  console.log(`   Local:    http://localhost:${CONFIG.API_PORT}`);
  console.log(`   Health:   http://localhost:${CONFIG.API_PORT}${CONFIG.HEALTH_ENDPOINT}`);
  
  networkIPs.forEach(ip => {
    console.log(`   Network:  http://${ip}:${CONFIG.API_PORT}`);
  });
  
  console.log('');
  
  // Frontend URLs
  console.log(colorize('🌐 Frontend (React):', 'green'));
  console.log(`   Local:    http://localhost:${CONFIG.FRONTEND_PORT}`);
  
  networkIPs.forEach(ip => {
    console.log(`   Network:  http://${ip}:${CONFIG.FRONTEND_PORT}`);
  });
  
  console.log('');
}

// Função para iniciar serviços
async function startServices() {
  printHeader('Inicializando Serviços');
  
  console.log(colorize('🔍 Verificando portas...', 'yellow'));
  
  // Verificar e limpar portas se necessário
  const apiPortInUse = await isPortInUse(CONFIG.API_PORT);
  const frontendPortInUse = await isPortInUse(CONFIG.FRONTEND_PORT);
  
  if (apiPortInUse) {
    console.log(colorize(`${icons.warning} Porta ${CONFIG.API_PORT} em uso, liberando...`, 'yellow'));
    await killPort(CONFIG.API_PORT);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2s
  }
  
  if (frontendPortInUse) {
    console.log(colorize(`${icons.warning} Porta ${CONFIG.FRONTEND_PORT} em uso, liberando...`, 'yellow'));
    await killPort(CONFIG.FRONTEND_PORT);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2s
  }
  
  console.log(colorize(`${icons.rocket} Iniciando serviços...`, 'green'));
  console.log('');
  
  // Navegar para pasta da API e iniciar
  console.log(colorize(`${icons.api} Iniciando API .NET em ${CONFIG.API_PATH}...`, 'blue'));
  const apiPath = path.resolve(CONFIG.API_PATH);
  
  if (!fs.existsSync(apiPath)) {
    console.log(colorize(`${icons.error} Pasta da API não encontrada: ${apiPath}`, 'red'));
    return;
  }
  
  apiProcess = spawn('dotnet', ['run'], {
    cwd: apiPath,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true
  });
  apiProcess.unref(); // Desvincula o processo filho do pai
  apiPid = apiProcess.pid;
  console.log(colorize(`${icons.api} Iniciando API .NET na porta ${CONFIG.API_PORT} com PID ${apiPid}...`, 'blue'));
  
  // Aguardar um pouco antes de iniciar o frontend
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Navegar para pasta do Frontend e iniciar
  console.log(colorize(`${icons.frontend} Iniciando Frontend React em ${CONFIG.FRONTEND_PATH}...`, 'blue'));
  const frontendPath = path.resolve(CONFIG.FRONTEND_PATH);
  
  if (!fs.existsSync(frontendPath)) {
    console.log(colorize(`${icons.error} Pasta do Frontend não encontrada: ${frontendPath}`, 'red'));
    return;
  }
  
  frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: frontendPath,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true
  });
  frontendProcess.unref(); // Desvincula o processo filho do pai
  frontendPid = frontendProcess.pid;
  console.log(colorize(`${icons.frontend} Iniciando Frontend React na porta ${CONFIG.FRONTEND_PORT} com PID ${frontendPid}...`, 'blue'));
  
  // Processos iniciados em background sem listeners para liberar o terminal
  
  // Informar que os serviços estão sendo iniciados em background
  console.log('');
  console.log(colorize('🚀 Serviços iniciados em segundo plano!', 'green'));
  console.log(colorize('💡 Use "./mobilemed.sh status" para verificar o status dos serviços.', 'cyan'));
  console.log(colorize('💡 Use "./mobilemed.sh stop" para parar os serviços.', 'cyan'));
  console.log('');
  displayAccessURLs();
  console.log(colorize('⏳ Os serviços podem levar alguns segundos para inicializar completamente.', 'yellow'));
}

// Função para parar serviços
async function stopServices() {
  printHeader('Parando Serviços');
  
  console.log(colorize(`${icons.stop} Parando serviços...`, 'red'));
  
  // Parar processos se estiverem rodando
  if (apiProcess && !apiProcess.killed) {
    apiProcess.kill('SIGTERM');
    console.log(colorize(`${icons.success} Processo da API terminado`, 'green'));
  }
  
  if (frontendProcess && !frontendProcess.killed) {
    frontendProcess.kill('SIGTERM');
    console.log(colorize(`${icons.success} Processo do Frontend terminado`, 'green'));
  }
  
  // Garantir que as portas estejam livres
  const apiKilled = await killPort(CONFIG.API_PORT);
  const frontendKilled = await killPort(CONFIG.FRONTEND_PORT);
  
  console.log('');
  console.log(colorize('📊 Resultado:', 'bold'));
  console.log(`${icons.success} API (.NET): ${colorize('Parada', 'green')}`);
  console.log(`${icons.success} Frontend (React): ${colorize('Parado', 'green')}`);
  console.log('');
}

// Função para verificar status
async function checkStatus(showHeader = true) {
  if (showHeader) {
    printHeader('Status dos Serviços');
  }
  
  console.log(colorize('🔍 Verificando serviços com curl e PIDs registrados...', 'yellow'));
  
  const apiPortInUse = await isPortInUse(CONFIG.API_PORT);
  const frontendPortInUse = await isPortInUse(CONFIG.FRONTEND_PORT);
  
  let apiHealthy = false;
  let frontendHealthy = false;
  
  let apiStartedByMe = false;
  let frontendStartedByMe = false;

  if (apiPortInUse) {
    apiHealthy = await checkAPIHealth();
    apiStartedByMe = await checkPidPortStatus(apiPid, CONFIG.API_PORT);
  }
  
  if (frontendPortInUse) {
    frontendHealthy = await checkFrontendHealth();
    frontendStartedByMe = await checkPidPortStatus(frontendPid, CONFIG.FRONTEND_PORT);
  }
  
  console.log('');
  console.log(colorize('📊 Status dos Serviços:', 'bold'));
  
  // Status da API
  let apiStatus = 'Parado';
  let apiColor = 'red';
  let apiIcon = icons.error;
  
  if (apiPortInUse && apiHealthy) {
    apiStatus = 'Rodando';
    apiColor = 'green';
    apiIcon = icons.success;
    if (apiStartedByMe) {
      apiStatus += ` (PID: ${apiPid})`;
    } else {
      apiStatus += ' (Externo)';
    }
  } else if (apiPortInUse && !apiHealthy) {
    apiStatus = 'Iniciando';
    apiColor = 'yellow';
    apiIcon = icons.warning;
  }
  
  // Status do Frontend
  let frontendStatus = 'Parado';
  let frontendColor = 'red';
  let frontendIcon = icons.error;
  
  if (frontendPortInUse && frontendHealthy) {
    frontendStatus = 'Rodando';
    frontendColor = 'green';
    frontendIcon = icons.success;
    if (frontendStartedByMe) {
      frontendStatus += ` (PID: ${frontendPid})`;
    } else {
      frontendStatus += ' (Externo)';
    }
  } else if (frontendPortInUse && !frontendHealthy) {
    frontendStatus = 'Iniciando';
    frontendColor = 'yellow';
    frontendIcon = icons.warning;
  }
  
  console.log(`${apiIcon} API (.NET): ${colorize(apiStatus, apiColor)}`);
  console.log(`${frontendIcon} Frontend (React): ${colorize(frontendStatus, frontendColor)}`);
  console.log('');
  
  if (apiHealthy || frontendHealthy) {
    displayAccessURLs();
  }
}

// Função para exibir ajuda
function showHelp() {
  printHeader('Ajuda');
  
  console.log(colorize('Comandos disponíveis:', 'bold'));
  console.log('');
  console.log(colorize('  start', 'green') + '   - Iniciar todos os serviços');
  console.log(colorize('  stop', 'red') + '    - Parar todos os serviços');
  console.log(colorize('  status', 'blue') + '  - Verificar status dos serviços');
  console.log(colorize('  help', 'cyan') + '    - Exibir esta ajuda');
  console.log('');
  console.log(colorize('Exemplos:', 'bold'));
  console.log('  node mobilemed.js start');
  console.log('  ./mobilemed.sh status');
  console.log('  mobilemed.bat stop');
  console.log('');
}

// Função principal
async function main() {
  const command = process.argv[2];
  
  // Configurar handlers para encerramento gracioso
  process.on('SIGINT', async () => {
    console.log('\n' + colorize('🛑 Encerrando serviços...', 'yellow'));
    await stopServices();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n' + colorize('🛑 Encerrando serviços...', 'yellow'));
    await stopServices();
    process.exit(0);
  });
  
  switch (command) {
    case 'start':
      startServices(); // Não aguarda o retorno para liberar o terminal
      break;
    case 'stop':
      await stopServices();
      break;
    case 'status':
      await checkStatus();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.log(colorize('❌ Comando inválido. Use "help" para ver os comandos disponíveis.', 'red'));
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, startServices, stopServices, checkStatus };