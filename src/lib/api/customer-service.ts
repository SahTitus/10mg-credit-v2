import { BaseApiService } from './base-service';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type { RecordScope } from '@/types/api';
import type {
  Customer,
  CustomerDetailView,
  CustomerDirectoryFilter,
  CustomerQueryParams,
  CustomersMetricsSummary,
  CustomerWithStats,
  PaginatedCustomersResponse,
} from '@/types/customer';

export type {
  CustomerDetailView,
  CustomerWithStats,
  CustomerDirectoryFilter,
  CustomerQueryParams,
  CustomersMetricsSummary,
  PaginatedCustomersResponse,
};

export class CustomerApiService extends BaseApiService {
  public async list(institutionId: string, search?: string): Promise<Customer[]> {
    return this.client.get<Customer[]>(API_ENDPOINTS.CUSTOMERS.BASE, {
      params: { institutionId, search },
    });
  }

  public async listPaginated(params: CustomerQueryParams): Promise<PaginatedCustomersResponse> {
    return this.client.get<PaginatedCustomersResponse>(API_ENDPOINTS.CUSTOMERS.PAGINATED, {
      params: {
        institutionId: params.institutionId,
        filter: params.filter,
        search: params.search,
        page: params.page,
        pageSize: params.pageSize,
      },
    });
  }

  public async getById(
    id: string,
    scope?: Pick<RecordScope, 'institutionId'>,
  ): Promise<CustomerDetailView> {
    return this.client.get<CustomerDetailView>(API_ENDPOINTS.CUSTOMERS.BY_ID(id), {
      params: { institutionId: scope?.institutionId },
    });
  }
}

export const customerApiService = new CustomerApiService();
