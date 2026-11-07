import * as React from 'react';
import { Input } from '@/components/primitives/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/primitives/select';
import { Textarea } from '@/components/primitives/textarea';
import { formatCurrency, getCurrencySymbol } from '@/lib/utils/formatters';
import type { CustomerCreditApplication } from '../hooks/use-customer-credit-application';

const PURPOSE_FIELD_ID = 'credit-purpose';

export function CreditDetailsStep({ form }: { form: CustomerCreditApplication }) {
  const { currency, minLoan, maxLoan, interest } = form.institution;
  const currencySymbol = getCurrencySymbol(currency);

  const presets = React.useMemo(() => {
    const stepSize = maxLoan >= 1000000 ? 50000 : maxLoan >= 100000 ? 5000 : 1000;
    const raw = [
      minLoan,
      Math.round((minLoan + (maxLoan - minLoan) * 0.15) / stepSize) * stepSize,
      Math.round((minLoan + (maxLoan - minLoan) * 0.35) / stepSize) * stepSize,
      Math.round((minLoan + (maxLoan - minLoan) * 0.65) / stepSize) * stepSize,
    ];
    return Array.from(new Set(raw)).filter((val) => val >= minLoan && val <= maxLoan);
  }, [minLoan, maxLoan]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-xl border border-brand/20 bg-brand-pale/65 p-3.5 sm:grid-cols-3">
        <div>
          <span className="block text-[10px] font-bold tracking-wider text-brand uppercase">
            Facility range
          </span>
          <strong className="mt-0.5 block text-xs font-bold tabular-nums text-foreground sm:text-sm">
            {formatCurrency(minLoan, currency, true)} – {formatCurrency(maxLoan, currency, true)}
          </strong>
        </div>
        <div className="border-t border-brand/15 pt-3 sm:border-t-0 sm:border-l sm:pl-3 sm:pt-0">
          <span className="block text-[10px] font-bold tracking-wider text-brand uppercase">
            Annual rate
          </span>
          <strong className="mt-0.5 block text-xs font-bold tabular-nums text-foreground sm:text-sm">
            {interest}% p.a.
          </strong>
        </div>
        <div className="border-t border-brand/15 pt-3 sm:border-t-0 sm:border-l sm:pl-3 sm:pt-0">
          <span className="block text-[10px] font-bold tracking-wider text-brand uppercase">
            Available terms
          </span>
          <strong className="mt-0.5 block text-xs font-bold text-foreground sm:text-sm">
            3 – 12 months
          </strong>
        </div>
      </div>

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <Input
          label={`Amount requested (${currencySymbol})`}
          type="number"
          inputMode="numeric"
          min={minLoan}
          max={maxLoan}
          step={100}
          value={form.amountInput}
          error={form.amountError}
          onChange={(event) => form.setAmountInput(event.target.value)}
          placeholder={`e.g. ${presets[1] ?? minLoan}`}
          className="h-10.5 font-mono font-semibold"
        />

        <div className="space-y-1.5">
          <label
            htmlFor={PURPOSE_FIELD_ID}
            className="block text-xs font-semibold text-foreground/90"
          >
            Financing purpose
          </label>
          <Select value={form.purpose} onValueChange={form.setPurpose}>
            <SelectTrigger id={PURPOSE_FIELD_ID} className="h-10.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {form.purposes.map((purpose) => (
                <SelectItem key={purpose} value={purpose}>
                  {purpose}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Textarea
        label="Additional details (optional)"
        rows={3}
        value={form.notes}
        onChange={(event) => form.setNotes(event.target.value)}
        placeholder="Briefly describe the inventory, supplier, or equipment this facility will fund"
      />
    </div>
  );
}
