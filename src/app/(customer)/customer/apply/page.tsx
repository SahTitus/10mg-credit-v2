'use client';

import * as React from 'react';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { Stepper } from '@/components/shared/stepper';
import { CreditDetailsStep } from '@/features/applications/components/credit-details-step';
import { CreditEstimateCard } from '@/features/applications/components/credit-estimate-card';
import { CreditPlanStep } from '@/features/applications/components/credit-plan-step';
import { CreditReviewStep } from '@/features/applications/components/credit-review-step';
import { useCustomerCreditApplication } from '@/features/applications/hooks/use-customer-credit-application';
import { CREDIT_STEPS } from '@/lib/constants/credit-application';
import { cn } from '@/lib/utils/cn';

export default function ApplyForCreditPage() {
  const form = useCustomerCreditApplication();
  const activeStep = CREDIT_STEPS[form.step - 1];
  const pageStartRef = React.useRef<HTMLDivElement>(null);

  // Start each step at the heading after a customer scrolls through the previous one
  React.useEffect(() => {
    pageStartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [form.step]);

  const renderStepActions = (className?: string) => (
    <footer className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      {form.isFirstStep ? (
        <span className="text-xs font-medium text-muted-foreground">
          Step 1 of {CREDIT_STEPS.length}
        </span>
      ) : (
        <Button variant="outline" onClick={form.goBack} disabled={form.isSubmitting}>
          Back
        </Button>
      )}

      {form.isLastStep ? (
        <Button
          variant="primary"
          onClick={form.submit}
          isLoading={form.isSubmitting}
          disabled={form.isSubmitting}
        >
          <span>{form.isSubmitting ? 'Submitting application...' : 'Submit application'}</span>
        </Button>
      ) : (
        <Button variant="primary" onClick={form.goNext} disabled={!form.canContinue}>
          Continue
        </Button>
      )}
    </footer>
  );

  return (
    <div ref={pageStartRef} className="workspace-page max-w-5xl">
      <div className="workspace-heading">
        <div>
          <h1>Apply for credit</h1>
          <p>
            <span className="sm:hidden">Fast financing for your business.</span>
            <span className="hidden sm:inline">
              A simpler path to the capital your business needs.
            </span>
          </p>
        </div>
      </div>

      <Stepper steps={CREDIT_STEPS} current={form.step} />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 p-5 sm:p-7">
          <header className="mb-6 flex items-start justify-between gap-4 border-b border-line pb-4">
            <div>
              <h2 className="text-lg font-bold tracking-[-0.04em] text-foreground sm:text-xl">
                {activeStep.title}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">{activeStep.description}</p>
            </div>
          </header>

          {form.step === 1 && <CreditDetailsStep form={form} />}
          {form.step === 2 && <CreditPlanStep form={form} />}
          {form.step === 3 && <CreditReviewStep form={form} />}

          {renderStepActions('mt-7 hidden border-t border-line pt-5 lg:flex')}
        </Card>

        <CreditEstimateCard form={form} />

        <Card className="p-4 lg:hidden">{renderStepActions()}</Card>
      </div>
    </div>
  );
}
