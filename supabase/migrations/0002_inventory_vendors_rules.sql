-- MapleGuard — Phase 2 schema
-- DataAssets (the personal-information inventory), Vendors (service providers /
-- operators), and ComplianceRules (first-class, evaluable legal obligations,
-- seeded as reference data). All client-data tables are scoped per organization
-- via RLS; ComplianceRules are global reference data readable by any
-- authenticated user.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- Axis 1 of the exposure engine: where data physically sits.
create type public.data_residency as enum ('CANADA', 'UNITED_STATES', 'OTHER');

-- Axis 2 of the exposure engine: whose legal system can compel the operator.
-- Derived from the operator's corporate parent domicile, NOT hosting location.
create type public.operator_jurisdiction as enum (
  'CANADIAN',  -- Canadian-controlled operator
  'US_PARENT', -- US-domiciled parent (reachable under the US CLOUD Act)
  'FOREIGN'    -- other foreign-controlled operator
);

create type public.sensitivity_level as enum ('ordinary', 'sensitive', 'health');

create type public.rule_severity as enum ('low', 'medium', 'high', 'critical');

-- Machine-evaluable condition each rule checks for. Drives Phase 4 assessment
-- and Phase 5 artifact recommendations.
create type public.compliance_condition as enum (
  'PRIVACY_OFFICER_NAMED',
  'VENDOR_DUE_DILIGENCE',
  'CROSS_BORDER_TRANSFER',
  'BREACH_RESPONSE',
  'SAFEGUARDS',
  'DATA_INVENTORY'
);

-- ---------------------------------------------------------------------------
-- DataAsset: a category of personal information the organization holds.
-- ---------------------------------------------------------------------------
create table public.data_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  sensitivity public.sensitivity_level not null default 'ordinary',
  data_subjects text,         -- e.g. "employees", "customers", "patients"
  purpose text,               -- lawful basis / purpose of processing
  retention text,             -- retention period / policy
  created_at timestamptz not null default now()
);

create index data_assets_organization_id_idx
  on public.data_assets (organization_id);

-- ---------------------------------------------------------------------------
-- Vendor: a service provider / operator.
-- A vendor can host data in Canada while its parent is US-domiciled — the
-- entire point of the sovereignty question. We store both facts and the
-- derived operator jurisdiction.
-- ---------------------------------------------------------------------------
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  role text,                                   -- e.g. processor, sub-processor, operator
  physical_hosting_region public.data_residency not null default 'CANADA',
  operator_parent_domicile text not null default 'CA', -- ISO-ish country of the operator's parent
  operator_jurisdiction public.operator_jurisdiction not null default 'CANADIAN',
  due_diligence_completed boolean not null default false, -- has a documented assessment on file?
  notes text,
  created_at timestamptz not null default now()
);

create index vendors_organization_id_idx
  on public.vendors (organization_id);

-- ---------------------------------------------------------------------------
-- ComplianceRule: a first-class representation of a legal requirement.
-- Reference data (not user data). Obligations are stored bilingually.
-- ---------------------------------------------------------------------------
create table public.compliance_rules (
  id uuid primary key default gen_random_uuid(),
  framework public.framework not null,
  reference text not null,                 -- e.g. "Law 25 art. 3.3"
  obligation_en text not null,
  obligation_fr text not null,
  condition public.compliance_condition not null,
  default_severity public.rule_severity not null default 'medium',
  recommended_artifact text,               -- artifact type that closes the gap
  created_at timestamptz not null default now()
);

create index compliance_rules_condition_idx
  on public.compliance_rules (condition);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.data_assets enable row level security;
alter table public.vendors enable row level security;
alter table public.compliance_rules enable row level security;

-- DataAssets: any member of the organization may read and contribute.
create policy "data_assets_select_own_org"
  on public.data_assets for select
  using (organization_id = public.current_org_id());

create policy "data_assets_insert_own_org"
  on public.data_assets for insert
  with check (organization_id = public.current_org_id());

create policy "data_assets_update_own_org"
  on public.data_assets for update
  using (organization_id = public.current_org_id());

create policy "data_assets_delete_own_org"
  on public.data_assets for delete
  using (organization_id = public.current_org_id());

-- Vendors: same org-scoped contribution model.
create policy "vendors_select_own_org"
  on public.vendors for select
  using (organization_id = public.current_org_id());

create policy "vendors_insert_own_org"
  on public.vendors for insert
  with check (organization_id = public.current_org_id());

create policy "vendors_update_own_org"
  on public.vendors for update
  using (organization_id = public.current_org_id());

create policy "vendors_delete_own_org"
  on public.vendors for delete
  using (organization_id = public.current_org_id());

