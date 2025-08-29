#!/bin/bash

echo "🧪 TESTE RÁPIDO DO FRONTEND"
echo "================================"

# Verificar se o frontend está rodando
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5005" 2>/dev/null)

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend está rodando (HTTP $FRONTEND_STATUS)"
    echo ""
    echo "🎯 ACESSE PARA TESTAR:"
    echo "   http://localhost:5005"
    echo ""
    echo "📋 VERIFICAR:"
    echo "1. Navegar para página de Pacientes"
    echo "2. Verificar se mostra 'X-Y de Z' no canto superior direito"
    echo "3. Testar navegação com as setas < >"
    echo "4. Verificar se muda de página corretamente"
    echo ""
    echo "🔍 ESPERADO:"
    echo "- Primeira página: '1-10 de 22'"
    echo "- Segunda página: '11-20 de 22'"
    echo "- Terceira página: '21-22 de 22'"
else
    echo "❌ Frontend não está acessível (HTTP $FRONTEND_STATUS)"
    echo "Execute: cd src/Web && npm run dev"
fi