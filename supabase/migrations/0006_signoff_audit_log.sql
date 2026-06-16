-- MapleGuard — Phase 6 schema
-- Reviewers (credentialed practitioners), SignOffs (immutable promotion
-- records), and the AuditLogEntry hash chain (append-only at the database
-- level). This is the defensibility core: a finding or artifact becomes
-- authoritative only when a credentialed human promotes it, and every
-- promotion is recorded in a tamper-evident log.

-- ---------------------------------------------------------------------------
-- Reviewer: a credentialed practitioner (e.g. CISA, CRISC).
-- ---------------------------------------------------------------------------
create table public.reviewers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references auth.users (id),
  full_name text not null,
  credential_type text not null,   -- e.g. "CISA", "CRISC"
  credential_id text,              -- credential / certificate number
  created_at timestamptz not null default now()
);

create index reviewers_organization_id_idx on public.reviewers (organization_id);

alter table public.reviewers enable row level security;

create policy "reviewers_select_own_org"
  on public.reviewers for select
  using (organization_id = public.current_org_id());
create policy "reviewers_insert_own_org"
  on public.reviewers for insert
  with check (
    organization_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'practitioner')
  );

-- ---------------------------------------------------------------------------
-- SignOff: an immutable record that a Reviewer promoted a Finding or approved
-- an Artifact. Never editable — only select + insert policies, and update/
-- delete grants are revoked below.
-- ---------------------------------------------------------------------------
create type public.signoff_target as enum ('finding', 'artifact');
create type public.signoff_action as enum ('confirm_finding', 'approve_artifact');

create table public.sign_offs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  reviewer_id uuid not null references public.reviewers (id),
  actor_user_id uuid references auth.users (id),
  target_type public.signoff_target not null,
  target_id uuid not null,
  action public.signoff_action not null,
  -- Hash of the target's content at the moment of sign-off (tamper anchor).
  prior_content_hash text not null,
  created_at timestamptz not null default now()
);

create index sign_offs_organization_id_idx on public.sign_offs (organization_id);

alter table public.sign_offs enable row level security;

create policy "sign_offs_select_own_org"
  on public.sign_offs for select
  using (organization_id = public.current_org_id());
create policy "sign_offs_insert_own_org"
  on public.sign_offs for insert
  with check (
    organization_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'practitioner')
  );
-- Immutability: no update/delete policies (denied under RLS) + revoke grants.
revoke update, delete on public.sign_offs from authenticated, anon;

-- ---------------------------------------------------------------------------
-- AuditLogEntry: append-only, hash-chained log. Each entry stores a hash of
-- its own content plus the previous entry's hash (per organization). Tampering
-- with any entry breaks the chain from that point forward.
-- ---------------------------------------------------------------------------
create table public.audit_log_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seq bigint not null,                 -- per-organization sequence (1-based)
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  reviewer_id uuid references public.reviewers (id),
  actor_user_id uuid references auth.users (id),
  prev_hash text not null,             -- previous entry's entry_hash ('' for genesis)
  entry_hash text not null,            -- sha256 over canonical content + prev_hash
  created_at timestamptz not null,     -- set by the app so the hash is reproducible
  unique (organization_id, seq)
);

create index audit_log_entries_org_seq_idx
  on public.audit_log_entries (organization_id, seq);

alter table public.audit_log_entries enable row level security;

-- Append-only: SELECT and INSERT only. With no UPDATE or DELETE policy, those
-- operations are denied under RLS for application roles; the revokes below are
-- belt-and-suspenders at the privilege level.
create policy "audit_select_own_org"
  on public.audit_log_entries for select
  using (organization_id = public.current_org_id());
create policy "audit_insert_own_org"
  on public.audit_log_entries for insert
  with check (organization_id = public.current_org_id());

revoke update, delete on public.audit_log_entries from authenticated, anon;
