'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, CheckCircle, Clock, FileText, Wallet, XCircle } from 'lucide-react';
import { Avatar } from '@/components/primitives/avatar';
import { StatusBadge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { ConfirmDialog } from '@/components/primitives/confirm-dialog';
import { Skeleton } from '@/components/primitives/skeleton';
import { Textarea } from '@/components/primitives/textarea';
import { DetailList } from '@/components/shared/detail-list';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { RecordHeader } from '@/components/shared/record-header';
import { RecordNotFound } from '@/components/shared/record-not-found';
import { useLenderApplicationDetail } from '@/features/applications/hooks/use-lender-application-detail';
import { APPLICATION_STATUSES } from '@/lib/constants/application-statuses';
import { APP_ROUTE_BUILDERS, APP_ROUTES } from '@/lib/constants/routes';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/formatters';

export default function LenderApplicationDetailPage() {
  const {
    application,
    decisionMutation,
    institution,
    linkedLoan,
    monthlyEstimate,
    isLoading,
    isError,
    errorMessage,
    retry,
    isRetrying,
    isMissing,
    note,
    setNote,
  } = useLenderApplicationDetail();
  const [pendingDecision, setPendingDecision] = React.useState<
    typeof APPLICATION_STATUSES.APPROVED | typeof APPLICATION_STATUSES.DECLINED | null
  >(null);

  if (isLoading)
    return (
      <div className="space-y-5">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );

  if (isError)
    return (
      <QueryErrorState
        title="Unable to load application"
        description={errorMessage}
        onRetry={retry}
        isRetrying={isRetrying}
        backHref={APP_ROUTES.LENDER.APPLICATIONS}
        backLabel="Applications"
      />
    );

  if (isMissing || !application)
    return <RecordNotFound backHref={APP_ROUTES.LENDER.APPLICATIONS} backLabel="Applications" />;

  const isPending = application.status === APPLICATION_STATUSES.PENDING;
  const isInReview = application.status === APPLICATION_STATUSES.IN_REVIEW;
  const isApproved = application.status === APPLICATION_STATUSES.APPROVED;

  const requestFacts = [
    { label: 'Purpose', value: application.purpose },
    { label: 'Repayment term', value: `${application.term} months` },
    {
      label: 'Estimated repayment',
      value: `${formatCurrency(monthlyEstimate, institution.currency)}/mo`,
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
    { label: 'Email', value: application.email || '—' },
    { label: 'Phone', value: application.phone || '—' },
    { label: 'Location', value: application.location || '—' },
  ];

  return (
    <div className="workspace-page">
      <RecordHeader
        backHref={APP_ROUTES.LENDER.APPLICATIONS}
        backLabel="Applications"
        overline={application.id}
        title="Application details"
        subtitle={`${application.business} · Submitted ${formatDate(application.submitted)} · ${formatTime(application.submitted)}`}
        status={<StatusBadge status={application.status} />}
        actions={
          isPending ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => decisionMutation.mutate(APPLICATION_STATUSES.IN_REVIEW)}
              isLoading={decisionMutation.isPending}
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Mark in review
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
                Requested amount
              </span>
              <strong className="mt-1.5 block text-2xl font-bold tracking-[-0.055em] tabular-nums text-foreground sm:text-3xl">
                {formatCurrency(application.amount, institution.currency)}
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
        </div>

        <aside className="order-1 lg:order-0 lg:row-span-2">
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

        <Card className="order-2 p-5 sm:p-6 lg:col-start-1 lg:row-start-2">
          <header className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Underwriting decision
            </h2>
            <StatusBadge status={application.status} />
          </header>

          {isPending ? (
            <div className="mt-4 flex items-start gap-3.5 rounded-xl border border-line bg-muted/30 p-4">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning-pale text-warning">
                <Clock className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <strong className="block text-xs font-bold text-foreground">
                  Awaiting underwriting review
                </strong>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Mark this application as in review from the header above to start underwriting and
                  record an approval or decline decision.
                </p>
              </div>
            </div>
          ) : isInReview ? (
            <>
              <Textarea
                className="mt-4"
                label="Review notes"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a decision note"
                rows={4}
              />
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <Button
                  variant="danger"
                  onClick={() => setPendingDecision(APPLICATION_STATUSES.DECLINED)}
                  disabled={decisionMutation.isPending}
                >
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  Decline
                </Button>
                <Button
                  variant="success"
                  onClick={() => setPendingDecision(APPLICATION_STATUSES.APPROVED)}
                  disabled={decisionMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  Approve
                </Button>
              </div>
            </>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3.5 rounded-xl border border-line bg-muted/30 p-4">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isApproved
                      ? 'bg-positive-pale text-positive'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {isApproved ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0">
                  <strong className="block text-xs font-bold text-foreground">
                    {isApproved ? 'Credit approved' : 'Application declined'}
                  </strong>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {application.note || 'This application has a recorded underwriting decision.'}
                  </p>
                </div>
              </div>

              {linkedLoan && (
                <Link
                  href={APP_ROUTE_BUILDERS.LENDER.LOAN(linkedLoan.id)}
                  className="group flex items-center gap-3.5 rounded-xl border border-brand/25 bg-brand-pale/50 p-4 transition-colors hover:bg-brand-pale"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                    <Wallet className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-xs font-bold text-foreground">
                      View funded loan
                    </strong>
                    <small className="block text-2xs text-muted-foreground">
                      {linkedLoan.id} · {formatCurrency(linkedLoan.principal, institution.currency)}
                    </small>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 text-brand transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              )}
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={pendingDecision !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDecision(null);
        }}
        title={
          pendingDecision === APPLICATION_STATUSES.APPROVED
            ? 'Approve credit application'
            : 'Decline credit application'
        }
        description={
          pendingDecision === APPLICATION_STATUSES.APPROVED
            ? `Approve request #${application.id} for ${application.business}? A ${formatCurrency(application.amount, institution.currency)} loan facility (${application.term} months) will be disbursed.`
            : `Decline request #${application.id} from ${application.business}? This underwriting decision will be recorded permanently.`
        }
        confirmLabel={
          pendingDecision === APPLICATION_STATUSES.APPROVED ? 'Confirm approval' : 'Confirm decline'
        }
        tone={pendingDecision === APPLICATION_STATUSES.APPROVED ? 'success' : 'danger'}
        isLoading={decisionMutation.isPending}
        onConfirm={() => {
          if (pendingDecision) {
            decisionMutation.mutate(pendingDecision, {
              onSuccess: () => setPendingDecision(null),
            });
          }
        }}
      />
    </div>
  );
}
