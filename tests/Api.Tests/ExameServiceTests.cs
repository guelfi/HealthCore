
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
    public class ExameServiceTests
    {
        private readonly ExameService _exameService;
        private readonly Mock<MobileMedDbContext> _mockContext;
        private readonly Mock<DbSet<Exame>> _mockExameDbSet;
        private readonly Mock<DbSet<Paciente>> _mockPacienteDbSet;
        private readonly List<Exame> _exames;
        private readonly List<Paciente> _pacientes;

        public ExameServiceTests()
        {
            _exames = new List<Exame>();
            _pacientes = new List<Paciente>();
            _mockExameDbSet = new Mock<DbSet<Exame>>();
            _mockPacienteDbSet = new Mock<DbSet<Paciente>>();

            var queryableExames = new TestAsyncEnumerable<Exame>(_exames).AsQueryable();
            _mockExameDbSet.As<IQueryable<Exame>>().Setup(m => m.Provider).Returns(queryableExames.Provider);
            _mockExameDbSet.As<IQueryable<Exame>>().Setup(m => m.Expression).Returns(queryableExames.Expression);
            _mockExameDbSet.As<IQueryable<Exame>>().Setup(m => m.ElementType).Returns(queryableExames.ElementType);
            _mockExameDbSet.As<IAsyncEnumerable<Exame>>().Setup(m => m.GetAsyncEnumerator(default)).Returns(new TestAsyncEnumerator<Exame>(queryableExames.GetEnumerator()));

            var queryablePacientes = new TestAsyncEnumerable<Paciente>(_pacientes).AsQueryable();
            _mockPacienteDbSet.As<IQueryable<Paciente>>().Setup(m => m.Provider).Returns(queryablePacientes.Provider);
            _mockPacienteDbSet.As<IQueryable<Paciente>>().Setup(m => m.Expression).Returns(queryablePacientes.Expression);
            _mockPacienteDbSet.As<IQueryable<Paciente>>().Setup(m => m.ElementType).Returns(queryablePacientes.ElementType);
            _mockPacienteDbSet.As<IAsyncEnumerable<Paciente>>().Setup(m => m.GetAsyncEnumerator(default)).Returns(new TestAsyncEnumerator<Paciente>(queryablePacientes.GetEnumerator()));

            _mockExameDbSet.Setup(d => d.Add(It.IsAny<Exame>())).Callback<Exame>((s) => _exames.Add(s));
            _mockExameDbSet.Setup(d => d.Remove(It.IsAny<Exame>())).Callback<Exame>((s) => _exames.Remove(s));
            _mockExameDbSet.Setup(d => d.FindAsync(It.IsAny<object[]>()))
                .Returns<object[]>(ids => new ValueTask<Exame?>(_exames.FirstOrDefault(d => d.Id == (Guid)ids[0])));

            _mockPacienteDbSet.Setup(d => d.Add(It.IsAny<Paciente>())).Callback<Paciente>((s) => _pacientes.Add(s));
            _mockPacienteDbSet.Setup(d => d.FindAsync(It.IsAny<object[]>()))
                .Returns<object[]>(ids => new ValueTask<Paciente?>(_pacientes.FirstOrDefault(d => d.Id == (Guid)ids[0])));

            var options = new DbContextOptionsBuilder<MobileMedDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _mockContext = new Mock<MobileMedDbContext>(options);
            _mockContext.Setup(c => c.Exames).Returns(_mockExameDbSet.Object);
            _mockContext.Setup(c => c.Pacientes).Returns(_mockPacienteDbSet.Object);
            _mockContext.Setup(c => c.SaveChangesAsync(default)).ReturnsAsync(1);

            _exameService = new ExameService(_mockContext.Object);
        }

        [Fact]
        public async Task CreateExameAsync_ShouldCreateExame_WhenDataIsValid()
        {
            // Arrange
            var pacienteId = Guid.NewGuid();
            _pacientes.Add(new Paciente { Id = pacienteId });
            var createExameDto = new CreateExameDto
            {
                PacienteId = pacienteId,
                IdempotencyKey = Guid.NewGuid().ToString(),
                Modalidade = "CT"
            };

            // Act
            var result = await _exameService.CreateExameAsync(createExameDto);

            // Assert
            result.Should().NotBeNull();
            result.PacienteId.Should().Be(pacienteId);
            _exames.Should().HaveCount(1);
        }

        [Fact]
        public async Task CreateExameAsync_ShouldThrowException_WhenPacienteDoesNotExist()
        {
            // Arrange
            var createExameDto = new CreateExameDto
            {
                PacienteId = Guid.NewGuid(),
                IdempotencyKey = Guid.NewGuid().ToString(),
                Modalidade = "CT"
            };

            // Act
            Func<Task> act = async () => await _exameService.CreateExameAsync(createExameDto);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("Paciente não encontrado.");
        }

        [Fact]
        public async Task CreateExameAsync_ShouldReturnExistingExame_WhenIdempotencyKeyExists()
        {
            // Arrange
            var idempotencyKey = Guid.NewGuid().ToString();
            var pacienteId = Guid.NewGuid();
            _pacientes.Add(new Paciente { Id = pacienteId });
            var createExameDto = new CreateExameDto
            {
                PacienteId = pacienteId,
                IdempotencyKey = idempotencyKey,
                Modalidade = "CT"
            };
            _exames.Add(new Exame { IdempotencyKey = idempotencyKey, PacienteId = pacienteId });

            // Act
            var result = await _exameService.CreateExameAsync(createExameDto);

            // Assert
            result.IdempotencyKey.Should().Be(idempotencyKey);
        }

        [Fact]
        public async Task GetExamesAsync_ShouldReturnPagedListOfExames()
        {
            // Arrange
            _exames.Add(new Exame { Modalidade = ModalidadeExame.CT });
            _exames.Add(new Exame { Modalidade = ModalidadeExame.MR });
            _exames.Add(new Exame { Modalidade = ModalidadeExame.XA });

            // Act
            var result = await _exameService.GetExamesAsync(1, 2);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task UpdateExameAsync_ShouldUpdateExame_WhenExameExists()
        {
            // Arrange
            var exameId = Guid.NewGuid();
            var pacienteId = Guid.NewGuid();
            _pacientes.Add(new Paciente { Id = pacienteId });
            _exames.Add(new Exame { Id = exameId, Modalidade = ModalidadeExame.CT, PacienteId = pacienteId, IdempotencyKey = Guid.NewGuid().ToString() });
            var updateDto = new UpdateExameDto { Modalidade = "MR", PacienteId = pacienteId, IdempotencyKey = Guid.NewGuid().ToString() };

            // Act
            var result = await _exameService.UpdateExameAsync(exameId, updateDto);

            // Assert
            result.Should().NotBeNull();
            result.Modalidade.Should().Be("MR");
        }

        [Fact]
        public async Task UpdateExameAsync_ShouldReturnNull_WhenExameDoesNotExist()
        {
            // Arrange
            var exameId = Guid.NewGuid();
            var updateDto = new UpdateExameDto { Modalidade = "MR" , PacienteId = Guid.NewGuid()};

            // Act
            var result = await _exameService.UpdateExameAsync(exameId, updateDto);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task DeleteExameAsync_ShouldDeleteExame_WhenExameExists()
        {
            // Arrange
            var exameId = Guid.NewGuid();
            _exames.Add(new Exame { Id = exameId });

            // Act
            var result = await _exameService.DeleteExameAsync(exameId);

            // Assert
            result.Should().BeTrue();
            _exames.Should().BeEmpty();
        }

        [Fact]
        public async Task DeleteExameAsync_ShouldReturnFalse_WhenExameDoesNotExist()
        {
            // Arrange
            var exameId = Guid.NewGuid();

            // Act
            var result = await _exameService.DeleteExameAsync(exameId);

            // Assert
            result.Should().BeFalse();
        }
    }
}
