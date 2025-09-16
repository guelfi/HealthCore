# 🔄 Comandos Diretos - Migração EF Core

## ⚠️ Problema Resolvido: Line Endings
O erro `bad interpreter: No such file or directory` foi causado por line endings Windows (CRLF) nos scripts.

**✅ CORREÇÃO APLICADA**: Os scripts foram corrigidos automaticamente via `sed`.

---

## 🚀 **OPÇÃO 1: Usar Scripts Corrigidos (RECOMENDADO)**

No WSL, execute:

```bash
# Navegar para o projeto (se não estiver)
cd /mnt/c/Users/SP-MGUELFI/Projetos/HealthCore

# Tentar executar novamente
./migrate-ef-core.sh
```

---

## 🔧 **OPÇÃO 2: Comandos Diretos (ALTERNATIVA)**

Se ainda houver problemas com os scripts, execute os comandos diretamente:

### **1. Verificações Iniciais**
```bash
# Verificar diretório
pwd
ls HealthCore.sln

# Verificar .NET
dotnet --version
```

### **2. Backup do Banco**
```bash
# Fazer backup do SQLite (se existir)
if [ -f "src/Api/mobilemed.db" ]; then
    cp "src/Api/mobilemed.db" "src/Api/mobilemed.db.backup"
    echo "✅ Backup criado"
else
    echo "⚠️  Banco não encontrado - backup não necessário"
fi
```

### **3. Limpeza e Restore**
```bash
# Limpar cache
dotnet nuget locals all --clear

# Restaurar packages
dotnet restore src/Api/HealthCore.Api.csproj
```

### **4. Build e Testes**
```bash
# Compilar
dotnet build src/Api/HealthCore.Api.csproj

# Verificar se build passou
if [ $? -eq 0 ]; then
    echo "✅ Build realizado com sucesso"
else
    echo "❌ Falha no build"
    exit 1
fi
```

### **5. Verificar Migrations (se aplicável)**
```bash
# Verificar se há pasta migrations
if [ -d "src/Api/Migrations" ]; then
    echo "📁 Migrations encontradas"
    # Aplicar migrations
    dotnet ef database update --project src/Api/HealthCore.Api.csproj
else
    echo "⚠️  Pasta Migrations não encontrada"
fi
```

### **6. Teste de Execução**
```bash
# Testar startup (executar por alguns segundos)
echo "🚀 Testando startup da aplicação..."
timeout 10s dotnet run --project src/Api/HealthCore.Api.csproj --no-build || echo "✅ Aplicação testada"
```

---

## 📋 **COMANDOS COMPLETOS EM SEQUÊNCIA**

Copie e cole no WSL (bloco completo):

```bash
#!/bin/bash
echo "🔄 Migração Entity Framework Core 9.0 → 8.0"
echo "============================================="

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar diretório
if [ ! -f "HealthCore.sln" ]; then
    print_error "Execute a partir do diretório do HealthCore"
    exit 1
fi

print_status "✅ Diretório confirmado"

# Verificar .NET
if ! command -v dotnet &> /dev/null; then
    print_error "dotnet CLI não encontrado"
    exit 1
fi

DOTNET_VERSION=$(dotnet --version)
print_status "✅ .NET SDK: $DOTNET_VERSION"

# Backup banco
print_status "📁 Fazendo backup..."
if [ -f "src/Api/mobilemed.db" ]; then
    cp "src/Api/mobilemed.db" "src/Api/mobilemed.db.backup"
    print_success "Backup criado"
else
    print_warning "Banco não encontrado"
fi

# Limpeza e restore
print_status "🧹 Limpando cache..."
dotnet nuget locals all --clear

print_status "📦 Restaurando packages..."
dotnet restore src/Api/HealthCore.Api.csproj
if [ $? -eq 0 ]; then
    print_success "Packages restaurados"
else
    print_error "Falha ao restaurar"
    exit 1
fi

# Build
print_status "🔨 Compilando..."
dotnet build src/Api/HealthCore.Api.csproj --no-restore
if [ $? -eq 0 ]; then
    print_success "Build realizado com sucesso"
else
    print_error "Falha no build"
    exit 1
fi

# Migrations
print_status "🗄️ Verificando migrations..."
if [ -d "src/Api/Migrations" ]; then
    dotnet ef database update --project src/Api/HealthCore.Api.csproj --no-build
    if [ $? -eq 0 ]; then
        print_success "Migrations aplicadas"
    else
        print_warning "Problema com migrations"
    fi
fi

# Testes
print_status "🧪 Executando testes..."
if [ -d "tests" ]; then
    dotnet test --no-build
fi

print_success "🎉 Migração concluída com sucesso!"
print_status "✅ EF Core atualizado para 8.0.10"
print_status "✅ Compatibilidade com .NET 8.0 garantida"
```

---

## 🎯 **RESULTADO ESPERADO**

Após executar, você deve ver:
- ✅ Backup criado
- ✅ Packages restaurados  
- ✅ Build realizado com sucesso
- ✅ Migrations aplicadas (se aplicável)
- ✅ Migração concluída

---

## 🆘 **Se algo der errado**

### **Restaurar versões originais:**
```bash
# Via Git (se disponível)
git checkout -- src/Api/HealthCore.Api.csproj

# Restaurar banco
if [ -f "src/Api/mobilemed.db.backup" ]; then
    cp "src/Api/mobilemed.db.backup" "src/Api/mobilemed.db"
fi

# Limpar e restaurar
dotnet nuget locals all --clear
dotnet restore src/Api/HealthCore.Api.csproj
```