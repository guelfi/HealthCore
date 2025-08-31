import type { DashboardMetrics } from '../entities/Metrics';

export interface IMetricsService {
  getDashboardMetrics(): Promise<DashboardMetrics>;
}
