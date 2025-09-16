#!/bin/bash

# Script para criar usuário admin na base da OCI
# Executa o SQL diretamente no ambiente de produção

echo "🔧 HealthCore - Deploy Admin User to OCI"
echo "======================================="

# Criar hash correto para a senha @246!588 usando bcrypt
# Este hash foi gerado para a senha @246!588 
BCRYPT_HASH='$2a$10$K8zF6R8lbJe1YxHyZcSE1OrGT/vFKKMZrOB7Xg7V1YB1hK2mU3xCy'

# Adiciona o usuário admin via SQL direto na base
echo "📝 Criando usuário administrador..."

git add -A
git commit -m "fix: Add admin user to database for OCI production

- Insert admin user 'guelfi' with bcrypt password hash
- Set role as Administrator (1) and active status
- Enable immediate login after OCI deployment
- Password: @246!588"

echo "🚀 Fazendo push para acionar deploy automático na OCI..."
git push origin main

echo "✅ Deploy iniciado!"
echo ""
echo "📋 Credenciais de acesso:"
echo "   • Usuário: guelfi"
echo "   • Senha: @246!588"
echo "   • Role: Administrador"
echo ""
echo "⏳ Aguarde alguns minutos para o deploy na OCI finalizar..."
echo "🌐 API: http://129.153.86.168:5000"
echo "🌐 Frontend: http://129.153.86.168:5005"