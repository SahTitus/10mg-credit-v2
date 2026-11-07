import { Check, Info } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/primitives/dialog';
import { Input } from '@/components/primitives/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/primitives/select';
import type { CustomerRepaymentsState } from '@/features/repayments/hooks/use-customer-repayments';
import { formatCurrency, getCurrencySymbol } from '@/lib/utils/formatters';
import { getLoanBalance } from '@/lib/utils/loan-metrics';

export interface MakeRepaymentDialogProps {
  state: CustomerRepaymentsState;
}

export function MakeRepaymentDialog({ state }: MakeRepaymentDialogProps) {
  const { currency } = state.institution;

  return (
    <Dialog open={state.isDialogOpen} onOpenChange={state.setIsDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Make a repayment</DialogTitle>
          <DialogDescription>Add a payment toward an active loan account.</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="customer-repay-loan"
              className="block text-xs font-semibold text-foreground/90"
            >
              Loan account
            </label>
            <Select value={state.selectedLoanId} onValueChange={state.setSelectedLoanId}>
              <SelectTrigger id="customer-repay-loan">
                <SelectValue placeholder="Choose loan account" />
              </SelectTrigger>
              <SelectContent>
                {state.activeLoans.map((loan) => (
                  <SelectItem key={loan.id} value={loan.id}>
                    {loan.id} · {formatCurrency(getLoanBalance(loan), currency)} remaining
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            id="customer-repay-amount"
            label={`Payment amount (${getCurrencySymbol(currency)})`}
            type="number"
            inputMode="numeric"
            min={1}
            max={state.maxPayable}
            value={state.amountInput}
            onChange={(event) => state.setAmountInput(event.target.value)}
            helperText={
              state.maxPayable > 0
                ? `Up to ${formatCurrency(state.maxPayable, currency)} remaining`
                : undefined
            }
          />

          <div className="flex items-start gap-2.5 rounded-xl border border-line bg-muted/40 p-3.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            <span>Payments are applied directly to your outstanding loan balance.</span>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="primary"
            onClick={state.submitPayment}
            isLoading={state.isSubmitting}
            disabled={!state.canSubmit}
          >
            Record payment
            <Check className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
