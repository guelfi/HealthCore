#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# 🚀 HealthCore API Manager
# Gerencia a API com parâmetros: start/status/stop

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
API_PROJECT_PATH="src/Api"
API_PORT=5000
LOG_FILE="../log/api.log"
PID_FILE="$SCRIPT_DIR/api.pid"

# Função para obter IP local
get_local_ip() {
    # Detecta o sistema operacional
    OS=$(uname -s)

    if [ "$OS" = "Darwin" ]; then
        # macOS
        ipconfig getifaddr en0 2>/dev/null || echo "127.0.0.1"
    elif [ "$OS" = "Linux" ]; then
        # Linux
        if command -v ip >/dev/null 2>&1;
        then
            ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v "127.0.0.1" | head -n 1
        else
            echo "127.0.0.1"
        fi
    else
        # Outros sistemas ou fallback
        echo "127.0.0.1"
    fi
}

# Função para criar diretório de log
create_log_dir() {
    mkdir -p ../log
}

# Função para verificar se API está rodando
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
    PID_ON_PORT=$(lsof -t -i:$API_PORT)
    if [ -n "$PID_ON_PORT" ]; then
        # Verifica se o PID no arquivo é o mesmo que está na porta
        if [ -f "$PID_FILE" ]; then
            SAVED_PID=$(cat "$PID_FILE")
            # Remove PIDs do arquivo que estão na lista de PIDs da porta
            for PID in $PID_ON_PORT; do
                if [ "$PID" != "$SAVED_PID" ]; then
                    echo -e "${YELLOW}Matando processo externo na porta $API_PORT (PID: $PID)...${NC}"
                    kill -9 "$PID" 2>/dev/null
                fi
            done
        else
            # Se não há arquivo PID, mata todos os processos na porta
            echo -e "${YELLOW}Matando processos na porta $API_PORT...${NC}"
            kill -9 "$PID_ON_PORT" 2>/dev/null
        fi
        sleep 1
    fi
    
    echo -e "${GREEN}Serviço parado.${NC}"
}

