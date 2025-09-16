#!/bin/bash

# 🔧 Configure Frontend Environment - HealthCore
# Configura o ambiente do frontend para trabalhar com ngrok

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Configurando ambiente do frontend${NC}"
echo "===================================="

# Diretório do frontend
FRONTEND_DIR="src/Web"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Diretório do frontend não encontrado: $FRONTEND_DIR${NC}"
    exit 1
fi

cd "$FRONTEND_DIR"

# Backup do arquivo .env atual se existir
if [ -f ".env.local" ]; then
    echo "📄 Fazendo backup do .env.local atual..."
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
fi

# Criar configuração otimizada para ngrok
echo "📝 Criando configuração .env.local..."
cat > .env.local << 'EOF'
# 🌐 Configuração HealthCore - Ngrok Single Tunnel
# Gerado automaticamente em $(date)

# ====================================================================
# CONFIGURAÇÃO DA API
# ====================================================================
# A API roda localmente e é acessada pelo frontend via localhost
# Isso funciona porque o frontend e API estão no mesmo servidor
VITE_API_BASE_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000
VITE_API_TIMEOUT=30000

# ====================================================================
# CONFIGURAÇÃO DA APLICAÇÃO
# ====================================================================
VITE_APP_NAME=HealthCore Frontend
VITE_APP_VERSION=1.0.0
VITE_APP_TITLE=HealthCore

# ====================================================================
# CONFIGURAÇÃO DE DESENVOLVIMENTO
# ====================================================================
VITE_DEV_MODE=true
VITE_NODE_ENV=development

# ====================================================================
# CONFIGURAÇÃO DE REDE
# ====================================================================
# Permite acesso de qualquer IP (necessário para ngrok)
VITE_HOST=0.0.0.0
VITE_PORT=5005

# ====================================================================
# CONFIGURAÇÃO DE CORS
# ====================================================================
# Headers necessários para funcionamento com ngrok
VITE_CORS_ORIGIN=*

# ====================================================================
# OBSERVAÇÕES
# ====================================================================
# Esta configuração permite:
# 1. Frontend acessível externamente via ngrok
# 2. API acessível localmente pelo frontend
# 3. Comunicação interna mantida
# 4. Funcionalidade completa com apenas 1 túnel ngrok
EOF

echo -e "${GREEN}✅ Arquivo .env.local criado com sucesso${NC}"

# Verificar se o vite.config.ts precisa ser atualizado
echo "🔍 Verificando configuração do Vite..."

if [ -f "vite.config.ts" ]; then
    # Verificar se já tem a configuração de proxy
    if ! grep -q "proxy" vite.config.ts; then
        echo "📝 Atualizando vite.config.ts para suportar proxy..."
        
        # Fazer backup
        cp vite.config.ts vite.config.ts.backup.$(date +%Y%m%d_%H%M%S)
        
        # Criar nova configuração
        cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5005,
    // Permite qualquer host do ngrok dinamicamente
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      ".ngrok-free.app",
      ".ngrok.io",
      ".ngrok.app"
    ],
    proxy: {
      // Proxy para API local quando acessado via ngrok
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5005
  }
})
EOF
        echo -e "${GREEN}✅ vite.config.ts atualizado${NC}"
    else
        echo -e "${YELLOW}ℹ️  vite.config.ts já possui configuração de proxy${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  vite.config.ts não encontrado${NC}"
fi

# Verificar package.json para scripts úteis
echo "🔍 Verificando scripts do package.json..."

if [ -f "package.json" ]; then
    # Adicionar script para ngrok se não existir
    if ! grep -q "ngrok" package.json; then
        echo "📝 Adicionando scripts úteis ao package.json..."
        
        # Fazer backup
        cp package.json package.json.backup.$(date +%Y%m%d_%H%M%S)
        
        # Usar node para adicionar scripts
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (!pkg.scripts) pkg.scripts = {};
        
        pkg.scripts['dev:ngrok'] = 'vite --host 0.0.0.0 --port 5005';
        pkg.scripts['start:ngrok'] = 'npm run dev:ngrok';
        pkg.scripts['setup:ngrok'] = 'bash ../../scripts/ngrok/setup-single-tunnel.sh';
        
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        console.log('Scripts adicionados com sucesso!');
        "
        
        echo -e "${GREEN}✅ Scripts adicionados ao package.json${NC}"
    else
        echo -e "${YELLOW}ℹ️  Scripts ngrok já existem no package.json${NC}"
    fi
fi

cd ../..

echo ""
echo -e "${GREEN}🎉 Configuração concluída!${NC}"
echo "========================="
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo "1. Execute: bash scripts/ngrok/setup-single-tunnel.sh"
echo "2. Acesse o frontend via URL do ngrok"
echo "3. Todas as funcionalidades estarão disponíveis"
echo ""
echo -e "${YELLOW}💡 Arquivos modificados:${NC}"
echo "   • src/Web/.env.local (configuração principal)"
echo "   • src/Web/vite.config.ts (proxy para API)"
echo "   • src/Web/package.json (scripts úteis)"
echo ""
echo -e "${BLUE}🔧 Scripts disponíveis:${NC}"
echo "   • npm run setup:ngrok (configura e inicia ngrok)"
echo "   • npm run dev:ngrok (inicia frontend para ngrok)"
echo ""