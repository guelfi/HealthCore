# 📊 HEALTHCORE - Status do Projeto

**Última atualização:** 29/01/2026

## ✅ STATUS ATUAL

**Desenvolvimento:** 🟢 Funcional (via start-dev.sh centralizado)  
**Produção:** 🟡 Online com problemas (Frontend unhealthy)  
**Repositório:** 🟢 Sincronizado (local ↔ GitHub)  
**Último commit:** 419288f (16/01/2026)

### 🐳 Containers OCI
- healthcore-api: ✅ Up 3 weeks (healthy)
- healthcore-frontend: ⚠️ Up 3 weeks (unhealthy)

## 🎯 FASE ATUAL

**Fase 0** - Documentação (✅ PROJETO.md e STATUS.md criados)

## 📋 PRÓXIMAS TAREFAS

1. [ ] Investigar e corrigir problema de health check do Frontend
2. [ ] Criar docker-compose.local.yml (SQLite em volume)
3. [ ] Criar docker-compose.production.yml
4. [ ] Criar deploy.sh
5. [ ] Criar dev.sh
6. [ ] Criar .env.example
7. [ ] Criar README-DEPLOY.md
8. [ ] Configurar GitHub Actions (CI/CD)
9. [ ] Testar deploy isolado

## 📝 OBSERVAÇÕES

- Usa SQLite (caso especial)
- 2 componentes: API + Frontend
- 3º na ordem de implementação
- Credencial validada: oscar/246588
