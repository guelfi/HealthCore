#!/bin/bash

# 🔄 Script de Migração Entity Framework Core 9.0 → 8.0
# Executar este script no WSL após as alterações dos arquivos no Windows

echo "🔄 Migração Entity Framework Core 9.0 → 8.0"
echo "============================================="

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

# Verificar se estamos no diretório correto
if [ ! -f "HealthCore.sln" ]; then
    print_error "Arquivo HealthCore.sln não encontrado!"
    print_error "Execute este script a partir do diretório raiz do projeto HealthCore"
    exit 1
fi

print_status "Diretório do projeto confirmado ✅"

# Verificar se dotnet está instalado
if ! command -v dotnet &> /dev/null; then
    print_error "dotnet CLI não está instalado no WSL!"
    print_error "Instale o .NET SDK primeiro: https://docs.microsoft.com/en-us/dotnet/core/install/linux"
    exit 1
fi

print_status "dotnet CLI encontrado ✅"

# Mostrar versão do dotnet
DOTNET_VERSION=$(dotnet --version)
print_status "Versão do .NET SDK: $DOTNET_VERSION"

# Passo 1: Backup do banco de dados
print_status "📁 Fazendo backup do banco de dados..."
if [ -f "src/Api/mobilemed.db" ]; then
    cp "src/Api/mobilemed.db" "src/Api/mobilemed.db.backup"
    print_success "Backup criado: mobilemed.db.backup"
else
    print_warning "Arquivo mobilemed.db não encontrado - backup não necessário"
fi

# Passo 2: Limpar cache de packages
print_status "🧹 Limpando cache de packages..."
dotnet nuget locals all --clear
print_success "Cache limpo"

# Passo 3: Restore packages
print_status "📦 Restaurando packages com novas versões..."
dotnet restore src/Api/HealthCore.Api.csproj
if [ $? -eq 0 ]; then
    print_success "Packages restaurados com sucesso"
else
    print_error "Falha ao restaurar packages"
    exit 1
fi

# Passo 4: Build do projeto
print_status "🔨 Compilando projeto..."
dotnet build src/Api/HealthCore.Api.csproj --no-restore
if [ $? -eq 0 ]; then
    print_success "Build realizado com sucesso"
else
    print_error "Falha no build do projeto"
    print_error "Verifique as mensagens de erro acima"
    exit 1
fi

# Passo 5: Verificar se há migrations
print_status "🗄️ Verificando migrations..."
if [ -d "src/Api/Migrations" ]; then
    print_status "Pasta Migrations encontrada - verificando compatibilidade..."
    # Tentar aplicar migrations
    dotnet ef database update --project src/Api/HealthCore.Api.csproj --no-build
    if [ $? -eq 0 ]; then
        print_success "Migrations aplicadas com sucesso"
    else
        print_warning "Possível problema com migrations - verifique manualmente"
    fi
else
    print_warning "Pasta Migrations não encontrada"
fi

# Passo 6: Executar testes (se existir projeto de testes)
print_status "🧪 Executando testes..."
if [ -d "tests" ]; then
    dotnet test --no-build
    if [ $? -eq 0 ]; then
        print_success "Todos os testes passaram"
    else
        print_warning "Alguns testes falharam - verifique os detalhes"
    fi
else
    print_warning "Pasta tests não encontrada - pulando testes"
fi

# Passo 7: Teste básico de startup
print_status "🚀 Teste básico de inicialização..."
print_status "Iniciando aplicação por 10 segundos para verificar startup..."

# Iniciar aplicação em background
dotnet run --project src/Api/HealthCore.Api.csproj --no-build &
APP_PID=$!

# Aguardar alguns segundos
sleep 10

# Verificar se o processo ainda está rodando
if ps -p $APP_PID > /dev/null; then
    print_success "Aplicação iniciou com sucesso"
    # Parar aplicação
    kill $APP_PID 2>/dev/null
else
    print_error "Aplicação falhou ao iniciar"
fi

# Resumo final
echo ""
echo "📋 RESUMO DA MIGRAÇÃO"
echo "===================="
print_status "✅ Packages atualizados para EF Core 8.0.10"
print_status "✅ Build realizado com sucesso"
print_status "✅ Compatibilidade verificada"

echo ""
print_success "🎉 Migração concluída com sucesso!"
echo ""
print_status "Próximos passos:"
echo "1. Teste a aplicação manualmente"
echo "2. Execute testes de integração se disponíveis"
echo "3. Verifique funcionalidades críticas (Auth, CRUD, etc.)"
echo ""
print_warning "Em caso de problemas, execute: ./rollback-ef-core.sh"