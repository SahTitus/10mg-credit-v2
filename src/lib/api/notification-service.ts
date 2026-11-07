import { BaseApiService } from './base-service';
import { AppNotification } from '@/types/notification';

export class NotificationApiService extends BaseApiService {
  public async list(institutionId: string): Promise<AppNotification[]> {
    await this.delay(150);
    const db = this.store.getDatabase();
    // Read overrides keep seeded notifications unchanged between sessions
    const reads = db.notificationReads || {};

    return db.notifications
      .filter((n) => n.institutionId === institutionId)
      .map((n) => ({
        ...n,
        read: Boolean(reads[n.id] ?? n.read),
      }))
      .sort((left, right) => Number(left.read) - Number(right.read));
  }

  public async markRead(notificationId: string): Promise<void> {
    await this.delay(100);
    this.store.updateDatabase((db) => {
      db.notificationReads = db.notificationReads || {};
      db.notificationReads[notificationId] = true;
      return db;
    });
  }

  public async markAllRead(institutionId: string): Promise<void> {
    await this.delay(150);
    this.store.updateDatabase((db) => {
      db.notificationReads = db.notificationReads || {};
      db.notifications
        .filter((n) => n.institutionId === institutionId)
        .forEach((n) => {
          db.notificationReads[n.id] = true;
        });
      return db;
    });
  }
}

export const notificationApiService = new NotificationApiService();
