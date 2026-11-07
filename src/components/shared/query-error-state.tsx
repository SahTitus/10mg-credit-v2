import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { cn } from '@/lib/utils/cn';

export interface QueryErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function QueryErrorState({
  title = 'Unable to load data',
  description = 'A temporary error prevented loading these records.',
  onRetry,
  isRetrying = false,
  backHref,
  backLabel,
  className,
}: QueryErrorStateProps) {
  const content = (
    <div
      role="alert"
      className={cn(
        'flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-destructive/25 bg-destructive/5 p-8 text-center',
        className,
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          isLoading={isRetrying}
          className="mt-4 h-8 gap-1.5 px-3 text-xs font-semibold"
        >
          {!isRetrying && <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
          <span>Retry</span>
        </Button>
      )}
    </div>
  );

  if (backHref && backLabel) {
    return (
      <div className="workspace-page">
        <div>
          <Link
            href={backHref}
            className="group inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-brand focus-visible:text-brand focus-visible:outline-none"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            {backLabel}
          </Link>
        </div>
        <Card className="p-4 sm:p-6">{content}</Card>
      </div>
    );
  }

  return content;
}
