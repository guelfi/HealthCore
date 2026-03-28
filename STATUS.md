# 📊 HEALTHCORE - Status do Projeto

**Última atualização:** 28/03/2026

## ✅ STATUS ATUAL

| Componente | Status | Observações |
|------------|--------|-------------|
| **Desenvolvimento Local** | 🟢 Funcional | via start-dev.sh centralizado |
| **Produção API** | 🟢 Healthy | Container up há ~3 semanas |
| **Produção Frontend** | ⚠️ Unhealthy | Health check falhando |
| **Repositório** | 🟢 Sincronizado | Local ↔ GitHub |
| **Último commit** | 419288f | 16/01/2026 |

### 🐳 Containers OCI

| Container | Status | Uptime |
|----------|--------|--------|
| healthcore-api | ✅ Up | ~3 semanas (healthy) |
| healthcore-frontend | ⚠️ Up | ~3 semanas (unhealthy) |

## 🔧 PROBLEMAS IDENTIFICADOS

### 1. Health Check Frontend (⚠️ CRÍTICO)
- **Problema:** Container frontend unhealthy apesar de estar rodando
- **Causa:** Health check usando `/health` mas nginx não responde neste endpoint
- **Correção aplicada:** 
  - nginx.conf atualizado para responder em `/health`
  - docker-compose.yml atualizado com `start_period: 30s`

### 2. Portas do Sistema (⚠️ CONFUSÃO)
- **README.md:** API 5000, Frontend 5005 ✅
- **PROJETO.md:** API 5005, Frontend 5000 ❌ (INVERTIDO!)
- **docker-compose.yml:** API 5000, Frontend 5005 ✅
- **Correção:** PROJETO.md corrigido para refletir padrão real

## 📋 PORTAS PADRONIZADAS

| Componente | Porta Local | Porta Container | Descrição |
|------------|------------|-----------------|-----------|
| **API** | 5000 | 5000 | Backend .NET 8 |
| **Frontend** | 5005 | 80 | Nginx + React |

## 🚀 AÇÕES REALIZADAS (28/03/2026)

### Correções Aplicadas

1. ✅ **nginx.conf** - Adicionado endpoint `/health` para health checks
2. ✅ **docker-compose.yml** - Corrigido health check do frontend
3. ✅ **PROJETO.md** - Corrigidas portas (API 5000, Frontend 5005)
4. ⏳ **STATUS.md** - Atualizado com data atual

### Próximos Passos

1. [ ] Rebuilt do container frontend na OCI
2. [ ] Verificar health do frontend após rebuild
3. [ ] Testar endpoints em produção
4. [ ] Criar GitHub Actions workflow para CI/CD

## 🔗 LINKS PRODUÇÃO

| Serviço | URL |
|---------|-----|
| API Health | http://129.153.86.168/healthcore-api/health |
| Frontend | http://129.153.86.168/healthcore-frontend/ |
| Swagger | http://129.153.86.168/healthcore-api/swagger |

## 📝 OBSERVAÇÕES

- ✅ Usa **SQLite** (caso especial - não usa PostgreSQL)
- ✅ 2 componentes: API (.NET) + Frontend (React/Nginx)
- ✅ Credenciais OCI: `oscar` / `246588`
- ⚠️ Container registry pode não estar configurado (verificar OCI_SETUP.md)
