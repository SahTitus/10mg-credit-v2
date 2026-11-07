import Link from 'next/link';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { StatusBadge } from '@/components/primitives/badge';
import { Card } from '@/components/primitives/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/primitives/table';
import { DetailList } from '@/components/shared/detail-list';
import { EmptyState } from '@/components/shared/empty-state';
import { KpiCard } from '@/components/shared/kpi-card';
import { RecordHeader } from '@/components/shared/record-header';
import { MobileDataCard, ResponsiveDataList } from '@/components/shared/responsive-data-list';
import { LOAN_STATUSES } from '@/lib/constants/application-statuses';
import { APP_ROUTE_BUILDERS, APP_ROUTES } from '@/lib/constants/routes';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/formatters';
import { getLoanBalance, getLoanProgress } from '@/lib/utils/loan-metrics';
import type { Institution } from '@/types/institution';
import type { Loan, LoanScheduleInstallment } from '@/types/loan';
import type { Repayment } from '@/types/repayment';

export interface CustomerLoanDetailViewProps {
  loan: Loan;
  institution: Institution;
  repayments: readonly Repayment[];
  schedule: readonly LoanScheduleInstallment[];
  backHref?: string;
  backLabel?: string;
  applicationHref?: (id: string) => string;
  paymentHref?: (id: string) => string;
}

const RING_CIRCUMFERENCE = 383;

