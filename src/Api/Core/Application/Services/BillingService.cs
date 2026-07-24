using Microsoft.EntityFrameworkCore;
using HealthCore.Api.Core.Application.DTOs;
using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Core.Domain.Enums;
using HealthCore.Api.Infrastructure.Data;

namespace HealthCore.Api.Core.Application.Services
{
    public class BillingService
    {
        private const decimal MonthlyAmount = 49m;
        private const decimal AnnualAmount = 490m;
        private const int TrialDays = 30;
        private const int GraceDays = 5;

        private readonly HealthCoreDbContext _context;
        private readonly ILogger<BillingService> _logger;

        public BillingService(HealthCoreDbContext context, ILogger<BillingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> EnsureUserCanAccessAsync(User user)
        {
            if (user.Role != UserRole.Medico)
            {
                return true;
            }

            var medico = await _context.Medicos
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.UserId == user.Id);

            if (medico == null)
            {
                _logger.LogWarning("Usuario medico sem registro Medico: {UserId}", user.Id);
                return false;
            }

            var subscription = await GetOrCreateTrialSubscriptionAsync(medico);
            var now = DateTime.UtcNow;

            if (subscription.Status is SubscriptionStatus.Suspended or SubscriptionStatus.Cancelled)
            {
                return false;
            }

            if (subscription.Status == SubscriptionStatus.Trial)
            {
                if (now <= subscription.TrialEndsAt.AddDays(GraceDays))
                {
                    return true;
                }

                SuspendSubscription(subscription, medico.User, "Periodo de teste vencido.");
                await _context.SaveChangesAsync();
                return false;
            }

            if (subscription.Status is SubscriptionStatus.Active or SubscriptionStatus.Overdue)
            {
                var dueDate = subscription.NextDueDate ?? FirstDayOfNextMonth(now);
                subscription.NextDueDate = dueDate;

                if (now.Date > dueDate.Date.AddDays(GraceDays))
                {
                    SuspendSubscription(subscription, medico.User, "Pagamento vencido ha mais de 5 dias.");
                    await _context.SaveChangesAsync();
                    return false;
                }

                if (now.Date > dueDate.Date && subscription.Status != SubscriptionStatus.Overdue)
                {
                    subscription.Status = SubscriptionStatus.Overdue;
                    subscription.UpdatedAt = now;
                    await _context.SaveChangesAsync();
                }
            }

            return true;
        }

        public async Task<MedicoSubscription> GetOrCreateTrialSubscriptionAsync(Medico medico)
        {
            var subscription = await _context.MedicoSubscriptions
                .FirstOrDefaultAsync(s => s.MedicoId == medico.Id);

            if (subscription != null)
            {
                return subscription;
            }

            var start = DateTime.UtcNow;
            subscription = new MedicoSubscription
            {
                Id = Guid.NewGuid(),
                MedicoId = medico.Id,
                BillingCycle = BillingCycle.Monthly,
                PaymentMethod = PaymentMethod.Pix,
                Status = SubscriptionStatus.Trial,
                MonthlyAmount = MonthlyAmount,
                AnnualAmount = AnnualAmount,
                TrialStartedAt = start,
                TrialEndsAt = start.AddDays(TrialDays),
                CreatedAt = start,
                UpdatedAt = start,
                Notes = "Teste gratuito iniciado automaticamente."
            };

            _context.MedicoSubscriptions.Add(subscription);
            await _context.SaveChangesAsync();
            return subscription;
        }

        public async Task<List<MedicoSubscriptionDto>> GetSubscriptionsAsync()
        {
            var medicos = await _context.Medicos
                .Include(m => m.User)
                .Include(m => m.Subscription)
                .OrderBy(m => m.Nome)
                .ToListAsync();

            foreach (var medico in medicos.Where(m => m.Subscription == null))
            {
                await GetOrCreateTrialSubscriptionAsync(medico);
            }

            var subscriptions = await _context.MedicoSubscriptions
                .Include(s => s.Medico)
                    .ThenInclude(m => m.User)
                .OrderBy(s => s.Medico.Nome)
                .ToListAsync();

            return subscriptions.Select(ToDto).ToList();
        }

