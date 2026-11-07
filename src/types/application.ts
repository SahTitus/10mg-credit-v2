import { APPLICATION_STATUSES } from '@/lib/constants/application-statuses';

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[keyof typeof APPLICATION_STATUSES];

export interface LoanApplication {
  readonly id: string;
  readonly institutionId: string;
  readonly customerId: string;
  readonly name: string;
  readonly business: string;
  readonly email?: string;
  readonly phone?: string;
  readonly location?: string;
  readonly amount: number;
  readonly purpose: string;
  readonly term: number;
  status: ApplicationStatus;
  readonly submitted: string;
  note?: string;
}

export interface CreateApplicationDTO {
  readonly institutionId: string;
  readonly customerId?: string;
  readonly name: string;
  readonly business: string;
  readonly email?: string;
  readonly phone?: string;
  readonly location?: string;
  readonly amount: number;
  readonly purpose: string;
  readonly term: number;
  readonly notes?: string;
}
