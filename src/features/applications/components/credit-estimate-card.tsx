import { Card } from '@/components/primitives/card';
import { DetailList } from '@/components/shared/detail-list';
import { formatCurrency } from '@/lib/utils/formatters';
import type { CustomerCreditApplication } from '../hooks/use-customer-credit-application';

export function CreditEstimateCard({ form }: { form: CustomerCreditApplication }) {
  const { currency, short } = form.institution;

  return (
    <Card className="overflow-hidden p-5 sm:p-6 lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold tracking-tight text-foreground">Your estimate</h2>
      </div>

      <div className="mt-4 rounded-xl border border-brand/20 bg-brand-pale/65 p-4">
        <span className="block text-[10px] font-bold tracking-wider text-brand uppercase">
          Estimated monthly repayment
        </span>
        <p className="mt-1.5 text-3xl font-bold tracking-[-0.06em] tabular-nums text-foreground">
          {formatCurrency(form.estimate.monthly, currency)}
        </p>
        <span className="mt-1 block text-[11px] font-medium text-muted-foreground">
          Across {form.term} monthly instalments
        </span>
      </div>

      <DetailList
        className="mt-4"
        rows={[
          { label: 'Amount requested', value: formatCurrency(form.amount, currency) },
          { label: 'Repayment period', value: `${form.term} months` },
          { label: 'Estimated interest', value: formatCurrency(form.estimate.interest, currency) },
          {
            label: 'Total estimated repayment',
            value: formatCurrency(form.estimate.total, currency),
            emphasis: true,
          },
        ]}
      />

      <p className="mt-4 border-t border-line pt-3.5 text-[11px] leading-relaxed text-muted-foreground">
        Illustrative quote for {short}. Final facility terms are confirmed upon underwriting
        approval.
      </p>
    </Card>
  );
}
