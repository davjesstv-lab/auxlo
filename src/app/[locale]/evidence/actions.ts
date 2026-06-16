"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrg, requirePractitioner } from "@/lib/data/org";
import { appendAuditEntry } from "@/lib/data/audit";
import { sha256Hex } from "@/lib/audit/hash";
import { anthropicEnv } from "@/lib/ai/anthropic";
import { generateArtifact } from "@/lib/ai/artifacts";
import { listVendors } from "@/lib/data/vendors";
import { listDataAssets } from "@/lib/data/dataAssets";
import { listDataFlows } from "@/lib/data/dataFlows";
import { listFindings } from "@/lib/data/findings";
import { listPrivacyOfficers } from "@/lib/data/privacyOfficers";
import type { ArtifactType } from "@/lib/domain/types";

const TITLES: Record<ArtifactType, { en: string; fr: string }> = {
  privacy_impact_assessment: {
    en: "Privacy impact assessment",
    fr: "Évaluation des facteurs relatifs à la vie privée (EFVP)",
  },
  data_inventory: { en: "Data inventory", fr: "Inventaire des données" },
  vendor_due_diligence: {
    en: "Vendor due-diligence file",
    fr: "Dossier de diligence raisonnable des fournisseurs",
  },
  foreign_transfer_adequacy: {
    en: "Foreign-transfer adequacy assessment",
    fr: "Évaluation de l'adéquation du transfert à l'étranger",
  },
  breach_response_runbook: {
    en: "Breach response runbook",
    fr: "Guide d'intervention en cas d'incident",
  },
  privacy_officer_record: {
    en: "Privacy officer accountability record",
    fr: "Registre de responsabilité du responsable de la protection des renseignements personnels",
  },
};

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function generateArtifactAction(formData: FormData) {
  if (!anthropicEnv.isConfigured) {
    throw new Error("Anthropic API is not configured.");
  }
  const { supabase, orgId } = await requireOrg();

  const locale = str(formData.get("locale")) || "en";
  const type = str(formData.get("type")) as ArtifactType;
  const language = (str(formData.get("language")) || "en") as "en" | "fr";
  if (!TITLES[type]) {
    throw new Error("Unknown artifact type.");
  }

  // Gather the engagement data to ground the draft (the model must not invent facts).
  const [org, assets, vendors, flows, findings, officers] = await Promise.all([
    supabase
      .from("organizations")
      .select("name, primary_jurisdiction")
      .eq("id", orgId)
      .single(),
    listDataAssets(),
    listVendors(),
    listDataFlows(),
    listFindings(),
    listPrivacyOfficers(),
  ]);

  const content = await generateArtifact(type, language, {
    organizationName: org.data?.name ?? "the organization",
    jurisdiction: org.data?.primary_jurisdiction ?? "QC",
    frameworks: ["Law 25", "PIPEDA", "PHIPA"],
    assets,
    vendors,
    flows,
    findings,
    officers,
  });

  // Versioned insert: next version = current max for this org+type+language + 1.
  const { data: prior } = await supabase
    .from("artifacts")
    .select("version")
    .eq("organization_id", orgId)
    .eq("type", type)
    .eq("language", language)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextVersion = (prior?.version ?? 0) + 1;

  const { data: inserted, error } = await supabase
    .from("artifacts")
    .insert({
      organization_id: orgId,
      type,
      language,
      title: TITLES[type][language],
      content,
      review_status: "draft",
      version: nextVersion,
    })
    .select("id")
    .single();
  if (error) throw error;

  revalidatePath(`/${locale}/evidence`);
  redirect(`/${locale}/evidence/${inserted.id}`);
}

/**
 * Approves an artifact draft. Practitioner-only. Records an immutable SignOff
 * (with a hash of the artifact content at approval) and appends a tamper-
 * evident audit log entry.
 */
export async function approveArtifact(formData: FormData) {
  const { supabase, orgId, userId } = await requirePractitioner();
  const locale = str(formData.get("locale")) || "en";
  const id = str(formData.get("id"));
  const reviewerId = str(formData.get("reviewer_id"));
  if (!id || !reviewerId) {
    throw new Error("An artifact and a reviewer are required.");
  }

  const { data: artifact, error: artErr } = await supabase
    .from("artifacts")
    .select("content, type")
    .eq("id", id)
    .single();
  if (artErr || !artifact) throw new Error("Artifact not found.");

  const priorHash = sha256Hex(artifact.content);

  const { error: updErr } = await supabase
    .from("artifacts")
    .update({ review_status: "approved" })
    .eq("id", id);
  if (updErr) throw updErr;

  const { error: soErr } = await supabase.from("sign_offs").insert({
    organization_id: orgId,
    reviewer_id: reviewerId,
    actor_user_id: userId,
    target_type: "artifact",
    target_id: id,
    action: "approve_artifact",
    prior_content_hash: priorHash,
  });
  if (soErr) throw soErr;

  await appendAuditEntry(supabase, orgId, {
    eventType: "artifact_approved",
    payload: {
      target_type: "artifact",
      target_id: id,
      artifact_type: artifact.type,
      prior_content_hash: priorHash,
    },
    reviewerId,
    actorUserId: userId,
  });

  revalidatePath(`/${locale}/evidence`);
  revalidatePath(`/${locale}/evidence/${id}`);
  revalidatePath(`/${locale}/audit-prep`);
}
