using Microsoft.EntityFrameworkCore;
using MobileMed.Api.Core.Domain.Entities;
using MobileMed.Api.Infrastructure.Data;

namespace MobileMed.Api.Core.Application.Services
{
    public class UserService
    {
        private readonly MobileMedDbContext _context;

        public UserService(MobileMedDbContext context)
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