# 📊 HEALTHCORE - Status do Projeto

**Última atualização:** 29/03/2026

## ✅ STATUS ATUAL

| Componente | Status | Observações |
|------------|--------|-------------|
| **Desenvolvimento Local** | 🟢 Funcional | via start-dev.sh centralizado |
| **Produção API** | 🟢 Healthy | Rebuilt em 29/03/2026 |
| **Produção Frontend** | 🟢 Rebuilt | Rebuilt em 29/03/2026 |
| **Nginx Proxy** | 🟢 Configurado | URLs amigáveis ativas |
| **Repositório** | 🟢 Sincronizado | Local ↔ GitHub |
| **Último commit** | 419288f | 16/01/2026 |

### 🐳 Containers OCI

| Container | IP | Status | Uptime |
|----------|-----|--------|--------|
| healthcore-api | 172.19.0.2:5000 | ✅ Up | Rebuilt 29/03 |
| healthcore-frontend | 172.19.0.3:80 | ✅ Up | Rebuilt 29/03 |
| nginx-proxy | 80/443 | ✅ Up | - |

## 🔧 PROBLEMAS IDENTIFICADOS

### 1. Health Check Frontend (✅ RESOLVIDO)
- **Problema:** Container frontend unhealthy + URLs amigáveis não funcionavam
- **Causa:** API ouvindo em 5005 (errado), proxy pass sem subpath, frontend com URL errada
- **Correções aplicadas (29/03/2026):**
  - API rebuildada para ouvir em 5000
  - nginx.conf atualizado com proxy_pass correto (`/healthcore-frontend/`, `/healthcore-api/`)
  - `/healthcore-health` aponta para `/health/info` da API
  - Frontend rebuildado com `VITE_API_URL=/healthcore-api`
  - nginx-proxy restartado

### 2. Portas do Sistema (✅ RESOLVIDO)
- **README.md:** API 5000, Frontend 5005 ✅
- **PROJETO.md:** API 5005, Frontend 5000 ❌ (INVERTIDO!)
- **docker-compose.yml:** API 5000, Frontend 5005 ✅
- **Correção:** PROJETO.md corrigido para refletir padrão real

## 📋 PORTAS PADRONIZADAS

| Componente | Porta Local | Porta Container | Descrição |
|------------|------------|-----------------|-----------|
| **API** | 5000 | 5000 | Backend .NET 8 |
| **Frontend** | 5005 | 80 | Nginx + React |

## 🚀 AÇÕES REALIZADAS

### 29/03/2026 - URLs Amigáveis & Correções

1. ✅ **API rebuildada** - Corrigida para ouvir em porta 5000
2. ✅ **nginx.conf atualizado** - Proxy pass com subpaths corretos
3. ✅ **Frontend rebuildado** - VITE_API_URL=/healthcore-api
4. ✅ **nginx-proxy restartado** - Configurações aplicadas

### 28/03/2026 - Correções Iniciais

1. ✅ **nginx.conf** - Adicionado endpoint `/health` para health checks
2. ✅ **docker-compose.yml** - Corrigido health check do frontend
3. ✅ **PROJETO.md** - Corrigidas portas (API 5000, Frontend 5005)

### Próximos Passos

1. [ ] Testar autenticação do frontend em produção
2. [ ] Verificar health check `/healthcore-health`
3. [ ] Validar login/logout
4. [ ] Criar GitHub Actions workflow para CI/CD

## 🔗 LINKS PRODUÇÃO (URLs Amigáveis)

| Serviço | URL |
|---------|-----|
| Frontend | http://129.153.86.168/healthcore-frontend/ |
| API | http://129.153.86.168/healthcore-api/ |
| Health Check | http://129.153.86.168/healthcore-health |
| Swagger | http://129.153.86.168/healthcore-api/swagger |

## 📝 OBSERVAÇÕES

- ✅ Usa **SQLite** (caso especial - não usa PostgreSQL)
- ✅ 2 componentes: API (.NET) + Frontend (React/Nginx)
- ✅ Credenciais OCI: `oscar` / `246588`
- ⚠️ Container registry pode não estar configurado (verificar OCI_SETUP.md)
