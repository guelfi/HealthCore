# Guia de Solução de Problemas - Módulo Médicos

## 🎯 Objetivo
Documentação de problemas comuns e suas soluções durante a implementação e validação do módulo de médicos.

## 🚨 Problemas de Migração

### ❌ Problema 1: "dotnet ef não reconhecido"
**Sintoma:**
```bash
dotnet ef migrations add AddMedicoEntity
# Erro: 'dotnet' is not recognized as an internal or external command
```

**Causa:** .NET SDK não instalado ou não está no PATH

**Solução:**
```bash
# Verificar instalação do .NET
dotnet --version

# Se não instalado, baixar do site oficial
# https://dotnet.microsoft.com/download

# Instalar EF Core Tools
dotnet tool install --global dotnet-ef

# Verificar instalação
dotnet ef --version
```

---

### ❌ Problema 2: "No DbContext was found"
**Sintoma:**
```bash
No DbContext was found in assembly 'MobileMed.Api'
```

**Causa:** DbContext não está registrado ou não foi encontrado

**Solução:**
```bash
# Verificar se está no diretório correto
pwd
# Deve estar em: /caminho/para/projeto/src/Api

# Verificar se o projeto compila
dotnet build

# Especificar o contexto explicitamente
dotnet ef migrations add AddMedicoEntity --context MobileMedDbContext
```

---

### ❌ Problema 3: "Migration already exists"
**Sintoma:**
```bash
A migration named 'AddMedicoEntity' already exists
```

**Causa:** Migração com mesmo nome já foi criada

**Solução:**
```bash
# Opção 1: Remover migração existente
dotnet ef migrations remove

# Opção 2: Usar nome diferente
dotnet ef migrations add AddMedicoEntityV2

# Opção 3: Verificar se já foi aplicada
dotnet ef migrations list
```

---

### ❌ Problema 4: "Database is locked"
**Sintoma:**
```bash
SQLite Error 5: 'database is locked'
```

**Causa:** Aplicação ainda está rodando ou conexão não foi fechada

**Solução:**
```bash
# Parar a aplicação
# Ctrl+C no terminal da API

# Verificar processos usando o banco
lsof mobilemed.db

# Forçar fechamento se necessário
kill -9 <PID>

# Tentar novamente
dotnet ef database update
```

## 🔧 Problemas da API

### ❌ Problema 5: "API não inicia"
**Sintoma:**
```bash
dotnet run
# Aplicação falha ao iniciar
```

**Causa:** Erro de compilação ou configuração

**Solução:**
```bash
# Limpar e restaurar
dotnet clean
dotnet restore
dotnet build

# Verificar logs detalhados
dotnet run --verbosity detailed

# Verificar appsettings.json
cat appsettings.json
```

---

### ❌ Problema 6: "Endpoint 404 Not Found"
**Sintoma:**
```bash
curl http://localhost:5000/api/medicos
# 404 Not Found
```

**Causa:** Endpoints não mapeados ou API não está rodando

**Solução:**
```bash
# Verificar se API está rodando
curl http://localhost:5000/health

# Verificar mapeamento no Program.cs
grep -n "medicos" Program.cs

# Verificar porta correta
netstat -an | grep 5000
```

---

### ❌ Problema 7: "Internal Server Error 500"
**Sintoma:**
```bash
curl -X POST http://localhost:5000/api/medicos
# 500 Internal Server Error
```

**Causa:** Erro na lógica do servidor ou banco de dados

**Solução:**
```bash
# Verificar logs da aplicação
tail -f logs/app.log

# Verificar estrutura do banco
sqlite3 mobilemed.db ".schema Medicos"

# Testar com dados mínimos
curl -X POST "http://localhost:5000/api/medicos" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeCompleto": "Teste",
    "documento": "12345678901",
    "crm": "TEST123",
    "especialidade": "Teste",
    "username": "teste",
    "senha": "123456"
  }'
```

## 🖥️ Problemas do Frontend

### ❌ Problema 8: "Frontend não carrega"
**Sintoma:**
```bash
npm run dev
# Erro ao iniciar ou página em branco
```

**Causa:** Dependências não instaladas ou erro de compilação

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar versão do Node
node --version
# Deve ser >= 18

# Executar com logs detalhados
npm run dev -- --verbose
```

---

### ❌ Problema 9: "Erro de CORS"
**Sintoma:**
```
Access to fetch at 'http://localhost:5000/api/medicos' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Causa:** CORS não configurado na API

**Solução:**
```csharp
// Verificar Program.cs
app.UseCors(builder => builder
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());
```

---

### ❌ Problema 10: "Dados não aparecem na tabela"
**Sintoma:** Tabela vazia mesmo com dados no banco

**Causa:** Erro na integração frontend-backend

**Solução:**
```bash
# Verificar se API retorna dados
curl http://localhost:5000/api/medicos

# Verificar console do navegador (F12)
# Procurar por erros JavaScript

# Verificar variáveis de ambiente
cat .env
# VITE_API_URL=http://localhost:5000
```

## 🔗 Problemas de Integração

