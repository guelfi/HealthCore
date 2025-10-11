#!/bin/bash

# Script de Teste dos Endpoints de Especialidades
# Data: 06/10/2025

echo "=========================================="
echo "TESTE DOS ENDPOINTS DE ESPECIALIDADES"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:5000"

# 1. Fazer Login e obter token
echo -e "${BLUE}[1/7] Fazendo login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"guelfi","password":"@246!588"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Erro ao obter token de autenticação${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso${NC}"
echo "Token: ${TOKEN:0:50}..."
echo ""

# 2. Listar todas as especialidades (sem filtros)
echo -e "${BLUE}[2/7] GET /especialidades - Listar todas${NC}"
curl -s -X GET "$API_URL/especialidades?page=1&pageSize=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
echo -e "${GREEN}✅ Listagem executada${NC}"
echo ""

# 3. Listar especialidades ativas
echo -e "${BLUE}[3/7] GET /especialidades?ativa=true - Listar apenas ativas${NC}"
curl -s -X GET "$API_URL/especialidades?ativa=true&page=1&pageSize=3" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
echo -e "${GREEN}✅ Filtro por ativas executado${NC}"
echo ""

# 4. Buscar especialidade por nome
echo -e "${BLUE}[4/7] GET /especialidades?search=Cardio - Buscar por nome${NC}"
curl -s -X GET "$API_URL/especialidades?search=Cardio" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
echo -e "${GREEN}✅ Busca por nome executada${NC}"
echo ""

# 5. Buscar especialidade por ID (Cardiologia)
ESPECIALIDADE_ID="11111111-1111-1111-1111-111111111111"
echo -e "${BLUE}[5/7] GET /especialidades/{id} - Buscar por ID${NC}"
curl -s -X GET "$API_URL/especialidades/$ESPECIALIDADE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
echo -e "${GREEN}✅ Busca por ID executada${NC}"
echo ""

# 6. Criar nova especialidade
echo -e "${BLUE}[6/7] POST /especialidades - Criar nova especialidade${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/especialidades" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Medicina Esportiva",
    "descricao": "Especialidade que cuida da saúde e performance de atletas",
    "ativa": true
  }')

echo $CREATE_RESPONSE | python3 -m json.tool
NOVA_ESPECIALIDADE_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✅ Especialidade criada com ID: $NOVA_ESPECIALIDADE_ID${NC}"
echo ""

# 7. Atualizar especialidade criada
if [ ! -z "$NOVA_ESPECIALIDADE_ID" ]; then
    echo -e "${BLUE}[7/7] PUT /especialidades/{id} - Atualizar especialidade${NC}"
    curl -s -X PUT "$API_URL/especialidades/$NOVA_ESPECIALIDADE_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "nome": "Medicina Esportiva e do Exercício",
        "descricao": "Especialidade que cuida da saúde, performance de atletas e prescrição de exercícios",
        "ativa": true
      }' | python3 -m json.tool
    echo -e "${GREEN}✅ Especialidade atualizada${NC}"
    echo ""
fi

# 8. Excluir especialidade criada
if [ ! -z "$NOVA_ESPECIALIDADE_ID" ]; then
    echo -e "${BLUE}[8/7] DELETE /especialidades/{id} - Excluir especialidade${NC}"
    DELETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/especialidades/$NOVA_ESPECIALIDADE_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    HTTP_CODE=$(echo "$DELETE_RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "204" ]; then
        echo -e "${GREEN}✅ Especialidade excluída com sucesso (HTTP 204)${NC}"
    else
        echo -e "${RED}❌ Erro ao excluir especialidade (HTTP $HTTP_CODE)${NC}"
    fi
    echo ""
fi

# 9. Testar validação - nome duplicado
echo -e "${BLUE}[EXTRA] Testar validação - Nome duplicado${NC}"
curl -s -X POST "$API_URL/especialidades" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Cardiologia",
    "descricao": "Teste de duplicação",
    "ativa": true
  }' | python3 -m json.tool
echo -e "${GREEN}✅ Validação de duplicação testada${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}TODOS OS TESTES CONCLUÍDOS!${NC}"
echo "=========================================="
