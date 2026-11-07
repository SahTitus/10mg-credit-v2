import { DetailList } from '@/components/shared/detail-list';
import { formatCurrency } from '@/lib/utils/formatters';
import type { CustomerCreditApplication } from '../hooks/use-customer-credit-application';

export function CreditReviewStep({ form }: { form: CustomerCreditApplication }) {
  const { institution } = form;

  return (
    <div className="space-y-4">
      <DetailList
        className="rounded-lg border border-line px-4"
        rows={[
          { label: 'Institution', value: institution.name },
          { label: 'Amount', value: formatCurrency(form.amount, institution.currency) },
          { label: 'Purpose', value: form.purpose },
          { label: 'Repayment term', value: `${form.term} months` },
          {
            label: 'Estimated monthly payment',
            value: formatCurrency(form.estimate.monthly, institution.currency),
          },
        ]}
      />
      <p className="text-xs leading-relaxed text-muted-foreground">
        Your application will be sent to {institution.short} for review. We will notify you once a
        decision is ready.
      </p>
    </div>
  );
}
