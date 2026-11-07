import * as React from 'react';
import { Input as UiInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixAction?: React.ReactNode;
}

const sanitizeNumeric = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      helperText,
      prefixIcon,
      suffixAction,
      id,
      onChange,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    // Use a text input with a decimal keypad for number fields to avoid scroll-wheel value changes
    const isNumeric = type === 'number';
    const hasMessage = Boolean(error || helperText);
    const messageId = `${inputId}-message`;
    const resolvedDescribedBy =
      [ariaDescribedBy, hasMessage ? messageId : undefined].filter(Boolean).join(' ') || undefined;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isNumeric) {
        event.target.value = sanitizeNumeric(event.target.value);
      }
      onChange?.(event);
    };

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <Label htmlFor={inputId} className="block text-xs font-semibold text-foreground/90">
            {label}
          </Label>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <span
              className="pointer-events-none absolute left-3 flex items-center justify-center text-muted-foreground"
              aria-hidden="true"
            >
              {prefixIcon}
            </span>
          )}
          <UiInput
            id={inputId}
            type={isNumeric ? 'text' : type}
            inputMode={isNumeric ? 'decimal' : props.inputMode}
            autoComplete={isNumeric ? 'off' : props.autoComplete}
            ref={ref}
            aria-invalid={Boolean(error) || ariaInvalid}
            aria-describedby={resolvedDescribedBy}
            onChange={handleChange}
            className={cn(
              'flex h-10 w-full rounded-lg border border-[#d5dee8] bg-card px-3.5 py-2 text-[13.5px] font-medium text-foreground shadow-2xs ring-offset-background transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/75 hover:border-[#b8c6d6] focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              prefixIcon && 'pl-9.5',
              suffixAction && 'pr-10',
              error && 'border-destructive focus-visible:ring-destructive/20',
              className,
            )}
            {...props}
          />
          {suffixAction && (
            <div className="absolute right-2.5 flex items-center">{suffixAction}</div>
          )}
        </div>
        {error ? (
          <p id={messageId} className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : helperText ? (
          <p id={messageId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
