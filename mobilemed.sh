#!/bin/bash

# 🏥 MobileMed - Gerenciador de Serviços (Linux/macOS)
# Script wrapper para o mobilemed.js

# --- Verificações Iniciais ---
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js."
    exit 1
fi

# --- Verificar se mobilemed.js existe ---
if [ ! -f "mobilemed.js" ]; then
    echo "❌ Arquivo mobilemed.js não encontrado."
    exit 1
fi

# --- Executar mobilemed.js ---
node mobilemed.js "$@"

