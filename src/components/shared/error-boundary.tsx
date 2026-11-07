'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/primitives/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unhandled UI exception:', error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
    // Reload to clear state outside this boundary that may have caused the crash
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-xl border bg-card p-6 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-base font-semibold text-foreground mb-1">Something went wrong</h2>
            <p className="text-xs text-muted-foreground mb-5">
              An unexpected error occurred while rendering this interface.
            </p>
            <Button onClick={this.handleReset} variant="default" size="sm" className="mx-auto">
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
