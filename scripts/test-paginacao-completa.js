#!/usr/bin/env node

/**
 * Script para testar a paginação completa (API + Frontend)
 */

const axios = require('axios');

const API_BASE_URL = 'http://192.168.15.119:5000';
const FRONTEND_URL = 'http://localhost:5005';

async function testPaginacaoCompleta() {
    console.log('🧪 TESTE COMPLETO DE PAGINAÇÃO');
    console.log('=' .repeat(50));
    
    try {
        // Teste 1: Verificar se a API está funcionando
        console.log('\n1️⃣ TESTANDO API BACKEND');
        console.log('-'.repeat(30));
        
        const apiTests = [
            { page: 1, pageSize: 10, expected: 10 },
            { page: 2, pageSize: 10, expected: 10 },
            { page: 3, pageSize: 10, expected: 2 },
            { page: 1, pageSize: 5, expected: 5 }
        ];
        
        let apiOk = true;
        
        for (const test of apiTests) {
            try {
                const response = await axios.get(`${API_BASE_URL}/pacientes?page=${test.page}&pageSize=${test.pageSize}`);
                const data = response.data;
                
                if (data.data.length === test.expected && data.total === 22) {
                    console.log(`✅ Página ${test.page} (size=${test.pageSize}): ${data.data.length} pacientes`);
                } else {
                    console.log(`❌ Página ${test.page} (size=${test.pageSize}): esperado ${test.expected}, recebido ${data.data.length}`);
                    apiOk = false;
                }
            } catch (error) {
                console.log(`❌ Erro na página ${test.page}: ${error.message}`);
                apiOk = false;
            }
        }
        
        // Teste 2: Verificar se o frontend está acessível
        console.log('\\n2️⃣ TESTANDO FRONTEND');
        console.log('-'.repeat(30));
        
        let frontendOk = true;
        
        try {
            const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 5000 });
            if (frontendResponse.status === 200 && frontendResponse.data.includes('MobileMed')) {
                console.log('✅ Frontend está rodando e acessível');
            } else {
                console.log('❌ Frontend não está respondendo corretamente');
                frontendOk = false;
            }
        } catch (error) {
            console.log(`❌ Frontend não está acessível: ${error.message}`);
            frontendOk = false;
        }
        
        // Resumo final
        console.log('\\n🎯 RESUMO FINAL');
        console.log('=' .repeat(30));
        
        if (apiOk && frontendOk) {
            console.log('✅ API Backend: FUNCIONANDO');
            console.log('✅ Frontend: ACESSÍVEL');
            console.log('\\n🎉 TUDO FUNCIONANDO!');
            console.log('\\n📋 PRÓXIMOS PASSOS:');
            console.log('1. Abrir o navegador em: http://localhost:5005');
            console.log('2. Navegar para a página de Pacientes');
            console.log('3. Verificar se a paginação está funcionando visualmente');
            console.log('4. Testar navegação entre páginas');
            console.log('5. Testar mudança de tamanho de página');
            
            console.log('\\n🔍 ESTRUTURA ESPERADA NA TABELA:');
            console.log('- Mostra "1-10 de 22" na primeira página');
            console.log('- Botões de navegação habilitados');
            console.log('- Total de 3 páginas disponíveis');
            console.log('- Última página mostra "21-22 de 22"');
            
        } else {
            console.log('❌ PROBLEMAS ENCONTRADOS:');
            if (!apiOk) console.log('   - API Backend com problemas');
            if (!frontendOk) console.log('   - Frontend com problemas');
        }
        
        // Informações adicionais
        console.log('\\n📊 DADOS DE TESTE:');
        console.log(`- Total de pacientes: 22`);
        console.log(`- Páginas com pageSize=10: 3 (10+10+2)`);
        console.log(`- Páginas com pageSize=5: 5 (5+5+5+5+2)`);
        console.log(`- API URL: ${API_BASE_URL}/pacientes`);
        console.log(`- Frontend URL: ${FRONTEND_URL}`);
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    }
}

// Executar teste
testPaginacaoCompleta();