#!/bin/bash

echo "🧪 TESTE COMPLETO DE PAGINAÇÃO"
echo "=================================================="

API_URL="http://192.168.15.119:5000"
FRONTEND_URL="http://localhost:5005"

echo ""
echo "1️⃣ TESTANDO API BACKEND"
echo "------------------------------"

# Teste página 1
echo -n "✅ Página 1 (10 itens): "
RESPONSE1=$(curl -s "${API_URL}/pacientes?page=1&pageSize=10")
COUNT1=$(echo $RESPONSE1 | grep -o '"data":\[.*\]' | grep -o '{"id"' | wc -l | tr -d ' ')
TOTAL1=$(echo $RESPONSE1 | grep -o '"total":[0-9]*' | cut -d':' -f2)
echo "${COUNT1} pacientes de ${TOTAL1} total"

# Teste página 2
echo -n "✅ Página 2 (10 itens): "
RESPONSE2=$(curl -s "${API_URL}/pacientes?page=2&pageSize=10")
COUNT2=$(echo $RESPONSE2 | grep -o '"data":\[.*\]' | grep -o '{"id"' | wc -l | tr -d ' ')
echo "${COUNT2} pacientes"

# Teste página 3
echo -n "✅ Página 3 (2 itens): "
RESPONSE3=$(curl -s "${API_URL}/pacientes?page=3&pageSize=10")
COUNT3=$(echo $RESPONSE3 | grep -o '"data":\[.*\]' | grep -o '{"id"' | wc -l | tr -d ' ')
echo "${COUNT3} pacientes"

echo ""
echo "2️⃣ TESTANDO FRONTEND"
echo "------------------------------"

# Teste frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend está rodando e acessível (HTTP $FRONTEND_STATUS)"
else
    echo "❌ Frontend não está acessível (HTTP $FRONTEND_STATUS)"
fi

echo ""
echo "🎯 RESUMO FINAL"
echo "=============================="

if [ "$COUNT1" = "10" ] && [ "$COUNT2" = "10" ] && [ "$COUNT3" = "2" ] && [ "$TOTAL1" = "22" ] && [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ API Backend: FUNCIONANDO"
    echo "✅ Frontend: ACESSÍVEL"
    echo ""
    echo "🎉 TUDO FUNCIONANDO!"
    echo ""
    echo "📋 PRÓXIMOS PASSOS:"
    echo "1. Abrir o navegador em: http://localhost:5005"
    echo "2. Navegar para a página de Pacientes"
    echo "3. Verificar se a paginação está funcionando visualmente"
    echo "4. Testar navegação entre páginas"
    echo "5. Testar mudança de tamanho de página"
    echo ""
    echo "🔍 ESTRUTURA ESPERADA NA TABELA:"
    echo "- Mostra '1-10 de 22' na primeira página"
    echo "- Botões de navegação habilitados"
    echo "- Total de 3 páginas disponíveis"
    echo "- Última página mostra '21-22 de 22'"
else
    echo "❌ PROBLEMAS ENCONTRADOS:"
    echo "   - Página 1: $COUNT1 pacientes (esperado: 10)"
    echo "   - Página 2: $COUNT2 pacientes (esperado: 10)"
    echo "   - Página 3: $COUNT3 pacientes (esperado: 2)"
    echo "   - Total: $TOTAL1 pacientes (esperado: 22)"
    echo "   - Frontend: HTTP $FRONTEND_STATUS (esperado: 200)"
fi

echo ""
echo "📊 DADOS DE TESTE:"
echo "- Total de pacientes: 22"
echo "- Páginas com pageSize=10: 3 (10+10+2)"
echo "- API URL: ${API_URL}/pacientes"
echo "- Frontend URL: ${FRONTEND_URL}"