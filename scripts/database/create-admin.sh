#!/bin/bash

# Script para criar usuário administrador via API HealthCore
# Uso: ./create-admin-api.sh

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configurações
API_URL="http://localhost:5000"
USERNAME="guelfi"
PASSWORD="@246!588"

echo -e "${CYAN}🔧 HealthCore - Criador de Usuário Administrador via API${NC}"
echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verifica se a API está rodando
echo -e "${YELLOW}🔍 Verificando se a API está rodando...${NC}"
if ! curl -s --head "$API_URL" >/dev/null; then
    echo -e "${RED}❌ API não está rodando em $API_URL${NC}"
    echo -e "${YELLOW}💡 Execute primeiro: ./scripts/servers.sh start${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API está rodando${NC}"
echo ""

echo -e "${CYAN}👤 Criando usuário administrador:${NC}"
echo -e "   ${WHITE}• Usuário:${NC} ${GREEN}$USERNAME${NC}"
echo -e "   ${WHITE}• URL:${NC} ${GREEN}$API_URL/auth/register${NC}"
echo ""

# Primeiro tenta criar via registro normal e depois atualizar a role
echo -e "${YELLOW}📡 Enviando requisição para criar usuário...${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

# Extrai o código HTTP e o corpo da resposta
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

echo ""
echo -e "${CYAN}📋 Resposta da API:${NC}"
echo -e "   ${WHITE}• Código HTTP:${NC} ${GREEN}$HTTP_CODE${NC}"

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ Usuário criado com sucesso!${NC}"
    echo ""
    
    # Agora atualiza a role diretamente no banco para torná-lo administrador
    echo -e "${YELLOW}🔧 Atualizando role para Administrador...${NC}"
    
    DB_PATH="../src/Api/database/healthcore.db"
    
    if [ -f "$DB_PATH" ]; then
        sqlite3 "$DB_PATH" "UPDATE Users SET Role = 1 WHERE Username = '$USERNAME';"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Role atualizada para Administrador!${NC}"
            echo ""
            echo -e "${CYAN}📋 Informações de Login:${NC}"
            echo -e "   ${WHITE}• Usuário:${NC} ${GREEN}$USERNAME${NC}"
            echo -e "   ${WHITE}• Senha:${NC} ${GREEN}$PASSWORD${NC}"
            echo -e "   ${WHITE}• Role:${NC} ${GREEN}1 (Administrador)${NC}"
            echo ""
            echo -e "${GREEN}🎉 Pronto! Você pode fazer login na API como administrador${NC}"
        else
            echo -e "${RED}❌ Erro ao atualizar role no banco${NC}"
            echo -e "${YELLOW}⚠️  Usuário criado com role Médico (2)${NC}"
            echo -e "${YELLOW}   Atualize manualmente no banco ou use o script create-admin.sh${NC}"
        fi
    else
        echo -e "${RED}❌ Banco de dados não encontrado em: $DB_PATH${NC}"
        echo -e "${YELLOW}⚠️  Usuário criado com role Médico (2)${NC}"
        echo -e "${YELLOW}   Use o script create-admin.sh para criar com role correta${NC}"
    fi
elif [ "$HTTP_CODE" -eq 409 ]; then
    echo -e "${YELLOW}⚠️  Usuário já existe${NC}"
    echo -e "${BLUE}ℹ️  Resposta: $RESPONSE_BODY${NC}"
    echo ""
    echo -e "${CYAN}📋 Informações de Login (usuário existente):${NC}"
    echo -e "   ${WHITE}• Usuário:${NC} ${GREEN}$USERNAME${NC}"
    echo -e "   ${WHITE}• Senha:${NC} ${GREEN}$PASSWORD${NC}"
    echo ""
    echo -e "${GREEN}🎉 Você pode fazer login na API com essas credenciais${NC}"
else
    echo -e "${RED}❌ Erro ao criar usuário${NC}"
    echo -e "${RED}   Resposta: $RESPONSE_BODY${NC}"
    exit 1
fi