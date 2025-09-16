#!/bin/bash

# 🚀 Start Dual ngrok Tunnels - HealthCore
# Inicia ngrok para API e Frontend simultaneamente
# Suporta conta gratuita (alternando) e conta paga (simultâneo)

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando ngrok dual para API e Frontend${NC}"
echo "================================================"

# Verificar se ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok não está instalado!${NC}"
    echo "📥 Para instalar:"
    echo "   1. Acesse: https://ngrok.com/download"
    echo "   2. Configure seu token: ngrok config add-authtoken YOUR_TOKEN"
    exit 1
fi

echo -e "${GREEN}✅ ngrok encontrado${NC}"

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
        nohup dotnet run > /tmp/healthcore-api.log 2>&1 &
        API_PID=$!
        echo "API iniciada com PID: $API_PID"
        cd ../..
        
        # Aguardar API iniciar
        echo "⏳ Aguardando API inicializar..."
        for i in {1..30}; do
            if curl -s --max-time 3 "http://localhost:5000/health/ready" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ API inicializada com sucesso${NC}"
                API_RUNNING=true
                break
            fi
            sleep 2
            echo -n "."
        done
    fi
    
    if [ "$FRONTEND_RUNNING" = false ]; then
        echo "🌐 Iniciando Frontend..."
        cd src/Web
        nohup npm run dev > /tmp/healthcore-frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo "Frontend iniciado com PID: $FRONTEND_PID"
        cd ../..
        
        # Aguardar Frontend iniciar
        echo "⏳ Aguardando Frontend inicializar..."
        for i in {1..30}; do
            if curl -s --max-time 3 "http://localhost:5005" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Frontend inicializado com sucesso${NC}"
                FRONTEND_RUNNING=true
                break
            fi
            sleep 2
            echo -n "."
        done
    fi
fi

# Verificar se ambos os serviços estão rodando
if [ "$API_RUNNING" = false ] || [ "$FRONTEND_RUNNING" = false ]; then
    echo -e "${RED}❌ Erro ao iniciar os serviços${NC}"
    echo "📋 Verifique os logs:"
    echo "   API: tail -f /tmp/healthcore-api.log"
    echo "   Frontend: tail -f /tmp/healthcore-frontend.log"
    exit 1
fi

# Parar ngrok existente
echo ""
echo "🛑 Parando ngrok existente..."
pkill -f "ngrok http" 2>/dev/null || true
sleep 3

# Verificar tipo de conta ngrok
echo ""
echo "🔍 Verificando tipo de conta ngrok..."

# Tentar iniciar múltiplos túneis (conta paga)
echo "🧪 Testando múltiplos túneis..."

# Criar arquivo de configuração temporário
cat > /tmp/ngrok-config.yml << EOF
version: "2"
authtoken: $(ngrok config check 2>/dev/null | grep authtoken | cut -d' ' -f2 || echo "YOUR_TOKEN_HERE")

tunnels:
  api:
    addr: 5000
    proto: http
    bind_tls: true
    inspect: true
    host_header: localhost:5000
    
  frontend:
    addr: 5005
    proto: http
    bind_tls: true
    inspect: true
    host_header: localhost:5005
EOF

# Tentar iniciar múltiplos túneis
echo "🌐 Tentando iniciar múltiplos túneis..."
ngrok start --config /tmp/ngrok-config.yml api frontend > /tmp/ngrok-multi.log 2>&1 &
NGROK_MULTI_PID=$!

# Aguardar inicialização
sleep 8

# Verificar se múltiplos túneis funcionaram
TUNNELS_COUNT=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(len(data['tunnels']))
except:
    print('0')
" 2>/dev/null)

if [ "$TUNNELS_COUNT" -ge 2 ]; then
    echo -e "${GREEN}🎉 Múltiplos túneis funcionando! (Conta paga detectada)${NC}"
    
    # Obter URLs
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
    
    # Configurar frontend para usar API ngrok
    echo "📝 Configurando frontend para usar API ngrok..."
    
    # Backup do .env
    cp src/Web/.env src/Web/.env.backup 2>/dev/null || true
    
    # Atualizar configuração
    if grep -q "VITE_NGROK_API_URL" src/Web/.env; then
        sed -i.bak "s|VITE_NGROK_API_URL=.*|VITE_NGROK_API_URL=$API_URL|" src/Web/.env
    else
        echo "" >> src/Web/.env
        echo "# Configuração ngrok (acesso simultâneo)" >> src/Web/.env
        echo "VITE_NGROK_API_URL=$API_URL" >> src/Web/.env
        echo "VITE_API_TIMEOUT=30000" >> src/Web/.env
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Configuração dual completa!${NC}"
    echo ""
    echo -e "${BLUE}📋 URLs simultâneas:${NC}"
    echo -e "   API ngrok: ${GREEN}$API_URL${NC}"
    echo -e "   Frontend ngrok: ${GREEN}$FRONTEND_URL${NC}"
    echo ""
    echo -e "${BLUE}📱 Para testar:${NC}"
    echo -e "   Acesse: ${GREEN}$FRONTEND_URL${NC}"
    echo "   O frontend usará automaticamente a API ngrok"
    
else
    echo -e "${YELLOW}⚠️  Conta gratuita detectada - usando modo alternado${NC}"
    
    # Parar tentativa de múltiplos túneis
    kill $NGROK_MULTI_PID 2>/dev/null || true
    sleep 3
    
    # Usar script existente para modo alternado
    echo "🔄 Executando modo alternado..."
    bash scripts/ngrok/start-ngrok-complete.sh
fi

# Cleanup
rm -f /tmp/ngrok-config.yml

echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo "   Parar ngrok: pkill -f 'ngrok'"
echo "   Ver painel: http://localhost:4040"
echo "   Ver logs: tail -f /tmp/ngrok-multi.log"
echo "   Testar conectividade: ./test-connectivity.sh"
echo ""
echo -e "${GREEN}✅ ngrok configurado e rodando!${NC}"