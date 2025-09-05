#!/bin/bash

# 🏥 MobileMed - Gerenciador de Serviços (Linux/macOS)
# Script wrapper para o gerenciador pm2

# --- Cores e Ícones ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

ICON_START="🚀"
ICON_STOP="🛑"
ICON_RESTART="🔄"
ICON_STATUS="📊"
ICON_LOGS="📄"
ICON_ERROR="❌"
ICON_INFO="ℹ️"

# --- Funções Auxiliares ---
print_header() {
    echo -e "${CYAN}=========================================${NC}"
    echo -e "${CYAN}   🏥 MobileMed Service Manager - $1 ${NC}"
    echo -e "${CYAN}=========================================${NC}"
}

# --- Verificações Iniciais ---
if ! command -v pm2 &> /dev/null; then
    print_header "Erro"
    echo -e "${RED}${ICON_ERROR} pm2 não encontrado. Por favor, instale globalmente:${NC}"
    echo -e "${YELLOW}   npm install pm2 -g${NC}"
    exit 1
fi

# --- Lógica Principal ---
COMMAND=$1
shift

case "$COMMAND" in
    start)
        print_header "Start"
        echo -e "${BLUE}${ICON_INFO} Iniciando serviços com pm2...${NC}"
        pm2 start ecosystem.config.js "$@"
        ;;
    stop)
        print_header "Stop"
        echo -e "${BLUE}${ICON_INFO} Parando serviços com pm2...${NC}"
        pm2 stop ecosystem.config.js "$@"
        ;;
    restart)
        print_header "Restart"
        echo -e "${BLUE}${ICON_INFO} Reiniciando serviços com pm2...${NC}"
        pm2 restart ecosystem.config.js "$@"
        ;;
    status)
        print_header "Status"
        echo -e "${BLUE}${ICON_STATUS} Status dos serviços (pm2):${NC}"
        node status.js
        ;;
    logs)
        print_header "Logs"
        echo -e "${BLUE}${ICON_LOGS} Visualizando logs com pm2...${NC}"
        pm2 logs "$@"
        ;;
    *)
        print_header "Comando Inválido"
        echo -e "${YELLOW}Comando inválido: $COMMAND${NC}"
        echo -e "Uso: $0 {start|stop|restart|status|logs} [options]"
        exit 1
        ;;
esac

