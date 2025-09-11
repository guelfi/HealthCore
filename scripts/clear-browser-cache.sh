#!/bin/bash

# Script para forçar atualização do cache do navegador após deploy

echo "🔄 Forçando atualização do cache do navegador..."

# Adicionar timestamp ao index.html para forçar reload
TIMESTAMP=$(date +%s)
echo "<!-- Cache Buster: $TIMESTAMP -->" >> /var/www/DesafioTecnico/src/Web/dist/index.html

# Reiniciar nginx para aplicar novas configurações
echo "🔄 Reiniciando nginx..."
sudo systemctl reload nginx || docker-compose restart nginx

# Limpar cache do Docker se necessário
echo "🧹 Limpando cache do Docker..."
docker system prune -f

echo "✅ Cache do navegador foi forçado a atualizar!"
echo "💡 Dicas para os usuários:"
echo "   - Pressione Ctrl+F5 (ou Cmd+Shift+R no Mac) para forçar reload"
echo "   - Ou abra o site em uma aba anônima/privada"
echo "   - Ou limpe o cache do navegador manualmente"