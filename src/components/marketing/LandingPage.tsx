import Link from "next/link";

interface LandingPageProps {
  locale: string;
}

const FEATURES = [
  {
    bg: "bg-tile-lavender",
    iconBg: "bg-indigo",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-white">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>
    ),
    title: "Data residency mapping",
    description:
      "A two-axis exposure map plots physical hosting region against operator jurisdiction — making the CLOUD Act question answerable at a glance.",
  },
  {
    bg: "bg-tile-blue",
    iconBg: "bg-indigo",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-white">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
    title: "Risk assessment engine",
    description:
      "Automated findings against Law 25, PIPEDA, and PHIPA rules. Each gap is a signal until a credentialed practitioner confirms it — no false authority.",
  },
  {
    bg: "bg-tile-peach",
    iconBg: "bg-indigo",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-white">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    ),
    title: "AI-drafted evidence",
    description:
      "Claude generates privacy impact assessments, transfer adequacy reports, vendor due-diligence files, and breach runbooks from your engagement data.",
  },
  {
    bg: "bg-tile-lavender",
    iconBg: "bg-indigo",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-white">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    ),
    title: "Tamper-evident audit log",
    description:
      "Every sign-off is append-only and hash-chained. Named, credentialed reviewers confirm findings — giving you a defensible record for any regulator.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Map your program",
    description:
      "Add data assets, vendors, and data flows. MapleGuard models your exposure across residency and jurisdiction automatically.",
  },
  {
    number: "02",
    title: "Run the assessment",
    description:
      "The engine evaluates your program against Law 25, PIPEDA, and PHIPA rules and surfaces indicative findings for credentialed review.",
  },
  {
    number: "03",
    title: "Sign off and export",
    description:
      "Practitioners confirm findings and approve AI-drafted artifacts. Every decision is recorded immutably. Export PDF or DOCX for any audit.",
  },
];

const FRAMEWORKS = [
  {
    badge: "Law 25",
    badgeCls: "bg-low-bg text-low",
    name: "Loi 25 (Quebec)",
    description:
      "The most demanding privacy framework in Canada. Requires a designated privacy officer, cross-border transfer adequacy assessments, and a privacy impact assessment for every new system handling personal information.",
    checks: [
      "Privacy officer accountability",
      "Cross-border transfer PIA",
      "Data inventory & register",
    ],
  },
  {
    badge: "PIPEDA",
    badgeCls: "bg-tile-lavender text-indigo",
    name: "PIPEDA (Federal)",
    description:
      "Canada's federal private-sector privacy law. Applies to organizations collecting, using, or disclosing personal information in the course of commercial activities across provinces.",
    checks: [
      "Ten fair information principles",
      "Meaningful consent",
      "Safeguard obligations",
    ],
  },
  {
    badge: "PHIPA",
    badgeCls: "bg-tile-blue text-ink",
    name: "PHIPA (Ontario)",
    description:
      "Ontario's health privacy legislation. Applies to health information custodians handling personal health information, with strict breach-notification and consent requirements.",
    checks: [
      "Custodian obligations",
      "Consent & express authority",
      "Breach notification",
    ],
  },
];

