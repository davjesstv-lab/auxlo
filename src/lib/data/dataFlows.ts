import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/config";
import { computeExposure } from "@/lib/exposure/engine";
import {
  DEMO_DATA_ASSETS,
  DEMO_FLOW_LINKS,
  DEMO_VENDORS,
} from "./demo";
import type { DataFlowWithRelations } from "@/lib/domain/types";

/**
 * Lists data flows joined with their asset and vendor, for the exposure map
 * and (later) findings. Returns demo data when Supabase is unconfigured.
 */
export async function listDataFlows(): Promise<DataFlowWithRelations[]> {
  if (!supabaseEnv.isConfigured) {
    return DEMO_FLOW_LINKS.map((link) => {
      const asset = DEMO_DATA_ASSETS.find((a) => a.id === link.data_asset_id)!;
      const vendor = DEMO_VENDORS.find((v) => v.id === link.vendor_id)!;
      const { level } = computeExposure(
        vendor.physical_hosting_region,
        vendor.operator_jurisdiction,
      );
      return {
        id: link.id,
        organization_id: "demo",
        data_asset_id: link.data_asset_id,
        vendor_id: link.vendor_id,
        purpose: link.purpose,
        exposure_level: level,
        created_at: new Date("2026-03-01").toISOString(),
        data_asset_name: asset.name,
        vendor_name: vendor.name,
        physical_hosting_region: vendor.physical_hosting_region,
        operator_jurisdiction: vendor.operator_jurisdiction,
      };
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("data_flows")
    .select(
      "*, data_assets(name), vendors(name, physical_hosting_region, operator_jurisdiction)",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const vendor = row.vendors as {
      name: string;
      physical_hosting_region: DataFlowWithRelations["physical_hosting_region"];
      operator_jurisdiction: DataFlowWithRelations["operator_jurisdiction"];
    };
    return {
      id: row.id,
      organization_id: row.organization_id,
      data_asset_id: row.data_asset_id,
      vendor_id: row.vendor_id,
      purpose: row.purpose,
      exposure_level: row.exposure_level,
      created_at: row.created_at,
      data_asset_name: (row.data_assets as { name: string }).name,
      vendor_name: vendor.name,
      physical_hosting_region: vendor.physical_hosting_region,
      operator_jurisdiction: vendor.operator_jurisdiction,
    } satisfies DataFlowWithRelations;
  });
}
