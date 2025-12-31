#!/bin/bash

# Script de Testes de Autorização HealthCore API
# Uso: ./test-authorization.sh [BASE_URL]

BASE_URL="${1:-http://localhost:5005/healthcore-api}"

# Credenciais Admin
ADMIN_USER="guelfi"
ADMIN_PASS="@246!588"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   Testes de Autorização HealthCore   ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Função auxiliar para verificar status HTTP
check_status() {
    local response=$1
    local expected=$2
    local message=$3
    
    local status=$(echo "$response" | tail -n1)
    
    if [ "$status" -eq "$expected" ]; then
        echo -e "${GREEN}✅ $message (Status $status)${NC}"
    else
        echo -e "${RED}❌ $message Falhou (Esperado $expected, Recebido $status)${NC}"
    fi
}

# 1. Autenticar como Admin
echo -e "${YELLOW}1. Autenticando como Admin ($ADMIN_USER)...${NC}"
TOKEN_RESP_ADMIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$ADMIN_USER\", \"password\": \"$ADMIN_PASS\"}")

TOKEN_ADMIN=$(echo $TOKEN_RESP_ADMIN | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$TOKEN_ADMIN" ]; then
    echo -e "${RED}❌ Falha na autenticação do Admin!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Admin autenticado.${NC}"

# 2. Criar Usuário Médico (para teste)
echo -e "${YELLOW}2. Criando Usuário Médico Temporário...${NC}"
DOC_USER="medico_auth_$(date +%s)"
DOC_PASS="SenhaDoc123!"
CREATE_DOC_BODY="{\"username\": \"$DOC_USER\", \"password\": \"$DOC_PASS\", \"role\": 2}"

RESP_CREATE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/admin/usuarios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -d "$CREATE_DOC_BODY")

check_status "$RESP_CREATE" 201 "Médico criado"
DOC_ID=$(echo "$RESP_CREATE" | sed '$d' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")

if [ -z "$DOC_ID" ]; then
    echo -e "${RED}❌ Falha ao criar médico. Abortando testes.${NC}"
    exit 1
fi

# 3. Autenticar como Médico
echo -e "${YELLOW}3. Autenticando como Médico ($DOC_USER)...${NC}"
TOKEN_RESP_DOC=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$DOC_USER\", \"password\": \"$DOC_PASS\"}")

TOKEN_DOC=$(echo $TOKEN_RESP_DOC | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$TOKEN_DOC" ]; then
    echo -e "${RED}❌ Falha na autenticação do Médico!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Médico autenticado.${NC}"

# 4. Teste: Médico tentando acessar recurso de Admin (Deve falhar)
echo -e "${YELLOW}4. Teste de Acesso Negado (Médico -> Admin Endpoint)...${NC}"
# Tenta listar usuários (exclusivo admin)
RESP_FORBIDDEN=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/admin/usuarios" \
  -H "Authorization: Bearer $TOKEN_DOC")

check_status "$RESP_FORBIDDEN" 403 "Acesso negado para Médico em /admin/usuarios"

# 5. Teste: Médico acessando recurso permitido (Deve passar)
echo -e "${YELLOW}5. Teste de Acesso Permitido (Médico -> Criar Paciente)...${NC}"
CPF_RANDOM=$(python3 -c "
import random
def generate_cpf():
    cpf = [random.randint(0, 9) for _ in range(9)]
    for _ in range(2):
        val = sum([(len(cpf) + 1 - i) * v for i, v in enumerate(cpf)]) % 11
        cpf.append(11 - val if val > 1 else 0)
    return ''.join(map(str, cpf))
print(generate_cpf())
")
PACIENTE_BODY="{\"nome\": \"Paciente do Medico\", \"documento\": \"$CPF_RANDOM\", \"dataNascimento\": \"1990-01-01\", \"contato\": \"11900000000\"}"

RESP_ALLOWED=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/pacientes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_DOC" \
  -d "$PACIENTE_BODY")

check_status "$RESP_ALLOWED" 201 "Médico conseguiu criar paciente"
PACIENTE_ID=$(echo "$RESP_ALLOWED" | sed '$d' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")

# 6. Limpeza (Admin deleta Médico e Paciente)
echo -e "${YELLOW}6. Limpeza (Admin remove dados)...${NC}"

# Deletar Paciente (Admin pode deletar qualquer um?)
# Assumindo que sim para este teste básico
if [ -n "$PACIENTE_ID" ]; then
    RESP_DEL_PAC=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/pacientes/$PACIENTE_ID" \
      -H "Authorization: Bearer $TOKEN_ADMIN")
    # check_status "$RESP_DEL_PAC" 204 "Paciente removido pelo Admin"
    # Aceita 200/204
    STATUS=$(echo "$RESP_DEL_PAC" | tail -n1)
    if [ "$STATUS" -eq "200" ] || [ "$STATUS" -eq "204" ]; then
         echo -e "${GREEN}✅ Paciente removido (Status $STATUS)${NC}"
    fi
fi

# Deletar Médico
RESP_DEL_DOC=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/admin/usuarios/$DOC_ID" \
  -H "Authorization: Bearer $TOKEN_ADMIN")
STATUS=$(echo "$RESP_DEL_DOC" | tail -n1)
if [ "$STATUS" -eq "200" ] || [ "$STATUS" -eq "204" ]; then
     echo -e "${GREEN}✅ Médico removido (Status $STATUS)${NC}"
fi

echo ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   Fim dos Testes de Autorização      ${NC}"
echo -e "${BLUE}=======================================${NC}"
