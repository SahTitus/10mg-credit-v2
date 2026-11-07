# 10mg Credit V2

This project runs two lending institutions from one application. Bluehaven Health Finance and Meridian Medical Capital each have their own branding, credit policy, customers, applications, loans, and repayments. I built both a lender workspace and a customer portal so a credit request can be followed from submission through review and repayment.

## Run it locally

Use Node.js 22 and Yarn 1.22. The project uses the same Node version in CI.

```bash
cp .env.example .env
yarn install --frozen-lockfile
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). To check the production build locally:

```bash
yarn build
yarn start
```

`.env.example` sets `NEXT_PUBLIC_API_BASE_URL=/api/v2` and `NEXT_PUBLIC_API_MODE=mock` by default, and `src/lib/config/env.ts` falls back to those same defaults when unset so CI and demo deployments run without extra setup. To point the services at a live backend, set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_API_MODE=http` in `.env`.

## Deploy on AWS Amplify

The repository includes `amplify.yml` and `.nvmrc` configured for AWS Amplify Hosting's managed Next.js 15 compute runtime (`WEB_COMPUTE`):

1. In the AWS Amplify Console, select **Create new app** and connect your GitHub repository and `main` branch.
2. Amplify detects `amplify.yml` automatically (`Node.js 22`, `yarn install --frozen-lockfile`, `yarn build`, and `.next` build artifacts) so both static pages and dynamic record routes (`/lender/*/[id]`, `/customer/*/[id]`) work out of the box.
3. No additional environment variables are required for the demo workspace.

## Sign in and explore

The sign-in screen lets you choose an institution and either the lender workspace or customer portal. It starts with `demo@10mg.ai` and `demo12345` filled in. The password is for the demo only, authentication is simulated in the browser.

For a customer session linked to a specific seeded borrower, choose **Customer portal** and use one of these accounts with `demo12345`:

| Institution | Email                        | Borrower                            |
| ----------- | ---------------------------- | ----------------------------------- |
| Bluehaven   | `ayusuf@aminapharmacy.ng`    | Amina Yusuf, Amina Pharmacy         |
| Meridian    | `akosua@cedarmedical.com.gh` | Akosua Mensah, Cedar Medical Centre |

A different valid email in customer mode opens the first seeded borrower for the selected institution. This is a demo convenience, not a real sign-in rule.

### Lender workspace

- Review portfolio totals, lending performance, and recent activity.
- Search and filter applications, inspect each request, and record an underwriting decision. An approved request creates a loan.
- Browse customer, loan, and repayment records, with dedicated detail pages and links between related records.
- Record repayments and export application or loan lists as CSV.
- Edit each institution's name, logo URL, colours, sidebar appearance, currency, and credit policy. Changes are applied when **Save changes** is clicked; the page previews the draft first.

### Customer portal

- Apply for credit through a three-step form with an illustrative repayment estimate.
- Track applications and open their detail pages.
- Review loan balances, repayment schedules, and payment history.
- Make a repayment against an active loan and view its receipt.

Both portals use responsive layouts.

### A short walkthrough

1. Sign in to Bluehaven's customer portal as Amina Yusuf and submit a credit request.
2. Switch to the lender workspace, open that request, and approve it.
3. Return to the customer portal to see the new loan and record a repayment.
4. Switch to Meridian to see its separate records, currency, and branding.

## Data and application structure

The API layer is fully decoupled: service classes in `src/lib/api/` are pure REST clients communicating via centralized endpoint paths (`API_ENDPOINTS`). In mock mode (`NEXT_PUBLIC_API_MODE=mock`), requests route to an in-memory and `localStorage` mock adapter with realistic latency simulation so the full workflow can be tried without a backend setup. In HTTP mode (`NEXT_PUBLIC_API_MODE=http`), requests dispatch standard network `fetch` calls to `NEXT_PUBLIC_API_BASE_URL`. Switching to a live backend requires only updating the `.env` configuration without modifying any service files. `mock-store.ts` seeds both institutions and stores changes in the browser's `localStorage`. A refresh keeps changes in the same browser; clearing the site's data restores the seed records. Nothing is shared between browsers or devices.

The rest of the app is organised by responsibility:

| Location          | Purpose                                                                     |
| ----------------- | --------------------------------------------------------------------------- |
| `src/app/`        | Next.js routes for sign-in, lender, and customer pages                      |
| `src/features/`   | Hooks and components for credit, loans, repayments, customers, and settings |
| `src/components/` | Shared layout, data displays, shadcn/ui components, and workspace controls  |
| `src/lib/`        | Mock services, schemas, formatting, routes, query keys, and theme utilities |
| `src/store/`      | Zustand stores for session, active institution, and workspace UI state      |
| `src/tests/`      | Automated checks for the main workflows and supporting logic                |

TanStack Query handles remote-style data state and cache invalidation. Queries are scoped by institution and, where relevant, borrower. Zustand stores hold the active session, institution, and UI state. React Hook Form and Zod validate sign-in and settings; the services also check credit and repayment rules. The UI uses Tailwind CSS and shadcn/ui components adapted to the workspace design.

The mock authentication and browser storage make the flows easy to try, but they are not suitable for production security or persistence. The repayment figures and schedules are illustrative; no payment processor is connected. Institution logos are configured with a URL or an asset path rather than uploaded to a server.

## Verify the project

```bash
yarn format:check
yarn check:file-size
yarn lint:strict
yarn typecheck
yarn test:run
yarn build
```

The tests cover authentication, formatting, theme calculations, Zustand client stores, credit application through approval and repayment, tenant and borrower scope, query invalidation, and error handling. The pre-commit hook checks staged formatting and lint issues, types, and file length. GitHub Actions runs formatting, file length, strict linting, type checking, tests, and the production build.
