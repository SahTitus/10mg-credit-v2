'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent as UiDropdownMenuContent,
  DropdownMenuItem as UiDropdownMenuItem,
  DropdownMenuLabel as UiDropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem as UiDropdownMenuRadioItem,
  DropdownMenuSeparator as UiDropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuRadioGroup };

export const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof UiDropdownMenuContent>,
  React.ComponentPropsWithoutRef<typeof UiDropdownMenuContent>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <UiDropdownMenuContent
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'min-w-52 origin-top-right overflow-hidden rounded-lg border border-line bg-card p-1 shadow-[0_12px_30px_rgba(23,42,67,0.14)]',
      className,
    )}
    {...props}
  />
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuLabel = React.forwardRef<
  React.ComponentRef<typeof UiDropdownMenuLabel>,
  React.ComponentPropsWithoutRef<typeof UiDropdownMenuLabel>
>(({ className, ...props }, ref) => (
  <UiDropdownMenuLabel
    ref={ref}
    className={cn('px-2.5 py-1.5 text-xs font-semibold text-foreground', className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

export const DropdownMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof UiDropdownMenuSeparator>,
  React.ComponentPropsWithoutRef<typeof UiDropdownMenuSeparator>
>(({ className, ...props }, ref) => (
  <UiDropdownMenuSeparator ref={ref} className={cn('mx-0 my-1 bg-line', className)} {...props} />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof UiDropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof UiDropdownMenuItem>
>(({ className, ...props }, ref) => (
  <UiDropdownMenuItem
    ref={ref}
    className={cn(
      'min-h-8 cursor-pointer rounded-md px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors focus:bg-brand-pale focus:text-brand data-highlighted:bg-brand-pale data-highlighted:text-brand',
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof UiDropdownMenuRadioItem>,
  React.ComponentPropsWithoutRef<typeof UiDropdownMenuRadioItem>
>(({ className, ...props }, ref) => (
  <UiDropdownMenuRadioItem
    ref={ref}
    className={cn(
      'min-h-9 cursor-pointer rounded-lg py-2 pr-2.5 pl-8 text-xs font-medium text-foreground transition-colors focus:bg-brand-pale focus:text-brand data-highlighted:bg-brand-pale data-highlighted:text-brand',
      className,
    )}
    {...props}
  />
));
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';
