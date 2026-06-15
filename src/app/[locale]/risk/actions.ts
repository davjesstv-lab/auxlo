"use server";

import { revalidatePath } from "next/cache";
import { requireOrg } from "@/lib/data/org";
import { evaluateFindings } from "@/lib/assessment/evaluate";
import { listVendors } from "@/lib/data/vendors";
import { listDataFlows } from "@/lib/data/dataFlows";
import { listPrivacyOfficers } from "@/lib/data/privacyOfficers";
import { listComplianceRules } from "@/lib/data/rules";

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Re-runs the assessment: evaluates indicative findings and syncs them to the
 * findings table. Confirmed findings are preserved (never clobbered); stale
 * indicative findings are replaced by the fresh evaluation.
 */
export async function runAssessment(formData: FormData) {
  const { supabase, orgId } = await requireOrg();
  const locale = str(formData.get("locale")) || "en";

  const [officers, vendors, flows, rules] = await Promise.all([
    listPrivacyOfficers(),
    listVendors(),
    listDataFlows(),
    listComplianceRules(),
  ]);

  const specs = evaluateFindings({
    privacyOfficerCount: officers.length,
    vendors,
    flows,
    rules,
  });

  const { data: confirmed } = await supabase
    .from("findings")
    .select("dedup_key")
    .eq("organization_id", orgId)
    .eq("status", "confirmed");
  const confirmedKeys = new Set((confirmed ?? []).map((c) => c.dedup_key));

  // Replace existing indicative findings with the fresh evaluation.
  await supabase
    .from("findings")
    .delete()
    .eq("organization_id", orgId)
    .eq("status", "indicative");

  const rows = specs
    .filter((s) => !confirmedKeys.has(s.dedupKey))
    .map((s) => ({
      organization_id: orgId,
      rule_id: s.ruleId,
      condition: s.condition,
      severity: s.severity,
      status: "indicative" as const,
      target_type: s.targetType,
      target_id: s.targetId,
      target_label: s.targetLabel,
      recommended_artifact: s.recommendedArtifact,
      dedup_key: s.dedupKey,
    }));

  if (rows.length > 0) {
    const { error } = await supabase.from("findings").insert(rows);
    if (error) throw error;
  }

  revalidatePath(`/${locale}/risk`);
}

/** Records a privacy officer, which resolves the accountability finding on the
 * next assessment run. */
export async function addPrivacyOfficer(formData: FormData) {
  const { supabase, orgId } = await requireOrg();
  const locale = str(formData.get("locale")) || "en";
  const fullName = str(formData.get("full_name"));
  if (!fullName) throw new Error("Privacy officer name is required.");

  const { error } = await supabase.from("privacy_officers").insert({
    organization_id: orgId,
    full_name: fullName,
    title: str(formData.get("title")) || null,
    email: str(formData.get("email")) || null,
  });
  if (error) throw error;

  revalidatePath(`/${locale}/risk`);
}
