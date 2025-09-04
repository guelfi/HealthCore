const http = require('http');

// Primeiro, fazer login para obter o token
const loginData = JSON.stringify({
  username: 'guelfi',
  password: '@246!588'
});

const loginOptions = {
  hostname: '192.168.15.119',
  port: 5000,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

console.log('🔐 Fazendo login...');

const loginReq = http.request(loginOptions, (loginRes) => {
  let loginResponseData = '';
  
  loginRes.on('data', (chunk) => {
    loginResponseData += chunk;
  });
  
  loginRes.on('end', () => {
    if (loginRes.statusCode === 200) {
      const loginResponse = JSON.parse(loginResponseData);
      const token = loginResponse.token;
      console.log('✅ Login realizado com sucesso!');
      
      // Agora testar a listagem de pacientes
      const pacientesOptions = {
        hostname: '192.168.15.119',
        port: 5000,
        path: '/pacientes?page=1&pageSize=10',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      console.log('📋 Buscando pacientes...');
      
      const pacientesReq = http.request(pacientesOptions, (pacientesRes) => {
        let pacientesData = '';
        
        pacientesRes.on('data', (chunk) => {
          pacientesData += chunk;
        });
        
        pacientesRes.on('end', () => {
          console.log('📊 Status da resposta:', pacientesRes.statusCode);
          
          if (pacientesRes.statusCode === 200) {
            try {
              const response = JSON.parse(pacientesData);
              console.log('✅ Pacientes encontrados!');
              console.log('📊 ESTRUTURA COMPLETA DA RESPOSTA:');
              console.log(JSON.stringify(response, null, 2));
              
              console.log('\n🔍 ANÁLISE DA ESTRUTURA:');
              console.log('   - Tipo da resposta:', Array.isArray(response) ? 'Array' : 'Object');
              
              if (Array.isArray(response)) {
                console.log('   - Quantidade de itens:', response.length);
                if (response.length > 0) {
                  console.log('   - Primeiro item:', JSON.stringify(response[0], null, 4));
                }
              } else {
                console.log('   - Propriedades do objeto:', Object.keys(response));
                if (response.data) {
                  console.log('   - response.data é array?', Array.isArray(response.data));
                  console.log('   - Quantidade em data:', response.data.length);
                }
                if (response.total) console.log('   - Total:', response.total);
                if (response.page) console.log('   - Página atual:', response.page);
                if (response.pageSize) console.log('   - Tamanho da página:', response.pageSize);
                if (response.totalPages) console.log('   - Total de páginas:', response.totalPages);
              }
              
            } catch (error) {
              console.log('❌ Erro ao fazer parse da resposta:', error.message);
              console.log('Resposta bruta:', pacientesData);
            }
          } else {
            console.log('❌ Erro ao buscar pacientes');
            console.log('Status:', pacientesRes.statusCode);
            console.log('Resposta:', pacientesData);
          }
        });
      });
      
      pacientesReq.on('error', (error) => {
        console.error('❌ Erro na requisição de pacientes:', error.message);
      });
      
      pacientesReq.end();
      
    } else {
      console.log('❌ Erro no login:', loginRes.statusCode);
      console.log('Resposta:', loginResponseData);
    }
  });
});

loginReq.on('error', (error) => {
  console.error('❌ Erro na requisição de login:', error.message);
});

loginReq.write(loginData);
loginReq.end();