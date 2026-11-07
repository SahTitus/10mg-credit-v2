'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Building2, Check, ChevronRight, LogOut, Menu, UserRound } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu';
import { APP_ROUTE_LABELS, APP_ROUTES, type AppRoute } from '@/lib/constants/routes';
import { getInitials } from '@/lib/utils/formatters';
import { usePortalSwitch } from '@/features/auth/hooks/use-portal-switch';
import { useSignOut } from '@/features/auth/hooks/use-sign-out';
import { useAuthStore } from '@/store/auth-store';
import { useInstitutionStore } from '@/store/institution-store';
import { useUIStore } from '@/store/ui-store';

interface TopbarProps {
  unreadNotificationsCount?: number;
}

export function Topbar({ unreadNotificationsCount = 0 }: TopbarProps) {
  const pathname = usePathname();
  const currentInstitution = useInstitutionStore((state) => state.currentInstitution);
  const session = useAuthStore((state) => state.session);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);
  const setNotificationDrawerOpen = useUIStore((state) => state.setNotificationDrawerOpen);
  const switchPortal = usePortalSwitch();
  const { signOut, isSigningOut } = useSignOut();

  // Match the longest route first so record pages use their parent breadcrumb
  const matchedRoute = Object.entries(APP_ROUTE_LABELS)
    .sort(([left], [right]) => right.length - left.length)
    .find(([route]) => pathname.startsWith(route as AppRoute));
  const activeRoute = (matchedRoute?.[0] ?? APP_ROUTES.LENDER.OVERVIEW) as AppRoute;
  const pageTitle = matchedRoute?.[1] ?? 'Overview';
  const isCustomerPortal = Object.values(APP_ROUTES.CUSTOMER).some((route) =>
    pathname.startsWith(route),
  );
  const overviewRoute = isCustomerPortal
    ? APP_ROUTES.CUSTOMER.OVERVIEW
    : APP_ROUTES.LENDER.OVERVIEW;
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex h-15 shrink-0 select-none items-center justify-between gap-3 border-b border-line bg-white/95 px-4 backdrop-blur-sm sm:h-18.5 sm:gap-4 sm:px-8 lg:px-[clamp(30px,3.1vw,51px)]">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSidebarOpen(true)}
          className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <nav
          aria-label="Breadcrumbs"
          className="hidden min-w-0 items-center gap-1.5 text-xs sm:flex"
        >
          <Link
            href={overviewRoute}
            className="shrink-0 font-medium text-muted-foreground transition-colors hover:text-brand"
          >
            {currentInstitution.short}
          </Link>
          <ChevronRight
            className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
            aria-hidden="true"
          />
          <Link
            href={activeRoute}
            className="truncate font-semibold text-foreground transition-colors hover:text-brand"
          >
            {pageTitle}
          </Link>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
        <span className="hidden text-xs text-muted-foreground md:inline-block">
          {todayFormatted}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNotificationDrawerOpen(true)}
          className="relative text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={`Notifications ${unreadNotificationsCount ? `(${unreadNotificationsCount} unread)` : ''}`}
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadNotificationsCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive"
              aria-hidden="true"
            />
          )}
        </Button>
        <div className="h-4 w-px bg-border" aria-hidden="true" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 gap-2 rounded-full px-1.5 pr-2 hover:bg-muted"
              aria-label="Open account menu"
            >
              <span className="hidden text-xs font-semibold text-foreground sm:inline-block">
                {session?.name || 'Workspace user'}
              </span>
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                style={{ backgroundColor: 'var(--brand-pale)', color: 'var(--brand)' }}
              >
                {getInitials(session?.name || 'Workspace user')}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={10} className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-pale text-3xs font-bold text-brand">
                {getInitials(session?.name || 'Workspace user')}
              </span>
              <span className="min-w-0">
                <span className="block truncate">{session?.name || 'Workspace user'}</span>
                <span className="mt-0.5 block truncate text-3xs font-normal text-muted-foreground">
                  {session?.role === 'lender' ? 'Lender workspace' : 'Customer portal'}
                </span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="pb-0.5 pt-1.5 text-3xs uppercase tracking-wider text-muted-foreground">
              Switch portal
            </DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => switchPortal('lender')}>
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              Lender workspace
              {session?.role === 'lender' && <Check className="ml-auto h-3.5 w-3.5" />}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => switchPortal('customer')}>
              <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
              Customer portal
              {session?.role === 'customer' && <Check className="ml-auto h-3.5 w-3.5" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isSigningOut}
              onSelect={(event) => {
                event.preventDefault();
                void signOut();
              }}
              className="text-destructive data-disabled:pointer-events-none data-disabled:opacity-75 data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
            >
              {isSigningOut ? (
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden="true"
                />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
