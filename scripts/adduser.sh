#!/bin/bash

# Endereço base da API
BASE_URL="http://localhost:5000"

# Verifica se o comando jq está instalado
if ! command -v jq &> /dev/null
then
    echo "Erro: O utilitário 'jq' não foi encontrado."
    echo "Por favor, instale-o para continuar (ex: 'brew install jq' no macOS)."
    exit 1
fi

# Pede as credenciais do administrador
read -p "Digite o nome de usuário do Administrador: " ADMIN_USER
read -sp "Digite a senha do Administrador: " ADMIN_PASS
echo # Adiciona uma nova linha após a inserção da senha

# --- 1. Autenticar como Admin para obter o Token ---
echo "Autenticando como '$ADMIN_USER'..."

LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" -H "Content-Type: application/json" -d "{\"username\": \"${ADMIN_USER}\", \"password\": \"${ADMIN_PASS}\"}")

# Extrai o token da resposta JSON
TOKEN=$(echo "${LOGIN_RESPONSE}" | jq -r '.token')

# Verifica se o login falhou (token nulo ou vazio)
if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "--------------------------------------------------"
    echo "Falha no login. Verifique suas credenciais."
    echo "Resposta do servidor: ${LOGIN_RESPONSE}"
    echo "--------------------------------------------------"
    exit 1
fi

echo "Login realizado com sucesso."
echo "--------------------------------------------------"


# --- 2. Pede os dados do novo usuário Médico ---
read -p "Digite o nome de usuário para o novo Médico: " MEDICO_USER
read -sp "Digite a senha para o novo Médico: " MEDICO_PASS
echo


# --- 3. Cria o novo usuário Médico usando o token do Admin ---
echo "Criando o usuário médico '$MEDICO_USER'..."

# A flag -w "\n%{http_code}" anexa o código de status HTTP na última linha da saída
CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/admin/usuarios" -H "Content-Type: application/json" -H "Authorization: Bearer ${TOKEN}" -d "{\"username\": \"${MEDICO_USER}\", \"password\": \"${MEDICO_PASS}\", \"role\": 2}")

# Extrai o código HTTP e o corpo da resposta
HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$CREATE_RESPONSE" | sed '$d')

# Verifica o resultado da criação
if [ "$HTTP_CODE" -eq 201 ]; then
    echo "--------------------------------------------------"
    echo "Usuário médico '$MEDICO_USER' criado com sucesso!"
    echo "Resposta do servidor:"
    echo "${RESPONSE_BODY}" | jq . # Formata o JSON de saída
    echo "--------------------------------------------------"
else
    echo "--------------------------------------------------"
    echo "Falha ao criar o usuário médico."
    echo "Código de Status HTTP: ${HTTP_CODE}"
    echo "Resposta do servidor: ${RESPONSE_BODY}"
    echo "--------------------------------------------------"
    exit 1
fi

exit 0