# 🔧 CONTEXTO DO PROBLEMA - API HealthCore

**Data:** 16/09/2025 04:44 UTC  
**Status:** EM ANDAMENTO - Problema com autenticação na API

## 📋 RESUMO DO PROBLEMA

**Problema Principal:** API de autenticação não está funcionando na OCI
- URL da API: http://129.153.86.168:5000
- URL do Frontend: http://129.153.86.168:5005

## 🚨 HISTÓRICO DO PROBLEMA

### 1. **Banco SQLite Vazio** (Início do problema)
- Após migração EF Core, banco ficou vazio na OCI
- Perdeu todos os dados de usuários, médicos, pacientes

### 2. **Erro 400 Bad Request** (Primeira fase)
- Endpoints `/auth/login` e `/auth/register` retornavam 400
- **CAUSA:** Rate limiting (`RequireRateLimiting("AuthLimit")`) sem configuração
- **SOLUÇÃO:** Removido as chamadas de rate limiting nos endpoints de auth

### 3. **Erro 500 Internal Server Error** (Fase atual)
- Agora retorna: `"Erro inesperado durante o login"`
- **CAUSA:** Inconsistência entre entidade C# e estrutura do banco SQLite

## 🛠️ CORREÇÕES JÁ APLICADAS

✅ **Commit 2a59e35:** Removido `RequireRateLimiting("AuthLimit")` 
✅ **Commit 535b997:** Recriado estrutura do banco (tabelas Users, Medicos, Pacientes, Exames)
✅ **Commit ada7a1c:** Corrigido propriedades da entidade User
✅ **Commit c9715c9:** Removido propriedade CreatedAt (não existe na tabela)

## 🔴 ERRO ATUAL

**Último erro identificado:**
```
SQLite Error 1: 'no such column: u.CreatedAt'
```

**Análise:**
- A entidade `User.cs` tem propriedades que não existem na tabela SQLite real
- Dessincronia entre código C# e estrutura do banco

## 🏥 STATUS DOS SERVIÇOS

| Serviço | Status | URL | Observação |
|---------|---------|-----|------------|
| Health Check | 🟢 OK | http://129.153.86.168:5000/health | Funcionando |
| Swagger | 🟢 OK | http://129.153.86.168:5000/swagger | Endpoints visíveis |
| Auth Login | 🔴 ERRO | http://129.153.86.168:5000/auth/login | Erro 500 |
| Auth Register | 🔴 ERRO | http://129.153.86.168:5000/auth/register | Erro 500 |

## 💡 SOLUÇÃO SUGERIDA

**Recuperar banco original do commit `cafc544`**

Este commit tinha os dados funcionais antes da implementação problemática:
```bash
git show cafc544 --name-only | grep -i db
```

## 🔧 ENDPOINTS TEMPORÁRIOS CRIADOS

Para debug e criação de usuário admin:

1. **Gerar Hash da Senha:**
   ```
   GET http://129.153.86.168:5000/temp/gerar-hash-senha
   ```
   Retorna hash BCrypt para senha "@246!588"

2. **Criar Usuário Admin:**
   ```
   POST http://129.153.86.168:5000/temp/criar-guelfi
   ```
   Cria usuário "guelfi" com senha "@246!588" e role Administrador

## 📝 COMANDOS ÚTEIS PARA CONTINUIDADE

### Testar API:
```bash
# Health check
curl -v http://129.153.86.168:5000/health

# Gerar hash da senha
curl -v http://129.153.86.168:5000/temp/gerar-hash-senha

# Criar usuário admin
curl -v -X POST http://129.153.86.168:5000/temp/criar-guelfi

# Testar login
curl -v -X POST http://129.153.86.168:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"guelfi","password":"@246!588"}'
```

### Git commits relevantes:
```bash
git log --oneline -10
# c9715c9 - Último commit (Remove CreatedAt property)
# ada7a1c - Corrige propriedades User entity  
# 672b0d1 - Adiciona endpoint temporário criar-guelfi
# 2a59e35 - Remove rate limiting calls
# cafc544 - Commit com banco funcional (ALVO PARA RECUPERAÇÃO)
```

## 🎯 PRÓXIMOS PASSOS

1. **Recuperar banco original:**
   ```bash
   git checkout cafc544 -- src/Api/database/healthcore.db
   ```

2. **Ou investigar estrutura atual do banco:**
   ```bash
   # No WSL, conectar ao banco e verificar estrutura
   sqlite3 src/Api/database/healthcore.db ".schema Users"
   ```

3. **Testar login após recuperação**

4. **Se necessário, criar usuário admin manualmente no banco**

## 🔐 CREDENCIAIS DE TESTE

- **Usuário:** guelfi
- **Senha:** @246!588
- **Role:** Administrador

## 📁 ARQUIVOS IMPORTANTES

- `src/Api/Core/Domain/Entities/User.cs` - Entidade User
- `src/Api/Core/Application/Services/AuthService.cs` - Lógica de autenticação  
- `src/Api/Program.cs` - Endpoints de auth (linhas 793-815)
- `src/Api/database/healthcore.db` - Banco SQLite

## 🚀 AMBIENTE

- **Plataforma:** OCI (Oracle Cloud Infrastructure)
- **Deploy:** Automático via GitHub Actions
- **Banco:** SQLite
- **API:** .NET 8 + Entity Framework Core

---

**Para nova sessão:** Leia este arquivo e continue a partir dos "Próximos Passos"