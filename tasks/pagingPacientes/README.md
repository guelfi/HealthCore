# 📄 Especificação de Implementação - Paginação de Pacientes

## 🎯 Objetivo

Implementar a paginação completa no backend para o endpoint de listagem de pacientes (`GET /pacientes`), fornecendo informações necessárias para que o frontend possa calcular corretamente o número total de páginas e registros.

## 📋 Problema Atual

Atualmente, o endpoint `GET /pacientes` retorna apenas um array simples de pacientes sem informações de paginação completas. O frontend espera uma estrutura de resposta que inclua:
- Total de registros
- Número total de páginas
- Página atual
- Tamanho da página

## 🏗️ Estrutura de Dados Necessária

### DTO de Resposta Paginada (Backend)

Criar um novo DTO no backend para representar a resposta paginada:

```csharp
public class PagedResponseDto<T>
{
    public List<T> Data { get; set; }
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}
```

### Interface Esperada pelo Frontend

O frontend já espera uma estrutura semelhante definida em [PacienteListResponse](file:///c:/Users/SP-MGUELFI/Projetos/DesafioTecnico/src/Web/src/domain/entities/Paciente.ts#L27-L33):

```typescript
interface PacienteListResponse {
  data: Paciente[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## 🔧 Alterações Necessárias no Backend

### 1. Criar DTO de Resposta Paginada

**Arquivo**: `src/Api/Core/Application/DTOs/PagedResponseDto.cs`

```csharp
namespace MobileMed.Api.Core.Application.DTOs
{
    public class PagedResponseDto<T>
    {
        public List<T> Data { get; set; } = new List<T>();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}
```

### 2. Modificar PacienteService

**Arquivo**: `src/Api/Core/Application/Services/PacienteService.cs`

Alterar o método `GetPacientesAsync` para retornar a nova estrutura:

```csharp
public async Task<PagedResponseDto<PacienteDto>> GetPacientesAsync(int page, int pageSize)
{
    // Calcular o total de pacientes
    var total = await _context.Pacientes.CountAsync();
    
    // Obter os pacientes paginados
    var pacientes = await _context.Pacientes
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    // Converter para DTOs
    var pacienteDtos = pacientes.Select(p => new PacienteDto
    {
        Id = p.Id,
        Nome = p.Nome,
        DataNascimento = p.DataNascimento,
        Documento = p.Documento
    }).ToList();

    // Calcular total de páginas
    var totalPages = (int)Math.Ceiling((double)total / pageSize);

    // Retornar resposta paginada
    return new PagedResponseDto<PacienteDto>
    {
        Data = pacienteDtos,
        Total = total,
        Page = page,
        PageSize = pageSize,
        TotalPages = totalPages
    };
}
```

### 3. Atualizar Endpoint no Program.cs

**Arquivo**: `src/Api/Program.cs`

Atualizar o endpoint `GET /pacientes` para usar o novo método:

```csharp
app.MapGet("/pacientes", async (PacienteService pacienteService, int page = 1, int pageSize = 10, ILogger<Program> logger) =>
{
    logger.LogInformation("Listando pacientes - Página: {Page}, Tamanho da página: {PageSize}", page, pageSize);
    var pacientes = await pacienteService.GetPacientesAsync(page, pageSize);
    logger.LogInformation("Listagem de pacientes concluída. Número de pacientes retornados: {Count}", pacientes.Data.Count);
    return Results.Ok(pacientes);
});
```

## ✅ Critérios de Validação

Após a implementação, o endpoint deve retornar uma resposta no seguinte formato:

```json
{
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "nome": "João da Silva",
      "dataNascimento": "1990-01-01T00:00:00",
      "documento": "12345678901"
    }
  ],
  "total": 23,
  "page": 1,
  "pageSize": 10,
  "totalPages": 3
}
```

## 🧪 Testes Necessários

1. Verificar que o endpoint retorna a estrutura correta
2. Confirmar que o total de registros é calculado corretamente
3. Validar que o número de páginas é calculado corretamente
4. Testar diferentes valores de page e pageSize
5. Verificar que o frontend consegue consumir a nova estrutura

## 📦 Próximos Passos

1. Implementar as mudanças descritas acima
2. Testar localmente a nova implementação
3. Fazer build do projeto para validar a compilação
4. Commitar as mudanças no repositório
5. Sincronizar com o GitHub para que o frontend possa consumir a nova API