-- ComplianceRules: global reference data, readable by any authenticated user.
-- No insert/update/delete policy => only the service role (migrations/seeds)
-- can modify them.
create policy "compliance_rules_select_authenticated"
  on public.compliance_rules for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Seed ComplianceRules: key Law 25, PIPEDA, and PHIPA obligations.
-- References are recommendations with citations, not legal advice.
-- ---------------------------------------------------------------------------
insert into public.compliance_rules
  (framework, reference, obligation_en, obligation_fr, condition, default_severity, recommended_artifact)
values
  ('LAW25', 'Law 25, art. 3.1',
   'The person with the highest authority is responsible for protecting personal information and may delegate the role of Privacy Officer.',
   'La personne ayant la plus haute autorité est responsable de la protection des renseignements personnels et peut déléguer la fonction de responsable.',
   'PRIVACY_OFFICER_NAMED', 'high', 'privacy_officer_record'),

  ('LAW25', 'Law 25, art. 3.3',
   'The title and contact information of the Privacy Officer must be published and recorded.',
   'Le titre et les coordonnées du responsable de la protection des renseignements personnels doivent être publiés et consignés.',
   'PRIVACY_OFFICER_NAMED', 'high', 'privacy_officer_record'),

  ('LAW25', 'Law 25, art. 3.5',
   'A confidentiality incident must be handled, logged in a register, and reported where there is a risk of serious injury.',
   'Un incident de confidentialité doit être traité, consigné dans un registre et déclaré en cas de risque de préjudice sérieux.',
   'BREACH_RESPONSE', 'high', 'breach_response_runbook'),

  ('LAW25', 'Law 25, art. 17',
   'Before communicating personal information outside Québec, a privacy impact assessment of the transfer must be conducted (sensitivity, purpose, protections, and the legal framework of the receiving jurisdiction).',
   'Avant de communiquer des renseignements personnels à l''extérieur du Québec, une évaluation des facteurs relatifs à la vie privée du transfert doit être réalisée (sensibilité, fins, protections et cadre juridique de la juridiction réceptrice).',
   'CROSS_BORDER_TRANSFER', 'high', 'foreign_transfer_adequacy'),

  ('LAW25', 'Law 25, art. 18.3',
   'Personal information communicated to a service provider must be governed by a written contract with safeguards; documented due diligence is expected.',
   'Les renseignements personnels communiqués à un prestataire de services doivent être encadrés par un contrat écrit prévoyant des mesures de protection; une diligence raisonnable documentée est attendue.',
   'VENDOR_DUE_DILIGENCE', 'medium', 'vendor_due_diligence'),

  ('PIPEDA', 'PIPEDA, Principle 4.1 (Accountability)',
   'An organization is responsible for personal information under its control and must designate an individual accountable for compliance.',
   'Une organisation est responsable des renseignements personnels dont elle a la gestion et doit désigner une personne responsable de la conformité.',
   'PRIVACY_OFFICER_NAMED', 'high', 'privacy_officer_record'),

  ('PIPEDA', 'PIPEDA, Principle 4.1.3 (Transfers)',
   'When transferring personal information to a third party for processing, the organization must use contractual or other means to ensure a comparable level of protection.',
   'Lors du transfert de renseignements personnels à un tiers pour traitement, l''organisation doit recourir à des moyens contractuels ou autres pour assurer un niveau de protection comparable.',
   'VENDOR_DUE_DILIGENCE', 'medium', 'vendor_due_diligence'),

  ('PIPEDA', 'PIPEDA, Principle 4.7 (Safeguards)',
   'Personal information must be protected by security safeguards appropriate to its sensitivity.',
   'Les renseignements personnels doivent être protégés par des mesures de sécurité adaptées à leur degré de sensibilité.',
   'SAFEGUARDS', 'medium', 'data_inventory'),

  ('PHIPA', 'PHIPA, s. 12(1)',
   'A health information custodian must take reasonable steps to protect personal health information against theft, loss, and unauthorized use or disclosure.',
   'Le dépositaire de renseignements sur la santé doit prendre des mesures raisonnables pour protéger les renseignements personnels sur la santé contre le vol, la perte et l''utilisation ou la divulgation non autorisées.',
   'SAFEGUARDS', 'high', 'data_inventory'),

  ('PHIPA', 'PHIPA, s. 10(1)',
   'A custodian that uses an agent to handle personal health information must have information practices and agreements governing that handling.',
   'Le dépositaire qui recourt à un mandataire pour traiter des renseignements personnels sur la santé doit disposer de pratiques relatives à l''information et d''ententes encadrant ce traitement.',
   'VENDOR_DUE_DILIGENCE', 'medium', 'vendor_due_diligence');
