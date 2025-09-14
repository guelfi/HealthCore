# ✅ Checklist - CRUD Usuários (Fase 0)

## 📋 Visão Geral

Antes de iniciar as melhorias de UI/UX, precisamos garantir que o CRUD de Usuários esteja 100% funcional. Este checklist serve como guia para auditoria e completude das funcionalidades.

## 🔍 Auditoria Atual

### Backend - API Endpoints ✅ COMPLETO
- [x] **GET /admin/usuarios** - Listar usuários - **IMPLEMENTADO**
  - [x] Paginação implementada
  - [x] Filtros de busca funcionando
  - [x] Ordenação por campos
  - [x] Tratamento de erros

- [x] **GET /admin/usuarios/{id}** - Buscar usuário por ID - **IMPLEMENTADO**
  - [x] Validação de ID
  - [x] Retorno de erro 404 quando não encontrado
  - [x] Dados completos no retorno

- [x] **POST /admin/usuarios** - Criar usuário - **IMPLEMENTADO**
  - [x] Validação de dados obrigatórios
  - [x] Validação de username único
  - [x] Hash de senha implementado
  - [x] Validação de perfil/role
  - [x] Retorno do usuário criado

- [x] **PUT /admin/usuarios/{id}** - Atualizar usuário - **IMPLEMENTADO**
  - [x] Validação de existência
  - [x] Validação de dados
  - [x] Atualização parcial suportada
  - [x] Não permitir alteração de username se já existe

- [x] **PATCH /admin/usuarios/{id}/desativar** - Desativar usuário - **IMPLEMENTADO**
  - [x] Validação de existência
  - [x] Soft delete implementado
  - [x] Verificação de dependências
  - [x] Log de auditoria

- [x] **PATCH /admin/usuarios/{id}/ativar** - Ativar usuário - **IMPLEMENTADO**

- [x] **GET /admin/usuarios/search** - Buscar por username - **IMPLEMENTADO**

### Modelo de Dados ✅ IMPLEMENTADO

#### Entidade User ✅
- [x] **Propriedades básicas**
  - [x] Id (Guid) ✅
  - ❌ Nome (não implementado no backend)
  - ❌ Email (não implementado no backend)
  - [x] Username (string, único, obrigatório) ✅
  - [x] PasswordHash (string, obrigatório) ✅
  - [x] Role (UserRole enum) ✅
  - [x] IsActive (boolean, padrão: true) ✅
  - [x] CreatedAt (DateTime) ✅
  - ❌ UpdatedAt (não implementado)

#### Enum UserRole ✅
- [x] **Valores definidos**
  - [x] Administrador = 1 ✅
  - [x] Medico = 2 ✅

#### Validações ✅ IMPLEMENTADAS
- [x] **Regras de negócio**
  - ❌ Email (não existe no modelo)
  - [x] Username deve ter pelo menos 3 caracteres ✅
  - [x] Senha deve ter pelo menos 6 caracteres ✅
  - [x] Role deve ser válido ✅
  - [x] Não permitir duplicação de username ✅
  - [x] Hash de senha com BCrypt ✅

### Frontend - Componentes ⚠️ PARCIALMENTE IMPLEMENTADO

#### Lista de Usuários ✅ IMPLEMENTADO
- [x] **Componente UsuariosList** ✅
  - [x] Tabela responsiva ✅
  - [x] Paginação funcional ✅
  - [x] Busca por username ✅
  - [x] Filtro por perfil ✅
  - [x] Ordenação por colunas ✅
  - [x] Ações (Editar, Excluir, Ativar/Desativar) ✅
  - [x] Loading states ✅
  - [x] Estados vazios ✅

#### Formulário de Usuário ⚠️ PRECISA CORREÇÃO
- [x] **Componente UsuarioForm** ⚠️
  - [x] Campos obrigatórios marcados ✅
  - [x] Validação em tempo real ✅
  - ❌ Máscaras para CPF e telefone (não aplicável)
  - [x] Seletor de perfil ✅
  - ❌ Validação de email único (campo não existe no backend)
  - [x] Confirmação de senha ✅
  - [x] Feedback de erro/sucesso ✅
  - ⚠️ **PROBLEMA**: Usa campos 'nome' e 'email' que não existem no backend

