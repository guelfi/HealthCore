#!/bin/bash

# 📱 Script de Configuração Mobile - HealthCore
# Configura ambiente completo para desenvolvimento mobile via ngrok

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}📱 HealthCore - Configuração Mobile Development${NC}"
echo "=================================================="
echo ""

# Verificar dependências
echo -e "${BLUE}🔍 Verificando dependências...${NC}"

# Verificar ngrok
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok não encontrado${NC}"
    echo "💡 Para instalar:"
    echo "   - Linux: snap install ngrok"
    echo "   - macOS: brew install ngrok"
    echo "   - Windows: Download em https://ngrok.com/download"
    echo ""
    echo "📋 Após instalar, configure seu token:"
    echo "   ngrok config add-authtoken YOUR_TOKEN"
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

echo -e "${GREEN}✅ Dependências OK${NC}"
echo ""

# Ir para diretório do frontend
cd src/Web

# Verificar package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json não encontrado${NC}"
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Instalando dependências...${NC}"
    npm install
fi

# Configurar .env.local para desenvolvimento mobile
echo -e "${BLUE}⚙️ Configurando ambiente mobile...${NC}"
cat > .env.local << EOF
# Configuração Mobile Development - HealthCore
VITE_API_URL=http://129.153.86.168:5000
VITE_API_BASE_URL=http://129.153.86.168:5000
VITE_APP_TITLE=HealthCore Mobile
VITE_API_TIMEOUT=30000
VITE_MOBILE_DEV=true

# Configurações de desenvolvimento
VITE_DEV_MODE=true
VITE_DEBUG_MODE=false

# Performance mobile
VITE_LAZY_LOADING=true
VITE_OPTIMIZE_IMAGES=true
EOF

echo -e "${GREEN}✅ Ambiente configurado${NC}"

# Função para iniciar frontend
start_frontend() {
    echo -e "${BLUE}🌐 Iniciando frontend mobile...${NC}"
    npm run dev:network &
    FRONTEND_PID=$!
    
    # Aguardar frontend inicializar
    echo -e "${YELLOW}⏳ Aguardando frontend inicializar...${NC}"
    sleep 5
    
    # Verificar se frontend está rodando
    if curl -s http://localhost:5005 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend rodando em http://localhost:5005${NC}"
        return 0
    else
        echo -e "${RED}❌ Erro ao iniciar frontend${NC}"
        return 1
    fi
}

# Função para configurar ngrok
setup_ngrok() {
    echo -e "${BLUE}🌐 Configurando ngrok...${NC}"
    
    # Iniciar ngrok
    ngrok http 5005 --log=stdout > /tmp/ngrok-frontend.log 2>&1 &
    NGROK_PID=$!
    
    echo -e "${YELLOW}⏳ Aguardando ngrok inicializar...${NC}"
    sleep 5
    
    # Obter URL do ngrok via API
    NGROK_URL=""
    for i in {1..10}; do
        NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok[^"]*' | head -1)
        if [ ! -z "$NGROK_URL" ]; then
            break
        fi
        sleep 2
    done
    
    if [ ! -z "$NGROK_URL" ]; then
        echo -e "${GREEN}✅ ngrok configurado: $NGROK_URL${NC}"
        
        # Salvar URL para uso posterior
        echo "$NGROK_URL" > /tmp/healthcore-ngrok-url.txt
        
        return 0
    else
        echo -e "${RED}❌ Erro ao configurar ngrok${NC}"
        return 1
    fi
}

# Função de cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Parando serviços...${NC}"
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$NGROK_PID" ]; then
        kill $NGROK_PID 2>/dev/null || true
    fi
    exit 0
}

# Capturar sinais
trap cleanup SIGINT SIGTERM

