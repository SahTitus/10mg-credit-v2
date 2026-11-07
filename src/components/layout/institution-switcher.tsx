'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Check, ChevronDown } from 'lucide-react';
import { useInstitutionStore } from '@/store/institution-store';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/components/primitives/toast';
import { Button } from '@/components/primitives/button';
import { InstitutionLogo } from '@/components/shared/institution-logo';
import { APP_ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils/cn';
import { getCurrencySymbol } from '@/lib/utils/formatters';

export interface InstitutionSwitcherProps {
  collapsed?: boolean;
}

export function InstitutionSwitcher({ collapsed = false }: InstitutionSwitcherProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const current = useInstitutionStore((s) => s.currentInstitution);
  const institutions = useInstitutionStore((s) => s.institutions);
  const setInstitution = useInstitutionStore((s) => s.setInstitution);
  const role = useAuthStore((s) => s.session?.role) || 'lender';
  const { toast } = useToast();

  const workspaceLabel = role === 'lender' ? 'Lender' : 'Customer';

  const handleSelect = (id: string, name: string) => {
    setInstitution(id);
    setIsOpen(false);
    toast('Switched Institution', `Active workspace is now ${name}`, 'info');

    // Leave a record URL when switching tenants because its ID may belong to the old tenant
    if (pathname.startsWith(`${APP_ROUTES.CUSTOMER.LOANS}/`)) {
      router.push(APP_ROUTES.CUSTOMER.LOANS);
    } else if (pathname.startsWith(`${APP_ROUTES.CUSTOMER.APPLICATIONS}/`)) {
      router.push(APP_ROUTES.CUSTOMER.LOANS);
    } else if (pathname.startsWith(`${APP_ROUTES.CUSTOMER.PAYMENTS}/`)) {
      router.push(APP_ROUTES.CUSTOMER.PAYMENTS);
    }
  };

  return (
    <div className="relative w-full">
      <Button
        variant="ghost"
        onClick={() => setIsOpen((prev) => !prev)}
        title={collapsed ? `${current.name} (${workspaceLabel})` : undefined}
        aria-label={collapsed ? `Switch institution (${current.name})` : undefined}
        className={cn(
          'flex w-full cursor-pointer items-center rounded-lg border border-(--sidebar-line) bg-(--sidebar-tenant-bg) text-left transition-all duration-200 hover:bg-(--sidebar-hover)',
          collapsed ? 'min-h-11 justify-center p-1.5' : 'min-h-14 justify-between gap-2.5 p-2',
        )}
        aria-expanded={isOpen}
      >
        <InstitutionLogo
          logo={current.logo}
          initials={current.initials}
          name={current.name}
          className="h-8 w-8 text-xs"
          fallbackStyle={{
            backgroundColor: 'var(--sidebar-brandmark-bg)',
            color: 'var(--sidebar-brandmark-fg)',
          }}
        />
        <div
          className={cn(
            'min-w-0 flex-1 overflow-hidden transition-all duration-200',
            collapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100',
          )}
        >
          <strong className="block truncate text-xs font-semibold text-(--sidebar-fg)">
            {current.name}
          </strong>
          <span className="block truncate text-2xs text-(--sidebar-muted)">{workspaceLabel}</span>
        </div>
        {!collapsed && <ChevronDown className="h-3.5 w-3.5 shrink-0 text-(--sidebar-muted)" />}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="absolute top-full left-0 z-50 mt-2 w-max min-w-full rounded-xl border bg-popover p-2 text-popover-foreground shadow-[0_16px_40px_rgba(15,23,42,0.18)] animate-pop-in">
            <div className="px-2.5 pt-1 pb-2 text-[10px] font-bold tracking-[0.08em] text-muted-foreground uppercase">
              Switch institution
            </div>
            <div className="space-y-1">
              {institutions.map((inst) => {
                const isSelected = inst.id === current.id;
                return (
                  <Button
                    variant="ghost"
                    key={inst.id}
                    onClick={() => handleSelect(inst.id, inst.short)}
                    className={cn(
                      'flex h-auto w-full cursor-pointer items-center justify-between gap-4 rounded-lg px-2.5 py-2.5 text-left text-xs font-medium transition-colors',
                      isSelected
                        ? 'bg-brand-pale font-semibold text-brand'
                        : 'text-foreground hover:bg-muted/70',
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <InstitutionLogo
                        logo={inst.logo}
                        initials={inst.initials}
                        name={inst.name}
                        primaryColor={inst.primary}
                        className="h-7 w-7 text-2xs"
                      />
                      <div>
                        <span className="block whitespace-nowrap leading-snug">{inst.name}</span>
                        <span className="mt-0.5 block whitespace-nowrap text-2xs leading-none text-muted-foreground">
                          {inst.currency} ({getCurrencySymbol(inst.currency)})
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-brand" />}
                  </Button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
