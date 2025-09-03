
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
using MobileMed.Api.Core.Domain.Enums;

namespace MobileMed.Api.Tests
{
    public class ExameServiceTests : IDisposable
    {
        private readonly MobileMedDbContext _context;
        private readonly ExameService _exameService;

        public ExameServiceTests()
        {
            var options = new DbContextOptionsBuilder<MobileMedDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new MobileMedDbContext(options);
            _exameService = new ExameService(_context);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        [Fact]
        public async Task CreateExameAsync_ShouldCreateExame_WhenDataIsValid()
        {
            // Arrange
            var pacienteId = Guid.NewGuid();
            await _context.Pacientes.AddAsync(new Paciente { Id = pacienteId });
            await _context.SaveChangesAsync();
            
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
            var examesCount = await _context.Exames.CountAsync();
            examesCount.Should().Be(1);
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
            await _context.Pacientes.AddAsync(new Paciente { Id = pacienteId });
            await _context.Exames.AddAsync(new Exame { IdempotencyKey = idempotencyKey, PacienteId = pacienteId });
            await _context.SaveChangesAsync();
            
            var createExameDto = new CreateExameDto
            {
                PacienteId = pacienteId,
                IdempotencyKey = idempotencyKey,
                Modalidade = "CT"
            };

            // Act
            var result = await _exameService.CreateExameAsync(createExameDto);

            // Assert
            result.IdempotencyKey.Should().Be(idempotencyKey);
        }

        [Fact]
        public async Task GetExamesAsync_ShouldReturnPagedListOfExames()
        {
            // Arrange
            var pacienteId = Guid.NewGuid();
            await _context.Pacientes.AddAsync(new Paciente { Id = pacienteId, Nome = "Teste", Documento = "12345678901", DataNascimento = DateTime.Now.AddYears(-30) });
            
            await _context.Exames.AddAsync(new Exame { Id = Guid.NewGuid(), Modalidade = ModalidadeExame.CT, PacienteId = pacienteId, IdempotencyKey = Guid.NewGuid().ToString() });
            await _context.Exames.AddAsync(new Exame { Id = Guid.NewGuid(), Modalidade = ModalidadeExame.MR, PacienteId = pacienteId, IdempotencyKey = Guid.NewGuid().ToString() });
            await _context.Exames.AddAsync(new Exame { Id = Guid.NewGuid(), Modalidade = ModalidadeExame.XA, PacienteId = pacienteId, IdempotencyKey = Guid.NewGuid().ToString() });
            await _context.SaveChangesAsync();

            // Act
            var result = await _exameService.GetExamesAsync(1, 2);

            // Assert
            result.Should().NotBeNull();
            result.Data.Should().HaveCount(2);
        }

        [Fact]
        public async Task UpdateExameAsync_ShouldUpdateExame_WhenExameExists()
        {
            // Arrange
            var exameId = Guid.NewGuid();
            var pacienteId = Guid.NewGuid();
            await _context.Pacientes.AddAsync(new Paciente { Id = pacienteId });
            await _context.Exames.AddAsync(new Exame { Id = exameId, Modalidade = ModalidadeExame.CT, PacienteId = pacienteId, IdempotencyKey = Guid.NewGuid().ToString() });
            await _context.SaveChangesAsync();
            
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
            await _context.Exames.AddAsync(new Exame { Id = exameId });
            await _context.SaveChangesAsync();

            // Act
            var result = await _exameService.DeleteExameAsync(exameId);

            // Assert
            result.Should().BeTrue();
            var examesCount = await _context.Exames.CountAsync();
            examesCount.Should().Be(0);
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
