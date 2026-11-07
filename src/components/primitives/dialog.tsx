'use client';

import * as React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent as UiDialogContent,
  DialogDescription as UiDialogDescription,
  DialogFooter as UiDialogFooter,
  DialogHeader as UiDialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle as UiDialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export { Dialog, DialogTrigger, DialogPortal, DialogClose, DialogOverlay };

export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof UiDialogContent>,
  React.ComponentPropsWithoutRef<typeof UiDialogContent>
>(({ className, ...props }, ref) => (
  <UiDialogContent
    ref={ref}
    className={cn(
      'flex max-h-[calc(100dvh-4rem)] w-[calc(100%-2rem)] max-w-lg flex-col gap-0 overflow-hidden p-0',
      className,
    )}
    {...props}
  />
));
DialogContent.displayName = 'DialogContent';

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <UiDialogHeader
    className={cn(
      'flex shrink-0 flex-col gap-0 space-y-1.5 border-b border-line px-6 pt-6 pr-12 pb-4 text-left',
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

export const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="dialog-body"
    className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-5', className)}
    {...props}
  />
);
DialogBody.displayName = 'DialogBody';

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <UiDialogFooter
    className={cn(
      'flex shrink-0 flex-col-reverse gap-2 border-t border-line px-6 py-4 sm:flex-row sm:justify-end',
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

export const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof UiDialogTitle>,
  React.ComponentPropsWithoutRef<typeof UiDialogTitle>
>(({ className, ...props }, ref) => (
  <UiDialogTitle
    ref={ref}
    className={cn('text-lg leading-none font-semibold tracking-tight text-foreground', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof UiDialogDescription>,
  React.ComponentPropsWithoutRef<typeof UiDialogDescription>
>(({ className, ...props }, ref) => (
  <UiDialogDescription
    ref={ref}
    className={cn('text-xs text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';