export function LandingPage({ locale }: LandingPageProps) {
  const loginHref = `/${locale}/login`;
  const demoHref = `/${locale}/dashboard`;

  return (
    <div className="min-h-screen bg-white font-sans text-ink antialiased">
      {/* ── Top navigation ── */}
      <header className="sticky top-0 z-50 border-b border-hairline bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-tile bg-indigo font-display text-sm font-bold text-white">
              M
            </span>
            <div>
              <div className="font-display text-base font-bold leading-none text-ink">
                MapleGuard
              </div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                by Auxlo
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-ink-secondary sm:flex">
            <a
              href="#features"
              className="transition-colors hover:text-ink"
            >
              Features
            </a>
            <a
              href="#frameworks"
              className="transition-colors hover:text-ink"
            >
              Frameworks
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-ink"
            >
              How it works
            </a>
          </nav>

          <Link
            href={loginHref}
            className="rounded-tile bg-indigo px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-dark"
          >
            Sign in →
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-tile-lavender/70 to-white pb-28 pt-24">
        {/* Subtle grid pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, #6e6feb0a 1px, transparent 1px), linear-gradient(to bottom, #6e6feb0a 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-1.5 shadow-tile">
            <span className="h-2 w-2 rounded-full bg-low" />
            <span className="font-mono text-xs text-ink-secondary">
              Canadian-operated · Data hosted in ca-central-1
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-8 font-display text-5xl font-bold leading-[1.15] text-ink sm:text-6xl">
            Privacy compliance
            <br />
            <span className="text-indigo">built for Canada.</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-secondary">
            MapleGuard is the privacy program engine for Canadian organizations.
            Manage Law&nbsp;25, PIPEDA, and PHIPA obligations — bilingual,
            human-reviewed, and audit-ready from day one.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={loginHref}
              className="w-full rounded-tile bg-indigo px-8 py-3.5 text-center font-semibold text-white shadow-tile transition-colors hover:bg-indigo-dark sm:w-auto"
            >
              Start your program
            </Link>
            <Link
              href={demoHref}
              className="w-full rounded-tile border border-hairline bg-white px-8 py-3.5 text-center font-semibold text-ink-secondary transition-colors hover:bg-hairline/40 sm:w-auto"
            >
              Explore demo workspace
            </Link>
          </div>

          {/* Framework pills */}
          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {[
              { label: "Loi 25 (Quebec)", cls: "text-low" },
              { label: "PIPEDA (Federal)", cls: "text-indigo" },
              { label: "PHIPA (Ontario)", cls: "text-ink-secondary" },
            ].map((fw) => (
              <span
                key={fw.label}
                className={`rounded-full border border-hairline bg-white px-4 py-1 text-sm font-medium shadow-tile ${fw.cls}`}
              >
                {fw.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-white py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-indigo">
              Features
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
              Everything your privacy program needs
            </h2>
            <p className="mt-4 text-ink-secondary">
              From first inventory to final sign-off — MapleGuard covers the
              full compliance cycle.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group rounded-card border border-hairline p-7 shadow-soft transition-shadow hover:shadow-[0_4px_40px_rgba(110,111,235,0.12)] ${f.bg}`}
              >
                <div
                  className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-tile ${f.iconBg}`}
                >
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        className="border-y border-hairline bg-hairline/20 py-28"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-indigo">
              How it works
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
              From onboarding to audit-ready
            </h2>
            <p className="mt-4 text-ink-secondary">
              Three phases. Every deliverable recorded. Nothing presumed final
              until a human signs off.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.number} className="relative">
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute left-full top-10 hidden w-6 border-t border-dashed border-hairline sm:block"
                    style={{ marginLeft: "12px", width: "calc(100% - 100% + 24px)" }}
                    aria-hidden
                  />
                )}
                <div className="rounded-card border border-hairline bg-white p-8 shadow-soft">
                  <div className="font-mono text-4xl font-bold text-hairline">
                    {step.number}
                  </div>
                  <div className="mt-1 h-0.5 w-8 rounded-full bg-indigo" />
                  <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Framework coverage ── */}
      <section id="frameworks" className="bg-white py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-indigo">
              Frameworks
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
              Law 25. PIPEDA. PHIPA.
            </h2>
            <p className="mt-4 text-ink-secondary">
              Treated as binding law in the data model — not checkboxes.
              MapleGuard knows the obligations and keeps you accountable to them.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {FRAMEWORKS.map((fw) => (
              <div
                key={fw.badge}
                className="rounded-card border border-hairline bg-white p-8 shadow-soft"
              >
                <span
                  className={`inline-block rounded-full px-3 py-1 font-mono text-xs font-semibold ${fw.badgeCls}`}
                >
                  {fw.badge}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                  {fw.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                  {fw.description}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {fw.checks.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-ink-secondary"
                    >
                      <span className="mt-px font-semibold text-low">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="border-y border-hairline bg-hairline/20 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: "🇨🇦",
                title: "Canadian-operated",
                body: "Infrastructure, team, and legal obligations are all rooted in Canada. No US-parent exposure on our end.",
              },
              {
                icon: "🔒",
                title: "Data in ca-central-1",
                body: "Your engagement data stays in Canada. Physical residency in AWS ca-central-1 by default.",
              },
              {
                icon: "👤",
                title: "Human review required",
                body: "AI outputs are signals. A credentialed practitioner must confirm every finding before it becomes authoritative.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-tile bg-white shadow-tile text-2xl">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="bg-ink py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to make compliance manageable?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[#8b95a6]">
            MapleGuard is invite-only. Sign in to your workspace or reach out to
            get your organization onboarded.
          </p>
          <div className="mt-10">
            <Link
              href={loginHref}
              className="inline-block rounded-tile bg-indigo px-10 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-dark"
            >
              Sign in to your workspace →
            </Link>
          </div>
          <p className="mt-8 font-mono text-xs text-[#3a4453]">
            Documentation and recommendations only. Not legal advice.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-hairline bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-indigo font-display text-xs font-bold text-white">
              M
            </span>
            <span className="font-display font-bold text-ink">MapleGuard</span>
            <span className="text-hairline">|</span>
            <span className="text-sm text-muted">by Auxlo</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-low" />
            <span>Canadian-operated · Region: ca-central-1</span>
          </div>
          <p className="text-xs text-muted">
            Not legal advice. © {new Date().getFullYear()} Auxlo
          </p>
        </div>
      </footer>
    </div>
  );
}
