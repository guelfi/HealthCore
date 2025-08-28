const http = require('http');

console.log('🔍 DEBUG: Simulando chamadas do frontend...\n');

// Função para fazer login (como o frontend faz)
function login() {
  return new Promise((resolve, reject) => {
    const loginData = JSON.stringify({
      username: 'guelfi',
      password: '@246!588'
    });

    const options = {
      hostname: '192.168.15.119',
      port: 5000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ Login realizado com sucesso');
          resolve(response.token);
        } else {
          console.log('❌ Erro no login:', res.statusCode, data);
          reject(new Error(`Login failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro na requisição de login:', error.message);
      reject(error);
    });

    req.write(loginData);
    req.end();
  });
}

// Função para buscar pacientes (exatamente como o frontend faz)
function fetchPacientes(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '192.168.15.119',
      port: 5000,
      path: '/pacientes?page=1&pageSize=10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('🔍 Fazendo requisição para:', `http://${options.hostname}:${options.port}${options.path}`);
    console.log('🔑 Com Authorization:', options.headers.Authorization.substring(0, 20) + '...');

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('📊 Status da resposta:', res.statusCode);
        console.log('🗂️ Headers da resposta:', res.headers);
        
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log('✅ Pacientes recebidos com sucesso!');
            console.log('📊 Estrutura da resposta:');
            console.log('   - Tipo:', Array.isArray(response) ? 'Array' : 'Object');
            console.log('   - Quantidade:', Array.isArray(response) ? response.length : (response.data ? response.data.length : 'N/A'));
            
            if (Array.isArray(response)) {
              console.log('📋 Pacientes encontrados:', response.length);
              if (response.length > 0) {
                console.log('🔍 Primeiro paciente:');
                console.log('   - ID:', response[0].id);
                console.log('   - Nome:', response[0].nome);
                console.log('   - Documento:', response[0].documento);
              } else {
                console.log('⚠️ Array vazio - nenhum paciente encontrado');
              }
            }
            
            resolve(response);
          } catch (error) {
            console.error('❌ Erro ao fazer parse da resposta:', error.message);
            console.log('📄 Resposta bruta:', data);
            reject(error);
          }
        } else {
          console.error('❌ Erro na requisição de pacientes:');
          console.error('   Status:', res.statusCode);
          console.error('   Resposta:', data);
          reject(new Error(`API Error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Executar o teste completo
async function runDebugTest() {
  try {
    console.log('1️⃣ Fazendo login...');
    const token = await login();
    
    console.log('\n2️⃣ Buscando pacientes...');
    const pacientes = await fetchPacientes(token);
    
    console.log('\n🎯 DIAGNÓSTICO:');
    if (Array.isArray(pacientes) && pacientes.length > 0) {
      console.log('✅ API funcionando corretamente');
      console.log('✅ Dados sendo retornados');
      console.log('🔍 PROBLEMA PROVÁVEL: Frontend não está processando os dados');
      console.log('💡 SOLUÇÃO: Verificar logs do console do navegador');
    } else if (Array.isArray(pacientes) && pacientes.length === 0) {
      console.log('⚠️ API funcionando mas sem dados');
      console.log('🔍 PROBLEMA: Banco de dados vazio');
      console.log('💡 SOLUÇÃO: Verificar se os dados foram populados no banco');
    } else {
      console.log('❓ Estrutura de resposta inesperada');
      console.log('🔍 PROBLEMA: API retornando formato diferente do esperado');
    }
    
  } catch (error) {
    console.error('\n❌ TESTE FALHOU:', error.message);
    console.log('🔍 PROBLEMA: Conectividade ou autenticação');
  }
}

runDebugTest();