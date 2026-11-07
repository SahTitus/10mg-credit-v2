import type { AppRoute } from '@/lib/constants/routes';

export type NotificationCategory = 'application' | 'repayment' | 'system';

export interface AppNotification {
  readonly id: string;
  readonly institutionId: string;
  readonly title: string;
  readonly message: string;
  readonly time: string;
  read: boolean;
  readonly category: NotificationCategory;
  readonly targetRoute?: AppRoute;
  readonly targetId?: string;
}
