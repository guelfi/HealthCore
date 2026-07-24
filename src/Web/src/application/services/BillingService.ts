import { apiClient } from '../../infrastructure/api/client';

export enum BillingCycle {
  Monthly = 1,
  Annual = 2,
}

export enum SubscriptionStatus {
  Trial = 1,
  Active = 2,
  Overdue = 3,
  Suspended = 4,
  Cancelled = 5,
}

export interface MedicoSubscription {
  id: string;
  medicoId: string;
  medicoNome: string;
  username: string;
  billingCycle: BillingCycle;
  paymentMethod: number;
  status: SubscriptionStatus;
  monthlyAmount: number;
  annualAmount: number;
  trialStartedAt: string;
  trialEndsAt: string;
  lastPaymentAt?: string | null;
  nextDueDate?: string | null;
  suspendedAt?: string | null;
  reactivatedAt?: string | null;
  notes: string;
  userIsActive: boolean;
}

export const billingStatusLabels: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.Trial]: 'Teste',
  [SubscriptionStatus.Active]: 'Ativa',
  [SubscriptionStatus.Overdue]: 'Em atraso',
  [SubscriptionStatus.Suspended]: 'Suspensa',
  [SubscriptionStatus.Cancelled]: 'Cancelada',
};

export const billingCycleLabels: Record<BillingCycle, string> = {
  [BillingCycle.Monthly]: 'Mensal',
  [BillingCycle.Annual]: 'Anual',
};

export class BillingService {
  static async listSubscriptions(): Promise<MedicoSubscription[]> {
    const response = await apiClient.get<MedicoSubscription[]>('/admin/billing/subscriptions');
    return response.data;
  }

  static async releasePayment(
    medicoId: string,
    billingCycle: BillingCycle,
    notes?: string
  ): Promise<MedicoSubscription> {
    const response = await apiClient.post<MedicoSubscription>(
      `/admin/billing/medicos/${medicoId}/release-payment`,
      { billingCycle, notes }
    );
    return response.data;
  }

  static async suspend(medicoId: string, notes?: string): Promise<MedicoSubscription> {
    const response = await apiClient.post<MedicoSubscription>(
      `/admin/billing/medicos/${medicoId}/suspend`,
      { notes }
    );
    return response.data;
  }
}