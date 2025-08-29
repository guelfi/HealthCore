// Alterações necessárias no arquivo src/Api/Core/Application/Services/PacienteService.cs

// Método GetPacientesAsync atualizado
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