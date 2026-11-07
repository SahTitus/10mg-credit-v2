'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { StatusBadge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { Skeleton } from '@/components/primitives/skeleton';
import { APP_ROUTE_BUILDERS } from '@/lib/constants/routes';
import { formatCurrency, formatShortDate } from '@/lib/utils/formatters';
import { getLoanBalance, getLoanProgress } from '@/lib/utils/loan-metrics';
import type { CurrencyCode } from '@/types/institution';
import type { Loan } from '@/types/loan';

export interface RepaymentProgressWidgetProps {
  activeLoan?: Loan;
  currency: CurrencyCode;
  isLoading?: boolean;
}

const DIAL_RADIUS = 44;
const DIAL_CIRCUMFERENCE = Math.round(2 * Math.PI * DIAL_RADIUS);

export function RepaymentProgressWidget({
  activeLoan,
  currency,
  isLoading = false,
}: RepaymentProgressWidgetProps) {
  if (isLoading) {
    return <Skeleton className="min-h-62.5 w-full rounded-xl" />;
  }

  if (!activeLoan) {
    return null;
  }

  const progress = getLoanProgress(activeLoan);
  const remaining = getLoanBalance(activeLoan);
  const strokeDash = Math.round((progress / 100) * DIAL_CIRCUMFERENCE);

  return (
    <Card
      className="relative isolate flex flex-col justify-between overflow-hidden border-0 p-5 text-white shadow-[0_10px_28px_rgba(6,24,38,0.16)] sm:p-6"
      style={{
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--brand) 72%, #061b26) 0%, color-mix(in srgb, var(--brand) 90%, #092938) 100%)',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute -top-12 -right-10 h-44 w-44 rounded-3xl bg-white/4 ring-1 ring-white/6"
          style={{ transform: 'rotate(18deg)' }}
        />
        <TrendingUp
          strokeWidth={1.4}
          className="absolute top-3 right-5 h-24 w-24 -rotate-6 text-white/5.5"
        />
        <Wallet
          strokeWidth={1.25}
          className="absolute -right-6 -bottom-7 h-44 w-44 -rotate-12 text-white/6.5"
        />
        <Activity
          strokeWidth={1.3}
          className="absolute bottom-8 left-4 h-28 w-28 rotate-6 text-white/4"
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="micro-overline block text-[#fcd34d]!">YOUR REPAYMENT PROGRESS</span>
            <strong className="mt-1 block text-base font-bold tracking-tight text-white">
              {activeLoan.id}
            </strong>
          </div>
          <StatusBadge status={activeLoan.status} />
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-xl border border-white/14 bg-white/8 p-3.5 backdrop-blur-[2px]">
          <div className="relative h-22 w-22 shrink-0" aria-hidden="true">
            <svg viewBox="0 0 108 108" className="h-full w-full">
              <circle
                cx="54"
                cy="54"
                r={DIAL_RADIUS}
                fill="none"
                stroke="rgba(255, 255, 255, 0.16)"
                strokeWidth="9"
              />
              <circle
                cx="54"
                cy="54"
                r={DIAL_RADIUS}
                fill="none"
                stroke="#facc15"
                strokeWidth="9"
                strokeDasharray={`${strokeDash} ${DIAL_CIRCUMFERENCE}`}
                transform="rotate(-90 54 54)"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <strong className="text-base font-bold tracking-tight tabular-nums text-white">
                {progress}%
              </strong>
              <span className="text-[9px] font-bold tracking-wider text-white/75 uppercase">
                Repaid
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-white/80">
                <CreditCard className="h-3.5 w-3.5 text-white/80" aria-hidden="true" />
                Total amount
              </span>
              <strong className="font-mono font-bold text-white">
                {formatCurrency(activeLoan.totalDue, currency)}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-white/80">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#74deb7]" aria-hidden="true" />
                Paid to date
              </span>
              <strong className="font-mono font-bold text-white">
                {formatCurrency(activeLoan.paid, currency)}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-white/80">
                <Wallet className="h-3.5 w-3.5 text-[#fcd34d]" aria-hidden="true" />
                Remaining
              </span>
              <strong className="font-mono font-bold text-white">
                {formatCurrency(remaining, currency)}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-white/14 pt-2">
              <span className="inline-flex items-center gap-1.5 text-white/80">
                <Calendar className="h-3.5 w-3.5 text-white/70" aria-hidden="true" />
                Due date
              </span>
              <strong className="font-semibold text-white">
                {formatShortDate(activeLoan.due)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-4 border-t border-white/14 pt-4">
        <Link href={APP_ROUTE_BUILDERS.CUSTOMER.LOAN(activeLoan.id)} className="block">
          <Button
            variant="secondary"
            className="bg-white! text-slate-950! hover:bg-slate-100! w-full font-semibold shadow-xs"
          >
            View details
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
