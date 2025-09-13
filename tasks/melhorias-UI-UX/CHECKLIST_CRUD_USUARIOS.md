# ✅ Checklist - CRUD Usuários (Fase 0)

## 📋 Visão Geral

Antes de iniciar as melhorias de UI/UX, precisamos garantir que o CRUD de Usuários esteja 100% funcional. Este checklist serve como guia para auditoria e completude das funcionalidades.

## 🔍 Auditoria Atual

### Backend - API Endpoints
- [ ] **GET /api/usuarios** - Listar usuários
  - [ ] Paginação implementada
  - [ ] Filtros de busca funcionando
  - [ ] Ordenação por campos
  - [ ] Tratamento de erros

- [ ] **GET /api/usuarios/{id}** - Buscar usuário por ID
  - [ ] Validação de ID
  - [ ] Retorno de erro 404 quando não encontrado
  - [ ] Dados completos no retorno

- [ ] **POST /api/usuarios** - Criar usuário
  - [ ] Validação de dados obrigatórios
  - [ ] Validação de email único
  - [ ] Hash de senha implementado
  - [ ] Validação de perfil/role
  - [ ] Retorno do usuário criado

- [ ] **PUT /api/usuarios/{id}** - Atualizar usuário
  - [ ] Validação de existência
  - [ ] Validação de dados
  - [ ] Atualização parcial suportada
  - [ ] Não permitir alteração de email se já existe

- [ ] **DELETE /api/usuarios/{id}** - Excluir usuário
  - [ ] Validação de existência
  - [ ] Soft delete implementado (recomendado)
  - [ ] Verificação de dependências
  - [ ] Log de auditoria

### Modelo de Dados
- [ ] **Entidade Usuario** completa
  ```csharp
  public class Usuario
  {
      public int Id { get; set; }
      public string Nome { get; set; }
      public string Email { get; set; }
      public string Senha { get; set; }
      public string Telefone { get; set; }
      public string CPF { get; set; }
      public DateTime DataNascimento { get; set; }
      public string Endereco { get; set; }
      public PerfilUsuario Perfil { get; set; }
      public bool Ativo { get; set; }
      public DateTime DataCriacao { get; set; }
      public DateTime? DataAtualizacao { get; set; }
  }
  ```

- [ ] **Enum PerfilUsuario**
  ```csharp
  public enum PerfilUsuario
  {
      Administrador = 1,
      Medico = 2,
      Enfermeiro = 3,
      Recepcionista = 4,
      Paciente = 5
  }
  ```

- [ ] **Validações implementadas**
  - [ ] Email válido e único
  - [ ] CPF válido e único
  - [ ] Telefone no formato correto
  - [ ] Senha com critérios de segurança
  - [ ] Nome obrigatório (min 2 caracteres)

### Frontend - Componentes

#### Lista de Usuários
- [ ] **Componente UsuariosList**
  - [ ] Tabela responsiva
  - [ ] Paginação funcional
  - [ ] Busca por nome/email
  - [ ] Filtro por perfil
  - [ ] Ordenação por colunas
  - [ ] Ações (Editar, Excluir, Visualizar)
  - [ ] Loading states
  - [ ] Estados vazios

#### Formulário de Usuário
- [ ] **Componente UsuarioForm**
  - [ ] Campos obrigatórios marcados
  - [ ] Validação em tempo real
  - [ ] Máscaras para CPF e telefone
  - [ ] Seletor de perfil
  - [ ] Validação de email único
  - [ ] Confirmação de senha
  - [ ] Feedback de erro/sucesso

#### Modal/Dialog de Usuário
- [ ] **Componente UsuarioModal**
  - [ ] Abertura/fechamento suave
  - [ ] Formulário integrado
  - [ ] Modo criação/edição
  - [ ] Confirmação antes de fechar com dados
  - [ ] Escape key para fechar

#### Detalhes do Usuário
- [ ] **Componente UsuarioDetails**
  - [ ] Visualização completa dos dados
  - [ ] Histórico de atividades (se aplicável)
  - [ ] Botões de ação (Editar, Excluir)

### Funcionalidades Específicas

#### Autenticação e Autorização
- [ ] **Login de usuário**
  - [ ] Validação de credenciais
  - [ ] Geração de token JWT
  - [ ] Redirecionamento baseado no perfil

- [ ] **Controle de acesso**
  - [ ] Middleware de autorização
  - [ ] Verificação de perfil por endpoint
  - [ ] Proteção de rotas no frontend

#### Gestão de Perfis
- [ ] **Administrador**
  - [ ] Acesso total ao CRUD
  - [ ] Pode alterar perfis de outros usuários
  - [ ] Pode desativar usuários

- [ ] **Outros perfis**
  - [ ] Podem editar apenas próprios dados
  - [ ] Não podem alterar próprio perfil
  - [ ] Visualização limitada de outros usuários

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