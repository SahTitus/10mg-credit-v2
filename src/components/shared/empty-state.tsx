import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-55 flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border/80 bg-muted/10',
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
        {icon || <Search className="h-5 w-5" />}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
