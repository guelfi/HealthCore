#!/bin/bash

# Script para corrigir configuração de rate limiting no Program.cs
# O pacote de rate limiting foi removido, mas os endpoints ainda tentam usá-lo

echo "🔧 HealthCore - Fix Rate Limiting Configuration"
echo "=============================================="

# Remover RequireRateLimiting dos endpoints de autenticação
echo "📝 Removendo RequireRateLimiting dos endpoints de autenticação..."

# Corrigir o arquivo Program.cs
sed -i 's/}).RequireRateLimiting("AuthLimit");/});/g' ../src/Api/Program.cs

echo "✅ Configuração corrigida!"
echo ""
echo "🚀 Agora faça commit e push para acionar deploy automático na OCI"
echo "git add -A"
echo "git commit -m \"fix: Remove rate limiting calls from auth endpoints\""
echo "git push origin main"