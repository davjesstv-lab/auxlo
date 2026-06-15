"use server";

import { revalidatePath } from "next/cache";
import { requirePractitioner } from "@/lib/data/org";
import { appendAuditEntry } from "@/lib/data/audit";

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function addReviewer(formData: FormData) {
  const { supabase, orgId, userId } = await requirePractitioner();
  const locale = str(formData.get("locale")) || "en";
  const fullName = str(formData.get("full_name"));
  const credentialType = str(formData.get("credential_type"));
  const credentialId = str(formData.get("credential_id"));
  if (!fullName || !credentialType) {
    throw new Error("Reviewer name and credential type are required.");
  }

  const { data: reviewer, error } = await supabase
    .from("reviewers")
    .insert({
      organization_id: orgId,
      user_id: userId,
      full_name: fullName,
      credential_type: credentialType,
      credential_id: credentialId || null,
    })
    .select("id")
    .single();
  if (error) throw error;

  await appendAuditEntry(supabase, orgId, {
    eventType: "reviewer_added",
    payload: {
      reviewer_id: reviewer.id,
      full_name: fullName,
      credential_type: credentialType,
    },
    reviewerId: reviewer.id,
    actorUserId: userId,
  });

  revalidatePath(`/${locale}/audit-prep`);
}
