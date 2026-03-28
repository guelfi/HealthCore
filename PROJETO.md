# 🏥 HEALTHCORE - Sistema de Gestão de Saúde

**Stack:** .NET 8 API + React (Vite)  
**Branch:** `main`  
**Banco:** SQLite (healthcore.db)  
**Repo:** https://github.com/guelfi/HealthCore.git

## 📋 CONFIGURAÇÃO

| Componente | Porta | URL Local | URL Produção |
|------------|-------|-----------|--------------|
| API | 5000 | http://localhost:5000 | /healthcore-api/ |
| Frontend | 5005 | http://localhost:5005 | /healthcore-frontend/ |

## 🗄️ BANCO DE DADOS

**SQLite:** `src/Api/database/healthcore.db`  
**Credenciais Produção:** `oscar` / `246588`

⚠️ **IMPORTANTE:** HealthCore usa SQLite, não PostgreSQL!
⚠️ **PORTAS:** API=5000, Frontend=5005 (padrão padronizado em 28/03/2026)

## 🚀 DEPLOY

```bash
cd /mnt/c/Users/SP-MGUELFI/Projetos
./deploy-oci.sh  # Opção 4
```

## 📝 MIGRAÇÃO PENDENTE

- [ ] docker-compose.local.yml (com SQLite)
- [ ] docker-compose.production.yml
- [ ] deploy.sh
- [ ] dev.sh
- [ ] .env.example
- [ ] README-DEPLOY.md
- [ ] .github/workflows/deploy-oci.yml

## 🔗 LINKS

- API Produção: http://129.153.86.168/healthcore-api/health
- Frontend Produção: http://129.153.86.168/healthcore-frontend/
- Docs Central: /Projetos/PROMPT_MESTRE.md
