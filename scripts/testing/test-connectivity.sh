#!/bin/bash

# 🌐 HealthCore - Teste de Conectividade Distribuída
# Script para testar a conexão entre frontend e backend em máquinas diferentes

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

# Função para exibir header
show_header() {
    clear
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${BOLD}${WHITE}              🌐 HealthCore - Teste de Conectividade           ${NC}${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                   Desenvolvimento Distribuído                ${PURPLE} ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Função para obter IP local
get_local_ip() {
    # Detecta o sistema operacional
    OS=$(uname -s)
    
    if [ "$OS" = "Darwin" ]; then
        # macOS - Verificar versão
        if command -v sw_vers &> /dev/null; then
            MACOS_VERSION=$(sw_vers -productVersion)
            echo -e "${CYAN}🍎 Detectado macOS $MACOS_VERSION${NC}" >&2
            
            # Para macOS Catalina e versões antigas, usar ifconfig
            if [[ "$MACOS_VERSION" == "10.15"* ]]; then
                echo -e "${YELLOW}⚠️  macOS Catalina detectado - usando comandos compatíveis${NC}" >&2
            fi
        fi
        
        # Tentar diferentes interfaces para macOS
        for interface in en0 en1 en2; do
            IP=$(ifconfig $interface 2>/dev/null | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}')
            if [ -n "$IP" ]; then
                echo "$IP"
                return
            fi
        done
        
        # Fallback para macOS
        ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1
    elif command -v ip &> /dev/null; then
        # Linux com comando ip
        ip -4 addr show | grep "inet " | grep -vE "lo|127.0.0.1" | awk '{print $2}' | cut -d/ -f1 | head -n 1
    elif command -v ifconfig &> /dev/null; then
        # Sistemas com ifconfig
        ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1
    else
        echo "127.0.0.1"
    fi
}

# Função para testar conectividade
test_connectivity() {
    local api_url="$1"
    local test_name="$2"
    
    echo -e "${YELLOW}🔍 Testando: ${WHITE}$test_name${NC}"
    echo -e "${CYAN}   URL: ${WHITE}$api_url${NC}"
    
    # Teste de conectividade básica
    if curl -s --head --connect-timeout 5 "$api_url" >/dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Conectividade: OK${NC}"
        
        # Teste de CORS (se for um endpoint de API)
        if [[ "$api_url" == *"/swagger"* ]]; then
            echo -e "${GREEN}   ✅ Swagger: Acessível${NC}"
        elif [[ "$api_url" == *"/pacientes"* ]]; then
            # Testa endpoint específico
            response_code=$(curl -s -o /dev/null -w "%{http_code}" "$api_url?page=1&pageSize=10")
            if [[ "$response_code" == "200" ]]; then
                echo -e "${GREEN}   ✅ Endpoint /pacientes: OK (${response_code})${NC}"
            else
                echo -e "${YELLOW}   ⚠️  Endpoint /pacientes: ${response_code}${NC}"
            fi
        fi
    else
        echo -e "${RED}   ❌ Conectividade: FALHOU${NC}"
        echo -e "${RED}   ❌ Verifique se a API está rodando em $api_url${NC}"
    fi
    echo ""
}

# Função principal
main() {
    show_header
    
    # Informações do sistema local
    LOCAL_IP=$(get_local_ip)
    echo -e "${CYAN}📊 Informações da Máquina Local:${NC}"
    echo -e "   ${WHITE}• IP Local: ${GREEN}$LOCAL_IP${NC}"
    echo -e "   ${WHITE}• Sistema: ${GREEN}$(uname -s) $(uname -m)${NC}"
    echo -e "   ${WHITE}• Data/Hora: ${GREEN}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo ""
    
    # Solicitar IP da API
    if [ -z "$1" ]; then
        echo -e "${YELLOW}🔧 Digite o IP da máquina que roda a API:${NC}"
        read -p "IP da API (ex: 192.168.1.100): " API_IP
    else
        API_IP="$1"
    fi
    
    if [ -z "$API_IP" ]; then
        echo -e "${RED}❌ IP da API é obrigatório!${NC}"
        exit 1
    fi
    
    echo -e "${CYAN}🎯 Testando conectividade com API em: ${WHITE}$API_IP${NC}"
    echo ""
    
    # URLs para testar
    API_BASE="http://$API_IP:5000"
    
    # Bateria de testes
    test_connectivity "$API_BASE" "API Base"
    test_connectivity "$API_BASE/swagger" "Swagger Documentation"
    test_connectivity "$API_BASE/pacientes" "Endpoint Pacientes"
    test_connectivity "$API_BASE/exames" "Endpoint Exames"
    
    echo -e "${CYAN}📋 Configuração do Frontend:${NC}"
    echo -e "${WHITE}   Arquivo: ${YELLOW}src/Web/.env${NC}"
    echo -e "${WHITE}   Configurar: ${GREEN}VITE_API_BASE_URL=http://$API_IP:5000${NC}"
    echo ""
    
    echo -e "${CYAN}🌐 URLs para acessar:${NC}"
    echo -e "${WHITE}   • API: ${BLUE}http://$API_IP:5000${NC}"
    echo -e "${WHITE}   • Swagger: ${BLUE}http://$API_IP:5000/swagger${NC}"
    echo -e "${WHITE}   • Frontend (sua máquina): ${BLUE}http://$LOCAL_IP:5005${NC}"
    echo ""
    
    # Teste de porta (se netcat estiver disponível)
    if command -v nc &> /dev/null; then
        echo -e "${YELLOW}🔍 Testando porta 5000...${NC}"
        if nc -z "$API_IP" 5000 2>/dev/null; then
            echo -e "${GREEN}✅ Porta 5000 está aberta em $API_IP${NC}"
        else
            echo -e "${RED}❌ Porta 5000 não está acessível em $API_IP${NC}"
            echo -e "${YELLOW}⚠️  Verifique se:${NC}"
            echo -e "   ${WHITE}• A API está rodando${NC}"
            echo -e "   ${WHITE}• O firewall permite conexões na porta 5000${NC}"
            echo -e "   ${WHITE}• O IP está correto${NC}"
        fi
        echo ""
    fi
    
    echo -e "${GREEN}🎯 Teste concluído!${NC}"
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi