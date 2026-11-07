import * as React from 'react';
import { Skeleton } from '@/components/primitives/skeleton';
import { cn } from '@/lib/utils/cn';

export interface KpiCardProps {
  label: string;
  value: string | number;
  note?: string;
  icon?: React.ReactNode;
  tone?: 'blue' | 'green' | 'orange' | 'violet';
  sparklineIndex?: number;
  isLoading?: boolean;
}

export function KpiCard({
  label,
  value,
  note = 'Current portfolio',
  icon,
  tone = 'blue',
  isLoading = false,
}: KpiCardProps) {
  return (
    <article className="card metric">
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        {icon && (
          <span className={cn('metric-icon', tone !== 'blue' && tone)} aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      {isLoading ? (
        <>
          <Skeleton className="mt-3.75 mb-1.75 h-7 w-28 rounded-md" />
          <div className="metric-foot">
            <Skeleton className="h-3.5 w-32 rounded-sm" />
          </div>
        </>
      ) : (
        <>
          <div className="metric-value num">{value}</div>
          <div className="metric-foot">
            <span>{note}</span>
          </div>
        </>
      )}
    </article>
  );
}
