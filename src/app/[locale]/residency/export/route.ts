import { getTranslations } from "next-intl/server";
import { supabaseEnv } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";
import { listVendors } from "@/lib/data/vendors";
import { listDataFlows } from "@/lib/data/dataFlows";
import { buildExposureBlocks, type ExposureLabels } from "@/lib/export/exposureMap";
import { blocksToDocx } from "@/lib/export/docx";
import { blocksToPdf } from "@/lib/export/pdf";
import { fileResponse, parseFormat } from "@/lib/export/response";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const format = parseFormat(request.url);

  // Exposure map is exportable in demo mode too (it uses demo data); when
  // Supabase is configured, require authentication.
  if (supabaseEnv.isConfigured && !(await getUser())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [vendors, flows] = await Promise.all([listVendors(), listDataFlows()]);

  const t = await getTranslations({ locale, namespace: "residency" });
  const tExp = await getTranslations({ locale, namespace: "exposure" });
  const tEnum = await getTranslations({ locale, namespace: "enums" });

  const labels: ExposureLabels = {
    title: t("quadrantTitle"),
    hint: t("exportHint"),
    axisCaption: `${tExp("axisResidency")} / ${tExp("axisJurisdiction")}`,
    residency: {
      CANADA: tEnum("residency.CANADA"),
      UNITED_STATES: tEnum("residency.UNITED_STATES"),
      OTHER: tEnum("residency.OTHER"),
    },
    jurisdiction: {
      CANADIAN: tEnum("jurisdiction.CANADIAN"),
      US_PARENT: tEnum("jurisdiction.US_PARENT"),
      FOREIGN: tEnum("jurisdiction.FOREIGN"),
    },
    levels: {
      LOW: tExp("levels.LOW"),
      REVIEW: tExp("levels.REVIEW"),
      ELEVATED: tExp("levels.ELEVATED"),
    },
    flowsTitle: t("flowsTitle"),
    colAsset: t("fields.asset"),
    colVendor: t("fields.vendor"),
    colExposure: tExp("legend"),
    legend: tExp("legend"),
  };

  const blocks = buildExposureBlocks(labels, vendors, flows);
  const title = t("quadrantTitle");
  const filename = `mapleguard-exposure-map-${locale}`;
  const buffer =
    format === "docx"
      ? await blocksToDocx(title, blocks)
      : await blocksToPdf(title, blocks);

  return fileResponse(buffer, format, filename);
}
