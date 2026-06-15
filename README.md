# MapleGuard

A Canadian-first, bilingual (French/English) privacy program engine for small
and mid-size organizations (20–200 people). MapleGuard treats **Quebec Law 25
(Loi 25)**, **PIPEDA**, and **PHIPA** as binding law in the data model, makes
the data-sovereignty question answerable and exportable, auto-drafts defensible
artifacts, and proves diligence with credentialed human sign-off and a
tamper-evident audit log.

## The hard boundary

Two things are never automated, and the product is designed around that line:

1. **Final sign-off** is always performed by a credentialed human reviewer.
   The system drafts, flags, scores, and routes — a finding becomes
   authoritative only when a human promotes it.
2. **Legal interpretation** is surfaced as a recommendation with citations,
   never asserted as legal advice.

Every AI output is a draft in a "needs review" state; every score is a signal,
not a verdict.

## Tech stack

- **Next.js 16** (App Router) + **TypeScript** + React Server Components
- **Tailwind CSS v4** with the MapleGuard design tokens defined in
  `src/app/globals.css`
- **PostgreSQL via Supabase**, provisioned in a **Canadian region**
  (`ca-central-1`). Data residency is explicit in config and surfaced in the UI.
- **Supabase Auth** with row-level security scoping every table to an
  organization
- **next-intl** for bilingual (en/fr) routing and message catalogs — French is
  a first-class language, with proper Quebec terminology
- **Anthropic Claude API** (added in a later phase) for all drafting, read from
  environment variables

## Data residency

MapleGuard is designed to run on a Supabase project provisioned in a Canadian
region. The configured region is read from `NEXT_PUBLIC_SUPABASE_REGION`
(default `ca-central-1`), documented in `src/lib/supabase/config.ts`, and shown
to the user in the workspace footer.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase values (Canadian region)
npm run dev                  # http://localhost:3000  -> redirects to /en or /fr
```

The app runs in a **demo mode** when Supabase env vars are absent, so the shell
and design system remain previewable without credentials. With Supabase
configured, the workspace requires authentication and redirects to `/login`.

### Database

Apply the SQL migrations in `supabase/migrations/` to your Canadian Supabase
project (via the Supabase SQL editor or CLI). Phase 1 creates the
`organizations`, `profiles` (users), and `engagements` tables with RLS scoping
every row to one organization.

## Phased build

| Phase | Scope | Status |
| ----- | ----- | ------ |
| 1 | Foundation: scaffold, design tokens, bilingual setup, Supabase + Canadian region, auth, Organization/Engagement/User tables with RLS, workspace shell | ✅ Done |
| 2 | Inventory & vendors: DataAsset/Vendor CRUD (hosting region + operator parent domicile + derived jurisdiction), ComplianceRule seed data | ✅ Done |
| 3 | Exposure engine: DataFlow modeling, two-axis exposure + hardcoded CLOUD Act rule, quadrant grid with chips + legend | ✅ Done |
| 4 | Findings & assessment: rule evaluation (privacy officer, vendor due diligence, cross-border transfer), risk register, finding detail with citations | ✅ Done |
| 5 | AI drafting: Claude API + six artifact generators (en/fr) | ⬜ |
| 6 | Review, sign-off & hash-chained append-only audit log | ⬜ |
| 7 | Export: PDF/DOCX for artifacts and the exposure map | ⬜ |

## Non-negotiables

- Nothing the AI produces is presented as final or as legal advice; everything
  routes through human review.
- The append-only audit log is genuinely append-only at the database level.
- French is equal to English everywhere.
- Data residency in a Canadian region is explicit in config and visible.
- No secrets in source — everything sensitive comes from environment variables.
