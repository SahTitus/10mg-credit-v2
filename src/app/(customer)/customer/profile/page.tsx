'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Building, Mail, Phone, Calendar, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/primitives/card';
import { Avatar } from '@/components/primitives/avatar';
import { Skeleton } from '@/components/primitives/skeleton';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { useCustomerScope } from '@/features/customers/hooks/use-customer-scope';
import { customerApiService } from '@/lib/api/customer-service';
import { getErrorMessage } from '@/lib/errors/error-handler';
import { formatDate } from '@/lib/utils/formatters';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export default function CustomerProfilePage() {
  const { institution: currentInstitution, customerId, session } = useCustomerScope();

  const {
    data: customer,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER_DETAIL(customerId, currentInstitution.id),
    queryFn: () => customerApiService.getById(customerId, { institutionId: currentInstitution.id }),
  });

  if (isPending) {
    return (
      <div className="workspace-page max-w-3xl">
        <Skeleton className="h-16 w-64 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="workspace-page max-w-3xl">
        <Card className="p-4 sm:p-6">
          <QueryErrorState
            title="Unable to load profile"
            description={getErrorMessage(error, 'Could not load your customer profile.')}
            onRetry={() => {
              void refetch();
            }}
            isRetrying={isRefetching}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="workspace-page max-w-3xl">
      <div className="workspace-heading">
        <div>
          <h1>Profile</h1>
          <p>
            <span className="sm:hidden">
              Your verified account with {currentInstitution.short}.
            </span>
            <span className="hidden sm:inline">
              Your verified customer account coordinates with {currentInstitution.name}.
            </span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar name={customer?.business || session?.name || 'Customer'} size="lg" />
            <div>
              <CardTitle>{customer?.business || 'Medical Clinic'}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {customer?.name || session?.name} · {customer?.email || session?.email}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border">
            <div className="flex items-center gap-2.5">
              <Building className="h-4 w-4 text-brand" />
              <div>
                <span className="text-3xs text-muted-foreground block">Facility</span>
                <span className="font-semibold text-foreground">{customer?.business}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <User className="h-4 w-4 text-brand" />
              <div>
                <span className="text-3xs text-muted-foreground block">Principal</span>
                <span className="font-semibold text-foreground">{customer?.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-brand" />
              <div>
                <span className="text-3xs text-muted-foreground block">Email</span>
                <span className="font-semibold text-foreground">{customer?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-brand" />
              <div>
                <span className="text-3xs text-muted-foreground block">Phone</span>
                <span className="font-semibold text-foreground">{customer?.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-brand" />
              <div>
                <span className="text-3xs text-muted-foreground block">Member Since</span>
                <span className="font-semibold text-foreground">
                  {formatDate(customer?.joined)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <div>
                <span className="text-3xs text-muted-foreground block">
                  Indicative Credit Score
                </span>
                <span className="font-bold font-mono text-emerald-600">{customer?.score}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
