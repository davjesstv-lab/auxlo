import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/config";
import type { UserRole } from "@/lib/domain/types";

/**
 * Resolves the authenticated user's organization for write operations.
 * Throws when Supabase is not configured or there is no signed-in user with an
 * organization — write paths are never available in demo mode.
 */
export async function requireOrg() {
  if (!supabaseEnv.isConfigured) {
    throw new Error("Supabase is not configured.");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated.");
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();
  if (!profile?.organization_id) {
    throw new Error("No organization associated with this user.");
  }
  return {
    supabase,
    orgId: profile.organization_id as string,
    userId: user.id,
    role: profile.role as UserRole,
  };
}

/**
 * Like requireOrg, but additionally requires the practitioner (or admin) role.
 * Sign-off and promotion paths must go through this — clients cannot confirm
 * findings or approve artifacts.
 */
export async function requirePractitioner() {
  const ctx = await requireOrg();
  if (ctx.role !== "practitioner" && ctx.role !== "admin") {
    throw new Error("This action requires a credentialed practitioner.");
  }
  return ctx;
}

/** Like requireOrg, but requires the admin role (organization management). */
export async function requireAdmin() {
  const ctx = await requireOrg();
  if (ctx.role !== "admin") {
    throw new Error("This action requires an organization administrator.");
  }
  return ctx;
}

/** Returns the current user's role, or null when unauthenticated/unconfigured.
 * Non-throwing — use for conditionally rendering practitioner-only controls. */
export async function getCurrentRole(): Promise<UserRole | null> {
  if (!supabaseEnv.isConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return (profile?.role as UserRole) ?? null;
}
