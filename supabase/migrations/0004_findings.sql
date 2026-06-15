-- MapleGuard — Phase 4 schema
-- PrivacyOfficers (accountability records) and Findings (gaps/exposures tied to
-- ComplianceRules). Findings start as 'indicative' (system-generated) and only
-- become 'confirmed' when a credentialed practitioner promotes them (Phase 6).

create type public.finding_status as enum ('indicative', 'confirmed');

create type public.finding_target as enum (
  'organization',
  'vendor',
  'data_flow',
  'data_asset'
);

-- ---------------------------------------------------------------------------
-- PrivacyOfficer: a named, recorded accountability contact (Law 25 art. 3.1-3.3).
-- ---------------------------------------------------------------------------
create table public.privacy_officers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text not null,
  title text,
  email text,
  created_at timestamptz not null default now()
);

create index privacy_officers_organization_id_idx
  on public.privacy_officers (organization_id);

alter table public.privacy_officers enable row level security;

create policy "privacy_officers_select_own_org"
  on public.privacy_officers for select
  using (organization_id = public.current_org_id());
create policy "privacy_officers_insert_own_org"
  on public.privacy_officers for insert
  with check (organization_id = public.current_org_id());
create policy "privacy_officers_delete_own_org"
  on public.privacy_officers for delete
  using (organization_id = public.current_org_id());

-- ---------------------------------------------------------------------------
-- Finding: a gap or exposure, tied to a ComplianceRule and a target.
-- ---------------------------------------------------------------------------
create table public.findings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  rule_id uuid references public.compliance_rules (id),
  condition public.compliance_condition not null,
  severity public.rule_severity not null default 'medium',
  status public.finding_status not null default 'indicative',
  target_type public.finding_target not null,
  target_id uuid,            -- null for organization-level findings
  target_label text,         -- denormalized name for display
  recommended_artifact text,
  -- Deterministic key so re-running the assessment updates rather than
  -- duplicates findings (e.g. "VENDOR_DUE_DILIGENCE:<vendorId>").
  dedup_key text not null,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users (id),
  unique (organization_id, dedup_key)
);

create index findings_organization_id_idx on public.findings (organization_id);

alter table public.findings enable row level security;

create policy "findings_select_own_org"
  on public.findings for select
  using (organization_id = public.current_org_id());

create policy "findings_insert_own_org"
  on public.findings for insert
  with check (organization_id = public.current_org_id());

-- Update is org-scoped here; Phase 6 layers the practitioner-only sign-off
-- check for promotion to 'confirmed' in the application + audit log.
create policy "findings_update_own_org"
  on public.findings for update
  using (organization_id = public.current_org_id());

create policy "findings_delete_own_org"
  on public.findings for delete
  using (organization_id = public.current_org_id());
