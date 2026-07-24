using HealthCore.Api.Core.Domain.Enums;

namespace HealthCore.Api.Core.Application.DTOs
{
    public class MedicoSubscriptionDto
    {
        public Guid Id { get; set; }
        public Guid MedicoId { get; set; }
        public string MedicoNome { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public BillingCycle BillingCycle { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public SubscriptionStatus Status { get; set; }
        public decimal MonthlyAmount { get; set; }
        public decimal AnnualAmount { get; set; }
        public DateTime TrialStartedAt { get; set; }
        public DateTime TrialEndsAt { get; set; }
        public DateTime? LastPaymentAt { get; set; }
        public DateTime? NextDueDate { get; set; }
        public DateTime? SuspendedAt { get; set; }
        public DateTime? ReactivatedAt { get; set; }
        public string Notes { get; set; } = string.Empty;
        public bool UserIsActive { get; set; }
    }

    public class ReleasePaymentDto
    {
        public BillingCycle BillingCycle { get; set; } = BillingCycle.Monthly;
        public string? Notes { get; set; }
    }

    public class SuspendSubscriptionDto
    {
        public string? Notes { get; set; }
    }
}