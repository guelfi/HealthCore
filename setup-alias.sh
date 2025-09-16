#!/bin/bash

# Script para criar alias permanente no WSL
# Execute uma vez: bash setup-alias.sh

echo "🔧 Configurando alias para HealthCore..."

# Adicionar alias ao .bashrc se não existir
if ! grep -q "alias healthcore" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# HealthCore - Alias para carregar contexto do projeto" >> ~/.bashrc
    echo "alias healthcore='cd /mnt/c/Users/SP-MGUELFI/Projetos/HealthCore && bash iniciar-sessao-healthcore.sh'" >> ~/.bashrc
    echo "alias hc='cd /mnt/c/Users/SP-MGUELFI/Projetos/HealthCore && bash iniciar-sessao-healthcore.sh'" >> ~/.bashrc
    echo ""
    echo "✅ Aliases criados:"
    echo "   - healthcore (vai para o projeto e carrega contexto)"
    echo "   - hc (versão curta)"
    echo ""
    echo "🔄 Para usar agora, execute:"
    echo "   source ~/.bashrc"
    echo ""
    echo "🚀 Depois disso, basta digitar 'healthcore' ou 'hc' em qualquer lugar!"
else
    echo "✅ Alias já existe no .bashrc"
fi