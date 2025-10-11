# 📋 ESPECIFICAÇÃO - IMPLEMENTAÇÃO DE ESPECIALIDADES MÉDICAS

**Data**: 06/10/2025  
**Branch**: `ImplementEspecialidades`  
**Status**: 🚧 Em Desenvolvimento

---

## 🎯 OBJETIVO

Implementar um CRUD completo para **Especialidades Médicas** no sistema HealthCore, incluindo:
- Nova entidade no banco de dados
- Endpoints REST na API
- Interface completa no frontend (desktop e mobile)
- Item dedicado no Sidebar
- Relacionamento futuro com a entidade Médico

---

## 🏗️ ARQUITETURA DA SOLUÇÃO

### **1. Backend (.NET Core 8.0)**

#### **1.1 Entidade de Domínio**
**Arquivo**: `src/Api/Core/Domain/Entities/Especialidade.cs`

```csharp
public class Especialidade
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public bool Ativa { get; set; } = true;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public DateTime? DataAtualizacao { get; set; }
    
    // Relacionamento com Médicos (1:N)
    public ICollection<Medico> Medicos { get; set; } = new List<Medico>();
}
```

**Campos**:
- `Id` (Guid) - Identificador único
- `Nome` (string, max 100, obrigatório, único) - Nome da especialidade
- `Descricao` (string, max 500, opcional) - Descrição detalhada
- `Ativa` (bool, default true) - Status da especialidade
- `DataCriacao` (DateTime) - Data de criação
- `DataAtualizacao` (DateTime?, nullable) - Data da última atualização
- `Medicos` (ICollection<Medico>) - Relacionamento 1:N com Médicos

**Índices**:
- `Nome` - Único (não permite duplicatas)
- `Ativa` - Para filtros de busca

---

#### **1.2 DTOs (Data Transfer Objects)**

**Arquivo**: `src/Api/Core/Application/DTOs/EspecialidadeDto.cs`

```csharp
// DTO de leitura
public class EspecialidadeDto
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public bool Ativa { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime? DataAtualizacao { get; set; }
}

// DTO de criação
public class CreateEspecialidadeDto
{
    [Required(ErrorMessage = "O nome é obrigatório")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "O nome deve ter entre 3 e 100 caracteres")]
    public string Nome { get; set; } = string.Empty;
    
    [StringLength(500, ErrorMessage = "A descrição deve ter no máximo 500 caracteres")]
    public string? Descricao { get; set; }
    
    public bool Ativa { get; set; } = true;
}

// DTO de atualização
public class UpdateEspecialidadeDto
{
    [Required(ErrorMessage = "O nome é obrigatório")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "O nome deve ter entre 3 e 100 caracteres")]
    public string Nome { get; set; } = string.Empty;
    
    [StringLength(500, ErrorMessage = "A descrição deve ter no máximo 500 caracteres")]
    public string? Descricao { get; set; }
    
    public bool Ativa { get; set; }
}

// DTO de resposta paginada
public class PaginatedEspecialidadesDto
{
    public List<EspecialidadeDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}
```

---

#### **1.3 Service Layer**

**Arquivo**: `src/Api/Core/Application/Services/EspecialidadeService.cs`

**Métodos**:
- `GetAllAsync(int page, int pageSize, bool? ativa, string? search)` - Lista paginada com filtros
- `GetByIdAsync(Guid id)` - Busca por ID
- `CreateAsync(CreateEspecialidadeDto dto)` - Criar nova especialidade
- `UpdateAsync(Guid id, UpdateEspecialidadeDto dto)` - Atualizar especialidade
- `DeleteAsync(Guid id)` - Excluir especialidade (soft delete recomendado)
- `ExistsByNameAsync(string nome, Guid? excludeId)` - Verificar duplicidade

---

#### **1.4 Configuração do DbContext**

**Arquivo**: `src/Api/Infrastructure/Data/HealthCoreDbContext.cs`

```csharp
public DbSet<Especialidade> Especialidades { get; set; }

// OnModelCreating
modelBuilder.Entity<Especialidade>(entity =>
{
    entity.HasKey(e => e.Id);
    
    entity.Property(e => e.Nome)
        .IsRequired()
        .HasMaxLength(100);
    
    entity.HasIndex(e => e.Nome)
        .IsUnique();
    
    entity.Property(e => e.Descricao)
        .HasMaxLength(500);
    
    entity.Property(e => e.Ativa)
        .IsRequired()
        .HasDefaultValue(true);
    
    entity.HasIndex(e => e.Ativa);
    
    entity.Property(e => e.DataCriacao)
        .IsRequired();
    
    // Relacionamento 1:N com Médicos
    entity.HasMany(e => e.Medicos)
        .WithOne(m => m.Especialidade)
        .HasForeignKey(m => m.EspecialidadeId)
        .OnDelete(DeleteBehavior.SetNull);
});

// Atualizar configuração de Medico
modelBuilder.Entity<Medico>(entity =>
{
    // ... configurações existentes ...
    
    // Adicionar FK para Especialidade
    entity.Property(m => m.EspecialidadeId)
        .IsRequired(false);
    
    entity.HasIndex(m => m.EspecialidadeId);
    
    // Manter campo Especialidade (string) temporariamente
    entity.Property(m => m.Especialidade)
        .HasMaxLength(100);
});
```

