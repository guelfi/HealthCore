# 🔧 Comandos Diretos - Limpeza MobileMed → HealthCore

## 📋 **Instruções para WSL**

Copie e cole cada bloco de comandos no terminal WSL, um bloco por vez.

### **1. Navegação e Preparação**
```bash
# Ir para o diretório do projeto
cd /mnt/c/Users/SP-MGUELFI/Projetos/HealthCore

# Verificar localização atual
pwd
ls HealthCore.sln

# Verificar quantas referências existem antes
echo "🔍 Referências antes da limpeza:"
find . -type f \( -name "*.cs" -o -name "*.md" -o -name "*.json" -o -name "*.env*" -o -name "*.sh" -o -name "*.js" \) -exec grep -l "MobileMed\|mobilemed" {} \; 2>/dev/null | wc -l
```

### **2. Arquivos de Teste C# (Críticos)**
```bash
echo "📁 Processando arquivos de teste..."

# ExameServiceTests.cs
sed -i 's/MobileMed\.Api/HealthCore.Api/g' tests/Api.Tests/ExameServiceTests.cs
sed -i 's/MobileMedDbContext/HealthCoreDbContext/g' tests/Api.Tests/ExameServiceTests.cs
sed -i 's/MobileMed/HealthCore/g' tests/Api.Tests/ExameServiceTests.cs
echo "✓ ExameServiceTests.cs"

# AdminServiceTests.cs  
sed -i 's/MobileMed\.Api/HealthCore.Api/g' tests/Api.Tests/AdminServiceTests.cs
sed -i 's/MobileMedDbContext/HealthCoreDbContext/g' tests/Api.Tests/AdminServiceTests.cs
sed -i 's/MobileMed/HealthCore/g' tests/Api.Tests/AdminServiceTests.cs
echo "✓ AdminServiceTests.cs"

# UserServiceTests.cs
sed -i 's/MobileMed\.Api/HealthCore.Api/g' tests/Api.Tests/UserServiceTests.cs
sed -i 's/MobileMedDbContext/HealthCoreDbContext/g' tests/Api.Tests/UserServiceTests.cs
sed -i 's/MobileMed/HealthCore/g' tests/Api.Tests/UserServiceTests.cs
echo "✓ UserServiceTests.cs"

# UnitTest1.cs
sed -i 's/MobileMed/HealthCore/g' tests/Api.Tests/UnitTest1.cs
echo "✓ UnitTest1.cs"

# MockDbSet.cs
sed -i 's/MobileMed\.Api/HealthCore.Api/g' tests/Api.Tests/MockDbSet.cs
sed -i 's/MobileMed/HealthCore/g' tests/Api.Tests/MockDbSet.cs
echo "✓ MockDbSet.cs"
```

### **3. DTOs e Arquivos Core**
```bash
echo "📁 Processando arquivos core..."

# LoginResponseDto.cs
sed -i 's/MobileMed/HealthCore/g' src/Api/Core/Application/DTOs/LoginResponseDto.cs
echo "✓ LoginResponseDto.cs"

# CompletarMedicoDto.cs
sed -i 's/MobileMed/HealthCore/g' src/Api/Core/Application/DTOs/CompletarMedicoDto.cs
echo "✓ CompletarMedicoDto.cs"

# Program.cs
sed -i 's/MobileMed/HealthCore/g' src/Api/Program.cs
echo "✓ Program.cs"
```

### **4. Arquivos de Configuração**
```bash
echo "⚙️ Processando configurações..."

# Arquivos .env
sed -i 's/MobileMed/HealthCore/g' src/Web/.env.distributed 2>/dev/null || echo "⚠️ .env.distributed not found"
sed -i 's/mobilemed/healthcore/g' src/Web/.env.distributed 2>/dev/null || echo "⚠️ .env.distributed not found"

sed -i 's/MobileMed/HealthCore/g' src/Web/.env.ngrok 2>/dev/null || echo "⚠️ .env.ngrok not found"
sed -i 's/mobilemed/healthcore/g' src/Web/.env.ngrok 2>/dev/null || echo "⚠️ .env.ngrok not found"

sed -i 's/mobilemed/healthcore/g' src/Web/.env.ngrok.example 2>/dev/null || echo "⚠️ .env.ngrok.example not found"

sed -i 's/mobilemed/healthcore/g' src/Web/.env.local.backup 2>/dev/null || echo "⚠️ .env.local.backup not found"

sed -i 's/mobilemed/healthcore/g' src/Web/.env.local.bak 2>/dev/null || echo "⚠️ .env.local.bak not found"

echo "✓ Arquivos .env processados"
```

### **5. Arquivos JSON e VS Code**
```bash
echo "📄 Processando JSON e VS Code..."

# Postman
sed -i 's/MobileMed/HealthCore/g' postman/HealthCore_Environment.json 2>/dev/null || echo "⚠️ Environment.json not found"
sed -i 's/MobileMed/HealthCore/g' postman/HealthCore_Collection.json 2>/dev/null || echo "⚠️ Collection.json not found"
sed -i 's/mobilemed/healthcore/g' postman/HealthCore_Collection.json 2>/dev/null || echo "⚠️ Collection.json not found"

# VS Code
sed -i 's/MobileMed/HealthCore/g' .vscode/launch.json 2>/dev/null || echo "⚠️ launch.json not found"
sed -i 's/MobileMed/HealthCore/g' .vscode/tasks.json 2>/dev/null || echo "⚠️ tasks.json not found"

echo "✓ JSON files processados"
```

