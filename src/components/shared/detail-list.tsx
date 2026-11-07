import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface DetailRow {
  readonly label: string;
  readonly value: React.ReactNode;
  readonly emphasis?: boolean;
}

export interface DetailListProps {
  rows: readonly DetailRow[];
  className?: string;
}

export function DetailList({ rows, className }: DetailListProps) {
  return (
    <dl className={cn('divide-y divide-line', className)}>
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-3 py-3 text-xs">
          <dt className="shrink-0 text-muted-foreground">{row.label}</dt>
          <dd
            className={cn(
              'min-w-0 wrap-break-word text-right font-semibold tabular-nums text-foreground',
              row.emphasis && 'text-sm',
            )}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
