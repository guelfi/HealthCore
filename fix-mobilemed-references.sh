#!/bin/bash

# 🔄 Script para Migração Completa MobileMed → HealthCore
# Este script substitui todas as referências legadas de forma sistemática

echo "🔄 Iniciando migração completa MobileMed → HealthCore"
echo "===================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Contador de substituições
count=0

# Função para substituir em arquivo
substitute_in_file() {
    local file="$1"
    local search="$2"
    local replace="$3"
    local description="$4"
    
    if [ -f "$file" ]; then
        if grep -q "$search" "$file"; then
            sed -i "s|$search|$replace|g" "$file"
            local changes=$(grep -c "$replace" "$file")
            print_success "✓ $description: $file ($changes alterações)"
            ((count += changes))
        fi
    fi
}

# 1. ARQUIVOS DE CÓDIGO CRÍTICOS (.cs)
print_status "📁 Processando arquivos de código C#..."

# Arquivos de teste
substitute_in_file "tests/Api.Tests/ExameServiceTests.cs" "MobileMed.Api" "HealthCore.Api" "Namespaces em ExameServiceTests"
substitute_in_file "tests/Api.Tests/ExameServiceTests.cs" "MobileMed.Api" "HealthCore.Api" "Contexto em ExameServiceTests"
substitute_in_file "tests/Api.Tests/ExameServiceTests.cs" "MobileMedDbContext" "HealthCoreDbContext" "DbContext em ExameServiceTests"

substitute_in_file "tests/Api.Tests/PacienteServiceTests.cs" "MobileMed.Api" "HealthCore.Api" "Namespaces em PacienteServiceTests"
substitute_in_file "tests/Api.Tests/PacienteServiceTests.cs" "MobileMedDbContext" "HealthCoreDbContext" "DbContext em PacienteServiceTests"

substitute_in_file "tests/Api.Tests/AdminServiceTests.cs" "MobileMed.Api" "HealthCore.Api" "Namespaces em AdminServiceTests"
substitute_in_file "tests/Api.Tests/AdminServiceTests.cs" "MobileMedDbContext" "HealthCoreDbContext" "DbContext em AdminServiceTests"

substitute_in_file "tests/Api.Tests/UserServiceTests.cs" "MobileMed.Api" "HealthCore.Api" "Namespaces em UserServiceTests"
substitute_in_file "tests/Api.Tests/UserServiceTests.cs" "MobileMedDbContext" "HealthCoreDbContext" "DbContext em UserServiceTests"

substitute_in_file "tests/Api.Tests/UnitTest1.cs" "MobileMed" "HealthCore" "Namespace em UnitTest1"

substitute_in_file "tests/Api.Tests/MockDbSet.cs" "MobileMed.Api" "HealthCore.Api" "Namespace em MockDbSet"

# DTOs
substitute_in_file "src/Api/Core/Application/DTOs/LoginResponseDto.cs" "MobileMed" "HealthCore" "Namespace em LoginResponseDto"
substitute_in_file "src/Api/Core/Application/DTOs/CompletarMedicoDto.cs" "MobileMed" "HealthCore" "Namespace em CompletarMedicoDto"

# Program.cs
substitute_in_file "src/Api/Program.cs" "MobileMed" "HealthCore" "Referências em Program.cs"

# 2. ARQUIVOS DE CONFIGURAÇÃO
print_status "⚙️ Processando arquivos de configuração..."

# Arquivos .env
substitute_in_file "src/Web/.env.example" "mobilemed" "healthcore" "URL em .env.example"
substitute_in_file "src/Web/.env.distributed" "MobileMed" "HealthCore" "Titulo em .env.distributed"
substitute_in_file "src/Web/.env.distributed" "mobilemed" "healthcore" "URLs em .env.distributed"
substitute_in_file "src/Web/.env.ngrok" "MobileMed" "HealthCore" "Titulo em .env.ngrok"
substitute_in_file "src/Web/.env.ngrok" "mobilemed" "healthcore" "URLs em .env.ngrok"
substitute_in_file "src/Web/.env.ngrok.example" "mobilemed" "healthcore" "URLs em .env.ngrok.example"
substitute_in_file "src/Web/.env.local.backup" "mobilemed" "healthcore" "URLs em .env.local.backup"
substitute_in_file "src/Web/.env.local.bak" "mobilemed" "healthcore" "URLs em .env.local.bak"

# JSON files
substitute_in_file "postman/HealthCore_Environment.json" "MobileMed" "HealthCore" "Nome em Environment Postman"
substitute_in_file "postman/HealthCore_Collection.json" "MobileMed" "HealthCore" "Nome em Collection Postman"
substitute_in_file "postman/HealthCore_Collection.json" "mobilemed" "healthcore" "URLs em Collection Postman"

# VS Code
substitute_in_file ".vscode/launch.json" "MobileMed" "HealthCore" "Nome em launch.json"
substitute_in_file ".vscode/tasks.json" "MobileMed" "HealthCore" "Nome em tasks.json"

# 3. ARQUIVOS DE DOCUMENTAÇÃO
print_status "📚 Processando documentação..."

# README files
substitute_in_file "src/Web/README.md" "MobileMed" "HealthCore" "Titulo em Web README"
substitute_in_file "src/Web/README.md" "mobilemed" "healthcore" "URLs em Web README"

