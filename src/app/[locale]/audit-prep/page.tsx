import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ReviewerForm } from "@/components/review/ReviewerForm";
import { redirect } from "@/i18n/navigation";
import { supabaseEnv } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/data/org";
import { listReviewers } from "@/lib/data/reviewers";
import { listAuditEntries, verifyChain } from "@/lib/data/audit";

export default async function AuditPrepPage({
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

  const t = await getTranslations("audit");
  const format = await getFormatter();
  const role = await getCurrentRole();
  const canManage = role === "practitioner" || role === "admin";

  const [reviewers, entries] = await Promise.all([
    listReviewers(),
    listAuditEntries(),
  ]);
  const verification = verifyChain(entries);

  return (
    <WorkspaceShell demoMode={!configured}>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-ink">
          {t("title")}
        </h1>
        <p className="mt-1 max-w-2xl text-ink-secondary">{t("subtitle")}</p>
      </div>

      {!configured && (
        <p className="mb-4 rounded-tile bg-review-bg px-4 py-3 text-sm text-review">
          {t("demoNotice")}
        </p>
      )}

      {/* Reviewers */}
      <Card className="mb-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("reviewersTitle")}
        </h2>
        <p className="mb-3 text-sm text-ink-secondary">
          {t("reviewersSubtitle")}
        </p>
        {reviewers.length === 0 ? (
          <p className="text-sm text-muted">{t("noReviewers")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {reviewers.map((r) => (
              <li key={r.id} className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-ink">{r.full_name}</span>
                <Badge tone="indigo">
                  {r.credential_type}
                  {r.credential_id ? ` · ${r.credential_id}` : ""}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        {canManage && (
          <div className="mt-4 border-t border-hairline pt-4">
            <ReviewerForm />
          </div>
        )}
      </Card>

      {/* Audit log */}
      <Card>
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("logTitle")}
        </h2>
        <p className="mb-3 text-sm text-ink-secondary">{t("logSubtitle")}</p>

        {entries.length > 0 && (
          <p
            className={`mb-4 rounded-tile px-4 py-3 text-sm font-medium ${
              verification.valid
                ? "bg-low-bg text-low"
                : "bg-elevated-bg text-elevated"
            }`}
          >
            {verification.valid
              ? t("chainValid", { count: verification.count })
              : t("chainInvalid", { seq: verification.brokenAtSeq ?? 0 })}
          </p>
        )}

        {entries.length === 0 ? (
          <p className="text-sm text-muted">{t("chainEmpty")}</p>
        ) : (
          <ol className="flex flex-col">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-hairline py-3 last:border-0"
              >
                <span className="font-mono text-xs text-muted">#{e.seq}</span>
                <span className="font-semibold text-ink">
                  {t(`events.${e.event_type}`)}
                </span>
                {e.reviewer_name && (
                  <span className="text-sm text-ink-secondary">
                    {t("by")} {e.reviewer_name}
                    {e.reviewer_credential ? ` (${e.reviewer_credential})` : ""}
                  </span>
                )}
                <span className="text-xs text-muted">
                  {format.dateTime(new Date(e.created_at), {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span
                  className="ml-auto font-mono text-[11px] text-muted"
                  title={e.entry_hash}
                >
                  {e.entry_hash.slice(0, 12)}…
                </span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </WorkspaceShell>
  );
}
