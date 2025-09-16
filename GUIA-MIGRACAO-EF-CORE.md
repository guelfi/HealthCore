# 🔄 Guia de Migração EF Core - Ambiente Corporativo

## 📋 Situação Atual
- **Windows**: Ambiente corporativo com restrições de PowerShell e dotnet CLI
- **Usuário**: Não-administrador 
- **Solução**: WSL para execução dos comandos dotnet
- **Alterações**: Realizadas via este terminal no Windows

---

## ✅ **ETAPA 1: ALTERAÇÕES REALIZADAS (CONCLUÍDA)**

As seguintes alterações já foram feitas automaticamente no arquivo `src/Api/HealthCore.Api.csproj`:

### **Versões Atualizadas:**
```xml
<!-- DE: -->
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.8" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="9.0.8" />
<PackageReference Include="Microsoft.Extensions.Caching.Memory" Version="9.0.8" />

<!-- PARA: -->
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.10" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.0.10" />
<PackageReference Include="Microsoft.Extensions.Caching.Memory" Version="8.0.1" />
```

✅ **Status**: Alterações de arquivos concluídas!

---

## 🐧 **ETAPA 2: EXECUÇÃO NO WSL**

### **Pré-requisitos no WSL:**
1. **.NET SDK 8.0** instalado
2. **Git** disponível (recomendado)
3. **Acesso** ao diretório do projeto via `/mnt/c/Users/SP-MGUELFI/Projetos/HealthCore`

### **Comandos para executar no WSL:**

```bash
# 1. Navegar para o projeto
cd /mnt/c/Users/SP-MGUELFI/Projetos/HealthCore

# 2. Verificar se .NET está instalado
dotnet --version

# 3. Dar permissão de execução aos scripts
chmod +x migrate-ef-core.sh
chmod +x rollback-ef-core.sh

# 4. Executar migração
./migrate-ef-core.sh
```

---

## 📋 **ETAPA 3: SCRIPTS CRIADOS**

### **1. Script Principal: `migrate-ef-core.sh`**
- ✅ Verifica pré-requisitos
- ✅ Faz backup do banco SQLite
- ✅ Limpa cache de packages
- ✅ Restaura packages com novas versões
- ✅ Compila projeto
- ✅ Verifica migrations
- ✅ Executa testes
- ✅ Teste básico de startup

### **2. Script de Rollback: `rollback-ef-core.sh`**
- ✅ Restaura banco de dados do backup
- ✅ Reverte alterações no .csproj (via Git)
- ✅ Limpa cache
- ✅ Restaura packages originais

---

## 🚀 **PROCESSO COMPLETO DE EXECUÇÃO**

### **No Windows (já feito):**
1. ✅ Alterações nos arquivos `.csproj` realizadas
2. ✅ Scripts bash criados

### **No WSL (próximos passos):**

#### **1. Preparação:**
```bash
# Navegar para o projeto
cd /mnt/c/Users/SP-MGUELFI/Projetos/HealthCore

# Verificar .NET
dotnet --version
# Deve mostrar 8.x.x

# Dar permissão aos scripts
chmod +x migrate-ef-core.sh rollback-ef-core.sh
```

#### **2. Execução da Migração:**
```bash
# Executar script de migração
./migrate-ef-core.sh
```

#### **3. Em caso de problemas:**
```bash
# Executar rollback
./rollback-ef-core.sh
```

---

## 🔍 **VALIDAÇÕES PÓS-MIGRAÇÃO**

### **Testes Automáticos (incluídos no script):**
- [ ] Build sem erros
- [ ] Migrations funcionando
- [ ] Startup da aplicação
- [ ] Testes unitários (se existirem)

### **Testes Manuais Recomendados:**
1. **Autenticação**: Teste de login/JWT
2. **CRUD Pacientes**: Criar, listar, editar, excluir
3. **CRUD Exames**: Especialmente idempotência
4. **Health Checks**: Verificar endpoint `/health`
5. **API Documentation**: Acessar Swagger

### **Comandos de Teste Manual no WSL:**
```bash
# Iniciar aplicação
cd /mnt/c/Users/SP-MGUELFI/Projetos/HealthCore
dotnet run --project src/Api/HealthCore.Api.csproj

# Em outro terminal WSL - testar endpoints
curl http://localhost:5000/health
curl http://localhost:5000/swagger
```

---

## 📊 **BENEFÍCIOS DA MIGRAÇÃO**

### **Antes (EF Core 9.0 + .NET 8.0):**
- ⚠️ Incompatibilidade de versões
- ⚠️ Possíveis problemas de estabilidade
- ⚠️ Documentação fragmentada

### **Depois (EF Core 8.0 + .NET 8.0):**
- ✅ Alinhamento total de versões
- ✅ Maior estabilidade
- ✅ Suporte LTS até 2026
- ✅ Melhor compatibilidade

---

## 🆘 **SOLUÇÃO DE PROBLEMAS**

### **Problema: "dotnet não encontrado" no WSL**
```bash
# Instalar .NET SDK no WSL
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y dotnet-sdk-8.0
```

### **Problema: "Permissão negada" nos scripts**
```bash
chmod +x migrate-ef-core.sh rollback-ef-core.sh
```

### **Problema: Build falha**
```bash
# Limpar tudo e tentar novamente
dotnet clean src/Api/HealthCore.Api.csproj
dotnet nuget locals all --clear
dotnet restore src/Api/HealthCore.Api.csproj
dotnet build src/Api/HealthCore.Api.csproj
```

### **Problema: Migrations falham**
```bash
# Verificar se existem migrations
ls src/Api/Migrations/

# Tentar aplicar novamente
dotnet ef database update --project src/Api/HealthCore.Api.csproj
```

---

## 📅 **CRONOGRAMA ESTIMADO**

| Etapa | Tempo | Status |
|-------|-------|--------|
| Alterações arquivo | 5 min | ✅ Concluída |
| Setup WSL | 10 min | ⏳ Pendente |
| Execução script | 15 min | ⏳ Pendente |
| Validações | 10 min | ⏳ Pendente |
| **Total** | **40 min** | - |

---

## 🎯 **PRÓXIMO PASSO**

1. **Abrir WSL** em outro terminal
2. **Navegar** para `/mnt/c/Users/SP-MGUELFI/Projetos/HealthCore`
3. **Executar** `./migrate-ef-core.sh`
4. **Validar** funcionalidades críticas

---

**✅ As alterações nos arquivos estão prontas!**  
**🐧 Agora é só executar no WSL seguindo este guia.**

💡 **Dica**: Mantenha este guia aberto durante a execução para referência rápida.