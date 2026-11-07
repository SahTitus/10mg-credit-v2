'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, Eye, MoreHorizontal, User, XCircle } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { ConfirmDialog } from '@/components/primitives/confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu';
import { useToast } from '@/components/primitives/toast';
import { applicationApiService } from '@/lib/api/application-service';
import { APPLICATION_STATUSES } from '@/lib/constants/application-statuses';
import { APP_ROUTE_BUILDERS } from '@/lib/constants/routes';
import { invalidateAfterApplicationDecision } from '@/lib/utils/query-invalidation';
import type { ApplicationStatus, LoanApplication } from '@/types/application';

export interface LenderApplicationActionsMenuProps {
  application: LoanApplication;
}

export function LenderApplicationActionsMenu({ application }: LenderApplicationActionsMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast, error: toastError } = useToast();
  const [pendingDecision, setPendingDecision] = React.useState<
    typeof APPLICATION_STATUSES.APPROVED | typeof APPLICATION_STATUSES.DECLINED | null
  >(null);

  const statusMutation = useMutation({
    mutationFn: (status: ApplicationStatus) =>
      applicationApiService.updateStatus(application.id, status),
    onSuccess: (updated) => {
      setPendingDecision(null);
      invalidateAfterApplicationDecision(queryClient, {
        institutionId: application.institutionId,
        applicationId: application.id,
        customerId: updated.customerId,
      });
      toast('Application updated', `${updated.id} marked as ${updated.status}`, 'success');
    },
    onError: (err) => {
      toastError('Update failed', err instanceof Error ? err.message : 'Could not update status');
    },
  });

  const isPending = application.status === APPLICATION_STATUSES.PENDING;
  const isInReview = application.status === APPLICATION_STATUSES.IN_REVIEW;
  const isApproving = pendingDecision === APPLICATION_STATUSES.APPROVED;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={(event) => event.stopPropagation()}
            className="h-8 w-8 rounded-lg border-border bg-card text-muted-foreground shadow-2xs hover:border-brand/40 hover:bg-muted/50 hover:text-foreground"
            aria-label={`Actions for ${application.id}`}
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-44"
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenuItem
            onSelect={() => router.push(APP_ROUTE_BUILDERS.LENDER.APPLICATION(application.id))}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isPending || isInReview ? 'Review application' : 'View details'}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => router.push(APP_ROUTE_BUILDERS.LENDER.CUSTOMER(application.customerId))}
          >
            <User className="h-3.5 w-3.5" aria-hidden="true" />
            <span>View applicant</span>
          </DropdownMenuItem>

          {(isPending || isInReview) && (
            <>
              <DropdownMenuSeparator />
              {isPending && (
                <DropdownMenuItem
                  disabled={statusMutation.isPending}
                  onSelect={() => statusMutation.mutate(APPLICATION_STATUSES.IN_REVIEW)}
                >
                  <Clock className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                  <span>Mark in review</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                disabled={statusMutation.isPending}
                onSelect={() => setPendingDecision(APPLICATION_STATUSES.APPROVED)}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-positive" aria-hidden="true" />
                <span>Approve</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={statusMutation.isPending}
                onSelect={() => setPendingDecision(APPLICATION_STATUSES.DECLINED)}
                className="text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
              >
                <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Decline</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={pendingDecision !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDecision(null);
        }}
        title={isApproving ? 'Approve credit application' : 'Decline credit application'}
        description={
          isApproving
            ? `Approve request #${application.id} for ${application.business}? This will create an active loan facility for ${application.term} months.`
            : `Decline request #${application.id} from ${application.business}? This underwriting decision will be recorded.`
        }
        confirmLabel={isApproving ? 'Confirm approval' : 'Confirm decline'}
        tone={isApproving ? 'success' : 'danger'}
        isLoading={statusMutation.isPending}
        onConfirm={() => {
          if (pendingDecision) {
            statusMutation.mutate(pendingDecision);
          }
        }}
      />
    </>
  );
}
