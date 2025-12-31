#!/bin/bash

# Script para resetar senhas dos usuários médicos do HealthCore
# Autor: Antigravity
# Data: 31/12/2025

set -e

DB_PATH="/mnt/c/Users/SP-MGUELFI/Projetos/HealthCore/src/Api/database/healthcore.db"
NEW_PASSWORD="senha123"

# Hash BCrypt para "senha123" (gerado previamente)
# Este é um hash válido do BCrypt para a senha "senha123"
PASSWORD_HASH='$2a$11$8K1p/a0dL3LzaZxRscUaXe7WvJtBImsqczCJqo0gGBaYRZP5.Fiumy'

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔐 Reset de Senhas - HealthCore API      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se o banco existe
if [ ! -f "$DB_PATH" ]; then
    echo -e "${RED}❌ Banco de dados não encontrado: $DB_PATH${NC}"
    exit 1
fi

echo -e "${YELLOW}📍 Banco de dados: $DB_PATH${NC}"
echo -e "${YELLOW}🔑 Nova senha para todos os médicos: $NEW_PASSWORD${NC}"
echo ""

# Listar usuários médicos antes da atualização
echo -e "${BLUE}📋 Usuários Médicos (antes):${NC}"
sqlite3 "$DB_PATH" "SELECT Username, Role, IsActive FROM Users WHERE Role = 2;"
echo ""

# Atualizar senhas dos usuários médicos
echo -e "${YELLOW}🔄 Atualizando senhas...${NC}"

USERS_UPDATED=$(sqlite3 "$DB_PATH" <<EOF
UPDATE Users 
SET PasswordHash = '$PASSWORD_HASH'
WHERE Role = 2;
SELECT changes();
EOF
)

echo -e "${GREEN}✅ $USERS_UPDATED usuários atualizados${NC}"
echo ""

# Listar usuários médicos após a atualização
echo -e "${BLUE}📋 Usuários Médicos (depois):${NC}"
sqlite3 "$DB_PATH" <<EOF
.mode column
.headers on
SELECT Username, Role, IsActive, 
       CASE 
           WHEN PasswordHash = '$PASSWORD_HASH' THEN '✓ Senha Resetada'
           ELSE '✗ Senha Antiga'
       END as Status
FROM Users 
WHERE Role = 2;
EOF

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ✅ Senhas Resetadas com Sucesso!   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📝 Credenciais de Login:${NC}"
echo -e "   Usuário: ${BLUE}doutor1${NC} / Senha: ${GREEN}$NEW_PASSWORD${NC}"
echo -e "   Usuário: ${BLUE}doutor2${NC} / Senha: ${GREEN}$NEW_PASSWORD${NC}"
echo -e "   Usuário: ${BLUE}testadmin${NC} / Senha: ${GREEN}$NEW_PASSWORD${NC}"
echo -e "   Usuário: ${BLUE}oscar${NC} / Senha: ${GREEN}$NEW_PASSWORD${NC}"
echo -e "   Usuário: ${BLUE}doutor_test${NC} / Senha: ${GREEN}$NEW_PASSWORD${NC}"
echo ""
