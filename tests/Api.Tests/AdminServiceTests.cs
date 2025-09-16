using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using FluentAssertions;
using HealthCore.Api.Core.Application.Services;
using HealthCore.Api.Core.Application.DTOs.Admin;
using HealthCore.Api.Infrastructure.Data;
using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Core.Domain.Enums;

namespace HealthCore.Api.Tests
{
    public class AdminServiceTests : IDisposable
    {
        private readonly HealthCoreDbContext _context;
        private readonly AdminService _adminService;
        private readonly Mock<ILogger<AdminService>> _mockLogger;

        public AdminServiceTests()
        {
            var options = new DbContextOptionsBuilder<HealthCoreDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new HealthCoreDbContext(options);
            _mockLogger = new Mock<ILogger<AdminService>>();
            _adminService = new AdminService(_context, _mockLogger.Object);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        [Fact]
        public async Task CreateUserAsync_ShouldCreateUser_WhenUsernameIsUnique()
        {
            // Arrange
            var createUserDto = new CreateUserDto
            {
                Username = "testuser",
                Password = "password123",
                Role = UserRole.Medico
            };

            // Act
            var result = await _adminService.CreateUserAsync(createUserDto);

            // Assert
            result.Should().NotBeNull();
            result.Username.Should().Be(createUserDto.Username);
            var savedUser = await _context.Users.FindAsync(result.Id);
            savedUser.Should().NotBeNull();
        }

        [Fact]
        public async Task CreateUserAsync_ShouldThrowException_WhenUsernameExists()
        {
            // Arrange
            var createUserDto = new CreateUserDto
            {
                Username = "testuser",
                Password = "password123",
                Role = UserRole.Medico
            };
            await _context.Users.AddAsync(new User { Id = Guid.NewGuid(), Username = "testuser" });
            await _context.SaveChangesAsync();

            // Act
            Func<Task> act = async () => await _adminService.CreateUserAsync(createUserDto);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("Usuário com username 'testuser' já existe.");
        }

        [Fact]
        public async Task GetUsersAsync_ShouldReturnPagedListOfUsers()
        {
            // Arrange
            var users = new List<User>
            {
                new User { Id = Guid.NewGuid(), Username = "user1", Role = UserRole.Medico },
                new User { Id = Guid.NewGuid(), Username = "user2", Role = UserRole.Administrador },
                new User { Id = Guid.NewGuid(), Username = "user3", Role = UserRole.Medico }
            };
            
            await _context.Users.AddRangeAsync(users);
            await _context.SaveChangesAsync();

            // Act
            var result = await _adminService.GetUsersAsync(1, 2);

            // Assert
            result.Should().NotBeNull();
            result.Data.Should().HaveCount(2);
            result.Total.Should().Be(3);
            result.Page.Should().Be(1);
            result.PageSize.Should().Be(2);
            result.TotalPages.Should().Be(2);
        }

        [Fact]
        public async Task GetUserByIdAsync_ShouldReturnUser_WhenUserExists()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new User { Id = userId, Username = "testuser", Role = UserRole.Medico };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _adminService.GetUserByIdAsync(userId);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(userId);
            result.Username.Should().Be("testuser");
        }

        [Fact]
        public async Task GetUserByIdAsync_ShouldReturnNull_WhenUserDoesNotExist()
        {
            // Arrange
            var userId = Guid.NewGuid();

            // Act
            var result = await _adminService.GetUserByIdAsync(userId);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task UpdateUserAsync_ShouldUpdateUser_WhenUserExists()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new User { Id = userId, Username = "oldusername", Role = UserRole.Medico };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            
            var updateDto = new UpdateUserDto { Username = "newusername", Role = UserRole.Administrador };

            // Act
            var result = await _adminService.UpdateUserAsync(userId, updateDto);

            // Assert
            result.Should().NotBeNull();
            result.Username.Should().Be("newusername");
            result.Role.Should().Be(UserRole.Administrador);
        }

        [Fact]
        public async Task UpdateUserAsync_ShouldReturnNull_WhenUserDoesNotExist()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var updateDto = new UpdateUserDto { Username = "newusername" };

