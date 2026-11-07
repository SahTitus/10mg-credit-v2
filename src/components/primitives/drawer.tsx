'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  className?: string;
  contentClassName?: string;
  footerClassName?: string;
  titleAdornment?: React.ReactNode;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'max-w-md',
  className,
  contentClassName,
  footerClassName,
  titleAdornment,
}: DrawerProps) {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        {...(!description ? { 'aria-describedby': undefined } : {})}
        className={cn('w-screen justify-between gap-0 p-0', width, className)}
      >
        <SheetHeader className="flex min-h-19 flex-row items-center justify-between gap-3 space-y-0 border-b border-line px-6 py-4">
          <div>
            <SheetTitle className="text-lg font-bold tracking-[-0.035em] text-foreground">
              {title}
              {titleAdornment}
            </SheetTitle>
            {description && (
              <SheetDescription className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </SheetDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className={cn('flex-1 overflow-y-auto px-6 py-5', contentClassName)}>{children}</div>

        {footer && (
          <SheetFooter
            className={cn('mt-0 flex-row border-t border-line bg-card px-6 py-4', footerClassName)}
          >
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
