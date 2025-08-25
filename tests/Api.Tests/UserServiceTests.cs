
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using FluentAssertions;
using MobileMed.Api.Core.Application.Services;
using MobileMed.Api.Infrastructure.Data;
using MobileMed.Api.Core.Domain.Entities;

namespace MobileMed.Api.Tests
{
    public class UserServiceTests
    {
        private readonly UserService _userService;
        private readonly Mock<MobileMedDbContext> _mockContext;
        private readonly Mock<DbSet<User>> _mockUserDbSet;
        private readonly List<User> _users;

        public UserServiceTests()
        {
            _users = new List<User>();
            _mockUserDbSet = new Mock<DbSet<User>>();
            var queryableUsers = new TestAsyncEnumerable<User>(_users).AsQueryable();

            _mockUserDbSet.As<IQueryable<User>>().Setup(m => m.Provider).Returns(queryableUsers.Provider);
            _mockUserDbSet.As<IQueryable<User>>().Setup(m => m.Expression).Returns(queryableUsers.Expression);
            _mockUserDbSet.As<IQueryable<User>>().Setup(m => m.ElementType).Returns(queryableUsers.ElementType);
            _mockUserDbSet.As<IAsyncEnumerable<User>>().Setup(m => m.GetAsyncEnumerator(default)).Returns(new TestAsyncEnumerator<User>(queryableUsers.GetEnumerator()));

            _mockUserDbSet.Setup(d => d.Add(It.IsAny<User>())).Callback<User>((s) => _users.Add(s));
            _mockUserDbSet.Setup(d => d.FindAsync(It.IsAny<object[]>()))
                .Returns<object[]>(ids => new ValueTask<User?>(_users.FirstOrDefault(d => d.Id == (Guid)ids[0])));

            var options = new DbContextOptionsBuilder<MobileMedDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _mockContext = new Mock<MobileMedDbContext>(options);
            _mockContext.Setup(c => c.Users).Returns(_mockUserDbSet.Object);
            _mockContext.Setup(c => c.SaveChangesAsync(default)).ReturnsAsync(1);

            _userService = new UserService(_mockContext.Object);
        }

        [Fact]
        public async Task CreateUser_ShouldCreateUser_WhenUsernameIsUnique()
        {
            // Arrange
            var username = "testuser";
            var password = "password";

            // Act
            var result = await _userService.CreateUser(username, password);

            // Assert
            result.Should().NotBeNull();
            result.Username.Should().Be(username);
            _users.Should().HaveCount(1);
        }

        [Fact]
        public async Task CreateUser_ShouldThrowException_WhenUsernameExists()
        {
            // Arrange
            var username = "testuser";
            var password = "password";
            _users.Add(new User { Username = username });

            // Act
            Func<Task> act = async () => await _userService.CreateUser(username, password);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("Já existe um usuário com o mesmo nome de usuário.");
        }

        [Fact]
        public async Task Authenticate_ShouldReturnUser_WhenCredentialsAreValid()
        {
            // Arrange
            var username = "testuser";
            var password = "password";
            var user = new User { Username = username };
            user.SetPassword(password);
            _users.Add(user);

            // Act
            var result = await _userService.Authenticate(username, password);

            // Assert
            result.Should().NotBeNull();
            result.Username.Should().Be(username);
        }

        [Fact]
        public async Task Authenticate_ShouldReturnNull_WhenCredentialsAreInvalid()
        {
            // Arrange
            var username = "testuser";
            var password = "password";
            var user = new User { Username = username };
            user.SetPassword("wrongpassword");
            _users.Add(user);

            // Act
            var result = await _userService.Authenticate(username, password);

            // Assert
            result.Should().BeNull();
        }
    }
}
