using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using FluentAssertions;
using MobileMed.Api.Core.Application.Services;
using MobileMed.Api.Core.Application.DTOs;
using MobileMed.Api.Infrastructure.Data;
using MobileMed.Api.Core.Domain.Entities;

namespace MobileMed.Api.Tests
{
    public class PacienteServiceTests : IDisposable
    {
        private readonly MobileMedDbContext _context;
        private readonly PacienteService _pacienteService;

        public PacienteServiceTests()
        {
            var options = new DbContextOptionsBuilder<MobileMedDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new MobileMedDbContext(options);
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
    }
}