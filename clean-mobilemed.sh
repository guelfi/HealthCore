#!/bin/bash
echo "🔄 Limpeza MobileMed → HealthCore"
echo "================================="

count=0

# Função simples de substituição
fix_file() {
    if [ -f "$1" ]; then
        if grep -q "MobileMed\|mobilemed" "$1" 2>/dev/null; then
            sed -i 's/MobileMed\.Api/HealthCore.Api/g' "$1"
            sed -i 's/MobileMedDbContext/HealthCoreDbContext/g' "$1"
            sed -i 's/MobileMed/HealthCore/g' "$1"
            sed -i 's/mobilemed/healthcore/g' "$1"
            echo "✓ Fixed: $1"
            ((count++))
        fi
    fi
}

# Arquivos críticos de teste
echo "📁 Fixing test files..."
fix_file "tests/Api.Tests/ExameServiceTests.cs"
fix_file "tests/Api.Tests/AdminServiceTests.cs"
fix_file "tests/Api.Tests/UserServiceTests.cs"
fix_file "tests/Api.Tests/UnitTest1.cs"
fix_file "tests/Api.Tests/MockDbSet.cs"

# DTOs e Program.cs
echo "📁 Fixing core files..."
fix_file "src/Api/Core/Application/DTOs/LoginResponseDto.cs"
fix_file "src/Api/Core/Application/DTOs/CompletarMedicoDto.cs"
fix_file "src/Api/Program.cs"

# Arquivos de configuração
echo "⚙️ Fixing config files..."
fix_file "src/Web/.env.distributed"
fix_file "src/Web/.env.ngrok"
fix_file "src/Web/.env.ngrok.example"
fix_file "src/Web/.env.local.backup"
fix_file "src/Web/.env.local.bak"
fix_file "postman/HealthCore_Environment.json"
fix_file "postman/HealthCore_Collection.json"
fix_file ".vscode/launch.json"
fix_file ".vscode/tasks.json"

# README e docs principais
echo "📚 Fixing documentation..."
fix_file "src/Web/README.md"
fix_file "README.md"
fix_file "docs/health-endpoint-spec.md"
fix_file "docs/network_config.md"
fix_file "docs/lgpd_readme.md"
fix_file "docs/architecture.md"
fix_file "docs/test-plan.md"
fix_file "docs/testing_guide.md"
fix_file "src/Web/TEST_PLAN.md"

# Outros arquivos importantes
echo "🔧 Fixing other files..."
fix_file "src/Api/HealthCore.Api.http"
fix_file ".dockerignore"
fix_file "nginx/healthcore.conf"

# Scripts em massa
echo "🛠️ Fixing scripts..."
find scripts/ -name "*.sh" 2>/dev/null | while read file; do
    fix_file "$file"
done

find scripts/ -name "*.bat" 2>/dev/null | while read file; do
    fix_file "$file"
done

echo ""
echo "🎉 Limpeza concluída!"
echo "📊 Arquivos processados: $count"

# Verificação final
remaining=$(find . -type f \( -name "*.cs" -o -name "*.md" -o -name "*.json" -o -name "*.sh" -o -name "*.js" -o -name "*.env*" \) -exec grep -l "MobileMed\|mobilemed" {} \; 2>/dev/null | wc -l)

if [ "$remaining" -eq 0 ]; then
    echo "✅ Nenhuma referência restante!"
else
    echo "⚠️  Ainda restam $remaining arquivos"
fi