#### Modal/Dialog de Usuário ✅ IMPLEMENTADO
- [x] **Componente UsuarioModal** ✅
  - [x] Abertura/fechamento suave ✅
  - [x] Formulário integrado ✅
  - [x] Modo criação/edição ✅
  - [x] Confirmação antes de fechar com dados ✅
  - [x] Escape key para fechar ✅

#### Detalhes do Usuário ❌ NÃO IMPLEMENTADO
- [ ] **Componente UsuarioDetails**
  - [ ] Visualização completa dos dados
  - [ ] Histórico de atividades (se aplicável)
  - [ ] Botões de ação (Editar, Excluir)

#### Integração com API ✅ IMPLEMENTADO
- [x] **Hooks personalizados** ✅
  - [x] useUsuarios hook implementado ✅
  - [x] Estados de loading/error ✅
  - [x] Cache de dados ✅
  - [x] Invalidação automática ✅

### Funcionalidades Específicas ✅ IMPLEMENTADAS

#### Autenticação e Autorização ✅
- [x] **Login de usuário** ✅
  - [x] Validação de credenciais ✅
  - [x] Geração de token JWT ✅
  - [x] Redirecionamento baseado no perfil ✅

- [x] **Controle de acesso** ✅
  - [x] Middleware de autorização ✅
  - [x] Verificação de perfil por endpoint ✅
  - [x] Proteção de rotas no frontend ✅

#### Gestão de Perfis ✅
- [x] **Administrador** ✅
  - [x] Acesso total ao CRUD ✅
  - [x] Pode alterar perfis de outros usuários ✅
  - [x] Pode desativar usuários ✅

- [x] **Outros perfis** ✅
  - [x] Podem editar apenas próprios dados ✅
  - [x] Não podem alterar próprio perfil ✅
  - [x] Visualização limitada de outros usuários ✅

#### Auditoria ✅ IMPLEMENTADA
- [x] **Log de ações** ✅
  - [x] Criação de usuário ✅
  - [x] Atualização de dados ✅
  - [x] Ativação/desativação ✅
  - [x] Tentativas de login ✅

#### Segurança ✅ IMPLEMENTADA
- [x] **Medidas de proteção** ✅
  - [x] Hash de senhas (BCrypt) ✅
  - [x] Validação de entrada (Data Annotations) ✅
  - [x] Sanitização de dados ✅
  - [x] Autorização por role ✅

## 3. Problemas Identificados

### Críticos ⚠️
- ⚠️ **Incompatibilidade Frontend-Backend**: Componentes React usam campos 'nome' e 'email' que não existem no modelo User do backend
- ⚠️ **Entidade Usuario vs User**: Frontend referencia entidade 'Usuario' mas backend usa 'User'

### Médios
- 📝 **Testes**: Não há testes unitários implementados para os componentes
- 📝 **Componente UsuarioDetails**: Não implementado para visualização completa

### Baixos
- 📝 **Campo UpdatedAt**: Não implementado no modelo User
- 📝 **Soft Delete**: Implementado como IsActive mas poderia ter campo DeletedAt

## 4. Próximos Passos

### Imediatos (Esta Sprint) 🚨
1. ✅ **Corrigir incompatibilidade Frontend-Backend**
   - Remover campos 'nome' e 'email' dos componentes React
   - Ajustar validações e formulários
   - Atualizar interfaces TypeScript
2. ✅ **Sincronizar entidades**
   - Padronizar uso de 'User' em todo o sistema
   - Atualizar imports e referências
3. ✅ **Testar funcionalidades corrigidas**

### Médio Prazo
1. 📝 **Implementar testes unitários**
2. 📝 **Criar componente UsuarioDetails**
3. 📝 **Adicionar campo UpdatedAt ao modelo**

### Longo Prazo
1. 📝 **Implementar auditoria avançada**
2. 📝 **Adicionar mais perfis de usuário se necessário**

### Testes

#### Testes Unitários
- [ ] **Testes do Controller**
  - [ ] Todos os endpoints testados
  - [ ] Cenários de sucesso e erro
  - [ ] Validação de autorização

