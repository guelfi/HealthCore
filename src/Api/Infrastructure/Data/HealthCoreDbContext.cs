using Microsoft.EntityFrameworkCore;
using HealthCore.Api.Core.Domain.Entities;
namespace HealthCore.Api.Infrastructure.Data
{
    public class HealthCoreDbContext(DbContextOptions<HealthCoreDbContext> options) : DbContext(options)
    {

        public virtual DbSet<Paciente> Pacientes { get; set; } = null!;
        public virtual DbSet<Exame> Exames { get; set; } = null!;
        public virtual DbSet<Medico> Medicos { get; set; } = null!;
        public virtual DbSet<Especialidade> Especialidades { get; set; } = null!;
        public virtual DbSet<User> Users { get; set; } = null!;
        public virtual DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public virtual DbSet<BlacklistedToken> BlacklistedTokens { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuração da entidade Especialidade
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
                    .WithOne(m => m.EspecialidadeNavigation)
                    .HasForeignKey(m => m.EspecialidadeId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configuração da entidade Paciente
            modelBuilder.Entity<Paciente>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.HasIndex(p => p.Documento).IsUnique();
                entity.Property(p => p.Nome).IsRequired().HasMaxLength(200);
                entity.Property(p => p.Documento).IsRequired().HasMaxLength(20);
                entity.Property(p => p.DataNascimento).IsRequired();
                
                // Relacionamento com Médico (opcional temporariamente)
                entity.HasOne(p => p.Medico)
                    .WithMany(m => m.Pacientes)
                    .HasForeignKey(p => p.MedicoId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);
            });

            // Configuração da entidade Exame
            modelBuilder.Entity<Exame>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.IdempotencyKey).IsUnique();
                entity.Property(e => e.IdempotencyKey).IsRequired();
                entity.Property(e => e.Modalidade).IsRequired();
                
                // Relacionamento com Paciente
                entity.HasOne(e => e.Paciente)
                    .WithMany(p => p.Exames)
                    .HasForeignKey(e => e.PacienteId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuração da entidade User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.Username).IsUnique();
                entity.Property(u => u.Username).IsRequired().HasMaxLength(50);
                entity.Property(u => u.PasswordHash).IsRequired();
                entity.Property(u => u.Role).IsRequired();
                entity.Property(u => u.IsActive).IsRequired().HasDefaultValue(true);
                entity.Property(u => u.CreatedAt).IsRequired();
            });

            // Configuração da entidade RefreshToken
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(rt => rt.Id);
                entity.HasIndex(rt => rt.Token).IsUnique();
                entity.Property(rt => rt.Token).IsRequired();
                entity.Property(rt => rt.ExpiresAt).IsRequired();
                entity.Property(rt => rt.CreatedAt).IsRequired();
                entity.Property(rt => rt.IsRevoked).IsRequired().HasDefaultValue(false);
                
                // Relacionamento com User
                entity.HasOne(rt => rt.User)
                    .WithMany()
                    .HasForeignKey(rt => rt.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuração da entidade BlacklistedToken
            modelBuilder.Entity<BlacklistedToken>(entity =>
            {
                entity.HasKey(bt => bt.Id);
                entity.HasIndex(bt => bt.TokenId).IsUnique();
                entity.Property(bt => bt.TokenId).IsRequired().HasMaxLength(100);
                entity.Property(bt => bt.ExpiresAt).IsRequired();
                entity.Property(bt => bt.BlacklistedAt).IsRequired();
                entity.Property(bt => bt.Reason).HasMaxLength(200);
            });

            // Configuração da entidade Medico
            modelBuilder.Entity<Medico>(entity =>
            {
                entity.HasKey(m => m.Id);
                entity.HasIndex(m => m.Documento).IsUnique();
                entity.HasIndex(m => m.CRM).IsUnique();
                entity.Property(m => m.Nome).IsRequired().HasMaxLength(200);
                entity.Property(m => m.Documento).IsRequired().HasMaxLength(20);
                entity.Property(m => m.DataNascimento).IsRequired();
                entity.Property(m => m.Telefone).HasMaxLength(20);
                entity.Property(m => m.Email).HasMaxLength(100);
                entity.Property(m => m.Endereco).HasMaxLength(300);
                entity.Property(m => m.CRM).IsRequired().HasMaxLength(20);
                entity.Property(m => m.Especialidade).IsRequired().HasMaxLength(100);
                entity.Property(m => m.DataCriacao).IsRequired();
                
                // FK para Especialidade (nullable - opcional)
                entity.Property(m => m.EspecialidadeId)
                    .IsRequired(false);
                
                entity.HasIndex(m => m.EspecialidadeId);
                
                // Relacionamento com User
                entity.HasOne(m => m.User)
                    .WithOne()
                    .HasForeignKey<Medico>(m => m.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                // Relacionamento com Exames (um médico pode realizar muitos exames)
                entity.HasMany(m => m.ExamesRealizados)
                    .WithOne()
                    .HasForeignKey("MedicoId")
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}