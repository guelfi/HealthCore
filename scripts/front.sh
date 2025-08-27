#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# 🌐 MobileMed Frontend Launcher
# Gerencia o frontend com parâmetros: start/status/stop

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

# Variáveis de configuração
FRONTEND_PROJECT_PATH="src/Web"
FRONTEND_PORT=5005
LOG_FILE="../log/frontend.log"
PID_FILE="$SCRIPT_DIR/front.pid"

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

# Função para criar diretório de log
create_log_dir() {
    mkdir -p ../log
}

# Função para verificar se frontend está rodando
is_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "$PID"
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# Função para parar processo existente
stop_process() {
    echo -e "${YELLOW}Parando serviço...${NC}"
    
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if kill "$OLD_PID" 2>/dev/null; then
            echo -e "${GREEN}Processo $OLD_PID encerrado.${NC}"
            sleep 2
        fi
        
        # Verifica se o processo ainda está ativo
        if ps -p "$OLD_PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}Processo ainda ativo, forçando encerramento...${NC}"
            kill -9 "$OLD_PID" 2>/dev/null
        fi
        
        rm -f "$PID_FILE"
    fi
    
    # Mata qualquer processo na porta (exceto o processo atual)
    PID_ON_PORT=$(lsof -t -i:$FRONTEND_PORT)
    if [ -n "$PID_ON_PORT" ]; then
        # Verifica se o PID no arquivo é o mesmo que está na porta
        if [ -f "$PID_FILE" ]; then
            SAVED_PID=$(cat "$PID_FILE")
            # Remove PIDs do arquivo que estão na lista de PIDs da porta
            for PID in $PID_ON_PORT; do
                if [ "$PID" != "$SAVED_PID" ]; then
                    echo -e "${YELLOW}Matando processo externo na porta $FRONTEND_PORT (PID: $PID)...${NC}"
                    kill -9 "$PID" 2>/dev/null
                fi
            done
        else
            # Se não há arquivo PID, mata todos os processos na porta
            echo -e "${YELLOW}Matando processos na porta $FRONTEND_PORT...${NC}"
            kill -9 "$PID_ON_PORT" 2>/dev/null
        fi
        sleep 1
    fi
    
    echo -e "${GREEN}Serviço parado.${NC}"
}

# Função START
start_front() {
    create_log_dir
    
    # Header elegante
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${WHITE}                             MobileMed Frontend Manager                      ${PURPLE} ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Verifica se já está rodando
    if is_running > /dev/null; then
        echo -e "${YELLOW}⚠️  Frontend já está em execução!${NC}"
        exit 0
    fi
    
    # Libera a porta se estiver em uso por outros processos
    PID_ON_PORT=$(lsof -t -i:$FRONTEND_PORT)
    if [ -n "$PID_ON_PORT" ]; then
        echo -e "${YELLOW}⚠️  Porta $FRONTEND_PORT em uso. Verificando processos...${NC}"
        for PID in $PID_ON_PORT; do
            echo -e "${YELLOW}Matando processo na porta $FRONTEND_PORT (PID: $PID)...${NC}"
            kill -9 "$PID" 2>/dev/null
        done
        sleep 2
    fi
    
    # Informações do sistema
    LOCAL_IP=$(get_local_ip)
    echo -e "${CYAN}📡 Informações de Rede:${NC}"
    echo -e "   ${WHITE}• IP Local:${NC} ${GREEN}$LOCAL_IP${NC}"
    echo -e "   ${WHITE}• Porta:${NC} ${GREEN}$FRONTEND_PORT${NC}"
    echo ""
    
    echo -e "${CYAN}🌐 URLs de Acesso:${NC}"
    echo -e "   ${WHITE}• Local:${NC} ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
    echo -e "   ${WHITE}• Rede:${NC} ${BLUE}http://$LOCAL_IP:$FRONTEND_PORT${NC}"
    echo ""
    
    # Navega para o diretório do projeto
    if [ ! -d "$FRONTEND_PROJECT_PATH" ]; then
        echo -e "${RED}❌ Diretório do projeto não encontrado: $FRONTEND_PROJECT_PATH${NC}"
        exit 1
    fi
    
    cd "$FRONTEND_PROJECT_PATH" || exit 1
    
    # Prepara o ambiente
    echo -e "${YELLOW}⚙️  Preparando ambiente...${NC}"
    
    # Verificando se node_modules existe
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Instalando dependências...${NC}"
        npm install > "$LOG_FILE" 2>&1
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Erro na instalação das dependências! Verifique o log em $LOG_FILE${NC}"
            exit 1
        fi
    fi
    
    # Iniciando o frontend em segundo plano
    echo -e "${YELLOW}🚀 Iniciando Frontend...${NC}"
    nohup npm run dev > "$LOG_FILE" 2>&1 &
    
    # Aguarda inicialização e obtém o PID real do frontend
    echo -e "${YELLOW}⏳ Aguardando inicialização e obtendo PID...${NC}"
    FRONTEND_PID=""
    for i in {1..10}; do
        PID_ON_PORT=$(lsof -t -i:$FRONTEND_PORT | grep -v "^$PPID$") # Exclui o PID do próprio script
        if [ -n "$PID_ON_PORT" ]; then
            FRONTEND_PID=$(echo "$PID_ON_PORT" | head -n 1) # Pega o primeiro PID encontrado
            break
        fi
        sleep 1
    done

    if [ -z "$FRONTEND_PID" ]; then
        echo -e "${RED}❌ Falha ao obter PID do Frontend na porta $FRONTEND_PORT! Verifique o log em $LOG_FILE${NC}"
        exit 1
    fi
    
    # Salva o PID real
    echo "$FRONTEND_PID" > "$PID_FILE"
    
    # Verifica se o frontend iniciou corretamente
    if ps -p "$FRONTEND_PID" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend iniciado com sucesso!${NC}"
        echo -e "${GREEN}✅ PID: $FRONTEND_PID${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar Frontend! Verifique o log em $LOG_FILE${NC}"
        rm -f "$PID_FILE"
        exit 1
    fi
    
    # Testa conectividade
    echo -e "${YELLOW}🔍 Testando conectividade...${NC}"
    sleep 3
    
    if curl -s --head http://localhost:$FRONTEND_PORT >/dev/null; then
        echo -e "${GREEN}✅ Frontend respondendo corretamente${NC}"
    else
        echo -e "${RED}❌ Frontend não está respondendo${NC}"
    fi
    
    echo ""
}

