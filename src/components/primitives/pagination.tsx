import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Pagination as UiPagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  startIndex,
  endIndex,
  onPageChange,
  itemLabel = 'records',
  className,
}: PaginationProps) {
  if (totalCount === 0) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 border-t border-line bg-[#fbfcfe] px-4 py-3 text-2xs text-muted-foreground sm:gap-3 sm:px-6 sm:py-3.5 sm:text-xs',
        className,
      )}
    >
      <span className="min-w-0 truncate tabular-nums">
        Showing <strong className="font-semibold text-foreground">{startIndex}</strong>–
        <strong className="font-semibold text-foreground">{endIndex}</strong> of{' '}
        <strong className="font-semibold text-foreground">{totalCount}</strong>
        <span className="hidden sm:inline"> {itemLabel}</span>
      </span>

      <UiPagination className="mx-0 w-auto shrink-0 justify-end">
        <PaginationContent className="gap-1 sm:gap-1.5">
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-7 px-2 text-xs sm:px-2.5"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
          </PaginationItem>

          {pages.map((page) => (
            <PaginationItem key={page}>
              <Button
                variant={page === currentPage ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className="h-7 min-w-7 px-2 text-xs tabular-nums"
              >
                {page}
              </Button>
            </PaginationItem>
          ))}

          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-7 px-2 text-xs sm:px-2.5"
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </UiPagination>
    </div>
  );
}
