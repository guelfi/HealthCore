#!/bin/bash

# 🌐 Script para iniciar MobileMed com ngrok
# Configura automaticamente ambos os túneis ngrok

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌐 Configurando MobileMed com ngrok${NC}"
echo "====================================="

# Verificar se ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok não encontrado${NC}"
    echo "💡 Instale com: brew install ngrok"
    exit 1
fi

# Verificar se os serviços estão rodando
echo "🔍 Verificando serviços locais..."

API_RUNNING=false
FRONTEND_RUNNING=false

if curl -s "http://192.168.15.119:5000/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API rodando na porta 5000${NC}"
    API_RUNNING=true
else
    echo -e "${YELLOW}⚠️  API não está rodando${NC}"
fi

if curl -s "http://192.168.15.119:5005" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend rodando na porta 5005${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Frontend não está rodando${NC}"
fi

if [ "$API_RUNNING" = false ] || [ "$FRONTEND_RUNNING" = false ]; then
    echo ""
    echo -e "${YELLOW}💡 Inicie os serviços primeiro:${NC}"
    echo "   ./start-both.sh"
    echo ""
    read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}🚇 Iniciando túneis ngrok...${NC}"

# Função para cleanup ao sair
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Parando túneis ngrok...${NC}"
    kill $NGROK_API_PID $NGROK_FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Iniciar ngrok para API em background
echo "🔧 Iniciando túnel ngrok para API (porta 5000)..."
ngrok http 5000 --log=stdout > /tmp/ngrok-api.log 2>&1 &
NGROK_API_PID=$!

# Aguardar ngrok da API inicializar
sleep 3

# Extrair URL do ngrok da API
echo "⏳ Aguardando ngrok da API inicializar..."
sleep 5

echo ""
echo -e "${YELLOW}📋 Verifique as URLs do ngrok:${NC}"
echo "   Dashboard: http://localhost:4040"
echo ""
echo -e "${BLUE}💡 Instruções:${NC}"
echo "1. Abra http://localhost:4040 no navegador"
echo "2. Copie a URL HTTPS do túnel da porta 5000 (API)"
echo "3. Cole aqui quando solicitado"
echo ""

read -p "🔗 Cole a URL HTTPS do ngrok da API (porta 5000): " API_NGROK_URL

if [ -z "$API_NGROK_URL" ]; then
    echo -e "${RED}❌ URL da API não fornecida${NC}"
    cleanup
    exit 1
fi

if [ -z "$API_NGROK_URL" ] || [ "$API_NGROK_URL" = "null" ]; then
    echo -e "${RED}❌ Não foi possível obter URL do ngrok da API${NC}"
    cleanup
    exit 1
fi

echo -e "${GREEN}✅ API ngrok: $API_NGROK_URL${NC}"

# Atualizar .env.local com a URL do ngrok da API
cd src/Web
cat > .env.local << EOF
# Configuração para ngrok
VITE_API_URL=http://192.168.15.119:5000
VITE_API_BASE_URL=http://192.168.15.119:5000
VITE_NGROK_API_URL=$API_NGROK_URL
VITE_APP_TITLE=MobileMed
VITE_API_TIMEOUT=30000
EOF

echo -e "${GREEN}✅ Configuração atualizada: VITE_NGROK_API_URL=$API_NGROK_URL${NC}"
cd ../..

# Iniciar ngrok para Frontend em background
echo "🔧 Iniciando túnel ngrok para Frontend (porta 5005)..."
ngrok http 5005 --log=stdout > /tmp/ngrok-frontend.log 2>&1 &
NGROK_FRONTEND_PID=$!

# Aguardar ngrok do Frontend inicializar
sleep 3

# Aguardar ngrok do Frontend
echo "⏳ Aguardando ngrok do Frontend inicializar..."
sleep 3

echo ""
read -p "🔗 Cole a URL HTTPS do ngrok do Frontend (porta 5005): " FRONTEND_NGROK_URL

if [ -z "$FRONTEND_NGROK_URL" ]; then
    echo -e "${RED}❌ URL do Frontend não fornecida${NC}"
    cleanup
    exit 1
fi

echo -e "${GREEN}✅ Frontend ngrok: $FRONTEND_NGROK_URL${NC}"

echo ""
echo -e "${GREEN}🎉 ngrok configurado com sucesso!${NC}"
echo ""
echo -e "${BLUE}📱 URLs para teste externo:${NC}"
echo -e "   🌐 Aplicação: ${GREEN}$FRONTEND_NGROK_URL${NC}"
echo -e "   🔧 API: ${GREEN}$API_NGROK_URL${NC}"
echo -e "   📊 ngrok Dashboard: ${GREEN}http://localhost:4040${NC}"
echo ""
echo -e "${YELLOW}💡 Use a URL da aplicação no celular (qualquer rede)${NC}"
echo -e "${YELLOW}💡 Pressione Ctrl+C para parar os túneis${NC}"

# Aguardar indefinidamente
wait