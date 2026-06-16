-- MapleGuard — Phase 3 schema
-- DataFlows link a DataAsset to a Vendor. This is where cross-border exposure
-- is computed and stored. The exposure level is derived by the application
-- engine (lib/exposure/engine.ts) from the vendor's physical hosting region
-- (Axis 1) and derived operator jurisdiction (Axis 2), then persisted here.

create type public.exposure_level as enum ('LOW', 'REVIEW', 'ELEVATED');

create table public.data_flows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  data_asset_id uuid not null references public.data_assets (id) on delete cascade,
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  purpose text,
  -- Resulting exposure level, computed and stored when the flow is saved.
  exposure_level public.exposure_level not null default 'LOW',
  created_at timestamptz not null default now(),
  unique (data_asset_id, vendor_id)
);

create index data_flows_organization_id_idx
  on public.data_flows (organization_id);
create index data_flows_vendor_id_idx on public.data_flows (vendor_id);
create index data_flows_data_asset_id_idx on public.data_flows (data_asset_id);

-- Row-level security: org-scoped, contribution model consistent with Phase 2.
alter table public.data_flows enable row level security;

create policy "data_flows_select_own_org"
  on public.data_flows for select
  using (organization_id = public.current_org_id());

create policy "data_flows_insert_own_org"
  on public.data_flows for insert
  with check (organization_id = public.current_org_id());

create policy "data_flows_update_own_org"
  on public.data_flows for update
  using (organization_id = public.current_org_id());

create policy "data_flows_delete_own_org"
  on public.data_flows for delete
  using (organization_id = public.current_org_id());
