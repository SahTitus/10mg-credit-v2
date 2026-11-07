export interface LenderDashboardMetrics {
  readonly totalDisbursed: number;
  readonly activeLoansCount: number;
  readonly pendingReviewCount: number;
  readonly totalCollected: number;
  readonly recordedRepaymentsCount: number;
  readonly outstandingBalance: number;
  readonly fundedLoansCount: number;
  readonly portfolioActivePercentage: number;
  readonly portfolioRepaidPercentage: number;
}

export interface CustomerDashboardMetrics {
  readonly activeLoansCount: number;
  readonly totalBorrowed: number;
  readonly totalRepaid: number;
  readonly outstandingBalance: number;
  readonly nextPaymentDue?: {
    readonly loanId: string;
    readonly amount: number;
    readonly dueDate: string;
    readonly progressPercentage: number;
  };
}

export interface ChartDataPoint {
  readonly month: string;
  readonly value: number;
}

export type LenderActivityCategory = 'all' | 'application' | 'loan' | 'repayment';

export interface LenderActivityItem {
  readonly id: string;
  readonly referenceId: string;
  readonly category: Exclude<LenderActivityCategory, 'all'>;
  readonly title: string;
  readonly business: string;
  readonly amount: number;
  readonly date: string;
  readonly status: string;
  readonly href: string;
}

export interface LenderActivityFeedResponse {
  readonly items: LenderActivityItem[];
  readonly totalCount: number;
}
