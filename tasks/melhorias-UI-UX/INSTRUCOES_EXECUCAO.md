# 🚀 Instruções de Execução - Melhorias UI/UX HealthCore

## 📋 Visão Geral

Este documento contém as instruções passo a passo para executar o plano de melhorias UI/UX do HealthCore, seguindo a estratégia faseada definida.

## 🎯 Objetivos

1. **Completar CRUD de Usuários** (Fase 0 - Pré-requisito)
2. **Implementar melhorias UI/UX** em fases incrementais
3. **Manter funcionalidade** durante todo o processo
4. **Criar base reutilizável** para futuras melhorias

## 📁 Documentos de Referência

| Documento | Propósito |
|-----------|----------|
| `PLANO_INTEGRADO_UI_UX_FINAL.md` | Plano completo e estratégia |
| `PLANO_IMPLEMENTACAO_FASEADO.md` | Cronograma e fases detalhadas |
| `CHECKLIST_CRUD_USUARIOS.md` | Checklist específico para CRUD |
| `ANALISE_COMPARATIVA_KIRO_VS_TRAE.md` | Análise técnica das especificações |
| `setup-ui-ux-branch.sh` | Script de setup automatizado |
| `GUIA_DESENVOLVIMENTO.md` | Guia técnico (criado pelo script) |

## 🔄 Fluxo de Execução

### Pré-Requisitos

```bash
# Verificar ferramentas necessárias
node --version    # >= 16.x
npm --version     # >= 8.x
dotnet --version  # >= 6.0
git --version     # >= 2.x
```

### Fase 0: Setup e CRUD Usuários

#### Passo 1: Executar Setup Inicial

```bash
# 1. Navegar para o diretório do projeto
cd /mnt/c/Users/SP-MGUELFI/Projetos/HealthCore

# 2. Dar permissão de execução ao script
chmod +x tasks/melhorias-UI-UX/setup-ui-ux-branch.sh

# 3. Executar o script de setup
./tasks/melhorias-UI-UX/setup-ui-ux-branch.sh
```

**O que o script faz:**
- ✅ Cria branch `feature/ui-ux-improvements`
- ✅ Instala dependências do frontend
- ✅ Cria estrutura de pastas para UI/UX
- ✅ Gera arquivos base do design system
- ✅ Configura ambiente de desenvolvimento

#### Passo 2: Auditoria do CRUD Usuários

```bash
# 1. Abrir checklist
code tasks/melhorias-UI-UX/CHECKLIST_CRUD_USUARIOS.md

# 2. Executar testes atuais
cd src/HealthCore.Tests
dotnet test

# 3. Testar API endpoints
# Use Postman/Insomnia com a collection:
# GET    /api/usuarios
# GET    /api/usuarios/{id}
# POST   /api/usuarios
# PUT    /api/usuarios/{id}
# DELETE /api/usuarios/{id}

# 4. Testar interface frontend
cd ../Web
npm run dev
# Abrir http://localhost:5173 e testar CRUD
```

#### Passo 3: Completar CRUD Usuários

**Baseado na auditoria, implementar:**

1. **Backend faltante:**
   ```bash
   # Exemplo de estrutura esperada
   src/HealthCore.Api/Controllers/UsuariosController.cs
   src/HealthCore.Application/Services/UsuarioService.cs
   src/HealthCore.Domain/Entities/Usuario.cs
   src/HealthCore.Infrastructure/Repositories/UsuarioRepository.cs
   ```

2. **Frontend faltante:**
   ```bash
   # Exemplo de estrutura esperada
   src/Web/src/pages/Usuarios/
   src/Web/src/components/Usuario/
   src/Web/src/services/usuarioService.ts
   ```

3. **Validar completude:**
   ```bash
   # Executar todos os testes
   dotnet test --collect:"XPlat Code Coverage"
   
   # Testar interface completa
   npm run test
   npm run test:e2e
   ```

### Fase 1: Melhorias Dashboard

#### Passo 4: Configurar Estilos Base

```bash
# 1. Importar estilos principais no projeto
# Editar src/Web/src/main.tsx ou App.tsx
# Adicionar: import './styles/main.scss'

# 2. Verificar build
npm run build

# 3. Testar desenvolvimento
npm run dev
```

#### Passo 5: Implementar Componentes Base

**Ordem de implementação:**

1. **Button Component**
   ```typescript
   // src/Web/src/components/ui/Button/Button.tsx
   // Implementar variantes: primary, secondary, danger, etc.
   // Suporte a touch-friendly (min 44px)
   ```

