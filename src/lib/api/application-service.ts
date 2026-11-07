import { BaseApiService } from './base-service';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type { RecordScope } from '@/types/api';
import type {
  ApplicationQueryParams,
  ApplicationsMetricsSummary,
  ApplicationStatus,
  CreateApplicationDTO,
  LoanApplication,
  PaginatedApplicationsResponse,
} from '@/types/application';

export type { ApplicationQueryParams, ApplicationsMetricsSummary, PaginatedApplicationsResponse };

export class ApplicationApiService extends BaseApiService {
  public async list(
    institutionId: string,
    status?: string,
    search?: string,
    customerId?: string,
  ): Promise<LoanApplication[]> {
    return this.client.get<LoanApplication[]>(API_ENDPOINTS.APPLICATIONS.BASE, {
      params: { institutionId, status, search, customerId },
    });
  }

  public async listPaginated(
    params: ApplicationQueryParams,
  ): Promise<PaginatedApplicationsResponse> {
    return this.client.get<PaginatedApplicationsResponse>(API_ENDPOINTS.APPLICATIONS.PAGINATED, {
      params: {
        institutionId: params.institutionId,
        customerId: params.customerId,
        status: params.status,
        search: params.search,
        page: params.page,
        pageSize: params.pageSize,
      },
    });
  }

  public async getPendingCount(institutionId: string): Promise<number> {
    return this.client.get<number>(API_ENDPOINTS.APPLICATIONS.PENDING_COUNT, {
      params: { institutionId },
    });
  }

  public async getById(id: string, scope?: RecordScope): Promise<LoanApplication> {
    return this.client.get<LoanApplication>(API_ENDPOINTS.APPLICATIONS.BY_ID(id), {
      params: {
        institutionId: scope?.institutionId,
        customerId: scope?.customerId,
      },
    });
  }

  public async create(dto: CreateApplicationDTO): Promise<LoanApplication> {
    return this.client.post<LoanApplication>(API_ENDPOINTS.APPLICATIONS.BASE, dto);
  }

  public async updateStatus(
    id: string,
    status: ApplicationStatus,
    note?: string,
  ): Promise<LoanApplication> {
    return this.client.patch<LoanApplication>(API_ENDPOINTS.APPLICATIONS.STATUS(id), {
      status,
      note,
    });
  }

  public async withdraw(id: string, scope?: RecordScope): Promise<void> {
    return this.client.delete<void>(API_ENDPOINTS.APPLICATIONS.WITHDRAW(id), {
      params: {
        institutionId: scope?.institutionId,
        customerId: scope?.customerId,
      },
    });
  }
}

export const applicationApiService = new ApplicationApiService();
