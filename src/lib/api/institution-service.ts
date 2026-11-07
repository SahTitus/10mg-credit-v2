import { BaseApiService } from './base-service';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type { Institution, InstitutionSettingsUpdate } from '@/types/institution';

export class InstitutionApiService extends BaseApiService {
  public async getAll(): Promise<Institution[]> {
    return this.client.get<Institution[]>(API_ENDPOINTS.INSTITUTIONS.BASE);
  }

  public async getById(id: string): Promise<Institution> {
    return this.client.get<Institution>(API_ENDPOINTS.INSTITUTIONS.BY_ID(id));
  }

  public async updateSettings(
    id: string,
    updates: InstitutionSettingsUpdate,
  ): Promise<Institution> {
    return this.client.patch<Institution>(API_ENDPOINTS.INSTITUTIONS.BY_ID(id), updates);
  }
}

export const institutionApiService = new InstitutionApiService();
