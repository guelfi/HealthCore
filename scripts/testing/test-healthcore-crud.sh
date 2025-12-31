#!/bin/bash

# Script de Testes CRUD HealthCore API
# Uso: ./test-healthcore-crud.sh [BASE_URL]

BASE_URL="${1:-http://localhost:5005/healthcore-api}"
USERNAME="guelfi"
PASSWORD="@246!588"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   Testes CRUD HealthCore API         ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "URL Base: $BASE_URL"
echo -e "Usuário: $USERNAME"
echo ""

# 1. Autenticação
echo -e "${YELLOW}1. Autenticando...${NC}"
TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo $TOKEN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Falha na autenticação!${NC}"
    echo "Resposta: $TOKEN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Autenticado com sucesso! Token obtido.${NC}"
echo ""

AUTH_HEADER="Authorization: Bearer $TOKEN"

# Função auxiliar para verificar status HTTP
check_status() {
    local response=$1
    local expected=$2
    local message=$3
    
    # Extrair status code (assumindo que curl foi chamado com -w "%{http_code}")
    local status=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')

    if [ "$status" -eq "$expected" ]; then
        echo -e "${GREEN}✅ $message (Status $status)${NC}"
    else
        echo -e "${RED}❌ $message Falhou (Esperado $expected, Recebido $status)${NC}"
        echo "Response Body: $body"
    fi
}

# 2. Testes de Pacientes (CRUD)
echo -e "${YELLOW}2. Testando CRUD Pacientes...${NC}"

# 2.1 Criar Paciente
echo -e "   Criando paciente..."

# Gerar CPF Válido usando Python
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
NOME_PACIENTE="Paciente Teste $(date +%s)"

# DTO espera: Nome, DataNascimento, Documento, Contato
CREATE_PACIENTE_BODY="{\"nome\": \"$NOME_PACIENTE\", \"documento\": \"$CPF_RANDOM\", \"dataNascimento\": \"1980-01-01\", \"contato\": \"11999999999\"}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/pacientes" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "$CREATE_PACIENTE_BODY")

check_status "$RESPONSE" 201 "Paciente criado"

# Extrair ID do paciente criado
PACIENTE_ID=$(echo "$RESPONSE" | sed '$d' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")

if [ -z "$PACIENTE_ID" ]; then
    echo -e "${RED}⚠️ Não foi possível extrair ID do paciente. Testes subsequentes podem falhar.${NC}"
else 
    echo -e "   ID do Paciente: $PACIENTE_ID"

    # 2.2 Listar Pacientes
    echo -e "   Listando pacientes..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/pacientes?page=1&pageSize=5" \
      -H "$AUTH_HEADER")
    check_status "$RESPONSE" 200 "Listagem de pacientes"

    # 2.3 Buscar Paciente por ID
    echo -e "   Buscando paciente por ID..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/pacientes/$PACIENTE_ID" \
      -H "$AUTH_HEADER")
    check_status "$RESPONSE" 200 "Busca de paciente por ID"

    # 2.4 Atualizar Paciente
    echo -e "   Atualizando paciente..."
    # UpdateDto pode ser diferente, vamos assumir campos similares mas validar se existe UpdatePacienteDto
    # Por segurança, mantemos os campos do Create mas com nome alterado
    UPDATE_PACIENTE_BODY="{\"nome\": \"$NOME_PACIENTE Atualizado\", \"documento\": \"$CPF_RANDOM\", \"dataNascimento\": \"1980-01-01\", \"contato\": \"11888888888\"}"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/pacientes/$PACIENTE_ID" \
      -H "Content-Type: application/json" \
      -H "$AUTH_HEADER" \
      -d "$UPDATE_PACIENTE_BODY")
    check_status "$RESPONSE" 204 "Paciente atualizado" 
fi

# 3. Testes de Usuários (Admin)
echo -e ""
echo -e "${YELLOW}3. Testando CRUD Usuários (Admin)...${NC}"

# 3.1 Criar Usuário Médico
echo -e "   Criando usuário médico..."
USER_NAME="medico_teste_$(date +%s)"
CREATE_USER_BODY="{\"username\": \"$USER_NAME\", \"password\": \"Senha123!\", \"role\": 2}" # Role 2 = Medico

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/admin/usuarios" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "$CREATE_USER_BODY")

check_status "$RESPONSE" 201 "Usuário criado"

USER_ID=$(echo "$RESPONSE" | sed '$d' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")

if [ -n "$USER_ID" ]; then
    echo -e "   ID do Usuário: $USER_ID"

    # 3.2 Listar Usuários
    echo -e "   Listando usuários..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/admin/usuarios" \
      -H "$AUTH_HEADER")
    check_status "$RESPONSE" 200 "Listagem de usuários"

    # 3.3 Deletar Usuário (Limpeza)
    echo -e "   Deletando usuário de teste..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/admin/usuarios/$USER_ID" \
      -H "$AUTH_HEADER")
    # Aceitar 200 ou 204, pois a API retorna 200 para Soft Delete com mensagem
    STATUS_DEL=$(echo "$RESPONSE" | tail -n1)
    if [ "$STATUS_DEL" -eq "200" ] || [ "$STATUS_DEL" -eq "204" ]; then
         echo -e "${GREEN}✅ Usuário deletado (Status $STATUS_DEL)${NC}"
    else
         echo -e "${RED}❌ Usuário deletado Falhou (Esperado 200 ou 204, Recebido $STATUS_DEL)${NC}"
    fi
fi

# 4. Testes de Especialidades
echo -e ""
echo -e "${YELLOW}4. Testando CRUD Especialidades...${NC}"

# 4.1 Criar Especialidade
echo -e "   Criando especialidade..."
ESPEC_NOME="Especialidade $(date +%s)"
CREATE_ESPEC_BODY="{\"nome\": \"$ESPEC_NOME\", \"descricao\": \"Descrição Teste\"}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/especialidades" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "$CREATE_ESPEC_BODY")

check_status "$RESPONSE" 201 "Especialidade criada"

ESPEC_ID=$(echo "$RESPONSE" | sed '$d' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")

if [ -n "$ESPEC_ID" ]; then
   # 4.2 Listar Especialidades
   echo -e "   Listando especialidades..."
   RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/especialidades" \
     -H "$AUTH_HEADER")
   check_status "$RESPONSE" 200 "Listagem de especialidades"
   
   # 4.3 Deletar Especialidade (Limpeza)
   echo -e "   Deletando especialidade..."
   RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/especialidades/$ESPEC_ID" \
     -H "$AUTH_HEADER")
   check_status "$RESPONSE" 204 "Especialidade deletada"
fi

echo ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   Fim dos Testes                     ${NC}"
echo -e "${BLUE}=======================================${NC}"