# Docs principais
substitute_in_file "docs/health-endpoint-spec.md" "MobileMed" "HealthCore" "Referências em health-endpoint-spec"
substitute_in_file "docs/network_config.md" "MobileMed" "HealthCore" "Titulo em network_config"
substitute_in_file "docs/network_config.md" "mobilemed" "healthcore" "URLs em network_config"
substitute_in_file "docs/lgpd_readme.md" "MobileMed" "HealthCore" "Titulo em lgpd_readme"
substitute_in_file "docs/lgpd_readme.md" "mobilemed" "healthcore" "URLs em lgpd_readme"
substitute_in_file "docs/architecture.md" "MobileMed" "HealthCore" "Framework em architecture"
substitute_in_file "docs/melhorias-recomendadas.md" "MobileMed" "HealthCore" "Titulo em melhorias-recomendadas"
substitute_in_file "docs/melhorias-recomendadas.md" "mobilemed" "healthcore" "URLs em melhorias-recomendadas"

# Test plans
substitute_in_file "docs/test-plan.md" "MobileMed" "HealthCore" "Titulo em test-plan"
substitute_in_file "docs/testing_guide.md" "MobileMed" "HealthCore" "Titulo em testing_guide"
substitute_in_file "src/Web/TEST_PLAN.md" "MobileMed" "HealthCore" "Titulo em Web TEST_PLAN"

# Outros docs
substitute_in_file "docs/RequisitosSistema.md" "MobileMed" "HealthCore" "Referencias em RequisitosSistema"
substitute_in_file "docs/tasks.md" "MobileMed" "HealthCore" "Titulo em tasks"
substitute_in_file "docs/scrips_guide.md" "MobileMed" "HealthCore" "Titulo em scrips_guide"
substitute_in_file "docs/ports_config.md" "MobileMed" "HealthCore" "Titulo em ports_config"
substitute_in_file "docs/IntegracaoBackFront.md" "MobileMed" "HealthCore" "Referencias em IntegracaoBackFront"
substitute_in_file "docs/execute.md" "MobileMed" "HealthCore" "Referencias em execute"
substitute_in_file "docs/desenvolvimento-distribuido.md" "MobileMed" "HealthCore" "Referencias em desenvolvimento-distribuido"

# OCI deployment
substitute_in_file "docs/OCI_DEPLOYMENT.md" "MobileMed" "HealthCore" "Referencias em OCI_DEPLOYMENT"
substitute_in_file "docs/OCI_DEPLOYMENT.md" "mobilemed" "healthcore" "URLs em OCI_DEPLOYMENT"
substitute_in_file ".github/OCI_SETUP.md" "MobileMed" "HealthCore" "Referencias em OCI_SETUP"
substitute_in_file ".github/OCI_SETUP.md" "mobilemed" "healthcore" "URLs em OCI_SETUP"

# 4. SCRIPTS E AUTOMAÇÃO
print_status "🛠️ Processando scripts de automação..."

# Scripts principais
find scripts/ -name "*.sh" -exec sed -i 's/MobileMed/HealthCore/g' {} \;
find scripts/ -name "*.sh" -exec sed -i 's/mobilemed/healthcore/g' {} \;
find scripts/ -name "*.bat" -exec sed -i 's/MobileMed/HealthCore/g' {} \;
find scripts/ -name "*.bat" -exec sed -i 's/mobilemed/healthcore/g' {} \;

print_success "✓ Scripts processados em massa"

# Arquivos específicos críticos
substitute_in_file "scripts/testing/test-login.js" "mobilemed" "healthcore" "URL em test-login.js"

# Configurações nginx
substitute_in_file "nginx/healthcore.conf" "mobilemed" "healthcore" "URLs em nginx config"

# 5. OUTROS ARQUIVOS
print_status "🔧 Processando arquivos diversos..."

# API HTTP file
substitute_in_file "src/Api/HealthCore.Api.http" "MobileMed" "HealthCore" "Referencias em API HTTP"
substitute_in_file "src/Api/HealthCore.Api.http" "mobilemed" "healthcore" "URLs em API HTTP"

# README principal
substitute_in_file "README.md" "MobileMed" "HealthCore" "Referencia em README principal"

# Dockerignore
substitute_in_file ".dockerignore" "mobilemed" "healthcore" "Referencia em .dockerignore"

# Limpar arquivos temporários criados neste script
find . -name "*.bak" -delete 2>/dev/null || true

echo ""
print_success "🎉 Migração concluída!"
echo ""
print_status "📊 Estatísticas:"
print_status "Total de substituições realizadas: $count"
echo ""
print_status "🔍 Verificação final (executando grep):"
remaining=$(find . -type f \( -name "*.cs" -o -name "*.md" -o -name "*.json" -o -name "*.sh" -o -name "*.js" -o -name "*.env*" \) -exec grep -l "MobileMed\|mobilemed" {} \; 2>/dev/null | wc -l)

if [ "$remaining" -eq 0 ]; then
    print_success "✅ Nenhuma referência restante encontrada!"
else
    print_warning "⚠️  Ainda existem $remaining arquivos com referências"
    print_status "Execute 'find . -type f -exec grep -l \"MobileMed\\|mobilemed\" {} \\;' para listar"
fi

echo ""
print_status "📋 Próximos passos recomendados:"
echo "1. Testar build da aplicação"
echo "2. Verificar se todos os testes passam"
echo "3. Validar funcionamento da API e Frontend"
echo "4. Fazer commit das alterações"