---

#### **1.5 Alteração na Entidade Médico**

**Arquivo**: `src/Api/Core/Domain/Entities/Medico.cs`

**Adicionar**:
```csharp
public Guid? EspecialidadeId { get; set; }  // FK para Especialidade (nullable)
public Especialidade? Especialidade { get; set; }  // Navigation property

// Manter campo string temporariamente para compatibilidade
// public string Especialidade { get; set; } = string.Empty;  // DEPRECATED - será removido futuramente
```

**Observação**: O campo `Especialidade` (string) será mantido temporariamente para não quebrar o frontend existente. Em uma fase futura, será removido.

---

#### **1.6 Migration**

**Comando**:
```bash
cd src/Api
dotnet ef migrations add AddEspecialidadeEntityAndRelationship
dotnet ef database update
```

**Nome da Migration**: `AddEspecialidadeEntityAndRelationship`

**O que a migration fará**:
1. Criar tabela `Especialidades`
2. Adicionar coluna `EspecialidadeId` (nullable) na tabela `Medicos`
3. Criar FK entre `Medicos.EspecialidadeId` -> `Especialidades.Id`
4. Criar índices necessários
5. Manter coluna `Especialidade` (string) em `Medicos` para compatibilidade

---

#### **1.7 Endpoints REST**

**Base URL**: `/api/especialidades`

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/especialidades` | Lista paginada | ✅ | Todos |
| GET | `/especialidades/{id}` | Busca por ID | ✅ | Todos |
| POST | `/especialidades` | Criar nova | ✅ | Admin |
| PUT | `/especialidades/{id}` | Atualizar | ✅ | Admin |
| DELETE | `/especialidades/{id}` | Excluir | ✅ | Admin |

**Query Parameters (GET /especialidades)**:
- `page` (int, default: 1)
- `pageSize` (int, default: 10)
- `ativa` (bool?, opcional) - Filtrar por status
- `search` (string?, opcional) - Busca por nome

**Implementação em**: `src/Api/Program.cs`

**Observação**: Os endpoints de Médicos continuarão funcionando normalmente. O campo `Especialidade` (string) será mantido para compatibilidade. O novo campo `EspecialidadeId` será opcional e não afetará o frontend existente.

---

### **2. Frontend (React + TypeScript + Vite)**

#### **2.1 Estrutura de Arquivos**

```
src/Web/src/
├── domain/
│   └── entities/
│       └── Especialidade.ts          # Interface TypeScript
├── application/
│   └── services/
│       └── especialidadeService.ts   # Service de API
├── presentation/
│   ├── components/
│   │   └── especialidades/
│   │       ├── EspecialidadeCard.tsx           # Card mobile
│   │       ├── EspecialidadeDialog.tsx         # Dialog CRUD
│   │       ├── EspecialidadeDeleteDialog.tsx   # Dialog de confirmação
│   │       └── EspecialidadeViewDialog.tsx     # Dialog de visualização
│   ├── pages/
│   │   └── EspecialidadesPageTable.tsx         # Página principal
│   └── hooks/
│       └── useEspecialidades.ts                # Custom hook
```

---

#### **2.2 Interface TypeScript**

**Arquivo**: `src/Web/src/domain/entities/Especialidade.ts`

```typescript
export interface Especialidade {
  id: string;
  nome: string;
  descricao: string;
  ativa: boolean;
  dataCriacao: string;
  dataAtualizacao?: string;
}

export interface CreateEspecialidadeDto {
  nome: string;
  descricao?: string;
  ativa: boolean;
}

export interface UpdateEspecialidadeDto {
  nome: string;
  descricao?: string;
  ativa: boolean;
}

