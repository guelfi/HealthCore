#!/bin/bash

# 🧪 Test Single Tunnel - MobileMed
# Testa a configuração de túnel único do ngrok

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testando configuração ngrok${NC}"
echo "=============================="

# Função para testar endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "🔍 Testando $description... "
    
    response=$(curl -s -w "%{http_code}" -o /tmp/test_response "$url" --max-time 10)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FALHOU (Status: $response)${NC}"
        return 1
    fi
}

# Verificar se os serviços estão rodando localmente
echo "📋 Verificando serviços locais..."
echo ""

API_OK=false
FRONTEND_OK=false

if test_endpoint "http://localhost:5000/health" "API local"; then
    API_OK=true
fi

if test_endpoint "http://localhost:5005" "Frontend local"; then
    FRONTEND_OK=true
fi

echo ""

# Verificar se ngrok está rodando
echo "📋 Verificando ngrok..."
echo ""

NGROK_RUNNING=false
NGROK_URL=""

if curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ngrok API acessível${NC}"
    
    # Obter URL do túnel
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data['tunnels']:
        if '5005' in str(tunnel['config']['addr']):
            print(tunnel['public_url'])
            break
except:
    pass
" 2>/dev/null)
    
    if [ ! -z "$NGROK_URL" ]; then
        echo -e "${GREEN}✅ Túnel ngrok ativo: $NGROK_URL${NC}"
        NGROK_RUNNING=true
    else
        echo -e "${RED}❌ Túnel ngrok não encontrado${NC}"
    fi
else
    echo -e "${RED}❌ ngrok não está rodando${NC}"
fi

echo ""

# Testar acesso externo se ngrok estiver rodando
if [ "$NGROK_RUNNING" = true ]; then
    echo "📋 Testando acesso externo..."
    echo ""
    
    if test_endpoint "$NGROK_URL" "Frontend via ngrok"; then
        echo -e "${GREEN}✅ Frontend acessível externamente${NC}"
        
        # Testar se o frontend consegue acessar a API
        echo "🔍 Testando comunicação frontend -> API..."
        
        # Fazer uma requisição através do frontend para testar a API
        api_test_url="$NGROK_URL"
        
        # Verificar se há JavaScript que faz chamadas para a API
        frontend_content=$(curl -s "$api_test_url" --max-time 10)
        
        if echo "$frontend_content" | grep -q "localhost:5000\|/api"; then
            echo -e "${GREEN}✅ Frontend configurado para acessar API local${NC}"
        else
            echo -e "${YELLOW}⚠️  Não foi possível verificar configuração da API no frontend${NC}"
        fi
    fi
fi

echo ""
echo "📋 Resumo dos testes:"
echo "===================="

if [ "$API_OK" = true ]; then
    echo -e "${GREEN}✅ API local funcionando${NC}"
else
    echo -e "${RED}❌ API local com problemas${NC}"
fi

if [ "$FRONTEND_OK" = true ]; then
    echo -e "${GREEN}✅ Frontend local funcionando${NC}"
else
    echo -e "${RED}❌ Frontend local com problemas${NC}"
fi

if [ "$NGROK_RUNNING" = true ]; then
    echo -e "${GREEN}✅ ngrok funcionando${NC}"
    echo -e "${BLUE}🌐 URL externa: $NGROK_URL${NC}"
else
    echo -e "${RED}❌ ngrok com problemas${NC}"
fi

echo ""

# Verificar arquivos de configuração
echo "📋 Verificando configuração..."
echo ""

if [ -f "src/Web/.env.local" ]; then
    echo -e "${GREEN}✅ Arquivo .env.local existe${NC}"
    
    if grep -q "localhost:5000" src/Web/.env.local; then
        echo -e "${GREEN}✅ API configurada para localhost${NC}"
    else
        echo -e "${YELLOW}⚠️  Configuração da API pode estar incorreta${NC}"
    fi
else
    echo -e "${RED}❌ Arquivo .env.local não encontrado${NC}"
    echo "💡 Execute: bash scripts/ngrok/configure-frontend-env.sh"
fi

if [ -f "src/Web/vite.config.ts" ]; then
    echo -e "${GREEN}✅ Arquivo vite.config.ts existe${NC}"
    
    if grep -q "proxy" src/Web/vite.config.ts; then
        echo -e "${GREEN}✅ Proxy configurado no Vite${NC}"
    else
        echo -e "${YELLOW}⚠️  Proxy não configurado no Vite${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Arquivo vite.config.ts não encontrado${NC}"
fi

echo ""

# Recomendações finais
if [ "$API_OK" = true ] && [ "$FRONTEND_OK" = true ] && [ "$NGROK_RUNNING" = true ]; then
    echo -e "${GREEN}🎉 Configuração está funcionando perfeitamente!${NC}"
    echo "============================================="
    echo -e "${BLUE}📱 Acesse: $NGROK_URL${NC}"
    echo ""
    echo -e "${YELLOW}💡 Dicas:${NC}"
    echo "   • O frontend está acessível externamente"
    echo "   • A API é acessada localmente pelo frontend"
    echo "   • Todas as funcionalidades devem funcionar"
else
    echo -e "${YELLOW}⚠️  Alguns problemas foram encontrados${NC}"
    echo "====================================="
    echo ""
    echo -e "${BLUE}🔧 Soluções sugeridas:${NC}"
    
    if [ "$API_OK" = false ]; then
        echo "   • Inicie a API: cd src/Api && dotnet run --urls=\"http://0.0.0.0:5000\""
    fi
    
    if [ "$FRONTEND_OK" = false ]; then
        echo "   • Inicie o frontend: cd src/Web && npm run dev -- --host 0.0.0.0 --port 5005"
    fi
    
    if [ "$NGROK_RUNNING" = false ]; then
        echo "   • Configure o ambiente: bash scripts/ngrok/configure-frontend-env.sh"
        echo "   • Inicie o ngrok: bash scripts/ngrok/setup-single-tunnel.sh"
    fi
fi

echo ""
echo -e "${BLUE}📄 Logs disponíveis:${NC}"
echo "   • API: /tmp/mobilemed-api.log"
echo "   • Frontend: /tmp/mobilemed-frontend.log"
echo "   • ngrok: scripts/ngrok/ngrok-frontend.log"
echo "   • Sessão atual: scripts/ngrok/current-session.txt"
echo ""