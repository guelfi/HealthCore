#!/bin/bash

# Script para configurar e iniciar ngrok para o frontend
# Resolve problemas de conexão ERR_NGROK_8012

set -e

echo "🔧 Configurando Ngrok para HealthCore Frontend"

# Verificar se ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo "❌ Ngrok não está instalado!"
    echo "📥 Para instalar:"
    echo "   1. Acesse: https://ngrok.com/download"
    echo "   2. Ou use: snap install ngrok (Linux)"
    echo "   3. Configure seu token: ngrok config add-authtoken YOUR_TOKEN"
    exit 1
fi

echo "✅ Ngrok encontrado"

# Verificar se os serviços estão rodando
echo "🔍 Verificando serviços..."

# Verificar API
API_RUNNING=false
if curl -s http://localhost:5000/health/ready > /dev/null 2>&1; then
    echo "✅ API rodando na porta 5000"
    API_RUNNING=true
else
    echo "⚠️  API não está rodando na porta 5000"
fi

# Verificar Frontend
FRONTEND_RUNNING=false
if curl -s http://localhost:5005 > /dev/null 2>&1; then
    echo "✅ Frontend rodando na porta 5005"
    FRONTEND_RUNNING=true
else
    echo "⚠️  Frontend não está rodando na porta 5005"
fi

# Se os serviços não estão rodando, oferecer para iniciar
if [ "$API_RUNNING" = false ] || [ "$FRONTEND_RUNNING" = false ]; then
    echo ""
    echo "🚀 Iniciando serviços necessários..."
    
    if [ "$API_RUNNING" = false ]; then
        echo "📡 Iniciando API..."
        cd ../Api
        nohup dotnet run > /tmp/api.log 2>&1 &
        API_PID=$!
        echo "API iniciada com PID: $API_PID"
        cd ../Web
        
        # Aguardar API iniciar
        echo "⏳ Aguardando API inicializar..."
        for i in {1..30}; do
            if curl -s http://localhost:5000/health/ready > /dev/null 2>&1; then
                echo "✅ API inicializada com sucesso"
                break
            fi
            sleep 2
            echo -n "."
        done
    fi
    
    if [ "$FRONTEND_RUNNING" = false ]; then
        echo "🌐 Iniciando Frontend..."
        nohup npm run dev > /tmp/frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo "Frontend iniciado com PID: $FRONTEND_PID"
        
        # Aguardar Frontend iniciar
        echo "⏳ Aguardando Frontend inicializar..."
        for i in {1..30}; do
            if curl -s http://localhost:5005 > /dev/null 2>&1; then
                echo "✅ Frontend inicializado com sucesso"
                break
            fi
            sleep 2
            echo -n "."
        done
    fi
fi

echo ""
echo "🌐 Configurando Ngrok..."

# Criar configuração ngrok se não existir
NGROK_CONFIG="$HOME/.ngrok2/ngrok.yml"
if [ ! -f "$NGROK_CONFIG" ]; then
    echo "📝 Criando configuração ngrok..."
    mkdir -p "$HOME/.ngrok2"
    cat > "$NGROK_CONFIG" << EOF
version: "2"
authtoken: YOUR_AUTH_TOKEN_HERE
tunnels:
  frontend:
    addr: 5005
    proto: http
    bind_tls: true
    inspect: true
    host_header: localhost:5005
  api:
    addr: 5000
    proto: http
    bind_tls: true
    inspect: true
    host_header: localhost:5000
EOF
    echo "⚠️  Configure seu token de autenticação em: $NGROK_CONFIG"
    echo "   Obtenha seu token em: https://dashboard.ngrok.com/get-started/your-authtoken"
fi

echo ""
echo "🚀 Iniciando túnel ngrok para o frontend..."
echo "📱 Acesse o painel do ngrok em: http://localhost:4040"
echo ""
echo "🔗 URLs disponíveis:"
echo "   Frontend local: http://localhost:5005"
echo "   API local: http://localhost:5000"
echo ""
echo "⚡ Iniciando ngrok..."

# Iniciar ngrok
ngrok http 5005 --log=stdout