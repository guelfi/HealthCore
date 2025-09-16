#!/bin/bash

# Script de inicialização para carregar contexto HealthCore
# Execute: bash iniciar-sessao-healthcore.sh

clear

echo "🏥 HEALTHCORE - INICIALIZAÇÃO DA SESSÃO"
echo "======================================="
echo ""

# Verificar se estamos no diretório correto
if [[ ! -f "CONTEXTO_PROBLEMA_API.md" ]]; then
    echo "❌ Arquivo de contexto não encontrado!"
    echo "📂 Certifique-se de estar na raiz do projeto HealthCore"
    exit 1
fi

echo "📋 RESUMO RÁPIDO DO PROBLEMA:"
echo "-----------------------------"
echo "🔴 PROBLEMA: API de autenticação não funciona na OCI"
echo "🌐 API URL: http://129.153.86.168:5000"
echo "🌐 Frontend URL: http://129.153.86.168:5005"
echo ""

# Mostrar status dos serviços
echo "🏥 STATUS DOS SERVIÇOS:"
echo "----------------------"
echo "🟢 Health Check: OK"
echo "🟢 Swagger: OK"
echo "🔴 Auth Login: ERRO 500"
echo "🔴 Auth Register: ERRO 500"
echo ""

echo "🔧 ÚLTIMO ERRO:"
echo "---------------"
echo "SQLite Error 1: 'no such column: u.CreatedAt'"
echo ""

echo "💡 SOLUÇÃO PRINCIPAL:"
echo "---------------------"
echo "Recuperar banco original do commit cafc544"
echo ""

echo "🚀 COMANDOS PRINCIPAIS:"
echo "----------------------"
echo "1. Recuperar banco:"
echo "   bash scripts/database/recuperar-banco-original.sh"
echo ""
echo "2. Testar API:"
echo "   curl http://129.153.86.168:5000/health"
echo ""
echo "3. Ver contexto completo:"
echo "   cat CONTEXTO_PROBLEMA_API.md"
echo ""

# Verificar conectividade com a API
echo "🌐 TESTANDO CONECTIVIDADE COM API..."
if curl -s --connect-timeout 5 http://129.153.86.168:5000/health > /dev/null; then
    echo "✅ API está respondendo"
else
    echo "❌ API não está respondendo"
fi
echo ""

echo "📂 ARQUIVOS IMPORTANTES:"
echo "------------------------"
echo "- CONTEXTO_PROBLEMA_API.md (contexto completo)"
echo "- scripts/database/recuperar-banco-original.sh (recuperar banco)"
echo "- src/Api/Core/Domain/Entities/User.cs (entidade User)"
echo "- src/Api/Core/Application/Services/AuthService.cs (autenticação)"
echo ""

echo "🎯 PRÓXIMOS PASSOS SUGERIDOS:"
echo "-----------------------------"
echo "1. Execute: bash scripts/database/recuperar-banco-original.sh"
echo "2. Se funcionou, faça commit e push"
echo "3. Teste login após deploy na OCI"
echo ""

echo "❓ Para ver contexto completo, digite: cat CONTEXTO_PROBLEMA_API.md"
echo "❓ Para executar recuperação, digite: bash scripts/database/recuperar-banco-original.sh"
echo ""

# Opcional: perguntar se quer executar algo imediatamente
read -p "🤔 Deseja executar a recuperação do banco agora? (s/n): " resposta
if [[ $resposta =~ ^[Ss]$ ]]; then
    echo ""
    echo "🔧 Executando recuperação do banco..."
    bash scripts/database/recuperar-banco-original.sh
fi