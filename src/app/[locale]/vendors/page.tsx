import { getTranslations, setRequestLocale } from "next-intl/server";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { Badge, jurisdictionTone } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Link, redirect } from "@/i18n/navigation";
import { supabaseEnv } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";
import { listVendors } from "@/lib/data/vendors";
import { deleteVendor } from "./actions";

export default async function VendorsPage({
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

  const t = await getTranslations("vendors");
  const tEnum = await getTranslations("enums");
  const tActions = await getTranslations("actions");
  const vendors = await listVendors();

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
            href="/vendors/new"
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

      {vendors.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">{t("empty")}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {vendors.map((v) => (
            <Card key={v.id} className="!p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-ink">
                      {v.name}
                    </h2>
                    {v.role && (
                      <span className="text-sm text-muted">· {v.role}</span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">
                      {tEnum(`residency.${v.physical_hosting_region}`)}
                    </Badge>
                    <Badge tone={jurisdictionTone(v.operator_jurisdiction)} dot>
                      {tEnum(`jurisdiction.${v.operator_jurisdiction}`)}
                    </Badge>
                    <Badge tone={v.due_diligence_completed ? "low" : "review"}>
                      {v.due_diligence_completed
                        ? t("ddOnFile")
                        : t("ddMissing")}
                    </Badge>
                  </div>
                  {v.notes && (
                    <p className="mt-2 text-sm text-ink-secondary">{v.notes}</p>
                  )}
                </div>
                {configured && (
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/vendors/${v.id}`}
                      className="rounded-tile px-2.5 py-1.5 text-xs font-medium text-indigo-dark hover:bg-tile-lavender"
                    >
                      {tActions("edit")}
                    </Link>
                    <DeleteButton
                      action={deleteVendor}
                      id={v.id}
                      confirmMessage={t("deleteConfirm")}
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
