#!/bin/bash

# Script para iniciar o frontend com configuração ngrok
# Uso: ./scripts/start-with-ngrok.sh [ngrok-url]

set -e

echo "🚀 Iniciando HealthCore Frontend com configuração Ngrok"

# Verificar se o ngrok URL foi fornecido
if [ -n "$1" ]; then
    NGROK_URL="$1"
    echo "📡 URL do Ngrok fornecida: $NGROK_URL"
else
    echo "⚠️  URL do Ngrok não fornecida, usando configuração padrão"
fi

# Verificar se existe .env.ngrok
if [ -f ".env.ngrok" ]; then
    echo "📋 Copiando configuração do ngrok..."
    cp .env.ngrok .env
    
    # Se URL foi fornecida, atualizar no .env
    if [ -n "$NGROK_URL" ]; then
        echo "🔧 Atualizando URL do ngrok no .env..."
        sed -i.bak "s|VITE_NGROK_URL=.*|VITE_NGROK_URL=$NGROK_URL|g" .env
        rm .env.bak 2>/dev/null || true
    fi
else
    echo "❌ Arquivo .env.ngrok não encontrado!"
    echo "📝 Criando arquivo .env.ngrok de exemplo..."
    
    cat > .env.ngrok << EOF
# Configuração para Ngrok
VITE_NGROK_URL=https://your-ngrok-url.ngrok-free.app
VITE_API_BASE_URL=http://192.168.15.119:5000
VITE_API_TIMEOUT=30000
VITE_APP_NAME=HealthCore Frontend
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=true
EOF
    
    echo "✅ Arquivo .env.ngrok criado. Edite-o com suas configurações e execute novamente."
    exit 1
fi

echo "🔍 Verificando se a API está rodando..."
API_URL=$(grep VITE_API_BASE_URL .env | cut -d '=' -f2)

if curl -s "$API_URL/health/ready" > /dev/null; then
    echo "✅ API está respondendo em $API_URL"
else
    echo "⚠️  API não está respondendo em $API_URL"
    echo "🔧 Certifique-se de que a API está rodando:"
    echo "   cd ../Api && dotnet run"
fi

echo "🌐 Configuração atual:"
echo "   Frontend: http://localhost:5005"
echo "   API: $API_URL"
if [ -n "$NGROK_URL" ]; then
    echo "   Ngrok: $NGROK_URL"
fi

echo ""
echo "📱 Para acessar via ngrok:"
echo "   1. Inicie o ngrok: ngrok http 5005"
echo "   2. Use a URL fornecida pelo ngrok"
echo "   3. A API deve estar acessível na rede local"

echo ""
echo "🚀 Iniciando servidor de desenvolvimento..."
npm run dev