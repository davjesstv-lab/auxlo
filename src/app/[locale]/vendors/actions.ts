"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/data/org";
import { deriveOperatorJurisdiction } from "@/lib/domain/vendor";
import type { DataResidency } from "@/lib/domain/types";

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function strOrNull(value: FormDataEntryValue | null): string | null {
  const s = str(value);
  return s.length > 0 ? s : null;
}

export async function saveVendor(formData: FormData) {
  const { supabase, orgId } = await requireOrg();

  const locale = str(formData.get("locale")) || "en";
  const id = strOrNull(formData.get("id"));
  const name = str(formData.get("name"));
  if (!name) {
    throw new Error("Vendor name is required.");
  }

  const parentDomicile = str(formData.get("operator_parent_domicile")) || "CA";

  const payload = {
    organization_id: orgId,
    name,
    role: strOrNull(formData.get("role")),
    physical_hosting_region:
      (str(formData.get("physical_hosting_region")) as DataResidency) ||
      "CANADA",
    operator_parent_domicile: parentDomicile,
    // Derived server-side so the stored jurisdiction always matches the rule.
    operator_jurisdiction: deriveOperatorJurisdiction(parentDomicile),
    due_diligence_completed: formData.get("due_diligence_completed") === "on",
    notes: strOrNull(formData.get("notes")),
  };

  if (id) {
    const { error } = await supabase.from("vendors").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("vendors").insert(payload);
    if (error) throw error;
  }

  revalidatePath(`/${locale}/vendors`);
  redirect(`/${locale}/vendors`);
}

export async function deleteVendor(formData: FormData) {
  const { supabase } = await requireOrg();
  const locale = str(formData.get("locale")) || "en";
  const id = str(formData.get("id"));
  if (id) {
    const { error } = await supabase.from("vendors").delete().eq("id", id);
    if (error) throw error;
  }
  revalidatePath(`/${locale}/vendors`);
}
