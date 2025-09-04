#!/bin/bash

# 🚀 Setup Dual ngrok - MobileMed
# Configura ngrok para API e Frontend simultaneamente

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Configurando ngrok para API e Frontend${NC}"
echo "=============================================="

# Verificar se os serviços estão rodando
echo "🔍 Verificando serviços..."

API_RUNNING=$(curl -s --max-time 3 "http://192.168.15.119:5000/health" > /dev/null 2>&1 && echo "true" || echo "false")
FRONTEND_RUNNING=$(curl -s --max-time 3 "http://192.168.15.119:5005" > /dev/null 2>&1 && echo "true" || echo "false")

if [ "$API_RUNNING" = "false" ]; then
    echo -e "${RED}❌ API não está rodando na porta 5000${NC}"
    echo "💡 Execute: ./start-api.sh"
    exit 1
fi

if [ "$FRONTEND_RUNNING" = "false" ]; then
    echo -e "${RED}❌ Frontend não está rodando na porta 5005${NC}"
    echo "💡 Execute: ./start-frontend.sh"
    exit 1
fi

echo -e "${GREEN}✅ API rodando na porta 5000${NC}"
echo -e "${GREEN}✅ Frontend rodando na porta 5005${NC}"

# Parar ngrok existente
echo ""
echo "🛑 Parando ngrok existente..."
pkill -f "ngrok http" 2>/dev/null || true
sleep 2

# Iniciar ngrok para API
echo ""
echo "🌐 Iniciando ngrok para API (porta 5000)..."
ngrok http 5000 --log=stdout > ngrok-api.log 2>&1 &
NGROK_API_PID=$!

# Aguardar inicialização
sleep 5

# Obter URL da API
API_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data['tunnels']:
        if tunnel['config']['addr'] == 'http://localhost:5000':
            print(tunnel['public_url'])
            break
except:
    pass
" 2>/dev/null)

if [ -z "$API_URL" ]; then
    echo -e "${RED}❌ Erro ao obter URL do ngrok da API${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API ngrok: $API_URL${NC}"

# Atualizar .env.local
echo ""
echo "📝 Atualizando configuração..."

# Backup do .env.local
cp src/Web/.env.local src/Web/.env.local.backup 2>/dev/null || true

# Atualizar ou adicionar VITE_NGROK_API_URL
if grep -q "VITE_NGROK_API_URL" src/Web/.env.local; then
    sed -i.bak "s|VITE_NGROK_API_URL=.*|VITE_NGROK_API_URL=$API_URL|" src/Web/.env.local
else
    echo "" >> src/Web/.env.local
    echo "# Configuração ngrok (acesso externo)" >> src/Web/.env.local
    echo "VITE_NGROK_API_URL=$API_URL" >> src/Web/.env.local
fi

echo -e "${GREEN}✅ Configuração atualizada${NC}"

# Testar API via ngrok
echo ""
echo "🧪 Testando API via ngrok..."
if curl -s --max-time 10 "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API respondendo via ngrok${NC}"
else
    echo -e "${RED}❌ API não está respondendo via ngrok${NC}"
    exit 1
fi

# Parar ngrok da API e iniciar para frontend
echo ""
echo "🔄 Alternando para ngrok do frontend..."
kill $NGROK_API_PID 2>/dev/null || true
sleep 3

# Iniciar ngrok para frontend
ngrok http 5005 --log=stdout > ngrok-frontend.log 2>&1 &
NGROK_FRONTEND_PID=$!

# Aguardar inicialização
sleep 5

# Obter URL do frontend
FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data['tunnels']:
        if tunnel['config']['addr'] == 'http://localhost:5005':
            print(tunnel['public_url'])
            break
except:
    pass
" 2>/dev/null)

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}❌ Erro ao obter URL do ngrok do frontend${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend ngrok: $FRONTEND_URL${NC}"

echo ""
echo -e "${GREEN}🎉 Configuração completa!${NC}"
echo ""
echo -e "${BLUE}📋 URLs configuradas:${NC}"
echo -e "   API Local: ${GREEN}http://192.168.15.119:5000${NC}"
echo -e "   API ngrok: ${GREEN}$API_URL${NC}"
echo -e "   Frontend Local: ${GREEN}http://192.168.15.119:5005${NC}"
echo -e "   Frontend ngrok: ${GREEN}$FRONTEND_URL${NC}"
echo ""
echo -e "${BLUE}📱 Para testar no celular:${NC}"
echo -e "   Acesse: ${GREEN}$FRONTEND_URL${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   O frontend via ngrok usará automaticamente a API via ngrok"
echo "   Configuração salva em src/Web/.env.local"
echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo "   Parar ngrok: pkill -f 'ngrok http'"
echo "   Ver logs API: tail -f ngrok-api.log"
echo "   Ver logs Frontend: tail -f ngrok-frontend.log"