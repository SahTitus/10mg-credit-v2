'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Table = React.forwardRef<
  HTMLTableElement,
  React.ComponentProps<'table'> & {
    containerClassName?: string;
    unstyled?: boolean;
  }
>(({ className, containerClassName, unstyled = false, ...props }, ref) => (
  <div
    data-slot="table-container"
    className={cn(!unstyled && 'relative w-full overflow-x-auto', containerClassName)}
  >
    <table
      ref={ref}
      data-slot="table"
      className={cn(!unstyled && 'w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentProps<'thead'> & { unstyled?: boolean }
>(({ className, unstyled = false, ...props }, ref) => (
  <thead
    ref={ref}
    data-slot="table-header"
    className={cn(!unstyled && '[&_tr]:border-b', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentProps<'tbody'> & { unstyled?: boolean }
>(({ className, unstyled = false, ...props }, ref) => (
  <tbody
    ref={ref}
    data-slot="table-body"
    className={cn(!unstyled && '[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<'tfoot'>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      data-slot="table-footer"
      className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  ),
);
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.ComponentProps<'tr'> & { unstyled?: boolean }
>(({ className, unstyled = false, ...props }, ref) => (
  <tr
    ref={ref}
    data-slot="table-row"
    className={cn(
      !unstyled &&
        'border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted',
      className,
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ComponentProps<'th'> & { unstyled?: boolean }
>(({ className, unstyled = false, ...props }, ref) => (
  <th
    ref={ref}
    data-slot="table-head"
    className={cn(
      !unstyled &&
        'h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground has-[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-0.5',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.ComponentProps<'td'> & { unstyled?: boolean }
>(({ className, unstyled = false, ...props }, ref) => (
  <td
    ref={ref}
    data-slot="table-cell"
    className={cn(
      !unstyled &&
        'p-2 align-middle whitespace-nowrap has-[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-0.5',
      className,
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
