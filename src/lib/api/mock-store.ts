import { Institution } from '@/types/institution';
import { Customer } from '@/types/customer';
import { LoanApplication } from '@/types/application';
import { Loan } from '@/types/loan';
import { Repayment } from '@/types/repayment';
import { AppNotification } from '@/types/notification';
import { DEFAULT_INSTITUTIONS } from '@/lib/constants/institutions';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';
import { APP_ROUTES } from '@/lib/constants/routes';
import {
  APPLICATION_STATUSES,
  LOAN_STATUSES,
  REPAYMENT_STATUSES,
} from '@/lib/constants/application-statuses';

interface MockDatabase {
  schemaVersion?: number;
  institutions: Institution[];
  customers: Customer[];
  applications: LoanApplication[];
  loans: Loan[];
  repayments: Repayment[];
  notifications: AppNotification[];
  notificationReads: Record<string, boolean>;
}

const CURRENT_SCHEMA_VERSION = 2;

const PEOPLE_A = [
  [
    'Amina Yusuf',
    'Amina Pharmacy',
    'ayusuf@aminapharmacy.ng',
    '+234 803 412 8901',
    'Victoria Island, Lagos',
  ],
  [
    'David Okonkwo',
    'Greenline Clinic',
    'david@greenlineclinic.ng',
    '+234 809 523 1140',
    'Wuse II, Abuja',
  ],
  [
    'Zainab Musa',
    'Eastside Medical',
    'zainab@eastsidemedical.ng',
    '+234 802 674 3319',
    'Ikeja, Lagos',
  ],
  [
    'Tobi Adewale',
    'Carepoint Pharmacy',
    'tobi@carepointhealth.ng',
    '+234 805 781 9042',
    'Lekki Phase 1, Lagos',
  ],
  [
    'Grace Eze',
    'Avanti Hospital',
    'grace@avantihospital.ng',
    '+234 806 319 5528',
    'GRA, Port Harcourt',
  ],
  [
    'Samuel Bello',
    'Lifeline Clinics',
    'samuel@lifelineclinics.ng',
    '+234 808 902 4417',
    'Bodija, Ibadan',
  ],
  [
    'Ifeanyi Obi',
    'Kano Health Hub',
    'ifeanyi@kanohealth.ng',
    '+234 803 745 6120',
    'Nassarawa, Kano',
  ],
  [
    'Chika Nwosu',
    'WellSpring Medical',
    'chika@wellspringmed.ng',
    '+234 812 390 8874',
    'Independence Layout, Enugu',
  ],
] as const;

const PEOPLE_B = [
  [
    'Akosua Mensah',
    'Cedar Medical Centre',
    'akosua@cedarmedical.com.gh',
    '+233 24 518 7201',
    'East Legon, Accra',
  ],
  ['Kwame Osei', 'Medix Pharmacy', 'kwame@medixpharmacy.com.gh', '+233 20 841 3390', 'Osu, Accra'],
  [
    'Nana Boateng',
    'Northstar Clinic',
    'nana@northstarclinic.com.gh',
    '+233 24 692 1045',
    'Adum, Kumasi',
  ],
  [
    'Adwoa Owusu',
    'Primecare Health',
    'adwoa@primecarehealth.com.gh',
    '+233 54 318 7762',
    'Airport Residential, Accra',
  ],
  [
    'Kofi Asare',
    'Mercy Health Hub',
    'kofi@mercyhealth.com.gh',
    '+233 27 409 5581',
    'Takoradi Central',
  ],
  [
    'Abena Frimpong',
    'Lakeside Pharmacy',
    'abena@lakesidepharm.com.gh',
    '+233 24 983 2214',
    'Cantonments, Accra',
  ],
  [
    'Esi Amoah',
    'HealthBridge Clinic',
    'esi@healthbridge.com.gh',
    '+233 20 617 8930',
    'Tema Community 1',
  ],
  [
    'Kojo Antwi',
    'Cornerstone Medical',
    'kojo@cornerstonemed.com.gh',
    '+233 55 724 1908',
    'Spintex Road, Accra',
  ],
] as const;

export class MockStorageAdapter {
  private static instance: MockStorageAdapter;
  private db: MockDatabase;

  private constructor() {
    this.db = this.loadOrSeedDatabase();
  }

  public static getInstance(): MockStorageAdapter {
    if (!MockStorageAdapter.instance) {
      MockStorageAdapter.instance = new MockStorageAdapter();
    }
    return MockStorageAdapter.instance;
  }

