#!/bin/bash

# Script para diagnosticar e corrigir problemas ERR_NGROK_8012
# Resolve problemas de conexão do ngrok com serviços locais

set -e

echo "🔧 Diagnóstico e Correção de Problemas Ngrok (ERR_NGROK_8012)"
echo "================================================================"

# Função para verificar porta
check_port() {
    local port=$1
    local service=$2
    
    if netstat -tuln | grep -q ":$port "; then
        echo "✅ Porta $port ($service) está em uso"
        return 0
    else
        echo "❌ Porta $port ($service) não está em uso"
        return 1
    fi
}

# Função para verificar conectividade HTTP
check_http() {
    local url=$1
    local service=$2
    
    if curl -s --connect-timeout 5 "$url" > /dev/null 2>&1; then
        echo "✅ $service respondendo em $url"
        return 0
    else
        echo "❌ $service não responde em $url"
        return 1
    fi
}

# Verificar se ngrok está instalado
echo "🔍 Verificando instalação do ngrok..."
if command -v ngrok &> /dev/null; then
    NGROK_VERSION=$(ngrok version | head -n1)
    echo "✅ Ngrok instalado: $NGROK_VERSION"
else
    echo "❌ Ngrok não está instalado!"
    echo "📥 Para instalar:"
    echo "   curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null"
    echo "   echo 'deb https://ngrok-agent.s3.amazonaws.com buster main' | sudo tee /etc/apt/sources.list.d/ngrok.list"
    echo "   sudo apt update && sudo apt install ngrok"
    exit 1
fi

echo ""
echo "🔍 Verificando serviços locais..."

# Verificar portas
API_PORT_OK=false
FRONTEND_PORT_OK=false

if check_port 5000 "API"; then
    API_PORT_OK=true
fi

if check_port 5005 "Frontend"; then
    FRONTEND_PORT_OK=true
fi

echo ""
echo "🌐 Verificando conectividade HTTP..."

# Verificar conectividade HTTP
API_HTTP_OK=false
FRONTEND_HTTP_OK=false

if check_http "http://localhost:5000/health/ready" "API Health Check"; then
    API_HTTP_OK=true
elif check_http "http://localhost:5000" "API"; then
    API_HTTP_OK=true
fi

if check_http "http://localhost:5005" "Frontend"; then
    FRONTEND_HTTP_OK=true
fi

echo ""
echo "🔍 Verificando interfaces de rede..."

# Listar interfaces disponíveis
echo "📡 Interfaces de rede disponíveis:"
ip addr show | grep -E '^[0-9]+:' | awk '{print $2}' | sed 's/:$//' | while read iface; do
    ip addr show "$iface" | grep 'inet ' | awk '{print "   " $2 " (" iface ")"}'
done

echo ""
echo "🔍 Testando conectividade em diferentes IPs..."

# Testar conectividade em diferentes IPs
TEST_IPS=("127.0.0.1" "localhost" "0.0.0.0")
for ip in "${TEST_IPS[@]}"; do
    echo "🧪 Testando $ip:5005..."
    if curl -s --connect-timeout 3 "http://$ip:5005" > /dev/null 2>&1; then
        echo "   ✅ $ip:5005 acessível"
    else
        echo "   ❌ $ip:5005 não acessível"
    fi
done

echo ""
echo "📋 Resumo do Diagnóstico:"
echo "========================"

if [ "$API_PORT_OK" = true ] && [ "$API_HTTP_OK" = true ]; then
    echo "✅ API: Funcionando corretamente (porta 5000)"
else
    echo "❌ API: Problemas detectados"
    echo "   🔧 Solução: cd ../Api && dotnet run"
fi

if [ "$FRONTEND_PORT_OK" = true ] && [ "$FRONTEND_HTTP_OK" = true ]; then
    echo "✅ Frontend: Funcionando corretamente (porta 5005)"
else
    echo "❌ Frontend: Problemas detectados"
    echo "   🔧 Solução: npm run dev"
fi

echo ""
echo "🚀 Comandos para corrigir problemas:"
echo "===================================="

if [ "$API_HTTP_OK" = false ]; then
    echo "📡 Para iniciar a API:"
    echo "   cd ../Api && dotnet run"
    echo ""
fi

if [ "$FRONTEND_HTTP_OK" = false ]; then
    echo "🌐 Para iniciar o Frontend:"
    echo "   npm run dev"
    echo ""
fi

echo "🔗 Para iniciar o ngrok (após corrigir os serviços):"
echo "   ngrok http 5005"
echo "   # ou use: ./scripts/setup-ngrok.sh"
echo ""
echo "📱 Painel do ngrok: http://localhost:4040"
echo ""
echo "💡 Dicas importantes:"
echo "   • Certifique-se de que o Vite está configurado com host: '0.0.0.0'"
echo "   • Verifique se não há firewall bloqueando as portas"
echo "   • O ngrok deve apontar para localhost:5005, não para IPs específicos"
echo "   • Use 'ngrok http 5005' em vez de 'ngrok http 172.17.158.1:5005'"

echo ""
echo "🔧 Executar correção automática? (s/n)"
read -r response

if [[ "$response" =~ ^[Ss]$ ]]; then
    echo "🚀 Iniciando correção automática..."
    
    if [ "$API_HTTP_OK" = false ]; then
        echo "📡 Iniciando API..."
        cd ../Api
        nohup dotnet run > /tmp/healthcore-api.log 2>&1 &
        echo "API iniciada em background (log: /tmp/healthcore-api.log)"
        cd ../Web
        sleep 3
    fi
    
    if [ "$FRONTEND_HTTP_OK" = false ]; then
        echo "🌐 Iniciando Frontend..."
        nohup npm run dev > /tmp/healthcore-frontend.log 2>&1 &
        echo "Frontend iniciado em background (log: /tmp/healthcore-frontend.log)"
        sleep 3
    fi
    
    echo "⏳ Aguardando serviços inicializarem..."
    sleep 5
    
    echo "🔗 Iniciando ngrok..."
    echo "📱 Acesse o painel em: http://localhost:4040"
    ngrok http 5005
else
    echo "ℹ️  Execute as correções manualmente conforme indicado acima."
fi