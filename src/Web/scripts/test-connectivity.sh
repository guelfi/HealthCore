#!/bin/bash

# Script para testar conectividade com a API
# Uso: ./scripts/test-connectivity.sh [api-url]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Testando Conectividade - HealthCore API${NC}"
echo "================================================"

# Determinar URL da API
if [ -n "$1" ]; then
    API_URL="$1"
    echo -e "${BLUE}📡 URL fornecida: $API_URL${NC}"
else
    # Tentar ler do .env
    if [ -f ".env" ]; then
        API_URL=$(grep VITE_API_BASE_URL .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        echo -e "${BLUE}📋 URL do .env: $API_URL${NC}"
    else
        API_URL="http://localhost:5000"
        echo -e "${YELLOW}⚠️  Usando URL padrão: $API_URL${NC}"
    fi
fi

echo ""

# Função para testar endpoint
test_endpoint() {
    local endpoint="$1"
    local description="$2"
    local full_url="$API_URL$endpoint"
    
    echo -n "🔗 $description... "
    
    if curl -s --max-time 10 "$full_url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC}"
        return 1
    fi
}

# Função para testar endpoint com resposta
test_endpoint_with_response() {
    local endpoint="$1"
    local description="$2"
    local full_url="$API_URL$endpoint"
    
    echo "🔗 $description:"
    echo "   URL: $full_url"
    
    response=$(curl -s --max-time 10 "$full_url" 2>/dev/null || echo "ERROR")
    
    if [ "$response" = "ERROR" ]; then
        echo -e "   ${RED}❌ Não foi possível conectar${NC}"
        return 1
    else
        echo -e "   ${GREEN}✅ Resposta recebida:${NC}"
        echo "   $response" | head -c 200
        if [ ${#response} -gt 200 ]; then
            echo "..."
        fi
        echo ""
        return 0
    fi
}

# Testes básicos
echo -e "${BLUE}📊 Testes Básicos:${NC}"
test_endpoint "/health/ready" "Health Check (Ready)"
test_endpoint "/health/live" "Health Check (Live)"
test_endpoint_with_response "/health/info" "System Info"

echo ""

# Testes de endpoints da API
echo -e "${BLUE}🔌 Testes de Endpoints:${NC}"
test_endpoint "/swagger" "Swagger Documentation"
test_endpoint "/pacientes" "Pacientes Endpoint"
test_endpoint "/exames" "Exames Endpoint"
test_endpoint "/exames/modalidades" "Modalidades Endpoint"

echo ""

# Teste de CORS
echo -e "${BLUE}🌐 Teste de CORS:${NC}"
echo "🔗 Testando CORS com JavaScript fetch..."

# Criar arquivo temporário para teste de CORS
cat > /tmp/cors_test.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>CORS Test</title></head>
<body>
<script>
fetch('API_URL_PLACEHOLDER/health/ready')
  .then(response => {
    console.log('✅ CORS OK - Status:', response.status);
    document.body.innerHTML = '<h2 style="color: green;">✅ CORS funcionando!</h2>';
  })
  .catch(error => {
    console.error('❌ CORS Error:', error);
    document.body.innerHTML = '<h2 style="color: red;">❌ Erro de CORS: ' + error.message + '</h2>';
  });
</script>
</body>
</html>
EOF

# Substituir placeholder pela URL real
sed -i.bak "s|API_URL_PLACEHOLDER|$API_URL|g" /tmp/cors_test.html
rm /tmp/cors_test.html.bak 2>/dev/null || true

echo "   Arquivo de teste criado: /tmp/cors_test.html"
echo "   Abra este arquivo no navegador para testar CORS"

echo ""

# Informações do sistema
echo -e "${BLUE}💻 Informações do Sistema:${NC}"
echo "🖥️  Sistema: $(uname -s)"
echo "🏠 Hostname: $(hostname)"
echo "📍 IP Local: $(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}' || echo "Não encontrado")"
echo "🌐 Conectividade Internet: $(ping -c 1 8.8.8.8 > /dev/null 2>&1 && echo "✅ OK" || echo "❌ Sem conexão")"

echo ""

# Verificar se ngrok está rodando
echo -e "${BLUE}🚇 Verificação Ngrok:${NC}"
if pgrep -f "ngrok" > /dev/null; then
    echo -e "🟢 Ngrok está rodando"
    # Tentar obter URL do ngrok
    if command -v curl > /dev/null && curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
        ngrok_url=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free\.app' | head -1)
        if [ -n "$ngrok_url" ]; then
            echo "📡 URL do Ngrok: $ngrok_url"
        fi
    fi
else
    echo -e "🔴 Ngrok não está rodando"
fi

echo ""

# Resumo e recomendações
echo -e "${BLUE}📋 Resumo e Recomendações:${NC}"
echo ""

if test_endpoint "/health/ready" "Health Check Final" > /dev/null 2>&1; then
    echo -e "${GREEN}🎉 API está funcionando corretamente!${NC}"
    echo ""
    echo "✅ Para usar com ngrok:"
    echo "   1. Inicie o ngrok: ngrok http 5005"
    echo "   2. Use a URL fornecida pelo ngrok"
    echo "   3. Configure o .env com a URL da API: $API_URL"
else
    echo -e "${RED}❌ API não está respondendo!${NC}"
    echo ""
    echo "🔧 Para corrigir:"
    echo "   1. Verifique se a API está rodando:"
    echo "      cd ../Api && dotnet run --urls http://0.0.0.0:5000"
    echo "   2. Verifique o IP da máquina:"
    echo "      ifconfig | grep 'inet ' | grep -v 127.0.0.1"
    echo "   3. Atualize o .env com o IP correto"
    echo "   4. Teste novamente: ./scripts/test-connectivity.sh"
fi

echo ""
echo -e "${BLUE}🔗 Links Úteis:${NC}"
echo "   • API Health: $API_URL/health/ready"
echo "   • API Swagger: $API_URL/swagger"
echo "   • Diagnóstico Frontend: http://localhost:5005/diagnostic"
echo "   • Teste CORS: file:///tmp/cors_test.html"

echo ""
echo "================================================"
echo -e "${BLUE}✨ Teste concluído!${NC}"