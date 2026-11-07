import * as React from 'react';
import {
  Table as UiTable,
  TableBody as UiTableBody,
  TableCaption,
  TableCell as UiTableCell,
  TableFooter,
  TableHead as UiTableHead,
  TableHeader as UiTableHeader,
  TableRow as UiTableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export { TableCaption, TableFooter };

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  variant?: 'workspace' | 'data';
  containerClassName?: string;
}

// Let the workspace and data-table CSS classes control spacing and borders without utility conflicts
export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = 'workspace', containerClassName, ...props }, ref) => (
    <UiTable
      ref={ref}
      unstyled
      containerClassName={cn(
        variant === 'data' ? 'table-scroll' : 'overflow-x-auto',
        containerClassName,
      )}
      className={cn(variant === 'data' ? 'data-table' : 'workspace-table', className)}
      {...props}
    />
  ),
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <UiTableHeader
    ref={ref}
    unstyled
    className={cn('workspace-table-header-group', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <UiTableBody
    ref={ref}
    unstyled
    className={cn('workspace-table-body-group', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <UiTableRow ref={ref} unstyled className={cn('workspace-table-row', className)} {...props} />
));
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <UiTableHead
    ref={ref}
    unstyled
    className={cn('workspace-table-head-cell', className)}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <UiTableCell ref={ref} unstyled className={cn('workspace-table-cell', className)} {...props} />
));
TableCell.displayName = 'TableCell';
