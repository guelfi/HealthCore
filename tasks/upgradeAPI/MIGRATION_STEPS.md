# Passos Detalhados da Migração - Módulo Médicos

## 🎯 Objetivo
Criar e aplicar a migração do Entity Framework para a entidade Médico no banco de dados SQLite.

## 📋 Pré-requisitos
- macOS com .NET SDK 8.0+ instalado
- Entity Framework Core Tools instalado
- Repositório atualizado com as últimas alterações

## 🔧 Instalação do EF Core Tools (se necessário)
```bash
# Instalar globalmente
dotnet tool install --global dotnet-ef

# Ou atualizar se já instalado
dotnet tool update --global dotnet-ef

# Verificar instalação
dotnet ef --version
```

## 📂 Estrutura da Entidade Médico
A entidade já está implementada com os seguintes campos:

```csharp
public class Medico
{
    public int Id { get; set; }
    public string NomeCompleto { get; set; }
    public string Documento { get; set; }  // CPF
    public string Crm { get; set; }
    public string Especialidade { get; set; }
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    
    // Relacionamento com User (1:1)
    public int UserId { get; set; }
    public User User { get; set; }
    
    // Relacionamento com Exames (1:N)
    public ICollection<Exame> Exames { get; set; } = new List<Exame>();
}
```

## 🚀 Passos de Execução

### Passo 1: Navegar para o Diretório da API
```bash
cd /caminho/para/o/projeto/src/Api
```

### Passo 2: Verificar o Estado Atual
```bash
# Listar migrações existentes
dotnet ef migrations list

# Verificar status do banco
dotnet ef database update --dry-run
```

### Passo 3: Criar a Migração
```bash
# Criar migração para a entidade Médico
dotnet ef migrations add AddMedicoEntity
```

**Saída esperada:**
```
Build succeeded.
Done. To undo this action, use 'dotnet ef migrations remove'
```

### Passo 4: Revisar a Migração Gerada
```bash
# Verificar arquivos criados
ls -la Migrations/

# Visualizar conteúdo da migração
cat Migrations/*_AddMedicoEntity.cs
```

**Estrutura esperada da migração:**
- Criação da tabela `Medicos`
- Índices únicos para `Documento` e `Crm`
- Chave estrangeira para `Users`
- Configurações de tamanho e obrigatoriedade

### Passo 5: Aplicar a Migração
```bash
# Aplicar migração ao banco de dados
dotnet ef database update
```

**Saída esperada:**
```
Build succeeded.
Applying migration '20250831_AddMedicoEntity'.
Done.
```

### Passo 6: Verificar a Aplicação
```bash
# Verificar status final
dotnet ef migrations list

# Verificar estrutura do banco (opcional)
sqlite3 mobilemed.db ".schema Medicos"
```

## 🔍 Validações Pós-Migração

### 1. Verificar Tabela Criada
```sql
-- Conectar ao SQLite
sqlite3 mobilemed.db

-- Verificar estrutura da tabela
.schema Medicos

-- Verificar índices
.indices Medicos

-- Sair
.quit
```

### 2. Testar Inserção Manual (Opcional)
```sql
-- Inserir um médico de teste
INSERT INTO Medicos (NomeCompleto, Documento, Crm, Especialidade, UserId, Ativo, DataCriacao)
VALUES ('Dr. Teste', '12345678901', 'CRM12345', 'Cardiologia', 1, 1, datetime('now'));

-- Verificar inserção
SELECT * FROM Medicos;

-- Remover teste
DELETE FROM Medicos WHERE NomeCompleto = 'Dr. Teste';
```

## ⚠️ Possíveis Problemas e Soluções

### Problema 1: Erro de Build
```bash
# Limpar e restaurar
dotnet clean
dotnet restore
dotnet build
```

### Problema 2: Migração já Existe
```bash
# Remover migração duplicada
dotnet ef migrations remove

# Recriar com nome diferente
dotnet ef migrations add AddMedicoEntityV2
```

### Problema 3: Conflito de Chave Estrangeira
- Verificar se a tabela `Users` existe
- Confirmar que o relacionamento está correto no DbContext

### Problema 4: Banco de Dados Bloqueado
```bash
# Parar a aplicação se estiver rodando
# Verificar processos usando o banco
lsof mobilemed.db
```

## 📝 Arquivos Afetados
Após a migração, os seguintes arquivos serão criados/modificados:

- `Migrations/YYYYMMDD_AddMedicoEntity.cs` (novo)
- `Migrations/MobileMedDbContextModelSnapshot.cs` (atualizado)
- `mobilemed.db` (estrutura atualizada)

## ✅ Critérios de Sucesso
- [ ] Migração criada sem erros
- [ ] Migração aplicada com sucesso
- [ ] Tabela `Medicos` criada no banco
- [ ] Índices únicos configurados
- [ ] Relacionamentos funcionando
- [ ] Sem conflitos com migrações existentes

## 🔄 Próximos Passos
Após completar a migração com sucesso:
1. Executar a API: `dotnet run`
2. Testar endpoints de médicos
3. Validar integração com frontend
4. Executar testes automatizados (se disponíveis)

Consulte `VALIDATION_CHECKLIST.md` para os próximos passos.