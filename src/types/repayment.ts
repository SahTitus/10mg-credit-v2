import { REPAYMENT_STATUSES } from '@/lib/constants/application-statuses';

export type RepaymentStatus = (typeof REPAYMENT_STATUSES)[keyof typeof REPAYMENT_STATUSES];

export interface Repayment {
  readonly id: string;
  readonly institutionId: string;
  readonly loanId: string;
  readonly customerId: string;
  readonly name: string;
  readonly business: string;
  readonly amount: number;
  readonly date: string;
  readonly status: RepaymentStatus;
}

export interface RecordRepaymentDTO {
  readonly institutionId: string;
  readonly loanId: string;
  readonly customerId: string;
  readonly amount: number;
}
