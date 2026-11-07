import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export interface RecordHeaderProps {
  backHref: string;
  backLabel: string;
  overline: string;
  title: string;
  subtitle?: string;
  status?: React.ReactNode;
  actions?: React.ReactNode;
}

export function RecordHeader({
  backHref,
  backLabel,
  overline,
  title,
  subtitle,
  status,
  actions,
}: RecordHeaderProps) {
  const topRightBadge = status ?? actions;
  const bottomRightAction = status ? actions : undefined;

  return (
    <header className="space-y-3.5 sm:space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={backHref}
            className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-brand focus-visible:text-brand focus-visible:outline-none"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            {backLabel}
          </Link>
          <span className="text-xs text-muted-foreground/45" aria-hidden="true">
            ·
          </span>
          <span className="truncate font-mono text-2xs font-bold uppercase tracking-[0.08em] text-brand">
            {overline}
          </span>
        </div>

        {topRightBadge && <div className="shrink-0">{topRightBadge}</div>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-[-0.055em] text-foreground sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {bottomRightAction && (
          <div className="flex w-full justify-end sm:w-auto sm:shrink-0">{bottomRightAction}</div>
        )}
      </div>
    </header>
  );
}
