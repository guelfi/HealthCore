#!/bin/bash

# Script para iniciar a API na porta 5000
# Verifica e para qualquer serviço rodando na porta antes de iniciar

echo "🔍 Verificando se há serviços rodando na porta 5000..."

# Encontra processos usando a porta 5000
PID=$(lsof -ti:5000)

if [ ! -z "$PID" ]; then
    echo "⚠️  Encontrado serviço rodando na porta 5000 (PID: $PID)"
    echo "🛑 Parando serviço..."
    kill -9 $PID
    sleep 2
    echo "✅ Serviço parado"
else
    echo "✅ Porta 5000 está livre"
fi

echo "🚀 Iniciando API na porta 5000..."
cd "$(dirname "$0")/../src/Api"
dotnet run