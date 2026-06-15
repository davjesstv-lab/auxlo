-- MapleGuard — Phase 1 schema
-- Organizations, Engagements, and Users (profiles), with row-level security
-- scoping every client-data table to a single organization.
--
-- Data residency: this schema is intended to run on a Supabase project
-- provisioned in a Canadian region (ca-central-1). Residency is a product
-- guarantee, not an afterthought.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'practitioner', 'client');

create type public.headcount_band as enum (
  '1-19',
  '20-49',
  '50-99',
  '100-200',
  '200+'
);

create type public.jurisdiction as enum (
  'QC', 'ON', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'NU', 'YT', 'OTHER'
);

create type public.app_language as enum ('en', 'fr');

create type public.framework as enum ('LAW25', 'PIPEDA', 'PHIPA');

create type public.engagement_status as enum ('draft', 'active', 'review', 'closed');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  headcount_band public.headcount_band,
  primary_jurisdiction public.jurisdiction not null default 'QC',
  preferred_language public.app_language not null default 'fr',
  created_at timestamptz not null default now()
);

-- Profiles mirror auth.users and bind a user to one organization + role.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  role public.user_role not null default 'client',
  full_name text,
  created_at timestamptz not null default now()
);

create table public.engagements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  -- Frameworks in scope, e.g. {LAW25, PIPEDA, PHIPA}
  frameworks public.framework[] not null default '{LAW25}',
  status public.engagement_status not null default 'draft',
  start_date date not null default current_date,
  -- Data residency is scoped per engagement; defaults to the Canadian region.
  data_residency text not null default 'ca-central-1',
  created_at timestamptz not null default now()
);

create index engagements_organization_id_idx
  on public.engagements (organization_id);

-- ---------------------------------------------------------------------------
-- Helper: the organization of the requesting user.
-- SECURITY DEFINER so RLS policies can read profiles without recursion.
-- ---------------------------------------------------------------------------
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.engagements enable row level security;

-- Organizations: a user can see and update only their own organization.
create policy "org_select_own"
  on public.organizations for select
  using (id = public.current_org_id());

create policy "org_update_own"
  on public.organizations for update
  using (id = public.current_org_id() and public.current_user_role() = 'admin');

-- Profiles: a user can read their own row and others in the same organization;
-- a user may update only their own profile.
create policy "profiles_select_same_org"
  on public.profiles for select
  using (
    id = auth.uid()
    or organization_id = public.current_org_id()
  );

create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid());

-- Engagements: scoped to the user's organization.
create policy "engagements_select_own_org"
  on public.engagements for select
  using (organization_id = public.current_org_id());

create policy "engagements_insert_own_org"
  on public.engagements for insert
  with check (
    organization_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'practitioner')
  );

create policy "engagements_update_own_org"
  on public.engagements for update
  using (
    organization_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'practitioner')
  );

-- ---------------------------------------------------------------------------
-- Create a profile automatically when a new auth user signs up.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
