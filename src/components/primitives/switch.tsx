'use client';

import * as React from 'react';
import { Switch as UiSwitch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export const Switch = React.forwardRef<
  React.ComponentRef<typeof UiSwitch>,
  React.ComponentPropsWithoutRef<typeof UiSwitch>
>(({ className, ...props }, ref) => (
  <span className="relative inline-flex shrink-0 items-center">
    <UiSwitch
      ref={ref}
      thumbClassName="h-4 w-4 shadow-sm data-[state=checked]:translate-x-4"
      className={cn(
        'h-5 w-9 cursor-pointer border-2 border-transparent bg-muted shadow-inner transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none data-[state=checked]:bg-brand data-[state=unchecked]:bg-muted',
        className,
      )}
      {...props}
    />
  </span>
));

Switch.displayName = 'Switch';
