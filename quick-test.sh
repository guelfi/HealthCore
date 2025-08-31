#!/bin/bash

# 🧪 Teste Rápido - MobileMed
# Verifica se os serviços estão rodando no IP da máquina

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# IP da máquina
LOCAL_IP="192.168.15.119"

echo -e "${BLUE}🧪 Teste Rápido - MobileMed${NC}"
echo "=============================="
echo -e "🌐 IP da Máquina: ${GREEN}$LOCAL_IP${NC}"
echo ""

# Função para testar URL
test_service() {
    local url=$1
    local name=$2
    
    echo -n "🔍 Testando $name... "
    
    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ OFFLINE${NC}"
        return 1
    fi
}

# Testar serviços
API_OK=0
FRONTEND_OK=0

test_service "http://$LOCAL_IP:5000/health" "API" && API_OK=1
test_service "http://$LOCAL_IP:5005" "Frontend" && FRONTEND_OK=1

echo ""

# Resumo
if [ $API_OK -eq 1 ] && [ $FRONTEND_OK -eq 1 ]; then
    echo -e "${GREEN}🎉 Todos os serviços estão rodando!${NC}"
    echo ""
    echo -e "${BLUE}📱 URLs para teste no celular:${NC}"
    echo -e "   App: ${GREEN}http://$LOCAL_IP:5005${NC}"
    echo -e "   API: ${GREEN}http://$LOCAL_IP:5000${NC}"
elif [ $API_OK -eq 1 ]; then
    echo -e "${YELLOW}⚠️  Apenas a API está rodando${NC}"
    echo -e "   Para iniciar o frontend: ${BLUE}./start-frontend.sh${NC}"
elif [ $FRONTEND_OK -eq 1 ]; then
    echo -e "${YELLOW}⚠️  Apenas o Frontend está rodando${NC}"
    echo -e "   Para iniciar a API: ${BLUE}./start-api.sh${NC}"
else
    echo -e "${RED}❌ Nenhum serviço está rodando${NC}"
    echo ""
    echo -e "${BLUE}💡 Para iniciar:${NC}"
    echo -e "   Ambos: ${GREEN}./start-both.sh${NC}"
    echo -e "   API: ${GREEN}./start-api.sh${NC}"
    echo -e "   Frontend: ${GREEN}./start-frontend.sh${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Outros comandos úteis:${NC}"
echo -e "   Teste completo: ${GREEN}./test-connectivity.sh${NC}"
echo -e "   Plano de testes: ${GREEN}cat src/Web/TEST_PLAN.md${NC}"