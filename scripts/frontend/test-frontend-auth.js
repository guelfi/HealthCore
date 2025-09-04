const http = require('http');

async function testFrontendAuth() {
  console.log('🔍 TESTE DE AUTENTICAÇÃO DO FRONTEND');
  console.log('=====================================\n');

  // Simular o que o frontend faz
  console.log('1️⃣ Verificando se há token salvo...');
  
  // Simular localStorage (normalmente seria checado no navegador)
  console.log('   ❌ Não há como verificar localStorage via Node.js');
  console.log('   ℹ️  Você precisa verificar no navegador: F12 → Application → Local Storage\n');

  // Fazer login para obter token (como o frontend deveria fazer)
  console.log('2️⃣ Fazendo login para obter token...');
  
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

  return new Promise((resolve, reject) => {
    const loginReq = http.request(loginOptions, (loginRes) => {
      let loginResponseData = '';
      
      loginRes.on('data', (chunk) => {
        loginResponseData += chunk;
      });
      
      loginRes.on('end', () => {
        if (loginRes.statusCode === 200) {
          const loginResponse = JSON.parse(loginResponseData);
          const token = loginResponse.token;
          console.log('   ✅ Login realizado com sucesso!');
          console.log('   🎫 Token obtido:', token.substring(0, 20) + '...\n');
          
          // Agora testar requisição com token (como o frontend faz)
          console.log('3️⃣ Testando requisição com token...');
          
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
          
          const pacientesReq = http.request(pacientesOptions, (pacientesRes) => {
            let pacientesData = '';
            
            pacientesRes.on('data', (chunk) => {
              pacientesData += chunk;
            });
            
            pacientesRes.on('end', () => {
              console.log('   📊 Status:', pacientesRes.statusCode);
              
              if (pacientesRes.statusCode === 200) {
                const response = JSON.parse(pacientesData);
                console.log('   ✅ Pacientes recebidos:', response.length);
                console.log('   📋 Primeiro paciente:', response[0]?.nome || 'N/A');
                
                console.log('\n🎯 DIAGNÓSTICO:');
                console.log('   ✅ API está funcionando');
                console.log('   ✅ Autenticação está funcionando');
                console.log('   ✅ Dados estão sendo retornados');
                console.log('\n💡 PROBLEMA PROVÁVEL:');
                console.log('   🔍 Frontend não está fazendo login OU');
                console.log('   🔍 Token não está sendo salvo no localStorage OU');
                console.log('   🔍 Componente não está usando o hook corretamente');
                
                console.log('\n📝 PRÓXIMOS PASSOS:');
                console.log('   1. Verificar se usuário está logado no frontend');
                console.log('   2. Verificar localStorage no navegador (F12)');
                console.log('   3. Fazer login no frontend se necessário');
                
              } else {
                console.log('   ❌ Erro:', pacientesData);
              }
              
              resolve();
            });
          });
          
          pacientesReq.on('error', (error) => {
            console.error('   ❌ Erro na requisição:', error.message);
            resolve();
          });
          
          pacientesReq.end();
          
        } else {
          console.log('   ❌ Erro no login:', loginRes.statusCode);
          console.log('   📄 Resposta:', loginResponseData);
          resolve();
        }
      });
    });

    loginReq.on('error', (error) => {
      console.error('❌ Erro no login:', error.message);
      resolve();
    });

    loginReq.write(loginData);
    loginReq.end();
  });
}

testFrontendAuth();