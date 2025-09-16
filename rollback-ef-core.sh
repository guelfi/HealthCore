#!/bin/bash

# 🔄 Script de Rollback Entity Framework Core 8.0 → 9.0
# Executar este script no WSL em caso de problemas com a migração

echo "🔄 Rollback Entity Framework Core 8.0 → 9.0"
echo "============================================"

# Definir cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning "⚠️  ATENÇÃO: Este script irá reverter as alterações da migração!"
print_warning "Você tem certeza que deseja continuar? (y/n)"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    print_status "Operação cancelada pelo usuário"
    exit 0
fi

# Verificar se estamos no diretório correto
if [ ! -f "HealthCore.sln" ]; then
    print_error "Arquivo HealthCore.sln não encontrado!"
    print_error "Execute este script a partir do diretório raiz do projeto HealthCore"
    exit 1
fi

print_status "Iniciando processo de rollback..."

# Passo 1: Restaurar banco de dados se backup existe
print_status "📁 Verificando backup do banco de dados..."
if [ -f "src/Api/mobilemed.db.backup" ]; then
    print_status "Restaurando banco de dados do backup..."
    cp "src/Api/mobilemed.db.backup" "src/Api/mobilemed.db"
    print_success "Banco de dados restaurado"
else
    print_warning "Backup do banco não encontrado - pulando restauração"
fi

# Passo 2: Verificar se Git está disponível para rollback
if command -v git &> /dev/null; then
    print_status "🔄 Verificando mudanças no Git..."
    
    # Verificar se há mudanças no arquivo .csproj
    if git diff --quiet HEAD -- src/Api/HealthCore.Api.csproj; then
        print_warning "Nenhuma mudança detectada no .csproj - rollback manual necessário"
    else
        print_status "Revertendo mudanças no .csproj..."
        git checkout -- src/Api/HealthCore.Api.csproj
        print_success "Arquivo .csproj revertido"
    fi
else
    print_error "Git não está disponível - rollback manual necessário"
    print_error "Você precisará restaurar manualmente o arquivo .csproj para as versões:"
    print_error "- Microsoft.EntityFrameworkCore.Design: 9.0.8"
    print_error "- Microsoft.EntityFrameworkCore.Sqlite: 9.0.8"
    print_error "- Microsoft.Extensions.Caching.Memory: 9.0.8"
fi

# Passo 3: Limpar cache e restore packages
print_status "🧹 Limpando cache..."
if command -v dotnet &> /dev/null; then
    dotnet nuget locals all --clear
    
    print_status "📦 Restaurando packages originais..."
    dotnet restore src/Api/HealthCore.Api.csproj
    
    if [ $? -eq 0 ]; then
        print_success "Packages restaurados"
    else
        print_error "Falha ao restaurar packages"
    fi
else
    print_warning "dotnet CLI não disponível - execute manualmente:"
    print_warning "dotnet nuget locals all --clear"
    print_warning "dotnet restore src/Api/HealthCore.Api.csproj"
fi

# Passo 4: Tentar build
if command -v dotnet &> /dev/null; then
    print_status "🔨 Testando build após rollback..."
    dotnet build src/Api/HealthCore.Api.csproj
    
    if [ $? -eq 0 ]; then
        print_success "Build realizado com sucesso após rollback"
    else
        print_error "Build falhou após rollback - verificação manual necessária"
    fi
fi

echo ""
print_success "🎉 Rollback concluído!"
echo ""
print_status "Status após rollback:"
print_status "✅ Banco de dados restaurado (se backup disponível)"
print_status "✅ Arquivo .csproj revertido (se Git disponível)"
print_status "✅ Cache de packages limpo"
echo ""
print_warning "⚠️  Verificações recomendadas:"
echo "1. Confirme que o arquivo .csproj está com as versões EF Core 9.0"
echo "2. Execute 'dotnet restore' se não foi executado automaticamente"
echo "3. Execute 'dotnet build' para confirmar que tudo está funcionando"
echo "4. Teste a aplicação manualmente"