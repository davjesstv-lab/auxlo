"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/data/org";
import { getAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/domain/types";

const ROLES: UserRole[] = ["admin", "practitioner", "client"];

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Verifies the target user belongs to the admin's organization. */
async function assertSameOrg(
  admin: ReturnType<typeof getAdminClient>,
  userId: string,
  orgId: string,
) {
  const { data } = await admin
    .from("profiles")
    .select("organization_id")
    .eq("id", userId)
    .maybeSingle();
  if (!data || data.organization_id !== orgId) {
    throw new Error("User is not in your organization.");
  }
}

export async function setUserRole(formData: FormData) {
  const { orgId } = await requireAdmin();
  const locale = str(formData.get("locale")) || "en";
  const userId = str(formData.get("user_id"));
  const role = str(formData.get("role")) as UserRole;
  if (!userId || !ROLES.includes(role)) {
    throw new Error("Invalid user or role.");
  }

  const admin = getAdminClient();
  await assertSameOrg(admin, userId, orgId);
  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .eq("organization_id", orgId);
  if (error) throw error;

  revalidatePath(`/${locale}/admin`);
}

export async function inviteUser(formData: FormData) {
  const { orgId } = await requireAdmin();
  const locale = str(formData.get("locale")) || "en";
  const email = str(formData.get("email")).toLowerCase();
  const role = (str(formData.get("role")) as UserRole) || "client";
  if (!email || !ROLES.includes(role)) {
    throw new Error("A valid email and role are required.");
  }

  const admin = getAdminClient();

  // Reuse an existing auth user if present, otherwise send an invite.
  const { data: page } = await admin.auth.admin.listUsers({ perPage: 200 });
  let user = (page?.users ?? []).find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email);
    if (error) throw error;
    user = data.user;
  }

  // Attach to this organization with the chosen role (profile created by the
  // signup trigger; upsert covers both new and existing profiles).
  const { error: upsertErr } = await admin
    .from("profiles")
    .upsert({ id: user.id, organization_id: orgId, role }, { onConflict: "id" });
  if (upsertErr) throw upsertErr;

  revalidatePath(`/${locale}/admin`);
}

export async function removeUser(formData: FormData) {
  const { orgId } = await requireAdmin();
  const locale = str(formData.get("locale")) || "en";
  const userId = str(formData.get("user_id"));
  if (!userId) throw new Error("Invalid user.");

  const admin = getAdminClient();
  await assertSameOrg(admin, userId, orgId);
  // Detach from the org (revoke access) and reset to the least-privileged role.
  const { error } = await admin
    .from("profiles")
    .update({ organization_id: null, role: "client" })
    .eq("id", userId)
    .eq("organization_id", orgId);
  if (error) throw error;

  revalidatePath(`/${locale}/admin`);
}
