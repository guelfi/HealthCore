#!/bin/bash

# Script para forçar atualização do cache do navegador após deploy

echo "🔄 Forçando atualização completa do cache..."

# Parar todos os containers
echo "🛑 Parando containers..."
docker-compose down 2>/dev/null || true

# Remover imagens antigas para forçar rebuild
echo "🗑️  Removendo imagens antigas..."
docker image prune -af 2>/dev/null || true

# Rebuild completo sem cache
echo "🔨 Reconstruindo containers sem cache..."
docker-compose build --no-cache --pull 2>/dev/null || true

# Iniciar containers
echo "🚀 Iniciando containers..."
docker-compose up -d 2>/dev/null || true

# Aguardar containers iniciarem
echo "⏳ Aguardando containers iniciarem..."
sleep 15

# Verificar status
echo "📊 Status dos containers:"
docker-compose ps 2>/dev/null || true

echo "✅ Cache foi completamente limpo e containers reconstruídos!"
echo "💡 Dicas para os usuários:"
echo "   - Pressione Ctrl+F5 (ou Cmd+Shift+R no Mac) para forçar reload"
echo "   - Ou abra o site em uma aba anônima/privada"
echo "   - Ou limpe o cache do navegador manualmente"