### ❌ Problema 11: "Usuário não criado junto com médico"
**Sintoma:** Médico criado mas usuário não existe

**Causa:** Erro no MedicoService.CreateMedicoAsync

**Solução:**
```csharp
// Verificar MedicoService.cs
// Confirmar que User está sendo criado na transação
using var transaction = await _context.Database.BeginTransactionAsync();
try
{
    // Criar usuário
    var user = new User { ... };
    _context.Users.Add(user);
    await _context.SaveChangesAsync();
    
    // Criar médico
    var medico = new Medico { UserId = user.Id, ... };
    _context.Medicos.Add(medico);
    await _context.SaveChangesAsync();
    
    await transaction.CommitAsync();
}
catch
{
    await transaction.RollbackAsync();
    throw;
}
```

---

### ❌ Problema 12: "Validação de duplicidade não funciona"
**Sintoma:** Permite criar médicos com documento/CRM duplicado

**Causa:** Índices únicos não criados ou validação não implementada

**Solução:**
```bash
# Verificar índices no banco
sqlite3 mobilemed.db ".indices Medicos"

# Deve mostrar:
# IX_Medicos_Documento
# IX_Medicos_Crm

# Se não existir, recriar migração
dotnet ef migrations remove
dotnet ef migrations add AddMedicoEntityWithIndexes
dotnet ef database update
```

## 📊 Problemas de Performance

### ❌ Problema 13: "Paginação lenta"
**Sintoma:** Demora para carregar lista de médicos

**Causa:** Falta de índices ou consulta ineficiente

**Solução:**
```sql
-- Verificar plano de execução
EXPLAIN QUERY PLAN 
SELECT * FROM Medicos 
WHERE NomeCompleto LIKE '%João%' 
ORDER BY DataCriacao DESC 
LIMIT 7 OFFSET 0;

-- Criar índices se necessário
CREATE INDEX IX_Medicos_NomeCompleto ON Medicos(NomeCompleto);
CREATE INDEX IX_Medicos_DataCriacao ON Medicos(DataCriacao);
```

---

### ❌ Problema 14: "Muitas consultas ao banco"
**Sintoma:** N+1 queries ou consultas desnecessárias

**Causa:** Lazy loading ou falta de Include

**Solução:**
```csharp
// Usar Include para relacionamentos
var medicos = await _context.Medicos
    .Include(m => m.User)
    .Where(m => m.Ativo)
    .OrderByDescending(m => m.DataCriacao)
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync();
```

## 🔍 Ferramentas de Debug

### Logs da API
```bash
# Habilitar logs detalhados
export ASPNETCORE_ENVIRONMENT=Development

# Verificar logs em tempo real
tail -f logs/app-$(date +%Y%m%d).log
```

### Logs do Frontend
```javascript
// Adicionar logs no MedicoService.ts
console.log('Fazendo requisição para:', url);
console.log('Dados enviados:', data);
console.log('Resposta recebida:', response);
```

### Banco de Dados
```bash
# Conectar ao SQLite
sqlite3 mobilemed.db

# Comandos úteis
.tables                    # Listar tabelas
.schema Medicos           # Ver estrutura
.indices Medicos          # Ver índices
SELECT COUNT(*) FROM Medicos;  # Contar registros
```

## 📋 Checklist de Diagnóstico

### Quando algo não funciona:
- [ ] API está rodando? (`curl http://localhost:5000/health`)
- [ ] Frontend está rodando? (Acessar `http://localhost:5173`)
- [ ] Migração foi aplicada? (`dotnet ef migrations list`)
- [ ] Banco tem dados? (`SELECT COUNT(*) FROM Medicos`)
- [ ] CORS configurado? (Verificar console do navegador)
- [ ] Variáveis de ambiente corretas? (Verificar `.env`)
- [ ] Logs mostram erros? (Verificar console da API e navegador)

## 🆘 Comandos de Emergência

### Reset Completo do Banco
```bash
# ⚠️ CUIDADO: Apaga todos os dados!
rm mobilemed.db
dotnet ef database update
```

### Reset da Migração
```bash
# Remove última migração
dotnet ef migrations remove

# Recria do zero
dotnet ef migrations add AddMedicoEntity
dotnet ef database update
```

### Reset do Frontend
```bash
# Limpa cache e reinstala
rm -rf node_modules .vite package-lock.json
npm install
npm run dev
```

## 📞 Quando Pedir Ajuda

Se os problemas persistirem, colete as seguintes informações:

1. **Versões:**
   ```bash
   dotnet --version
   node --version
   npm --version
   ```

2. **Logs de erro completos**
3. **Comandos executados**
4. **Estado atual do banco:**
   ```bash
   sqlite3 mobilemed.db ".tables"
   sqlite3 mobilemed.db "SELECT COUNT(*) FROM Medicos;"
   ```

5. **Configurações:**
   ```bash
   cat appsettings.json
   cat .env
   ```

## 🔄 Próximos Passos

Após resolver os problemas:
1. Documentar a solução encontrada
2. Atualizar este guia se necessário
3. Continuar com os testes de validação
4. Reportar bugs encontrados para correção futura