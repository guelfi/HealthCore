using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using FluentAssertions;
using HealthCore.Api.Core.Application.Services;
using HealthCore.Api.Core.Application.DTOs;
using HealthCore.Api.Infrastructure.Data;
using HealthCore.Api.Core.Domain.Entities;

namespace HealthCore.Api.Tests
{
    public class PacienteServiceTests : IDisposable
    {
        private readonly HealthCoreDbContext _context;
        private readonly PacienteService _pacienteService;

        public PacienteServiceTests()
        {
            var options = new DbContextOptionsBuilder<HealthCoreDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new HealthCoreDbContext(options);
            _pacienteService = new PacienteService(_context);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        [Fact]
        public async Task CreatePacienteAsync_ShouldCreatePaciente_WhenDocumentIsUnique()
        {
            // Arrange
            var createPacienteDto = new CreatePacienteDto
            {
                Nome = "Test User",
                Documento = "12345678901"
            };

            // Act
            var result = await _pacienteService.CreatePacienteAsync(createPacienteDto);

            // Assert
            result.Should().NotBeNull();
            result.Nome.Should().Be(createPacienteDto.Nome);
            var savedPaciente = await _context.Pacientes.FindAsync(result.Id);
            savedPaciente.Should().NotBeNull();
        }

        [Fact]
        public async Task CreatePacienteAsync_ShouldThrowException_WhenDocumentExists()
        {
            // Arrange
            var createPacienteDto = new CreatePacienteDto
            {
                Nome = "Test User",
                Documento = "12345678901"
            };
            await _context.Pacientes.AddAsync(new Paciente { Id = Guid.NewGuid(), Documento = "12345678901" });
            await _context.SaveChangesAsync();

            // Act
            Func<Task> act = async () => await _pacienteService.CreatePacienteAsync(createPacienteDto);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("Já existe um paciente cadastrado com este documento.");
        }

        [Fact]
        public async Task GetPacientesAsync_ShouldReturnPagedListOfPacientes()
        {
            // Arrange
            var pacientes = new List<Paciente>
            {
                new Paciente { Id = Guid.NewGuid(), Nome = "Paciente 1" },
                new Paciente { Id = Guid.NewGuid(), Nome = "Paciente 2" },
                new Paciente { Id = Guid.NewGuid(), Nome = "Paciente 3" }
            };
            
            await _context.Pacientes.AddRangeAsync(pacientes);
            await _context.SaveChangesAsync();

            // Act
            var result = await _pacienteService.GetPacientesAsync(1, 2);

            // Assert
            result.Should().NotBeNull();
            result.Data.Should().HaveCount(2);
            result.Total.Should().Be(3);
            result.Page.Should().Be(1);
            result.PageSize.Should().Be(2);
            result.TotalPages.Should().Be(2);
        }

        [Fact]
        public async Task UpdatePacienteAsync_ShouldUpdatePaciente_WhenPacienteExists()
        {
            // Arrange
            var pacienteId = Guid.NewGuid();
            await _context.Pacientes.AddAsync(new Paciente { Id = pacienteId, Nome = "Old Name" });
            await _context.SaveChangesAsync();
            var updateDto = new UpdatePacienteDto { Nome = "New Name" };

            // Act
            var result = await _pacienteService.UpdatePacienteAsync(pacienteId, updateDto);

            // Assert
            result.Should().NotBeNull();
            result.Nome.Should().Be("New Name");
        }

        [Fact]
        public async Task UpdatePacienteAsync_ShouldReturnNull_WhenPacienteDoesNotExist()
        {
            // Arrange
            var pacienteId = Guid.NewGuid();
            var updateDto = new UpdatePacienteDto { Nome = "New Name" };

            // Act
            var result = await _pacienteService.UpdatePacienteAsync(pacienteId, updateDto);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task DeletePacienteAsync_ShouldDeletePaciente_WhenPacienteExists()
        {
            // Arrange
            var pacienteId = Guid.NewGuid();
            await _context.Pacientes.AddAsync(new Paciente { Id = pacienteId });
            await _context.SaveChangesAsync();

            // Act
            var result = await _pacienteService.DeletePacienteAsync(pacienteId);

            // Assert
            result.Should().BeTrue();
            var deletedPaciente = await _context.Pacientes.FindAsync(pacienteId);
            deletedPaciente.Should().BeNull();
        }

        [Fact]
        public async Task DeletePacienteAsync_ShouldReturnFalse_WhenPacienteDoesNotExist()
        {
            // Arrange
            var pacienteId = Guid.NewGuid();

            // Act
            var result = await _pacienteService.DeletePacienteAsync(pacienteId);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task GetPacienteByIdAsync_ShouldReturnPaciente_WhenPacienteExists()
        {
            // Arrange
            var medicoId = Guid.NewGuid();
            var pacienteId = Guid.NewGuid();
            var medico = new Medico { Id = medicoId, Nome = "Dr. Test", CRM = "12345" };
            var paciente = new Paciente { Id = pacienteId, Nome = "Test Patient", MedicoId = medicoId };
            
            await _context.Medicos.AddAsync(medico);
            await _context.Pacientes.AddAsync(paciente);
            await _context.SaveChangesAsync();

            // Act
            var result = await _pacienteService.GetPacienteByIdAsync(pacienteId);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(pacienteId);
            result.Nome.Should().Be("Test Patient");
            result.MedicoNome.Should().Be("Dr. Test");
        }

        [Fact]
        public async Task GetPacienteByIdAsync_ShouldReturnNull_WhenPacienteDoesNotExist()
        {
            // Arrange
            var pacienteId = Guid.NewGuid();

            // Act
            var result = await _pacienteService.GetPacienteByIdAsync(pacienteId);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task SearchPacientesByNomeAsync_ShouldReturnMatchingPacientes()
        {
            // Arrange
            var medico = new Medico { Id = Guid.NewGuid(), Nome = "Dr. Test", CRM = "12345" };
            var pacientes = new List<Paciente>
            {
                new Paciente { Id = Guid.NewGuid(), Nome = "João Silva", MedicoId = medico.Id },
                new Paciente { Id = Guid.NewGuid(), Nome = "Maria João", MedicoId = medico.Id },
                new Paciente { Id = Guid.NewGuid(), Nome = "Pedro Santos", MedicoId = medico.Id }
            };
            
            await _context.Medicos.AddAsync(medico);
            await _context.Pacientes.AddRangeAsync(pacientes);
            await _context.SaveChangesAsync();

            // Act
            var result = await _pacienteService.SearchPacientesByNomeAsync("João", 1, 10);

            // Assert
            result.Should().NotBeNull();
            result!.Data.Should().HaveCount(2);
            result!.Data.Should().OnlyContain(p => p.Nome != null && p.Nome.Contains("João"));
            result!.Total.Should().Be(2);
        }

        [Fact]
        public async Task SearchPacientesByNomeAsync_ShouldReturnEmptyList_WhenNoMatches()
        {
            // Arrange
            var pacientes = new List<Paciente>
            {
                new Paciente { Id = Guid.NewGuid(), Nome = "João Silva" },
                new Paciente { Id = Guid.NewGuid(), Nome = "Maria Santos" }
            };
            
            await _context.Pacientes.AddRangeAsync(pacientes);
            await _context.SaveChangesAsync();

            // Act
            var result = await _pacienteService.SearchPacientesByNomeAsync("Carlos", 1, 10);

            // Assert
            result.Should().NotBeNull();
            result.Data.Should().BeEmpty();
            result.Total.Should().Be(0);
        }

        [Fact]
        public async Task SearchPacientesByNomeAsync_ShouldFilterByMedicoId_WhenProvided()
        {
            // Arrange
            var medico1Id = Guid.NewGuid();
            var medico2Id = Guid.NewGuid();
            var medico1 = new Medico { Id = medico1Id, Nome = "Dr. Test 1", CRM = "12345" };
            var medico2 = new Medico { Id = medico2Id, Nome = "Dr. Test 2", CRM = "67890" };
            
            var pacientes = new List<Paciente>
            {
                new Paciente { Id = Guid.NewGuid(), Nome = "João Silva", MedicoId = medico1Id },
                new Paciente { Id = Guid.NewGuid(), Nome = "João Santos", MedicoId = medico2Id }
            };
            
            await _context.Medicos.AddRangeAsync(new[] { medico1, medico2 });
            await _context.Pacientes.AddRangeAsync(pacientes);
            await _context.SaveChangesAsync();

            // Act
            var result = await _pacienteService.SearchPacientesByNomeAsync("João", 1, 10, medico1Id);

            // Assert
            result.Should().NotBeNull();
            result.Data.Should().HaveCount(1);
            result.Data.First().Nome.Should().Be("João Silva");
            result.Total.Should().Be(1);
        }
    }
}