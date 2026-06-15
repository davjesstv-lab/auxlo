import { getTranslations, setRequestLocale } from "next-intl/server";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { Badge, sensitivityTone } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Link, redirect } from "@/i18n/navigation";
import { supabaseEnv } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";
import { listDataAssets } from "@/lib/data/dataAssets";
import { deleteDataAsset } from "./actions";

export default async function InventoryPage({
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

  const t = await getTranslations("inventory");
  const tEnum = await getTranslations("enums");
  const tActions = await getTranslations("actions");
  const assets = await listDataAssets();

  return (
    <WorkspaceShell demoMode={!configured}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {t("title")}
          </h1>
          <p className="mt-1 max-w-2xl text-ink-secondary">{t("subtitle")}</p>
        </div>
        {configured && (
          <Link
            href="/inventory/new"
            className="shrink-0 rounded-tile bg-indigo px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-dark"
          >
            {tActions("add")}
          </Link>
        )}
      </div>

      {!configured && (
        <p className="mb-4 rounded-tile bg-review-bg px-4 py-3 text-sm text-review">
          {t("demoNotice")}
        </p>
      )}

      {assets.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">{t("empty")}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {assets.map((a) => (
            <Card key={a.id} className="!p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-ink">
                      {a.name}
                    </h2>
                    <Badge tone={sensitivityTone(a.sensitivity)} dot>
                      {tEnum(`sensitivity.${a.sensitivity}`)}
                    </Badge>
                  </div>
                  {a.description && (
                    <p className="mt-1 text-sm text-ink-secondary">
                      {a.description}
                    </p>
                  )}
                  <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-3">
                    {a.data_subjects && (
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted">
                          {t("fields.subjects")}
                        </dt>
                        <dd className="text-ink-secondary">{a.data_subjects}</dd>
                      </div>
                    )}
                    {a.purpose && (
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted">
                          {t("fields.purpose")}
                        </dt>
                        <dd className="text-ink-secondary">{a.purpose}</dd>
                      </div>
                    )}
                    {a.retention && (
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted">
                          {t("fields.retention")}
                        </dt>
                        <dd className="text-ink-secondary">{a.retention}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                {configured && (
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/inventory/${a.id}`}
                      className="rounded-tile px-2.5 py-1.5 text-xs font-medium text-indigo-dark hover:bg-tile-lavender"
                    >
                      {tActions("edit")}
                    </Link>
                    <DeleteButton
                      action={deleteDataAsset}
                      id={a.id}
                      confirmMessage={tActions("delete")}
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
}
