import { beforeEach, describe, expect, it } from 'vitest';
import { applicationApiService } from '@/lib/api/application-service';
import { authApiService } from '@/lib/api/auth-service';
import { customerApiService } from '@/lib/api/customer-service';
import { institutionApiService } from '@/lib/api/institution-service';
import { loanApiService } from '@/lib/api/loan-service';
import { MockStorageAdapter } from '@/lib/api/mock-store';
import { repaymentApiService } from '@/lib/api/repayment-service';
import { APPLICATION_STATUSES, LOAN_STATUSES } from '@/lib/constants/application-statuses';
import { ConflictError, ValidationError } from '@/lib/errors/app-error';

describe('Core Credit Workflow & Multi-Tenant Integrity', () => {
  beforeEach(() => {
    MockStorageAdapter.getInstance().resetToDefaults();
  });

  it('completes application -> approval -> loan -> repayment settlement for Bluehaven (NGN)', async () => {
    const session = await authApiService.login({
      email: 'ayusuf@aminapharmacy.ng',
      password: 'demo12345',
      institutionId: 'bluehaven',
      role: 'customer',
    });

    expect(session.customerId).toBe('bluehaven-cus-1');
    expect(session.business).toBe('Amina Pharmacy');

    const application = await applicationApiService.create({
      institutionId: 'bluehaven',
      customerId: session.customerId,
      name: '',
      business: '',
      amount: 600000,
      purpose: 'Pharmacy restock',
      term: 6,
    });

    expect(application.customerId).toBe('bluehaven-cus-1');
    expect(application.name).toBe('Amina Yusuf');
    expect(application.business).toBe('Amina Pharmacy');
    expect(application.status).toBe(APPLICATION_STATUSES.PENDING);

    const approved = await applicationApiService.updateStatus(
      application.id,
      APPLICATION_STATUSES.APPROVED,
      'Approved within facility limits',
    );
    expect(approved.status).toBe(APPLICATION_STATUSES.APPROVED);

    await applicationApiService.updateStatus(application.id, APPLICATION_STATUSES.APPROVED);

    const customerLoans = await loanApiService.list('bluehaven', 'bluehaven-cus-1');
    const matchingLoans = customerLoans.filter((loan) => loan.applicationId === application.id);
    expect(matchingLoans).toHaveLength(1);

    const createdLoan = matchingLoans[0];
    const expectedTotalDue = Math.round(600000 * (1 + (9.5 * (6 / 12)) / 100));
    expect(createdLoan.principal).toBe(600000);
    expect(createdLoan.totalDue).toBe(expectedTotalDue);
    expect(createdLoan.paid).toBe(0);
    expect(createdLoan.business).toBe('Amina Pharmacy');
    expect(createdLoan.status).toBe(LOAN_STATUSES.ACTIVE);

    const firstInstallment = 250000;
    const receiptOne = await repaymentApiService.record({
      institutionId: 'bluehaven',
      loanId: createdLoan.id,
      customerId: 'bluehaven-cus-1',
      amount: firstInstallment,
    });
    expect(receiptOne.amount).toBe(firstInstallment);

    const afterPartial = await loanApiService.getById(createdLoan.id);
    expect(afterPartial.paid).toBe(firstInstallment);
    expect(afterPartial.status).toBe(LOAN_STATUSES.ACTIVE);

    const remainingBalance = expectedTotalDue - firstInstallment;
    await repaymentApiService.record({
      institutionId: 'bluehaven',
      loanId: createdLoan.id,
      customerId: 'bluehaven-cus-1',
      amount: remainingBalance,
    });

    const settledLoan = await loanApiService.getById(createdLoan.id);
    expect(settledLoan.paid).toBe(expectedTotalDue);
    expect(settledLoan.status).toBe(LOAN_STATUSES.COMPLETED);
  }, 15000);

  it('completes application -> approval -> loan -> repayment settlement for Meridian (GHS)', async () => {
    const session = await authApiService.login({
      email: 'akosua@cedarmedical.com.gh',
      password: 'demo12345',
      institutionId: 'meridian',
      role: 'customer',
    });

    expect(session.customerId).toBe('meridian-cus-1');
    expect(session.business).toBe('Cedar Medical Centre');

    const bluehavenLoansBefore = await loanApiService.list('bluehaven');

    const application = await applicationApiService.create({
      institutionId: 'meridian',
      customerId: session.customerId,
      name: session.name,
      business: session.business ?? '',
      amount: 12000,
      purpose: 'Diagnostic equipment',
      term: 4,
    });

    expect(application.business).toBe('Cedar Medical Centre');

    await applicationApiService.updateStatus(application.id, APPLICATION_STATUSES.APPROVED);

    const meridianLoans = await loanApiService.list('meridian', 'meridian-cus-1');
    const createdLoan = meridianLoans.find((loan) => loan.applicationId === application.id);
    expect(createdLoan).toBeDefined();

    const expectedTotalDue = Math.round(12000 * (1 + (10.5 * (4 / 12)) / 100));
    expect(createdLoan?.totalDue).toBe(expectedTotalDue);

    await repaymentApiService.record({
      institutionId: 'meridian',
      loanId: createdLoan!.id,
      customerId: 'meridian-cus-1',
      amount: expectedTotalDue,
    });

    const settled = await loanApiService.getById(createdLoan!.id);
    expect(settled.status).toBe(LOAN_STATUSES.COMPLETED);

    const bluehavenLoansAfter = await loanApiService.list('bluehaven');
    expect(bluehavenLoansAfter).toHaveLength(bluehavenLoansBefore.length);
  }, 15000);

  it('creates an isolated borrower for new lender applications and matches existing borrowers by email', async () => {
    const newApplicantApp = await applicationApiService.create({
      institutionId: 'bluehaven',
      name: 'Halima Danjuma',
      business: 'Sunrise Diagnostics',
      amount: 450000,
      purpose: 'Laboratory reagents',
      term: 3,
    });

    expect(newApplicantApp.customerId).not.toBe('bluehaven-cus-1');
    expect(newApplicantApp.email).toBeUndefined();
    expect(newApplicantApp.phone).toBeUndefined();
    expect(newApplicantApp.location).toBeUndefined();

    const createdCustomer = await customerApiService.getById(newApplicantApp.customerId);
    expect(createdCustomer.name).toBe('Halima Danjuma');
    expect(createdCustomer.business).toBe('Sunrise Diagnostics');
    expect(createdCustomer.email).toBe('');

    const matchedApplicantApp = await applicationApiService.create({
      institutionId: 'bluehaven',
      name: 'David Okonkwo',
      business: 'Greenline Clinic',
      email: 'david@greenlineclinic.ng',
      amount: 800000,
      purpose: 'Equipment purchase',
      term: 6,
    });

    expect(matchedApplicantApp.customerId).toBe('bluehaven-cus-2');
  }, 15000);

  it('enforces institution, customer, balance, and settlement guards on repayments', async () => {
    const bluehavenLoans = await loanApiService.list('bluehaven');
    const activeLoan = bluehavenLoans.find((loan) => loan.status === LOAN_STATUSES.ACTIVE)!;
    const completedLoan = bluehavenLoans.find((loan) => loan.status === LOAN_STATUSES.COMPLETED)!;
    const remaining = activeLoan.totalDue - activeLoan.paid;

    await expect(
      repaymentApiService.record({
        institutionId: 'bluehaven',
        loanId: activeLoan.id,
        customerId: activeLoan.customerId,
        amount: 0,
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    await expect(
      repaymentApiService.record({
        institutionId: 'meridian',
        loanId: activeLoan.id,
        customerId: activeLoan.customerId,
        amount: 1000,
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    await expect(
      repaymentApiService.record({
        institutionId: 'bluehaven',
        loanId: activeLoan.id,
        customerId: 'meridian-cus-1',
        amount: 1000,
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    await expect(
      repaymentApiService.record({
        institutionId: 'bluehaven',
        loanId: activeLoan.id,
        customerId: activeLoan.customerId,
        amount: remaining + 1,
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    await expect(
      repaymentApiService.record({
        institutionId: 'bluehaven',
        loanId: completedLoan.id,
        customerId: completedLoan.customerId,
        amount: 1000,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  }, 15000);

  it('persists institution logo and policy updates independently per tenant', async () => {
    const updatedBluehaven = await institutionApiService.updateSettings('bluehaven', {
      logo: 'https://cdn.bluehaven.example/logo.svg',
      primary: '#253c58',
      interest: 8.75,
    });

    expect(updatedBluehaven.logo).toBe('https://cdn.bluehaven.example/logo.svg');
    expect(updatedBluehaven.primary).toBe('#253c58');
    expect(updatedBluehaven.interest).toBe(8.75);

    const meridian = await institutionApiService.getById('meridian');
    expect(meridian.logo).toBe('/assets/logo-meridian.svg');
    expect(meridian.interest).toBe(10.5);
  });
});
