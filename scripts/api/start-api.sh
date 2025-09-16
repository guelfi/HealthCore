#!/bin/bash

# 🚀 Script para iniciar API - HealthCore
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

echo -e "${BLUE}🚀 Iniciando API HealthCore${NC}"
echo "=================================="
echo -e "🌐 IP Local: ${GREEN}$LOCAL_IP${NC}"
echo -e "🔗 API URL: ${GREEN}http://$LOCAL_IP:5000${NC}"
echo -e "📋 Health: ${GREEN}http://$LOCAL_IP:5000/health${NC}"
echo -e "📖 Swagger: ${GREEN}http://$LOCAL_IP:5000/swagger${NC}"
echo ""
echo -e "${YELLOW}💡 Para testar no celular, use: http://$LOCAL_IP:5000${NC}"
echo ""

# Navegar para diretório da API
cd src/Api

# Iniciar API com bind em todas as interfaces
echo "🔧 Iniciando servidor..."
dotnet run --urls="http://0.0.0.0:5000"