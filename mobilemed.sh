#!/bin/bash

# 🏥 MobileMed - Gerenciador de Serviços (Linux/macOS)
# Script wrapper para o gerenciador Node.js

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Obter diretório do script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Por favor, instale o Node.js primeiro.${NC}"
    echo -e "${YELLOW}💡 Ubuntu/Debian: sudo apt install nodejs npm${NC}"
    echo -e "${YELLOW}💡 macOS: brew install node${NC}"
    echo -e "${YELLOW}💡 Download: https://nodejs.org/${NC}"
    exit 1
fi

# Tornar o script executável se necessário
if [ ! -x "$SCRIPT_DIR/mobilemed.js" ]; then
    chmod +x "$SCRIPT_DIR/mobilemed.js"
fi

# Executar o script Node.js principal
node "$SCRIPT_DIR/mobilemed.js" "$@"