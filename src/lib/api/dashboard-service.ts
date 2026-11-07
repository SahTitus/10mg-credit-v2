import { BaseApiService } from './base-service';
import {
  LenderDashboardMetrics,
  CustomerDashboardMetrics,
  ChartDataPoint,
  LenderActivityCategory,
  LenderActivityFeedResponse,
  LenderActivityItem,
} from '@/types/dashboard';
import { APPLICATION_STATUSES, LOAN_STATUSES } from '@/lib/constants/application-statuses';
import { APP_ROUTE_BUILDERS } from '@/lib/constants/routes';

export class DashboardApiService extends BaseApiService {
  public async getLenderMetrics(institutionId: string): Promise<LenderDashboardMetrics> {
    await this.delay(200);
    const db = this.store.getDatabase();
    const apps = db.applications.filter((a) => a.institutionId === institutionId);
    const loans = db.loans.filter((l) => l.institutionId === institutionId);
    const repayments = db.repayments.filter((r) => r.institutionId === institutionId);

    const pendingReviewCount = apps.filter(
      (a) =>
        a.status === APPLICATION_STATUSES.PENDING || a.status === APPLICATION_STATUSES.IN_REVIEW,
    ).length;

    const activeLoans = loans.filter((l) => l.status === LOAN_STATUSES.ACTIVE);
    const totalDisbursed = loans.reduce((sum, l) => sum + l.principal, 0);
    const outstandingBalance = loans.reduce((sum, l) => sum + Math.max(0, l.totalDue - l.paid), 0);
    const totalCollected = repayments.reduce((sum, r) => sum + r.amount, 0);

    // Avoid dividing by zero when calculating the active share of an empty portfolio
    const totalLoans = loans.length || 1;
    const portfolioActivePercentage = Math.round((activeLoans.length / totalLoans) * 100);
    const portfolioRepaidPercentage = 100 - portfolioActivePercentage;

    return {
      totalDisbursed,
      activeLoansCount: activeLoans.length,
      pendingReviewCount,
      totalCollected,
      recordedRepaymentsCount: repayments.length,
      outstandingBalance,
      fundedLoansCount: loans.length,
      portfolioActivePercentage,
      portfolioRepaidPercentage,
    };
  }

  public async getCustomerMetrics(
    institutionId: string,
    customerId: string,
  ): Promise<CustomerDashboardMetrics> {
    await this.delay(200);
    const db = this.store.getDatabase();
    const loans = db.loans.filter(
      (l) => l.institutionId === institutionId && l.customerId === customerId,
    );

    const activeLoans = loans.filter((l) => l.status === LOAN_STATUSES.ACTIVE);
    const totalBorrowed = loans.reduce((sum, l) => sum + l.principal, 0);
    const totalRepaid = loans.reduce((sum, l) => sum + l.paid, 0);
    const outstandingBalance = loans.reduce((sum, l) => sum + Math.max(0, l.totalDue - l.paid), 0);

    const nextLoan = activeLoans.sort((a, b) => a.due.localeCompare(b.due))[0];
    const nextPaymentDue = nextLoan
      ? {
          loanId: nextLoan.id,
          amount: Math.round(nextLoan.totalDue / nextLoan.term),
          dueDate: nextLoan.due,
          progressPercentage: Math.min(100, Math.round((nextLoan.paid / nextLoan.totalDue) * 100)),
        }
      : undefined;

    return {
      activeLoansCount: activeLoans.length,
      totalBorrowed,
      totalRepaid,
      outstandingBalance,
      nextPaymentDue,
    };
  }

  public getChartData(institutionId: string, range: 6 | 12): ChartDataPoint[] {
    // The trend is illustrative seed data, not a sum of recorded disbursements
    const rawVals =
      institutionId === 'meridian'
        ? [3, 4, 3.5, 6, 5.8, 6.9, 9, 7.6, 10.1, 9.4, 10.8, 12.3]
        : [380, 520, 450, 760, 690, 880, 900, 760, 1010, 940, 1080, 1230];

    const allMonths = [
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
    ];

    const vals = rawVals.slice(-range);
    const months = allMonths.slice(-range);

    return vals.map((v, i) => ({
      month: months[i],
      value: v,
    }));
  }

  public async getLenderActivities(
    institutionId: string,
    options?: { limit?: number; category?: LenderActivityCategory },
  ): Promise<LenderActivityFeedResponse> {
    await this.delay(200);
    const db = this.store.getDatabase();
    const apps = db.applications.filter((a) => a.institutionId === institutionId);
    const loans = db.loans.filter((l) => l.institutionId === institutionId);
    const repayments = db.repayments.filter((r) => r.institutionId === institutionId);

    const items: LenderActivityItem[] = [];

    for (const repayment of repayments) {
      items.push({
        id: `repayment-${repayment.id}`,
        referenceId: repayment.id,
        category: 'repayment',
        title: 'Repayment received',
        business: repayment.business,
        amount: repayment.amount,
        date: repayment.date,
        status: repayment.status,
        href: APP_ROUTE_BUILDERS.LENDER.REPAYMENT(repayment.id),
      });
    }

    for (const loan of loans) {
      items.push({
        id: `loan-${loan.id}`,
        referenceId: loan.id,
        category: 'loan',
        title: loan.status === LOAN_STATUSES.COMPLETED ? 'Facility settled' : 'Facility disbursed',
        business: loan.business,
        amount: loan.principal,
        date: loan.issued,
        status: loan.status,
        href: APP_ROUTE_BUILDERS.LENDER.LOAN(loan.id),
      });
    }

    for (const app of apps) {
      const title =
        app.status === APPLICATION_STATUSES.APPROVED
          ? 'Application approved'
          : app.status === APPLICATION_STATUSES.DECLINED
            ? 'Application declined'
            : app.status === APPLICATION_STATUSES.IN_REVIEW
              ? 'Marked in review'
              : 'Credit request submitted';

      items.push({
        id: `application-${app.id}`,
        referenceId: app.id,
        category: 'application',
        title,
        business: app.business,
        amount: app.amount,
        date: app.submitted,
        status: app.status,
        href: APP_ROUTE_BUILDERS.LENDER.APPLICATION(app.id),
      });
    }

    items.sort((a, b) => b.date.localeCompare(a.date));

    const category = options?.category ?? 'all';
    const filtered =
      category === 'all' ? items : items.filter((item) => item.category === category);

    const sliced = typeof options?.limit === 'number' ? filtered.slice(0, options.limit) : filtered;

    return {
      items: sliced,
      totalCount: items.length,
    };
  }
}

export const dashboardApiService = new DashboardApiService();
