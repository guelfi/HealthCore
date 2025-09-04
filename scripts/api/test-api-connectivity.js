/**
 * 🌐 Script para Testar Conectividade da API
 * 
 * Execução: node scripts/test-api-connectivity.js
 * 
 * Este script testa a conectividade com diferentes endpoints da API
 * e fornece instruções para resolver problemas de conectividade.
 */

const http = require('http');

// Endpoints para testar
const API_ENDPOINTS = [
  'http://192.168.15.119:5000',  // Backend no macOS
  'http://localhost:5000',       // Backend local
  'http://127.0.0.1:5000'        // Backend local alternativo
];

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    try {
      const url = new URL(endpoint + '/health');
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        timeout: 3000
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: data,
            endpoint: endpoint
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message,
          endpoint: endpoint
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Timeout (3s)',
          endpoint: endpoint
        });
      });

      req.setTimeout(3000);
      req.end();
    } catch (error) {
      resolve({
        success: false,
        error: error.message,
        endpoint: endpoint
      });
    }
  });
}

async function testAllEndpoints() {
  console.log('\n🌐 TESTE DE CONECTIVIDADE DA API');
  colorLog('='.repeat(50), 'cyan');

  let workingEndpoint = null;

  for (const endpoint of API_ENDPOINTS) {
    colorLog(`\n📡 Testando: ${endpoint}`, 'cyan');
    
    const result = await testEndpoint(endpoint);
    
    if (result.success) {
      colorLog(`✅ SUCESSO! API está rodando`, 'green');
      colorLog(`   Status: ${result.status}`, 'white');
      if (result.data) {
        colorLog(`   Resposta: ${result.data.substring(0, 100)}...`, 'gray');
      }
      workingEndpoint = endpoint;
      break;
    } else {
      colorLog(`❌ FALHOU: ${result.error}`, 'red');
    }
  }

  console.log('\n');
  colorLog('📊 RESUMO:', 'blue');
  
  if (workingEndpoint) {
    colorLog(`✅ API encontrada em: ${workingEndpoint}`, 'green');
    colorLog('🚀 Agora você pode executar o script de população:', 'cyan');
    colorLog('   node scripts/populate-database.js', 'white');
  } else {
    colorLog('❌ Nenhuma API encontrada!', 'red');
    
    colorLog('\n🔧 SOLUÇÕES:', 'blue');
    colorLog('1. 🖥️  No macOS, iniciar o backend:', 'white');
    colorLog('   cd [projeto] && ./scripts/api.sh', 'gray');
    colorLog('   OU: dotnet run --project src/Api', 'gray');
    
    colorLog('\n2. 🌐 Verificar conectividade de rede:', 'white');
    colorLog('   ping 192.168.15.119', 'gray');
    
    colorLog('\n3. 🔍 Verificar se o IP está correto:', 'white');
    colorLog('   O backend está realmente no IP 192.168.15.119?', 'gray');
    
    colorLog('\n4. 🚪 Verificar portas:', 'white');
    colorLog('   A porta 5000 está aberta no macOS?', 'gray');
    
    colorLog('\n5. 🛡️  Verificar firewall:', 'white');
    colorLog('   O firewall do macOS está bloqueando a porta 5000?', 'gray');
  }

  colorLog('\n' + '='.repeat(50), 'cyan');
  return workingEndpoint;
}

// Executar se chamado diretamente
if (require.main === module) {
  testAllEndpoints().then(result => {
    process.exit(result ? 0 : 1);
  });
}

module.exports = { testAllEndpoints };