        public async Task<MedicoSubscriptionDto?> GetSubscriptionForUserAsync(Guid userId)
        {
            var medico = await _context.Medicos
                .Include(m => m.User)
                .Include(m => m.Subscription)
                .FirstOrDefaultAsync(m => m.UserId == userId);

            if (medico == null)
            {
                return null;
            }

            var subscription = medico.Subscription ?? await GetOrCreateTrialSubscriptionAsync(medico);
            return ToDto(subscription, medico);
        }

        public async Task<MedicoSubscriptionDto?> ReleasePaymentAsync(Guid medicoId, ReleasePaymentDto dto)
        {
            var medico = await _context.Medicos
                .Include(m => m.User)
                .Include(m => m.Subscription)
                .FirstOrDefaultAsync(m => m.Id == medicoId);

            if (medico == null)
            {
                return null;
            }

            var now = DateTime.UtcNow;
            var subscription = medico.Subscription ?? await GetOrCreateTrialSubscriptionAsync(medico);
            subscription.BillingCycle = dto.BillingCycle;
            subscription.PaymentMethod = PaymentMethod.Pix;
            subscription.Status = SubscriptionStatus.Active;
            subscription.LastPaymentAt = now;
            subscription.NextDueDate = dto.BillingCycle == BillingCycle.Annual
                ? now.Date.AddYears(1)
                : FirstDayOfNextMonth(now);
            subscription.SuspendedAt = null;
            subscription.ReactivatedAt = now;
            subscription.Notes = string.IsNullOrWhiteSpace(dto.Notes)
                ? "Pagamento liberado manualmente pelo administrador."
                : dto.Notes.Trim();
            subscription.UpdatedAt = now;

            if (medico.User != null)
            {
                medico.User.IsActive = true;
            }

            await _context.SaveChangesAsync();
            return ToDto(subscription, medico);
        }

        public async Task<MedicoSubscriptionDto?> SuspendAsync(Guid medicoId, SuspendSubscriptionDto dto)
        {
            var medico = await _context.Medicos
                .Include(m => m.User)
                .Include(m => m.Subscription)
                .FirstOrDefaultAsync(m => m.Id == medicoId);

            if (medico == null)
            {
                return null;
            }

            var subscription = medico.Subscription ?? await GetOrCreateTrialSubscriptionAsync(medico);
            SuspendSubscription(subscription, medico.User, string.IsNullOrWhiteSpace(dto.Notes)
                ? "Suspensao manual pelo administrador."
                : dto.Notes.Trim());

            await _context.SaveChangesAsync();
            return ToDto(subscription, medico);
        }

        private static void SuspendSubscription(MedicoSubscription subscription, User? user, string notes)
        {
            var now = DateTime.UtcNow;
            subscription.Status = SubscriptionStatus.Suspended;
            subscription.SuspendedAt = now;
            subscription.UpdatedAt = now;
            subscription.Notes = notes;

            if (user != null)
            {
                user.IsActive = false;
            }
        }

        private static DateTime FirstDayOfNextMonth(DateTime date)
        {
            var firstDay = new DateTime(date.Year, date.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            return firstDay.AddMonths(1);
        }

        private static MedicoSubscriptionDto ToDto(MedicoSubscription subscription)
        {
            return ToDto(subscription, subscription.Medico);
        }

        private static MedicoSubscriptionDto ToDto(MedicoSubscription subscription, Medico medico)
        {
            return new MedicoSubscriptionDto
            {
                Id = subscription.Id,
                MedicoId = subscription.MedicoId,
                MedicoNome = medico.Nome,
                Username = medico.User?.Username ?? string.Empty,
                BillingCycle = subscription.BillingCycle,
                PaymentMethod = subscription.PaymentMethod,
                Status = subscription.Status,
                MonthlyAmount = subscription.MonthlyAmount,
                AnnualAmount = subscription.AnnualAmount,
                TrialStartedAt = subscription.TrialStartedAt,
                TrialEndsAt = subscription.TrialEndsAt,
                LastPaymentAt = subscription.LastPaymentAt,
                NextDueDate = subscription.NextDueDate,
                SuspendedAt = subscription.SuspendedAt,
                ReactivatedAt = subscription.ReactivatedAt,
                Notes = subscription.Notes,
                UserIsActive = medico.User?.IsActive ?? false
            };
        }
    }
}