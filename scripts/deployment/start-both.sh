#!/bin/bash

# 🚀 Script para iniciar API + Frontend - MobileMed
# Inicia ambos os serviços usando IP da máquina

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Descobrir IP local
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
    else
        # Linux
        hostname -I | awk '{print $1}'
    fi
}

LOCAL_IP=$(get_local_ip)

echo -e "${BLUE}🚀 Iniciando MobileMed Completo${NC}"
echo "=================================="
echo -e "🌐 IP Local: ${GREEN}$LOCAL_IP${NC}"
echo -e "🔗 API: ${GREEN}http://$LOCAL_IP:5000${NC}"
echo -e "🔗 Frontend: ${GREEN}http://$LOCAL_IP:5005${NC}"
echo ""
echo -e "${YELLOW}📱 URLs para celular:${NC}"
echo -e "   API: ${GREEN}http://$LOCAL_IP:5000${NC}"
echo -e "   App: ${GREEN}http://$LOCAL_IP:5005${NC}"
echo ""

# Verificar se as dependências estão instaladas
echo "🔍 Verificando dependências..."

# Verificar .NET
if ! command -v dotnet &> /dev/null; then
    echo -e "${RED}❌ .NET não encontrado${NC}"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Todas as dependências encontradas${NC}"
echo ""

# Configurar Frontend para usar IP local
echo "🔧 Configurando Frontend..."
cd src/Web
cat > .env.local << EOF
VITE_API_URL=http://$LOCAL_IP:5000
VITE_APP_TITLE=MobileMed
EOF
echo -e "${GREEN}✅ Frontend configurado para API: http://$LOCAL_IP:5000${NC}"
cd ../..

# Função para cleanup ao sair
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Parando serviços...${NC}"
    kill $API_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Iniciar API em background
echo "🔧 Iniciando API..."
cd src/Api
dotnet run --urls="http://0.0.0.0:5000" &
API_PID=$!
cd ../..

# Aguardar API inicializar
echo "⏳ Aguardando API inicializar..."
sleep 5

# Testar se API está rodando
if curl -s "http://$LOCAL_IP:5000/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API iniciada com sucesso${NC}"
else
    echo -e "${YELLOW}⚠️  API ainda inicializando...${NC}"
fi

# Iniciar Frontend em background
echo "🔧 Iniciando Frontend..."
cd src/Web
npm run dev -- --host 0.0.0.0 --port 5005 &
FRONTEND_PID=$!
cd ../..

echo ""
echo -e "${GREEN}🎉 Serviços iniciados!${NC}"
echo ""
echo -e "${BLUE}📋 URLs de Acesso:${NC}"
echo -e "   🖥️  Notebook: ${GREEN}http://$LOCAL_IP:5005${NC}"
echo -e "   📱 Celular: ${GREEN}http://$LOCAL_IP:5005${NC}"
echo -e "   🔧 API: ${GREEN}http://$LOCAL_IP:5000${NC}"
echo -e "   📖 Swagger: ${GREEN}http://$LOCAL_IP:5000/swagger${NC}"
echo ""
echo -e "${YELLOW}💡 Pressione Ctrl+C para parar os serviços${NC}"

# Aguardar indefinidamente
wait