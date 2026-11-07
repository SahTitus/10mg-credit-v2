'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ViewAllLinkProps {
  href: string;
  label?: string;
  className?: string;
}

export function ViewAllLink({ href, label = 'View all', className }: ViewAllLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:text-brand/80 focus-visible:outline-none focus-visible:underline',
        className,
      )}
    >
      <span>{label}</span>
      <ArrowUpRight
        className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}
