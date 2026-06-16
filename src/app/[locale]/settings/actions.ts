"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/data/org";
import type { HeadcountBand, Jurisdiction } from "@/lib/domain/types";

const HEADCOUNTS: HeadcountBand[] = ["1-19", "20-49", "50-99", "100-200", "200+"];
const JURISDICTIONS: Jurisdiction[] = [
  "QC", "ON", "BC", "AB", "MB", "SK", "NS",
  "NB", "NL", "PE", "NT", "NU", "YT", "OTHER",
];

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function updateOrganization(formData: FormData) {
  // RLS (org_update_own) restricts this to admins of the org; requireAdmin
  // enforces it at the app layer too.
  const { supabase, orgId } = await requireAdmin();
  const locale = str(formData.get("locale")) || "en";

  const name = str(formData.get("name"));
  if (!name) throw new Error("Organization name is required.");

  const headcount = str(formData.get("headcount_band")) as HeadcountBand;
  const jurisdiction = str(formData.get("primary_jurisdiction")) as Jurisdiction;
  const language = str(formData.get("preferred_language"));

  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      sector: str(formData.get("sector")) || null,
      headcount_band: HEADCOUNTS.includes(headcount) ? headcount : null,
      primary_jurisdiction: JURISDICTIONS.includes(jurisdiction)
        ? jurisdiction
        : "QC",
      preferred_language: language === "en" ? "en" : "fr",
    })
    .eq("id", orgId);
  if (error) throw error;

  revalidatePath(`/${locale}/settings`);
}
