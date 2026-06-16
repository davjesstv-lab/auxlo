import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { Badge, severityTone } from "@/components/ui/Badge";
import { Link, redirect } from "@/i18n/navigation";
import { supabaseEnv } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/data/org";
import { getFinding } from "@/lib/data/findings";
import { listReviewers } from "@/lib/data/reviewers";
import { PromotionForm } from "@/components/review/PromotionForm";
import { confirmFinding } from "../actions";

export default async function FindingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const configured = supabaseEnv.isConfigured;
  if (configured && !(await getUser())) {
    redirect({ href: "/login", locale });
  }

  const finding = await getFinding(id);
  if (!finding) notFound();

  const t = await getTranslations("findings");
  const tArtifacts = await getTranslations("artifacts");
  const tPromote = await getTranslations("promote");

  // Promotion is available only for persisted findings (configured mode), to
  // practitioners, while the finding is still indicative.
  const role = configured ? await getCurrentRole() : null;
  const canPromote =
    configured &&
    (role === "practitioner" || role === "admin") &&
    finding.status === "indicative";
  const reviewers = canPromote ? await listReviewers() : [];

  const obligation =
    finding.rule &&
    (locale === "fr"
      ? finding.rule.obligation_fr
      : finding.rule.obligation_en);

  return (
    <WorkspaceShell demoMode={!configured}>
      <Link
        href="/risk"
        className="mb-4 inline-block text-sm text-indigo hover:underline"
      >
        ← {t("detailBack")}
      </Link>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge tone={severityTone(finding.severity)} dot>
          {t(`severity.${finding.severity}`)}
        </Badge>
        <Badge tone={finding.status === "confirmed" ? "low" : "review"}>
          {finding.status === "confirmed"
            ? t("status.confirmed")
            : t("indicativeBadge")}
        </Badge>
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
          {t(`target.${finding.target_type}`)}
        </span>
      </div>

      <h1 className="font-display text-3xl font-bold text-ink">
        {t(`conditions.${finding.condition}`)}
      </h1>
      {finding.target_label && (
        <p className="mt-1 text-ink-secondary">{finding.target_label}</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Section label={t("whyLabel")}>
            <p className="text-sm text-ink-secondary">
              {t(`why.${finding.condition}`)}
            </p>
          </Section>

          <div className="my-5 border-t border-hairline" />

          <Section label={t("obligationLabel")}>
            {finding.rule ? (
              <>
                <p className="text-sm text-ink-secondary">{obligation}</p>
                <p className="mt-2 font-mono text-xs uppercase tracking-wide text-indigo-dark">
                  {t("citationLabel")}: {finding.rule.reference}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">{t("noRule")}</p>
            )}
          </Section>
        </Card>

        <div className="flex flex-col gap-6">
          {finding.recommended_artifact && (
            <Card>
              <Section label={t("recommendedLabel")}>
                <p className="font-display font-semibold text-ink">
                  {tArtifacts(finding.recommended_artifact)}
                </p>
              </Section>
            </Card>
          )}
          {finding.status === "confirmed" ? (
            <Card className="bg-low-bg/40">
              <p className="text-sm text-low">{tPromote("confirmedNote")}</p>
            </Card>
          ) : canPromote ? (
            <Card>
              <PromotionForm
                action={confirmFinding}
                targetId={finding.id}
                reviewers={reviewers}
                submitLabel={tPromote("confirmFinding")}
              />
            </Card>
          ) : (
            <Card className="bg-review-bg/30">
              <p className="text-sm text-ink-secondary">{t("reviewNote")}</p>
            </Card>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-muted">
        {label}
      </p>
      {children}
    </div>
  );
}
