import { getTranslations, setRequestLocale } from "next-intl/server";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { GenerateButtons } from "@/components/evidence/GenerateButtons";
import { Link, redirect } from "@/i18n/navigation";
import { supabaseEnv } from "@/lib/supabase/config";
import { anthropicEnv } from "@/lib/ai/anthropic";
import { getUser } from "@/lib/supabase/server";
import { listArtifacts } from "@/lib/data/artifacts";
import { ARTIFACT_TYPES } from "@/lib/ai/artifacts";

export default async function EvidencePage({
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
  const canGenerate = configured && anthropicEnv.isConfigured;

  const t = await getTranslations("evidence");
  const tArtifacts = await getTranslations("artifacts");
  const artifacts = await listArtifacts();

  return (
    <WorkspaceShell demoMode={!configured}>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-ink">
          {t("title")}
        </h1>
        <p className="mt-1 max-w-2xl text-ink-secondary">{t("subtitle")}</p>
      </div>

      {!canGenerate && (
        <p className="mb-4 rounded-tile bg-review-bg px-4 py-3 text-sm text-review">
          {t("demoNotice")}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {ARTIFACT_TYPES.map((type) => {
          const versions = artifacts.filter((a) => a.type === type);
          return (
            <Card key={type} className="flex flex-col">
              <h2 className="font-display text-lg font-semibold text-ink">
                {tArtifacts(type)}
              </h2>
              <p className="mt-1 text-sm text-ink-secondary">
                {t(`descriptions.${type}`)}
              </p>

              <div className="mt-4 flex-1">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
                  {t("versionsLabel")}
                </p>
                {versions.length === 0 ? (
                  <p className="mt-1 text-sm text-muted">{t("noVersions")}</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1">
                    {versions.map((a) => (
                      <li key={a.id}>
                        <Link
                          href={`/evidence/${a.id}`}
                          className="flex items-center gap-2 text-sm text-indigo-dark hover:underline"
                        >
                          <span className="font-mono text-xs uppercase">
                            {a.language}
                          </span>
                          <span>{t("versionTag", { n: a.version })}</span>
                          <Badge
                            tone={a.review_status === "approved" ? "low" : "review"}
                          >
                            {a.review_status === "approved"
                              ? t("approvedTag")
                              : t("draftTag")}
                          </Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {canGenerate && (
                <div className="mt-4 border-t border-hairline pt-3">
                  <GenerateButtons type={type} />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-muted">{t("aiNoticeShort")}</p>
    </WorkspaceShell>
  );
}