# Menu principal
echo -e "${PURPLE}📋 Opções de configuração:${NC}"
echo "1. 🚀 Iniciar desenvolvimento mobile completo (frontend + ngrok)"
echo "2. 🌐 Apenas frontend local"
echo "3. 🔧 Apenas ngrok (frontend já rodando)"
echo "4. 📱 Status dos serviços"
echo "5. 🧹 Limpar configurações"
echo ""
read -p "Escolha uma opção [1-5]: " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 Iniciando desenvolvimento mobile completo...${NC}"
        if start_frontend && setup_ngrok; then
            NGROK_URL=$(cat /tmp/healthcore-ngrok-url.txt)
            echo ""
            echo -e "${GREEN}🎉 Ambiente mobile configurado com sucesso!${NC}"
            echo ""
            echo -e "${PURPLE}📱 URLs para acesso mobile:${NC}"
            echo -e "   🌐 App (ngrok): ${GREEN}$NGROK_URL${NC}"
            echo -e "   🏠 Local: ${GREEN}http://localhost:5005${NC}"
            echo -e "   📊 ngrok Dashboard: ${GREEN}http://localhost:4040${NC}"
            echo ""
            echo -e "${YELLOW}💡 Use a URL ngrok no seu celular (qualquer rede WiFi)${NC}"
            echo -e "${YELLOW}💡 Pressione Ctrl+C para parar todos os serviços${NC}"
            echo ""
            
            # QR Code se disponível
            if command -v qrencode &> /dev/null; then
                echo -e "${BLUE}📱 QR Code para acesso rápido:${NC}"
                echo "$NGROK_URL" | qrencode -t ANSI
                echo ""
            fi
            
            # Aguardar indefinidamente
            wait
        else
            echo -e "${RED}❌ Erro na configuração${NC}"
            cleanup
        fi
        ;;
    2)
        echo -e "${BLUE}🌐 Iniciando apenas frontend...${NC}"
        start_frontend
        echo -e "${GREEN}✅ Frontend disponível em http://localhost:5005${NC}"
        wait
        ;;
    3)
        echo -e "${BLUE}🔧 Configurando apenas ngrok...${NC}"
        if curl -s http://localhost:5005 > /dev/null 2>&1; then
            setup_ngrok
            NGROK_URL=$(cat /tmp/healthcore-ngrok-url.txt)
            echo -e "${GREEN}✅ ngrok disponível: $NGROK_URL${NC}"
            wait
        else
            echo -e "${RED}❌ Frontend não está rodando na porta 5005${NC}"
        fi
        ;;
    4)
        echo -e "${BLUE}📱 Status dos serviços:${NC}"
        echo ""
        
        # Frontend
        if curl -s http://localhost:5005 > /dev/null 2>&1; then
            echo -e "   Frontend: ${GREEN}✅ Rodando (porta 5005)${NC}"
        else
            echo -e "   Frontend: ${RED}❌ Parado${NC}"
        fi
        
        # ngrok
        if curl -s http://localhost:4040 > /dev/null 2>&1; then
            NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok[^"]*' | head -1)
            if [ ! -z "$NGROK_URL" ]; then
                echo -e "   ngrok: ${GREEN}✅ Ativo ($NGROK_URL)${NC}"
            else
                echo -e "   ngrok: ${YELLOW}⚠️  Dashboard ativo mas sem túneis${NC}"
            fi
        else
            echo -e "   ngrok: ${RED}❌ Inativo${NC}"
        fi
        
        # API OCI
        if curl -s http://129.153.86.168:5000/health > /dev/null 2>&1; then
            echo -e "   API OCI: ${GREEN}✅ Disponível${NC}"
        else
            echo -e "   API OCI: ${RED}❌ Indisponível${NC}"
        fi
        ;;
    5)
        echo -e "${BLUE}🧹 Limpando configurações...${NC}"
        rm -f .env.local
        rm -f /tmp/healthcore-ngrok-url.txt
        rm -f /tmp/ngrok-frontend.log
        echo -e "${GREEN}✅ Configurações limpas${NC}"
        ;;
    *)
        echo -e "${RED}❌ Opção inválida${NC}"
        exit 1
        ;;
esac

# Voltar ao diretório raiz
cd ../..