using HealthCore.Api.Core.Domain.Enums;

namespace HealthCore.Api.Core.Domain.Entities
{
    public class MedicoSubscription
    {
        public Guid Id { get; set; }
        public Guid MedicoId { get; set; }
        public BillingCycle BillingCycle { get; set; } = BillingCycle.Monthly;
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Pix;
        public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Trial;
        public decimal MonthlyAmount { get; set; } = 49m;
        public decimal AnnualAmount { get; set; } = 490m;
        public DateTime TrialStartedAt { get; set; } = DateTime.UtcNow;
        public DateTime TrialEndsAt { get; set; } = DateTime.UtcNow.AddDays(30);
        public DateTime? LastPaymentAt { get; set; }
        public DateTime? NextDueDate { get; set; }
        public DateTime? SuspendedAt { get; set; }
        public DateTime? ReactivatedAt { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Medico Medico { get; set; } = null!;
    }
}