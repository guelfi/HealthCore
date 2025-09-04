/**
 * 🚀 Script para Popular Banco de Dados com Dados Reais
 * 
 * Execução: node scripts/populate-database.js
 * 
 * Este script adiciona dados de teste reais no banco via API,
 * permitindo testar a integração frontend-backend com dados reais
 * sem precisar de privilégios administrativos.
 */

const https = require('https');
const http = require('http');

// Configuração da API - testa múltiplos endpoints
const API_ENDPOINTS = [
  'http://192.168.15.119:5000',  // Backend no macOS
  'http://localhost:5000',       // Backend local
  'http://127.0.0.1:5000'        // Backend local alternativo
];

let API_BASE_URL = null; // Será definido após teste de conectividade
const ADMIN_CREDENTIALS = {
  username: 'guelfi',
  password: '@246!588'
};

// Endpoint correto descoberto no teste
const LOGIN_ENDPOINT = '/auth/login';

// Dados de teste realistas
const PACIENTES_TESTE = [
  {
    nome: 'Maria Silva Santos',
    documento: '12345678901',
    dataNascimento: '1985-03-15',
    telefone: '(11) 98765-4321',
    email: 'maria.silva@email.com',
    endereco: 'Rua das Flores, 123 - São Paulo, SP'
  },
  {
    nome: 'João Pedro Oliveira',
    documento: '98765432100',
    dataNascimento: '1978-07-22',
    telefone: '(21) 99887-6543',
    email: 'joao.pedro@email.com',
    endereco: 'Av. Brasil, 456 - Rio de Janeiro, RJ'
  },
  {
    nome: 'Ana Carolina Ferreira',
    documento: '45678912300',
    dataNascimento: '1992-11-08',
    telefone: '(31) 97654-3210',
    email: 'ana.carolina@email.com',
    endereco: 'Rua Minas Gerais, 789 - Belo Horizonte, MG'
  },
  {
    nome: 'Carlos Eduardo Lima',
    documento: '78912345600',
    dataNascimento: '1965-05-30',
    telefone: '(85) 96543-2109',
    email: 'carlos.eduardo@email.com',
    endereco: 'Rua Ceará, 321 - Fortaleza, CE'
  },
  {
    nome: 'Fernanda Costa Almeida',
    documento: '32165498700',
    dataNascimento: '1989-12-03',
    telefone: '(51) 95432-1098',
    email: 'fernanda.costa@email.com',
    endereco: 'Av. Rio Grande, 654 - Porto Alegre, RS'
  }
];

const EXAMES_TESTE = [
  {
    pacienteId: null, // Will be populated after patient creation
    modalidade: 'CT',
    descricao: 'Tomografia computadorizada do tórax',
    dataExame: '2025-08-25',
    observacoes: 'Exame realizado com contraste',
    idempotencyKey: 'exam-001-ct-torax'
  },
  {
    pacienteId: null,
    modalidade: 'MR',
    descricao: 'Ressonância magnética do crânio',
    dataExame: '2025-08-26',
    observacoes: 'Investigação de cefaleia',
    idempotencyKey: 'exam-002-mr-cranio'
  },
  {
    pacienteId: null,
    modalidade: 'US',
    descricao: 'Ultrassom abdominal total',
    dataExame: '2025-08-27',
    observacoes: 'Avaliação de dor abdominal',
    idempotencyKey: 'exam-003-us-abdomen'
  },
  {
    pacienteId: null,
    modalidade: 'DX',
    descricao: 'Radiografia de tórax PA e perfil',
    dataExame: '2025-08-24',
    observacoes: 'Controle pós-pneumonia',
    idempotencyKey: 'exam-004-dx-torax'
  },
  {
    pacienteId: null,
    modalidade: 'MG',
    descricao: 'Mamografia bilateral',
    dataExame: '2025-08-23',
    observacoes: 'Rastreamento anual',
    idempotencyKey: 'exam-005-mg-bilateral'
  }
];

