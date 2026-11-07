'use client';

import * as React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from './button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { cn } from '@/lib/utils/cn';

export type ConfirmDialogTone = 'primary' | 'success' | 'danger';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  isLoading?: boolean;
  onConfirm: () => void;
  children?: React.ReactNode;
}

const TONE_CONFIG: Record<
  ConfirmDialogTone,
  {
    buttonVariant: 'primary' | 'success' | 'danger';
    badgeClass: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  primary: {
    buttonVariant: 'primary',
    badgeClass: 'bg-brand-pale text-brand',
    icon: ShieldAlert,
  },
  success: {
    buttonVariant: 'success',
    badgeClass: 'bg-positive-pale text-positive',
    icon: CheckCircle2,
  },
  danger: {
    buttonVariant: 'danger',
    badgeClass: 'bg-[#fff5f5] text-[#b43c35] border border-[#e5b8b5]/60',
    icon: AlertTriangle,
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  isLoading = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const config = TONE_CONFIG[tone];
  const Icon = config.icon;

  const stopRowPropagation = (event: React.SyntheticEvent) => {
    // Portal events can bubble through the record row that opened this dialog
    event.stopPropagation();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        onClick={stopRowPropagation}
        onPointerDown={stopRowPropagation}
      >
        <DialogHeader className="flex-row items-start gap-3.5 space-y-0">
          <span
            className={cn(
              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
              config.badgeClass,
            )}
            aria-hidden="true"
          >
            <Icon className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 space-y-1">
            <DialogTitle className="text-base font-bold leading-snug">{title}</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        {children && <DialogBody className="py-4 text-xs">{children}</DialogBody>}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={config.buttonVariant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