### **6. Documentação Principal**
```bash
echo "📚 Processando documentação..."

# README files
sed -i 's/MobileMed/HealthCore/g' README.md 2>/dev/null || echo "⚠️ README.md not found"
sed -i 's/MobileMed/HealthCore/g' src/Web/README.md 2>/dev/null || echo "⚠️ Web README.md not found"
sed -i 's/mobilemed/healthcore/g' src/Web/README.md 2>/dev/null || echo "⚠️ Web README.md not found"

# Docs críticos
sed -i 's/MobileMed/HealthCore/g' docs/health-endpoint-spec.md 2>/dev/null || echo "⚠️ health-endpoint-spec.md not found"
sed -i 's/MobileMed/HealthCore/g' docs/network_config.md 2>/dev/null || echo "⚠️ network_config.md not found"
sed -i 's/mobilemed/healthcore/g' docs/network_config.md 2>/dev/null || echo "⚠️ network_config.md not found"

sed -i 's/MobileMed/HealthCore/g' docs/lgpd_readme.md 2>/dev/null || echo "⚠️ lgpd_readme.md not found"
sed -i 's/mobilemed/healthcore/g' docs/lgpd_readme.md 2>/dev/null || echo "⚠️ lgpd_readme.md not found"

sed -i 's/MobileMed/HealthCore/g' docs/architecture.md 2>/dev/null || echo "⚠️ architecture.md not found"

# Test plans
sed -i 's/MobileMed/HealthCore/g' docs/test-plan.md 2>/dev/null || echo "⚠️ test-plan.md not found"
sed -i 's/MobileMed/HealthCore/g' docs/testing_guide.md 2>/dev/null || echo "⚠️ testing_guide.md not found"
sed -i 's/MobileMed/HealthCore/g' src/Web/TEST_PLAN.md 2>/dev/null || echo "⚠️ Web TEST_PLAN.md not found"

echo "✓ Documentação processada"
```

### **7. Outros Arquivos Importantes**
```bash
echo "🔧 Processando arquivos diversos..."

# API HTTP file
sed -i 's/MobileMed/HealthCore/g' src/Api/HealthCore.Api.http 2>/dev/null || echo "⚠️ HealthCore.Api.http not found"
sed -i 's/mobilemed/healthcore/g' src/Api/HealthCore.Api.http 2>/dev/null || echo "⚠️ HealthCore.Api.http not found"

# Dockerignore  
sed -i 's/mobilemed/healthcore/g' .dockerignore 2>/dev/null || echo "⚠️ .dockerignore not found"

# Nginx config
sed -i 's/mobilemed/healthcore/g' nginx/healthcore.conf 2>/dev/null || echo "⚠️ nginx config not found"

echo "✓ Arquivos diversos processados"
```

### **8. Scripts de Automação (Em Massa)**
```bash
echo "🛠️ Processando scripts..."

# Scripts .sh
find scripts/ -name "*.sh" -type f 2>/dev/null | while read file; do
    sed -i 's/MobileMed/HealthCore/g' "$file" 2>/dev/null
    sed -i 's/mobilemed/healthcore/g' "$file" 2>/dev/null
    echo "✓ $file"
done

# Scripts .bat  
find scripts/ -name "*.bat" -type f 2>/dev/null | while read file; do
    sed -i 's/MobileMed/HealthCore/g' "$file" 2>/dev/null
    sed -i 's/mobilemed/healthcore/g' "$file" 2>/dev/null
    echo "✓ $file"
done

# Scripts .js
find scripts/ -name "*.js" -type f 2>/dev/null | while read file; do
    sed -i 's/mobilemed/healthcore/g' "$file" 2>/dev/null
    echo "✓ $file"
done

echo "✓ Scripts processados"
```

### **9. Verificação Final**
```bash
echo ""
echo "🎉 Limpeza concluída!"
echo "==================="

# Contar referências restantes
echo "🔍 Verificando referências restantes..."
remaining=$(find . -type f \( -name "*.cs" -o -name "*.md" -o -name "*.json" -o -name "*.sh" -o -name "*.js" -o -name "*.env*" \) -exec grep -l "MobileMed\|mobilemed" {} \; 2>/dev/null | wc -l)

echo "📊 Referências restantes: $remaining"

if [ "$remaining" -eq 0 ]; then
    echo "✅ SUCESSO: Nenhuma referência MobileMed encontrada!"
else
    echo "⚠️  Ainda existem $remaining arquivos com referências"
    echo "📋 Lista dos arquivos restantes:"
    find . -type f \( -name "*.cs" -o -name "*.md" -o -name "*.json" -o -name "*.sh" -o -name "*.js" -o -name "*.env*" \) -exec grep -l "MobileMed\|mobilemed" {} \; 2>/dev/null
fi

echo ""
echo "📋 Próximo passo: Testar se a aplicação ainda funciona"
echo "dotnet build src/Api/HealthCore.Api.csproj"
```

---

## 📋 **RESUMO DE EXECUÇÃO**

1. **Copie cada bloco** numerado acima
2. **Cole no terminal WSL** um bloco por vez
3. **Aguarde** a conclusão de cada bloco
4. **Observe** as mensagens de confirmação (✓)
5. **Verifique** o resultado final

### **Resultado Esperado:**
- ✅ **0 referências** MobileMed restantes
- ✅ **Todos os arquivos** processados com sucesso
- ✅ **Aplicação** ainda funcional após alterações

### **Em caso de problemas:**
- Alguns arquivos podem não existir (mensagem ⚠️)
- Isso é normal e não afeta o resultado
- Continue executando os próximos blocos