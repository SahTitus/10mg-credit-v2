'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, ArrowUpRight, FileText, LayoutGrid, Landmark, Wallet } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { InstitutionLogo } from '@/components/shared/institution-logo';
import { APP_ROUTES } from '@/lib/constants/routes';
import { useAuthStore } from '@/store/auth-store';
import { useInstitutionStore } from '@/store/institution-store';

export default function NotFoundPage() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const institution = useInstitutionStore((state) => state.currentInstitution);

  const isCustomer = session?.role === 'customer';
  const overviewRoute = isCustomer ? APP_ROUTES.CUSTOMER.OVERVIEW : APP_ROUTES.LENDER.OVERVIEW;

  const quickLinks = isCustomer
    ? [
        {
          label: 'Overview',
          detail: 'Account summary & credit activity',
          href: APP_ROUTES.CUSTOMER.OVERVIEW,
          icon: LayoutGrid,
        },
        {
          label: 'My loans',
          detail: 'Active facilities & schedules',
          href: APP_ROUTES.CUSTOMER.LOANS,
          icon: Landmark,
        },
        {
          label: 'Payments',
          detail: 'Repayment history & receipts',
          href: APP_ROUTES.CUSTOMER.PAYMENTS,
          icon: Wallet,
        },
      ]
    : [
        {
          label: 'Overview',
          detail: 'Portfolio metrics & pulse',
          href: APP_ROUTES.LENDER.OVERVIEW,
          icon: LayoutGrid,
        },
        {
          label: 'Applications',
          detail: 'Underwriting pipeline & decisions',
          href: APP_ROUTES.LENDER.APPLICATIONS,
          icon: FileText,
        },
        {
          label: 'Loan portfolio',
          detail: 'Active facilities & ledgers',
          href: APP_ROUTES.LENDER.LOANS,
          icon: Landmark,
        },
      ];

  return (
    <div className="relative isolate flex min-h-dvh flex-col justify-between overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(640px circle at 100% 0%, var(--brand-pale), transparent 70%), radial-gradient(520px circle at 0% 100%, rgba(23, 118, 206, 0.04), transparent 65%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-64 -right-64 -z-10 h-130 w-130 bg-[url('/assets/auth-quiet-lines.svg')] bg-contain bg-center bg-no-repeat opacity-80"
        aria-hidden="true"
      />

      <header className="border-b border-line bg-card/90 backdrop-blur-xs">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Link href={overviewRoute} className="inline-flex items-center gap-3">
            <span className="grid h-8.5 w-8.5 place-items-center rounded-[9px] bg-brand text-white shadow-xs">
              <Activity className="h-4.5 w-4.5" />
            </span>
            <div className="flex items-center gap-2.5">
              <strong className="text-[16px] font-bold tracking-[-0.04em] text-foreground">
                10mg Credit V2
              </strong>
              <span className="h-3.5 w-px bg-line" aria-hidden="true" />
              <span className="text-xs font-semibold text-muted-foreground">
                {institution.short}
              </span>
            </div>
          </Link>

          <Link
            href={APP_ROUTES.AUTH.LOGIN}
            className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Switch account
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-12">
        <Card className="relative overflow-hidden p-7 sm:p-10">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <span className="inline-flex items-center rounded-full border border-brand/20 bg-brand-pale/75 px-3 py-1 text-3xs font-bold tracking-[0.08em] text-brand uppercase">
                404 Error
              </span>

              <h1 className="mt-4 text-[clamp(1.85rem,3vw,2.45rem)] font-bold leading-[1.1] tracking-[-0.055em] text-foreground">
                Page not found
              </h1>

              <p className="mt-2.5 max-w-115 text-sm leading-relaxed font-medium text-muted-foreground">
                The address you requested does not match an active route in the{' '}
                <span className="font-semibold text-foreground">{institution.name}</span> workspace.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  className="h-10.5 px-5"
                  onClick={() => router.push(overviewRoute)}
                >
                  Back to overview
                </Button>
                <Button variant="outline" className="h-10.5 px-4" onClick={() => router.back()}>
                  Previous page
                </Button>
              </div>
            </div>

            <div className="hidden flex-col justify-between rounded-xl border border-brand/18 bg-brand-pale/55 p-5 md:flex">
              <div className="flex items-center justify-between">
                <InstitutionLogo
                  logo={institution.logo}
                  initials={institution.initials}
                  name={institution.name}
                  primaryColor={institution.primary}
                  className="h-7 w-7 rounded-lg text-xs shadow-xs"
                />
                <span className="rounded-md bg-card/90 px-2 py-0.5 text-[10px] font-bold tracking-wider text-brand uppercase">
                  {isCustomer ? 'Customer' : 'Lender'}
                </span>
              </div>
              <div className="my-5 text-[44px] font-bold leading-none tracking-[-0.068em] tabular-nums text-brand/25">
                404
              </div>
              <div>
                <strong className="block truncate text-xs font-bold text-foreground">
                  {institution.name}
                </strong>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group block">
                <Card className="h-full p-4.5 transition-all duration-150 group-hover:-translate-y-0.5 group-hover:border-brand/35 group-hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="grid h-8.5 w-8.5 place-items-center rounded-lg bg-brand-pale text-brand">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
                      aria-hidden="true"
                    />
                  </div>
                  <strong className="mt-3.5 block text-[14px] font-bold tracking-tight text-foreground group-hover:text-brand">
                    {item.label}
                  </strong>
                  <span className="mt-1 block text-xs font-medium text-muted-foreground">
                    {item.detail}
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="py-5 text-center text-xs font-medium text-muted-foreground">
        {institution.name} · 10mg Credit V2
      </footer>
    </div>
  );
}