// Função para fazer requisições HTTP
function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    if (!API_BASE_URL) {
      reject(new Error('API_BASE_URL não foi definida. Execute testConnectivity() primeiro.'));
      return;
    }
    
    const url = new URL(API_BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
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
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            success: res.statusCode >= 200 && res.statusCode < 300
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

// Função para testar conectividade com múltiplos endpoints
async function testConnectivity() {
  colorLog('📡 Testando conectividade com múltiplos endpoints...', 'cyan');
  
  for (const endpoint of API_ENDPOINTS) {
    try {
      colorLog(`   Testando: ${endpoint}...`, 'yellow');
      
      // Testa primeiro com root da API (sempre existe)
      const url = new URL(endpoint);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: '/',
        method: 'GET',
        timeout: 3000
      };

      const result = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          resolve({ success: res.statusCode >= 200 && res.statusCode < 500, status: res.statusCode });
        });
        
        req.on('error', (error) => {
          resolve({ success: false, error: error.message });
        });
        
        req.on('timeout', () => {
          req.destroy();
          resolve({ success: false, error: 'Timeout' });
        });
        
        req.setTimeout(3000);
        req.end();
      });
      
      if (result.success) {
        API_BASE_URL = endpoint;
        colorLog(`   ✅ ${endpoint} está acessível!`, 'green');
        colorLog(`   📋 Swagger disponível em: ${endpoint}/swagger`, 'cyan');
        colorLog(`   ⚠️  Nota: Endpoint /health será criado para futuras verificações`, 'yellow');
        return true;
      } else {
        colorLog(`   ⚠️  ${endpoint} - ${result.error || result.status}`, 'yellow');
      }
    } catch (error) {
      colorLog(`   ❌ ${endpoint} - ${error.message}`, 'red');
    }
  }
  
  colorLog('❌ Nenhuma API encontrada!', 'red');
  colorLog('', 'white');
  colorLog('🔧 SOLUÇÕES:', 'blue');
  colorLog('1. Iniciar backend no macOS: ./scripts/api.sh', 'white');
  colorLog('2. Ou executar: dotnet run --project src/Api', 'white');
  colorLog('3. Verificar se o IP 192.168.15.119 está correto', 'white');
  colorLog('4. Testar conectividade: ping 192.168.15.119', 'white');
  return false;
}

// Função principal
async function populateDatabase() {
  console.log('\n🚀 INICIANDO POPULAÇÃO DO BANCO DE DADOS\n');
  
  try {
    // 1. Testar conectividade
    const isConnected = await testConnectivity();
    
    if (!isConnected) {
      return;
    }
    
    colorLog(`✅ Usando API: ${API_BASE_URL}`, 'green');

    // 2. Fazer login com as credenciais corretas
    colorLog('\n🔐 Fazendo login...', 'cyan');
    const loginResponse = await makeRequest(LOGIN_ENDPOINT, 'POST', ADMIN_CREDENTIALS);
    
    if (!loginResponse.success || !loginResponse.data.token) {
      colorLog('❌ Falha no login!', 'red');
      console.log('Resposta:', loginResponse);
      return;
    }
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    colorLog(`✅ Login realizado com sucesso!`, 'green');
    colorLog(`👤 Usuário: ${user.username} (${user.role === 1 ? 'Administrador' : 'Usuário'})`, 'cyan');
    colorLog(`🎫 Token: ${token.substring(0, 30)}...`, 'gray');

    // 3. Popular pacientes
    colorLog('\n👥 Criando pacientes de teste...', 'cyan');
    const pacientesIds = [];
    
    for (let i = 0; i < PACIENTES_TESTE.length; i++) {
      const paciente = PACIENTES_TESTE[i];
      colorLog(`   Criando: ${paciente.nome}...`, 'yellow');
      
      const response = await makeRequest('/pacientes', 'POST', paciente, token);
      
      if (response.success) {
        pacientesIds.push(response.data.id);
        colorLog(`   ✅ ${paciente.nome} criado com ID: ${response.data.id}`, 'green');
      } else {
        colorLog(`   ⚠️  ${paciente.nome} - ${response.data.message || 'Erro desconhecido'}`, 'yellow');
      }
    }

    // 4. Popular exames (vinculados aos pacientes)
    if (pacientesIds.length > 0) {
      colorLog('\n🔬 Criando exames de teste...', 'cyan');
      
      for (let i = 0; i < EXAMES_TESTE.length && i < pacientesIds.length; i++) {
        const exame = {
          ...EXAMES_TESTE[i],
          pacienteId: pacientesIds[i]
        };
        
        colorLog(`   Criando: ${exame.modalidade} - ${exame.descricao}...`, 'yellow');
        
        const response = await makeRequest('/exames', 'POST', exame, token);
        
        if (response.success) {
          colorLog(`   ✅ Exame ${exame.modalidade} criado com ID: ${response.data.id}`, 'green');
        } else {
          colorLog(`   ⚠️  Exame ${exame.modalidade} - ${response.data.message || 'Erro desconhecido'}`, 'yellow');
        }
      }
    }

    // 5. Resumo final
    colorLog('\n📊 RESUMO DA POPULAÇÃO:', 'blue');
    colorLog(`   Pacientes processados: ${PACIENTES_TESTE.length}`, 'white');
    colorLog(`   Pacientes criados com sucesso: ${pacientesIds.length}`, 'green');
    colorLog(`   Exames processados: ${Math.min(EXAMES_TESTE.length, pacientesIds.length)}`, 'white');
    
    if (pacientesIds.length > 0) {
      colorLog('\n🎉 DADOS POPULADOS COM SUCESSO!', 'green');
      colorLog('   Agora você pode testar a integração com dados reais!', 'cyan');
    }

  } catch (error) {
    colorLog(`\n❌ ERRO DURANTE A EXECUÇÃO: ${error.message}`, 'red');
    console.error(error);
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  populateDatabase();
}

module.exports = { populateDatabase };