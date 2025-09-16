/**
 * 🔐 Script para Testar Login da API
 * 
 * Execução: node scripts/test-login.js
 * 
 * Este script testa diferentes combinações de credenciais e endpoints
 * para descobrir o formato correto de autenticação.
 */

const http = require('http');

const API_BASE_URL = 'http://192.168.15.119:5000';

// Diferentes formatos de credenciais para testar
const CREDENTIALS_TO_TEST = [
  { username: 'guelfi', password: '@246!588' },
  { email: 'guelfi', password: '@246!588' },
  { email: 'guelfi@admin.com', password: '@246!588' },
  { email: 'admin@healthcore.com', password: '@246!588' },
  { usuario: 'guelfi', senha: '@246!588' },
  { login: 'guelfi', password: '@246!588' },
  { user: 'guelfi', pass: '@246!588' }
];

// Endpoints possíveis para login
const LOGIN_ENDPOINTS = [
  '/auth/login',
  '/api/auth/login', 
  '/login',
  '/api/login',
  '/authentication/login',
  '/user/login'
];

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function colorLog(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            success: res.statusCode >= 200 && res.statusCode < 300,
            rawData: responseData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            success: res.statusCode >= 200 && res.statusCode < 300,
            rawData: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testLogin() {
  console.log('\n🔐 TESTE DE LOGIN - MÚLTIPLOS FORMATOS');
  colorLog('='.repeat(60), 'cyan');

  let successfulLogin = null;

  for (const endpoint of LOGIN_ENDPOINTS) {
    colorLog(`\n📡 Testando endpoint: ${endpoint}`, 'blue');
    
    for (const credentials of CREDENTIALS_TO_TEST) {
      try {
        colorLog(`   Tentando: ${JSON.stringify(credentials)}`, 'gray');
        
        const response = await makeRequest(endpoint, 'POST', credentials);
        
        if (response.success) {
          const hasToken = response.data.token || response.data.accessToken || 
                          response.data.jwt || response.data.access_token;
          
          if (hasToken) {
            colorLog(`   ✅ SUCESSO!`, 'green');
            colorLog(`   📊 Status: ${response.statusCode}`, 'white');
            colorLog(`   🎫 Token: ${JSON.stringify(response.data)}`, 'cyan');
            successfulLogin = {
              endpoint,
              credentials,
              response: response.data
            };
            break;
          } else {
            colorLog(`   ⚠️  Sucesso mas sem token: ${JSON.stringify(response.data)}`, 'yellow');
          }
        } else {
          const errorMsg = response.data.message || response.data.error || 
                          response.rawData || `Status ${response.statusCode}`;
          colorLog(`   ❌ Falhou: ${errorMsg}`, 'red');
        }
      } catch (error) {
        colorLog(`   💥 Erro: ${error.message}`, 'red');
      }
    }
    
    if (successfulLogin) break;
  }

  colorLog('\n📊 RESUMO DOS TESTES:', 'blue');
  
  if (successfulLogin) {
    colorLog('✅ LOGIN ENCONTRADO!', 'green');
    colorLog(`Endpoint: ${successfulLogin.endpoint}`, 'white');
    colorLog(`Credenciais: ${JSON.stringify(successfulLogin.credentials)}`, 'white');
    colorLog(`Resposta: ${JSON.stringify(successfulLogin.response)}`, 'cyan');
    
    colorLog('\n🚀 PRÓXIMOS PASSOS:', 'blue');
    colorLog('1. Atualizar script de população com estas configurações', 'white');
    colorLog('2. Executar: node scripts/populate-database.js', 'white');
  } else {
    colorLog('❌ NENHUM LOGIN FUNCIONOU!', 'red');
    
    colorLog('\n🔧 SUGESTÕES:', 'blue');
    colorLog('1. 📋 Verificar Swagger UI:', 'white');
    colorLog(`   ${API_BASE_URL}/swagger/index.html`, 'gray');
    colorLog('2. 🔍 Procurar por:', 'white');
    colorLog('   - Seção "Auth" ou "Authentication"', 'gray');
    colorLog('   - Endpoint de login', 'gray');
    colorLog('   - Estrutura esperada do payload', 'gray');
    colorLog('3. 🧪 Testar manualmente no Swagger UI', 'white');
    colorLog('4. 👤 Confirmar se usuário "guelfi" existe', 'white');
    colorLog('5. 🔑 Verificar se a senha está correta', 'white');
  }

  colorLog('\n' + '='.repeat(60), 'cyan');
  return successfulLogin;
}

// Executar se chamado diretamente
if (require.main === module) {
  testLogin().then(result => {
    process.exit(result ? 0 : 1);
  }).catch(error => {
    colorLog(`💥 Erro fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { testLogin };