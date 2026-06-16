"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/data/org";
import { computeExposure } from "@/lib/exposure/engine";

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function saveDataFlow(formData: FormData) {
  const { supabase, orgId } = await requireOrg();

  const locale = str(formData.get("locale")) || "en";
  const dataAssetId = str(formData.get("data_asset_id"));
  const vendorId = str(formData.get("vendor_id"));
  const purpose = str(formData.get("purpose"));
  if (!dataAssetId || !vendorId) {
    throw new Error("A data asset and a vendor are required.");
  }

  // Look up the vendor to derive the flow's exposure level server-side.
  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("physical_hosting_region, operator_jurisdiction")
    .eq("id", vendorId)
    .single();
  if (vendorError || !vendor) {
    throw new Error("Vendor not found.");
  }

  const { level } = computeExposure(
    vendor.physical_hosting_region,
    vendor.operator_jurisdiction,
  );

  const { error } = await supabase.from("data_flows").upsert(
    {
      organization_id: orgId,
      data_asset_id: dataAssetId,
      vendor_id: vendorId,
      purpose: purpose || null,
      exposure_level: level,
    },
    { onConflict: "data_asset_id,vendor_id" },
  );
  if (error) throw error;

  revalidatePath(`/${locale}/residency`);
  redirect(`/${locale}/residency`);
}

export async function deleteDataFlow(formData: FormData) {
  const { supabase } = await requireOrg();
  const locale = str(formData.get("locale")) || "en";
  const id = str(formData.get("id"));
  if (id) {
    const { error } = await supabase.from("data_flows").delete().eq("id", id);
    if (error) throw error;
  }
  revalidatePath(`/${locale}/residency`);
}
