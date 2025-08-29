# Correção da Paginação de Pacientes

## Problema Identificado
O frontend está esperando uma estrutura de resposta paginada completa com metadados (total, totalPages, etc.), mas a API backend está retornando apenas um array simples de pacientes.

## Solução Implementada
1. Criação do DTO de resposta paginada
2. Atualização do serviço de pacientes para retornar metadados de paginação
3. Atualização do endpoint GET /pacientes para usar a nova estrutura

## Arquivos a serem aplicados no macOS

### 1. Criar PagedResponseDto.cs
Caminho: `src/Api/Core/Application/DTOs/PagedResponseDto.cs`

```csharp
using System;
using System.Collections.Generic;

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

### 2. Atualizar PacienteService.cs
Caminho: `src/Api/Core/Application/Services/PacienteService.cs`

Substituir o método `GetPacientesAsync` pelo seguinte:

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

### 3. Atualizar Program.cs
Caminho: `src/Api/Program.cs`

Atualizar o endpoint GET /pacientes:

```csharp
app.MapGet("/pacientes", async (PacienteService pacienteService, int page = 1, int pageSize = 10, ILogger<Program> logger) =>
{
    logger.LogInformation("Listando pacientes - Página: {Page}, Tamanho da página: {PageSize}", page, pageSize);
    var pacientes = await pacienteService.GetPacientesAsync(page, pageSize);
    logger.LogInformation("Listagem de pacientes concluída. Número de pacientes retornados: {Count}", pacientes.Data.Count);
    return Results.Ok(pacientes);
});
```

## Após aplicar as correções
1. Executar o build da solução .NET Core
2. Reiniciar o serviço da API
3. Testar a paginação no frontend