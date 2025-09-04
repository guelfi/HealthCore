#!/bin/bash

# Script para iniciar o Frontend na porta 5005
# Verifica e para qualquer serviço rodando na porta antes de iniciar

echo "🔍 Verificando se há serviços rodando na porta 5005..."

# Encontra processos usando a porta 5005
PID=$(lsof -ti:5005)

if [ ! -z "$PID" ]; then
    echo "⚠️  Encontrado serviço rodando na porta 5005 (PID: $PID)"
    echo "🛑 Parando serviço..."
    kill -9 $PID
    sleep 2
    echo "✅ Serviço parado"
else
    echo "✅ Porta 5005 está livre"
fi

echo "🚀 Iniciando Frontend na porta 5005..."
cd "$(dirname "$0")/../src/Web"
npm run dev