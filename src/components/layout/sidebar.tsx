'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  type LucideIcon,
  Activity,
  LayoutDashboard,
  ClipboardList,
  Users,
  Wallet,
  Receipt,
  Sliders,
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { useSignOut } from '@/features/auth/hooks/use-sign-out';
import { useAuthStore } from '@/store/auth-store';
import { useInstitutionStore } from '@/store/institution-store';
import { useUIStore } from '@/store/ui-store';
import { InstitutionSwitcher } from './institution-switcher';
import { APP_ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  pendingApplicationsCount?: number;
  collapsed?: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export function Sidebar({ pendingApplicationsCount = 0, collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const session = useAuthStore((s) => s.session);
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen);
  const toggleSidebarCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);
  const currentInstitution = useInstitutionStore((s) => s.currentInstitution);
  const { signOut, isSigningOut } = useSignOut();

  const isLender = session?.role === 'lender';
  const navItems: NavGroup[] = isLender
    ? [
        {
          group: 'Workspace',
          items: [
            {
              title: 'Overview',
              href: APP_ROUTES.LENDER.OVERVIEW,
              icon: LayoutDashboard,
            },
            {
              title: 'Applications',
              href: APP_ROUTES.LENDER.APPLICATIONS,
              icon: ClipboardList,
              badge: pendingApplicationsCount > 0 ? pendingApplicationsCount : undefined,
            },
            {
              title: 'Customers',
              href: APP_ROUTES.LENDER.CUSTOMERS,
              icon: Users,
            },
            {
              title: 'Loans',
              href: APP_ROUTES.LENDER.LOANS,
              icon: Wallet,
            },
            {
              title: 'Repayments',
              href: APP_ROUTES.LENDER.REPAYMENTS,
              icon: Receipt,
            },
          ],
        },
        {
          group: 'Administration',
          items: [
            {
              title: 'Institution settings',
              href: APP_ROUTES.LENDER.SETTINGS,
              icon: Sliders,
            },
          ],
        },
      ]
    : [
        {
          group: 'My workspace',
          items: [
            {
              title: 'Overview',
              href: APP_ROUTES.CUSTOMER.OVERVIEW,
              icon: LayoutDashboard,
            },
            {
              title: 'Apply for credit',
              href: APP_ROUTES.CUSTOMER.APPLY,
              icon: PlusCircle,
            },
            {
              title: 'Applications',
              href: APP_ROUTES.CUSTOMER.APPLICATIONS,
              icon: ClipboardList,
            },
            {
              title: 'My loans',
              href: APP_ROUTES.CUSTOMER.LOANS,
              icon: Wallet,
            },
            {
              title: 'Payments',
              href: APP_ROUTES.CUSTOMER.PAYMENTS,
              icon: Receipt,
            },
          ],
        },
      ];

  return (
    <aside
      className="flex h-full flex-col border-r border-(--sidebar-line) bg-(--sidebar-bg) text-(--sidebar-fg) transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] select-none"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        color: 'var(--sidebar-fg)',
      }}
    >
      <div
        className={cn(
          'flex h-15 shrink-0 items-center border-b border-(--sidebar-line) transition-all duration-200 sm:h-18.5',
          collapsed ? 'justify-center px-2' : 'justify-between gap-2.5 px-4',
        )}
      >
        <div
          className={cn(
            'flex min-w-0 items-center gap-2.5 overflow-hidden transition-all duration-200',
            collapsed && 'hidden',
          )}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs"
            style={{
              backgroundColor: 'var(--sidebar-brandmark-bg)',
              color: 'var(--sidebar-brandmark-fg)',
            }}
            aria-hidden="true"
          >
            <Activity className="h-4.5 w-4.5" />
          </span>
          <strong className="truncate text-sm font-bold tracking-tight text-(--sidebar-fg)">
            10mg Credit V2
          </strong>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleSidebarCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden h-8 w-8 shrink-0 rounded-lg text-(--sidebar-muted) transition-colors hover:bg-(--sidebar-hover) hover:text-(--sidebar-fg) lg:inline-flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      <div
        className={cn(
          'relative z-30 border-b border-(--sidebar-line) py-3 transition-all duration-200',
          collapsed ? 'px-2' : 'px-3',
        )}
      >
        <InstitutionSwitcher collapsed={collapsed} />
      </div>

      <nav
        className={cn(
          'flex-1 space-y-5 overflow-x-hidden overflow-y-auto py-5 transition-all duration-200',
          collapsed ? 'px-2' : 'px-3',
        )}
        aria-label="Main Navigation"
      >
        {navItems.map((group, groupIndex) => (
          <div key={group.group} className="space-y-1">
            {collapsed ? (
              groupIndex > 0 && (
                <div className="mx-2 my-2 h-px bg-(--sidebar-line)" aria-hidden="true" />
              )
            ) : (
              <div className="px-2 pb-1 text-3xs font-bold tracking-wider text-(--sidebar-muted) uppercase">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.title : undefined}
                  aria-label={collapsed ? item.title : undefined}
                  onClick={() => {
                    setMobileSidebarOpen(false);
                  }}
                  className={cn(
                    'relative flex min-h-10 items-center rounded-[7px] py-2 text-xs font-medium transition-all duration-200',
                    collapsed ? 'justify-center px-0' : 'justify-between gap-3 px-2.5',
                    isActive
                      ? 'bg-(--sidebar-active) font-semibold text-(--sidebar-active-fg) shadow-2xs'
                      : 'text-(--sidebar-fg) hover:bg-(--sidebar-hover)',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div
                    className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-2.5')}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span
                      className={cn(
                        'overflow-hidden whitespace-nowrap transition-all duration-200',
                        collapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100',
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                  {item.badge !== undefined &&
                    (collapsed ? (
                      <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-(--sidebar-active) px-1 text-[9px] font-bold text-(--sidebar-active-fg) ring-2 ring-(--sidebar-bg)">
                        {item.badge}
                      </span>
                    ) : (
                      <span className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-(--sidebar-active) px-1.5 text-3xs font-semibold text-(--sidebar-active-fg)">
                        {item.badge}
                      </span>
                    ))}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div
        className={cn(
          'border-t border-(--sidebar-line) transition-all duration-200',
          collapsed ? 'space-y-1.5 p-2' : 'p-3',
        )}
      >
        <div
          title={collapsed ? session?.name || (isLender ? 'Lender' : 'Customer') : undefined}
          className={cn(
            'flex items-center rounded-lg bg-(--sidebar-user-bg) transition-all duration-200',
            collapsed ? 'justify-center p-1.5' : 'justify-between gap-2 p-2',
          )}
        >
          <div
            className={cn(
              'flex min-w-0 items-center',
              collapsed ? 'justify-center' : 'flex-1 gap-2.5',
            )}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-(--sidebar-line) text-xs font-bold"
              style={{
                backgroundColor: 'var(--sidebar-user-bg)',
                color: 'var(--sidebar-avatar-fg, #6451a2)',
              }}
            >
              {session?.name
                ? session.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'AO'}
            </span>
            <div
              className={cn(
                'min-w-0 flex-1 truncate transition-all duration-200',
                collapsed ? 'hidden max-w-0 opacity-0' : 'max-w-35 opacity-100',
              )}
            >
              <strong className="block truncate text-xs font-semibold text-(--sidebar-fg)">
                {session?.name || (isLender ? 'Lender' : 'Customer')}
              </strong>
              <span className="block truncate text-3xs text-(--sidebar-muted)">
                {isSigningOut
                  ? 'Signing out...'
                  : isLender
                    ? 'Lending administrator'
                    : `${currentInstitution.short} Customer`}
              </span>
            </div>
          </div>

          {!collapsed && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => void signOut()}
              isLoading={isSigningOut}
              title={isSigningOut ? 'Signing out...' : 'Sign out'}
              aria-label={isSigningOut ? 'Signing out' : 'Sign out'}
              className="h-8 w-8 shrink-0 rounded-lg text-(--sidebar-muted) transition-colors hover:bg-(--sidebar-hover) hover:text-(--sidebar-fg)"
            >
              {!isSigningOut && <LogOut className="h-4 w-4" aria-hidden="true" />}
            </Button>
          )}
        </div>

        {collapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void signOut()}
            isLoading={isSigningOut}
            title={isSigningOut ? 'Signing out...' : 'Sign out'}
            aria-label={isSigningOut ? 'Signing out' : 'Sign out'}
            className="flex h-9 w-full items-center justify-center rounded-lg text-(--sidebar-muted) transition-colors hover:bg-(--sidebar-hover) hover:text-(--sidebar-fg)"
          >
            {!isSigningOut && <LogOut className="h-4 w-4" aria-hidden="true" />}
          </Button>
        )}
      </div>
    </aside>
  );
}