// Lender pages pass their own record links when they reuse this view
export function CustomerLoanDetailView({
  loan,
  institution,
  repayments,
  schedule,
  backHref = APP_ROUTES.CUSTOMER.LOANS,
  backLabel = 'My loans',
  applicationHref = APP_ROUTE_BUILDERS.CUSTOMER.APPLICATION,
  paymentHref = APP_ROUTE_BUILDERS.CUSTOMER.PAYMENT,
}: CustomerLoanDetailViewProps) {
  const { currency } = institution;
  const balance = getLoanBalance(loan);
  const progress = getLoanProgress(loan);
  const strokeDash = ((progress / 100) * RING_CIRCUMFERENCE).toFixed(1);

  const accountRows = [
    { label: 'Loan reference', value: loan.id },
    { label: 'Borrower', value: loan.borrower },
    {
      label: 'Disbursed',
      value: (
        <>
          <span className="block">{formatDate(loan.issued)}</span>
          <span className="block text-2xs font-normal text-muted-foreground">
            {formatTime(loan.issued)}
          </span>
        </>
      ),
    },
    { label: 'Final due date', value: formatDate(loan.due) },
    {
      label: 'Linked application',
      value: (
        <Link
          href={applicationHref(loan.applicationId)}
          className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
        >
          {loan.applicationId}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ),
    },
  ];

  return (
    <div className="workspace-page">
      <RecordHeader
        backHref={backHref}
        backLabel={backLabel}
        overline={loan.id}
        title="Loan details"
        subtitle={`${loan.business} · ${loan.borrower}`}
        status={<StatusBadge status={loan.status} />}
      />

      <section className="loan-detail-hero">
        <div className="loan-detail-primary">
          <span className="micro-overline">OUTSTANDING BALANCE</span>
          <strong>{formatCurrency(balance, currency)}</strong>
          <span>
            {loan.status === LOAN_STATUSES.COMPLETED
              ? 'Fully settled'
              : `Due ${formatDate(loan.due)}`}
          </span>
        </div>

        <div className="loan-detail-illustration" aria-hidden="true">
          <svg viewBox="0 0 150 150">
            <circle
              cx="75"
              cy="75"
              r="61"
              fill="none"
              stroke="rgba(255,255,255,.13)"
              strokeWidth="18"
            />
            <circle
              cx="75"
              cy="75"
              r="61"
              fill="none"
              stroke="#9bddd9"
              strokeWidth="18"
              strokeDasharray={`${strokeDash} ${RING_CIRCUMFERENCE}`}
              strokeLinecap="round"
              transform="rotate(-90 75 75)"
            />
            <text x="75" y="77" textAnchor="middle" fill="white" fontSize="24" fontWeight="730">
              {progress}%
            </text>
            <text
              x="75"
              y="95"
              textAnchor="middle"
              fill="rgba(255,255,255,.75)"
              fontSize="9.5"
              fontWeight="600"
              letterSpacing="0.06em"
            >
              REPAID
            </text>
          </svg>
        </div>
      </section>

      <div className="workspace-kpi-grid">
        <KpiCard
          label="Original loan"
          value={formatCurrency(loan.principal, currency)}
          note={`Disbursed ${formatDate(loan.issued)}`}
          icon={<Wallet className="h-4 w-4" />}
          tone="blue"
          sparklineIndex={0}
        />
        <KpiCard
          label="Total repayable"
          value={formatCurrency(loan.totalDue, currency)}
          note={`Includes ${institution.interest}% p.a. interest`}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="violet"
          sparklineIndex={1}
        />
        <KpiCard
          label="Paid to date"
          value={formatCurrency(loan.paid, currency)}
          note={`${progress}% of facility settled`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="green"
          sparklineIndex={2}
        />
        <KpiCard
          label="Repayment term"
          value={`${loan.term} months`}
          note={`${schedule.length} scheduled instalments`}
          icon={<Clock className="h-4 w-4" />}
          tone="orange"
          sparklineIndex={3}
        />
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4 sm:items-center sm:px-6">
              <div className="min-w-0">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  Repayment history
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Recorded payments on this credit account
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-muted px-2.5 py-1 text-2xs font-semibold whitespace-nowrap text-muted-foreground">
                {repayments.length} {repayments.length === 1 ? 'payment' : 'payments'}
              </span>
            </header>

            {repayments.length === 0 ? (
              <EmptyState
                className="m-5 sm:m-6"
                icon={<Receipt className="h-5 w-5" />}
                title="No payments recorded"
                description="Transactions will appear here when a repayment is recorded."
              />
            ) : (
              <ResponsiveDataList
                table={
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repayments.map((payment) => (
                        <TableRow key={payment.id} className="transition-colors hover:bg-muted/30">
                          <TableCell className="font-mono font-semibold text-foreground">
                            {payment.id}
                          </TableCell>
                          <TableCell>
                            <span className="block font-semibold text-foreground">
                              {formatDate(payment.date)}
                            </span>
                            <span className="block text-2xs text-muted-foreground">
                              {formatTime(payment.date)}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono font-bold text-foreground">
                            {formatCurrency(payment.amount, currency)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={payment.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Link
                              href={paymentHref(payment.id)}
                              className="inline-flex h-7.5 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                              aria-label={`View payment ${payment.id}`}
                            >
                              <span>View</span>
                              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                }
              >
                {repayments.map((payment) => (
                  <MobileDataCard
                    key={payment.id}
                    href={paymentHref(payment.id)}
                    leading={
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-positive-pale text-positive">
                        <Receipt className="h-4 w-4" aria-hidden="true" />
                      </span>
                    }
                    title={payment.id}
                    subtitle={`${formatDate(payment.date)} · ${formatTime(payment.date)}`}
                    value={formatCurrency(payment.amount, currency)}
                    trailing={<StatusBadge status={payment.status} />}
                  />
                ))}
              </ResponsiveDataList>
            )}
          </Card>

          <Card className="overflow-hidden">
            <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4 sm:items-center sm:px-6">
              <div className="min-w-0">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  Repayment schedule
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Illustrative monthly instalments
                </p>
              </div>
              <Calendar className="h-4.5 w-4.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            </header>

            <div className="divide-y divide-line">
              {schedule.map((item) => (
                <div
                  key={item.number}
                  className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted font-mono text-xs font-bold tabular-nums text-muted-foreground">
                      {String(item.number).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <strong className="block truncate text-xs font-bold text-foreground">
                        Instalment {item.number}
                      </strong>
                      <small className="mt-0.5 block truncate text-2xs text-muted-foreground">
                        Due {formatDate(item.dueDate)}
                      </small>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-right sm:flex-row sm:items-center sm:gap-3.5">
                    <strong className="font-mono text-xs font-bold tabular-nums text-foreground">
                      {formatCurrency(item.amount, currency)}
                    </strong>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5 sm:p-6">
            <h2 className="mb-2 text-sm font-bold tracking-tight text-foreground">
              Account information
            </h2>
            <DetailList rows={accountRows} />
          </Card>
        </aside>
      </div>
    </div>
  );
}
