import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface StepperItem {
  readonly value: number;
  readonly label: string;
}

export interface StepperProps {
  steps: readonly StepperItem[];
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol
      aria-label="Progress"
      className={cn(
        'grid w-full grid-cols-3 items-start rounded-xl border border-line bg-card px-3 py-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)] sm:flex sm:items-center sm:justify-between sm:px-6 sm:py-4',
        className,
      )}
    >
      {steps.map((step, index) => {
        const isDone = current > step.value;
        const isActive = current === step.value;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.value}>
            <li
              aria-current={isActive ? 'step' : undefined}
              className="relative flex min-w-0 flex-col items-center gap-1.5 text-center sm:flex-row sm:gap-2.5 sm:text-left"
            >
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-3.5 right-[calc(-50%+20px)] left-[calc(50%+20px)] h-0.5 rounded-full transition-colors sm:hidden',
                    isDone ? 'bg-positive' : 'bg-line',
                  )}
                />
              )}

              <span
                className={cn(
                  'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-2xs font-bold transition-all',
                  isActive && 'bg-brand text-white ring-4 ring-brand-pale',
                  isDone && 'bg-positive text-white',
                  !isActive && !isDone && 'border border-border bg-muted text-muted-foreground',
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : step.value}
              </span>

              <strong
                className={cn(
                  'min-w-0 truncate text-3xs leading-tight font-bold sm:text-xs',
                  isActive && 'text-foreground',
                  isDone && 'text-foreground',
                  !isActive && !isDone && 'text-muted-foreground',
                )}
              >
                {step.label}
              </strong>
            </li>

            {!isLast && (
              <li
                aria-hidden="true"
                className={cn(
                  'hidden h-0.5 flex-1 rounded-full transition-colors sm:mx-4 sm:block',
                  isDone ? 'bg-positive' : 'bg-line',
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );
}
