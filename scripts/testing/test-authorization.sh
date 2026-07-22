#!/bin/bash

# HealthCore authorization smoke test.
# Usage: ./test-authorization.sh [BASE_URL]

BASE_URL="${1:-http://localhost:5005/healthcore-api}"
ADMIN_USER="${HEALTHCORE_ADMIN_USERNAME:?HEALTHCORE_ADMIN_USERNAME must be set}"
ADMIN_PASS="${HEALTHCORE_ADMIN_PASSWORD:?HEALTHCORE_ADMIN_PASSWORD must be set}"
DOC_PASS="${HEALTHCORE_TEST_DOCTOR_PASSWORD:?HEALTHCORE_TEST_DOCTOR_PASSWORD must be set}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_status() {
    local response="$1"
    local expected="$2"
    local message="$3"
    local status
    status=$(echo "$response" | tail -n1)
    if [ "$status" -eq "$expected" ]; then
        echo -e "${GREEN}[OK] $message (Status $status)${NC}"
    else
        echo -e "${RED}[FAIL] $message (Esperado $expected, recebido $status)${NC}"
        return 1
    fi
}

TOKEN_RESP_ADMIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$ADMIN_USER\", \"password\": \"$ADMIN_PASS\"}")
TOKEN_ADMIN=$(echo "$TOKEN_RESP_ADMIN" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")
if [ -z "$TOKEN_ADMIN" ]; then
    echo -e "${RED}[FAIL] Admin authentication failed${NC}"
    exit 1
fi

echo -e "${YELLOW}Creating temporary doctor...${NC}"
DOC_USER="medico_auth_$(date +%s)"
CREATE_DOC_BODY="{\"username\": \"$DOC_USER\", \"password\": \"$DOC_PASS\", \"role\": 2}"
RESP_CREATE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/admin/usuarios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -d "$CREATE_DOC_BODY")
check_status "$RESP_CREATE" 201 "Doctor created" || exit 1
DOC_ID=$(echo "$RESP_CREATE" | sed '$d' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
[ -n "$DOC_ID" ] || { echo -e "${RED}[FAIL] Doctor id not returned${NC}"; exit 1; }

TOKEN_RESP_DOC=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$DOC_USER\", \"password\": \"$DOC_PASS\"}")
TOKEN_DOC=$(echo "$TOKEN_RESP_DOC" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")
[ -n "$TOKEN_DOC" ] || { echo -e "${RED}[FAIL] Doctor authentication failed${NC}"; exit 1; }

RESP_FORBIDDEN=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/admin/usuarios" \
  -H "Authorization: Bearer $TOKEN_DOC")
check_status "$RESP_FORBIDDEN" 403 "Doctor denied on admin endpoint" || exit 1

CPF_RANDOM=$(python3 -c "
import random
cpf = [random.randint(0, 9) for _ in range(9)]
for _ in range(2):
    value = sum((len(cpf) + 1 - i) * digit for i, digit in enumerate(cpf)) % 11
    cpf.append(11 - value if value > 1 else 0)
print(''.join(map(str, cpf)))
")
PACIENTE_BODY="{\"nome\": \"Paciente do Medico\", \"documento\": \"$CPF_RANDOM\", \"dataNascimento\": \"1990-01-01\", \"contato\": \"11900000000\"}"
RESP_ALLOWED=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/pacientes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_DOC" \
  -d "$PACIENTE_BODY")
check_status "$RESP_ALLOWED" 201 "Doctor can create patient" || exit 1
PACIENTE_ID=$(echo "$RESP_ALLOWED" | sed '$d' | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")

if [ -n "$PACIENTE_ID" ]; then
    curl -s -o /dev/null -X DELETE "$BASE_URL/pacientes/$PACIENTE_ID" \
      -H "Authorization: Bearer $TOKEN_ADMIN"
fi
curl -s -o /dev/null -X DELETE "$BASE_URL/admin/usuarios/$DOC_ID" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

echo -e "${GREEN}[OK] Authorization smoke test completed${NC}"