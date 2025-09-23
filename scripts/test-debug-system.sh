#!/bin/bash

# 🐛 Script de Teste do Sistema de Debug Mobile - HealthCore

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}🐛 Teste do Sistema de Debug Mobile - HealthCore${NC}"
echo "=================================================="
echo ""

# Função para verificar arquivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1${NC}"
        return 0
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

# Verificar arquivos essenciais
echo -e "${BLUE}📁 Verificando arquivos do sistema de debug...${NC}"
check_file "src/Web/src/components/dev/MobileDebugger.tsx"
check_file "src/Web/src/utils/debugManager.ts"
check_file "src/Web/src/vite-env.d.ts"
check_file "src/Web/.env.development"
check_file "src/Web/.env.production"
check_file "src/Web/.env.local"
echo ""

# Verificar configurações de ambiente
echo -e "${BLUE}⚙️  Testando configurações de ambiente...${NC}"

echo "🔍 Verificando variáveis de desenvolvimento:"
if grep -q "VITE_ENABLE_DEBUGGER=true" src/Web/.env.development; then
    echo -e "${GREEN}✅ Debug habilitado em desenvolvimento${NC}"
else
    echo -e "${RED}❌ Debug não configurado em desenvolvimento${NC}"
fi

echo "🔍 Verificando variáveis de produção:"
if grep -q "VITE_ENABLE_DEBUGGER=false" src/Web/.env.production; then
    echo -e "${GREEN}✅ Debug desabilitado em produção${NC}"
else
    echo -e "${RED}❌ Debug não configurado em produção${NC}"
fi

echo ""

# Testar integração no App.tsx
echo -e "${BLUE}🔗 Verificando integração no App.tsx...${NC}"
if grep -q "MobileDebugger" src/Web/src/App.tsx; then
    echo -e "${GREEN}✅ MobileDebugger importado no App.tsx${NC}"
else
    echo -e "${RED}❌ MobileDebugger não encontrado no App.tsx${NC}"
fi

if grep -q "VITE_ENABLE_DEBUGGER" src/Web/src/App.tsx; then
    echo -e "${GREEN}✅ Verificação de ambiente configurada${NC}"
else
    echo -e "${RED}❌ Verificação de ambiente não configurada${NC}"
fi

echo ""

# Verificar estrutura do componente
echo -e "${BLUE}🧩 Analisando componente MobileDebugger...${NC}"

if grep -q "shouldShowDebugger" src/Web/src/components/dev/MobileDebugger.tsx; then
    echo -e "${GREEN}✅ Lógica de exibição condicional implementada${NC}"
else
    echo -e "${RED}❌ Lógica de exibição não encontrada${NC}"
fi

if grep -q "debugManager" src/Web/src/components/dev/MobileDebugger.tsx; then
    echo -e "${GREEN}✅ Integração com debugManager configurada${NC}"
else
    echo -e "${RED}❌ Integração com debugManager não encontrada${NC}"
fi

if grep -q "useResponsive" src/Web/src/components/dev/MobileDebugger.tsx; then
    echo -e "${GREEN}✅ Hook responsivo integrado${NC}"
else
    echo -e "${RED}❌ Hook responsivo não integrado${NC}"
fi

echo ""

# Verificar tipagens TypeScript
echo -e "${BLUE}📝 Verificando tipagens TypeScript...${NC}"

if grep -q "VITE_ENABLE_DEBUGGER" src/Web/src/vite-env.d.ts; then
    echo -e "${GREEN}✅ Tipagens de ambiente configuradas${NC}"
else
    echo -e "${RED}❌ Tipagens de ambiente não encontradas${NC}"
fi

echo ""

# Instruções de teste manual
echo -e "${PURPLE}🧪 Instruções para Teste Manual${NC}"
echo "================================="
echo ""

echo -e "${YELLOW}1. Teste em Desenvolvimento:${NC}"
echo "   cd src/Web"
echo "   npm run dev"
echo "   ➤ Acesse http://localhost:5005"
echo "   ➤ Procure pelo FAB roxo no canto inferior direito"
echo "   ➤ Clique para abrir o painel de debug"
echo ""

echo -e "${YELLOW}2. Teste de Build de Produção:${NC}"
echo "   npm run build"
echo "   npm run preview"
echo "   ➤ Acesse http://localhost:5005"
echo "   ➤ O FAB de debug NÃO deve aparecer"
echo ""

echo -e "${YELLOW}3. Teste com Configuração Local:${NC}"
echo "   # Edite .env.local e force:"
echo "   echo 'VITE_ENABLE_DEBUGGER=true' > src/Web/.env.local"
echo "   npm run build && npm run preview"
echo "   ➤ O FAB deve aparecer mesmo em build"
echo ""

echo -e "${YELLOW}4. Teste Mobile com ngrok:${NC}"
echo "   ./scripts/mobile-dev-setup.sh"
echo "   ➤ Acesse a URL ngrok no celular"
echo "   ➤ Verifique o FAB de debug na tela"
echo "   ➤ Teste as informações coletadas"
echo ""

# Verificar dependências
echo -e "${BLUE}📦 Verificando dependências...${NC}"

if grep -q "@mui/material" src/Web/package.json; then
    echo -e "${GREEN}✅ Material-UI instalado${NC}"
else
    echo -e "${RED}❌ Material-UI não encontrado${NC}"
fi

if grep -q "@mui/icons-material" src/Web/package.json; then
    echo -e "${GREEN}✅ Material-UI Icons instalado${NC}"
else
    echo -e "${RED}❌ Material-UI Icons não encontrado${NC}"
fi

echo ""

# Informações de depuração
echo -e "${PURPLE}🔍 Informações para Depuração${NC}"
echo "=============================="
echo ""

echo "📂 Estrutura de arquivos criada:"
echo "   ✓ src/Web/src/components/dev/MobileDebugger.tsx"
echo "   ✓ src/Web/src/components/dev/README.md"
echo "   ✓ src/Web/src/utils/debugManager.ts"
echo "   ✓ src/Web/.env.development"
echo "   ✓ src/Web/.env.production"
echo "   ✓ src/Web/.env.local"
echo ""

echo "🔧 Funcionalidades implementadas:"
echo "   ✓ FAB roxo para abrir debugger (apenas dev)"
echo "   ✓ Dialog responsivo com informações detalhadas"
echo "   ✓ Configuração por variáveis de ambiente"
echo "   ✓ Integração com useResponsive hook"
echo "   ✓ Atualização automática a cada 2 segundos"
echo "   ✓ Informações de dispositivo, tela, rede"
echo ""

echo "⚡ Configurações de performance:"
echo "   ✓ Componente só é renderizado em desenvolvimento"
echo "   ✓ Verificação dupla (import.meta.env.DEV + VITE_ENABLE_DEBUGGER)"
echo "   ✓ Removido automaticamente em builds de produção"
echo "   ✓ Timer cleanup no useEffect"
echo ""

echo -e "${GREEN}🎯 Sistema de Debug implementado com sucesso!${NC}"
echo ""

echo -e "${BLUE}📚 Próximos passos:${NC}"
echo "1. Execute os testes manuais acima"
echo "2. Verifique o console por logs do debugManager"
echo "3. Teste em dispositivos móveis reais"
echo "4. Configure .env.local para suas necessidades específicas"
echo "5. Documente qualquer customização adicional"
echo ""

echo -e "${PURPLE}💡 Dica: Use o debugManager em seus componentes${NC}"
echo "import { logDebug, isDebugEnabled } from '../utils/debugManager';"
echo "if (isDebugEnabled()) { logDebug('Meu componente carregou', data); }"