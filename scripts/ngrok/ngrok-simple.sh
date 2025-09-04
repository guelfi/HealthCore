#!/bin/bash

# 🚀 ngrok Simple - MobileMed
# Solução para conta gratuita sem comprometer arquitetura de produção

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Configuração ngrok para teste externo${NC}"
echo "=========================================="

# Verificar se os serviços estão rodando
echo "🔍 Verificando serviços..."

if ! curl -s --max-time 3 "http://localhost:5000/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ API não está rodando na porta 5000${NC}"
    echo "💡 Execute: bash scripts/deployment/servers.sh start"
    exit 1
fi

if ! curl -s --max-time 3 "http://localhost:5005" > /dev/null 2>&1; then
    echo -e "${RED}❌ Frontend não está rodando na porta 5005${NC}"
    echo "💡 Execute: bash scripts/deployment/servers.sh start"
    exit 1
fi

echo -e "${GREEN}✅ API rodando na porta 5000${NC}"
echo -e "${GREEN}✅ Frontend rodando na porta 5005${NC}"

echo ""
echo -e "${YELLOW}⚠️  LIMITAÇÃO CONTA GRATUITA:${NC}"
echo "O ngrok gratuito permite apenas 1 túnel simultâneo."
echo "Para testes externos completos, você precisa:"
echo ""
echo -e "${BLUE}📋 Opções disponíveis:${NC}"
echo "1. Usar apenas localmente (recomendado para desenvolvimento)"
echo "2. Upgrade para ngrok pago (múltiplos túneis)"
echo "3. Usar alternativas como localtunnel ou serveo"
echo ""

read -p "Deseja continuar com túnel único para demonstração? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operação cancelada."
    exit 0
fi

# Parar ngrok existente
echo ""
echo "🛑 Parando ngrok existente..."
pkill -f "ngrok http" 2>/dev/null || true
sleep 2

echo ""
echo -e "${BLUE}Escolha qual serviço expor:${NC}"
echo "1. Frontend (para demonstração visual)"
echo "2. API (para testes de endpoints)"
read -p "Escolha (1 ou 2): " -n 1 -r
echo

if [[ $REPLY == "1" ]]; then
    echo ""
    echo "🌐 Iniciando ngrok para Frontend..."
    ngrok http 5005 --log=stdout > ngrok-frontend.log 2>&1 &
    sleep 5
    
    FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "
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
    
    if [ ! -z "$FRONTEND_URL" ]; then
        echo -e "${GREEN}✅ Frontend ngrok: $FRONTEND_URL${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
        echo "O frontend funcionará, mas requisições à API falharão"
        echo "porque a API não está exposta via ngrok."
        echo ""
        echo -e "${BLUE}📱 Para demonstração visual:${NC}"
        echo -e "Acesse: ${GREEN}$FRONTEND_URL${NC}"
    else
        echo -e "${RED}❌ Erro ao obter URL do ngrok${NC}"
        exit 1
    fi
    
elif [[ $REPLY == "2" ]]; then
    echo ""
    echo "🌐 Iniciando ngrok para API..."
    ngrok http 5000 --log=stdout > ngrok-api.log 2>&1 &
    sleep 5
    
    API_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data['tunnels']:
        if '5000' in str(tunnel['config']['addr']):
            print(tunnel['public_url'])
            break
except:
    pass
" 2>/dev/null)
    
    if [ ! -z "$API_URL" ]; then
        echo -e "${GREEN}✅ API ngrok: $API_URL${NC}"
        echo ""
        echo -e "${BLUE}🔧 Para testar endpoints:${NC}"
        echo -e "Swagger: ${GREEN}$API_URL/swagger${NC}"
        echo -e "Health: ${GREEN}$API_URL/health${NC}"
        echo ""
        echo -e "${BLUE}📱 Frontend local permanece:${NC}"
        echo -e "Local: ${GREEN}http://localhost:5005${NC}"
    else
        echo -e "${RED}❌ Erro ao obter URL do ngrok${NC}"
        exit 1
    fi
else
    echo "Opção inválida."
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo "   Parar ngrok: pkill -f 'ngrok http'"
echo "   Ver painel: http://localhost:4040"
echo "   Ver logs: tail -f ngrok-*.log"
echo ""
echo -e "${GREEN}✅ Configuração concluída!${NC}"
