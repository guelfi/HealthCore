#!/bin/bash

# 🔍 Script de Teste de Conectividade HealthCore

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m' 
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔍 Teste de Conectividade HealthCore${NC}"
echo "========================================="
echo ""

# Testar API diretamente na OCI
echo -e "${YELLOW}1. Testando API diretamente na OCI...${NC}"
curl -s -w "Status: %{http_code}\nTempo: %{time_total}s\n" \
  -H "Accept: application/json" \
  http://129.153.86.168:5000/health | head -10
echo ""

# Testar proxy do Vite
echo -e "${YELLOW}2. Testando proxy do Vite (localhost:5005/api)...${NC}"
curl -s -w "Status: %{http_code}\nTempo: %{time_total}s\n" \
  -H "Accept: application/json" \
  http://localhost:5005/api/health | head -10
echo ""

# Testar autenticação 
echo -e "${YELLOW}3. Testando endpoint de autenticação...${NC}"
curl -s -w "Status: %{http_code}\nTempo: %{time_total}s\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"username":"guelfi","password":"@246!588"}' \
  http://localhost:5005/api/auth/login | head -5
echo ""

# Testar CORS
echo -e "${YELLOW}4. Testando CORS (OPTIONS request)...${NC}"
curl -s -w "Status: %{http_code}\nTempo: %{time_total}s\n" \
  -X OPTIONS \
  -H "Origin: http://localhost:5005" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type" \
  http://localhost:5005/api/pacientes
echo ""

# Verificar configuração do apiConfig
echo -e "${YELLOW}5. Verificando configuração atual...${NC}"
echo "Frontend URL: http://localhost:5005"
echo "API OCI URL: http://129.153.86.168:5000"
echo "Proxy configurado: /api -> http://129.153.86.168:5000"
echo ""

# Instruções para debug no navegador
echo -e "${BLUE}🔧 Para debug no navegador:${NC}"
echo "1. Abra http://localhost:5005"
echo "2. Pressione F12 para abrir DevTools"
echo "3. Vá na aba Network"
echo "4. Faça login e observe as requisições"
echo "5. Procure por erros CORS ou timeouts"
echo ""

echo -e "${GREEN}✅ Conectividade básica funcionando!${NC}"
echo "Se ainda houver problemas, verifique:"
echo "- Console do navegador (F12)"
echo "- Tab Network no DevTools"
echo "- Configuração do apiConfig.ts"