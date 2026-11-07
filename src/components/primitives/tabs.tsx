'use client';

import * as React from 'react';
import {
  Tabs as UiTabs,
  TabsContent as UiTabsContent,
  TabsList as UiTabsList,
  TabsTrigger as UiTabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export function Tabs({ className, ...props }: React.ComponentProps<typeof UiTabs>) {
  return <UiTabs className={cn('gap-0', className)} {...props} />;
}

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof UiTabsList>,
  React.ComponentPropsWithoutRef<typeof UiTabsList>
>(({ className, ...props }, ref) => (
  <UiTabsList
    ref={ref}
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof UiTabsTrigger>,
  React.ComponentPropsWithoutRef<typeof UiTabsTrigger>
>(({ className, ...props }, ref) => (
  <UiTabsTrigger
    ref={ref}
    className={cn(
      'cursor-pointer rounded-md px-3 py-1 text-xs font-medium ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof UiTabsContent>,
  React.ComponentPropsWithoutRef<typeof UiTabsContent>
>(({ className, ...props }, ref) => (
  <UiTabsContent
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';
