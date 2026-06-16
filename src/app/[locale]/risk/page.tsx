import { getTranslations, setRequestLocale } from "next-intl/server";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { Card, SummaryTile } from "@/components/ui/Card";
import { Badge, severityTone } from "@/components/ui/Badge";
import {
  RunAssessmentButton,
  PrivacyOfficerForm,
} from "@/components/findings/AssessmentControls";
import { Link, redirect } from "@/i18n/navigation";
import { supabaseEnv } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";
import { listFindings } from "@/lib/data/findings";

export default async function RiskRegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const configured = supabaseEnv.isConfigured;
  if (configured && !(await getUser())) {
    redirect({ href: "/login", locale });
  }

  const t = await getTranslations("findings");
  const findings = await listFindings();

  const indicative = findings.filter((f) => f.status === "indicative").length;
  const confirmed = findings.filter((f) => f.status === "confirmed").length;
  const hasAccountabilityGap = findings.some(
    (f) => f.condition === "PRIVACY_OFFICER_NAMED",
  );

  return (
    <WorkspaceShell demoMode={!configured}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {t("title")}
          </h1>
          <p className="mt-1 max-w-2xl text-ink-secondary">{t("subtitle")}</p>
        </div>
        {configured && <RunAssessmentButton />}
      </div>

      {!configured && (
        <p className="mb-4 rounded-tile bg-review-bg px-4 py-3 text-sm text-review">
          {t("demoNotice")}
        </p>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryTile
          label={t("summary.total")}
          value={String(findings.length)}
          pastel="lavender"
        />
        <SummaryTile
          label={t("summary.indicative")}
          value={String(indicative)}
          pastel="peach"
        />
        <SummaryTile
          label={t("summary.confirmed")}
          value={String(confirmed)}
          pastel="blue"
        />
      </div>

      {configured && hasAccountabilityGap && (
        <Card className="mb-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            {t("addOfficerTitle")}
          </h2>
          <p className="mb-4 text-sm text-ink-secondary">
            {t("addOfficerHint")}
          </p>
          <PrivacyOfficerForm />
        </Card>
      )}

      {findings.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">{t("empty")}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {findings.map((f) => (
            <Link key={f.id} href={`/risk/${f.id}`} className="block">
              <Card className="!p-5 transition-shadow hover:shadow-tile">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={severityTone(f.severity)} dot>
                    {t(`severity.${f.severity}`)}
                  </Badge>
                  <Badge tone={f.status === "confirmed" ? "low" : "review"}>
                    {t(`status.${f.status}`)}
                  </Badge>
                  <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
                    {t(`target.${f.target_type}`)}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-lg font-semibold text-ink">
                  {t(`conditions.${f.condition}`)}
                </h2>
                {f.target_label && (
                  <p className="text-sm text-ink-secondary">{f.target_label}</p>
                )}
                {f.rule && (
                  <p className="mt-1 font-mono text-xs text-muted">
                    {f.rule.reference}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
}
