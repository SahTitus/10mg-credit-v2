import Link from 'next/link';
import type * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ResponsiveDataListProps {
  table: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveDataList({ table, children, className }: ResponsiveDataListProps) {
  return (
    <>
      <div className="hidden md:block">{table}</div>
      <div className={cn('divide-y divide-line md:hidden', className)}>{children}</div>
    </>
  );
}

export interface MobileDataCardProps {
  href: string;
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  value?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function MobileDataCard({
  href,
  leading,
  title,
  subtitle,
  value,
  trailing,
}: MobileDataCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-muted/35 focus-visible:bg-muted/35 focus-visible:outline-none sm:px-5"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {leading && <span className="shrink-0">{leading}</span>}
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-xs font-bold text-foreground group-hover:text-brand">
            {title}
          </strong>
          {subtitle && (
            <small className="mt-0.5 block truncate text-2xs text-muted-foreground">
              {subtitle}
            </small>
          )}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1 text-right">
        {value && (
          <strong className="font-mono text-xs font-bold tabular-nums text-foreground">
            {value}
          </strong>
        )}
        {trailing}
      </div>
    </Link>
  );
}
