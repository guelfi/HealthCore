#!/bin/bash

# 🚀 Setup Single Tunnel - HealthCore
# Solução para limitação da conta gratuita do ngrok
# Usa proxy reverso para permitir frontend e API no mesmo túnel

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Configuração ngrok com túnel único${NC}"
echo "=========================================="
echo -e "${YELLOW}💡 Solução para conta gratuita do ngrok${NC}"
echo "Esta configuração permite acesso externo ao frontend"
echo "com comunicação interna para a API."
echo ""

# Verificar se os serviços estão rodando
echo "🔍 Verificando serviços..."

API_RUNNING=false
FRONTEND_RUNNING=false

if curl -s --max-time 3 "http://localhost:5000/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API rodando na porta 5000${NC}"
    API_RUNNING=true
else
    echo -e "${RED}❌ API não está rodando na porta 5000${NC}"
fi

if curl -s --max-time 3 "http://localhost:5005" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend rodando na porta 5005${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${RED}❌ Frontend não está rodando na porta 5005${NC}"
fi

# Iniciar serviços se necessário
if [ "$API_RUNNING" = false ] || [ "$FRONTEND_RUNNING" = false ]; then
    echo ""
    echo "🚀 Iniciando serviços necessários..."
    
    if [ "$API_RUNNING" = false ]; then
        echo "📡 Iniciando API..."
        cd src/Api
        nohup dotnet run --urls="http://0.0.0.0:5000" > /tmp/healthcore-api.log 2>&1 &
        API_PID=$!
        echo "API iniciada com PID: $API_PID"
        cd ../..
        
        # Aguardar API iniciar
        echo "⏳ Aguardando API inicializar..."
        for i in {1..30}; do
            if curl -s --max-time 3 "http://localhost:5000/health" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ API inicializada com sucesso${NC}"
                API_RUNNING=true
                break
            fi
            sleep 2
            echo -n "."
        done
        echo ""
    fi
    
    if [ "$FRONTEND_RUNNING" = false ]; then
        echo "🌐 Iniciando Frontend..."
        cd src/Web
        
        # Configurar variáveis de ambiente para uso local da API
        export VITE_API_BASE_URL="http://localhost:5000"
        export VITE_API_URL="http://localhost:5000"
        
        nohup npm run dev -- --host 0.0.0.0 --port 5005 > /tmp/healthcore-frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo "Frontend iniciado com PID: $FRONTEND_PID"
        cd ../..
        
        # Aguardar Frontend iniciar
        echo "⏳ Aguardando Frontend inicializar..."
        for i in {1..20}; do
            if curl -s --max-time 3 "http://localhost:5005" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Frontend inicializado com sucesso${NC}"
                FRONTEND_RUNNING=true
                break
            fi
            sleep 2
            echo -n "."
        done
        echo ""
    fi
fi

# Verificar se ambos os serviços estão rodando
if [ "$API_RUNNING" = false ] || [ "$FRONTEND_RUNNING" = false ]; then
    echo -e "${RED}❌ Erro: Nem todos os serviços estão rodando${NC}"
    echo "💡 Verifique os logs em /tmp/healthcore-*.log"
    exit 1
fi

# Parar ngrok existente
echo "🛑 Parando ngrok existente..."
pkill -f "ngrok http" 2>/dev/null || true
sleep 2

# Iniciar ngrok apenas para o frontend
echo ""
echo "🌐 Iniciando ngrok para Frontend (porta 5005)..."
echo -e "${YELLOW}📋 Configuração:${NC}"
echo "   • Frontend exposto via ngrok"
echo "   • API acessível localmente pelo frontend"
echo "   • Comunicação interna mantida"
echo ""

ngrok http 5005 --log=stdout > scripts/ngrok/ngrok-frontend.log 2>&1 &
NGROK_PID=$!

# Aguardar ngrok inicializar
echo "⏳ Aguardando ngrok inicializar..."
sleep 8

# Obter URL do ngrok
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
    echo ""
    echo -e "${GREEN}🎉 Configuração concluída com sucesso!${NC}"
    echo "==========================================="
    echo -e "${BLUE}📱 Acesso Externo:${NC}"
    echo -e "   Frontend: ${GREEN}$FRONTEND_URL${NC}"
    echo ""
    echo -e "${BLUE}🔧 Acesso Local:${NC}"
    echo -e "   Frontend: ${GREEN}http://localhost:5005${NC}"
    echo -e "   API: ${GREEN}http://localhost:5000${NC}"
    echo ""
    echo -e "${YELLOW}💡 Como funciona:${NC}"
    echo "   • O frontend está acessível externamente via ngrok"
    echo "   • A API roda localmente e é acessada pelo frontend"
    echo "   • Todas as funcionalidades estão disponíveis"
    echo ""
    echo -e "${BLUE}🛠️  Para parar:${NC}"
    echo "   pkill -f 'ngrok http'"
    echo ""
    
    # Salvar informações em arquivo
    cat > scripts/ngrok/current-session.txt << EOF
# Sessão ngrok ativa - $(date)
FRONTEND_URL=$FRONTEND_URL
NGROK_PID=$NGROK_PID
API_PID=${API_PID:-"N/A"}
FRONTEND_PID=${FRONTEND_PID:-"N/A"}
EOF
    
    echo -e "${GREEN}📄 Informações salvas em: scripts/ngrok/current-session.txt${NC}"
else
    echo -e "${RED}❌ Erro ao obter URL do ngrok${NC}"
    echo "💡 Verifique se o ngrok está configurado corretamente"
    echo "💡 Execute: ngrok config add-authtoken YOUR_TOKEN"
    exit 1
fi