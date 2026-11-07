'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/primitives/toast';
import { useCustomerScope } from '@/features/customers/hooks/use-customer-scope';
import { applicationApiService } from '@/lib/api/application-service';
import { customerApiService } from '@/lib/api/customer-service';
import {
  APPLICATION_DEFAULTS,
  APPLICATION_PURPOSES,
  APPLICATION_TERMS,
} from '@/lib/constants/application-statuses';
import { APP_ROUTE_BUILDERS } from '@/lib/constants/routes';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { formatCurrency } from '@/lib/utils/formatters';
import { invalidateAfterApplicationCreated } from '@/lib/utils/query-invalidation';

export type ApplicationStep = 1 | 2 | 3;

const FIRST_STEP: ApplicationStep = 1;
const LAST_STEP: ApplicationStep = 3;

export function useCustomerCreditApplication() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast, error: toastError } = useToast();
  const { institution, customerId, session } = useCustomerScope();
  const { data: customer } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER_DETAIL(customerId, institution.id),
    queryFn: () => customerApiService.getById(customerId, { institutionId: institution.id }),
  });

  const [step, setStep] = React.useState<ApplicationStep>(FIRST_STEP);
  const [amountInput, setAmountInput] = React.useState('');
  const [purpose, setPurpose] = React.useState<string>(APPLICATION_DEFAULTS.purpose);
  const [term, setTerm] = React.useState<number>(APPLICATION_DEFAULTS.term);
  const [notes, setNotes] = React.useState('');
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const amount = Number(amountInput) || 0;
  const isAmountInRange = amount >= institution.minLoan && amount <= institution.maxLoan;
  const amountError =
    amountInput !== '' && !isAmountInRange
      ? `Enter between ${formatCurrency(institution.minLoan, institution.currency)} and ${formatCurrency(institution.maxLoan, institution.currency)}`
      : undefined;

  const estimate = React.useMemo(() => {
    // Divide the annual percentage rate by 1200 to apply it over a term in months
    const interest = Math.round(amount * ((institution.interest * term) / 1200));
    const total = amount + interest;
    return { interest, total, monthly: Math.round(total / term) };
  }, [amount, institution.interest, term]);

  const canContinue = step === FIRST_STEP ? isAmountInRange : true;

  const resetForm = React.useCallback(() => {
    setAmountInput('');
    setPurpose(APPLICATION_DEFAULTS.purpose);
    setTerm(APPLICATION_DEFAULTS.term);
    setNotes('');
  }, []);

  const goBack = () => setStep((current) => Math.max(FIRST_STEP, current - 1) as ApplicationStep);
  const goNext = () => setStep((current) => Math.min(LAST_STEP, current + 1) as ApplicationStep);

  const submitMutation = useMutation({
    mutationFn: () =>
      applicationApiService.create({
        institutionId: institution.id,
        customerId,
        name: customer?.name || session?.name || '',
        business: customer?.business || session?.business || '',
        amount,
        purpose,
        term,
        notes,
      }),
    onSuccess: (application) => {
      // Keep the submit action disabled until the new record route replaces this form
      setIsRedirecting(true);
      resetForm();
      invalidateAfterApplicationCreated(queryClient, {
        institutionId: institution.id,
        applicationId: application.id,
        customerId,
      });
      toast('Application submitted', `${application.id} is awaiting lender review.`, 'success');
      router.push(APP_ROUTE_BUILDERS.CUSTOMER.APPLICATION(application.id));
    },
    onError: (error) => {
      setIsRedirecting(false);
      toastError('Submission failed', error instanceof Error ? error.message : 'Try again shortly');
    },
  });

  const isSubmitting = submitMutation.isPending || isRedirecting;

  return {
    institution,
    step,
    amount,
    amountInput,
    amountError,
    purpose,
    term,
    notes,
    estimate,
    canContinue,
    isLastStep: step === LAST_STEP,
    isFirstStep: step === FIRST_STEP,
    terms: APPLICATION_TERMS,
    purposes: APPLICATION_PURPOSES,
    setAmountInput,
    setPurpose,
    setTerm,
    setNotes,
    goBack,
    goNext,
    submit: () => {
      if (isSubmitting) return;
      submitMutation.mutate();
    },
    isSubmitting,
  };
}

export type CustomerCreditApplication = ReturnType<typeof useCustomerCreditApplication>;
