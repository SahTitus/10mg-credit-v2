import Link from 'next/link';
import { ArrowRight, Check, History, Wallet } from 'lucide-react';
import { Avatar } from '@/components/primitives/avatar';
import { StatusBadge } from '@/components/primitives/badge';
import { Card } from '@/components/primitives/card';
import { Progress } from '@/components/primitives/progress';
import { DetailList } from '@/components/shared/detail-list';
import { RecordHeader } from '@/components/shared/record-header';
import { APP_ROUTE_BUILDERS, APP_ROUTES } from '@/lib/constants/routes';
import { clamp, formatCurrency, formatDate, formatTime } from '@/lib/utils/formatters';
import type { Institution } from '@/types/institution';
import type { Loan } from '@/types/loan';
import type { Repayment } from '@/types/repayment';

export interface CustomerPaymentReceiptProps {
  payment: Repayment;
  institution: Institution;
  loan?: Loan;
  history: readonly Repayment[];
  backHref?: string;
  backLabel?: string;
  paymentHref?: (id: string) => string;
  loanHref?: (id: string) => string;
}

// Lender pages supply lender record paths through the optional link props
export function CustomerPaymentReceipt({
  payment,
  institution,
  loan,
  history,
  backHref = APP_ROUTES.CUSTOMER.PAYMENTS,
  backLabel = 'Payments',
  paymentHref = APP_ROUTE_BUILDERS.CUSTOMER.PAYMENT,
  loanHref = APP_ROUTE_BUILDERS.CUSTOMER.LOAN,
}: CustomerPaymentReceiptProps) {
  const { currency } = institution;
  const remaining = loan ? Math.max(0, loan.totalDue - loan.paid) : 0;
  const progress = loan ? clamp(Math.round((loan.paid / loan.totalDue) * 100), 0, 100) : 0;

  const receiptRows = [
    { label: 'Reference', value: payment.id },
    {
      label: 'Payment date',
      value: (
        <>
          <span className="block">{formatDate(payment.date)}</span>
          <span className="block text-2xs font-normal text-muted-foreground">
            {formatTime(payment.date)}
          </span>
        </>
      ),
    },
    { label: 'Loan account', value: payment.loanId },
    { label: 'Paid by', value: payment.name },
    { label: 'Business', value: payment.business },
    { label: 'Status', value: <StatusBadge status={payment.status} /> },
  ];

  const otherPayments = history.filter((entry) => entry.id !== payment.id);

  return (
    <div className="workspace-page">
      <RecordHeader
        backHref={backHref}
        backLabel={backLabel}
        overline={payment.id}
        title="Payment details"
        subtitle={`${formatDate(payment.date)} · ${formatTime(payment.date)} · ${payment.business}`}
        status={<StatusBadge status={payment.status} />}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-4 border-b border-line bg-positive-pale/50 px-5 py-6 sm:px-7">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-positive text-white">
                <Check className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <span className="block text-2xs font-semibold text-positive">Payment received</span>
                <strong className="mt-0.5 block text-3xl font-bold tracking-[-0.06em] tabular-nums text-foreground sm:text-4xl">
                  {formatCurrency(payment.amount, currency)}
                </strong>
              </div>
            </div>

            <div className="p-5 sm:px-7 sm:pb-5">
              <h2 className="text-sm font-bold tracking-tight text-foreground">Receipt</h2>
              <DetailList rows={receiptRows} className="mt-1" />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <header className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Other payments on this loan
              </h2>
              <History className="h-4.5 w-4.5 text-muted-foreground" aria-hidden="true" />
            </header>

            {otherPayments.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center text-xs text-muted-foreground">
                This is the only payment recorded on this loan.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {otherPayments.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      href={paymentHref(entry.id)}
                      className="group flex items-center justify-between gap-3 py-3 text-xs transition-colors hover:text-brand"
                    >
                      <span className="min-w-0">
                        <strong className="block font-semibold text-foreground group-hover:text-brand">
                          {entry.id}
                        </strong>
                        <small className="block text-2xs text-muted-foreground">
                          {formatDate(entry.date)} · {formatTime(entry.date)}
                        </small>
                      </span>
                      <span className="font-bold tabular-nums text-foreground">
                        {formatCurrency(entry.amount, currency)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-bold tracking-tight text-foreground">Loan account</h2>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-muted/30 p-3.5">
              <Avatar name={payment.business} size="md" />
              <div className="min-w-0">
                <strong className="block truncate text-xs font-bold text-foreground">
                  {payment.business}
                </strong>
                <small className="block truncate text-2xs text-muted-foreground">
                  {payment.loanId}
                </small>
              </div>
            </div>

            {loan && (
              <>
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-2xs text-muted-foreground">
                    <span>Repaid</span>
                    <strong className="tabular-nums text-foreground">{progress}%</strong>
                  </div>
                  <Progress value={progress} label={`${loan.id} repayment progress`} />
                </div>

                <DetailList
                  className="mt-2"
                  rows={[
                    { label: 'Principal', value: formatCurrency(loan.principal, currency) },
                    { label: 'Total due', value: formatCurrency(loan.totalDue, currency) },
                    { label: 'Paid to date', value: formatCurrency(loan.paid, currency) },
                    {
                      label: 'Remaining',
                      value: formatCurrency(remaining, currency),
                      emphasis: true,
                    },
                    { label: 'Due date', value: formatDate(loan.due) },
                  ]}
                />
              </>
            )}

            <Link
              href={loanHref(payment.loanId)}
              className="group mt-4 flex items-center gap-3 rounded-xl border border-brand/25 bg-brand-pale/50 p-3.5 transition-colors hover:bg-brand-pale"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                <Wallet className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 text-xs font-bold text-foreground">
                View loan details
              </span>
              <ArrowRight
                className="h-4 w-4 text-brand transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
