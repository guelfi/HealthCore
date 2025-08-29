#!/usr/bin/env node

const http = require('http');

// Configuração do endpoint da API
const API_HOST = '192.168.15.119'; // macOS backend
const API_PORT = 5000;
const API_PATH = '/pacientes';

// Função para testar a paginação de pacientes
function testarPaginacao() {
  console.log('🔍 Testando paginação de pacientes...');
  
  // Testar a primeira página
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: `${API_PATH}?page=1&pageSize=10`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  console.log(`🔗 Conectando a http://${API_HOST}:${API_PORT}${API_PATH}?page=1&pageSize=10`);

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 Status da resposta: ${res.statusCode}`);
      console.log(`🗂️ Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      try {
        const response = JSON.parse(data);
        console.log('✅ Resposta recebida com sucesso!');
        
        // Verificar a estrutura da resposta
        if (Array.isArray(response)) {
          console.log('⚠️  A API ainda está retornando um array simples (estrutura antiga)');
          console.log(`📊 Número de pacientes: ${response.length}`);
        } else if (response && typeof response === 'object' && 'data' in response) {
          console.log('✅ A API está retornando a nova estrutura paginada!');
          console.log(`📊 Total de pacientes: ${response.total}`);
          console.log(`📄 Página atual: ${response.page}`);
          console.log(`📏 Tamanho da página: ${response.pageSize}`);
          console.log(`📚 Total de páginas: ${response.totalPages}`);
          console.log(`📋 Pacientes nesta página: ${response.data.length}`);
        } else {
          console.log('❓ Estrutura de resposta desconhecida:');
          console.log(JSON.stringify(response, null, 2));
        }
      } catch (error) {
        console.log('❌ Erro ao parsear a resposta:', error.message);
        console.log('Dados brutos:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Erro na requisição:', error.message);
  });
  
  req.end();
}

// Executar o teste
testarPaginacao();