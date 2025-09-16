using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;
using FluentAssertions;
using HealthCore.Api.Core.Application.Services;
using HealthCore.Api.Core.Application.DTOs;
using HealthCore.Api.Infrastructure.Data;
using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Core.Domain.Enums;

namespace HealthCore.Api.Tests
{
    public class ConcurrencyAndEdgeCaseTests : IDisposable
    {
        private readonly HealthCoreDbContext _context;
        private readonly ExameService _exameService;
        private readonly PacienteService _pacienteService;

        public ConcurrencyAndEdgeCaseTests()
        {
            var options = new DbContextOptionsBuilder<HealthCoreDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new HealthCoreDbContext(options);
            _exameService = new ExameService(_context);
            _pacienteService = new PacienteService(_context);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        [Fact]
        public async Task CreateExameAsync_ShouldHandleConcurrentRequests_WithSameIdempotencyKey()
        {
            // Arrange
            var pacienteId = Guid.NewGuid();
            await _context.Pacientes.AddAsync(new Paciente { Id = pacienteId, Nome = "Teste", Documento = "12345678901", DataNascimento = DateTime.Now.AddYears(-30) });
            await _context.SaveChangesAsync();

            var idempotencyKey = Guid.NewGuid().ToString();
            var createExameDto = new CreateExameDto
            {
                PacienteId = pacienteId,
                IdempotencyKey = idempotencyKey,
                Modalidade = "CT"
            };

            // Act - Executar múltiplas requisições concorrentes
            var tasks = new List<Task<ExameDto?>>();
            for (int i = 0; i < 10; i++)
            {
                tasks.Add(Task.Run(async () =>
                {
                    try
                    {
                        return await _exameService.CreateExameAsync(createExameDto);
                    }
                    catch
                    {
                        return null; // Algumas podem falhar, isso é esperado
                    }
                }));
            }

            var results = await Task.WhenAll(tasks);

            // Assert
            var successfulResults = results.Where(r => r != null).ToList();
            successfulResults.Should().NotBeEmpty("Pelo menos uma requisição deve ter sucesso");

            // Verificar que apenas um exame foi criado no banco
            var examesTotais = await _context.Exames.CountAsync(e => e.IdempotencyKey == idempotencyKey);
            examesTotais.Should().Be(1, "Deve haver apenas um exame com a mesma idempotencyKey");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData(null)]
        public async Task CreatePacienteAsync_ShouldThrowException_WhenNomeIsInvalid(string nomeInvalido)
        {
            // Arrange
            var createPacienteDto = new CreatePacienteDto
            {
                Nome = nomeInvalido,
                Documento = "12345678901",
                DataNascimento = DateTime.Now.AddYears(-30)
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _pacienteService.CreatePacienteAsync(createPacienteDto));
        }

        [Theory]
        [InlineData("1234567890")]     // 10 dígitos
        [InlineData("123456789012")]   // 12 dígitos
        [InlineData("1234567890a")]    // Com letra
        [InlineData("")]               // Vazio
        [InlineData("11111111111")]    // Todos iguais
        public async Task CreatePacienteAsync_ShouldThrowException_WhenDocumentoIsInvalid(string documentoInvalido)
        {
            // Arrange
            var createPacienteDto = new CreatePacienteDto
            {
                Nome = "Teste",
                Documento = documentoInvalido,
                DataNascimento = DateTime.Now.AddYears(-30)
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _pacienteService.CreatePacienteAsync(createPacienteDto));
            exception.Should().NotBeNull();
        }

        [Fact]
        public async Task CreatePacienteAsync_ShouldThrowException_WhenDataNascimentoIsFuture()
        {
            // Arrange
            var createPacienteDto = new CreatePacienteDto
            {
                Nome = "Teste",
                Documento = "12345678901",
                DataNascimento = DateTime.Now.AddDays(1) // Data futura
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _pacienteService.CreatePacienteAsync(createPacienteDto));
        }

        [Theory]
        [InlineData("INVALID")]
        [InlineData("")]
        [InlineData("ABC")]
        [InlineData("123")]
        public async Task CreateExameAsync_ShouldThrowException_WhenModalidadeIsInvalid(string modalidadeInvalida)
        {
            // Arrange
            var pacienteId = Guid.NewGuid();
            await _context.Pacientes.AddAsync(new Paciente { Id = pacienteId, Nome = "Teste", Documento = "12345678901", DataNascimento = DateTime.Now.AddYears(-30) });
            await _context.SaveChangesAsync();

            var createExameDto = new CreateExameDto
            {
                PacienteId = pacienteId,
                IdempotencyKey = Guid.NewGuid().ToString(),
                Modalidade = modalidadeInvalida
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _exameService.CreateExameAsync(createExameDto));
        }

        [Fact]
        public async Task GetPacientesAsync_ShouldReturnEmptyList_WhenNoData()
        {
            // Arrange - Context já vazio

            // Act
            var result = await _pacienteService.GetPacientesAsync(1, 10);

            // Assert
            result.Should().NotBeNull();
            result.Data.Should().BeEmpty();
            result.Total.Should().Be(0);
            result.TotalPages.Should().Be(0);
        }

        [Fact]
        public async Task GetPacientesAsync_ShouldHandleLargePageSize()
        {
            // Arrange
            var pacientes = new List<Paciente>();
            for (int i = 0; i < 100; i++)
            {
                pacientes.Add(new Paciente
                {
                    Id = Guid.NewGuid(),
                    Nome = $"Paciente {i}",
                    Documento = $"{i:D11}",
                    DataNascimento = DateTime.Now.AddYears(-30)
                });
            }
            await _context.Pacientes.AddRangeAsync(pacientes);
            await _context.SaveChangesAsync();

            // Act
            var result = await _pacienteService.GetPacientesAsync(1, 1000); // Page size muito grande

            // Assert
            result.Should().NotBeNull();
            result.Data.Should().HaveCount(100);
            result.Total.Should().Be(100);
        }

        [Theory]
        [InlineData(-1, 10)]    // Page negativo
        [InlineData(0, 10)]     // Page zero
        [InlineData(1, -1)]     // PageSize negativo
        [InlineData(1, 0)]      // PageSize zero
        public async Task GetPacientesAsync_ShouldHandleInvalidPagination(int page, int pageSize)
        {
            // Arrange & Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => 
                _pacienteService.GetPacientesAsync(page, pageSize));
            exception.Should().NotBeNull();
        }

