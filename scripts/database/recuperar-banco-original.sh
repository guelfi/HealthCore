#!/bin/bash

# Script para recuperar banco original do commit cafc544
# Execute este script no WSL para recuperar o banco funcional

echo "🔧 HealthCore - Recuperação do Banco Original"
echo "=============================================="

# Verificar se estamos no diretório correto
if [[ ! -f "src/Api/HealthCore.Api.csproj" ]]; then
    echo "❌ Execute este script na raiz do projeto HealthCore"
    exit 1
fi

echo "📍 Verificando commits disponíveis..."
git log --oneline -5

echo ""
echo "🔍 Procurando commit cafc544..."
if git show cafc544 --name-only > /dev/null 2>&1; then
    echo "✅ Commit cafc544 encontrado!"
else
    echo "❌ Commit cafc544 não encontrado"
    echo "📋 Commits disponíveis:"
    git log --oneline -10
    exit 1
fi

echo ""
echo "🗃️ Verificando se banco original existe no commit..."
if git show cafc544 --name-only | grep -q "healthcore.db"; then
    echo "✅ Arquivo healthcore.db encontrado no commit!"
    
    echo ""
    echo "💾 Fazendo backup do banco atual..."
    if [[ -f "src/Api/database/healthcore.db" ]]; then
        cp src/Api/database/healthcore.db src/Api/database/healthcore.db.backup.$(date +%Y%m%d_%H%M%S)
        echo "✅ Backup criado"
    fi
    
    echo ""
    echo "⬇️ Recuperando banco original do commit cafc544..."
    git checkout cafc544 -- src/Api/database/healthcore.db
    
    if [[ $? -eq 0 ]]; then
        echo "✅ Banco recuperado com sucesso!"
        
        echo ""
        echo "📊 Verificando estrutura do banco recuperado..."
        if command -v sqlite3 &> /dev/null; then
            echo "Tabelas encontradas:"
            sqlite3 src/Api/database/healthcore.db ".tables"
            
            echo ""
            echo "Estrutura da tabela Users:"
            sqlite3 src/Api/database/healthcore.db ".schema Users"
            
            echo ""
            echo "Usuários na tabela:"
            sqlite3 src/Api/database/healthcore.db "SELECT Username, Role, IsActive FROM Users;"
        else
            echo "⚠️ sqlite3 não instalado - não foi possível verificar estrutura"
        fi
        
        echo ""
        echo "🚀 Próximos passos:"
        echo "1. Fazer commit e push para atualizar na OCI:"
        echo "   git add src/Api/database/healthcore.db"
        echo "   git commit -m \"fix: restore original working database from commit cafc544\""
        echo "   git push origin main"
        echo ""
        echo "2. Aguardar deploy na OCI (alguns minutos)"
        echo ""
        echo "3. Testar login com usuários existentes no banco original"
        
    else
        echo "❌ Erro ao recuperar banco do commit"
    fi
    
else
    echo "❌ Arquivo healthcore.db não encontrado no commit cafc544"
    echo ""
    echo "🔍 Arquivos no commit:"
    git show cafc544 --name-only
    echo ""
    echo "💡 Talvez o banco esteja em outro local ou commit"
fi

echo ""
echo "📋 Status atual dos arquivos:"
git status --porcelain | grep -E "\.(db|sqlite)"