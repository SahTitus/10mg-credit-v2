export interface Customer {
  readonly id: string;
  readonly institutionId: string;
  readonly name: string;
  readonly business: string;
  readonly email: string;
  readonly phone: string;
  readonly location?: string;
  readonly joined: string;
  readonly score: number;
}
