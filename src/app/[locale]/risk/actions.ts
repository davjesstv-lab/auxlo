"use server";

import { revalidatePath } from "next/cache";
import { requireOrg, requirePractitioner } from "@/lib/data/org";
import { evaluateFindings } from "@/lib/assessment/evaluate";
import { appendAuditEntry } from "@/lib/data/audit";
import { sha256Hex, canonicalize } from "@/lib/audit/hash";
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

/**
 * Promotes a finding from indicative to confirmed. Practitioner-only. Records
 * an immutable SignOff (with a hash of the finding's content at sign-off) and
 * appends a tamper-evident audit log entry.
 */
export async function confirmFinding(formData: FormData) {
  const { supabase, orgId, userId } = await requirePractitioner();
  const locale = str(formData.get("locale")) || "en";
  const id = str(formData.get("id"));
  const reviewerId = str(formData.get("reviewer_id"));
  if (!id || !reviewerId) {
    throw new Error("A finding and a reviewer are required.");
  }

  const { data: finding, error: findErr } = await supabase
    .from("findings")
    .select("condition, severity, target_type, target_id, rule_id, dedup_key")
    .eq("id", id)
    .single();
  if (findErr || !finding) throw new Error("Finding not found.");

  const priorHash = sha256Hex(
    canonicalize({
      condition: finding.condition,
      severity: finding.severity,
      target_type: finding.target_type,
      target_id: finding.target_id,
      rule_id: finding.rule_id,
      dedup_key: finding.dedup_key,
    }),
  );

  const { error: updErr } = await supabase
    .from("findings")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      confirmed_by: userId,
    })
    .eq("id", id);
  if (updErr) throw updErr;

  const { error: soErr } = await supabase.from("sign_offs").insert({
    organization_id: orgId,
    reviewer_id: reviewerId,
    actor_user_id: userId,
    target_type: "finding",
    target_id: id,
    action: "confirm_finding",
    prior_content_hash: priorHash,
  });
  if (soErr) throw soErr;

  await appendAuditEntry(supabase, orgId, {
    eventType: "finding_confirmed",
    payload: {
      target_type: "finding",
      target_id: id,
      condition: finding.condition,
      prior_content_hash: priorHash,
    },
    reviewerId,
    actorUserId: userId,
  });

  revalidatePath(`/${locale}/risk`);
  revalidatePath(`/${locale}/risk/${id}`);
  revalidatePath(`/${locale}/audit-prep`);
}
