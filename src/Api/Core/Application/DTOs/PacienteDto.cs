namespace MobileMed.Api.Core.Application.DTOs
{
    public class PacienteDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public DateTime DataNascimento { get; set; }
        public string Documento { get; set; } = string.Empty;
    }
}