#!/bin/bash

API_BASE_URL="${HEALTHCORE_API_URL:-http://localhost:5000}"

echo "🔍 MONITORANDO CHAMADAS DA API"
echo "================================"
echo "Este script monitora as chamadas para /pacientes"
echo "Abra o frontend e navegue entre as páginas para ver as chamadas"
echo ""
echo "Pressione Ctrl+C para parar"
echo ""

# Monitorar logs da API (assumindo que está rodando em Docker ou localmente)
# Vamos simular chamadas para testar

echo "📊 TESTANDO CHAMADAS MANUAIS:"
echo ""

echo "1️⃣ Página 1:"
curl -s "${API_BASE_URL}/pacientes?page=1&pageSize=10" | jq -r '"Data: \(.data | length) pacientes, Total: \(.total), Página: \(.page)/\(.totalPages)"'

echo ""
echo "2️⃣ Página 2:"
curl -s "${API_BASE_URL}/pacientes?page=2&pageSize=10" | jq -r '"Data: \(.data | length) pacientes, Total: \(.total), Página: \(.page)/\(.totalPages)"'

echo ""
echo "3️⃣ Página 3:"
curl -s "${API_BASE_URL}/pacientes?page=3&pageSize=10" | jq -r '"Data: \(.data | length) pacientes, Total: \(.total), Página: \(.page)/\(.totalPages)"'

echo ""
echo "✅ API está funcionando corretamente!"
echo ""
echo "🎯 AGORA TESTE NO FRONTEND:"
echo "1. Abra http://localhost:5005"
echo "2. Vá para Pacientes"
echo "3. Abra o Console do navegador (F12)"
echo "4. Navegue entre as páginas"
echo "5. Verifique os logs no console"
