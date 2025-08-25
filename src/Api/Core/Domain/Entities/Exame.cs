namespace MobileMed.Api.Core.Domain.Entities
{
    public class Exame
    {
        public Guid Id { get; set; }
        public string IdempotencyKey { get; set; } = string.Empty;
        public ModalidadeExame Modalidade { get; set; }
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
        
        // Relacionamento com Paciente
        public Guid PacienteId { get; set; }
        public Paciente Paciente { get; set; } = null!;
    }
    
    public enum ModalidadeExame
    {
        CR, // Computed Radiography
        CT, // Computed Tomography
        DX, // Digital Radiography
        MG, // Mammography
        MR, // Magnetic Resonance
        NM, // Nuclear Medicine
        OT, // Other
        PT, // Positron Emission Tomography (PET)
        RF, // Radio Fluoroscopy
        US, // Ultrasound
        XA  // X-Ray Angiography
    }
}