  private loadOrSeedDatabase(): MockDatabase {
    if (typeof window === 'undefined') {
      // Server rendering has no browser store, so it starts from the seed data
      return this.generateSeedData();
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DB_STORE);
      if (raw) {
        const parsed = JSON.parse(raw) as MockDatabase;
        if (Array.isArray(parsed?.institutions) && Array.isArray(parsed?.applications)) {
          return this.hydrateContactFields(parsed);
        }
      }
    } catch {
      // A malformed or inaccessible store falls back to fresh seed data
    }

    const seeded = this.generateSeedData();
    this.save(seeded);
    return seeded;
  }

  private hydrateContactFields(db: MockDatabase): MockDatabase {
    const needsSchemaUpgrade = (db.schemaVersion ?? 1) < CURRENT_SCHEMA_VERSION;
    if (needsSchemaUpgrade) {
      db.institutions = (db.institutions ?? []).map((inst) => {
        const defaultInst = DEFAULT_INSTITUTIONS.find((item) => item.id === inst.id);
        return {
          ...inst,
          logo: inst.logo || defaultInst?.logo || '',
        };
      });
      db.schemaVersion = CURRENT_SCHEMA_VERSION;
    }

    // Older saved seed records may have placeholder contacts, so enrich matching fixtures
    const customerMap = new Map<string, Customer>();

    db.customers = (db.customers ?? []).map((customer) => {
      const isBluehaven = customer.institutionId === 'bluehaven';
      const fixtures = isBluehaven ? PEOPLE_A : PEOPLE_B;
      const matchedFixture = fixtures.find(
        (p) => p[0] === customer.name || p[1] === customer.business,
      );

      const hasPlaceholderEmail =
        Boolean(matchedFixture) && (!customer.email || customer.email.endsWith('@example.com'));
      const hasPlaceholderPhone =
        Boolean(matchedFixture) && (!customer.phone || customer.phone.endsWith('000 0000'));

      const enriched: Customer = {
        ...customer,
        email: hasPlaceholderEmail && matchedFixture ? matchedFixture[2] : customer.email,
        phone: hasPlaceholderPhone && matchedFixture ? matchedFixture[3] : customer.phone,
        location: customer.location || matchedFixture?.[4],
      };
      customerMap.set(enriched.id, enriched);
      return enriched;
    });

    db.applications = (db.applications ?? []).map((app) => {
      const linkedCustomer = customerMap.get(app.customerId);
      const isBluehaven = app.institutionId === 'bluehaven';
      const fixtures = isBluehaven ? PEOPLE_A : PEOPLE_B;
      const matchedFixture = fixtures.find((p) => p[0] === app.name || p[1] === app.business);

      return {
        ...app,
        email: app.email || linkedCustomer?.email || matchedFixture?.[2],
        phone: app.phone || linkedCustomer?.phone || matchedFixture?.[3],
        location: app.location || linkedCustomer?.location || matchedFixture?.[4],
      };
    });

    if (needsSchemaUpgrade) {
      this.save(db);
    }

    return db;
  }

  private generateSeedData(): MockDatabase {
    const customers: Customer[] = [];
    const applications: LoanApplication[] = [];
    const loans: Loan[] = [];
    const repayments: Repayment[] = [];
    const notifications: AppNotification[] = [];

    const statuses = [
      APPLICATION_STATUSES.APPROVED,
      APPLICATION_STATUSES.APPROVED,
      APPLICATION_STATUSES.IN_REVIEW,
      APPLICATION_STATUSES.APPROVED,
      APPLICATION_STATUSES.DECLINED,
      APPLICATION_STATUSES.APPROVED,
      APPLICATION_STATUSES.PENDING,
      APPLICATION_STATUSES.APPROVED,
    ] as const;

    DEFAULT_INSTITUTIONS.forEach((bank, j) => {
      const people = j === 0 ? PEOPLE_A : PEOPLE_B;
      const values =
        j === 0
          ? [750000, 1400000, 2250000, 580000, 950000, 1850000, 640000, 1320000]
          : [8500, 16000, 24000, 6900, 11500, 18500, 7500, 13000];

      people.forEach((p, i) => {
        const customerId = `${bank.id}-cus-${i + 1}`;
        customers.push({
          id: customerId,
          institutionId: bank.id,
          name: p[0],
          business: p[1],
          email: p[2],
          phone: p[3],
          location: p[4],
          joined: `2026-${String((i % 6) + 3).padStart(2, '0')}-${String(4 + i).padStart(2, '0')}`,
          score: 671 + i * 17,
        });

        const app: LoanApplication = {
          id: `${j === 0 ? 'BH' : 'MR'}-26-${String(1026 + i)}`,
          institutionId: bank.id,
          customerId,
          name: p[0],
          business: p[1],
          email: p[2],
          phone: p[3],
          location: p[4],
          amount: values[i],
          purpose: [
            'Medical inventory',
            'Equipment purchase',
            'Pharmacy restock',
            'Clinic supplies',
          ][i % 4],
          term: i % 2 ? 4 : 3,
          status: statuses[i],
          submitted: new Date(Date.now() - (i * 2 + 1) * 86400000).toISOString().slice(0, 10),
          note:
            statuses[i] === APPLICATION_STATUSES.DECLINED
              ? 'Exceeds short-term liquidity threshold'
              : '',
        };
        applications.push(app);

        // Approved seed requests include a loan and payment so totals match the records
        if (app.status === APPLICATION_STATUSES.APPROVED) {
          const total = Math.round(app.amount * (1 + (bank.interest * (app.term / 12)) / 100));
          const paid = i === 3 ? total : Math.round(total * [0.4, 0.62, 0.2, 0.72][i % 4]);
          const loanId = `${j === 0 ? 'BL' : 'ML'}-26-${String(6030 + i)}`;

          loans.push({
            id: loanId,
            applicationId: app.id,
            institutionId: bank.id,
            customerId,
            borrower: p[0],
            business: p[1],
            principal: app.amount,
            totalDue: total,
            paid,
            term: app.term,
            issued: app.submitted,
            due: new Date(Date.now() + (i * 8 + 16) * 86400000).toISOString().slice(0, 10),
            status: i === 3 ? LOAN_STATUSES.COMPLETED : LOAN_STATUSES.ACTIVE,
          });

          repayments.push({
            id: `RP-${j}${i}1`,
            institutionId: bank.id,
            loanId,
            customerId,
            name: p[0],
            business: p[1],
            amount: paid,
            date: new Date(Date.now() - (i + 4) * 86400000).toISOString().slice(0, 10),
            status: REPAYMENT_STATUSES.PAID,
          });
        }
      });

      // The first borrower has a second, pending request for the review queue
      const first = people[0];
      applications.unshift({
        id: `${j === 0 ? 'BH' : 'MR'}-26-1050`,
        institutionId: bank.id,
        customerId: `${bank.id}-cus-1`,
        name: first[0],
        business: first[1],
        email: first[2],
        phone: first[3],
        location: first[4],
        amount: Math.round(values[0] * 0.68),
        purpose: 'Clinic supplies',
        term: 3,
        status: APPLICATION_STATUSES.PENDING,
        submitted: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        note: '',
      });

      notifications.push(
        {
          id: `notif-${bank.id}-1`,
          institutionId: bank.id,
          title: 'New application received',
          message: `${first[1]} submitted credit request #${j === 0 ? 'BH' : 'MR'}-26-1050`,
          time: '2 hours ago',
          read: false,
          category: 'application',
          targetRoute: APP_ROUTES.LENDER.APPLICATIONS,
          targetId: `${j === 0 ? 'BH' : 'MR'}-26-1050`,
        },
        {
          id: `notif-${bank.id}-2`,
          institutionId: bank.id,
          title: 'Repayment received',
          message: `${people[1][1]} completed installment payment`,
          time: '1 day ago',
          read: true,
          category: 'repayment',
          targetRoute: APP_ROUTES.LENDER.REPAYMENTS,
        },
      );
    });

    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      institutions: [...DEFAULT_INSTITUTIONS],
      customers,
      applications,
      loans,
      repayments,
      notifications,
      notificationReads: {},
    };
  }

  private save(data: MockDatabase): void {
    this.db = data;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.DB_STORE, JSON.stringify(data));
      } catch {
        // The in-memory state remains usable when browser storage is unavailable
      }
    }
  }

  public getDatabase(): MockDatabase {
    return this.db;
  }

  public updateDatabase(updater: (prev: MockDatabase) => MockDatabase): void {
    const updated = updater(this.db);
    this.save(updated);
  }

  public resetToDefaults(): void {
    const fresh = this.generateSeedData();
    this.save(fresh);
  }
}
