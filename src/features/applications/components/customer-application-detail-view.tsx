'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Clock, FileText, Trash2, Wallet, XCircle } from 'lucide-react';
import { Avatar } from '@/components/primitives/avatar';
import { StatusBadge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { ConfirmDialog } from '@/components/primitives/confirm-dialog';
import { DetailList } from '@/components/shared/detail-list';
import { RecordHeader } from '@/components/shared/record-header';
import { APPLICATION_STATUSES } from '@/lib/constants/application-statuses';
import { APP_ROUTE_BUILDERS, APP_ROUTES } from '@/lib/constants/routes';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/formatters';
import type { LoanApplication } from '@/types/application';
import type { Customer } from '@/types/customer';
import type { Institution } from '@/types/institution';
import type { Loan } from '@/types/loan';

export interface CustomerApplicationDetailViewProps {
  application: LoanApplication;
  institution: Institution;
  customer?: Customer;
  linkedLoan?: Loan;
  monthlyEstimate: number;
  onWithdraw?: () => void;
  isWithdrawing?: boolean;
}

function getReviewActivity(application: LoanApplication) {
  switch (application.status) {
    case APPLICATION_STATUSES.PENDING:
      return {
        title: 'Awaiting lender review',
        description: 'Submitted and awaiting review from the lending team.',
        toneClass: 'bg-warning-pale text-warning',
        icon: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
      };
    case APPLICATION_STATUSES.IN_REVIEW:
      return {
        title: 'Under review',
        description: 'A lending officer is reviewing this request.',
        toneClass: 'bg-brand-pale text-brand',
        icon: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
      };
    case APPLICATION_STATUSES.APPROVED:
      return {
        title: 'Credit approved',
        description: 'A funded loan account is linked to this request.',
        toneClass: 'bg-positive-pale text-positive',
        icon: <Check className="h-3.5 w-3.5" aria-hidden="true" />,
      };
    case APPLICATION_STATUSES.DECLINED:
      return {
        title: 'Application declined',
        description: application.note || 'The lender has completed its review.',
        toneClass: 'bg-destructive/10 text-destructive',
        icon: <XCircle className="h-3.5 w-3.5" aria-hidden="true" />,
      };
  }
}

export function CustomerApplicationDetailView({
  application,
  institution,
  customer,
  linkedLoan,
  monthlyEstimate,
  onWithdraw,
  isWithdrawing,
}: CustomerApplicationDetailViewProps) {
  const { currency } = institution;
  const activity = getReviewActivity(application);
  const canWithdraw = application.status === APPLICATION_STATUSES.PENDING && Boolean(onWithdraw);
  const [isWithdrawConfirmOpen, setIsWithdrawConfirmOpen] = React.useState(false);

  const requestFacts = [
    { label: 'Purpose', value: application.purpose },
    { label: 'Repayment term', value: `${application.term} months` },
    {
      label: 'Estimated repayment',
      value: `${formatCurrency(monthlyEstimate, currency)}/mo`,
    },
    {
      label: 'Submitted',
      value: (
        <>
          <span className="block">{formatDate(application.submitted)}</span>
          <span className="block text-2xs font-normal text-muted-foreground">
            {formatTime(application.submitted)}
          </span>
        </>
      ),
    },
  ];

  const applicantRows = [
    { label: 'Email', value: customer?.email ?? '—' },
    { label: 'Phone', value: customer?.phone ?? '—' },
  ];

  return (
    <div className="workspace-page">
      <RecordHeader
        backHref={APP_ROUTES.CUSTOMER.APPLICATIONS}
        backLabel="Applications"
        overline={application.id}
        title="Application details"
        subtitle={`${application.business} · Submitted ${formatDate(application.submitted)} · ${formatTime(application.submitted)}`}
        status={<StatusBadge status={application.status} />}
        actions={
          canWithdraw ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsWithdrawConfirmOpen(true)}
              disabled={isWithdrawing}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Withdraw application
            </Button>
          ) : undefined
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <header className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold tracking-tight text-foreground">Credit request</h2>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-pale text-brand">
                <FileText className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
            </header>

            <div className="mt-4 rounded-xl border border-line bg-muted/40 p-5">
              <span className="block text-2xs font-medium text-muted-foreground">
                Amount requested
              </span>
              <strong className="mt-1.5 block text-2xl font-bold tracking-[-0.055em] tabular-nums text-foreground sm:text-3xl">
                {formatCurrency(application.amount, currency)}
              </strong>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-line pt-5 sm:grid-cols-4">
              {requestFacts.map((fact) => (
                <div key={fact.label} className="min-w-0">
                  <span className="block text-2xs text-muted-foreground">{fact.label}</span>
                  <strong className="mt-1 block text-xs font-bold leading-snug text-foreground">
                    {fact.value}
                  </strong>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <header className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Application activity
              </h2>
              <Clock className="h-4.5 w-4.5 text-muted-foreground" aria-hidden="true" />
            </header>

            <ol className="mt-5 space-y-4">
              <li className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-positive-pale text-positive">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div>
                  <strong className="block text-xs font-bold text-foreground">
                    Application submitted
                  </strong>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(application.submitted)} · Request received by {institution.short}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${activity.toneClass}`}
                >
                  {activity.icon}
                </span>
                <div>
                  <strong className="block text-xs font-bold text-foreground">
                    {activity.title}
                  </strong>
                  <p className="mt-0.5 text-xs text-muted-foreground">{activity.description}</p>
                </div>
              </li>
            </ol>

            {linkedLoan && (
              <Link
                href={APP_ROUTE_BUILDERS.CUSTOMER.LOAN(linkedLoan.id)}
                className="group mt-6 flex items-center gap-3.5 rounded-xl border border-brand/25 bg-brand-pale/50 p-4 transition-colors hover:bg-brand-pale"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                  <Wallet className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-xs font-bold text-foreground">
                    View funded loan
                  </strong>
                  <small className="block text-2xs text-muted-foreground">
                    {linkedLoan.id} · {formatCurrency(linkedLoan.principal, currency)}
                  </small>
                </span>
                <ArrowRight
                  className="h-4 w-4 text-brand transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-bold tracking-tight text-foreground">Applicant</h2>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-muted/30 p-3.5">
              <Avatar name={application.business} size="md" />
              <div className="min-w-0">
                <strong className="block truncate text-xs font-bold text-foreground">
                  {application.business}
                </strong>
                <small className="block truncate text-2xs text-muted-foreground">
                  {application.name}
                </small>
              </div>
            </div>

            <DetailList rows={applicantRows} className="mt-3" />
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={isWithdrawConfirmOpen}
        onOpenChange={setIsWithdrawConfirmOpen}
        title="Withdraw credit application"
        description={`Are you sure you want to withdraw request #${application.id} (${formatCurrency(application.amount, currency)} for ${application.purpose})? This action cannot be undone.`}
        confirmLabel="Withdraw application"
        tone="danger"
        isLoading={Boolean(isWithdrawing)}
        onConfirm={() => {
          onWithdraw?.();
        }}
      />
    </div>
  );
}
