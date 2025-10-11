using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using HealthCore.Api.Core.Application.DTOs;
using HealthCore.Api.Core.Application.Services;
using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Infrastructure.Data;

namespace HealthCore.Api.Tests
{
    public class EspecialidadeServiceTests : IDisposable
    {
        private readonly HealthCoreDbContext _context;
        private readonly EspecialidadeService _service;

        public EspecialidadeServiceTests()
        {
            var options = new DbContextOptionsBuilder<HealthCoreDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new HealthCoreDbContext(options);

            // Seed básico
            _context.Especialidades.AddRange(
                new Especialidade { Id = Guid.NewGuid(), Nome = "Cardiologia", Descricao = "Desc", Ativa = true, DataCriacao = DateTime.UtcNow },
                new Especialidade { Id = Guid.NewGuid(), Nome = "Dermatologia", Descricao = "Desc", Ativa = false, DataCriacao = DateTime.UtcNow }
            );
            _context.SaveChanges();

            var logger = Mock.Of<ILogger<EspecialidadeService>>();
            _service = new EspecialidadeService(_context, logger);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        [Fact]
        public async Task GetAllAsync_ShouldFilterAndPaginate()
        {
            var page1 = await _service.GetAllAsync(page: 1, pageSize: 1, ativa: null, search: null);
            page1.Items.Should().HaveCount(1);
            page1.TotalItems.Should().Be(2);

            var onlyActive = await _service.GetAllAsync(page: 1, pageSize: 10, ativa: true, search: null);
            onlyActive.Items.Should().OnlyContain(e => e.Ativa);

            var searchByName = await _service.GetAllAsync(page: 1, pageSize: 10, ativa: null, search: "derm");
            searchByName.Items.Should().OnlyContain(e => e.Nome.Contains("Derm", StringComparison.OrdinalIgnoreCase));
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnItem_WhenExists()
        {
            var any = _context.Especialidades.AsNoTracking().First();
            var result = await _service.GetByIdAsync(any.Id);
            result.Should().NotBeNull();
            result!.Id.Should().Be(any.Id);
        }

        [Fact]
        public async Task CreateAsync_ShouldCreate_WhenUniqueName()
        {
            var dto = new CreateEspecialidadeDto
            {
                Nome = "Ortopedia",
                Descricao = "Desc",
                Ativa = true
            };

            var result = await _service.CreateAsync(dto);
            result.Nome.Should().Be(dto.Nome);
            (await _context.Especialidades.CountAsync(e => e.Nome == dto.Nome)).Should().Be(1);
        }

        [Fact]
        public async Task CreateAsync_ShouldThrow_WhenDuplicateName()
        {
            var dto = new CreateEspecialidadeDto { Nome = "Cardiologia" };
            var act = async () => await _service.CreateAsync(dto);
            await act.Should().ThrowAsync<InvalidOperationException>();
        }

        [Fact]
        public async Task UpdateAsync_ShouldUpdate_WhenUniqueName()
        {
            var item = _context.Especialidades.First(e => e.Nome == "Dermatologia");
            var dto = new UpdateEspecialidadeDto { Nome = "Dermatologia Clínica", Descricao = "Nova", Ativa = true };
            var result = await _service.UpdateAsync(item.Id, dto);
            result.Nome.Should().Be(dto.Nome);
            var entity = await _context.Especialidades.FindAsync(item.Id);
            entity!.Nome.Should().Be(dto.Nome);
        }

        [Fact]
        public async Task UpdateAsync_ShouldThrow_WhenRenamingToDuplicate()
        {
            var item = _context.Especialidades.First(e => e.Nome == "Dermatologia");
            var dto = new UpdateEspecialidadeDto { Nome = "Cardiologia", Descricao = "", Ativa = true };
            var act = async () => await _service.UpdateAsync(item.Id, dto);
            await act.Should().ThrowAsync<InvalidOperationException>();
        }

        [Fact]
        public async Task DeleteAsync_ShouldDelete_WhenNoLinkedMedicos()
        {
            var item = _context.Especialidades.First(e => e.Nome == "Dermatologia");
            var deleted = await _service.DeleteAsync(item.Id);
            deleted.Should().BeTrue();
            (await _context.Especialidades.FindAsync(item.Id)).Should().BeNull();
        }

        [Fact]
        public async Task DeleteAsync_ShouldThrow_WhenHasLinkedMedicos()
        {
            var esp = _context.Especialidades.First(e => e.Nome == "Cardiologia");
            var medico = new Medico
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Nome = "Dr. Teste",
                Documento = "12345678900",
                DataNascimento = DateTime.UtcNow.AddYears(-30),
                Telefone = "",
                Email = "",
                Endereco = "",
                CRM = "CRM123",
                Especialidade = "Cardiologia",
                DataCriacao = DateTime.UtcNow,
                EspecialidadeId = esp.Id
            };
            _context.Medicos.Add(medico);
            await _context.SaveChangesAsync();

            var act = async () => await _service.DeleteAsync(esp.Id);
            await act.Should().ThrowAsync<InvalidOperationException>();
        }
    }
}


