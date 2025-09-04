#!/bin/bash

# Script para iniciar API e Frontend
# Verifica e para qualquer serviço rodando nas portas antes de iniciar

echo "🚀 Iniciando todos os serviços..."
echo ""

# Para serviços existentes nas portas
echo "🔍 Verificando portas 5000 e 5005..."

# Verifica porta 5000 (API)
PID_API=$(lsof -ti:5000)
if [ ! -z "$PID_API" ]; then
    echo "⚠️  Parando serviço na porta 5000 (PID: $PID_API)"
    kill -9 $PID_API
    sleep 1
fi

# Verifica porta 5005 (Frontend)
PID_FRONTEND=$(lsof -ti:5005)
if [ ! -z "$PID_FRONTEND" ]; then
    echo "⚠️  Parando serviço na porta 5005 (PID: $PID_FRONTEND)"
    kill -9 $PID_FRONTEND
    sleep 1
fi

echo "✅ Portas liberadas"
echo ""

# Inicia API em background
echo "🔧 Iniciando API na porta 5000..."
cd "$(dirname "$0")/../src/Api"
dotnet run &
API_PID=$!
echo "✅ API iniciada (PID: $API_PID)"

# Aguarda um pouco para a API inicializar
sleep 3

# Inicia Frontend em background
echo "🎨 Iniciando Frontend na porta 5005..."
cd "$(dirname "$0")/../src/Web"
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"

echo ""
echo "🎉 Todos os serviços foram iniciados!"
echo "📍 API: http://localhost:5000"
echo "📍 Frontend: http://localhost:5005"
echo ""
echo "Para parar os serviços, pressione Ctrl+C"

# Aguarda sinal de interrupção
trap 'echo "\n🛑 Parando serviços..."; kill $API_PID $FRONTEND_PID 2>/dev/null; exit' INT

# Mantém o script rodando
wait