export interface PaginatedEspecialidades {
  items: Especialidade[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

---

#### **2.3 Service de API**

**Arquivo**: `src/Web/src/application/services/especialidadeService.ts`

**Métodos**:
- `getEspecialidades(page, pageSize, ativa?, search?)`
- `getEspecialidadeById(id)`
- `createEspecialidade(dto)`
- `updateEspecialidade(id, dto)`
- `deleteEspecialidade(id)`

---

#### **2.4 Custom Hook**

**Arquivo**: `src/Web/src/presentation/hooks/useEspecialidades.ts`

**Funcionalidades**:
- Estado de loading
- Estado de erro
- Lista de especialidades
- Paginação
- CRUD operations
- Refresh automático

---

#### **2.5 Componentes**

##### **EspecialidadesPageTable.tsx**
- Tabela responsiva (desktop)
- Cards otimizados (mobile)
- Paginação
- Filtros (ativa/inativa, busca)
- Botão de adicionar (FAB no mobile)
- Ações: visualizar, editar, excluir

##### **EspecialidadeCard.tsx**
- Card mobile-optimized
- Touch targets 44-48px
- Informações principais
- Ações inline

##### **EspecialidadeDialog.tsx**
- Formulário de criação/edição
- Validação com Zod
- React Hook Form
- Bottom sheet no mobile
- Campos:
  - Nome (obrigatório)
  - Descrição (opcional)
  - Ativa (switch)

##### **EspecialidadeDeleteDialog.tsx**
- Confirmação de exclusão
- Informações da especialidade
- Botões de ação

##### **EspecialidadeViewDialog.tsx**
- Visualização detalhada
- Modo somente leitura
- Informações formatadas

---

#### **2.6 Sidebar**

**Arquivo**: `src/Web/src/presentation/components/layout/Sidebar.tsx`

**Adição**:
```typescript
{
  id: 'especialidades',
  label: 'Especialidades',
  icon: <MedicalServices />,  // Ícone do MUI
  path: '/especialidades',
  roles: [UserProfile.ADMINISTRADOR],  // Apenas admin
}
```

**Posição**: Entre "Exames" e "Administração"

---

#### **2.7 Roteamento**

**Arquivo**: `src/Web/src/App.tsx`

```typescript
<Route 
  path="/especialidades" 
  element={
    <ProtectedRoute requiredRole={UserProfile.ADMINISTRADOR}>
      <EspecialidadesPageTable />
    </ProtectedRoute>
  } 
/>
```

---

## 📱 REQUISITOS DE UI/UX

### **Desktop**
- Tabela com colunas: Nome, Descrição (truncada), Status, Data Criação, Ações
- Filtros no topo: busca por nome, filtro por status
- Paginação no rodapé
- Botão "Adicionar Especialidade" no topo direito
- Ações por linha: visualizar, editar, excluir

### **Mobile**
- Cards com informações principais
- FAB (Floating Action Button) para adicionar
- Bottom sheets para dialogs
- Touch targets mínimos de 44px
- Scroll otimizado
- Lazy loading

### **Responsividade**
- Breakpoint: 960px (md)
- Transições suaves
- Layout adaptativo

---

## 🔒 SEGURANÇA E VALIDAÇÕES

### **Backend**
- ✅ Autenticação JWT obrigatória
- ✅ Role-based access (Admin apenas para CUD)
- ✅ Validação de DTOs com Data Annotations
- ✅ Índice único no nome (previne duplicatas)
- ✅ Sanitização de inputs
- ✅ Logging de operações

### **Frontend**
- ✅ Validação com Zod
- ✅ Feedback visual de erros
- ✅ Confirmação antes de excluir
- ✅ Mensagens de sucesso/erro
- ✅ Loading states

---

## 🧪 TESTES

### **Backend**
- [ ] Testes unitários do Service
- [ ] Testes de validação de DTOs
- [ ] Testes de endpoints
- [ ] Testes de duplicidade

### **Frontend**
- [ ] Testes de componentes
- [ ] Testes de hooks
- [ ] Testes de integração
- [ ] Testes de responsividade

---

## 📊 MÉTRICAS DE SUCESSO

- ✅ Migration executada sem erros
- ✅ Endpoints funcionando corretamente
- ✅ Interface responsiva (desktop e mobile)
- ✅ CRUD completo operacional
- ✅ Validações funcionando
- ✅ Performance adequada (< 2s para operações)
- ✅ Zero regressões em funcionalidades existentes

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### **Fase 1: Backend (Estimativa: 2-3h)**
1. ✅ Criar branch `ImplementEspecialidades`
2. ⏳ Criar entidade `Especialidade.cs`
3. ⏳ Atualizar entidade `Medico.cs` (adicionar FK e navigation property)
4. ⏳ Criar DTOs
5. ⏳ Configurar DbContext (Especialidade + relacionamento com Medico)
6. ⏳ Criar e executar migration
7. ⏳ Implementar `EspecialidadeService`
8. ⏳ Implementar endpoints no `Program.cs`
9. ⏳ Testar endpoints com Postman
10. ⏳ Verificar que endpoints de Médicos continuam funcionando

### **Fase 2: Frontend - Estrutura (Estimativa: 2-3h)**
11. ⏳ Criar interface TypeScript
12. ⏳ Criar service de API
13. ⏳ Criar custom hook
14. ⏳ Adicionar item no Sidebar
15. ⏳ Configurar rota

### **Fase 3: Frontend - Componentes (Estimativa: 3-4h)**
16. ⏳ Criar `EspecialidadesPageTable`
17. ⏳ Criar `EspecialidadeCard`
18. ⏳ Criar `EspecialidadeDialog`
19. ⏳ Criar `EspecialidadeDeleteDialog`
20. ⏳ Criar `EspecialidadeViewDialog`

### **Fase 4: Testes e Ajustes (Estimativa: 2h)**
21. ⏳ Testes de integração
22. ⏳ Testes mobile
23. ⏳ Ajustes de UI/UX
24. ⏳ Testes de regressão (especialmente CRUD de Médicos)
25. ⏳ Documentação

### **Fase 5: Review e Merge (Estimativa: 1h)**
26. ⏳ Code review
27. ⏳ Testes finais
28. ⏳ Merge para main

**Tempo Total Estimado**: 10-13 horas

**Nota Importante**: O relacionamento com Médicos está sendo implementado no backend nesta fase, mas o frontend de Médicos permanecerá inalterado. Isso garante:
- ✅ Zero impacto no frontend existente
- ✅ Banco de dados já preparado para futuras melhorias
- ✅ Compatibilidade retroativa mantida
- ✅ Migração gradual e segura

---

## 🔄 RELACIONAMENTO COM MÉDICO

**Status**: ✅ IMPLEMENTADO NO BACKEND (Nesta fase)

**Mudanças implementadas**:
1. ✅ Adicionar `EspecialidadeId` (Guid?, nullable) em `Medico`
2. ✅ Adicionar navigation property `Especialidade` em `Medico`
3. ✅ Criar relacionamento 1:N (Especialidade -> Médicos)
4. ✅ Configurar FK com `OnDelete(DeleteBehavior.SetNull)`
5. ✅ Manter campo `Especialidade` (string) temporariamente
6. ✅ Migration incluindo relacionamento

**Mudanças futuras (próxima fase)**:
1. ⏳ Atualizar formulário de médico para usar dropdown de especialidades
2. ⏳ Migrar dados existentes (string -> FK)
3. ⏳ Remover campo `Especialidade` (string) após migração
4. ⏳ Atualizar listagens para exibir nome da especialidade
5. ⏳ Atualizar DTOs de médico

**Comportamento atual**:
- Frontend de médicos continua funcionando normalmente
- Campo `Especialidade` (string) ainda é usado pelo frontend
- Campo `EspecialidadeId` é opcional (nullable)
- Ao excluir uma especialidade, `EspecialidadeId` dos médicos é setado para NULL

---

## 📝 CHECKLIST DE VALIDAÇÃO

### **Backend**
- [ ] Entidade Especialidade criada e configurada
- [ ] Entidade Medico atualizada (FK e navigation property)
- [ ] Relacionamento configurado no DbContext
- [ ] Migration executada com sucesso
- [ ] Service implementado
- [ ] Endpoints funcionando
- [ ] Validações operacionais
- [ ] Logs configurados
- [ ] Autenticação/autorização OK
- [ ] Endpoints de Médicos continuam funcionando (sem regressão)

### **Frontend**
- [ ] Interfaces TypeScript criadas
- [ ] Service de API funcionando
- [ ] Hook customizado operacional
- [ ] Sidebar atualizado
- [ ] Rota configurada
- [ ] Página principal responsiva
- [ ] Componentes mobile-optimized
- [ ] Dialogs funcionando
- [ ] Validações de formulário OK
- [ ] Feedback visual adequado

### **Testes**
- [ ] Testes backend passando
- [ ] Testes frontend passando
- [ ] Testes mobile OK
- [ ] Sem regressões

### **Documentação**
- [ ] README atualizado
- [ ] Swagger documentado
- [ ] Comentários no código

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO

1. ✅ CRUD completo funcionando (Create, Read, Update, Delete)
2. ✅ Interface responsiva (desktop e mobile)
3. ✅ Validações funcionando corretamente
4. ✅ Sem duplicatas de nomes
5. ✅ Performance adequada
6. ✅ Sem regressões em funcionalidades existentes
7. ✅ Código seguindo padrões do projeto
8. ✅ Documentação completa

---

## 📞 REFERÊNCIAS

- **Padrão de código**: Seguir estrutura de Médicos, Pacientes, Exames
- **Componentes mobile**: Usar `MobileOptimizedTable`, `MobileOptimizedDialog`
- **Estilos**: Usar `standardCardStyles` e variações
- **Validação**: Zod + React Hook Form
- **API**: Padrão REST com paginação

---

**Status**: 🚧 Pronto para implementação  
**Branch**: `ImplementEspecialidades`  
**Próximo passo**: Iniciar Fase 1 - Backend
