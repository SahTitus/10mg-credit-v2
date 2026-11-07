'use client';

import * as React from 'react';
import {
  Select,
  SelectContent as UiSelectContent,
  SelectGroup,
  SelectItem as UiSelectItem,
  SelectTrigger as UiSelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export { Select, SelectGroup, SelectValue };

export const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof UiSelectTrigger>,
  React.ComponentPropsWithoutRef<typeof UiSelectTrigger>
>(({ className, children, ...props }, ref) => (
  <UiSelectTrigger
    ref={ref}
    className={cn(
      'h-10 w-full rounded-lg border-[#d5dee8] bg-card px-3.5 py-2 text-[13px] font-medium text-foreground shadow-2xs ring-offset-background transition-all hover:border-[#b8c6d6] focus:border-brand focus:ring-3 focus:ring-brand/15 focus:outline-none',
      className,
    )}
    {...props}
  >
    <span className="truncate">{children}</span>
  </UiSelectTrigger>
));
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = React.forwardRef<
  React.ComponentRef<typeof UiSelectContent>,
  React.ComponentPropsWithoutRef<typeof UiSelectContent>
>(({ className, position = 'popper', sideOffset = 6, ...props }, ref) => (
  <UiSelectContent
    ref={ref}
    sideOffset={sideOffset}
    position={position}
    viewportClassName="h-auto p-1.5"
    className={cn(
      'max-h-80 w-max min-w-56 max-w-[min(24rem,calc(100vw-2rem))] rounded-xl border-[#dde5ee] shadow-[0_16px_42px_rgba(15,27,42,0.13)]',
      className,
    )}
    {...props}
  />
));
SelectContent.displayName = 'SelectContent';

export const SelectItem = React.forwardRef<
  React.ComponentRef<typeof UiSelectItem>,
  React.ComponentPropsWithoutRef<typeof UiSelectItem>
>(({ className, ...props }, ref) => (
  <UiSelectItem
    ref={ref}
    className={cn(
      'cursor-pointer justify-between gap-4 rounded-lg py-2 pr-9 pl-3 text-[13px] font-medium text-foreground transition-colors focus:bg-[#f2f6fa] focus:text-foreground data-[state=checked]:bg-brand-pale/60 data-[state=checked]:font-semibold data-[state=checked]:text-brand',
      className,
    )}
    {...props}
  />
));
SelectItem.displayName = 'SelectItem';
