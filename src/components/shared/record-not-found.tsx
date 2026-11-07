import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/primitives/card';

export interface RecordNotFoundProps {
  backHref: string;
  backLabel: string;
  title?: string;
  description?: string;
}

export function RecordNotFound({
  backHref,
  backLabel,
  title = 'Record unavailable',
  description = 'This record is not available within your current institution.',
}: RecordNotFoundProps) {
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

      <Card className="px-6 py-12 text-center">
        <h1 className="text-base font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mx-auto mt-1.5 max-w-md text-xs text-muted-foreground">{description}</p>
      </Card>
    </div>
  );
}