            // Act
            var result = await _adminService.UpdateUserAsync(userId, updateDto);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task DeactivateUserAsync_ShouldDeactivateUser_WhenUserExists()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new User { Id = userId, Username = "testuser", IsActive = true };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _adminService.DeactivateUserAsync(userId);

            // Assert
            result.Should().BeTrue();
            var updatedUser = await _context.Users.FindAsync(userId);
            updatedUser.Should().NotBeNull();
            updatedUser!.IsActive.Should().BeFalse();
        }

        [Fact]
        public async Task DeactivateUserAsync_ShouldReturnFalse_WhenUserDoesNotExist()
        {
            // Arrange
            var userId = Guid.NewGuid();

            // Act
            var result = await _adminService.DeactivateUserAsync(userId);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task ActivateUserAsync_ShouldActivateUser_WhenUserExists()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new User { Id = userId, Username = "testuser", IsActive = false };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _adminService.ActivateUserAsync(userId);

            // Assert
            result.Should().BeTrue();
            var updatedUser = await _context.Users.FindAsync(userId);
            updatedUser.Should().NotBeNull();
            updatedUser!.IsActive.Should().BeTrue();
        }

        [Fact]
        public async Task ActivateUserAsync_ShouldReturnFalse_WhenUserDoesNotExist()
        {
            // Arrange
            var userId = Guid.NewGuid();

            // Act
            var result = await _adminService.ActivateUserAsync(userId);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task SearchUsersByUsernameAsync_ShouldReturnMatchingUsers()
        {
            // Arrange
            var users = new List<User>
            {
                new User { Id = Guid.NewGuid(), Username = "john.doe", Role = UserRole.Medico },
                new User { Id = Guid.NewGuid(), Username = "jane.doe", Role = UserRole.Administrador },
                new User { Id = Guid.NewGuid(), Username = "bob.smith", Role = UserRole.Medico }
            };
            
            await _context.Users.AddRangeAsync(users);
            await _context.SaveChangesAsync();

            // Act
            var result = await _adminService.SearchUsersByUsernameAsync("doe", 1, 10);

            // Assert
            result.Should().NotBeNull();
            result.Data.Should().HaveCount(2);
            result.Data.Should().OnlyContain(u => u.Username.Contains("doe"));
            result.Total.Should().Be(2);
        }

        [Fact]
        public async Task SearchUsersByUsernameAsync_ShouldReturnEmptyList_WhenNoMatches()
        {
            // Arrange
            var users = new List<User>
            {
                new User { Id = Guid.NewGuid(), Username = "john.doe", Role = UserRole.Medico },
                new User { Id = Guid.NewGuid(), Username = "jane.smith", Role = UserRole.Administrador }
            };
            
            await _context.Users.AddRangeAsync(users);
            await _context.SaveChangesAsync();

            // Act
            var result = await _adminService.SearchUsersByUsernameAsync("carlos", 1, 10);

            // Assert
            result.Should().NotBeNull();
            result.Data.Should().BeEmpty();
            result.Total.Should().Be(0);
        }

        [Fact]
        public async Task SearchUsersByUsernameAsync_ShouldHandlePagination()
        {
            // Arrange
            var users = new List<User>
            {
                new User { Id = Guid.NewGuid(), Username = "test1", Role = UserRole.Medico },
                new User { Id = Guid.NewGuid(), Username = "test2", Role = UserRole.Administrador },
                new User { Id = Guid.NewGuid(), Username = "test3", Role = UserRole.Medico }
            };
            
            await _context.Users.AddRangeAsync(users);
            await _context.SaveChangesAsync();

            // Act
            var result = await _adminService.SearchUsersByUsernameAsync("test", 1, 2);

            // Assert
            result.Should().NotBeNull();
            result.Data.Should().HaveCount(2);
            result.Total.Should().Be(3);
            result.Page.Should().Be(1);
            result.PageSize.Should().Be(2);
            result.TotalPages.Should().Be(2);
        }
    }
}