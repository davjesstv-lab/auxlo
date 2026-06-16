-- MapleGuard — Phase 5 schema
-- Artifacts: AI-drafted, defensible documents generated from the engagement
-- data. Every artifact lands in a 'draft' (needs-review) state and is
-- versioned — new generations insert a new row, never overwriting prior ones.

create type public.artifact_type as enum (
  'privacy_impact_assessment',   -- PIA / EFVP
  'data_inventory',
  'vendor_due_diligence',
  'foreign_transfer_adequacy',
  'breach_response_runbook',
  'privacy_officer_record'
);

-- 'draft' = AI-generated, pending credentialed review.
-- 'approved' = promoted by a practitioner (Phase 6 sign-off).
create type public.artifact_review_status as enum ('draft', 'approved');

create table public.artifacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  type public.artifact_type not null,
  language public.app_language not null,
  title text not null,
  content text not null,          -- clean HTML fragment for in-app preview
  review_status public.artifact_review_status not null default 'draft',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

create index artifacts_organization_id_idx on public.artifacts (organization_id);
create index artifacts_type_lang_idx
  on public.artifacts (organization_id, type, language);

alter table public.artifacts enable row level security;

create policy "artifacts_select_own_org"
  on public.artifacts for select
  using (organization_id = public.current_org_id());

create policy "artifacts_insert_own_org"
  on public.artifacts for insert
  with check (organization_id = public.current_org_id());

-- Update is org-scoped here; Phase 6 layers the practitioner-only approval
-- check (promotion to 'approved') in the application + audit log. Artifacts
-- are versioned, so content is never updated in place — only review_status.
create policy "artifacts_update_own_org"
  on public.artifacts for update
  using (organization_id = public.current_org_id());
