#!/bin/bash

# Script para correção rápida do problema de conflito de containers
# Execute este script no servidor para resolver o problema imediatamente

set -euo pipefail

echo "🔧 MobileMed - Correção de Conflito de Containers"
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    error "docker-compose.yml não encontrado. Execute este script no diretório do projeto."
    exit 1
fi

log "1. Verificando containers existentes..."
echo "📋 Containers com nome 'mobilemed':"
docker ps -a --filter name=mobilemed --format "table {{.Names}}\t{{.Status}}\t{{.Image}}" || true

echo ""
log "2. Parando e removendo containers conflitantes..."

# Parar e remover containers específicos
docker stop mobilemed-api mobilemed-frontend 2>/dev/null || warning "Alguns containers já estavam parados"
docker rm mobilemed-api mobilemed-frontend 2>/dev/null || warning "Alguns containers não existiam"

# Usar docker-compose para limpeza completa
log "3. Limpeza completa com Docker Compose..."
docker compose down --remove-orphans --volumes 2>/dev/null || warning "Docker Compose down falhou (pode ser normal)"

# Limpeza adicional
log "4. Removendo recursos órfãos..."
docker container prune -f 2>/dev/null || true
docker network prune -f 2>/dev/null || true
docker image prune -f 2>/dev/null || true

echo ""
log "5. Verificando limpeza..."
remaining=$(docker ps -a --filter name=mobilemed --format "{{.Names}}" | wc -l)
if [ "$remaining" -eq 0 ]; then
    log "✅ Todos os containers conflitantes foram removidos"
else
    warning "Ainda existem $remaining containers com nome 'mobilemed'"
    docker ps -a --filter name=mobilemed --format "table {{.Names}}\t{{.Status}}"
fi

echo ""
log "6. Fazendo build dos containers atualizados..."
docker compose build --no-cache

log "7. Iniciando serviços..."
docker compose up -d --remove-orphans

echo ""
log "8. Aguardando inicialização (30s)..."
sleep 30

log "9. Verificando status final..."
docker compose ps

echo ""
log "10. Testando serviços..."

# Testar API
if curl -f -s http://localhost:5000/health >/dev/null 2>&1; then
    log "✅ API respondendo em http://localhost:5000/health"
else
    warning "❌ API não está respondendo"
fi

# Testar Frontend  
if curl -f -s http://localhost:5005 >/dev/null 2>&1; then
    log "✅ Frontend respondendo em http://localhost:5005"
else
    warning "❌ Frontend não está respondendo"
fi

echo ""
echo -e "${BLUE}🎉 Correção concluída!${NC}"
echo ""
echo "📊 Status dos containers:"
docker compose ps

echo ""
echo "🌐 URLs de acesso:"
PUBLIC_IP=$(curl -s --max-time 3 ifconfig.me 2>/dev/null || echo "localhost")
echo "   Frontend: http://$PUBLIC_IP:5005"
echo "   API: http://$PUBLIC_IP:5000"
echo "   Health: http://$PUBLIC_IP:5000/health"

echo ""
echo "💡 Para monitorar os logs:"
echo "   docker compose logs -f"
echo ""
echo "💡 Para verificar recursos:"
echo "   docker stats"
