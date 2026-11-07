import { BaseApiService } from './base-service';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type { RecordScope } from '@/types/api';
import type {
  PaginatedRepaymentsResponse,
  RecordRepaymentDTO,
  Repayment,
  RepaymentQueryParams,
  RepaymentsMetricsSummary,
} from '@/types/repayment';

export type { PaginatedRepaymentsResponse, RepaymentQueryParams, RepaymentsMetricsSummary };

export class RepaymentApiService extends BaseApiService {
  public async list(
    institutionId: string,
    search?: string,
    customerId?: string,
  ): Promise<Repayment[]> {
    return this.client.get<Repayment[]>(API_ENDPOINTS.REPAYMENTS.BASE, {
      params: { institutionId, search, customerId },
    });
  }

  public async listPaginated(params: RepaymentQueryParams): Promise<PaginatedRepaymentsResponse> {
    return this.client.get<PaginatedRepaymentsResponse>(API_ENDPOINTS.REPAYMENTS.PAGINATED, {
      params: {
        institutionId: params.institutionId,
        customerId: params.customerId,
        loanId: params.loanId,
        search: params.search,
        page: params.page,
        pageSize: params.pageSize,
      },
    });
  }

  public async getById(id: string, scope?: RecordScope): Promise<Repayment> {
    return this.client.get<Repayment>(API_ENDPOINTS.REPAYMENTS.BY_ID(id), {
      params: {
        institutionId: scope?.institutionId,
        customerId: scope?.customerId,
      },
    });
  }

  public async record(dto: RecordRepaymentDTO): Promise<Repayment> {
    return this.client.post<Repayment>(API_ENDPOINTS.REPAYMENTS.BASE, dto);
  }
}

export const repaymentApiService = new RepaymentApiService();
