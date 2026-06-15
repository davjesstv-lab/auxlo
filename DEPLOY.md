# Deploying MapleGuard

Two paths: a **demo** anyone can click through, and a **real instance** your
client logs into and uses with their data.

---

## A. Demo (zero config) — share a link today

The app runs in demo mode when no environment variables are set: sample data,
the full UI, both languages, exposure-map export — with write actions, AI
drafting, and sign-off clearly gated behind a demo banner.

1. Click **Deploy with Vercel** in the [README](./README.md) (or import the repo
   at <https://vercel.com/new>). Deploy from the branch that contains the code.
2. **Leave all environment variables blank.**
3. Open the deployed URL → it lands on the live workspace in demo mode.

No personal information is involved, so there is nothing to secure. This is the
right surface for a walkthrough, sales conversation, or feedback round.

---

## B. Real instance — client logs in and uses it

Once real personal information is involved you are operating a Law 25 system.
Data residency is the core promise, so **provision in a Canadian region**.

### 1. Supabase (Canadian region)
1. Create a Supabase project in **Canada (`ca-central-1`)**. The region is a
   product guarantee and is surfaced to users in the app footer.
2. In the SQL editor, run the migrations **in order**:
   `supabase/migrations/0001_init.sql` → … → `0006_signoff_audit_log.sql`.
3. From Project Settings → API, copy the **Project URL** and the **anon key**.

### 2. Anthropic (AI drafting)
Create an API key at <https://console.anthropic.com>. Drafting defaults to
`claude-opus-4-8`; override with `ANTHROPIC_MODEL` if needed.

### 3. Environment variables (set on Vercel / your host)
See [`.env.example`](./.env.example). Required for a real instance:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_SUPABASE_REGION` | `ca-central-1` (or your Canadian region) |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `ANTHROPIC_MODEL` | optional; defaults to `claude-opus-4-8` |

Redeploy after setting them — with these present, the app leaves demo mode and
enforces authentication.

### 4. Onboard the client (create org + users)
There is intentionally no in-app way to create the first organization or assign
roles. Do it once via SQL:

1. Invite the client's users: Supabase → **Authentication → Users → Invite user**
   (they set a password via the email link).
2. In the SQL editor, run [`supabase/seed/onboard.sql`](./supabase/seed/onboard.sql)
   after replacing the placeholders — it creates the organization and attaches
   each user with a role (`admin` / `practitioner` / `client`).
3. The credentialed reviewer then records their credential in the app under
   **Audit prep → Reviewers**; that reviewer is required to confirm findings
   and approve artifacts.

### 5. Verify
- Sign in as the client → you should land in the workspace (not the demo banner).
- The footer shows the Canadian region.
- Add a vendor with a US parent hosting in Canada → the residency map flags it
  **Review** (CLOUD Act). Run an assessment → indicative findings appear.
- As the practitioner, confirm a finding → it shows as confirmed and a new
  entry appears in **Audit prep → Audit log** with the chain marked verified.

### Roles at a glance
- **admin** — manages the organization.
- **practitioner** — the only role that can **sign off** (confirm findings,
  approve artifacts); every promotion writes an immutable record to the
  append-only, hash-chained audit log.
- **client** — reads and contributes; cannot confirm findings.

### Notes
- The audit log is append-only at the **database** level (insert/select-only
  policies + revoked update/delete grants), so it is tamper-evident in
  production, not just in the UI.
- No secrets belong in source — everything sensitive comes from the environment.
