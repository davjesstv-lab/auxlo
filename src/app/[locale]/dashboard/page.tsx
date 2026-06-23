import { getTranslations, setRequestLocale } from "next-intl/server";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { Card, SummaryTile } from "@/components/ui/Card";
import { supabaseEnv } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/data/org";
import { redirect } from "@/i18n/navigation";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Enforce authentication when Supabase is configured. In demo mode (no env)
  // the workspace renders so the shell and design system remain previewable.
  if (supabaseEnv.isConfigured) {
    const user = await getUser();
    if (!user) {
      redirect({ href: "/login", locale });
    }
    // Invite-only: an authenticated account with no organization (e.g. one
    // that self-registered) gets a clear message, not an empty workspace.
    if (!(await getCurrentOrganization())) {
      const tAuth = await getTranslations("auth");
      return (
        <div className="flex min-h-screen items-center justify-center bg-white px-6">
          <div className="max-w-sm rounded-card border border-hairline bg-white p-8 text-center shadow-soft">
            <h1 className="font-display text-2xl font-bold text-ink">
              {tAuth("noOrgTitle")}
            </h1>
            <p className="mt-2 text-sm text-ink-secondary">
              {tAuth("noOrgBody")}
            </p>
          </div>
        </div>
      );
    }
  }

  const t = await getTranslations("overview");
  const tCommon = await getTranslations("common");

  return (
    <WorkspaceShell demoMode={!supabaseEnv.isConfigured}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink">
          {t("title")}
        </h1>
        <p className="mt-1 text-ink-secondary">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile
          label={t("tiles.frameworks.label")}
          value={t("tiles.frameworks.value")}
          pastel="lavender"
        />
        <SummaryTile
          label={t("tiles.residency.label")}
          value={t("tiles.residency.value")}
          pastel="blue"
        />
        <SummaryTile
          label={t("tiles.findings.label")}
          value={t("tiles.findings.value")}
          hint={t("tiles.findings.hint")}
          pastel="peach"
        />
        <SummaryTile
          label={t("tiles.signoff.label")}
          value={t("tiles.signoff.value")}
          pastel="lavender"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            {t("exposureTitle")}
          </h2>
          <p className="mt-2 text-sm text-ink-secondary">
            {t("exposurePlaceholder")}
          </p>
        </Card>
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">
              {t("findingsTitle")}
            </h2>
            <span className="rounded-full bg-review-bg px-2.5 py-1 text-[11px] font-semibold text-review">
              {tCommon("draftBadge")}
            </span>
          </div>
          <p className="mt-2 text-sm text-ink-secondary">
            {t("findingsPlaceholder")}
          </p>
        </Card>
      </div>

      <p className="mt-6 text-xs text-muted">{tCommon("notLegalAdvice")}</p>
    </WorkspaceShell>
  );
}