# Função STATUS
status_front() {
    clear
    
    # Header elegante
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${WHITE}                              Status MobileMed Frontend                      ${PURPLE} ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Verifica se está rodando
    RUNNING_PID=$(is_running)
    if [ -n "$RUNNING_PID" ]; then
        echo -e "${GREEN}✅ Status: ${BOLD}Frontend em execução${NC}"
        echo -e "   ${WHITE}• PID:${NC} ${GREEN}$RUNNING_PID${NC}"
        
        # Informações adicionais
        UPTIME=$(ps -o etime= -p "$RUNNING_PID" 2>/dev/null | tr -d ' ')
        if [ -n "$UPTIME" ]; then
            echo -e "   ${WHITE}• Uptime:${NC} ${GREEN}$UPTIME${NC}"
        fi
        
        TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
        echo -e "   ${WHITE}• Data/Hora:${NC} ${GREEN}$TIMESTAMP${NC}"
        
        LOCAL_IP=$(get_local_ip)
        echo -e "   ${WHITE}• IP Local:${NC} ${GREEN}$LOCAL_IP${NC}"
        echo -e "   ${WHITE}• Porta:${NC} ${GREEN}$FRONTEND_PORT${NC}"
        echo ""
        
        echo -e "${CYAN}🌐 URLs Ativas:${NC}"
        echo -e "   ${WHITE}• Local:${NC} ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
        echo -e "   ${WHITE}• Rede:${NC} ${BLUE}http://$LOCAL_IP:$FRONTEND_PORT${NC}"
    else
        echo -e "${RED}❌ Status: ${BOLD}Frontend não está em execução${NC}"
        
        # Verifica se há processo na porta
        PID_ON_PORT=$(lsof -t -i:$FRONTEND_PORT)
        if [ -n "$PID_ON_PORT" ]; then
            echo -e "${YELLOW}⚠️  Porta $FRONTEND_PORT está em uso por outro processo${NC}"
            for PID in $PID_ON_PORT; do
                PROCESS_NAME=$(ps -p "$PID" -o comm= 2>/dev/null)
                echo -e "   ${WHITE}• PID: $PID - Processo: $PROCESS_NAME${NC}"
            done
        fi
    fi
    
    echo ""
    echo -e "${CYAN}📋 Log:${NC} ${WHITE}$LOG_FILE${NC}"
    echo ""
}

# Função STOP
stop_front() {
    clear
    
    # Header elegante
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${WHITE}                          Parando MobileMed Frontend                         ${PURPLE} ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    stop_process
}

# Verifica parâmetro
if [ $# -eq 0 ]; then
    echo -e "${CYAN}📋 Comandos disponíveis:${NC}"
    echo -e "   ${WHITE}• Iniciar:${NC} ${YELLOW}$0 start${NC}"
    echo -e "   ${WHITE}• Status:${NC} ${YELLOW}$0 status${NC}"
    echo -e "   ${WHITE}• Parar:${NC} ${YELLOW}$0 stop${NC}"
    echo -e ""
    echo -e "${CYAN}💡 Para mais informações: ${YELLOW}$0 {start|status|stop}${NC}"
    exit 1
fi

ACTION=$1

# Trata comandos
case "$ACTION" in
    start)
        start_front
        ;;
    status)
        status_front
        ;;
    stop)
        stop_front
        ;;
    *)
        echo -e "${RED}❌ Parâmetro inválido!${NC}"
        echo -e "${CYAN}Uso: $0 {start|status|stop}${NC}"
        exit 1
        ;;
esac
