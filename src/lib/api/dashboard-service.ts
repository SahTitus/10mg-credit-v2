import { BaseApiService } from './base-service';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type {
  ChartDataPoint,
  CustomerDashboardMetrics,
  LenderActivityCategory,
  LenderActivityFeedResponse,
  LenderDashboardMetrics,
} from '@/types/dashboard';

export class DashboardApiService extends BaseApiService {
  public async getLenderMetrics(institutionId: string): Promise<LenderDashboardMetrics> {
    return this.client.get<LenderDashboardMetrics>(API_ENDPOINTS.DASHBOARD.LENDER_METRICS, {
      params: { institutionId },
    });
  }

  public async getCustomerMetrics(
    institutionId: string,
    customerId: string,
  ): Promise<CustomerDashboardMetrics> {
    return this.client.get<CustomerDashboardMetrics>(API_ENDPOINTS.DASHBOARD.CUSTOMER_METRICS, {
      params: { institutionId, customerId },
    });
  }

  public async getLenderActivities(
    institutionId: string,
    options?: { limit?: number; category?: LenderActivityCategory },
  ): Promise<LenderActivityFeedResponse> {
    return this.client.get<LenderActivityFeedResponse>(API_ENDPOINTS.DASHBOARD.ACTIVITIES, {
      params: {
        institutionId,
        limit: options?.limit,
        category: options?.category,
      },
    });
  }

  public getChartData(institutionId: string, range: 6 | 12): ChartDataPoint[] {
    // The trend is illustrative seed data
    const rawVals =
      institutionId === 'meridian'
        ? [3, 4, 3.5, 6, 5.8, 6.9, 9, 7.6, 10.1, 9.4, 10.8, 12.3]
        : [380, 520, 450, 760, 690, 880, 900, 760, 1010, 940, 1080, 1230];

    const allMonths = [
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
    ];

    const vals = rawVals.slice(-range);
    const months = allMonths.slice(-range);

    return vals.map((v, i) => ({
      month: months[i],
      value: v,
    }));
  }
}

export const dashboardApiService = new DashboardApiService();
