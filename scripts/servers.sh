#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# 🚀 MobileMed Full Stack Launcher
# Gerencia API e Frontend com parâmetros: start/status/stop

# Cores para output elegante
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configurações
API_PORT=5000
FRONTEND_PORT=5005

# Função para obter IP local
get_local_ip() {
    if command -v ifconfig &> /dev/null; then
        ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1
    elif command -v ip &> /dev/null; then
        ip -4 addr show | grep "inet " | grep -vE "lo|127.0.0.1" | awk '{print $2}' | cut -d/ -f1 | head -n 1
    else
        echo "127.0.0.1" # Fallback for systems without ifconfig or ip
    fi
}

# Função START
start_servers() {
    # Header principal elegante
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${BOLD}${WHITE}                    🏥 MobileMed Platform                     ${NC}${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                   Full Stack Deployment                     ${PURPLE} ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Informações do sistema
    LOCAL_IP=$(get_local_ip)
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    echo -e "${CYAN}📊 Informações do Sistema:${NC}"
    echo -e "   ${WHITE}• Data/Hora:${NC} ${GREEN}$TIMESTAMP${NC}"
    echo -e "   ${WHITE}• IP Local:${NC} ${GREEN}$LOCAL_IP${NC}"
    echo -e "   ${WHITE}• Sistema:${NC} ${GREEN}$(uname -s) $(uname -m)${NC}"
    echo ""

    echo -e "${CYAN}🌐 Configuração de Rede:${NC}"
    echo -e "   ${WHITE}• API Port:${NC} ${GREEN}$API_PORT${NC}"
    echo -e "   ${WHITE}• Frontend Port:${NC} ${GREEN}$FRONTEND_PORT${NC}"
    echo ""

    # Iniciando API
    echo -e "${YELLOW}🔥 Iniciando Backend (API)...${NC}"
    echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    "$SCRIPT_DIR/api.sh" start
    API_STATUS=$?

    echo ""
echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    # Aguarda um pouco antes de iniciar o frontend
    sleep 2

    # Iniciando Frontend
    echo -e "${YELLOW}🔥 Iniciando Frontend (Web)...${NC}"
    echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    "$SCRIPT_DIR/front.sh" start
    FRONTEND_STATUS=$?

    echo ""
echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    # Resumo final
    echo ""
    if [ $API_STATUS -eq 0 ] && [ $FRONTEND_STATUS -eq 0 ]; then
        echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║${BOLD}${WHITE}                  🎉 DEPLOY COMPLETO! 🎉                     ${NC}${GREEN} ║${NC}"
        echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${CYAN}🌐 URLs de Acesso Completas:${NC}"
        echo ""
        echo -e "${WHITE}📱 Frontend (Interface do Usuário):${NC}"
        echo -e "   ${WHITE}• Local:${NC} ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
        echo -e "   ${WHITE}• Rede:${NC} ${BLUE}http://$LOCAL_IP:$FRONTEND_PORT${NC}"
        echo ""
        echo -e "${WHITE}🔧 Backend (API):${NC}"
        echo -e "   ${WHITE}• Local:${NC} ${BLUE}http://localhost:$API_PORT${NC}"
        echo -e "   ${WHITE}• Rede:${NC} ${BLUE}http://$LOCAL_IP:$API_PORT${NC}"
        echo -e "   ${WHITE}• Swagger:${NC} ${BLUE}http://localhost:$API_PORT/swagger${NC}"
        echo ""
        echo -e "${CYAN}📋 Comandos Úteis:${NC}"
        echo -e "   ${WHITE}• Parar API:${NC} ${YELLOW}$SCRIPT_DIR/api.sh stop${NC}"
        echo -e "   ${WHITE}• Parar Frontend:${NC} ${YELLOW}$SCRIPT_DIR/front.sh stop${NC}"
        echo -e "   ${WHITE}• Parar Ambos:${NC} ${YELLOW}$SCRIPT_DIR/servers.sh stop${NC}"
        echo -e "   ${WHITE}• Ver Logs:${NC} ${YELLOW}tail -f log/*.log${NC}"
        echo ""
        echo -e "${GREEN}✨ Plataforma MobileMed está pronta para uso!${NC}"
    else
        echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║${BOLD}${WHITE}                    ❌ ERRO NO DEPLOY                        ${NC}${RED} ║${NC}"
        echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        if [ $API_STATUS -ne 0 ]; then
            echo -e "${RED}❌ Falha ao iniciar a API${NC}"
        fi
        if [ $FRONTEND_STATUS -ne 0 ]; then
            echo -e "${RED}❌ Falha ao iniciar o Frontend${NC}"
        fi
        echo -e "${WHITE}Verifique os logs em: ${CYAN}log/*.log${NC}"
        exit 1
    fi
}

# Função STATUS
status_servers() {
    clear
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${BOLD}${WHITE}                  🏥 MobileMed Platform                     ${NC}${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                   Status dos Serviços                       ${PURPLE} ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${CYAN}📊 Status do Backend (API):${NC}"
    echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    "$SCRIPT_DIR/api.sh" status
    echo ""

    echo -e "${CYAN}📊 Status do Frontend (Web):${NC}"
    echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    "$SCRIPT_DIR/front.sh" status
    echo ""
}

# Função STOP
stop_servers() {
    clear
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${BOLD}${WHITE}                  🏥 MobileMed Platform                     ${NC}${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                   Parando Serviços                        ${PURPLE} ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${YELLOW}🛑 Parando Backend (API)...${NC}"
    echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    "$SCRIPT_DIR/api.sh" stop
    echo ""

    echo -e "${YELLOW}🛑 Parando Frontend (Web)...${NC}"
    echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    "$SCRIPT_DIR/front.sh" stop
    echo ""

    echo -e "${GREEN}✅ Todos os serviços parados.${NC}"
}

# Verifica parâmetro
if [ $# -eq 0 ]; then
    echo -e "${CYAN}📋 Comandos disponíveis:${NC}"
    echo -e "   ${WHITE}• Iniciar Ambos:${NC} ${YELLOW}$0 start${NC}"
    echo -e "   ${WHITE}• Status Ambos:${NC} ${YELLOW}$0 status${NC}"
    echo -e "   ${WHITE}• Parar Ambos:${NC} ${YELLOW}$0 stop${NC}"
    echo -e ""
    echo -e "${CYAN}💡 Para mais informações: ${YELLOW}$0 {start|status|stop}${NC}"
    exit 1
fi

ACTION=$1

# Trata comandos
case "$ACTION" in
    start)
        start_servers
        ;;
    status)
        status_servers
        ;;
    stop)
        stop_servers
        ;;
    *)
        echo -e "${RED}❌ Parâmetro inválido!${NC}"
        echo -e "${CYAN}Uso: $0 {start|status|stop}${NC}"
        exit 1
        ;;
esac
