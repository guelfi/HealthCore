#!/bin/bash

# 🏥 HealthCore - Gerenciador de Serviços (Linux/macOS)
# Script wrapper para o healthcore.js

# --- Verificações Iniciais ---
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js."
    exit 1
fi

# --- Verificar se healthcore.js existe ---
if [ ! -f "healthcore.js" ]; then
    echo "❌ Arquivo healthcore.js não encontrado."
    exit 1
fi

# --- Executar healthcore.js ---
node healthcore.js "$@"

