#!/bin/bash

# 🧪 Script de Teste Mobile - HealthCore
# Testa as melhorias implementadas via ngrok

set -e

# Cores
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
RED='\\033[0;31m'
PURPLE='\\033[0;35m'
NC='\\033[0m'

echo -e \"${PURPLE}🧪 HealthCore - Teste Mobile UI/UX${NC}\"
echo \"======================================\"
echo \"\"

# Verificar se os serviços estão rodando
echo -e \"${BLUE}🔍 Verificando serviços...${NC}\"

# Verificar frontend
if curl -s http://localhost:5005 > /dev/null 2>&1; then
    echo -e \"${GREEN}✅ Frontend rodando (localhost:5005)${NC}\"
else
    echo -e \"${RED}❌ Frontend não está rodando${NC}\"
    echo -e \"${YELLOW}💡 Execute: cd src/Web && npm run dev${NC}\"
    exit 1
fi

# Verificar ngrok
NGROK_URL=\"\"
if curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^\"]*\\.ngrok[^\"]*' | head -1)
    if [ ! -z \"$NGROK_URL\" ]; then
        echo -e \"${GREEN}✅ ngrok ativo: $NGROK_URL${NC}\"
    else
        echo -e \"${YELLOW}⚠️  ngrok dashboard ativo mas sem túneis${NC}\"
    fi
else
    echo -e \"${YELLOW}⚠️  ngrok não está ativo${NC}\"
fi

echo \"\"
echo -e \"${PURPLE}📱 Checklist de Testes Mobile${NC}\"
echo \"================================\"
echo \"\"

echo -e \"${BLUE}🔧 1. TABELAS RESPONSIVAS${NC}\"
echo \"   ➤ Abrir página Pacientes\"
echo \"   ➤ Verificar scroll horizontal em mobile\"
echo \"   ➤ Testar indicadores de scroll\"
echo \"   ➤ Validar ícones maiores (touch-friendly)\"
echo \"   ➤ Conferir altura das linhas (48px)\"
echo \"\"

echo -e \"${BLUE}🔧 2. DIALOGS MOBILE${NC}\"
echo \"   ➤ Abrir dialog de adicionar paciente\"
echo \"   ➤ Verificar se usa bottom sheet em mobile\"
echo \"   ➤ Testar campos touch-friendly\"
echo \"   ➤ Validar botões com área mínima 48px\"
echo \"   ➤ Testar swipe to close (se implementado)\"
echo \"\"

echo -e \"${BLUE}🔧 3. NAVEGAÇÃO MOBILE${NC}\"
echo \"   ➤ Testar menu hambúrguer\"
echo \"   ➤ Verificar transições suaves\"
echo \"   ➤ Validar área de toque adequada\"
echo \"   ➤ Testar fechamento por toque fora\"
echo \"\"

echo -e \"${BLUE}🔧 4. PERFORMANCE${NC}\"
echo \"   ➤ Verificar tempo de carregamento < 3s\"
echo \"   ➤ Testar animações fluidas 60fps\"
echo \"   ➤ Validar responsividade em diferentes resoluções\"
echo \"   ➤ Conferir uso de memória\"
echo \"\"

echo -e \"${BLUE}🔧 5. DISPOSITIVOS REAIS${NC}\"
echo \"   ➤ iPhone (Safari)\"
echo \"   ➤ Android (Chrome)\"
echo \"   ➤ Tablet (landscape/portrait)\"
echo \"   ➤ Diferentes tamanhos de tela\"
echo \"\"

# URLs para teste
echo -e \"${PURPLE}🔗 URLs para Teste${NC}\"
echo \"==================\"
if [ ! -z \"$NGROK_URL\" ]; then
    echo -e \"   📱 Mobile (ngrok): ${GREEN}$NGROK_URL${NC}\"
    echo -e \"   🏠 Local: ${GREEN}http://localhost:5005${NC}\"
    echo -e \"   🐛 Debug Mobile: ${GREEN}$NGROK_URL${NC} (FAB no canto)\"
else
    echo -e \"   🏠 Local: ${GREEN}http://localhost:5005${NC}\"
    echo -e \"   ⚠️  Para acesso mobile, configure ngrok primeiro\"
fi
echo \"\"

# Gerar QR code se disponível
if [ ! -z \"$NGROK_URL\" ] && command -v qrencode &> /dev/null; then
    echo -e \"${BLUE}📱 QR Code para acesso rápido:${NC}\"
    echo \"$NGROK_URL\" | qrencode -t ANSI
    echo \"\"
fi

echo -e \"${PURPLE}💡 Instruções de Teste${NC}\"
echo \"=======================\"
echo \"1. Acesse a URL ngrok no seu celular\"
echo \"2. Abra o Debug Mobile (botão roxo no canto)\"
echo \"3. Verifique informações do dispositivo\"
echo \"4. Navegue pelas páginas testando cada funcionalidade\"
echo \"5. Reporte problemas encontrados\"
echo \"\"

echo -e \"${GREEN}🎯 Pronto para testar!${NC}\"
echo -e \"${YELLOW}💡 Mantenha este terminal aberto para acompanhar logs${NC}\"