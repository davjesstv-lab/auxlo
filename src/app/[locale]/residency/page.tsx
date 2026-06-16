import { getTranslations, setRequestLocale } from "next-intl/server";
import { WorkspaceShell } from "@/components/shell/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { QuadrantGrid } from "@/components/exposure/QuadrantGrid";
import { DataFlowForm } from "@/components/exposure/DataFlowForm";
import { ExportLinks } from "@/components/export/ExportLinks";
import { redirect } from "@/i18n/navigation";
import { supabaseEnv } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";
import { listVendors } from "@/lib/data/vendors";
import { listDataAssets } from "@/lib/data/dataAssets";
import { listDataFlows } from "@/lib/data/dataFlows";
import { computeExposure, exposureTone, isCrossBorder } from "@/lib/exposure/engine";
import type { DataFlowWithRelations } from "@/lib/domain/types";
import { deleteDataFlow } from "./actions";

export default async function ResidencyPage({
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

  const t = await getTranslations("residency");
  const tExp = await getTranslations("exposure");
  const [vendors, assets, flows] = await Promise.all([
    listVendors(),
    listDataAssets(),
    listDataFlows(),
  ]);
  const crossBorder = flows.filter((f) => isCrossBorder(f.exposure_level));

  function FlowRow({ flow }: { flow: DataFlowWithRelations }) {
    const { reason } = computeExposure(
      flow.physical_hosting_region,
      flow.operator_jurisdiction,
    );
    return (
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline py-3 last:border-0">
        <div className="min-w-0">
          <p className="text-sm text-ink">
            <span className="font-semibold">{flow.data_asset_name}</span>{" "}
            <span className="text-muted">{t("flowsTo")}</span>{" "}
            <span className="font-semibold">{flow.vendor_name}</span>
          </p>
          <p className="mt-0.5 text-xs text-muted">{tExp(`reasons.${reason}`)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={exposureTone(flow.exposure_level)} dot>
            {tExp(`levels.${flow.exposure_level}`)}
          </Badge>
          {configured && (
            <DeleteButton
              action={deleteDataFlow}
              id={flow.id}
              confirmMessage={t("deleteConfirm")}
            />
          )}
        </div>
      </div>
    );
  }

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

      <Card className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            {t("quadrantTitle")}
          </h2>
          <ExportLinks basePath={`/${locale}/residency/export`} />
        </div>
        <QuadrantGrid vendors={vendors} />
        <p className="mt-4 text-xs text-muted">{t("exportHint")}</p>
      </Card>

      {crossBorder.length > 0 && (
        <Card className="mb-6 border-review/40 bg-review-bg/30">
          <h2 className="font-display text-lg font-semibold text-ink">
            {t("crossBorderTitle")}
          </h2>
          <p className="mb-2 text-sm text-ink-secondary">
            {t("crossBorderSubtitle")}
          </p>
          {crossBorder.map((f) => (
            <FlowRow key={f.id} flow={f} />
          ))}
        </Card>
      )}

      <Card>
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("flowsTitle")}
        </h2>
        <p className="mb-2 text-sm text-ink-secondary">{t("flowsSubtitle")}</p>

        {configured && (
          <div className="mb-4 rounded-tile bg-hairline/40 p-4">
            <DataFlowForm assets={assets} vendors={vendors} />
          </div>
        )}

        {flows.length === 0 ? (
          <p className="text-sm text-muted">{t("noFlows")}</p>
        ) : (
          <div>
            {flows.map((f) => (
              <FlowRow key={f.id} flow={f} />
            ))}
          </div>
        )}
      </Card>
    </WorkspaceShell>
  );
}