2. **Card Component**
   ```typescript
   // src/Web/src/components/ui/Card/Card.tsx
   // Layout responsivo
   // Sombras e bordas do design system
   ```

3. **Layout Dashboard**
   ```typescript
   // src/Web/src/components/layout/Dashboard/DashboardLayout.tsx
   // Grid responsivo
   // Navegação mobile-friendly
   ```

#### Passo 6: Aplicar no Dashboard

```bash
# 1. Refatorar página do Dashboard
# src/Web/src/pages/Dashboard/Dashboard.tsx

# 2. Implementar layout responsivo
# 3. Aplicar novos componentes
# 4. Testar em diferentes dispositivos
```

### Fase 2: Melhorias Médicos

#### Passo 7: Componentes Específicos

1. **Dialog/Modal Component**
2. **Table Component (responsiva)**
3. **Form Components**

#### Passo 8: Aplicar no Módulo Médicos

### Fases 3-5: Pacientes, Exames, Usuários

**Seguir mesmo padrão:**
1. Identificar componentes necessários
2. Reutilizar componentes existentes
3. Criar novos se necessário
4. Aplicar melhorias
5. Testar e validar

## 🧪 Testes e Validação

### Durante Desenvolvimento

```bash
# Testes unitários
npm run test
dotnet test

# Testes E2E
npm run test:e2e

# Lighthouse (performance)
npm run lighthouse

# Acessibilidade
npm run test:a11y
```

### Antes de Merge

```bash
# Build completo
npm run build
dotnet build

# Testes completos
npm run test:all
dotnet test --collect:"XPlat Code Coverage"

# Verificação de qualidade
npm run lint
npm run type-check
```

## 📊 Métricas de Sucesso

### Performance
- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1

### Acessibilidade
- [ ] WCAG 2.1 AA compliance
- [ ] Navegação por teclado funcional
- [ ] Screen reader friendly
- [ ] Contraste adequado (4.5:1)

### Responsividade
- [ ] Funcional em mobile (320px+)
- [ ] Funcional em tablet (768px+)
- [ ] Funcional em desktop (1024px+)
- [ ] Touch targets ≥ 44px

### Funcionalidade
- [ ] Todos os CRUDs funcionais
- [ ] Validações funcionando
- [ ] Estados de loading/erro
- [ ] Feedback adequado ao usuário

## 🔧 Ferramentas de Desenvolvimento

### Recomendadas

```bash
# Extensões VS Code
# - Sass/SCSS IntelliSense
# - TypeScript Importer
# - Prettier
# - ESLint
# - axe Accessibility Linter

# Ferramentas de teste
npm install -D @testing-library/react
npm install -D @testing-library/jest-dom
npm install -D @axe-core/playwright
```

### Configuração Recomendada

```json
// .vscode/settings.json
{
  "scss.lint.unknownAtRules": "ignore",
  "css.validate": false,
  "scss.validate": false,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 🚨 Troubleshooting

### Problemas Comuns

#### Sass não compila
```bash
# Instalar dependências Sass
npm install -D sass

# Verificar configuração Vite
# vite.config.ts deve incluir suporte a Sass
```

#### Componentes não renderizam
```bash
# Verificar imports
# Verificar TypeScript errors
npm run type-check
```

#### Testes falhando
```bash
# Limpar cache
npm run test -- --clearCache

# Executar individualmente
npm run test -- --testNamePattern="nome do teste"
```

## 📞 Suporte

### Documentação
- [Design System Tokens](src/Web/src/styles/design-system/tokens.scss)
- [Breakpoints](src/Web/src/styles/design-system/breakpoints.scss)
- [Guia de Desenvolvimento](GUIA_DESENVOLVIMENTO.md)

### Contatos
- **Tech Lead:** [Nome]
- **UI/UX Designer:** [Nome]
- **QA Lead:** [Nome]

## 📈 Próximos Passos

1. **Executar Fase 0** (CRUD Usuários)
2. **Validar setup** com script
3. **Iniciar Fase 1** (Dashboard)
4. **Iterar** baseado em feedback
5. **Expandir** para outros módulos

---

> 💡 **Dica:** Mantenha este documento atualizado conforme o progresso. Use os checklists para tracking e os scripts para automação.

> 🎯 **Meta:** Interface moderna, responsiva e acessível, mantendo toda funcionalidade existente.