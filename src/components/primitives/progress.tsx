import { Progress as UiProgress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { clamp } from '@/lib/utils/formatters';

export interface ProgressProps {
  value: number;
  label?: string;
  className?: string;
}

export function Progress({ value, label, className }: ProgressProps) {
  const percentage = clamp(Math.round(value), 0, 100);

  return (
    <UiProgress
      value={percentage}
      aria-label={label}
      className={cn('h-1.5 bg-muted', className)}
      indicatorClassName="rounded-full bg-brand duration-500 ease-out"
    />
  );
}
