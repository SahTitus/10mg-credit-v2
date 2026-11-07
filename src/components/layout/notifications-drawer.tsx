'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Drawer } from '@/components/primitives/drawer';
import { Button } from '@/components/primitives/button';
import { useUIStore } from '@/store/ui-store';
import { useInstitutionStore } from '@/store/institution-store';
import { notificationApiService } from '@/lib/api/notification-service';
import { APP_ROUTE_BUILDERS, APP_ROUTES } from '@/lib/constants/routes';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { CheckCheck, FileText, WalletCards } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function NotificationsDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const isOpen = useUIStore((s) => s.isNotificationDrawerOpen);
  const setOpen = useUIStore((s) => s.setNotificationDrawerOpen);
  const currentInstitution = useInstitutionStore((s) => s.currentInstitution);
  const [tab, setTab] = React.useState<'All' | 'Unread'>('All');
  const isCustomerWorkspace = pathname.startsWith('/customer');

  const { data: notifications = [] } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS(currentInstitution.id),
    queryFn: () => notificationApiService.list(currentInstitution.id),
    enabled: isOpen,
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationApiService.markAllRead(currentInstitution.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS(currentInstitution.id),
      });
    },
  });

  const markSingleMutation = useMutation({
    mutationFn: (id: string) => notificationApiService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS(currentInstitution.id),
      });
    },
  });

  const filtered = tab === 'All' ? notifications : notifications.filter((n) => !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (item: (typeof notifications)[0]) => {
    if (!item.read) {
      markSingleMutation.mutate(item.id);
    }

    // Older application notifications stored the record ID only in the message text
    const resolvedTargetId = item.targetId ?? item.message.match(/#([A-Z]{2}-\d{2}-\d+)/)?.[1];

    // Seeded links target lender routes, so customer views resolve their own record paths
    let destination: string | undefined = item.targetRoute;
    if (isCustomerWorkspace) {
      if (item.category === 'application') {
        destination = resolvedTargetId
          ? APP_ROUTE_BUILDERS.CUSTOMER.APPLICATION(resolvedTargetId)
          : APP_ROUTES.CUSTOMER.APPLICATIONS;
      } else if (item.category === 'repayment') {
        destination = item.targetId
          ? APP_ROUTE_BUILDERS.CUSTOMER.PAYMENT(item.targetId)
          : APP_ROUTES.CUSTOMER.PAYMENTS;
      }
    } else if (
      (item.category === 'application' || item.targetRoute === APP_ROUTES.LENDER.APPLICATIONS) &&
      resolvedTargetId
    ) {
      destination = APP_ROUTE_BUILDERS.LENDER.APPLICATION(resolvedTargetId);
    } else if (
      (item.category === 'repayment' || item.targetRoute === APP_ROUTES.LENDER.REPAYMENTS) &&
      resolvedTargetId
    ) {
      destination = APP_ROUTE_BUILDERS.LENDER.REPAYMENT(resolvedTargetId);
    }

    if (destination) {
      setOpen(false);
      router.push(destination);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      title="Notifications"
      description={`${currentInstitution.short} system activity`}
      titleAdornment={
        <span className="ml-2 inline-flex rounded-md bg-brand-pale px-2 py-0.5 align-middle text-xs font-semibold tracking-normal text-brand">
          {notifications.length}
        </span>
      }
      width="max-w-110"
      className="notification-drawer"
      contentClassName="p-0"
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div className="inline-flex rounded-lg bg-muted p-1">
          <Button
            variant={tab === 'All' ? 'default' : 'ghost'}
            onClick={() => setTab('All')}
            className="h-7 px-3 text-xs"
          >
            All
          </Button>
          <Button
            variant={tab === 'Unread' ? 'default' : 'ghost'}
            onClick={() => setTab('Unread')}
            className="h-7 px-3 text-xs"
          >
            Unread
          </Button>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="link"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            isLoading={markAllMutation.isPending}
            className="gap-1.5 text-xs"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      <div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground">
            No notifications to display.
          </div>
        ) : (
          filtered.map((item) => (
            <Button
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={cn(
                'h-auto w-full items-start justify-start gap-3.5 rounded-none border-0 border-b border-line px-6 py-4 text-left whitespace-normal transition-colors',
                item.read ? 'bg-card hover:bg-muted/40' : 'bg-[#f7fafe] hover:bg-brand-pale/50',
              )}
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-brand-pale text-brand">
                {item.title.toLowerCase().includes('application') ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <WalletCards className="h-4 w-4" />
                )}
              </span>
              <span className="min-w-0 flex-1 pr-1">
                <span className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold leading-5 text-foreground">
                    {item.title}
                  </span>
                  {!item.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                </span>
                <span className="mt-1 block wrap-break-word text-2xs leading-relaxed text-muted-foreground">
                  {item.message}
                </span>
                <span className="mt-2 block text-3xs text-muted-foreground">{item.time}</span>
              </span>
            </Button>
          ))
        )}
      </div>
    </Drawer>
  );
}
