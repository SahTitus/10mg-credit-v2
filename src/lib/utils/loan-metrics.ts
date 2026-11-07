import { clamp } from '@/lib/utils/formatters';
import type { Loan } from '@/types/loan';

export function getLoanBalance(loan: Pick<Loan, 'totalDue' | 'paid'>): number {
  return Math.max(0, loan.totalDue - loan.paid);
}

export function getLoanProgress(loan: Pick<Loan, 'totalDue' | 'paid'>): number {
  if (loan.totalDue <= 0) return 0;
  return clamp(Math.round((loan.paid / loan.totalDue) * 100), 0, 100);
}
