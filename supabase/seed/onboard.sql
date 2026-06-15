-- MapleGuard — client onboarding seed
-- Run this in the Supabase SQL editor AFTER applying migrations 0001–0006.
-- The SQL editor runs as a privileged role and bypasses RLS, which is what
-- you want for first-time setup (there is no in-app way to create the first
-- organization or assign roles — that is intentional).
--
-- Replace every placeholder ('ACME Inc.', emails, etc.) before running.

-- ---------------------------------------------------------------------------
-- 1) Create the client organization.
--    headcount_band: '1-19' | '20-49' | '50-99' | '100-200' | '200+'
--    primary_jurisdiction: 'QC' | 'ON' | 'BC' | ... | 'OTHER'
--    preferred_language: 'fr' | 'en'  (drives the default UI language)
-- ---------------------------------------------------------------------------
insert into public.organizations
  (name, sector, headcount_band, primary_jurisdiction, preferred_language)
values
  ('ACME Inc.', 'Technology', '50-99', 'QC', 'fr')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 2) (Optional) Create an engagement for the organization.
-- ---------------------------------------------------------------------------
-- insert into public.engagements (organization_id, name, frameworks, status)
-- select id, 'Law 25 readiness', '{LAW25,PIPEDA}'::public.framework[], 'active'
-- from public.organizations where name = 'ACME Inc.';

-- ---------------------------------------------------------------------------
-- 3) Link users to the organization and set their role.
--    Users must already exist in auth.users — invite them from
--    Supabase → Authentication → Users → "Invite user" (they set a password
--    via the email link), or have them sign in once. The signup trigger
--    creates a profile with a NULL organization and the 'client' role; the
--    statements below attach them to the org and grant the right role.
--
--    Roles:
--      'admin'        — full management of the organization
--      'practitioner' — can review and SIGN OFF (confirm findings, approve artifacts)
--      'client'       — read and contribute, cannot confirm findings
-- ---------------------------------------------------------------------------

-- Org administrator:
update public.profiles
set organization_id = (select id from public.organizations where name = 'ACME Inc.' limit 1),
    role = 'admin'
where id = (select id from auth.users where email = 'owner@acme.example' limit 1);

-- Credentialed practitioner (the only role that can promote findings/artifacts):
update public.profiles
set organization_id = (select id from public.organizations where name = 'ACME Inc.' limit 1),
    role = 'practitioner'
where id = (select id from auth.users where email = 'practitioner@firm.example' limit 1);

-- Additional client contributors (repeat as needed):
-- update public.profiles
-- set organization_id = (select id from public.organizations where name = 'ACME Inc.' limit 1),
--     role = 'client'
-- where id = (select id from auth.users where email = 'staff@acme.example' limit 1);

-- After this, the practitioner records their credential (CISA/CRISC/etc.) in
-- the app under "Audit prep → Reviewers" — that reviewer is then selectable
-- when promoting findings and approving artifacts.