# Função START
start_api() {
    create_log_dir
    
    # Header elegante
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${WHITE}                             HealthCore API Manager                          ${PURPLE} ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Verifica se já está rodando
    if is_running > /dev/null; then
        echo -e "${YELLOW}⚠️  API já está em execução!${NC}"
        exit 0
    fi
    
    # Libera a porta se estiver em uso por outros processos
    PID_ON_PORT=$(lsof -t -i:$API_PORT)
    if [ -n "$PID_ON_PORT" ]; then
        echo -e "${YELLOW}⚠️  Porta $API_PORT em uso. Verificando processos...${NC}"
        for PID in $PID_ON_PORT; do
            # Verifica se é um processo .NET
            if ps -p "$PID" -o comm= 2>/dev/null | grep -q "dotnet"; then
                echo -e "${YELLOW}Matando processo .NET na porta $API_PORT (PID: $PID)...${NC}"
                kill -9 "$PID" 2>/dev/null
            else
                echo -e "${YELLOW}Matando processo na porta $API_PORT (PID: $PID)...${NC}"
                kill -9 "$PID" 2>/dev/null
            fi
        done
        sleep 2
    fi
    
    # Informações do sistema
    LOCAL_IP=$(get_local_ip)
    echo -e "${CYAN}📡 Informações de Rede:${NC}"
    echo -e "   ${WHITE}• IP Local:${NC} ${GREEN}$LOCAL_IP${NC}"
    echo -e "   ${WHITE}• Porta:${NC} ${GREEN}$API_PORT${NC}"
    echo ""
    
    echo -e "${CYAN}🌐 URLs de Acesso:${NC}"
    echo -e "   ${WHITE}• Local:${NC} ${BLUE}http://localhost:$API_PORT${NC}"
    echo -e "   ${WHITE}• Rede:${NC} ${BLUE}http://$LOCAL_IP:$API_PORT${NC}"
    echo -e "   ${WHITE}• Swagger:${NC} ${BLUE}http://$LOCAL_IP:$API_PORT/swagger${NC}"
    echo ""
    
    # Navega para o diretório do projeto
    if [ ! -d "$API_PROJECT_PATH" ]; then
        echo -e "${RED}❌ Diretório do projeto não encontrado: $API_PROJECT_PATH${NC}"
        exit 1
    fi
    
    cd "$API_PROJECT_PATH" || exit 1
    
    # Prepara o ambiente
    echo -e "${YELLOW}⚙️  Preparando ambiente...${NC}"
    
    # Verifica se é um projeto .NET
    if ls *.csproj 1> /dev/null 2>&1; then
        echo -e "${YELLOW}🔨 Compilando projeto .NET...${NC}"
        dotnet build -c Release > "$LOG_FILE" 2>&1
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Erro na compilação! Verifique o log em $LOG_FILE${NC}"
            exit 1
        fi
    fi
    
    # Inicia a API em segundo plano
    echo -e "${YELLOW}🚀 Iniciando API...${NC}"
    nohup dotnet run > "$LOG_FILE" 2>&1 &
    
    # Aguarda inicialização e obtém o PID real da API
    echo -e "${YELLOW}⏳ Aguardando inicialização e obtendo PID...${NC}"
    API_PID=""
    for i in {1..10}; do
        PID_ON_PORT=$(lsof -t -i:$API_PORT | grep -v "^$PPID$") # Exclui o PID do próprio script
        if [ -n "$PID_ON_PORT" ]; then
            API_PID=$(echo "$PID_ON_PORT" | head -n 1) # Pega o primeiro PID encontrado
            break
        fi
        sleep 1
    done

    if [ -z "$API_PID" ]; then
        echo -e "${RED}❌ Falha ao obter PID da API na porta $API_PORT! Verifique o log em $LOG_FILE${NC}"
        exit 1
    fi
    
    # Salva o PID real
    echo "$API_PID" > "$PID_FILE"
    
    # Verifica se a API iniciou corretamente
    if ps -p "$API_PID" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API iniciada com sucesso!${NC}"
        echo -e "${GREEN}✅ PID: $API_PID${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar API! Verifique o log em $LOG_FILE${NC}"
        rm -f "$PID_FILE"
        exit 1
    fi
    
    # Testa conectividade
    echo -e "${YELLOW}🔍 Testando conectividade...${NC}"
    sleep 3
    
    if curl -s --head http://localhost:$API_PORT/swagger >/dev/null; then
        echo -e "${GREEN}✅ API respondendo corretamente${NC}"
    else
        echo -e "${RED}❌ API não está respondendo${NC}"
    fi
    
    echo ""
}

# Função STATUS
status_api() {
    clear
    
    # Header elegante
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${WHITE}                              Status HealthCore API                          ${PURPLE} ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Verifica se está rodando
    RUNNING_PID=$(is_running)
    if [ -n "$RUNNING_PID" ]; then
        echo -e "${GREEN}✅ Status: ${BOLD}API em execução${NC}"
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
        echo -e "   ${WHITE}• Porta:${NC} ${GREEN}$API_PORT${NC}"
        echo ""
        
        echo -e "${CYAN}🌐 URLs Ativas:${NC}"
        echo -e "   ${WHITE}• Local:${NC} ${BLUE}http://localhost:$API_PORT${NC}"
        echo -e "   ${WHITE}• Rede:${NC} ${BLUE}http://$LOCAL_IP:$API_PORT${NC}"
        echo -e "   ${WHITE}• Swagger:${NC} ${BLUE}http://$LOCAL_IP:$API_PORT/swagger${NC}"
    else
        echo -e "${RED}❌ Status: ${BOLD}API não está em execução${NC}"
        
        # Verifica se há processo na porta
        PID_ON_PORT=$(lsof -t -i:$API_PORT)
        if [ -n "$PID_ON_PORT" ]; then
            echo -e "${YELLOW}⚠️  Porta $API_PORT está em uso por outro processo${NC}"
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
stop_api() {
    clear
    
    # Header elegante
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${WHITE}                          Parando HealthCore API                             ${PURPLE} ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    stop_process
}

# Função CLEAR
clear_screen() {
    clear
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
        start_api
        ;;
    status)
        status_api
        ;;
    stop)
        stop_api
        ;;
    *)
        echo -e "${RED}❌ Parâmetro inválido!${NC}"
        echo -e "${CYAN}Uso: $0 {start|status|stop}${NC}"
        exit 1
        ;;
esac