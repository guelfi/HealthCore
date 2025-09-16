#!/bin/bash

# 🚀 Start ngrok Complete - HealthCore
# Inicia ngrok para API e Frontend com configuração automática

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando ngrok completo - HealthCore${NC}"
echo "============================================="

# Verificar se os serviços estão rodando
echo "🔍 Verificando serviços..."

API_RUNNING=$(curl -s --max-time 3 "http://localhost:5000/health" > /dev/null 2>&1 && echo "true" || echo "false")
FRONTEND_RUNNING=$(curl -s --max-time 3 "http://localhost:5005" > /dev/null 2>&1 && echo "true" || echo "false")

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
sleep 3

# ETAPA 1: Iniciar ngrok para API
echo ""
echo "🌐 ETAPA 1: Iniciando ngrok para API..."
ngrok http 5000 --log=stdout > ngrok-api.log 2>&1 &
NGROK_API_PID=$!

# Aguardar inicialização da API
echo "⏳ Aguardando inicialização do ngrok da API..."
sleep 8

# Obter URL da API
API_URL=""
for i in {1..5}; do
    API_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "
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
        break
    fi
    echo "⏳ Tentativa $i/5..."
    sleep 2
done

if [ -z "$API_URL" ]; then
    echo -e "${RED}❌ Erro ao obter URL do ngrok da API${NC}"
    kill $NGROK_API_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✅ API ngrok: $API_URL${NC}"

# Testar API via ngrok
echo "🧪 Testando API via ngrok..."
if curl -s --max-time 15 "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API respondendo via ngrok${NC}"
else
    echo -e "${RED}❌ API não está respondendo via ngrok${NC}"
    kill $NGROK_API_PID 2>/dev/null || true
    exit 1
fi

# Atualizar .env.local com URL da API ngrok
echo ""
echo "📝 Atualizando configuração do frontend..."

# Backup do .env.local
cp src/Web/.env.local src/Web/.env.local.backup 2>/dev/null || true

# Atualizar ou adicionar VITE_NGROK_API_URL
if grep -q "VITE_NGROK_API_URL" src/Web/.env.local; then
    sed -i.bak "s|VITE_NGROK_API_URL=.*|VITE_NGROK_API_URL=$API_URL|" src/Web/.env.local
else
    echo "" >> src/Web/.env.local
    echo "# Configuração ngrok (acesso externo)" >> src/Web/.env.local
    echo "VITE_NGROK_API_URL=$API_URL" >> src/Web/.env.local
    echo "VITE_API_TIMEOUT=30000" >> src/Web/.env.local
fi

echo -e "${GREEN}✅ Configuração do frontend atualizada${NC}"

# ETAPA 2: Parar ngrok da API e iniciar para frontend
echo ""
echo "🔄 ETAPA 2: Alternando para ngrok do frontend..."
kill $NGROK_API_PID 2>/dev/null || true
sleep 5

# Iniciar ngrok para frontend
echo "🌐 Iniciando ngrok para frontend..."
ngrok http 5005 --log=stdout > ngrok-frontend.log 2>&1 &
NGROK_FRONTEND_PID=$!

# Aguardar inicialização do frontend
echo "⏳ Aguardando inicialização do ngrok do frontend..."
sleep 8

# Obter URL do frontend
FRONTEND_URL=""
for i in {1..5}; do
    FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "
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
        break
    fi
    echo "⏳ Tentativa $i/5..."
    sleep 2
done

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}❌ Erro ao obter URL do ngrok do frontend${NC}"
    kill $NGROK_FRONTEND_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✅ Frontend ngrok: $FRONTEND_URL${NC}"

# Testar frontend via ngrok
echo "🧪 Testando frontend via ngrok..."
if curl -s --max-time 15 "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend respondendo via ngrok${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend pode estar carregando...${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Configuração completa!${NC}"
echo ""
echo -e "${BLUE}📋 URLs configuradas:${NC}"
echo -e "   API Local: ${GREEN}http://192.168.15.119:5000${NC}"
echo -e "   API ngrok: ${GREEN}$API_URL${NC} ${YELLOW}(configurado no .env.local)${NC}"
echo -e "   Frontend Local: ${GREEN}http://192.168.15.119:5005${NC}"
echo -e "   Frontend ngrok: ${GREEN}$FRONTEND_URL${NC}"
echo ""
echo -e "${BLUE}📱 Para testar no celular:${NC}"
echo -e "   Acesse: ${GREEN}$FRONTEND_URL${NC}"
echo ""
echo -e "${BLUE}🔧 Como funciona:${NC}"
echo "   1. Frontend via ngrok detecta automaticamente o ambiente"
echo "   2. Usa a API ngrok configurada no .env.local"
echo "   3. Evita problemas de Mixed Content (HTTPS ↔ HTTPS)"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   - O ngrok gratuito permite apenas 1 túnel por vez"
echo "   - API e Frontend alternam conforme necessário"
echo "   - Configuração salva em src/Web/.env.local"
echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo "   Parar ngrok: pkill -f 'ngrok http'"
echo "   Ver logs: tail -f ngrok-frontend.log"
echo "   Testar conectividade: ./test-connectivity.sh"