'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { NotificationsDrawer } from './notifications-drawer';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { Button } from '@/components/primitives/button';
import { usePortalRoleSync } from '@/features/auth/hooks/use-portal-role-sync';
import { applicationApiService } from '@/lib/api/application-service';
import { notificationApiService } from '@/lib/api/notification-service';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { PORTAL_PREFIXES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useInstitutionStore } from '@/store/institution-store';
import { useUIStore } from '@/store/ui-store';

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  usePortalRoleSync();
  const pathname = usePathname();
  const session = useAuthStore((s) => s.session);
  const currentInstitution = useInstitutionStore((s) => s.currentInstitution);
  const isMobileSidebarOpen = useUIStore((s) => s.isMobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen);
  const isSidebarCollapsed = useUIStore((s) => s.isSidebarCollapsed);

  // Only lender pages display the pending review badge in the sidebar
  const isLenderWorkspace =
    pathname.startsWith(PORTAL_PREFIXES.LENDER) ||
    (!pathname.startsWith(PORTAL_PREFIXES.CUSTOMER) && session?.role === 'lender');

  const { data: pendingCount = 0 } = useQuery({
    queryKey: QUERY_KEYS.APPLICATIONS_PENDING_COUNT(currentInstitution.id),
    queryFn: () => applicationApiService.getPendingCount(currentInstitution.id),
    enabled: isLenderWorkspace,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS(currentInstitution.id),
    queryFn: () => notificationApiService.list(currentInstitution.id),
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-background">
      <div
        className={cn(
          'relative z-40 hidden h-full shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block',
          isSidebarCollapsed ? 'w-18' : 'w-63.5',
        )}
      >
        <Sidebar pendingApplicationsCount={pendingCount} collapsed={isSidebarCollapsed} />
      </div>

      <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          aria-describedby={undefined}
          className="border-r-0 p-0 shadow-2xl lg:hidden"
        >
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <div className="relative h-full">
            <Sidebar pendingApplicationsCount={pendingCount} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-3 h-7 w-7 text-(--sidebar-muted) hover:text-(--sidebar-fg)"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar unreadNotificationsCount={unreadCount} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto" id="main-content">
          <div className="mx-auto w-full max-w-[1550px] px-4 py-5 sm:px-8 sm:py-8 lg:px-[clamp(30px,3.1vw,51px)] lg:py-8.75">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>

      <NotificationsDrawer />
    </div>
  );
}