        [Fact]
        public async Task CreateExameAsync_ShouldCreateSuccessfully_WithAllValidModalidades()
        {
            // Arrange
            var pacienteId = Guid.NewGuid();
            await _context.Pacientes.AddAsync(new Paciente { Id = pacienteId, Nome = "Teste", Documento = "12345678901", DataNascimento = DateTime.Now.AddYears(-30) });
            await _context.SaveChangesAsync();

            var modalidadesValidas = new[] { "CR", "CT", "DX", "MG", "MR", "NM", "OT", "PT", "RF", "US", "XA" };

            // Act & Assert
            foreach (var modalidade in modalidadesValidas)
            {
                var createExameDto = new CreateExameDto
                {
                    PacienteId = pacienteId,
                    IdempotencyKey = Guid.NewGuid().ToString(),
                    Modalidade = modalidade
                };

                var result = await _exameService.CreateExameAsync(createExameDto);
                result.Should().NotBeNull();
                result.Modalidade.Should().Be(modalidade);
            }
        }

        [Fact]
        public async Task DatabaseConcurrencyTest_ShouldHandleMultiplePacienteCreation()
        {
            // Arrange
            var tasks = new List<Task<PacienteDto?>>();

            // Act - Criar múltiplos pacientes simultaneamente
            for (int i = 0; i < 50; i++)
            {
                var index = i; // Capture variable for closure
                tasks.Add(Task.Run(async () =>
                {
                    try
                    {
                        var createDto = new CreatePacienteDto
                        {
                            Nome = $"Paciente Concorrente {index}",
                            Documento = $"{index:D11}",
                            DataNascimento = DateTime.Now.AddYears(-25)
                        };
                        return await _pacienteService.CreatePacienteAsync(createDto);
                    }
                    catch
                    {
                        return null;
                    }
                }));
            }

            var results = await Task.WhenAll(tasks);

            // Assert
            var successfulResults = results.Where(r => r != null).ToList();
            successfulResults.Should().HaveCount(50, "Todos os pacientes devem ser criados com sucesso");

            var totalPacientes = await _context.Pacientes.CountAsync();
            totalPacientes.Should().Be(50, "Todos os pacientes devem estar no banco");
        }

        [Fact]
        public async Task ExameService_ShouldHandleNullAndEmptyGuidParameters()
        {
            // Arrange & Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => 
                _exameService.GetExameByIdAsync(Guid.Empty));
            
            var result = await _exameService.GetExameByIdAsync(Guid.NewGuid());
            result.Should().BeNull("Exame inexistente deve retornar null");
        }

        [Fact]
        public async Task PacienteService_ShouldHandleSpecialCharactersInNome()
        {
            // Arrange
            var nomesEspeciais = new[]
            {
                "José da Silva",
                "Maria José O'Connor",
                "Ana-Paula",
                "João ç Acentos àáéíóú",
                "名前" // Caracteres unicode
            };

            // Act & Assert
            foreach (var nome in nomesEspeciais)
            {
                var createDto = new CreatePacienteDto
                {
                    Nome = nome,
                    Documento = Guid.NewGuid().ToString().Replace("-", "").Substring(0, 11),
                    DataNascimento = DateTime.Now.AddYears(-30)
                };

                var result = await _pacienteService.CreatePacienteAsync(createDto);
                result.Should().NotBeNull();
                result.Nome.Should().Be(nome);
            }
        }
    }
}
