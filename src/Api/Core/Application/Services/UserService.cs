using Microsoft.EntityFrameworkCore;
using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Infrastructure.Data;

namespace HealthCore.Api.Core.Application.Services
{
    public class UserService
    {
        private readonly HealthCoreDbContext _context;

        public UserService(HealthCoreDbContext context)
        {
            _context = context;
        }

        public async Task<User?> Authenticate(string username, string password)
        {
            var user = await _context.Users.SingleOrDefaultAsync(x => x.Username == username);

            if (user == null || !user.VerifyPassword(password))
            {
                return null;
            }

            return user;
        }

        public async Task<User> CreateUser(string username, string password)
        {
            if (await _context.Users.AnyAsync(x => x.Username == username))
            {
                throw new InvalidOperationException("Já existe um usuário com o mesmo nome de usuário.");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = username,
            };
            user.SetPassword(password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }
    }
}