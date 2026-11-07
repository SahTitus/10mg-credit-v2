'use client';

import * as React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (title: string, description?: string, type?: ToastType) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [activeToast, setActiveToast] = React.useState<ToastMessage | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const addToast = React.useCallback(
    (title: string, description?: string, type: ToastType = 'info') => {
      clearTimer();
      const id = String(Date.now());
      setActiveToast({ id, title, description, type });

      timerRef.current = setTimeout(() => {
        // Ignore an expired timer if another toast has replaced this one
        setActiveToast((current) => (current?.id === id ? null : current));
        timerRef.current = null;
      }, 4200);
    },
    [clearTimer],
  );

  const removeToast = React.useCallback(() => {
    clearTimer();
    setActiveToast(null);
  }, [clearTimer]);

  React.useEffect(() => clearTimer, [clearTimer]);

  const contextValue = React.useMemo(
    () => ({
      toast: addToast,
      success: (title: string, desc?: string) => addToast(title, desc, 'success'),
      error: (title: string, desc?: string) => addToast(title, desc, 'error'),
      info: (title: string, desc?: string) => addToast(title, desc, 'info'),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-3 bottom-3 z-50 flex justify-center sm:inset-x-auto sm:right-5 sm:bottom-5 sm:justify-end"
        aria-live="polite"
      >
        {activeToast && (
          <div
            key={activeToast.id}
            className={cn(
              'animate-toast-in pointer-events-auto flex w-full max-w-[min(320px,calc(100vw-24px))] items-center gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 text-slate-900 shadow-[0_14px_34px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/5 sm:w-auto sm:min-w-60 sm:max-w-xs sm:px-4 sm:py-3',
              activeToast.type === 'success' && 'border-[#b2e5d5]',
              activeToast.type === 'error' && 'border-[#fcd5cd]',
              activeToast.type === 'info' && 'border-line',
            )}
          >
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                activeToast.type === 'success' && 'bg-[#e8f7f1] text-[#16856d]',
                activeToast.type === 'error' && 'bg-[#fff0ed] text-[#c95c55]',
                activeToast.type === 'info' && 'bg-brand-pale text-brand',
              )}
            >
              {activeToast.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
              {activeToast.type === 'error' && <AlertCircle className="h-4 w-4" />}
              {activeToast.type === 'info' && <Info className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1 text-xs">
              <strong className="block truncate font-bold text-slate-900">
                {activeToast.title}
              </strong>
              {activeToast.description && (
                <span className="mt-0.5 block truncate text-[11px] leading-snug text-slate-600">
                  {activeToast.description}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={removeToast}
              className="shrink-0 cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Dismiss toast"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
