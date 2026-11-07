'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, Download, Layers, Percent, Plus, Search } from 'lucide-react';
import { Avatar } from '@/components/primitives/avatar';
import { StatusBadge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { Card, CardContent } from '@/components/primitives/card';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/primitives/dialog';
import { Input } from '@/components/primitives/input';
import { Pagination } from '@/components/primitives/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/primitives/select';
import { Skeleton } from '@/components/primitives/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/primitives/table';
import { EmptyState } from '@/components/shared/empty-state';
import { KpiCard } from '@/components/shared/kpi-card';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { MobileDataCard, ResponsiveDataList } from '@/components/shared/responsive-data-list';
import { LenderApplicationActionsMenu } from '@/features/applications/components/lender-application-actions-menu';
import { useLenderApplications } from '@/features/applications/hooks/use-lender-applications';
import {
  APPLICATION_PURPOSES,
  APPLICATION_STATUS_FILTERS,
  APPLICATION_TERMS,
  type ApplicationStatusFilter,
} from '@/lib/constants/application-statuses';
import { APP_ROUTE_BUILDERS } from '@/lib/constants/routes';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/formatters';

function ApplicationsPageContent() {
  const router = useRouter();
  const {
    activeTab,
    applications,
    pagination,
    approvalRate,
    approvedCount,
    approvedValue,
    declinedCount,
    totalCount,
    createMutation,
    currentInstitution,
    draft,
    draftAmountError,
    canSubmitDraft,
    exportApplications,
    isLoading,
    isTableLoading,
    isPlaceholderData,
    isError,
    errorMessage,
    retry,
    isRetrying,
    isNewModalOpen,
    pendingTotal,
    pendingValue,
    search,
    setActiveTab,
    setDraft,
    setIsNewModalOpen,
    setSearch,
  } = useLenderApplications();

  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div>
          <h1>Loan applications</h1>
          <p>
            <span className="sm:hidden">Review requests and manage your pipeline.</span>
            <span className="hidden sm:inline">
              Review requests, track decisions, and manage your lending pipeline.
            </span>
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <Button variant="outline" onClick={exportApplications}>
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button variant="primary" onClick={() => setIsNewModalOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>New application</span>
          </Button>
        </div>
      </div>

      <div className="workspace-kpi-grid">
        <KpiCard
          label="Applications received"
          value={totalCount}
          note="All pipeline requests"
          icon={<Layers className="h-4 w-4" />}
          tone="blue"
          sparklineIndex={0}
          isLoading={isLoading}
        />
        <KpiCard
          label="Awaiting decision"
          value={pendingTotal}
          note={`${formatCurrency(pendingValue, currentInstitution.currency, true)} requested`}
          icon={<Clock className="h-4 w-4" />}
          tone="orange"
          sparklineIndex={1}
          isLoading={isLoading}
        />
        <KpiCard
          label="Approved value"
          value={formatCurrency(approvedValue, currentInstitution.currency, true)}
          note={`${approvedCount} approved requests`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="green"
          sparklineIndex={2}
          isLoading={isLoading}
        />
        <KpiCard
          label="Approval rate"
          value={`${approvalRate}%`}
          note={`${declinedCount} declined`}
          icon={<Percent className="h-4 w-4" />}
          tone="violet"
          sparklineIndex={3}
          isLoading={isLoading}
        />
      </div>

      <Card className="workspace-table-card">
        <div className="workspace-table-header">
          <div className="w-full sm:w-56">
            <Select
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as ApplicationStatusFilter)}
            >
              <SelectTrigger
                aria-label="Filter applications by status"
                className="h-9 text-xs font-semibold"
              >
                <SelectValue placeholder="Filter applications" />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUS_FILTERS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'All' ? 'All applications' : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-64">
            <Input
              type="search"
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefixIcon={<Search className="h-3.5 w-3.5" />}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <CardContent className={isPlaceholderData ? 'p-0 opacity-65 transition-opacity' : 'p-0'}>
          {isTableLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <QueryErrorState
              className="m-6"
              title="Unable to load applications"
              description={errorMessage}
              onRetry={retry}
              isRetrying={isRetrying}
            />
          ) : applications.length === 0 ? (
            <EmptyState
              title="No applications found"
              description="Try adjusting your status filter or search keyword."
              className="m-6"
            />
          ) : (
            <>
              <ResponsiveDataList
                table={
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagination.items.map((app) => (
                        <TableRow
                          key={app.id}
                          onClick={() => router.push(APP_ROUTE_BUILDERS.LENDER.APPLICATION(app.id))}
                          className="cursor-pointer transition-colors hover:bg-muted/30"
                        >
                          <TableCell className="font-mono font-semibold text-foreground">
                            {app.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar name={app.business} size="sm" />
                              <div>
                                <span className="block font-semibold text-foreground">
                                  {app.business}
                                </span>
                                <span className="block text-2xs text-muted-foreground">
                                  {app.name}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono font-semibold text-foreground">
                            {formatCurrency(app.amount, currentInstitution.currency)}
                          </TableCell>
                          <TableCell>
                            <span className="block font-semibold text-foreground">
                              {formatDate(app.submitted)}
                            </span>
                            <span className="block text-2xs text-muted-foreground">
                              {formatTime(app.submitted)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={app.status} />
                          </TableCell>
                          <TableCell
                            className="text-right"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <LenderApplicationActionsMenu application={app} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                }
              >
                {pagination.items.map((app) => (
                  <MobileDataCard
                    key={app.id}
                    href={APP_ROUTE_BUILDERS.LENDER.APPLICATION(app.id)}
                    leading={<Avatar name={app.business} size="sm" />}
                    title={app.business}
                    subtitle={`${app.id} · ${formatDate(app.submitted)} · ${formatTime(app.submitted)}`}
                    value={formatCurrency(app.amount, currentInstitution.currency)}
                    trailing={<StatusBadge status={app.status} />}
                  />
                ))}
              </ResponsiveDataList>

              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                startIndex={pagination.startIndex}
                endIndex={pagination.endIndex}
                onPageChange={pagination.setPage}
                itemLabel="applications"
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create loan application</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3 text-xs">
            <Input
              label="Business name"
              placeholder="e.g. Healthline Pharmacy"
              value={draft.businessName}
              onChange={(event) => setDraft({ ...draft, businessName: event.target.value })}
            />
            <Input
              label="Applicant name"
              placeholder="e.g. Dr. John Doe"
              value={draft.applicantName}
              onChange={(event) => setDraft({ ...draft, applicantName: event.target.value })}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Email"
                type="email"
                placeholder="name@practice.com"
                value={draft.email}
                onChange={(event) => setDraft({ ...draft, email: event.target.value })}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+233 24 000 0000"
                value={draft.phone}
                onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
              />
            </div>
            <Input
              label="Location"
              placeholder="e.g. East Legon, Accra"
              value={draft.location}
              onChange={(event) => setDraft({ ...draft, location: event.target.value })}
            />
            <Input
              label="Loan amount"
              type="number"
              inputMode="numeric"
              placeholder={`${currentInstitution.minLoan.toLocaleString()} - ${currentInstitution.maxLoan.toLocaleString()}`}
              min={currentInstitution.minLoan}
              max={currentInstitution.maxLoan}
              value={draft.amount}
              error={draftAmountError}
              onChange={(event) => setDraft({ ...draft, amount: event.target.value })}
            />
            <div className="space-y-1">
              <label
                htmlFor="modal-purpose"
                className="block text-xs font-semibold text-foreground/90"
              >
                Purpose
              </label>
              <Select
                value={draft.purpose}
                onValueChange={(purpose) => setDraft({ ...draft, purpose })}
              >
                <SelectTrigger id="modal-purpose" className="h-9 text-xs">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_PURPOSES.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>
                      {purpose}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="modal-term"
                className="block text-xs font-semibold text-foreground/90"
              >
                Term (months)
              </label>
              <Select
                value={String(draft.term)}
                onValueChange={(term) => setDraft({ ...draft, term: Number(term) })}
              >
                <SelectTrigger id="modal-term" className="h-9 text-xs">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_TERMS.map((term) => (
                    <SelectItem key={term} value={String(term)}>
                      {term} Months
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="primary"
              onClick={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
              disabled={!canSubmitDraft}
            >
              Submit application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <React.Suspense fallback={null}>
      <ApplicationsPageContent />
    </React.Suspense>
  );
}
