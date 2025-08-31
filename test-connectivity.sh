#!/bin/bash

# 🧪 Script de Teste de Conectividade - MobileMed
# Executa testes automatizados de conectividade

echo "🚀 Iniciando Testes de Conectividade - MobileMed"
echo "================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para testar URL
test_url() {
    local url=$1
    local name=$2
    
    echo -n "🔍 Testando $name ($url)... "
    
    if curl -s --max-time 10 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC}"
        return 1
    fi
}

# Função para descobrir IP local
get_local_ip() {
    # macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
    # Linux
    else
        hostname -I | awk '{print $1}'
    fi
}

# Descobrir IP local
LOCAL_IP=$(get_local_ip)
echo "🌐 IP Local detectado: $LOCAL_IP"
echo ""

# 1. Teste IP da Máquina (PREFERENCIAL)
echo -e "${BLUE}📍 TESTE 1: IP da Máquina (Preferencial)${NC}"
if [ ! -z "$LOCAL_IP" ]; then
    test_url "http://$LOCAL_IP:5000/health" "API ($LOCAL_IP)"
    test_url "http://$LOCAL_IP:5005" "Frontend ($LOCAL_IP)"
    echo -e "${GREEN}✅ Use estas URLs para testes no celular${NC}"
else
    echo -e "${YELLOW}⚠️  IP local não detectado${NC}"
fi
echo ""

# 2. Teste Localhost (Fallback)
echo -e "${BLUE}📍 TESTE 2: Localhost (Fallback)${NC}"
test_url "http://localhost:5000/health" "API Local"
test_url "http://localhost:5005" "Frontend Local"
echo ""

# 3. Teste ngrok (se disponível)
echo -e "${BLUE}📍 TESTE 3: ngrok (se disponível)${NC}"
if command -v ngrok &> /dev/null; then
    echo "✅ ngrok instalado"
    echo "💡 Para testar ngrok:"
    echo "   1. Execute: ngrok http 5000 (em outro terminal)"
    echo "   2. Execute: ngrok http 5005 (em outro terminal)"
    echo "   3. Use as URLs fornecidas pelo ngrok"
else
    echo -e "${YELLOW}⚠️  ngrok não instalado${NC}"
    echo "💡 Instale com: brew install ngrok (macOS) ou https://ngrok.com/download"
fi
echo ""

# 4. Teste de Conectividade da API
echo -e "${BLUE}📍 TESTE 4: Endpoints da API${NC}"
API_BASE="http://$LOCAL_IP:5000"

test_url "$API_BASE/health" "Health Check"
test_url "$API_BASE/swagger" "Swagger UI"
test_url "$API_BASE/api/auth/login" "Auth Endpoint"
test_url "$API_BASE/api/pacientes" "Pacientes Endpoint"
test_url "$API_BASE/api/exames" "Exames Endpoint"
echo ""

# 5. Informações do Sistema
echo -e "${BLUE}📍 INFORMAÇÕES DO SISTEMA${NC}"
echo "🖥️  OS: $OSTYPE"
echo "🌐 IP Local: $LOCAL_IP"
echo "📦 Node.js: $(node --version 2>/dev/null || echo 'Não instalado')"
echo "🔧 .NET: $(dotnet --version 2>/dev/null || echo 'Não instalado')"
echo "🚇 ngrok: $(ngrok version 2>/dev/null || echo 'Não instalado')"
echo ""

echo "✅ Testes de conectividade concluídos!"
echo "📋 Consulte TEST_PLAN.md para instruções detalhadas"