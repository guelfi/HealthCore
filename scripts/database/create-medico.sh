#!/bin/bash

# Script para criar usuário médico
# Uso: ./create-medico.sh <admin_user> <admin_pass> <medico_user> <medico_pass>

if [ $# -ne 4 ]; then
    echo "Uso: $0 <admin_user> <admin_pass> <medico_user> <medico_pass>"
    echo ""
    echo "Exemplo:"
    echo "  $0 guelfi '@246!588' doutor1 123456"
    exit 1
fi

ADMIN_USER="$1"
ADMIN_PASS="$2"
MEDICO_USER="$3"
MEDICO_PASS="$4"

BASE_URL="http://localhost:5000"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Criar Usuário Médico ===${NC}"
echo "Admin: $ADMIN_USER"
echo "Médico: $MEDICO_USER"
echo ""

# Verificar API
if ! curl -s --head "$BASE_URL" >/dev/null; then
    echo -e "${RED}❌ API não disponível${NC}"
    exit 1
fi

# Autenticar
echo "Autenticando..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$ADMIN_USER\", \"password\": \"$ADMIN_PASS\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${RED}❌ Falha na autenticação${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Autenticado${NC}"

# Criar usuário
echo "Criando usuário médico..."
CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$BASE_URL/admin/usuarios" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"username\": \"$MEDICO_USER\", \"password\": \"$MEDICO_PASS\", \"role\": 2}")

HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$CREATE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✅ Usuário '$MEDICO_USER' criado com sucesso!${NC}"
    echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo -e "${RED}❌ Erro: HTTP $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY"
    exit 1
fi