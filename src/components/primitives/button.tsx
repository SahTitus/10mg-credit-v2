import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Button as UiButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border border-border bg-background text-foreground shadow-xs hover:bg-muted/80',
        primary: 'bg-brand font-semibold text-white shadow-xs hover:bg-brand-deep',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        subtle: 'bg-brand-pale text-brand hover:bg-brand-pale/80',
        success: 'bg-positive font-semibold text-white shadow-xs hover:bg-[#126e5a]',
        danger:
          'border border-[#e5b8b5] bg-[#fff5f5] font-semibold text-[#b43c35] shadow-xs hover:bg-[#feeae9]',
        outline:
          'border border-input bg-background shadow-none hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'h-auto p-0 text-brand underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-6 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const UI_VARIANT_MAP: Record<
  NonNullable<VariantProps<typeof buttonVariants>['variant']>,
  React.ComponentProps<typeof UiButton>['variant']
> = {
  default: 'outline',
  primary: 'default',
  secondary: 'secondary',
  subtle: 'ghost',
  success: 'default',
  danger: 'outline',
  outline: 'outline',
  ghost: 'ghost',
  link: 'link',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      isLoading,
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const resolvedVariant = variant ?? 'default';
    const resolvedSize = size ?? 'default';

    return (
      <UiButton
        ref={ref}
        asChild={asChild}
        variant={UI_VARIANT_MAP[resolvedVariant]}
        size={resolvedSize}
        className={cn(buttonVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {isLoading && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
            )}
            {children}
          </>
        )}
      </UiButton>
    );
  },
);

Button.displayName = 'Button';
