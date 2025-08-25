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
    public class PacienteServiceTests
    {
        private readonly PacienteService _pacienteService;
        private readonly Mock<MobileMedDbContext> _mockContext;
        private readonly Mock<DbSet<Paciente>> _mockPacienteDbSet;
        private readonly List<Paciente> _pacientes;

        public PacienteServiceTests()
        {
            _pacientes = new List<Paciente>();
            _mockPacienteDbSet = new Mock<DbSet<Paciente>>();
            var queryablePacientes = new TestAsyncEnumerable<Paciente>(_pacientes).AsQueryable();
            _mockPacienteDbSet.As<IQueryable<Paciente>>().Setup(m => m.Provider).Returns(queryablePacientes.Provider);
            _mockPacienteDbSet.As<IQueryable<Paciente>>().Setup(m => m.Expression).Returns(queryablePacientes.Expression);
            _mockPacienteDbSet.As<IQueryable<Paciente>>().Setup(m => m.ElementType).Returns(queryablePacientes.ElementType);
            _mockPacienteDbSet.As<IAsyncEnumerable<Paciente>>().Setup(m => m.GetAsyncEnumerator(default)).Returns(new TestAsyncEnumerator<Paciente>(queryablePacientes.GetEnumerator()));

            _mockPacienteDbSet.Setup(d => d.Add(It.IsAny<Paciente>())).Callback<Paciente>((s) => _pacientes.Add(s));
            _mockPacienteDbSet.Setup(d => d.Remove(It.IsAny<Paciente>())).Callback<Paciente>((s) => _pacientes.Remove(s));
            _mockPacienteDbSet.Setup(d => d.FindAsync(It.IsAny<object[]>()))
                .Returns<object[]>(ids => new ValueTask<Paciente?>(_pacientes.FirstOrDefault(d => d.Id == (Guid)ids[0])));

            var options = new DbContextOptionsBuilder<MobileMedDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _mockContext = new Mock<MobileMedDbContext>(options);
            _mockContext.Setup(c => c.Pacientes).Returns(_mockPacienteDbSet.Object);
            _mockContext.Setup(c => c.SaveChangesAsync(default)).ReturnsAsync(1);

            _pacienteService = new PacienteService(_mockContext.Object);
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
            _pacientes.Should().HaveCount(1);
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
            _pacientes.Add(new Paciente { Documento = "12345678901" });

            // Act
            Func<Task> act = async () => await _pacienteService.CreatePacienteAsync(createPacienteDto);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("Já existe um paciente cadastrado com este documento.");
        }

        [Fact]
        public async Task GetPacientesAsync_ShouldReturnPagedListOfPacientes()
        {
            // Arrange
            _pacientes.Add(new Paciente { Nome = "Paciente 1" });
            _pacientes.Add(new Paciente { Nome = "Paciente 2" });
            _pacientes.Add(new Paciente { Nome = "Paciente 3" });

            // Act
            var result = await _pacienteService.GetPacientesAsync(1, 2);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task UpdatePacienteAsync_ShouldUpdatePaciente_WhenPacienteExists()
        {
            // Arrange
            var pacienteId = Guid.NewGuid();
            _pacientes.Add(new Paciente { Id = pacienteId, Nome = "Old Name" });
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
            _pacientes.Add(new Paciente { Id = pacienteId });

            // Act
            var result = await _pacienteService.DeletePacienteAsync(pacienteId);

            // Assert
            result.Should().BeTrue();
            _pacientes.Should().BeEmpty();
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