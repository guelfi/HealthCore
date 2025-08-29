// Alterações necessárias no arquivo src/Api/Program.cs

// Endpoint GET /pacientes atualizado para retornar dados paginados
app.MapGet("/pacientes", async (PacienteService pacienteService, int page = 1, int pageSize = 10, ILogger<Program> logger) =>
{
    logger.LogInformation("Listando pacientes - Página: {Page}, Tamanho da página: {PageSize}", page, pageSize);
    var pacientes = await pacienteService.GetPacientesAsync(page, pageSize);
    logger.LogInformation("Listagem de pacientes concluída. Número de pacientes retornados: {Count}", pacientes.Data.Count);
    return Results.Ok(pacientes);
});