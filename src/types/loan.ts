import { INSTALLMENT_STATUSES, LOAN_STATUSES } from '@/lib/constants/application-statuses';

export type LoanStatus = (typeof LOAN_STATUSES)[keyof typeof LOAN_STATUSES];

export interface Loan {
  readonly id: string;
  readonly applicationId: string;
  readonly institutionId: string;
  readonly customerId: string;
  readonly borrower: string;
  readonly business: string;
  readonly principal: number;
  readonly totalDue: number;
  paid: number;
  readonly term: number;
  readonly issued: string;
  readonly due: string;
  status: LoanStatus;
}

export interface LoanScheduleInstallment {
  readonly number: number;
  readonly dueDate: string;
  readonly amount: number;
  readonly principalPortion: number;
  readonly interestPortion: number;
  readonly status: (typeof INSTALLMENT_STATUSES)[keyof typeof INSTALLMENT_STATUSES];
}
