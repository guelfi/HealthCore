#!/bin/bash

# 🧪 Teste de ngrok - HealthCore
# Verifica se o ngrok está configurado corretamente

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Teste de Configuração ngrok${NC}"
echo "================================="

# Verificar se o arquivo .env.local existe
if [ ! -f "src/Web/.env.local" ]; then
    echo -e "${RED}❌ Arquivo .env.local não encontrado${NC}"
    echo "💡 Crie o arquivo baseado no exemplo:"
    echo "   cp src/Web/.env.ngrok.example src/Web/.env.local"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo .env.local encontrado${NC}"

# Ler configuração do .env.local
NGROK_API_URL=$(grep "VITE_NGROK_API_URL" src/Web/.env.local | cut -d'=' -f2)

if [ -z "$NGROK_API_URL" ] || [ "$NGROK_API_URL" = "https://SUA_URL_NGROK_DA_API.ngrok-free.app" ]; then
    echo -e "${YELLOW}⚠️  VITE_NGROK_API_URL não configurado${NC}"
    echo "💡 Edite src/Web/.env.local e configure a URL do ngrok da API"
    exit 1
fi

echo -e "${GREEN}✅ VITE_NGROK_API_URL configurado: $NGROK_API_URL${NC}"

# Testar se a URL do ngrok da API está funcionando
echo ""
echo "🔍 Testando conectividade com ngrok da API..."

if curl -s --max-time 10 "$NGROK_API_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API ngrok respondendo${NC}"
else
    echo -e "${RED}❌ API ngrok não está respondendo${NC}"
    echo "💡 Verifique se:"
    echo "   1. ngrok está rodando: ngrok http 5000"
    echo "   2. API está rodando: ./start-api.sh"
    echo "   3. URL no .env.local está correta"
    exit 1
fi

# Verificar se o frontend está rodando
echo ""
echo "🔍 Verificando frontend local..."

if curl -s --max-time 5 "http://192.168.15.119:5005" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend rodando localmente${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend não está rodando${NC}"
    echo "💡 Inicie o frontend: ./start-frontend.sh"
fi

echo ""
echo -e "${GREEN}🎉 Configuração ngrok OK!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo "1. Certifique-se que o frontend está rodando"
echo "2. Inicie ngrok para o frontend: ngrok http 5005"
echo "3. Use a URL HTTPS do ngrok do frontend no celular"
echo ""
echo -e "${BLUE}🔧 URLs atuais:${NC}"
echo -e "   API Local: ${GREEN}http://192.168.15.119:5000${NC}"
echo -e "   API ngrok: ${GREEN}$NGROK_API_URL${NC}"
echo -e "   Frontend Local: ${GREEN}http://192.168.15.119:5005${NC}"