- [ ] **Testes do Service**
  - [ ] Lógica de negócio testada
  - [ ] Validações testadas
  - [ ] Tratamento de exceções

- [ ] **Testes do Repository**
  - [ ] Operações CRUD testadas
  - [ ] Queries complexas testadas

#### Testes de Integração
- [ ] **API Tests**
  - [ ] Fluxo completo de CRUD
  - [ ] Autenticação e autorização
  - [ ] Validação de dados

#### Testes Frontend
- [ ] **Testes de Componente**
  - [ ] Renderização correta
  - [ ] Interações do usuário
  - [ ] Estados de loading/erro

- [ ] **Testes E2E**
  - [ ] Fluxo completo de criação
  - [ ] Fluxo completo de edição
  - [ ] Fluxo completo de exclusão

### Documentação
- [ ] **API Documentation**
  - [ ] Swagger/OpenAPI atualizado
  - [ ] Exemplos de request/response
  - [ ] Códigos de erro documentados

- [ ] **README atualizado**
  - [ ] Instruções de setup
  - [ ] Exemplos de uso
  - [ ] Troubleshooting

## 🚀 Plano de Execução

### Fase 0.1 - Auditoria (1-2 dias)
1. [ ] Executar todos os endpoints via Postman/Insomnia
2. [ ] Testar interface atual do frontend
3. [ ] Identificar funcionalidades faltantes
4. [ ] Documentar bugs encontrados

### Fase 0.2 - Correções Backend (2-3 dias)
1. [ ] Corrigir endpoints com problemas
2. [ ] Implementar funcionalidades faltantes
3. [ ] Adicionar validações necessárias
4. [ ] Implementar testes unitários

### Fase 0.3 - Correções Frontend (2-3 dias)
1. [ ] Corrigir componentes com problemas
2. [ ] Implementar funcionalidades faltantes
3. [ ] Melhorar validações do formulário
4. [ ] Adicionar testes de componente

### Fase 0.4 - Testes Finais (1 dia)
1. [ ] Executar suite completa de testes
2. [ ] Teste manual de todos os fluxos
3. [ ] Validação de performance
4. [ ] Documentação final

## 📊 Critérios de Aceitação

### Funcional
- ✅ Todos os endpoints funcionando corretamente
- ✅ Interface permite todas as operações CRUD
- ✅ Validações funcionando no backend e frontend
- ✅ Autenticação e autorização implementadas

### Técnico
- ✅ Cobertura de testes > 80%
- ✅ Sem erros no console do navegador
- ✅ Sem warnings de build
- ✅ Performance adequada (< 2s para operações)

### UX (Preparação para melhorias)
- ✅ Interface funcional em dispositivos móveis
- ✅ Feedback adequado para ações do usuário
- ✅ Estados de loading implementados
- ✅ Tratamento de erros com mensagens claras

## 🔧 Ferramentas de Teste

### Backend
```bash
# Executar testes unitários
dotnet test

# Executar com cobertura
dotnet test --collect:"XPlat Code Coverage"

# Executar API tests
dotnet test --filter Category=Integration
```

### Frontend
```bash
# Executar testes de componente
npm run test

# Executar com cobertura
npm run test:coverage

# Executar testes E2E
npm run test:e2e
```

## 📝 Relatório de Progresso

### Template de Status
```markdown
## Status - [Data]

### Concluído ✅
- Item 1
- Item 2

### Em Progresso 🔄
- Item 3 (50%)
- Item 4 (25%)

### Bloqueadores ❌
- Item 5: Descrição do problema

### Próximos Passos
1. Resolver bloqueador do Item 5
2. Finalizar Item 3
3. Iniciar Item 6
```

## 🎯 Meta

**Objetivo:** CRUD de Usuários 100% funcional e testado, pronto para receber melhorias de UI/UX.

**Prazo estimado:** 5-7 dias úteis

**Critério de conclusão:** Todos os itens deste checklist marcados como concluídos ✅

---

> 💡 **Dica:** Use este checklist como base para daily standups e relatórios de progresso. Mantenha-o atualizado conforme o desenvolvimento avança.