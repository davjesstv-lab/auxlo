"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/data/org";
import type { SensitivityLevel } from "@/lib/domain/types";

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function strOrNull(value: FormDataEntryValue | null): string | null {
  const s = str(value);
  return s.length > 0 ? s : null;
}

export async function saveDataAsset(formData: FormData) {
  const { supabase, orgId } = await requireOrg();

  const locale = str(formData.get("locale")) || "en";
  const id = strOrNull(formData.get("id"));
  const name = str(formData.get("name"));
  if (!name) {
    throw new Error("Data asset name is required.");
  }

  const payload = {
    organization_id: orgId,
    name,
    description: strOrNull(formData.get("description")),
    sensitivity:
      (str(formData.get("sensitivity")) as SensitivityLevel) || "ordinary",
    data_subjects: strOrNull(formData.get("data_subjects")),
    purpose: strOrNull(formData.get("purpose")),
    retention: strOrNull(formData.get("retention")),
  };

  if (id) {
    const { error } = await supabase
      .from("data_assets")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("data_assets").insert(payload);
    if (error) throw error;
  }

  revalidatePath(`/${locale}/inventory`);
  redirect(`/${locale}/inventory`);
}

export async function deleteDataAsset(formData: FormData) {
  const { supabase } = await requireOrg();
  const locale = str(formData.get("locale")) || "en";
  const id = str(formData.get("id"));
  if (id) {
    const { error } = await supabase.from("data_assets").delete().eq("id", id);
    if (error) throw error;
  }
  revalidatePath(`/${locale}/inventory`);
}
