import { OptionCard } from '@/components/primitives/option-card';
import { formatCurrency } from '@/lib/utils/formatters';
import type { CustomerCreditApplication } from '../hooks/use-customer-credit-application';

export function CreditPlanStep({ form }: { form: CustomerCreditApplication }) {
  const { currency, interest } = form.institution;

  return (
    <div className="space-y-5">
      <div role="radiogroup" aria-label="Repayment period" className="grid gap-3 sm:grid-cols-2">
        {form.terms.map((term) => {
          const termInterest = Math.round(form.amount * ((interest * term) / 1200));
          const termMonthly = form.amount > 0 ? Math.round((form.amount + termInterest) / term) : 0;

          return (
            <OptionCard
              key={term}
              selected={form.term === term}
              title={`${term} months`}
              description={
                termMonthly > 0
                  ? `${formatCurrency(termMonthly, currency)} / month · ${term} instalments`
                  : `${term} monthly instalments`
              }
              onClick={() => form.setTerm(term)}
            />
          );
        })}
      </div>

      <div className="rounded-xl border border-brand/20 bg-brand-pale/55 p-4 text-xs leading-relaxed text-muted-foreground">
        Repayment estimates are calculated using {form.institution.short}&apos;s fixed {interest}%
        p.a. rate. Final terms are confirmed upon underwriting approval.
      </div>
    </div>
  );
}
