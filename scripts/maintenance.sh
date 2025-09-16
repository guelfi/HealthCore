#!/bin/bash

# HealthCore - Script de Manutenção e Monitoramento
# Uso: ./maintenance.sh [comando]
# Comandos: status, logs, backup, cleanup, restart, update, monitor

set -e

# Configurações
PROJECT_DIR="/var/www/HealthCore"
BACKUP_DIR="/var/backups/healthcore"
LOG_DIR="/var/log/healthcore"
DB_PATH="$PROJECT_DIR/backend/healthcore.db"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR $(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING $(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Verificar se estamos no diretório correto
check_directory() {
    if [ ! -d "$PROJECT_DIR" ]; then
        error "Diretório do projeto não encontrado: $PROJECT_DIR"
        exit 1
    fi
    cd "$PROJECT_DIR"
}

# Criar diretórios necessários
setup_directories() {
    mkdir -p "$BACKUP_DIR" "$LOG_DIR"
}

# Status dos serviços
status() {
    log "📊 Status dos serviços HealthCore"
    echo
    
    # Docker status
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado"
        return 1
    fi
    
    # Containers status
    echo -e "${BLUE}🐳 Status dos Containers:${NC}"
    docker-compose ps
    echo
    
    # Health checks
    echo -e "${BLUE}🏥 Health Checks:${NC}"
    
    # API Health
    if curl -f -s http://localhost:5000/health > /dev/null; then
        echo -e "  API: ${GREEN}✅ Healthy${NC}"
    else
        echo -e "  API: ${RED}❌ Unhealthy${NC}"
    fi
    
    # Frontend Health
    if curl -f -s http://localhost:5005 > /dev/null; then
        echo -e "  Frontend: ${GREEN}✅ Healthy${NC}"
    else
        echo -e "  Frontend: ${RED}❌ Unhealthy${NC}"
    fi
    
    # Database
    if [ -f "$DB_PATH" ]; then
        db_size=$(du -h "$DB_PATH" | cut -f1)
        echo -e "  Database: ${GREEN}✅ Online${NC} (Size: $db_size)"
    else
        echo -e "  Database: ${RED}❌ Not Found${NC}"
    fi
    
    # Sistema
    echo
    echo -e "${BLUE}🖥️  Sistema:${NC}"
    echo "  CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)% usado"
    echo "  Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
    echo "  Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 " usado)"}')"
    echo "  Uptime: $(uptime -p)"
}

# Visualizar logs
logs() {
    local service=$1
    local lines=${2:-50}
    
    if [ -z "$service" ]; then
        log "📋 Logs combinados (últimas $lines linhas)"
        docker-compose logs --tail=$lines --follow
    else
        log "📋 Logs do serviço '$service' (últimas $lines linhas)"
        docker-compose logs --tail=$lines --follow $service
    fi
}

# Backup do banco de dados
backup() {
    log "💾 Iniciando backup do banco de dados"
    
    if [ ! -f "$DB_PATH" ]; then
        error "Arquivo do banco não encontrado: $DB_PATH"
        return 1
    fi
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/healthcore_backup_$timestamp.db"
    
    # Criar backup
    cp "$DB_PATH" "$backup_file"
    gzip "$backup_file"
    
    log "✅ Backup criado: ${backup_file}.gz"
    
    # Limpar backups antigos (manter últimos 7 dias)
    find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete
    
    # Mostrar tamanho do backup
    local size=$(du -h "${backup_file}.gz" | cut -f1)
    log "📊 Tamanho do backup: $size"
}

# Limpeza do sistema
cleanup() {
    log "🧹 Iniciando limpeza do sistema"
    
    # Limpar containers parados
    docker container prune -f
    
    # Limpar imagens não utilizadas
    docker image prune -f
    
    # Limpar volumes não utilizados
    docker volume prune -f
    
    # Limpar redes não utilizadas
    docker network prune -f
    
    # Limpar logs antigos
    find /var/log -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    # Limpar cache do sistema
    sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || warning "Não foi possível limpar cache (requer sudo)"
    
    log "✅ Limpeza concluída"
}

# Reiniciar serviços
restart() {
    log "🔄 Reiniciando serviços HealthCore"
    
    # Parar containers
    docker-compose down
    
    # Aguardar
    sleep 5
    
    # Iniciar containers
    docker-compose up -d
    
    # Aguardar inicialização
    log "⏳ Aguardando inicialização..."
    sleep 30
    
    # Verificar status
    status
}

# Atualizar aplicação
update() {
    log "🚀 Atualizando aplicação HealthCore"
    
    # Fazer backup antes da atualização
    backup
    
    # Atualizar código
    git pull origin main
    
    # Rebuild containers
    docker-compose build --no-cache
    
    # Reiniciar serviços
    restart
    
    log "✅ Atualização concluída"
}

# Monitor contínuo
monitor() {
    log "👁️  Iniciando monitoramento contínuo (Ctrl+C para parar)"
    
    while true; do
        clear
        echo -e "${BLUE}=== HealthCore Monitor - $(date) ===${NC}"
        echo
        
        status
        
        echo
        echo -e "${BLUE}📈 Últimos logs (5 linhas):${NC}"
        docker-compose logs --tail=5
        
        sleep 30
    done
}

# Menu de ajuda
show_help() {
    echo -e "${BLUE}HealthCore - Sistema de Manutenção${NC}"
    echo
    echo "Uso: $0 [comando] [opções]"
    echo
    echo "Comandos disponíveis:"
    echo "  status          - Mostra status dos serviços"
    echo "  logs [serviço]  - Mostra logs (opcionalmente de um serviço específico)"
    echo "  backup          - Faz backup do banco de dados"
    echo "  cleanup         - Limpa recursos não utilizados"
    echo "  restart         - Reinicia todos os serviços"
    echo "  update          - Atualiza aplicação do Git e reinicia"
    echo "  monitor         - Monitor contínuo do sistema"
    echo "  help            - Mostra esta ajuda"
    echo
    echo "Exemplos:"
    echo "  $0 status"
    echo "  $0 logs healthcore-api"
    echo "  $0 backup"
    echo "  $0 monitor"
}

# Script principal
main() {
    check_directory
    setup_directories
    
    local command=${1:-status}
    
    case $command in
        status)
            status
            ;;
        logs)
            logs $2 $3
            ;;
        backup)
            backup
            ;;
        cleanup)
            cleanup
            ;;
        restart)
            restart
            ;;
        update)
            update
            ;;
        monitor)
            monitor
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Comando desconhecido: $command"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Executar script principal
main "$@"
