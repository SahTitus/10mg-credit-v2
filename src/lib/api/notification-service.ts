import { BaseApiService } from './base-service';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type { AppNotification } from '@/types/notification';

export class NotificationApiService extends BaseApiService {
  public async list(institutionId: string): Promise<AppNotification[]> {
    return this.client.get<AppNotification[]>(API_ENDPOINTS.NOTIFICATIONS.BASE, {
      params: { institutionId },
    });
  }

  public async markRead(notificationId: string): Promise<void> {
    return this.client.patch<void>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
  }

  public async markAllRead(institutionId: string): Promise<void> {
    return this.client.post<void>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, { institutionId });
  }
}

export const notificationApiService = new NotificationApiService();
