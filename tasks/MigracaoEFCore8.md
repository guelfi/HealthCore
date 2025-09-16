# 🔄 Migração Entity Framework Core 9.0 → 8.0

## 🎯 **Objetivo**
Migrar o Entity Framework Core da versão 9.0.8 para 8.0.x para garantir total compatibilidade com .NET 8.0 e alinhamento de todas as dependências Microsoft.

## ⚠️ **Justificativa**
- **Alinhamento de versões**: EF Core 8.0 é a versão recomendada para .NET 8
- **Estabilidade**: Reduzir riscos de incompatibilidades entre versões
- **Suporte LTS**: EF Core 8.0 terá suporte até novembro de 2026
- **Consistência**: Todas as dependências Microsoft na mesma versão major

## 📋 **Checklist de Migração**

### **Pré-requisitos**
- [ ] ✅ Backup completo do projeto
- [ ] ✅ Backup do banco de dados SQLite
- [ ] ✅ Verificar se existe branch de desenvolvimento ativa
- [ ] ✅ Executar testes antes da migração

### **1. Atualizar Dependências**

#### **Versões Alvo**
```xml
<!-- De (atual) -->
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.8" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="9.0.8" />
<PackageReference Include="Microsoft.Extensions.Caching.Memory" Version="9.0.8" />

<!-- Para (alvo) -->
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.10" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.0.10" />
<PackageReference Include="Microsoft.Extensions.Caching.Memory" Version="8.0.1" />
```

#### **Arquivo a Modificar**
- `src/Api/HealthCore.Api.csproj`

### **2. Verificações de Compatibilidade**

#### **Funcionalidades EF Core 9.0 que podem não existir no 8.0**
- [ ] Verificar uso de novos métodos de query
- [ ] Verificar configurações de modelo específicas do 9.0
- [ ] Verificar migrations que usem recursos exclusivos do 9.0
- [ ] Verificar performance improvements específicos do 9.0

#### **Áreas Críticas para Verificação**
```csharp
// 1. DbContext Configuration
// Verificar se usa alguma configuração específica do EF 9.0

// 2. Query Patterns  
// Verificar se usa novos operators ou métodos do EF 9.0

// 3. Migrations
// Verificar se migrations usam recursos exclusivos do 9.0

// 4. Performance Features
// Verificar uso de AOT compilation features
```

### **3. Processo de Migração**

#### **Passo 1: Preparação**
```powershell
# 1. Criar branch para migração
git checkout -b feature/ef-core-8-migration

# 2. Backup do banco
copy "src\Api\healthcore.db" "src\Api\healthcore.db.backup"

# 3. Verificar build atual
dotnet build src/Api/HealthCore.Api.csproj
```

#### **Passo 2: Atualizar Packages**
```powershell
# Remover packages antigos
dotnet remove src/Api/HealthCore.Api.csproj package Microsoft.EntityFrameworkCore.Design
dotnet remove src/Api/HealthCore.Api.csproj package Microsoft.EntityFrameworkCore.Sqlite
dotnet remove src/Api/HealthCore.Api.csproj package Microsoft.Extensions.Caching.Memory

# Adicionar packages na versão 8.0
dotnet add src/Api/HealthCore.Api.csproj package Microsoft.EntityFrameworkCore.Design --version 8.0.10
dotnet add src/Api/HealthCore.Api.csproj package Microsoft.EntityFrameworkCore.Sqlite --version 8.0.10
dotnet add src/Api/HealthCore.Api.csproj package Microsoft.Extensions.Caching.Memory --version 8.0.1
```

#### **Passo 3: Verificação e Testes**
```powershell
# 1. Restore e build
dotnet restore src/Api/HealthCore.Api.csproj
dotnet build src/Api/HealthCore.Api.csproj

# 2. Verificar migrations
dotnet ef database update --project src/Api/HealthCore.Api.csproj

# 3. Executar testes
dotnet test

# 4. Teste funcional básico
dotnet run --project src/Api/HealthCore.Api.csproj
```

### **4. Validações Pós-Migração**

#### **Funcionalidades Críticas para Testar**
- [ ] **Autenticação JWT**: Login e validação de tokens
- [ ] **CRUD Pacientes**: Create, Read, Update, Delete
- [ ] **CRUD Exames**: Com foco na idempotência
- [ ] **Modalidades DICOM**: Validação de enums
- [ ] **Health Checks**: Verificar se continuam funcionando
- [ ] **Migrations**: Aplicar e reverter migrations

#### **Testes de Performance**
- [ ] Tempo de startup da aplicação
- [ ] Performance de queries principais
- [ ] Uso de memória e cache

### **5. Rollback Plan**

Caso algo dê errado:

```powershell
# 1. Voltar versões originais
git checkout HEAD -- src/Api/HealthCore.Api.csproj

# 2. Restaurar banco
copy "src\Api\healthcore.db.backup" "src\Api\healthcore.db"

# 3. Restore packages
dotnet restore src/Api/HealthCore.Api.csproj
```

## 🔍 **Possíveis Problemas e Soluções**

### **1. Breaking Changes**
```csharp
// Problema: Método não existe no EF 8.0
// Solução: Use alternativas compatíveis ou implemente workaround
```

### **2. Performance Regression**
```csharp
// Problema: Query mais lenta no EF 8.0
// Solução: Otimizar query ou usar raw SQL se necessário
```

### **3. Migration Issues**
```powershell
# Problema: Migration falha
# Solução: Revisar migration file e adaptar para EF 8.0 syntax
```

## 📊 **Impacto Esperado**

### **Positivo** ✅
- Maior estabilidade e compatibilidade
- Alinhamento total com .NET 8.0
- Suporte LTS garantido até 2026
- Melhor troubleshooting (documentação consolidada)

### **Neutral** ⚖️
- Performance similar (diferenças mínimas)
- Funcionalidades existentes mantidas
- Tempo de desenvolvimento não impactado

### **Negativo** ❌
- Possível perda de algumas otimizações do EF 9.0
- Não acesso imediato a novos recursos do EF 9.0
- Trabalho adicional de migração

## ✅ **Critérios de Sucesso**

- [ ] Build sem warnings relacionados ao EF Core
- [ ] Todos os testes passando
- [ ] Aplicação iniciando normalmente
- [ ] Funcionalidades críticas validadas
- [ ] Performance mantida ou melhorada
- [ ] Migrations funcionando corretamente

## 📅 **Cronograma Sugerido**

| Atividade | Tempo Estimado | Responsável |
|-----------|----------------|-------------|
| Preparação e backup | 30 min | Dev |
| Atualização packages | 15 min | Dev |
| Build e correções | 1-2 horas | Dev |
| Testes funcionais | 1 hora | Dev/QA |
| Validação completa | 30 min | Dev/QA |
| **Total** | **3-4 horas** | - |

## 🎯 **Recomendação Final**

**✅ PROCEDER COM A MIGRAÇÃO**

A migração para EF Core 8.0 é **altamente recomendada** pelos seguintes motivos:

1. **Alinhamento arquitetural** com .NET 8.0
2. **Redução de riscos** em produção
3. **Consistência de dependências**
4. **Suporte LTS** até 2026
5. **Baixo risco** de quebra (funcionalidades utilizadas são compatíveis)

---

**Documento criado em**: 15 de Setembro de 2025  
**Status**: 📋 Pronto para execução  
**Aprovação necessária**: ✅ Recomendado proceder