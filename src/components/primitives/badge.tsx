import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Badge as UiBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] leading-4 font-semibold transition-colors select-none sm:px-2.5 sm:text-3xs',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-muted text-foreground',
        approved: 'border border-[#b2e5d5] bg-[#e8f7f1] text-[#16856d]',
        declined: 'border border-[#fcd5cd] bg-[#fff0ed] text-[#c95c55]',
        review: 'border border-[#ddd3f8] bg-[#f1edfb] text-[#7357b8]',
        pending: 'border border-[#fae2c0] bg-[#fff5e5] text-[#b87925]',
        closed: 'border border-border bg-muted/80 text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const dotColors: Record<string, string> = {
  approved: 'bg-[#16856d]',
  declined: 'bg-[#c95c55]',
  review: 'bg-[#7357b8]',
  pending: 'bg-[#b87925]',
  closed: 'bg-muted-foreground',
  default: 'bg-foreground',
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  withDot?: boolean;
}

export function Badge({
  className,
  variant = 'default',
  withDot = false,
  children,
  ...props
}: BadgeProps) {
  const currentVariant = variant || 'default';
  const dotColor = dotColors[currentVariant] || dotColors.default;

  return (
    <UiBadge variant="outline" className={cn(badgeVariants({ variant }), className)} {...props}>
      {withDot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} aria-hidden="true" />}
      {children}
    </UiBadge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const v = status.toLowerCase();
  let variant: 'approved' | 'declined' | 'review' | 'pending' | 'closed' = 'pending';

  if (v === 'approved' || v === 'active' || v === 'paid') {
    variant = 'approved';
  } else if (v === 'declined' || v === 'overdue') {
    variant = 'declined';
  } else if (v === 'in review') {
    variant = 'review';
  } else if (v === 'completed') {
    variant = 'closed';
  }

  return <Badge variant={variant}>{status}</Badge>;
}
