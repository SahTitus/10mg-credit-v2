import * as React from 'react';
import { Skeleton as UiSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <UiSkeleton className={cn('bg-muted/60', className)} aria-hidden="true" {...props} />;
}
