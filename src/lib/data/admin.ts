import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/domain/types";

export type OrgUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
};

/** Lists the users attached to an organization, with their email + role.
 * Uses the service role (emails live in auth.users, behind RLS). */
export async function listOrgUsers(orgId: string): Promise<OrgUser[]> {
  const admin = getAdminClient();
  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, full_name, role")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const { data: page } = await admin.auth.admin.listUsers({ perPage: 200 });
  const emailById = new Map((page?.users ?? []).map((u) => [u.id, u.email ?? null]));

  return (profiles ?? []).map((p) => ({
    id: p.id as string,
    full_name: (p.full_name as string | null) ?? null,
    role: p.role as UserRole,
    email: emailById.get(p.id as string) ?? null,
  }));
}
