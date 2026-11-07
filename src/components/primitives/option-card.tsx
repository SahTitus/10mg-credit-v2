import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface OptionCardProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'title'
> {
  selected: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
}

export const OptionCard = React.forwardRef<HTMLButtonElement, OptionCardProps>(
  ({ selected, title, description, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      className={cn(
        'flex w-full cursor-pointer items-start gap-3 rounded-lg border bg-card p-4 text-left transition-[border-color,box-shadow,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        selected
          ? 'border-brand bg-brand-pale/50 shadow-[0_0_0_1px_var(--brand)]'
          : 'border-input hover:border-brand/50 hover:bg-muted/40',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          selected ? 'border-brand' : 'border-input',
        )}
      >
        <span
          className={cn(
            'h-2 w-2 rounded-full bg-brand transition-transform',
            selected ? 'scale-100' : 'scale-0',
          )}
        />
      </span>
      <span className="min-w-0">
        <strong className="block text-sm font-semibold text-foreground">{title}</strong>
        {description && (
          <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
        )}
      </span>
    </button>
  ),
);

OptionCard.displayName = 'OptionCard';
