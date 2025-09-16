#!/bin/bash

# 🚀 Script para iniciar Frontend - HealthCore
# Configura automaticamente para usar IP da máquina

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

echo -e "${BLUE}🚀 Iniciando Frontend HealthCore${NC}"
echo "===================================="
echo -e "🌐 IP Local: ${GREEN}$LOCAL_IP${NC}"
echo -e "🔗 Frontend URL: ${GREEN}http://$LOCAL_IP:5005${NC}"
echo ""
echo -e "${YELLOW}💡 Para testar no celular, use: http://$LOCAL_IP:5005${NC}"
echo ""

# Navegar para diretório do Frontend
cd src/Web

# Atualizar configuração da API para usar IP local
echo "🔧 Configurando API URL..."
cat > .env.local << EOF
VITE_API_URL=http://$LOCAL_IP:5000
VITE_APP_TITLE=HealthCore
EOF

echo "✅ Arquivo .env.local criado com API_URL: http://$LOCAL_IP:5000"
echo ""

# Iniciar Frontend com bind em todas as interfaces
echo "🔧 Iniciando servidor de desenvolvimento..."
npm run dev -- --host 0.0.0.0 --port 5005