#!/bin/bash

# Script para inicializar API e Frontend do HealthCore
# Uso: ./start-services.sh [api|frontend|both]

set -e

API_DIR="/mnt/c/Users/SP-MGUELFI/Projetos/HealthCore/src/Api"
FRONTEND_DIR="/mnt/c/Users/SP-MGUELFI/Projetos/HealthCore/frontend"
LOG_DIR="/mnt/c/Users/SP-MGUELFI/Projetos/HealthCore/logs"

# Criar diretório de logs se não existir
mkdir -p "$LOG_DIR"

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        echo "Porta $port já está em uso"
        return 1
    fi
    return 0
}

# Função para iniciar API
start_api() {
    echo "🚀 Iniciando API HealthCore..."
    
    if ! check_port 5000; then
        echo "❌ Porta 5000 já está em uso. Pare o serviço existente primeiro."
        return 1
    fi
    
    cd "$API_DIR"
    echo "📁 Diretório: $(pwd)"
    
    # Build da API
    echo "🔨 Fazendo build da API..."
    dotnet build --configuration Release
    
    # Iniciar API em background
    echo "🌐 Iniciando API na porta 5000..."
    nohup dotnet run --urls="http://localhost:5000" > "$LOG_DIR/api.log" 2>&1 &
    API_PID=$!
    echo $API_PID > "$LOG_DIR/api.pid"
    
    # Aguardar API ficar disponível
    echo "⏳ Aguardando API ficar disponível..."
    for i in {1..30}; do
        if curl -s http://localhost:5000/health > /dev/null 2>&1; then
            echo "✅ API iniciada com sucesso! PID: $API_PID"
            echo "📊 Health Check: http://localhost:5000/health"
            echo "📚 Swagger: http://localhost:5000/swagger"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    echo "❌ Timeout: API não respondeu em 60 segundos"
    return 1
}

# Função para iniciar Frontend
start_frontend() {
    echo "🚀 Iniciando Frontend HealthCore..."
    
    if ! check_port 5173; then
        echo "❌ Porta 5173 já está em uso. Pare o serviço existente primeiro."
        return 1
    fi
    
    cd "$FRONTEND_DIR"
    echo "📁 Diretório: $(pwd)"
    
    # Instalar dependências se necessário
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependências do Frontend..."
        npm install
    fi
    
    # Iniciar Frontend em background
    echo "🌐 Iniciando Frontend na porta 5173..."
    nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$LOG_DIR/frontend.pid"
    
    # Aguardar Frontend ficar disponível
    echo "⏳ Aguardando Frontend ficar disponível..."
    for i in {1..30}; do
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            echo "✅ Frontend iniciado com sucesso! PID: $FRONTEND_PID"
            echo "🌐 Frontend: http://localhost:5173"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    echo "❌ Timeout: Frontend não respondeu em 60 segundos"
    return 1
}

# Função para parar serviços
stop_services() {
    echo "🛑 Parando serviços..."
    
    # Parar API
    if [ -f "$LOG_DIR/api.pid" ]; then
        API_PID=$(cat "$LOG_DIR/api.pid")
        if kill -0 $API_PID 2>/dev/null; then
            kill $API_PID
            echo "✅ API parada (PID: $API_PID)"
        fi
        rm -f "$LOG_DIR/api.pid"
    fi
    
    # Parar Frontend
    if [ -f "$LOG_DIR/frontend.pid" ]; then
        FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid")
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            echo "✅ Frontend parado (PID: $FRONTEND_PID)"
        fi
        rm -f "$LOG_DIR/frontend.pid"
    fi
    
    # Parar processos por porta
    pkill -f "dotnet run" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    
    echo "✅ Todos os serviços foram parados"
}

# Função para verificar status
check_status() {
    echo "📊 Status dos serviços:"
    echo ""
    
    # Verificar API
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo "✅ API: http://localhost:5000 (Ativa)"
    else
        echo "❌ API: Não está respondendo"
    fi
    
    # Verificar Frontend
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "✅ Frontend: http://localhost:5173 (Ativo)"
    else
        echo "❌ Frontend: Não está respondendo"
    fi
    
    echo ""
    echo "📋 Logs disponíveis em: $LOG_DIR"
}

# Main
case "${1:-both}" in
    "api")
        start_api
        ;;
    "frontend")
        start_frontend
        ;;
    "both")
        start_api
        echo ""
        start_frontend
        echo ""
        check_status
        ;;
    "stop")
        stop_services
        ;;
    "status")
        check_status
        ;;
    *)
        echo "Uso: $0 [api|frontend|both|stop|status]"
        echo ""
        echo "Comandos:"
        echo "  api      - Inicia apenas a API"
        echo "  frontend - Inicia apenas o Frontend"
        echo "  both     - Inicia API e Frontend (padrão)"
        echo "  stop     - Para todos os serviços"
        echo "  status   - Verifica status dos serviços"
        exit 1
        ;;
esac
