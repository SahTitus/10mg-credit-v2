'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/primitives/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Next.js Global Route Error:', error);
    }
  }, [error]);

  // Show the error text in development, but keep production messages generic
  const message =
    process.env.NODE_ENV === 'development' && error.message
      ? error.message
      : 'An unexpected error occurred while loading this page.';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full rounded-xl border bg-card p-6 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-base font-semibold text-foreground mb-1">Application Error</h2>
        <p className="text-xs text-muted-foreground mb-5">{message}</p>
        <Button onClick={() => reset()} variant="default" size="sm" className="mx-auto">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
