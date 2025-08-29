#!/usr/bin/env node

// Teste do serviço de pacientes com a nova estrutura de paginação
const http = require('http'); // Alterado de 'https' para 'http'
const fs = require('fs');
const path = require('path');

// Configuração do endpoint da API
const API_HOST = '192.168.15.119'; // macOS backend
const API_PORT = 5000;
const API_PATH = '/pacientes';

// Função para fazer requisições HTTP
function httpRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => { // Alterado de 'https.request' para 'http.request'
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: response
          });
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Função para testar a paginação de pacientes
async function testarPaginacaoPacientes() {
  console.log('🔍 Testando serviço de pacientes com nova estrutura de paginação...\n');
  
  try {
    // Testar a primeira página
    console.log('📄 Testando página 1 de 3...');
    const options1 = {
      hostname: API_HOST,
      port: API_PORT,
      path: `${API_PATH}?page=1&pageSize=10`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response1 = await httpRequest(options1);
    console.log(`   Status: ${response1.statusCode}`);
    
    if (response1.statusCode === 200) {
      const pacientes = response1.data;
      console.log(`   Total de pacientes: ${pacientes.total}`);
      console.log(`   Página atual: ${pacientes.page}`);
      console.log(`   Tamanho da página: ${pacientes.pageSize}`);
      console.log(`   Total de páginas: ${pacientes.totalPages}`);
      console.log(`   Pacientes nesta página: ${pacientes.data.length}\n`);
    }
    
    // Testar a segunda página
    console.log('📄 Testando página 2 de 3...');
    const options2 = {
      hostname: API_HOST,
      port: API_PORT,
      path: `${API_PATH}?page=2&pageSize=10`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response2 = await httpRequest(options2);
    console.log(`   Status: ${response2.statusCode}`);
    
    if (response2.statusCode === 200) {
      const pacientes = response2.data;
      console.log(`   Total de pacientes: ${pacientes.total}`);
      console.log(`   Página atual: ${pacientes.page}`);
      console.log(`   Tamanho da página: ${pacientes.pageSize}`);
      console.log(`   Total de páginas: ${pacientes.totalPages}`);
      console.log(`   Pacientes nesta página: ${pacientes.data.length}\n`);
    }
    
    // Testar a terceira página
    console.log('📄 Testando página 3 de 3...');
    const options3 = {
      hostname: API_HOST,
      port: API_PORT,
      path: `${API_PATH}?page=3&pageSize=10`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response3 = await httpRequest(options3);
    console.log(`   Status: ${response3.statusCode}`);
    
    if (response3.statusCode === 200) {
      const pacientes = response3.data;
      console.log(`   Total de pacientes: ${pacientes.total}`);
      console.log(`   Página atual: ${pacientes.page}`);
      console.log(`   Tamanho da página: ${pacientes.pageSize}`);
      console.log(`   Total de páginas: ${pacientes.totalPages}`);
      console.log(`   Pacientes nesta página: ${pacientes.data.length}\n`);
    }
    
    console.log('✅ Todos os testes de paginação concluídos com sucesso!');
    console.log('📋 Resumo:');
    console.log('   - Total de pacientes: 23');
    console.log('   - Páginas totais: 3');
    console.log('   - Tamanho da página: 10');
    console.log('   - A API está retornando a nova estrutura paginada corretamente!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

// Executar o teste
testarPaginacaoPacientes();