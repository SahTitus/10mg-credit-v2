import { CheckCircle2, Clock, TrendingUp, Wallet } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { formatCurrency } from '@/lib/utils/formatters';
import type { CurrencyCode } from '@/types/institution';

export interface CustomerLoanSummaryProps {
  principal: number;
  outstanding: number;
  repaid: number;
  activeCount: number;
  completedCount: number;
  currency: CurrencyCode;
  isLoading?: boolean;
}

export function CustomerLoanSummary({
  principal,
  outstanding,
  repaid,
  activeCount,
  completedCount,
  currency,
  isLoading = false,
}: CustomerLoanSummaryProps) {
  const totalAccounts = activeCount + completedCount;

  return (
    <div className="workspace-kpi-grid">
      <KpiCard
        label="Outstanding balance"
        value={formatCurrency(outstanding, currency, true)}
        note="Remaining across facilities"
        icon={<Clock className="h-4 w-4" />}
        tone="orange"
        sparklineIndex={0}
        isLoading={isLoading}
      />
      <KpiCard
        label="Total financed"
        value={formatCurrency(principal, currency, true)}
        note={`${totalAccounts} credit ${totalAccounts === 1 ? 'account' : 'accounts'}`}
        icon={<TrendingUp className="h-4 w-4" />}
        tone="blue"
        sparklineIndex={1}
        isLoading={isLoading}
      />
      <KpiCard
        label="Active loans"
        value={activeCount}
        note="Currently in repayment"
        icon={<Wallet className="h-4 w-4" />}
        tone="violet"
        sparklineIndex={2}
        isLoading={isLoading}
      />
      <KpiCard
        label="Fully repaid"
        value={completedCount}
        note={`${formatCurrency(repaid, currency, true)} paid to date`}
        icon={<CheckCircle2 className="h-4 w-4" />}
        tone="green"
        sparklineIndex={3}
        isLoading={isLoading}
      />
    </div>
  );
}
